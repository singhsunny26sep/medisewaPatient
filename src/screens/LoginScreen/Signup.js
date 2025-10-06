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
  Dimensions,
  KeyboardAvoidingView,
  Platform,
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
import LinearGradient from 'react-native-linear-gradient';

const {width, height} = Dimensions.get('window');

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

      const response = await Instance.post('api/v1/users/register', body);
      console.log('Response:', response.data);

      await AsyncStorage.setItem('userToken', response.data.token);
      await AsyncStorage.setItem('username', name); 
      setToastMessage('Registration successful');
      setToastType('success');   
      navigation.navigate('Login');
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
      statusBarStyle={'light-content'}
      statusBarBackgroundColor={COLORS.DODGERBLUE}
      backgroundColor={COLORS.white}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <LinearGradient
          colors={[COLORS.DODGERBLUE, '#4A90E2', '#7BB3F0']}
          style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Image
                source={{
                  uri: 'https://img.icons8.com/color/96/000000/medical-doctor.png',
                }}
                style={styles.logo}
              />
            </View>
            <Text style={styles.welcomeText}>Create Account</Text>
            <Text style={styles.subtitleText}>
              Join us to access comprehensive health services
            </Text>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <CustomTextInput
                label={strings.Name}
                placeholder={strings.EnterYourName}
                leftIcon="person-outline"
                value={name}
                onChangeText={text => {
                  setName(text);
                  setNameError('');
                }}
                error={nameError}
                containerStyle={styles.inputContainer}
              />
            </View>

            <View style={styles.inputWrapper}>
              <CustomTextInput
                label={strings.Email}
                placeholder={strings.EnterYourEmail}
                keyboardType="email-address"
                leftIcon="mail-outline"
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  setEmailError('');
                }}
                error={emailError}
                containerStyle={styles.inputContainer}
              />
            </View>

            <View style={styles.inputWrapper}>
              <CustomTextInput
                label={strings.Mobile}
                placeholder={strings.EnterYourMobile}
                keyboardType="phone-pad"
                leftIcon="call-outline"
                value={mobile}
                onChangeText={text => {
                  setMobile(text);
                  setMobileError('');
                }}
                error={mobileError}
                containerStyle={styles.inputContainer}
              />
            </View>

            <View style={styles.inputWrapper}>
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
                containerStyle={styles.inputContainer}
              />
            </View>

            <View style={styles.inputWrapper}>
              <CustomTextInput
                label={strings.Password}
                placeholder={strings.EnterYourPassword}
                secureTextEntry={true}
                leftIcon="lock-closed-outline"
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  setPasswordError('');
                }}
                error={passwordError}
                containerStyle={styles.inputContainer}
              />
            </View>

            <TouchableOpacity
              style={[styles.signupButton, loading && styles.signupButtonDisabled]}
              onPress={handleSignup}
              disabled={loading}>
              <LinearGradient
                colors={loading ? ['#ccc', '#ccc'] : [COLORS.DODGERBLUE, '#4A90E2']}
                style={styles.buttonGradient}>
                {loading ? (
                  <ActivityIndicator color={COLORS.white} size={'small'} />
                ) : (
                  <Text style={styles.signupButtonText}>{strings.Signup}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginButtonText}>
                Already have an account?{' '}
                <Text style={styles.loginLink}>{strings.Login}</Text>
              </Text>
            </TouchableOpacity>

            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By signing up, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {toastMessage && <ToastMessage type={toastType} message={toastMessage} />}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerGradient: {
    height: height * 0.35,
    borderBottomLeftRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
    elevation: 10,
    shadowColor: COLORS.DODGERBLUE,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  logoContainer: {
    width: scale(80),
    height: scale(80),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: moderateScale(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(20),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  logo: {
    width: scale(50),
    height: scale(50),
    tintColor: COLORS.white,
  },
  welcomeText: {
    fontSize: moderateScale(28),
    fontFamily: Fonts.Bold,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: verticalScale(8),
  },
  subtitleText: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Medium,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: verticalScale(30),
  },
  formContainer: {
    paddingHorizontal: scale(25),
    paddingTop: verticalScale(40),
  },
  inputWrapper: {
    marginBottom: verticalScale(5),
  },
  inputContainer: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(15),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  signupButton: {
    marginBottom: verticalScale(20),
    borderRadius: moderateScale(15),
    elevation: 5,
    shadowColor: COLORS.DODGERBLUE,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  signupButtonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(15),
    alignItems: 'center',
  },
  signupButtonText: {
    color: COLORS.white,
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(18),
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: verticalScale(25),
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: scale(15),
    fontSize: moderateScale(14),
    fontFamily: Fonts.Medium,
    color: '#666',
  },
  loginButton: {
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  loginButtonText: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Medium,
    color: '#333',
  },
  loginLink: {
    color: COLORS.DODGERBLUE,
    fontFamily: Fonts.Bold,
  },
  termsContainer: {
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  termsText: {
    fontSize: moderateScale(12),
    fontFamily: Fonts.Regular,
    color: '#666',
    textAlign: 'center',
    lineHeight: moderateScale(18),
  },
  termsLink: {
    color: COLORS.DODGERBLUE,
    fontFamily: Fonts.Medium,
  },
});
