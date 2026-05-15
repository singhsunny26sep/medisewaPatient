import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Modal,
  Platform,
  Alert,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Instance } from '../../../api/Instance';
import { COLORS } from '../../../Theme/Colors';
import { scale, verticalScale, moderateScale } from '../../../utils/Scaling';
import { Fonts } from '../../../Theme/Fonts';

const { width, height } = Dimensions.get('window');
const isSmallPhone = width < 380;

// Safely import optional dependencies
let Geolocation;
let GooglePlacesAutocomplete;
let check, request, PERMISSIONS, RESULTS;

try {
  Geolocation = require('react-native-geolocation-service').default;
} catch (e) {
  console.log('Geolocation module not available:', e.message);
}

try {
  const googlePlaces = require('react-native-google-places-autocomplete');
  GooglePlacesAutocomplete = googlePlaces.GooglePlacesAutocomplete;
} catch (e) {
  console.log('Google Places Autocomplete module not available:', e.message);
}

try {
  const permissions = require('react-native-permissions');
  check = permissions.check;
  request = permissions.request;
  PERMISSIONS = permissions.PERMISSIONS;
  RESULTS = permissions.RESULTS;
} catch (e) {
  console.log('React Native Permissions module not available:', e.message);
}

const DEFAULT_IMAGE = 'https://passion.healthcare/wp-content/uploads/2023/02/labimage.jpeg';
const DEFAULT_LogoIMAGE = 'https://static.vecteezy.com/system/resources/previews/020/448/567/non_2x/laboratory-logo-design-template-free-vector.jpg';
const GOOGLE_API_KEY = 'AIzaSyDpTsiLmk-PYR3qTOLdwPqiJuE1ierFol8';

export default function NearestLabPage({ navigation }) {
  const [labs, setLabs] = useState([]);
  const [filteredLabs, setFilteredLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locationName, setLocationName] = useState('Fetching location...');
  const [noServiceAvailable, setNoServiceAvailable] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const isMounted = useRef(true);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [filteredLabs]);

  const extractCityStatePincode = (addressComponents) => {
    try {
      let city = '';
      let state = '';
      let pincode = '';

      if (!addressComponents || !Array.isArray(addressComponents)) {
        return 'Unknown location';
      }

      addressComponents.forEach(component => {
        if (component?.types?.includes('locality')) {
          city = component.long_name || '';
        }
        if (component?.types?.includes('administrative_area_level_1')) {
          state = component.short_name || '';
        }
        if (component?.types?.includes('postal_code')) {
          pincode = component.long_name || '';
        }
      });

      const parts = [];
      if (city) parts.push(city);
      if (state) parts.push(state);
      if (pincode) parts.push(pincode);
      
      return parts.join(', ') || 'Unknown location';
    } catch (error) {
      console.error('Error extracting location:', error);
      return 'Unknown location';
    }
  };

  const fetchLocation = useCallback(async () => {
    if (!isMounted.current) return;
    
    try {
      setIsLocationLoading(true);
      setLocationName('Fetching location...');

      const defaultLocation = 'Delhi, India 110001';

      if (!check || !request || !PERMISSIONS || !RESULTS || !Geolocation) {
        if (isMounted.current) {
          setLocationName(defaultLocation);
          setIsLocationLoading(false);
        }
        return;
      }

      const platformPermission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE 
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      if (!platformPermission) {
        if (isMounted.current) {
          setLocationName(defaultLocation);
          setIsLocationLoading(false);
        }
        return;
      }

      let permissionStatus;
      try {
        permissionStatus = await check(platformPermission);
      } catch (permError) {
        console.error('Permission check error:', permError);
        if (isMounted.current) {
          setLocationName(defaultLocation);
          setIsLocationLoading(false);
        }
        return;
      }

      if (permissionStatus === RESULTS?.DENIED) {
        try {
          const requestResult = await request(platformPermission);
          if (requestResult !== RESULTS?.GRANTED) {
            if (isMounted.current) {
              setLocationName(defaultLocation);
              setIsLocationLoading(false);
            }
            return;
          }
        } catch (requestError) {
          console.error('Permission request error:', requestError);
          if (isMounted.current) {
            setLocationName(defaultLocation);
            setIsLocationLoading(false);
          }
          return;
        }
      } else if (permissionStatus !== RESULTS?.GRANTED) {
        if (isMounted.current) {
          setLocationName(defaultLocation);
          setIsLocationLoading(false);
        }
        return;
      }

      try {
        const position = await new Promise((resolve, reject) => {
          Geolocation.getCurrentPosition(
            resolve,
            reject,
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
          );
        });

        const { latitude, longitude } = position.coords;

        try {
          const response = await Instance.get(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`,
          );

          if (response?.data?.results && response.data.results.length > 0) {
            const location = extractCityStatePincode(
              response.data.results[0].address_components,
            );
            if (isMounted.current) {
              setLocationName(location || defaultLocation);
            }
          } else {
            if (isMounted.current) {
              setLocationName(defaultLocation);
            }
          }
        } catch (apiError) {
          console.error('Google API Error:', apiError);
          if (isMounted.current) {
            setLocationName(defaultLocation);
          }
        }
      } catch (geoError) {
        console.error('Geolocation error:', geoError);
        if (isMounted.current) {
          setLocationName(defaultLocation);
        }
      }
    } catch (err) {
      console.error('Error in fetchLocation:', err);
      if (isMounted.current) {
        setLocationName('Current location');
      }
    } finally {
      if (isMounted.current) {
        setIsLocationLoading(false);
      }
    }
  }, []);

  const fetchLabs = useCallback(async () => {
    if (!isMounted.current) return;
    
    try {
      setLoading(true);
      setError(null);
      
      let token;
      try {
        token = await AsyncStorage.getItem('userToken');
      } catch (storageError) {
        console.error('Error getting token:', storageError);
        if (isMounted.current) {
          setError('Authentication error. Please login again.');
          setLoading(false);
          setInitialLoadDone(true);
        }
        return;
      }

      if (!token) {
        if (isMounted.current) {
          setError('Please login to view labs');
          setLoading(false);
          setInitialLoadDone(true);
        }
        return;
      }

      try {
        const response = await Instance.get('/labs', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response?.data && isMounted.current) {
          let labsData = response.data.data || [];
          if (!Array.isArray(labsData)) labsData = [];
          labsData = labsData.filter(lab => lab && lab.name && lab._id);
          
          setLabs(labsData);
          setFilteredLabs(labsData);
          setError(null);
          if (labsData.length === 0) setNoServiceAvailable(true);
        }
      } catch (apiError) {
        console.error('API Error:', apiError);
        if (isMounted.current) {
          if (apiError.response?.status === 401) {
            setError('Session expired. Please login again.');
          } else if (apiError.response?.status === 404) {
            setError('Labs endpoint not found');
          } else {
            setError('Unable to connect to server. Please try again.');
          }
        }
      }
    } catch (err) {
      console.error('Error in fetchLabs:', err);
      if (isMounted.current) {
        setError('Unable to load labs. Please try again.');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setInitialLoadDone(true);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    const loadInitialData = async () => {
      await Promise.all([fetchLocation(), fetchLabs()]);
    };
    loadInitialData();
    return () => { isMounted.current = false; };
  }, [fetchLocation, fetchLabs]);

  useEffect(() => {
    if (!labs.length) {
      setFilteredLabs([]);
      return;
    }

    try {
      if (!searchQuery.trim()) {
        setFilteredLabs(labs);
        setNoServiceAvailable(labs.length === 0);
        return;
      }

      const searchLower = searchQuery.toLowerCase().trim();
      const filtered = labs.filter(lab => {
        if (!lab || !lab.name) return false;
        return (
          lab.name.toLowerCase().includes(searchLower) ||
          (lab.address?.city || '').toLowerCase().includes(searchLower) ||
          (lab.address?.state || '').toLowerCase().includes(searchLower) ||
          (lab.address?.address || '').toLowerCase().includes(searchLower)
        );
      });

      setFilteredLabs(filtered);
      setNoServiceAvailable(filtered.length === 0);
    } catch (error) {
      console.error('Error filtering labs:', error);
      setFilteredLabs(labs);
    }
  }, [searchQuery, labs]);

  const handleLocationSelect = async (data, details) => {
    try {
      if (!details || !details.address_components) {
        Alert.alert('Error', 'Invalid location selected');
        setLocationModalVisible(false);
        return;
      }

      const location = extractCityStatePincode(details.address_components);
      setLocationModalVisible(false);
      setLocationName(location || 'Selected location');

      if (!location) {
        setFilteredLabs(labs);
        setNoServiceAvailable(labs.length === 0);
        return;
      }

      const locationKeyword = location.split(',')[0]?.trim();
      if (!locationKeyword) {
        setFilteredLabs(labs);
        setNoServiceAvailable(labs.length === 0);
        return;
      }

      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          Alert.alert('Error', 'Please login again');
          return;
        }

        const response = await Instance.get(
          `/location?search=${encodeURIComponent(locationKeyword)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response?.data) {
          const locationLabs = Array.isArray(response.data) ? response.data : [];
          setFilteredLabs(locationLabs);
          setNoServiceAvailable(locationLabs.length === 0);
        }
      } catch (apiError) {
        console.error('Error fetching labs for location:', apiError);
        Alert.alert('Error', 'Failed to fetch labs for selected location');
        setFilteredLabs(labs);
        setNoServiceAvailable(labs.length === 0);
      }
    } catch (error) {
      console.error('Error in location select:', error);
      Alert.alert('Error', 'Failed to process location selection');
      setLocationModalVisible(false);
    }
  };

  const LabCard = ({ item }) => {
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    
    useEffect(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }, []);

    const imageUri = (item.image && typeof item.image === 'string' && item.image.startsWith('http'))
      ? item.image : DEFAULT_IMAGE;
    const logoImageUri = (item.logo && typeof item.logo === 'string' && item.logo.startsWith('http'))
      ? item.logo : DEFAULT_LogoIMAGE;
    const labName = item.name || 'Unknown Lab';
    const city = item.address?.city || 'Unknown City';
    const state = item.address?.state || 'Unknown State';

    return (
      <Animated.View style={[styles.labCard, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          onPress={() => navigation.navigate('LabDetailsPage', { lab: item, locationAddress: locationName })}
          activeOpacity={0.8}
        >
          <Image style={styles.labCoverImage} source={{ uri: imageUri }} />
          <View style={styles.labLogoWrapper}>
            <Image source={{ uri: logoImageUri }} style={styles.labLogo} />
          </View>
          <View style={styles.labInfo}>
            <View style={styles.labNameRow}>
              <Fontisto name="laboratory" size={16} color="#3B82F6" />
              <Text style={styles.labName} numberOfLines={1}>{labName}</Text>
            </View>
            <View style={styles.labAddressRow}>
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text style={styles.labAddress} numberOfLines={1}>{`${city}, ${state}`}</Text>
            </View>
            <View style={styles.labMetaRow}>
              <View style={styles.metaBadge}>
                <Ionicons name="flask-outline" size={10} color="#10B981" />
                <Text style={styles.metaText}>NABL Certified</Text>
              </View>
              <View style={styles.metaBadge}>
                <Ionicons name="time-outline" size={10} color="#F59E0B" />
                <Text style={styles.metaText}>48 hrs Report</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBg}>
        <Ionicons name="flask-outline" size={50} color="#3B82F6" />
      </View>
      <Text style={styles.emptyTitle}>No Labs Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery ? 'Try searching with a different keyword' : 'No labs available in this area'}
      </Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={() => setLocationModalVisible(true)}>
        <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.emptyGradient}>
          <Ionicons name="location-outline" size={18} color="#FFF" />
          <Text style={styles.emptyBtnText}>Change Location</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  if (loading && !initialLoadDone) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loaderText}>Loading labs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.locationBtn}
          onPress={() => setLocationModalVisible(true)}
          disabled={isLocationLoading}
        >
          <Ionicons name="location-outline" size={16} color="#3B82F6" />
          <Text style={styles.locationText} numberOfLines={1}>
            {isLocationLoading ? 'Fetching...' : (locationName || 'Select Location')}
          </Text>
          <Ionicons name="chevron-down" size={14} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={22} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search labs by name or location..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{filteredLabs.length}</Text>
          <Text style={styles.statLabel}>Labs Found</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>100+</Text>
          <Text style={styles.statLabel}>Tests Available</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>4.8</Text>
          <Text style={styles.statLabel}>Avg Rating</Text>
        </View>
      </View>

      {/* Labs List */}
      {error ? (
        <View style={styles.errorContainer}>
          <View style={styles.errorIconBg}>
            <Ionicons name="alert-circle-outline" size={50} color="#EF4444" />
          </View>
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchLabs}>
            <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.retryGradient}>
              <Text style={styles.retryText}>Try Again</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.FlatList
          data={filteredLabs}
          renderItem={({ item }) => <LabCard item={item} />}
          keyExtractor={(item, index) => item?._id?.toString() || `lab-${index}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState />}
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        />
      )}

      {/* Location Modal */}
      <Modal
        visible={locationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLocationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Location</Text>
              <TouchableOpacity onPress={() => setLocationModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            {GooglePlacesAutocomplete ? (
              <>
                <GooglePlacesAutocomplete
                  placeholder="Search for a location..."
                  fetchDetails={true}
                  onPress={handleLocationSelect}
                  query={{ key: GOOGLE_API_KEY, language: 'en', components: 'country:in' }}
                  styles={autocompleteStyles}
                  onFail={(error) => console.error('Google Places Error:', error)}
                  enablePoweredByContainer={false}
                  minLength={2}
                  debounce={200}
                />
              </>
            ) : (
              <View style={styles.fallbackContainer}>
                <Ionicons name="location-outline" size={50} color="#3B82F6" />
                <Text style={styles.fallbackText}>Location search is not available</Text>
                <TouchableOpacity style={styles.fallbackBtn} onPress={() => setLocationModalVisible(false)}>
                  <Text style={styles.fallbackBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const autocompleteStyles = {
  container: { flex: 0, backgroundColor: '#FFF' },
  textInputContainer: { backgroundColor: '#FFF', borderTopWidth: 0, borderBottomWidth: 0 },
  textInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    height: 48,
    fontSize: 15,
    color: '#111827',
    paddingHorizontal: 16,
  },
  listView: { backgroundColor: '#FFF', borderRadius: 12, marginTop: 8 },
  row: { padding: 12, backgroundColor: '#FFF' },
  separator: { backgroundColor: '#F3F4F6', height: 1 },
  description: { fontSize: 14, color: '#111827' },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 20,
    paddingBottom: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    maxWidth: width * 0.5,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
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
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  labCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  labCoverImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  labLogoWrapper: {
    position: 'absolute',
    top: 80,
    left: 16,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  labLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: 'contain',
  },
  labInfo: {
    padding: 16,
    paddingTop: 20,
  },
  labNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  labName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  labAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  labAddress: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  labMetaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  metaText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#4B5563',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyBtn: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  emptyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  emptyBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  retryGradient: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 14,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  fallbackContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  fallbackText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 24,
  },
  fallbackBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  fallbackBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});