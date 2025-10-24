import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import NetInfo from '@react-native-community/netinfo';

interface StatusBarContextType {
  isConnected: boolean;
  connectionType: string;
  notificationCount: number;
  setNotificationCount: (count: number) => void;
  showStatusBar: boolean;
  setShowStatusBar: (show: boolean) => void;
  userStatus: 'online' | 'offline' | 'away';
  setUserStatus: (status: 'online' | 'offline' | 'away') => void;
  // Global control methods
  showNotification: (count?: number, message?: string) => void;
  showConnectionError: (message?: string) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  hideAfterDelay: (delay?: number) => void;
  reset: () => void;
  showCurrentStatus: () => void;
}

const StatusBarContext = createContext<StatusBarContextType | undefined>(undefined);

export const useStatusBar = () => {
  const context = useContext(StatusBarContext);
  if (!context) {
    throw new Error('useStatusBar must be used within a StatusBarProvider');
  }
  return context;
};

interface StatusBarProviderProps {
  children: ReactNode;
}

export const StatusBarProvider: React.FC<StatusBarProviderProps> = ({children}) => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [connectionType, setConnectionType] = useState<string>('WiFi');
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [showStatusBar, setShowStatusBar] = useState<boolean>(false);
  const [userStatus, setUserStatus] = useState<'online' | 'offline' | 'away'>('online');

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
      setConnectionType(state.type || 'unknown');

      // Show status bar when connection changes
      if (!state.isConnected) {
        setShowStatusBar(true);
      } else {
        // Auto-hide after 5 seconds when connection is restored
        setTimeout(() => {
          setShowStatusBar(false);
        }, 5000);
      }
    });

    // Get initial network state
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected ?? false);
      setConnectionType(state.type || 'unknown');
      // Show status bar initially to display current connection status
      setShowStatusBar(true);
      // Auto-hide after 3 seconds if connected
      if (state.isConnected) {
        setTimeout(() => {
          setShowStatusBar(false);
        }, 3000);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Show status bar when notification count changes
  useEffect(() => {
    if (notificationCount > 0) {
      setShowStatusBar(true);
      // Auto-hide after 5 seconds if connected
      if (isConnected) {
        setTimeout(() => {
          setShowStatusBar(false);
        }, 5000);
      }
    }
  }, [notificationCount, isConnected]);

  // Global control methods
  const showNotification = (count = 1, message = '') => {
    setNotificationCount(count);
    if (message) {
      console.log(`StatusBar Notification: ${message}`);
    }
  };

  const showConnectionError = (message = 'Connection lost') => {
    setShowStatusBar(true);
    console.log(`StatusBar Connection Error: ${message}`);
  };

  const showSuccess = (message: string, duration = 3000) => {
    setShowStatusBar(true);
    console.log(`StatusBar Success: ${message}`);
    setTimeout(() => {
      setShowStatusBar(false);
    }, duration);
  };

  const showError = (message: string, duration = 4000) => {
    setShowStatusBar(true);
    console.log(`StatusBar Error: ${message}`);
    setTimeout(() => {
      setShowStatusBar(false);
    }, duration);
  };

  const showWarning = (message: string, duration = 3500) => {
    setShowStatusBar(true);
    console.log(`StatusBar Warning: ${message}`);
    setTimeout(() => {
      setShowStatusBar(false);
    }, duration);
  };

  const hideAfterDelay = (delay = 3000) => {
    setTimeout(() => {
      setShowStatusBar(false);
    }, delay);
  };

  const reset = () => {
    setNotificationCount(0);
    setShowStatusBar(false);
    setUserStatus('online');
  };

  // Method to show current status
  const showCurrentStatus = () => {
    setShowStatusBar(true);
    // Auto-hide after 5 seconds if connected
    if (isConnected) {
      setTimeout(() => {
        setShowStatusBar(false);
      }, 5000);
    }
  };

  const value: StatusBarContextType = {
    isConnected,
    connectionType,
    notificationCount,
    setNotificationCount,
    showStatusBar,
    setShowStatusBar,
    userStatus,
    setUserStatus,
    showNotification,
    showConnectionError,
    showSuccess,
    showError,
    showWarning,
    hideAfterDelay,
    reset,
    showCurrentStatus,
  };

  return (
    <StatusBarContext.Provider value={value}>
      {children}
    </StatusBarContext.Provider>
  );
};