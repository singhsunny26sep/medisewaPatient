import React from 'react';
import { View, TouchableOpacity, Image, Alert } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { PermissionsAndroid, Platform } from 'react-native';
import { COLORS } from '../Theme/Colors';

export default function ImageSelector({ imageUri, onImageChange, style }) {
  const options = {
    mediaType: 'photo',
    includeBase64: false,
    maxWidth: 300,
    maxHeight: 300,
    quality: 0.8,
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs camera permission to take pictures',
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
    } else {
      const status = await request(PERMISSIONS.IOS.CAMERA);
      return status === RESULTS.GRANTED;
    }
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Camera Permission', 'Camera permission is required to take a picture.');
      return;
    }

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        onImageChange(response.assets[0].uri);
      }
    });
  };

  const openGallery = () => {
    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        onImageChange(response.assets[0].uri);
      }
    });
  };

  const selectImage = () => {
    Alert.alert(
      'Select Image',
      'Choose an option to select your profile image',
      [
        {
          text: 'Camera',
          onPress: openCamera,
        },
        {
          text: 'Gallery',
          onPress: openGallery,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <TouchableOpacity onPress={selectImage}>
      <Image source={{ uri: imageUri || 'https://example.com/default-image.png' }} style={style} />
      <FontAwesome
        name="camera"
        size={24}
        color={COLORS.ARSENIC}
        style={{ position: 'absolute', bottom: 10, right: 10 }}
      />
    </TouchableOpacity>
  );
}
