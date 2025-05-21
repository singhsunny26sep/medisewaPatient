import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Container} from '../../component/Container/Container';
import {COLORS} from '../../Theme/Colors';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
import {Fonts} from '../../Theme/Fonts';
import CustomTextInput from '../../component/texinput/CustomTextInput';
import {Instance} from '../../api/Instance';
import ToastMessage from '../../component/ToastMessage/ToastMessage';
import strings from '../../../localization';

export default function Login({navigation}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('');

  const handleLogin = async () => {
    let valid = true;

    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError(strings.EmailRequired);
      valid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      setEmailError(strings.InvalidEmail);
      valid = false;
    }

    if (!password) {
      setPasswordError(strings.PasswordRequired);
      valid = false;
    }

    if (!valid) return;

    setLoading(true);
    try {
      const response = await Instance.post('/api/v1/users/login', {
        email,
        password,
      });

      if (response.data?.success) {
        const token = response.data.token;
        await AsyncStorage.setItem('userToken', token);
        setToastMessage('Login successful');
        setToastType('success');
        navigation.navigate('MainStack');
      } else {
        setToastMessage(response.data?.msg || 'Login failed');
        setToastType('danger');
      }
    } catch (error) {
      console.log('Login error:', error);
      Alert.alert('Login Error', 'Something went wrong. Please try again.');
      setToastMessage('Something went wrong. Please try again.');
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
        <Text style={styles.headerText}>{strings.Login}</Text>
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
            label={strings.Email}
            placeholder={strings.EnterYourEmail}
            keyboardType="email-address"
            leftIcon="mail"
            value={email}
            onChangeText={text => {
              setEmail(text);
              if (text) setEmailError('');
            }}
            error={emailError}
          />
          <CustomTextInput
            label={strings.Password}
            placeholder={strings.EnterYourPassword}
            secureTextEntry={true}
            leftIcon="lock-closed"
            value={password}
            onChangeText={text => {
              setPassword(text);
              if (text) setPasswordError('');
            }}
            error={passwordError}
          />
        </View>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          {loading ? (
            <ActivityIndicator color={COLORS.white} size={'small'} />
          ) : (
            <Text style={styles.loginButtonText}>{strings.Login}</Text>
          )}
        </TouchableOpacity>
        <View style={styles.accountContainer}>
          <Text style={styles.accountText}>
          {strings.DontHaveAccount}{' '}
            <Text
              onPress={() => navigation.navigate('Signup')}
              style={{color: COLORS.DODGERBLUE}}>
              {strings.Signup}
            </Text>
          </Text>
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
// import React, {useState} from 'react';
// import {
//   View,
//   Text,
//   Image,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {Container} from '../../component/Container/Container';
// import {COLORS} from '../../Theme/Colors';
// import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
// import {Fonts} from '../../Theme/Fonts';
// import CustomTextInput from '../../component/texinput/CustomTextInput';
// import {Instance} from '../../api/Instance';
// import ToastMessage from '../../component/ToastMessage/ToastMessage';

// export default function Login({navigation}) {
//   const [mobile, setMobile] = useState('');
//   const [password, setPassword] = useState('');
//   const [mobileError, setMobileError] = useState('');
//   const [passwordError, setPasswordError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [toastMessage, setToastMessage] = useState('');
//   const [toastType, setToastType] = useState('');

//   const handleLogin = async () => {
//     let valid = true;

//     if (!mobile) {
//       setMobileError('Mobile number is required');
//       return;
//     } else if (!/^\d{10}$/.test(mobile)) {
//       setMobileError('Enter a valid 10-digit mobile number');
//       return;
//     }

//     if (!password) {
//       setPasswordError('Password is required');
//       valid = false;
//     }

//     if (!valid) return;

//     setLoading(true);
//     try {
//       const response = await Instance.post('/api/v1/users/login', {
//         email,
//         password,
//       });

//       if (response.data?.success) {
//         const token = response.data.token;
//         await AsyncStorage.setItem('userToken', token);
//         setToastMessage('Login successful');
//         setToastType('success');
//         navigation.navigate('MainStack');
//       } else {
//         setToastMessage(response.data?.msg || 'Login failed');
//         setToastType('danger');
//       }
//     } catch (error) {
//       console.log('Login error:', error);
//       Alert.alert('Login Error', 'Something went wrong. Please try again.');
//       setToastMessage('Something went wrong. Please try again.');
//       setToastType('danger');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRequestOTP = async () => {
//     try {
//       const response = await Instance.post('/api/v1/users/request/otp', {
//         mobile: mobile, // use the state directly
//       });

//       console.log('OTP Request Response:', response.data);

//       if (response.data?.success && response.data.result?.Details) {
//         const otpSessionId = response.data.result.Details;
//         navigation.navigate('MobileVerify', {
//           mobile: mobile,
//           sessionId: otpSessionId,
//         });
//       } else {
//         setToastMessage('Failed to request OTP');
//         setToastType('danger');
//       }
//     } catch (error) {
//       console.log('OTP Request Error:', error);
//       Alert.alert('OTP Error', 'Unable to send OTP. Please try again.');
//     }
//   };

//   return (
//     <Container
//       statusBarStyle={'dark-content'}
//       statusBarBackgroundColor={COLORS.white}
//       backgroundColor={COLORS.white}>
//       <View style={styles.headerContainer}>
//         <Text style={styles.headerText}>Login</Text>
//       </View>
//       <ScrollView>
//         <View>
//           <Image
//             source={{
//               uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHkBdRtOojX6ruqHKdVl4kGumxon9uO8V7PUlyo-IDVgEBDOZU7eKIqWzDr5Cd-Vicv_E&usqp=CAU',
//             }}
//             style={styles.image}
//           />
//         </View>
//         <View style={styles.inputContainer}>
//           <CustomTextInput
//             label="Mobile"
//             placeholder="Enter your Mobile"
//             keyboardType="phone-pad"
//             leftIcon="call-outline"
//             value={mobile}
//             onChangeText={text => {
//               setMobile(text);
//               if (text) setMobileError('');
//             }}
//             error={mobileError}
//           />
//         </View>
//         <TouchableOpacity style={styles.loginButton} onPress={handleRequestOTP}>
//           {loading ? (
//             <ActivityIndicator color={COLORS.white} size={'small'} />
//           ) : (
//             <Text style={styles.loginButtonText}>Login</Text>
//           )}
//         </TouchableOpacity>
//         <View style={styles.accountContainer}>
//           <Text style={styles.accountText}>
//             Don't have an account?{' '}
//             <Text
//               onPress={() => navigation.navigate('Signup')}
//               style={{color: COLORS.DODGERBLUE}}>
//               Sign Up
//             </Text>
//           </Text>
//         </View>
//       </ScrollView>
//       {toastMessage && <ToastMessage type={toastType} message={toastMessage} />}
//     </Container>
//   );
// }

// const styles = StyleSheet.create({
//   headerContainer: {
//     backgroundColor: COLORS.white,
//     elevation: 10,
//     paddingVertical: verticalScale(10),
//     borderBottomLeftRadius: moderateScale(15),
//     borderBottomRightRadius: moderateScale(15),
//   },
//   headerText: {
//     fontFamily: Fonts.Bold,
//     color: COLORS.black,
//     fontSize: moderateScale(18),
//     textAlign: 'center',
//   },
//   image: {
//     height: scale(120),
//     width: scale(120),
//     alignSelf: 'center',
//     marginTop: scale(15),
//   },
//   inputContainer: {
//     marginHorizontal: scale(15),
//     marginTop: scale(10),
//   },
//   loginButton: {
//     backgroundColor: COLORS.DODGERBLUE,
//     paddingVertical: verticalScale(12),
//     marginHorizontal: scale(15),
//     borderRadius: moderateScale(10),
//     marginTop: verticalScale(30),
//     alignItems: 'center',
//   },
//   loginButtonText: {
//     color: COLORS.white,
//     fontFamily: Fonts.Bold,
//     fontSize: moderateScale(16),
//   },
//   accountContainer: {
//     alignItems: 'flex-end',
//     marginHorizontal: scale(15),
//     marginTop: verticalScale(10),
//   },
//   accountText: {
//     fontSize: moderateScale(15),
//     color: COLORS.black,
//     fontFamily: Fonts.Medium,
//   },
// });
