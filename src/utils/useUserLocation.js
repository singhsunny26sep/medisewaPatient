import {useEffect, useState} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import GetLocation from 'react-native-get-location';
import { fetchAddress } from './locationHelper';

export const useUserLocation = () => {
  const [location, setLocation] = useState('');

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
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const fetchUserLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setLocation('Location permission denied');
        return;
      }
      const loc = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 30000,
      });
      const { latitude, longitude } = loc;
      const { city } = await fetchAddress(latitude, longitude);
      setLocation(city || 'Unknown location');
    } catch (error) {
      console.log('Location error:', error);
      setLocation('Unable to fetch location');
    }
  };

  useEffect(() => {
    fetchUserLocation();
  }, []);

  return location;
};