import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {COLORS} from '../../Theme/Colors';
import {scale, verticalScale, moderateScale} from '../../utils/Scaling';
import {Fonts} from '../../Theme/Fonts';
import {useSelector} from 'react-redux';
import {useStatusBar} from '../../utils/StatusBarContext';

const {width} = Dimensions.get('window');

const CustomStatusBar = ({
  onNotificationPress,
  onConnectionPress,
  showNotificationBadge = true,
  showConnectionStatus = true,
  backgroundColor = COLORS.DODGERBLUE,
  textColor = COLORS.white,
}) => {
  const {
    isConnected,
    connectionType,
    notificationCount,
    showStatusBar,
    setShowStatusBar,
    userStatus,
    showCurrentStatus
  } = useStatusBar();

  const slideAnim = React.useRef(new Animated.Value(-50)).current;
  const language = useSelector(state => state.Common.language);

  // Show current status when component mounts
  React.useEffect(() => {
    showCurrentStatus();
  }, []);

  // Show status bar when notification count changes
  React.useEffect(() => {
    if (notificationCount > 0) {
      showCustomStatusBar();
    }
  }, [notificationCount]);

  // Show status bar when connection status changes
  React.useEffect(() => {
    if (!isConnected) {
      showCustomStatusBar();
    } else {
      // Auto-hide after 3 seconds when connection is restored
      setTimeout(() => {
        hideCustomStatusBar();
      }, 3000);
    }
  }, [isConnected]);

  const showCustomStatusBar = () => {
    setShowStatusBar(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto-hide after 5 seconds if connected
    if (isConnected) {
      setTimeout(() => {
        hideCustomStatusBar();
      }, 5000);
    }
  };

  const hideCustomStatusBar = () => {
    Animated.timing(slideAnim, {
      toValue: -50,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowStatusBar(false);
    });
  };

  const getConnectionIcon = () => {
    if (!isConnected) return 'wifi-off';
    return connectionType === 'wifi' ? 'wifi' : 'cellular';
  };

  const getConnectionText = () => {
    if (!isConnected) return 'No Internet';
    return connectionType === 'wifi' ? 'WiFi' : 'Mobile Data';
  };

  const getConnectionColor = () => {
    if (!isConnected) return COLORS.red;
    return COLORS.green;
  };

  if (!showStatusBar) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{translateY: slideAnim}],
          backgroundColor,
        },
      ]}>
      <View style={styles.content}>
        {/* Connection Status */}
        {showConnectionStatus && (
          <TouchableOpacity
            style={styles.statusItem}
            onPress={onConnectionPress}
            activeOpacity={0.7}>
            <MaterialIcons
              name={getConnectionIcon()}
              size={16}
              color={getConnectionColor()}
            />
            <Text style={[styles.statusText, {color: textColor}]}>
              {getConnectionText()}
            </Text>
          </TouchableOpacity>
        )}

        {/* Notification Status */}
        {showNotificationBadge && notificationCount > 0 && (
          <TouchableOpacity
            style={styles.statusItem}
            onPress={onNotificationPress}
            activeOpacity={0.7}>
            <Ionicons name="notifications" size={16} color={COLORS.orange} />
            <Text style={[styles.statusText, {color: textColor}]}>
              {notificationCount} {language === 'hi' ? 'सूचना' : 'Notifications'}
            </Text>
          </TouchableOpacity>
        )}

        {/* User Status */}
        <View style={styles.statusItem}>
          <Ionicons
            name="person"
            size={16}
            color={userStatus === 'online' ? COLORS.green : COLORS.orange}
          />
          <Text style={[styles.statusText, {color: textColor}]}>
            {userStatus === 'online'
              ? (language === 'hi' ? 'ऑनलाइन' : 'Online')
              : (language === 'hi' ? 'ऑफलाइन' : 'Offline')
            }
          </Text>
        </View>
      </View>

      {/* Status Info Button */}
      <TouchableOpacity
        style={styles.infoButton}
        onPress={showCurrentStatus}
        activeOpacity={0.7}>
        <Ionicons name="information-circle-outline" size={16} color={textColor} />
      </TouchableOpacity>

      {/* Close Button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={hideCustomStatusBar}
        activeOpacity={0.7}>
        <Ionicons name="close" size={16} color={textColor} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(8),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: scale(20),
  },
  statusText: {
    fontSize: moderateScale(12),
    fontFamily: Fonts.Medium,
    marginLeft: scale(4),
  },
  infoButton: {
    padding: scale(4),
    marginRight: scale(8),
  },
  closeButton: {
    padding: scale(4),
  },
});

export default CustomStatusBar;