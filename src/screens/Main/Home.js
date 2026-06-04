import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  RefreshControl,
  Animated,
  ActivityIndicator,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { scale, verticalScale, moderateScale } from '../../utils/Scaling';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fonts } from '../../Theme/Fonts';
import strings from '../../../localization';
import { useSelector } from 'react-redux';
import { Instance } from '../../api/Instance';
import LocationModal from '../../component/LocationModal';
import { useUserLocation } from '../../utils/useUserLocation';
import fcmService from '../../utils/fcmService';

const { width } = Dimensions.get('window');

// Service Data
const services = [
  {
    id: 1,
    title: 'Online Doctor\nConsultations',
    icon: 'videocam',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    route: 'FindDoctor',
    image: require('../../assets/Dr10mint.jpg'),
  },
  {
    id: 2,
    title: 'Lab Tests\n& Scans',
    icon: 'flask',
    color: '#10B981',
    bgColor: '#ECFDF5',
    route: 'NearestLabPage',
    image: require('../../assets/NearestLabLogo.jpg'),
  },
  {
    id: 3,
    title: 'Prescription &\nReports',
    icon: 'document-text',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    route: 'Reports',
    image: require('../../assets/Reports.jpg'),
  },
  {
    id: 4,
    title: 'Order\nMedicines',
    icon: 'medkit',
    color: '#EF4444',
    bgColor: '#FEF2F2',
    route: 'MedicineCategory',
    image: require('../../assets/MedicinePng.png'),
  },
];

const quickActions = [
  { id: 1, title: 'Book Lab Test', icon: 'flask-outline', color: '#10B981', route: 'NearestLabPage' },
  { id: 2, title: 'Consult Doctor', icon: 'videocam-outline', color: '#3B82F6', route: 'FindDoctor' },
  { id: 3, title: 'Order Medicine', icon: 'medkit-outline', color: '#EF4444', route: 'MedicineCategory' },
  { id: 4, title: 'Health Records', icon: 'folder-outline', color: '#8B5CF6', route: 'Reports' },
];

export default function Home({ navigation }) {
  const scrollViewRef = useRef(null);
  const [searchText, setSearchText] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const defaultLocation = useUserLocation();
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  useEffect(() => {
    const getProfileData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          setLoading(false);
          return;
        }
        const response = await Instance.get('/api/v1/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setProfileData(response.data.result);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    getProfileData();
  }, []);

  useEffect(() => {
    const getFCMToken = async () => {
      try {
        await fcmService.requestUserPermission();
      } catch (error) {
        console.log('FCM Error:', error);
      }
    };
    getFCMToken();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log(token,"this is newtoken")
      if (token) {
        const response = await Instance.get('/api/v1/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setProfileData(response.data.result);
        }
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setLocationModalVisible(false);
  };

  const ServiceCard = ({ service }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => navigation.navigate(service.route)}
      activeOpacity={0.8}
    >
      <View style={[styles.serviceIconBg, { backgroundColor: service.bgColor }]}>
        <Ionicons name={service.icon} size={28} color={service.color} />
      </View>
      <Text style={styles.serviceTitle}>{service.title}</Text>
    </TouchableOpacity>
  );

  const QuickActionCard = ({ action }) => (
    <TouchableOpacity
      style={styles.quickActionCard}
      onPress={() => navigation.navigate(action.route)}
      activeOpacity={0.7}
    >
      <View style={[styles.quickActionIconBg, { backgroundColor: `${action.color}10` }]}>
        <Ionicons name={action.icon} size={22} color={action.color} />
      </View>
      <Text style={styles.quickActionText}>{action.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#3B82F6', '#2563EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.userSection}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                style={styles.avatarBg}
              >
                <FontAwesome name="user-circle" size={40} color="#FFF" />
              </LinearGradient>
              <View style={styles.onlineDot} />
            </View>
            <View style={styles.userTextContainer}>
              <Text style={styles.greetingText}>{greeting},</Text>
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.userName} numberOfLines={1}>
                  {profileData?.name || 'Guest User'}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.notificationBtn}>
              <View style={styles.notificationIconBg}>
                <Ionicons name="notifications-outline" size={20} color="#FFF" />
              </View>
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.locationBtn}
              onPress={() => setLocationModalVisible(true)}
            >
              <Ionicons name="location-outline" size={14} color="#FFF" />
              <Text style={styles.locationText} numberOfLines={1}>
                {selectedLocation || defaultLocation || 'Select Location'}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <Animated.ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        style={[styles.scrollView, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search doctors, medicines..."
              placeholderTextColor="#9CA3AF"
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Welcome Banner */}
        <View style={styles.welcomeBanner}>
          <LinearGradient
            colors={['#EFF6FF', '#DBEAFE']}
            style={styles.welcomeBannerInner}
          >
            <View style={styles.welcomeBannerContent}>
              <Text style={styles.welcomeBannerTitle}>Get 20% OFF</Text>
              <Text style={styles.welcomeBannerSubtitle}>on your first medicine order</Text>
              <TouchableOpacity style={styles.welcomeBannerBtn}>
                <Text style={styles.welcomeBannerBtnText}>Shop Now →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.welcomeBannerIcon}>
              <Ionicons name="medkit-outline" size={60} color="#3B82F6" opacity={0.3} />
            </View>
          </LinearGradient>
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Our Services</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <QuickActionCard key={action.id} action={action} />
            ))}
          </View>
        </View>

        {/* Lab Banner */}
        <TouchableOpacity
          style={styles.labBanner}
          onPress={() => navigation.navigate('NearestLabPage')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.labBannerInner}
          >
            <View style={styles.labBannerContent}>
              <Text style={styles.labBannerTitle}>Book Lab Tests</Text>
              <Text style={styles.labBannerSubtitle}>Free sample pickup • Reports in 24hrs</Text>
              <View style={styles.labBannerBtn}>
                <Text style={styles.labBannerBtnText}>Book Now</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFF" />
              </View>
            </View>
            <View style={styles.labBannerImageWrapper}>
              <Ionicons name="flask" size={50} color="#FFF" opacity={0.8} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Trusted Banner */}
        <View style={styles.trustedSection}>
          <View style={styles.trustedRow}>
            <View style={styles.trustedItem}>
              <Ionicons name="medkit-outline" size={24} color="#3B82F6" />
              <Text style={styles.trustedNumber}>10k+</Text>
              <Text style={styles.trustedLabel}>Happy Patients</Text>
            </View>
            <View style={styles.trustedDivider} />
            <View style={styles.trustedItem}>
              <Ionicons name="people-outline" size={24} color="#3B82F6" />
              <Text style={styles.trustedNumber}>500+</Text>
              <Text style={styles.trustedLabel}>Expert Doctors</Text>
            </View>
            <View style={styles.trustedDivider} />
            <View style={styles.trustedItem}>
              <Ionicons name="business-outline" size={24} color="#3B82F6" />
              <Text style={styles.trustedNumber}>50+</Text>
              <Text style={styles.trustedLabel}>Partner Labs</Text>
            </View>
          </View>
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </Animated.ScrollView>

      {/* Location Modal */}
      <LocationModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onLocationSelect={handleLocationSelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatarBg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  userTextContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationBtn: {
    position: 'relative',
  },
  notificationIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
    maxWidth: 130,
  },
  locationText: {
    fontSize: 11,
    color: '#FFF',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#111827',
    padding: 0,
  },
  welcomeBanner: {
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
  },
  welcomeBannerInner: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeBannerContent: {
    flex: 1,
  },
  welcomeBannerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  welcomeBannerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  welcomeBannerBtn: {
    alignSelf: 'flex-start',
  },
  welcomeBannerBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  welcomeBannerIcon: {
    marginLeft: 12,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 18,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    alignItems: 'center',
    width: (width - 52) / 4,
  },
  quickActionIconBg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  labBanner: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  labBannerInner: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labBannerContent: {
    flex: 1,
  },
  labBannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 6,
  },
  labBannerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 14,
  },
  labBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  labBannerBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  labBannerImageWrapper: {
    marginLeft: 12,
  },
  trustedSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  trustedRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  trustedItem: {
    flex: 1,
    alignItems: 'center',
  },
  trustedNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 6,
    marginBottom: 2,
  },
  trustedLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  trustedDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  bottomPadding: {
    height: 40,
  },
});