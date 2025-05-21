// import React, {useState} from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TextInput,
//   TouchableOpacity,
//   ImageBackground,
//   Alert,
//   ActivityIndicator,
// } from 'react-native';
// import {COLORS} from '../../Theme/Colors';
// import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
// import {Instance} from '../../api/Instance';
// import Icon from 'react-native-vector-icons/Ionicons';
// import {StatusBar} from 'react-native';

// export default function Login({navigation}) {
//   const [emailError, setEmailError] = useState('');
//   const [nameError, setNameError] = useState('');
//   const [mobileError, setMobileError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const [loginData, setLoginData] = useState({
//     name: '',
//     email: '',
//     mobile: '+91',
//   });

//   const handleMutualPost = async () => {
//     if (validateFields()) {
//       setLoading(true);
//       try {
//         const res = await Instance.post('/login', loginData);
//         if (res?.data) {
//           navigation.navigate('UserVerify', {email: loginData.email});
//         }
//       } catch (error) {
//         console.log(error);
//         Alert.alert('Error', 'Failed to submit information. Please try again.');
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   const validateFields = () => {
//     let isValid = true;

//     if (!loginData.email.trim()) {
//       setEmailError('Email is required');
//       isValid = false;
//     } else if (
//       !/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(loginData.email)
//     ) {
//       setEmailError('Invalid email format');
//       isValid = false;
//     } else {
//       setEmailError('');
//     }

//     if (!loginData.name.trim()) {
//       setNameError('Name is required');
//       isValid = false;
//     } else {
//       setNameError('');
//     }

//     const mobileWithoutPrefix = loginData.mobile.slice(3);
//     if (
//       !loginData.mobile.trim() ||
//       mobileWithoutPrefix.length !== 10 ||
//       !loginData.mobile.startsWith('+91')
//     ) {
//       setMobileError('Mobile number must be 10 digits and start with +91');
//       isValid = false;
//     } else {
//       setMobileError('');
//     }

//     return isValid;
//   };

//   const handleInputChange = (field, value) => {
//     setLoginData(prevState => ({
//       ...prevState,
//       [field]: value,
//     }));

//     if (field === 'name') {
//       if (value.trim()) setNameError('');
//     }

//     if (field === 'email') {
//       if (value.trim()) setEmailError('');
//     }

//     if (field === 'mobile') {
//       const mobileWithoutPrefix = value.slice(3);
//       if (value.startsWith('+91') && mobileWithoutPrefix.length <= 10) {
//         setMobileError('');
//       }
//     }
//   };

//   return (
//     <ImageBackground
//       style={styles.backgroundImage}
//       source={require('../../assets/Health.jpg')}>
//       <StatusBar backgroundColor={COLORS.white} barStyle="light-content" />
//       <View style={styles.overlay}>
//         <View style={styles.container}>
//           <Text style={styles.title}>Login</Text>
//           <View style={styles.inputContainer}>
//             <Icon
//               name="person-outline"
//               size={20}
//               color={COLORS.white}
//               style={styles.icon}
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="Name"
//               placeholderTextColor={COLORS.white}
//               value={loginData.name}
//               onChangeText={value => handleInputChange('name', value)}
//             />
//           </View>
//           {nameError ? (
//             <View style={styles.errorContainer}>
//               <Text style={styles.errorText}>{nameError}</Text>
//             </View>
//           ) : null}
//           <View style={styles.inputContainer}>
//             <Icon
//               name="mail-outline"
//               size={20}
//               color={COLORS.white}
//               style={styles.icon}
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="Email"
//               placeholderTextColor={COLORS.white}
//               keyboardType="email-address"
//               autoCapitalize="none"
//               value={loginData.email}
//               onChangeText={value => handleInputChange('email', value)}
//             />
//           </View>
//           {emailError ? (
//             <View style={styles.errorContainer}>
//               <Text style={styles.errorText}>{emailError}</Text>
//             </View>
//           ) : null}
//           <View style={styles.inputContainer}>
//             <Icon
//               name="call-outline"
//               size={20}
//               color={COLORS.white}
//               style={styles.icon}
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="Mobile"
//               keyboardType="phone-pad"
//               placeholderTextColor={COLORS.white}
//               value={loginData.mobile}
//               maxLength={13}
//               onChangeText={value => handleInputChange('mobile', value)}
//             />
//           </View>
//           {mobileError ? (
//             <View style={styles.errorContainer}>
//               <Text style={styles.errorText}>{mobileError}</Text>
//             </View>
//           ) : null}
//           <TouchableOpacity
//             style={styles.button}
//             onPress={() =>
//               navigation.navigate('UserVerify', {email: loginData.email})
//             }>
//             {loading ? (
//               <ActivityIndicator size="small" color={COLORS.white} />
//             ) : (
//               <Text style={styles.buttonText}>Login</Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       </View>
//     </ImageBackground>
//   );
// }

// const styles = StyleSheet.create({
//   backgroundImage: {
//     flex: 1,
//     resizeMode: 'cover',
//   },
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   container: {
//     width: '90%',
//     paddingVertical: verticalScale(30),
//     backgroundColor: 'rgba(255, 255, 255, 0.15)',
//     borderRadius: moderateScale(15),
//     padding: scale(20),
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: moderateScale(24),
//     fontWeight: 'bold',
//     color: COLORS.white,
//     marginBottom: verticalScale(20),
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: moderateScale(1),
//     borderColor: COLORS.white,
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//     borderRadius: moderateScale(8),
//     paddingHorizontal: scale(10),
//     marginBottom: verticalScale(10),
//   },
//   input: {
//     flex: 1,
//     height: verticalScale(50),
//     color: COLORS.white,
//     fontSize: moderateScale(17),
//   },
//   icon: {
//     marginRight: scale(10),
//   },
//   button: {
//     width: '100%',
//     height: verticalScale(50),
//     backgroundColor: COLORS.DODGERBLUE,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: moderateScale(8),
//     marginTop: verticalScale(20),
//     elevation: 3,
//   },
//   buttonText: {
//     color: COLORS.white,
//     fontSize: moderateScale(18),
//     fontWeight: 'bold',
//   },
//   errorText: {
//     fontWeight: '600',
//     color: COLORS.red,
//   },
//   errorContainer: {
//     width: '100%',
//     alignItems: 'flex-start',
//     paddingHorizontal: scale(5),
//     bottom: scale(5),
//     marginBottom: scale(5),
//   },
// });

// import React, {useState} from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TextInput,
//   TouchableOpacity,
//   ImageBackground,
//   Alert,
//   ActivityIndicator,
// } from 'react-native';
// import {COLORS} from '../../Theme/Colors';
// import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
// import Icon from 'react-native-vector-icons/Ionicons';
// import {StatusBar} from 'react-native';
// import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
// import { Fonts } from '../../Theme/Fonts';

// export default function Login({navigation}) {
//   const [loginData, setLoginData] = useState({
//     name: '',
//     email: '',
//     mobile: '+91',
//   });

//   const handleLoginPress = () => {
//     navigation.navigate('UserVerify', {email: loginData.email});
//   };

//   const handleInputChange = (field, value) => {
//     setLoginData(prevState => ({
//       ...prevState,
//       [field]: value,
//     }));
//   };

//   return (
//     <ImageBackground
//       style={styles.backgroundImage}
//       source={require('../../assets/Health.jpg')}>
//       <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
//       <View style={styles.overlay}>
//         <View style={styles.container}>
//           <Text style={styles.title}>Login</Text>
//           <View style={styles.inputContainer}>
//             <Icon
//               name="person-outline"
//               size={20}
//               color={COLORS.white}
//               style={styles.icon}
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="Name"
//               placeholderTextColor={COLORS.white}
//               value={loginData.name}
//               onChangeText={value => handleInputChange('name', value)}
//             />
//           </View>
//           <View style={styles.inputContainer}>
//             <Icon
//               name="mail-outline"
//               size={20}
//               color={COLORS.white}
//               style={styles.icon}
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="Email"
//               placeholderTextColor={COLORS.white}
//               keyboardType="email-address"
//               autoCapitalize="none"
//               value={loginData.email}
//               onChangeText={value => handleInputChange('email', value)}
//             />
//           </View>
//           <View style={styles.inputContainer}>
//             <Icon
//               name="call-outline"
//               size={20}
//               color={COLORS.white}
//               style={styles.icon}
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="Mobile"
//               keyboardType="phone-pad"
//               placeholderTextColor={COLORS.white}
//               value={loginData.mobile}
//               maxLength={13}
//               onChangeText={value => handleInputChange('mobile', value)}
//             />
//           </View>
//           <View style={styles.inputContainer}>
//             <FontAwesome5
//               name="key"
//               size={20}
//               color={COLORS.white}
//               style={styles.icon}
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="Password"
//               placeholderTextColor={COLORS.white}
//             />
//           </View>

//           <TouchableOpacity style={styles.button} onPress={handleLoginPress}>
//             <Text style={styles.buttonText}>Login</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </ImageBackground>
//   );
// }

// const styles = StyleSheet.create({
//   backgroundImage: {
//     flex: 1,
//     resizeMode: 'cover',
//   },
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   container: {
//     width: '90%',
//     paddingVertical: verticalScale(30),
//     backgroundColor: 'rgba(255, 255, 255, 0.15)',
//     borderRadius: moderateScale(15),
//     padding: scale(20),
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: moderateScale(24),
//     fontFamily:Fonts.Bold,
//     color: COLORS.white,
//     marginBottom: verticalScale(20),
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: moderateScale(1),
//     borderColor: COLORS.white,
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//     borderRadius: moderateScale(8),
//     paddingHorizontal: scale(10),
//     marginBottom: verticalScale(10),
//   },
//   input: {
//     flex: 1,
//     height: verticalScale(50),
//     color: COLORS.white,
//     fontSize: moderateScale(17),
//     fontFamily:Fonts.Medium
//   },
//   icon: {
//     marginRight: scale(10),
//   },
//   button: {
//     width: '100%',
//     height: verticalScale(50),
//     backgroundColor: COLORS.DODGERBLUE,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: moderateScale(8),
//     marginTop: verticalScale(20),
//     elevation: 3,
//   },
//   buttonText: {
//     color: COLORS.white,
//     fontSize: moderateScale(18),
//     fontFamily: Fonts.Bold,
//   },
// });
import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {Container} from '../../component/Container/Container';
import {COLORS} from '../../Theme/Colors';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
import {Fonts} from '../../Theme/Fonts';
import CustomTextInput from '../../component/texinput/CustomTextInput';
import {Instance} from '../../api/Instance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ToastMessage from '../../component/ToastMessage/ToastMessage';
import strings from '../../../localization';

export default function Signup({navigation}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [addressError, setAddressError] = useState('');

  const handleSignup = async () => {
    setNameError('');
    setEmailError('');
    setMobileError('');
    setPasswordError('');
    setAddressError('');

    let valid = true;

    if (!name) {
      setNameError(strings.NameRequired);
      valid = false;
    }

    if (!email) {
      setEmailError(strings.EmailRequired);
      valid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      setEmailError(strings.InvalidEmail);
      valid = false;
    }

    if (!mobile) {
      setMobileError(strings.MobileRequired);
      valid = false;
    } else if (mobile.length < 10) {
      setMobileError(strings.MobileInvalid);
      valid = false;
    }

    if (!address) {
      setAddressError(strings.AddressRequired);
      valid = false;
    }

    if (!password) {
      setPasswordError(strings.PasswordRequired);
      valid = false;
    }

    if (!valid) return;

    setLoading(true);
    try {
      const body = {
        name,
        email,
        mobile,
        password,
        address,
        role: 'patient',
        image: '',
      };

      const response = await Instance.post('/api/v1/users/register', body);
      console.log('Response:', response.data);

      await AsyncStorage.setItem('userToken', response.data.token);
      await AsyncStorage.setItem('username', name); 
      setToastMessage('Registration successful');
      setToastType('success');
      navigation.navigate('MainStack');
    } catch (error) {

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
      backgroundColor={COLORS.white}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{strings.Signup}</Text>
      </View>
      <ScrollView>
        <View>
          <Image
            source={{
              uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHkBdRtOojX6ruqHKdVl4kGumxon9uO8V7PUlyo-IDVgEBDOZU7eKIqWzDr5Cd-Vicv_E&usqp=CAU',
            }}
            style={styles.image}
          />
        </View>
        <View style={styles.inputContainer}>
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
          <CustomTextInput
            label={strings.Address}
            placeholder={strings.EnterYourAddress}
            leftIcon="location-outline"
            value={address}
            onChangeText={text => {
              setAddress(text);
              setAddressError('');
            }}
            error={addressError}
          />
          <CustomTextInput
            label={strings.Password}
            placeholder={strings.EnterYourPassword}
            secureTextEntry={true}
            leftIcon="lock-closed"
            value={password}
            onChangeText={text => {
              setPassword(text);
              setPasswordError('');
            }}
            error={passwordError}
          />
        </View>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleSignup}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator size='small' color={COLORS.white} />
          ) : (
            <Text style={styles.loginButtonText}>{strings.Signup}</Text>
          )}
        </TouchableOpacity>
        <View style={styles.accountContainer}>
          <TouchableOpacity>
            <Text style={styles.accountText}>
              {strings.AlreadyHaveAccount}{' '} 
              <Text
                onPress={() => navigation.navigate('Login')}
                style={{color: COLORS.DODGERBLUE}}>
                {strings.Login}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {toastMessage && <ToastMessage type={toastType} message={toastMessage} />}
    </Container>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: COLORS.white,
    elevation: 10,
    paddingVertical: verticalScale(10),
    borderBottomLeftRadius: moderateScale(15),
    borderBottomRightRadius: moderateScale(15),
  },
  headerText: {
    fontFamily: Fonts.Bold,
    color: COLORS.black,
    fontSize: moderateScale(18),
    textAlign: 'center',
  },
  image: {
    height: scale(120),
    width: scale(120),
    alignSelf: 'center',
    marginTop: scale(15),
  },
  inputContainer: {
    marginHorizontal: scale(15),
    marginTop: scale(10),
  },
  loginButton: {
    backgroundColor: COLORS.DODGERBLUE,
    paddingVertical: verticalScale(12),
    marginHorizontal: scale(15),
    borderRadius: moderateScale(10),
    marginTop: verticalScale(30),
    alignItems: 'center',
  },
  loginButtonText: {
    color: COLORS.white,
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(16),
  },
  accountContainer: {
    alignItems: 'flex-end',
    marginHorizontal: scale(15),
    marginTop: verticalScale(10),
  },
  accountText: {
    fontSize: moderateScale(15),
    color: COLORS.black,
    fontFamily: Fonts.Medium,
  },
});
