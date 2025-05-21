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

const DEFAULT_IMAGE =
  'https://passion.healthcare/wp-content/uploads/2023/02/labimage.jpeg';
const DEFAULT_LOGO_IMAGE =
  'https://static.vecteezy.com/system/resources/previews/020/448/567/non_2x/laboratory-logo-design-template-free-vector.jpg';
const GOOGLE_API_KEY = 'AIzaSyDpTsiLmk-PYR3qTOLdwPqiJuE1ierFol8';

export default function HealthCheckUp({navigation}) {
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
      const permissionStatus = await check(
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      );

      if (permissionStatus === RESULTS.DENIED) {
        const requestResult = await request(
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        );

        if (requestResult !== RESULTS.GRANTED) {
          setError('Location permission not granted');
          setLocationName('');
          return;
        }
      } else if (permissionStatus !== RESULTS.GRANTED) {
        setError('Location permission not granted');
        setLocationName('');
        return;
      }

      const position = await new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        });
      });

      const {latitude, longitude} = position.coords;

      const response = await Instance.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`,
      );

      if (response.data.results.length > 0) {
        const location = extractCityStatePincode(
          response.data.results[0].address_components,
        );
        setLocationName(location);
        setError(null);
      } else {
        setError('Unable to fetch location name');
        setLocationName('');
      }
    } catch (err) {
      console.error('Error fetching location:', err);
      setError('Error fetching location');
      setLocationName('');
    } finally {
    }
  };

  useEffect(() => {
    fetchLocation();
    let isMounted = true;

    const fetchLabs = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const response = await Instance.get('/handle-view-labs', {
            headers: {
              Authorization: token,
            },
          });
          if (isMounted) {
            setLabs(response.data);
          }
        } else {
          setError('No token found');
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
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
    const location = extractCityStatePincode(details.address_components);
    setLocationModalVisible(false);
    setLocationName(location);

    const locationKeyword = location.split(',')[0];

    try {
      const requestUrl = `/location?search=${encodeURIComponent(
        locationKeyword,
      )}`;
      const response = await Instance.get(requestUrl);
      const locationLabs = response.data;

      if (locationLabs.length > 0) {
        setFilteredLabs(locationLabs);
        setNoServiceAvailable(false);
      } else {
        setFilteredLabs([]);
        setNoServiceAvailable(true);
      }
    } catch (error) {
      console.error('Error fetching labs for location:', error.message);
      setNoServiceAvailable(true);
    }
  };

  const renderLabItem = useCallback(
    ({item}) => {
      const imageUri =
        item.image && item.image.startsWith('http')
          ? item.image
          : DEFAULT_IMAGE;
      const logoImageUri =
        item.image && item.image.startsWith('http')
          ? item.image
          : DEFAULT_LOGO_IMAGE;

      return (
        <TouchableOpacity
          style={styles.labItem}
          onPress={() =>
            navigation.navigate('RecommendedLabDetails', {lab: item})
          }>
          <Image style={styles.imageStyle} source={{uri: imageUri}} />
          <View>
            <View style={styles.NameAddView}>
              <View style={styles.LogoView}>
                <Image
                  source={{uri: logoImageUri}}
                  style={styles.LogoImageStyle}
                />
              </View>
              <View style={styles.LabAddressView}>
                <Fontisto name="laboratory" size={18} color={COLORS.ARSENIC} />
                <Text style={styles.labName}>{item.name}</Text>
              </View>
              <View style={styles.LabAddressView}>
                <Icon name="location" size={18} color={COLORS.ARSENIC} />
                <Text
                  style={
                    styles.labAddress
                  }>{`${item.address.city}, ${item.address.state}`}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [navigation],
  );

  const keyExtractor = item => {
    return item.id ? item.id.toString() : item.name;
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.DODGERBLUE} barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.LocationView}
          onPress={() => setLocationModalVisible(true)}>
          <Text numberOfLines={1} style={styles.locationText}>
            {locationName}
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
        </View>
      ) : (
        <FlatList
          data={filteredLabs}
          renderItem={renderLabItem}
          keyExtractor={keyExtractor}
          ListEmptyComponent={
            noServiceAvailable ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No service available at this location.
                </Text>
              </View>
            ) : null
          }
        />
      )}
      <Modal
        visible={locationModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setLocationModalVisible(false)}>
        <View style={styles.modalContainer}>
          <GooglePlacesAutocomplete
            placeholder="Enter location"
            fetchDetails={true}
            onPress={handleLocationSelect}
            query={{
              key: GOOGLE_API_KEY,
              language: 'en',
            }}
            styles={styles.autocomplete}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setLocationModalVisible(false)}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
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
  },

  LogoView: {
    backgroundColor: COLORS.AntiFlashWhite,
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
    height: 70,
    width: 70,
    borderRadius: 70,
    overflow: 'hidden',
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
    fontWeight: 'bold',
    paddingLeft: scale(5),
  },
  LabAddressView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: verticalScale(2),
    paddingHorizontal: scale(15),
  },
  labAddress: {
    fontSize: moderateScale(14),
    fontWeight: 'bold',
    color: COLORS.ARSENIC,
    paddingLeft: scale(5),
    marginBottom: verticalScale(6),
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
});
