import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {Container} from '../../component/Container/Container';
import {COLORS} from '../../Theme/Colors';
import {moderateScale, scale} from '../../utils/Scaling';
import {launchImageLibrary} from 'react-native-image-picker';
import AntDesign from 'react-native-vector-icons/AntDesign';
import CustomTextInput from '../../component/texinput/CustomTextInput';
import CustomHeader from '../../component/header/CustomHeader';
import {Instance} from '../../api/Instance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ToastMessage from '../../component/ToastMessage/ToastMessage';
import {Fonts} from '../../Theme/Fonts';
import strings from '../../../localization';

export default function EditProfile({navigation}) {
  const [profileImage, setProfileImage] = useState(
    'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
  );

  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [mobileError, setMobileError] = useState('');

  const openGallery = async () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, async response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets[0]) {
        const image = response.assets[0];
        setProfileImage(image.uri);

        const formData = new FormData();
        formData.append('image', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.fileName || `profile_${Date.now()}.jpg`,
        });

        try {
          const token = await AsyncStorage.getItem('userToken');
          if (!token) {
            console.log('No token found!');
            return;
          }

          const res = await Instance.put(
            '/api/v1/users/image/update/profile',
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
            },
          );
          setToastMessage('Profile image updated successfully');
          setToastType('success');
        } catch (error) {
          console.error(
            'Image upload error:',
            error.response?.data || error.message,
          );
          setToastMessage('Failed to update profile image');
          setToastType('danger');
        }
      }
    });
  };

  const handleProfileUpdate = async () => {
    setNameError('');
    setEmailError('');
    setMobileError('');

    let valid = true;

    if (!name) {
      setNameError('Name is required');
      valid = false;
    }

    if (!email) {
      setEmailError('Email is required');
      valid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      setEmailError('Invalid email format');
      valid = false;
    }

    if (!mobile) {
      setMobileError('Mobile number is required');
      valid = false;
    } else if (mobile.length < 10) {
      setMobileError('Mobile number must be 10 digits');
      valid = false;
    }

    if (!valid) return;

    setLoading(true);

    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      console.log('No token found!');
      return;
    }

    try {
      const body = {
        name,
        email,
        mobile,
      };

      const response = await Instance.put('api/v1/users/profile', body, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Response:', response.data);

      setToastMessage('Profile updated successfully');
      setToastType('success');
      navigation.goBack();
    } catch (error) {
      console.error('Error during profile update:', error);
      const errorMessage = error.response?.data?.msg || 'Something went wrong';
      setToastMessage(errorMessage);
      setToastType('danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      statusBarStyle={'dark-content'}
      statusBarBackgroundColor={COLORS.white}
      backgroundColor={COLORS.background}>
      <CustomHeader title={strings.EditProfile} navigation={navigation} />
      <ScrollView>
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image source={{uri: profileImage}} style={styles.profileImage} />
          </View>
          <TouchableOpacity
            style={styles.editIconContainer}
            onPress={openGallery}>
            <AntDesign name="edit" color={COLORS.white} size={20} />
          </TouchableOpacity>
        </View>
        <View style={{marginHorizontal: scale(15)}}>
          <CustomTextInput
            label={strings.Name}
            placeholder={strings.EnterYourName}
            leftIcon="person"
            value={name}
            onChangeText={text => {
              setName(text);
              setNameError('');
            }}
            error={nameError}
          />
          <CustomTextInput
            label={strings.Email}
            placeholder={strings.EnterYourEmail}
            keyboardType="email-address"
            leftIcon="mail"
            value={email}
            onChangeText={text => {
              setEmail(text);
              setEmailError('');
            }}
            error={emailError}
          />
          <CustomTextInput
            label={strings.Mobile}
            placeholder={strings.EnterYourMobile}
            keyboardType="phone-pad"
            leftIcon="call"
            value={mobile}
            onChangeText={text => {
              setMobile(text);
              setMobileError('');
            }}
            error={mobileError}
          />
        </View>
        <View>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleProfileUpdate}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>{strings.Submit}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      {toastMessage && <ToastMessage type={toastType} message={toastMessage} />}
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    elevation: 5,
    paddingHorizontal: scale(10),
    paddingVertical: scale(15),
  },
  headerText: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: COLORS.black,
    marginLeft: scale(10),
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: scale(30),
    marginTop: scale(20),
  },
  profileImageContainer: {
    position: 'relative',
    width: scale(85),
    height: scale(85),
    borderRadius: scale(60),
    overflow: 'hidden',
  },
  profileImage: {
    width: scale(85),
    height: scale(85),
    borderRadius: scale(60),
    backgroundColor: '#E0E0E0',
  },
  editIconContainer: {
    right: -scale(27),
    bottom: -scale(-35),
    backgroundColor: COLORS.DODGERBLUE,
    padding: scale(8),
    borderRadius: scale(30),
    borderColor: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: COLORS.DODGERBLUE,
    paddingVertical: scale(12),
    paddingHorizontal: scale(20),
    borderRadius: scale(5),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: scale(20),
    marginHorizontal: scale(15),
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: moderateScale(16),
    fontFamily: Fonts.Medium,
  },
});
