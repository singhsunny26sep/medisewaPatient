import React, {useState, useEffect, useCallback} from 'react';
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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/Ionicons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';
import {Instance} from '../../../api/Instance';
import {COLORS} from '../../../Theme/Colors';
import {scale, verticalScale, moderateScale} from '../../../utils/Scaling';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {StatusBar} from 'react-native';
import {Container} from '../../../component/Container/Container';
import {Fonts} from '../../../Theme/Fonts';
import {useUserLocation} from '../../../utils/useUserLocation';

const DEFAULT_IMAGE =
  'https://passion.healthcare/wp-content/uploads/2023/02/labimage.jpeg';
const DEFAULT_LogoIMAGE =
  'https://static.vecteezy.com/system/resources/previews/020/448/567/non_2x/laboratory-logo-design-template-free-vector.jpg';

const GOOGLE_API_KEY = 'AIzaSyDpTsiLmk-PYR3qTOLdwPqiJuE1ierFol8';

export default function NearestLabPage({navigation}) {
  const location = useUserLocation();

  const [labs, setLabs] = useState([]);
  const [filteredLabs, setFilteredLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locationName, setLocationName] = useState('Fetching location...');
  const [noServiceAvailable, setNoServiceAvailable] = useState(false);

  const extractCityStatePincode = addressComponents => {
    let city = '';
    let state = '';
    let pincode = '';

    addressComponents.forEach(component => {
      if (component.types.includes('locality')) {
        city = component.long_name;
      }
      if (component.types.includes('administrative_area_level_1')) {
        state = component.short_name;
      }
      if (component.types.includes('postal_code')) {
        pincode = component.long_name;
      }
    });

    return `${city}, ${state} ${pincode}`;
  };

  const fetchLocation = async () => {
    try {
      setLocationName('Fetching location...');

      const permissionStatus = await check(
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      );

      if (permissionStatus === RESULTS.DENIED) {
        const requestResult = await request(
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        );

        if (requestResult !== RESULTS.GRANTED) {
          setError('Location permission not granted');
          setLocationName('Location not available');
          return;
        }
      } else if (permissionStatus !== RESULTS.GRANTED) {
        setError('Location permission not granted');
        setLocationName('Location not available');
        return;
      }

      const position = await new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
          }
        );
      });

      const {latitude, longitude} = position.coords;

      try {
        const response = await Instance.get(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`,
        );

        if (response.data && response.data.results && response.data.results.length > 0) {
          const location = extractCityStatePincode(
            response.data.results[0].address_components,
          );
          setLocationName(location || 'Unknown location');
          setError(null);
        } else {
          setLocationName('Unknown location');
          setError(null);
        }
      } catch (apiError) {
        console.error('Google API Error:', apiError);
        setLocationName('Current location');
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching location:', err);
      setError(null);
      setLocationName('Current location');
    }
  };

  useEffect(() => {
    fetchLocation();
    let isMounted = true;

    const fetchLabs = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('userToken');

        if (!token) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        const response = await Instance.get('/labs', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response && response.data && isMounted) {
          const labsData = response.data.data || [];
          setLabs(labsData);
          setFilteredLabs(labsData);
          setError(null);
        } else {
          setLabs([]);
          setFilteredLabs([]);
          setError('No labs found');
        }
      } catch (err) {
        console.error('Error fetching labs:', err);
        if (isMounted) {
          setError('Unable to load labs. Please try again.');
          setLabs([]);
          setFilteredLabs([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchLabs();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const filtered = labs.filter(lab => {
      const searchLower = searchQuery.toLowerCase();
      return (
        lab.name.toLowerCase().includes(searchLower) ||
        lab.address.city.toLowerCase().includes(searchLower) ||
        lab.address.state.toLowerCase().includes(searchLower) ||
        lab.address.address.toLowerCase().includes(searchLower)
      );
    });

    setFilteredLabs(filtered);
    setNoServiceAvailable(filtered.length === 0);
  }, [searchQuery, labs]);

  const handleLocationSelect = async (data, details) => {
    try {
      if (!details || !details.address_components) {
        setLocationModalVisible(false);
        setLocationName('Invalid location');
        return;
      }

      const location = extractCityStatePincode(details.address_components);
      setLocationModalVisible(false);
      setLocationName(location || 'Selected location');

      if (!location) {
        setFilteredLabs(labs);
        setNoServiceAvailable(false);
        return;
      }

      const locationKeyword = location.split(',')[0]?.trim();

      if (!locationKeyword) {
        setFilteredLabs(labs);
        setNoServiceAvailable(false);
        return;
      }

      try {
        const requestUrl = `/location?search=${encodeURIComponent(locationKeyword)}`;

        const response = await Instance.get(requestUrl);

        if (response && response.data) {
          const locationLabs = Array.isArray(response.data) ? response.data : [];

          if (locationLabs.length > 0) {
            setFilteredLabs(locationLabs);
            setNoServiceAvailable(false);
          } else {
            setFilteredLabs([]);
            setNoServiceAvailable(true);
          }
        } else {
          setFilteredLabs(labs);
          setNoServiceAvailable(false);
        }
      } catch (apiError) {
        console.error('Error fetching labs for location:', apiError);
        setFilteredLabs(labs);
        setNoServiceAvailable(false);
      }
    } catch (error) {
      console.error('Error in location select:', error);
      setLocationModalVisible(false);
      setLocationName('Error selecting location');
      setFilteredLabs(labs);
      setNoServiceAvailable(false);
    }
  };

  const renderLabItem = useCallback(
    ({item}) => {
      // Safety check for item data
      if (!item) {
        return null;
      }

      const imageUri = (item.image && typeof item.image === 'string' && item.image.startsWith('http'))
        ? item.image
        : DEFAULT_IMAGE;

      const LogoimageUri = (item.image && typeof item.image === 'string' && item.image.startsWith('http'))
        ? item.image
        : DEFAULT_LogoIMAGE;

      const labName = item.name || 'Unknown Lab';
      const city = item.address?.city || 'Unknown City';
      const state = item.address?.state || 'Unknown State';

      return (
        <TouchableOpacity
          style={styles.labItem}
          onPress={() => {
            if (item && item._id) {
              navigation.navigate('LabDetailsPage', {
                lab: item,
                locationAddress: locationName,
              });
            } else {
              console.error('Invalid lab data:', item);
            }
          }}>
          <Image
            style={styles.imageStyle}
            source={{uri: imageUri}}
            defaultSource={require('../../../assets/NearestLabLogo.jpg')}
          />
          <View>
            <View style={styles.NameAddView}>
              <View style={styles.LogoView}>
                <Image
                  source={{uri: LogoimageUri}}
                  style={styles.LogoImageStyle}
                  resizeMode="cover"
                  defaultSource={require('../../../assets/NearestLabLogo.jpg')}
                />
              </View>
              <View style={styles.LabAddressView}>
                <Fontisto name="laboratory" size={20} color={COLORS.ARSENIC} />
                <Text style={styles.labName} numberOfLines={1}>{labName}</Text>
              </View>
              <View style={styles.LabAddressView}>
                <Icon name="location" size={20} color={COLORS.ARSENIC} />
                <Text style={styles.labAddress} numberOfLines={1}>
                  {`${city}, ${state}`}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [navigation, locationName],
  );

  const keyExtractor = item => {
    return item.id ? item.id.toString() : item.name;
  };

  return (
    <Container
      statusBarStyle={'light-content'}
      statusBarBackgroundColor={COLORS.DODGERBLUE}
      backgroundColor={COLORS.white}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.LocationView}
          onPress={() => setLocationModalVisible(true)}>
          <Text numberOfLines={1} style={styles.locationText}>
            {location}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchHeader}>
        <View style={styles.searchTouch}>
          <TextInput
            placeholder="Search...."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons
            name="search-circle-sharp"
            size={40}
            color={COLORS.DODGERBLUE}
          />
        </View>
      </View>
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.DODGERBLUE} />
          <Text style={styles.loadingText}>Loading labs...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={50} color={COLORS.red} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              fetchLocation();
            }}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : noServiceAvailable ? (
        <View style={styles.noServiceContainer}>
          <Ionicons name="search" size={50} color={COLORS.gray} />
          <Text style={styles.noServiceText}>No labs found in this area</Text>
          <Text style={styles.noServiceSubtext}>Try selecting a different location</Text>
          <TouchableOpacity
            style={styles.changeLocationButton}
            onPress={() => setLocationModalVisible(true)}>
            <Text style={styles.changeLocationText}>Change Location</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredLabs}
          renderItem={renderLabItem}
          keyExtractor={keyExtractor}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No labs available</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
      <Modal
        visible={locationModalVisible}
        transparent
        onRequestClose={() => setLocationModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <GooglePlacesAutocomplete
              placeholder="Search for a location"
              fetchDetails={true}
              onPress={handleLocationSelect}
              query={{
                key: GOOGLE_API_KEY,
                language: 'en',
              }}
              styles={styles.autocomplete}
              onFail={(error) => {
                console.error('Google Places Error:', error);
              }}
              onTimeout={() => {
                console.error('Google Places Timeout');
              }}
              enablePoweredByContainer={false}
              minLength={2}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setLocationModalVisible(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Container>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  searchHeader: {
    height: verticalScale(70),
    backgroundColor: COLORS.DODGERBLUE,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: moderateScale(10),
    borderBottomRightRadius: moderateScale(10),
  },
  searchTouch: {
    flexDirection: 'row',
    width: '90%',
    backgroundColor: COLORS.white,
    borderColor: COLORS.AntiFlashWhite,
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(15),
    elevation: 3,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: verticalScale(40),
  },
  flatlistContainer: {
    flexGrow: 1,
    paddingHorizontal: scale(16),
  },
  labItem: {
    marginVertical: verticalScale(10),
    marginHorizontal: scale(15),
    borderRadius: moderateScale(10),
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    elevation: 3,
  },
  imageStyle: {
    height: verticalScale(100),
    width: '100%',
    overflow: 'hidden',
    resizeMode: 'cover',
  },

  LogoView: {
    backgroundColor: COLORS.white,
    height: scale(50),
    width: scale(50),
    borderRadius: scale(25),
    position: 'absolute',
    bottom: verticalScale(50),
    left: scale(15),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    overflow: 'hidden',
  },
  LogoImageStyle: {
    height: '90%',
    width: '90%',
    overflow: 'hidden',
    resizeMode: 'contain',
  },
  NameAddView: {
    backgroundColor: COLORS.white,
    width: scale(320),
    height: verticalScale(72),
    justifyContent: 'flex-end',
  },
  labName: {
    fontSize: moderateScale(16),
    color: COLORS.DODGERBLUE,
    fontFamily: Fonts.Light,
    paddingLeft: scale(5),
    top: scale(5),
  },
  LabAddressView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: verticalScale(2),
    paddingHorizontal: scale(15),
  },
  labAddress: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Medium,
    color: COLORS.ARSENIC,
    paddingLeft: scale(5),
    marginBottom: verticalScale(6),
    top: scale(5),
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.red,
    fontSize: moderateScale(18),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    backgroundColor: COLORS.DODGERBLUE,
  },
  locationText: {
    fontSize: moderateScale(15),
    color: COLORS.white,
    paddingLeft: scale(10),
    fontFamily: Fonts.Light,
  },
  LocationView: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(10),
    padding: scale(20),
    alignItems: 'center',
  },
  modalCloseButton: {
    marginTop: verticalScale(10),
    alignItems: 'center',
    padding: verticalScale(10),
    backgroundColor: COLORS.DODGERBLUE,
    borderRadius: moderateScale(5),
  },
  modalCloseText: {
    color: COLORS.white,
    fontSize: moderateScale(16),
  },
  noServiceContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noServiceText: {
    fontSize: moderateScale(18),
    color: COLORS.DODGERBLUE,
  },
  autocomplete: {
    container: {
      flex: 0,
      backgroundColor: COLORS.white,
      width: '100%',
    },
    textInputContainer: {
      flexDirection: 'row',
      backgroundColor: COLORS.white,
      borderTopWidth: 0,
      borderBottomWidth: 0,
      width: '100%',
    },
    textInput: {
      backgroundColor: COLORS.AntiFlashWhite,
      height: verticalScale(40),
      borderRadius: moderateScale(5),
      paddingVertical: verticalScale(5),
      paddingHorizontal: scale(10),
      fontSize: moderateScale(16),
      flex: 1,
    },
    predefinedPlacesDescription: {
      color: COLORS.ARSENIC,
    },
  },
  loadingText: {
    fontSize: moderateScale(16),
    color: COLORS.gray,
    marginTop: verticalScale(10),
    fontFamily: Fonts.Medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  errorText: {
    fontSize: moderateScale(16),
    color: COLORS.red,
    textAlign: 'center',
    marginTop: verticalScale(10),
    marginBottom: verticalScale(20),
    fontFamily: Fonts.Medium,
  },
  retryButton: {
    backgroundColor: COLORS.DODGERBLUE,
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(8),
  },
  retryText: {
    color: COLORS.white,
    fontSize: moderateScale(16),
    fontFamily: Fonts.Medium,
  },
  noServiceContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  noServiceText: {
    fontSize: moderateScale(18),
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: verticalScale(10),
    fontFamily: Fonts.Medium,
  },
  noServiceSubtext: {
    fontSize: moderateScale(14),
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: verticalScale(5),
    marginBottom: verticalScale(20),
    fontFamily: Fonts.Regular,
  },
  changeLocationButton: {
    backgroundColor: COLORS.DODGERBLUE,
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(8),
  },
  changeLocationText: {
    color: COLORS.white,
    fontSize: moderateScale(16),
    fontFamily: Fonts.Medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: verticalScale(50),
  },
  emptyText: {
    fontSize: moderateScale(16),
    color: COLORS.gray,
    fontFamily: Fonts.Medium,
  },
});
