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
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Container} from '../../component/Container/Container';
import {COLORS} from '../../Theme/Colors';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
import {Fonts} from '../../Theme/Fonts';
import CustomTextInput from '../../component/texinput/CustomTextInput';
import {Instance} from '../../api/Instance';
import ToastMessage from '../../component/ToastMessage/ToastMessage';
import LinearGradient from 'react-native-linear-gradient';
import fcmService from '../../utils/fcmService';

const {width, height} = Dimensions.get('window');

export default function Login({navigation}) {
  const [mobile, setMobile] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('');

  const handleRequestOTP = async () => {
    if (!mobile) {
      setMobileError('Mobile number is required');
      return;
    } else if (!/^\d{10}$/.test(mobile)) {
      setMobileError('Enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      console.log('📱 Starting OTP request for mobile:', mobile);
      
      console.log('🔔 Getting FCM token from service...');
      const fcmToken = await fcmService.requestUserPermission();
      
      console.log('📡 Making OTP API call...');
      
      const requestPayload = {
        mobile: mobile,
        ...(fcmToken && { fcmToken: fcmToken })
      };

      console.log('📦 Request Payload:', JSON.stringify(requestPayload, null, 2));
      console.log('🎯 Using key name: fcmToken');

      const response = await Instance.post('api/v1/users/request/otp', requestPayload);

      console.log('✅ OTP Request Response:', JSON.stringify(response.data, null, 2));
      console.log('📊 Response Status:', response.status);
      
      if (fcmToken) {
        console.log('📲 FCM token successfully sent with key: fcmToken');
        console.log('💾 Stored FCM token available for future use:', fcmService.hasToken());
      } else {
        console.log('⚠️  FCM token not available');
      }

      if (response.data?.success && response.data.result?.Details) { 
        const otpSessionId = response.data.result.Details;
        console.log('🎯 OTP Session ID obtained:', otpSessionId);
        console.log('🚀 Navigating to MobileVerify screen...');
        
        navigation.navigate('MobileVerify', {
          mobile: mobile,
          sessionId: otpSessionId,    
          fcmToken: fcmToken 
        });
      } else {
        console.log('❌ OTP Request failed - Invalid response structure');
        setToastMessage('Failed to request OTP');
        setToastType('danger');
      }
    } catch (error) {
      console.log('❌ OTP Request Error:', error);
      
      if (error.response) {
        console.log('📋 Server Error Response:', JSON.stringify(error.response.data, null, 2));
        Alert.alert('OTP Error', error.response.data?.message || 'Unable to send OTP. Please try again.');
      } else if (error.request) {
        console.log('🌐 Network Error - No response received');
        Alert.alert('Network Error', 'Please check your internet connection and try again.');
      } else {
        console.log('⚡ Unexpected Error:', error.message);
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
      console.log('🏁 OTP request process completed');
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
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.subtitleText}>
              Sign in to access your health services
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
                label="Mobile Number"
                placeholder="Enter your 10-digit mobile number"
                keyboardType="phone-pad"
                leftIcon="call-outline"
                value={mobile}
                onChangeText={text => {
                  setMobile(text);
                  if (text) setMobileError('');
                }}
                error={mobileError}
                containerStyle={styles.inputContainer}
              />
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleRequestOTP}
              disabled={loading}>
              <LinearGradient
                colors={loading ? ['#ccc', '#ccc'] : [COLORS.DODGERBLUE, '#4A90E2']}
                style={styles.buttonGradient}>
                {loading ? (
                  <ActivityIndicator color={COLORS.white} size={'small'} />
                ) : (
                  <Text style={styles.loginButtonText}>Continue with OTP</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              style={styles.signupButton}
              onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupButtonText}>
                Don't have an account?{' '}
                <Text style={styles.signupLink}>Sign Up</Text>
              </Text>
            </TouchableOpacity>

            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By continuing, you agree to our{' '}
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
    marginBottom: verticalScale(25),
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
  loginButton: {
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
  loginButtonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(15),
    alignItems: 'center',
  },
  loginButtonText: {
    color: COLORS.white,
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(18),
  },
  forgotPasswordButton: {
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  forgotPasswordText: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Medium,
    color: COLORS.DODGERBLUE,
    textDecorationLine: 'underline',
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
  signupButton: {
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  signupButtonText: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Medium,
    color: '#333',
  },
  signupLink: {
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
