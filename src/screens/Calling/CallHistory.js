import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {Container} from '../../component/Container/Container';
import {COLORS} from '../../Theme/Colors';
import CustomHeader from '../../component/header/CustomHeader';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
import {Fonts} from '../../Theme/Fonts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Instance, fetchCallHistory} from '../../api/Instance';

const CallHistoryItem = ({item, onPress, currentUserId}) => {
  const getCallTypeColor = type => {
    switch (type) {
      case 'outgoing':
      case 'video':
        return COLORS.DODGERBLUE;
      case 'incoming':
        return COLORS.green;
      case 'missed':
        return COLORS.red;
      default:
        return COLORS.gray;
    }
  };

  const getCallTypeIcon = type => {
    switch (type) {
      case 'outgoing':
      case 'video':
        return 'call-made';
      case 'incoming':
        return 'call-received';
      case 'missed':
        return 'call-missed';
      default:
        return 'call';
    }
  };

  const getCallTypeLabel = type => {
    switch (type) {
      case 'outgoing':
        return 'Outgoing';
      case 'incoming':
        return 'Incoming';
      case 'missed':
        return 'Missed';
      default:
        return type;
    }
  };

  const formatDuration = seconds => {
    if (!seconds || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDateTime = isoString => {
    if (!isoString) return { time: '', date: '' };
    try {
      const date = new Date(isoString);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday = date.toDateString() === yesterday.toDateString();

      let dateStr = '';
      if (isToday) dateStr = 'Today';
      else if (isYesterday) dateStr = 'Yesterday';
      else dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

      return { time: timeStr, date: dateStr };
    } catch (e) {
      return { time: '', date: '' };
    }
  };

  const otherParty = item?.caller?._id === currentUserId ? item?.receiver : item?.caller;
  const isCaller = item?.caller?._id === currentUserId;

  let callType = item?.callType || 'video';
  let displayType = callType === 'video' ? 'outgoing' : 'incoming';

  if (item?.callStatus === 'rejected') {
    displayType = 'missed';
  } else if (!isCaller) {
    displayType = 'incoming';
  } else {
    displayType = 'outgoing';
  }

  const displayName = otherParty?.name || 'Unknown';
  const {time, date} = formatDateTime(item?.callStartedAt);
  const duration = formatDuration(item?.callDuration);
  const profilePic = null;

  const iconColor = getCallTypeColor(displayType);
  const iconName = getCallTypeIcon(displayType);

  return (
    <TouchableOpacity style={styles.callItem} onPress={onPress}>
      <View style={styles.leftContainer}>
        <View style={styles.profilePicContainer}>
          {profilePic ? (
            <Image source={{uri: profilePic}} style={styles.profilePic} />
          ) : (
            <View style={[styles.profilePic, styles.defaultProfilePic]}>
              <Text style={styles.defaultProfileText}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={[styles.callTypeBadge, {backgroundColor: iconColor}]}>
            <Icon name={iconName} size={12} color={COLORS.white} />
          </View>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.nameText}>{displayName}</Text>
          <View style={styles.callInfoRow}>
            <Text style={styles.callTypeText}>{getCallTypeLabel(displayType)}</Text>
            {duration && duration !== '0:00' ? (
              <>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.durationText}>{duration}</Text>
              </>
            ) : null}
          </View>
          <Text style={styles.dateText}>{date}</Text>
        </View>
      </View>
      <View style={styles.rightContainer}>
        <Text style={styles.timeText}>{time}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function CallHistory({navigation}) {
  const [callHistory, setCallHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const getUserId = async () => {
    try {
      const userDataStr = await AsyncStorage.getItem('userData');
      console.log('[CallHistory] getUserId - userData raw:', userDataStr);
      if (userDataStr) {
        try {
          const parsed = JSON.parse(userDataStr);
          console.log('[CallHistory] getUserId - userData parsed:', JSON.stringify(parsed).substring(0, 300));
          const id = parsed?.id || parsed?.userId || parsed?._id || parsed?.user_id;
          if (id) {
            console.log('[CallHistory] getUserId - found id from userData:', id);
            setCurrentUserId(String(id));
            return String(id);
          }
        } catch (e) {
          console.error('[CallHistory] getUserId - parse userData error:', e);
        }
      }

      const token = await AsyncStorage.getItem('userToken');
      console.log('[CallHistory] getUserId - token exists:', !!token, 'length:', token?.length);
      if (token) {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            console.log('[CallHistory] getUserId - token payload keys:', Object.keys(payload));
            console.log('[CallHistory] getUserId - token payload:', JSON.stringify(payload).substring(0, 500));
            const id = payload?.id || payload?.userId || payload?._id || payload?.user_id || payload?.sub || payload?.uid || payload?.Id;
            if (id) {
              console.log('[CallHistory] getUserId - found id from token:', id);
              setCurrentUserId(String(id));
              return String(id);
            }
          }
        } catch (e) {
          console.error('[CallHistory] getUserId - decode token error:', e);
        }
      }

      console.warn('[CallHistory] getUserId - NO ID FOUND in userData or token');
      return null;
    } catch (error) {
      console.error('[CallHistory] getUserId - error:', error);
      return null;
    }
  };

  const loadCallHistory = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const userId = await getUserId();
      console.log('CallHistory - Resolved userId:', userId);
      if (!userId) {
        setError('User not authenticated');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const data = await fetchCallHistory(userId);
      console.log('CallHistory - API raw data:', JSON.stringify(data));
      let calls = [];
      if (data?.success && data?.data?.calls) {
        calls = data.data.calls;
      } else if (Array.isArray(data)) {
        calls = data;
      } else if (Array.isArray(data?.result)) {
        calls = data.result;
      } else if (Array.isArray(data?.data)) {
        calls = data.data;
      }
      console.log('CallHistory - Extracted calls:', calls.length, 'items');
      setCallHistory(calls);
    } catch (error) {
      console.error('CallHistory - Fetch error:', error);
      setError(error.response?.data?.msg || 'Failed to load call history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCallHistory();
  }, []);

  const onRefresh = () => {
    loadCallHistory(true);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="call-outline" size={64} color={COLORS.lightGrey} />
      <Text style={styles.emptyTitle}>No Call History</Text>
      <Text style={styles.emptySubtitle}>
        Your call history will appear here
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Icon name="error-outline" size={64} color={COLORS.red} />
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoader = () => (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color={COLORS.DODGERBLUE} />
      <Text style={styles.loadingText}>Loading call history...</Text>
    </View>
  );

  if (loading) {
    return (
      <Container
        statusBarBackgroundColor={COLORS.white}
        statusBarStyle="dark-content"
        backgroundColor={COLORS.white}>
        <CustomHeader title="Call History" navigation={navigation} />
        {renderLoader()}
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        statusBarBackgroundColor={COLORS.white}
        statusBarStyle="dark-content"
        backgroundColor={COLORS.white}>
        <CustomHeader title="Call History" navigation={navigation} />
        {renderErrorState()}
      </Container>
    );
  }

  return (
    <Container
      statusBarBackgroundColor={COLORS.white}
      statusBarStyle="dark-content"
      backgroundColor={COLORS.white}>
      <CustomHeader title="Call History" navigation={navigation} />
      <FlatList
        data={callHistory}
        renderItem={({item}) => (
          <CallHistoryItem
            item={item}
            currentUserId={currentUserId}
            onPress={() => {
              console.log('Call history item pressed:', item);
            }}
          />
        )}
        keyExtractor={(item, index) => item._id || item.id || `call-${index}`}
        contentContainerStyle={[
          styles.listContainer,
          callHistory.length === 0 && styles.emptyListContainer,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.DODGERBLUE}
            colors={[COLORS.DODGERBLUE]}
          />
        }
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {},
  listContainer: {
    paddingVertical: verticalScale(8),
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  callItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(12),
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray,
    paddingHorizontal: scale(15),
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  profilePicContainer: {
    position: 'relative',
    marginRight: scale(12),
  },
  profilePic: {
    width: scale(50),
    height: scale(50),
    borderRadius: moderateScale(25),
  },
  defaultProfilePic: {
    backgroundColor: COLORS.DODGERBLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultProfileText: {
    color: COLORS.white,
    fontSize: moderateScale(20),
    fontFamily: Fonts.Bold,
  },
  callTypeBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: scale(20),
    height: scale(20),
    borderRadius: moderateScale(10),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userInfo: {
    flex: 1,
  },
  nameText: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Medium,
    color: COLORS.black,
    marginBottom: verticalScale(2),
  },
  callInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(2),
  },
  callTypeText: {
    fontSize: moderateScale(12),
    color: COLORS.gray,
    fontFamily: Fonts.Regular,
  },
  dot: {
    fontSize: moderateScale(12),
    color: COLORS.gray,
    marginHorizontal: scale(4),
  },
  durationText: {
    fontSize: moderateScale(12),
    color: COLORS.gray,
    fontFamily: Fonts.Regular,
  },
  dateText: {
    fontSize: moderateScale(12),
    color: COLORS.lightGrey,
    fontFamily: Fonts.Regular,
  },
  timeText: {
    fontSize: moderateScale(12),
    color: COLORS.gray,
    fontFamily: Fonts.Regular,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(60),
  },
  emptyTitle: {
    fontSize: moderateScale(18),
    fontFamily: Fonts.Medium,
    color: COLORS.black,
    marginTop: verticalScale(16),
  },
  emptySubtitle: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Regular,
    color: COLORS.gray,
    marginTop: verticalScale(4),
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(60),
    paddingHorizontal: scale(40),
  },
  errorText: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Regular,
    color: COLORS.red,
    marginTop: verticalScale(12),
    textAlign: 'center',
  },
  retryButton: {
    marginTop: verticalScale(16),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(24),
    backgroundColor: COLORS.DODGERBLUE,
    borderRadius: moderateScale(8),
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: moderateScale(14),
    fontFamily: Fonts.Medium,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(40),
  },
  loadingText: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(14),
    color: COLORS.gray,
    fontFamily: Fonts.Regular,
  },
});
