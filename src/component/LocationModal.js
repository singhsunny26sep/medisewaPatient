import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {COLORS} from '../Theme/Colors';
import {Fonts} from '../Theme/Fonts';
import {moderateScale, scale, verticalScale} from '../utils/Scaling';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import GetLocation from 'react-native-get-location';
import {fetchAddress} from '../utils/locationHelper';

const LocationModal = ({visible, onClose, onLocationSelect}) => {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app requires access to your location.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const handleCurrentLocationPress = async () => {
    setIsFetchingLocation(true);
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        console.log('Location permission denied');
        // Optionally, show an alert to the user
        return;
      }
      const loc = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 30000,
      });
      const {latitude, longitude} = loc;
      const {city} = await fetchAddress(latitude, longitude);
      if (city) {
        onLocationSelect(city);
        onClose();
      } else {
        console.log('Could not fetch location name');
      }
    } catch (error) {
      console.log('Location error:', error);
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const searchLocation = async text => {
    if (text.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${text}&apiKey=ba8be00cd4e54ab090e624dda83f9da3`,
      );
      setSearchResults(response.data.features || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = text => {
    setSearchText(text);
    searchLocation(text);
  };

  const handleLocationSelect = location => {
    onLocationSelect(location.properties.formatted);
    onClose();
  };

  const renderLocationItem = ({item}) => (
    <Pressable
      style={styles.locationItem}
      onPress={() => handleLocationSelect(item)}>
      <View style={styles.locationItemContent}>
        <MaterialIcons
          name="location-on"
          size={22}
          color={COLORS.DODGERBLUE}
          style={styles.locationIcon}
        />
        <View style={styles.locationTextContainer}>
          <Text style={styles.locationItemText}>
            {item.properties.formatted}
          </Text>
          {item.properties.city && (
            <Text style={styles.locationItemSubtext}>
              {item.properties.city}, {item.properties.country}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Set Delivery Location</Text>
            <Pressable onPress={onClose}>
              <AntDesign name="closecircleo" size={25} color={COLORS.black} />
            </Pressable>
          </View>

          <View style={styles.inputWrapper}>
            <Feather
              name="search"
              size={20}
              color={COLORS.gray}
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="Search for area, street name..."
              placeholderTextColor={COLORS.gray}
              style={styles.textInput}
              value={searchText}
              onChangeText={handleSearch}
            />
          </View>
          <Pressable
            style={styles.locationRow}
            onPress={handleCurrentLocationPress}
            disabled={isFetchingLocation}>
            <MaterialIcons name="my-location" size={25} color={COLORS.black} />
            <View style={styles.locationTextWrapper}>
              <Text style={styles.locationTitle}>Current Location</Text>
              {isFetchingLocation ? (
                <Text style={styles.locationSubtitle}>Fetching...</Text>
              ) : (
                <Text style={styles.locationSubtitle}>Using GPS</Text>
              )}
            </View>
          </Pressable>
          {loading ? (
            <Text style={styles.loadingText}>Searching...</Text>
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderLocationItem}
              keyExtractor={item => item.properties.place_id}
              style={styles.resultsList}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderTopRightRadius: moderateScale(20),
    borderTopLeftRadius: moderateScale(20),
    paddingBottom: verticalScale(20),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: scale(15),
    marginVertical: verticalScale(15),
  },
  headerText: {
    color: COLORS.black,
    fontFamily: Fonts.Light,
    fontSize: moderateScale(15),
    top: 3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray || '#f2f2f2',
    marginHorizontal: scale(15),
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(3),
    marginTop: verticalScale(5),
  },
  inputIcon: {
    marginRight: scale(8),
  },
  textInput: {
    flex: 1,
    fontSize: moderateScale(14),
    fontFamily: Fonts.Regular,
    color: COLORS.black,
    top:2
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(20),
    marginHorizontal: scale(15),
  },
  locationTextWrapper: {
    marginLeft: scale(10),
  },
  locationTitle: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Medium,
    color: COLORS.black,
  },
  locationSubtitle: {
    fontSize: moderateScale(12),
    fontFamily: Fonts.Light,
    color: COLORS.gray,
  },
  resultsList: {
    maxHeight: verticalScale(300),
    marginTop: verticalScale(10),
  },
  locationItem: {
    padding: scale(15),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    backgroundColor: COLORS.white,
  },
  locationItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    marginRight: scale(12),
  },
  locationTextContainer: {
    flex: 1,
  },
  locationItemText: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Medium,
    color: COLORS.black,
    marginBottom: verticalScale(2),
  },
  locationItemSubtext: {
    fontSize: moderateScale(12),
    fontFamily: Fonts.Regular,
    color: COLORS.gray,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: verticalScale(10),
    color: COLORS.gray,
    fontFamily: Fonts.Regular,
  },
});

export default LocationModal;
