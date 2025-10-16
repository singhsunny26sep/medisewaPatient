import React, {useRef, useEffect, useState, useCallback, useMemo} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  BackHandler,
  Alert,
  Dimensions,
  TextInput,
  RefreshControl,
  Animated,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {COLORS} from '../../Theme/Colors';
import {scale, verticalScale, moderateScale} from '../../utils/Scaling';
import ReusableView from '../../component/ReusableView';
import RecommendedLabs from '../../component/HomeCompo/RecommendedLabs';
import Question from '../../component/HomeCompo/Question';
import TrustedBanner from '../../component/HomeCompo/TrustedBanner';
import {StatusBar} from 'react-native';
import CustomModal from '../../component/HomeCompo/CustomModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Fonts} from '../../Theme/Fonts';
import {Container} from '../../component/Container/Container';
import strings from '../../../localization';
import {useSelector} from 'react-redux';
import { Instance } from '../../api/Instance';
import LocationModal from '../../component/LocationModal';
import {useUserLocation} from '../../utils/useUserLocation';
import { requestUserPermission } from '../../utils/Firebase';
import fcmService from '../../utils/fcmService';

const {width} = Dimensions.get('window');

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export default function Home({navigation}) {
  const scrollViewRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const defaultLocation = useUserLocation();
  const [selectedLocation, setSelectedLocation] = useState(null);

  const language = useSelector(state => state.Common.language);

  useEffect(() => {
    const getProfileData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await Instance.get('/api/v1/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setProfileData(response.data.result);
        } else {
          setError('Failed to fetch profile data');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Unable to load profile data');
      } finally {
        setLoading(false);
      }
    };

    getProfileData();
  }, []);

  useEffect(() => {
    const getFCMToken = async () => {
      try {
        const token = await fcmService.requestUserPermission();
        if (token) {
          console.log('FCM Token:', token);
        }
      } catch (error) {
        console.log('FCM Error:', error);
      }
    };
  
    getFCMToken();
  }, []);

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleLocationSelect = location => {
    setSelectedLocation(location);
    setLocationModalVisible(false);
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((text) => {
      setSearchText(text);
    }, 300),
    []
  );

  // Pull to refresh function
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const response = await Instance.get('/api/v1/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setProfileData(response.data.result);
        }
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Retry function for error handling
  const retryLoadProfile = useCallback(() => {
    setError(null);
    setLoading(true);

    const getProfileData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await Instance.get('/api/v1/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setProfileData(response.data.result);
        } else {
          setError('Failed to fetch profile data');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Unable to load profile data');
      } finally {
        setLoading(false);
      }
    };

    getProfileData();
  }, []);

  // Smooth scroll to top function
  const scrollToTop = useCallback(() => {
    scrollViewRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  }, []);

  // Enhanced scroll handler for smooth interactions
  const handleScroll = useCallback((event) => {
    const { y } = event.nativeEvent.contentOffset;
    // Add any scroll-based animations or behaviors here
    // For example, hide/show header on scroll
  }, []);

  useEffect(() => {
    // Animate content entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [loading]);

  return (
    <Container
      statusBarStyle={'light-content'}
      statusBarBackgroundColor={'#64B5F6'}
      backgroundColor={COLORS.white}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#64B5F6', '#42A5F5', '#2196F3']}
          start={{x: 0, y: 0}}  
          end={{x: 1, y: 1}}
          style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <View style={styles.welcomeSection}>
              <View style={styles.profileSection}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.15)']}
                  style={styles.profileIconContainer}>
                  <FontAwesome
                    name="user-circle"
                    size={40}
                    color={COLORS.white}
                  />
                </LinearGradient>
              </View>
              <View style={styles.welcomeTextContainer}>
                <Text style={styles.welcomeText}>{strings.welcome},</Text>
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={COLORS.white} />
                    <Text style={styles.loadingText}>Loading...</Text>
                  </View>
                ) : error ? (
                  <TouchableOpacity onPress={retryLoadProfile} style={styles.errorContainer}>
                    <Text style={styles.errorText}>Tap to retry</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.userName} numberOfLines={1}>
                    {profileData?.name || "User"}
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setLocationModalVisible(true)}
              style={styles.locationButton}>
              <MaterialIcons name="location-pin" size={16} color={COLORS.white} />
              <Text style={styles.locationText} numberOfLines={1} ellipsizeMode="tail">
                {selectedLocation || defaultLocation || 'Select Location'}
              </Text>
              <MaterialIcons name="expand-more" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <Animated.ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          style={[styles.scrollView, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          contentContainerStyle={styles.scrollViewContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.DODGERBLUE]}
              tintColor={COLORS.DODGERBLUE}
              title="Pull to refresh"
              titleColor={COLORS.DODGERBLUE}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            />
          }
          decelerationRate="normal"
          scrollEventThrottle={16}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={100}
          initialNumToRender={10}
          windowSize={10}
          disableIntervalMomentum={false}
          disableScrollViewPanResponder={false}
        >
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={COLORS.ARSENIC} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for doctors, medicines..."
                placeholderTextColor="#999"
                value={searchText}
                onChangeText={debouncedSearch}
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
                allowsNativeAnimation={true}
              />
              {searchText.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchText('')}
                  style={styles.clearButton}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.servicesContainer}>
            <Text style={styles.sectionTitle}>{strings.OurServices}</Text>
            <View style={styles.servicesGrid}>
              <ReusableView
                text={strings.OnlineDoctorConsultations}
                imageSource={require('../../assets/Dr10mint.jpg')}
                imageStyle={styles.DrImageStyle}
                navigation={() => navigation.navigate('FindDoctor')}
              />
              <ReusableView
                text={strings.LabTestsAndScans}
                imageSource={require('../../assets/NearestLabLogo.jpg')}
                navigation={() => navigation.navigate('NearestLabPage')}
                imageStyle={styles.LabImageStyle}
              />
              <ReusableView
                text={"Prescription & Reports"}
                imageSource={require('../../assets/Reports.jpg')}
                imageStyle={styles.ReportImageStyle}
                navigation={() => navigation.navigate('Reports')} 
              />                         
              <ReusableView
                text={strings.OrderMedicines}
                imageSource={require('../../assets/MedicinePng.png')}
                navigation={() => navigation.navigate('MedicineCategory')}
                imageStyle={styles.ImageStyle3}
              />
            </View>
          </View>
          <View style={styles.labBannerContainer}>
            <LinearGradient
              colors={['#E3F2FD', '#BBDEFB']}
              style={styles.labBanner}>
              <View style={styles.labBannerContent}>
                <View style={styles.labBannerTextContainer}>
                  <Text style={styles.labBannerTitle}>
                    {strings.BookLabTests}
                  </Text>
                  <Text style={styles.labBannerSubtitle}>
                    {strings.SamplePickupInfo}
                  </Text>
                  <TouchableOpacity
                    style={styles.bookNowButton}
                    onPress={() => navigation.navigate('NearestLabPage')}>
                    <Text style={styles.bookNowText}>{strings.BookNow}</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={20}
                      color={COLORS.white}
                    />
                  </TouchableOpacity>
                </View>
                <Image
                  style={styles.labBannerImage}
                  source={require('../../assets/NearestLabLogo.jpg')}
                />
              </View>
            </LinearGradient>
          </View>
          <TrustedBanner />
        </Animated.ScrollView>
      </View>

      <CustomModal
        visible={modalVisible}
        onClose={closeModal}
        imageSource={require('../../assets/coming-soon.jpg')}
        message="This feature will be available soon."
      />
      <LocationModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onLocationSelect={handleLocationSelect}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerGradient: {
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(20),
    borderBottomLeftRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  welcomeSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: scale(10),
  },
  profileSection: {
    marginRight: scale(15),
  },
  profileIconContainer: {
    padding: moderateScale(10),
    borderRadius: moderateScale(15),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  welcomeTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: Fonts.Regular,
    fontSize: moderateScale(14),
  },
  userName: {
    color: COLORS.white,
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(18),
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: verticalScale(5),
    paddingHorizontal: scale(8),
    borderRadius: moderateScale(20),
    maxWidth: scale(150),
    marginRight:scale(2)
  },
  locationText: {
    flex: 1,
    color: COLORS.white,
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(12),
    marginHorizontal: scale(5),
  },
  notificationButton: {
    padding: moderateScale(8),
  },
  notificationIconContainer: {
    padding: moderateScale(10),
    borderRadius: moderateScale(15),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  notificationBadge: {
    position: 'absolute',
    top: scale(8),
    right: scale(8),
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: '#FF3B30',
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: verticalScale(20),
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.white,
    fontFamily: Fonts.Regular,
    fontSize: moderateScale(16),
    marginLeft: scale(8),
  },
  errorContainer: {
    paddingVertical: verticalScale(2),
  },
  errorText: {
    color: '#FFE66D',
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(16),
    textDecorationLine: 'underline',
  },
  searchContainer: {
    paddingHorizontal: scale(20),
    marginTop: verticalScale(20),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(12),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: scale(10),
    color: COLORS.ARSENIC,
    fontFamily: Fonts.Regular,
    fontSize: moderateScale(14),
    padding: 0,
  },
  clearButton: {
    padding: scale(4),
  },
  servicesContainer: {
    paddingHorizontal: scale(20),
    marginTop: verticalScale(10),
  },
  sectionTitle: {
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(20),
    color: COLORS.ARSENIC,
    marginBottom: verticalScale(10),
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  labBannerContainer: {
    paddingHorizontal: scale(20),
    marginTop: verticalScale(25),
  },
  labBanner: {
    borderRadius: moderateScale(20),
    overflow: 'hidden',
  },
  labBannerContent: {
    flexDirection: 'row',
    padding: moderateScale(20),
  },
  labBannerTextContainer: {
    flex: 1,
    marginRight: scale(15),
  },
  labBannerTitle: {
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(20),
    color: COLORS.ARSENIC,
    marginBottom: verticalScale(8),
  },
  labBannerSubtitle: {
    fontFamily: Fonts.Regular,
    fontSize: moderateScale(14),
    color: COLORS.ARSENIC,
    marginBottom: verticalScale(15),
  },
  bookNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.DODGERBLUE,
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(20),
    borderRadius: moderateScale(25),
    alignSelf: 'flex-start',
  },
  bookNowText: {
    color: COLORS.white,
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(14),
    marginRight: scale(8),
  },
  labBannerImage: {
    width: scale(100),
    height: scale(100),
    borderRadius: moderateScale(15),
  },
  bottomSection: {
    marginTop: verticalScale(25),
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
    paddingTop: verticalScale(25),
  },
  DrImageStyle: {
    height: verticalScale(65),
    width: scale(60),
    resizeMode: 'cover',
    borderRadius: moderateScale(25),
  },
  ReportImageStyle: {
    height: verticalScale(55),
    width: scale(60),
    resizeMode: 'cover',
    borderRadius: moderateScale(25),
  },
  ImageStyle3: {
    height: verticalScale(70),
    width: scale(70),
    resizeMode: 'contain',
  },
  LabImageStyle: {
    height: verticalScale(60),
    width: scale(61),
    resizeMode: 'cover',
    borderRadius: moderateScale(10),
  },
});
