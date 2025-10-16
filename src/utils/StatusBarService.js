import React from 'react';
import {useStatusBar} from './StatusBarContext';

/**
 * StatusBarService - Centralized service for controlling the global status bar
 * Provides easy-to-use methods for common status bar operations
 */
export class StatusBarService {
  static getInstance() {
    if (!StatusBarService.instance) {
      StatusBarService.instance = new StatusBarService();
    }
    return StatusBarService.instance;
  }

  constructor() {
    this.context = null;
  }

  /**
   * Initialize the service with context (called internally by the hook)
   */
  setContext(context) {
    this.context = context;
  }

  /**
   * Show status bar with notification
   * @param {number} count - Number of notifications
   * @param {string} message - Custom message (optional)
   */
  showNotification(count = 1, message = null) {
    if (this.context) {
      this.context.setNotificationCount(count);
      if (message) {
        console.log(`StatusBar: ${message}`);
      }
    }
  }

  /**
   * Show status bar for connection issues
   * @param {boolean} isConnected - Connection status
   * @param {string} connectionType - Type of connection (wifi/cellular)
   */
  showConnectionStatus(isConnected, connectionType = 'wifi') {
    if (this.context) {
      // The context will automatically handle showing the status bar
      // when connection status changes via NetInfo
      console.log(`StatusBar: Connection ${isConnected ? 'restored' : 'lost'} (${connectionType})`);
    }
  }

  /**
   * Show status bar with custom message
   * @param {string} message - Message to display
   * @param {string} type - Type of status (info, warning, error, success)
   */
  showCustomMessage(message, type = 'info') {
    if (this.context) {
      this.context.setShowStatusBar(true);
      console.log(`StatusBar: ${type.toUpperCase()} - ${message}`);
    }
  }

  /**
   * Hide the status bar
   */
  hide() {
    if (this.context) {
      this.context.setShowStatusBar(false);
    }
  }

  /**
   * Show status bar temporarily and auto-hide after delay
   * @param {number} delay - Delay in milliseconds (default: 3000)
   */
  showTemporary(delay = 3000) {
    if (this.context) {
      this.context.setShowStatusBar(true);
      setTimeout(() => {
        this.hide();
      }, delay);
    }
  }

  /**
   * Update user status
   * @param {'online' | 'offline' | 'away'} status - User status
   */
  setUserStatus(status) {
    if (this.context) {
      this.context.setUserStatus(status);
    }
  }

  /**
   * Get current status bar state
   */
  getState() {
    if (this.context) {
      return {
        isConnected: this.context.isConnected,
        connectionType: this.context.connectionType,
        notificationCount: this.context.notificationCount,
        showStatusBar: this.context.showStatusBar,
        userStatus: this.context.userStatus,
      };
    }
    return null;
  }
}

/**
 * Hook to use StatusBarService in React components
 */
export const useStatusBarService = () => {
  const context = useStatusBar();

  React.useEffect(() => {
    // Initialize the service instance with context
    const service = StatusBarService.getInstance();
    service.setContext(context);
  }, [context]);

  return StatusBarService.getInstance();
};

// Export singleton instance for use outside React components
export const statusBarService = StatusBarService.getInstance();