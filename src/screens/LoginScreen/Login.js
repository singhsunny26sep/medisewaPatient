import React, { useState } from 'react';
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
import { COLORS } from '../../Theme/Colors';
import { moderateScale, scale, verticalScale } from '../../utils/Scaling';
import { Fonts } from '../../Theme/Fonts';
import CustomTextInput from '../../component/texinput/CustomTextInput';
import { Instance } from '../../api/Instance';
import ToastMessage from '../../component/ToastMessage/ToastMessage';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import fcmService from '../../utils/fcmService';

const { width, height } = Dimensions.get('window');

export default function Login({ navigation }) {
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
      const fcmToken = await fcmService.requestUserPermission();
      
      const requestPayload = {
        mobile: mobile,
        ...(fcmToken && { fcmToken: fcmToken })
      };

      const response = await Instance.post('api/v1/users/request/otp', requestPayload);

      if (response.data?.success && response.data.result?.Details) {
        const otpSessionId = response.data.result.Details;
        navigation.navigate('MobileVerify', {
          mobile: mobile,
          sessionId: otpSessionId,
          fcmToken: fcmToken,
             role: "patient",
        });
      } else {
        setToastMessage('Failed to request OTP');
        setToastType('danger');
      }
    } catch (error) {
      if (error.response) {
        Alert.alert('OTP Error', error.response.data?.message || 'Unable to send OTP. Please try again.');
      } else if (error.request) {
        Alert.alert('Network Error', 'Please check your internet connection and try again.');
      } else {
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoWrapper}>
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.logoGradient}
              >
                <Ionicons name="medkit-outline" size={50} color="#FFF" />
              </LinearGradient>
            </View>
            <Text style={styles.appName}>MediSeva</Text>
            <Text style={styles.tagline}>Your Health, Our Priority</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.subtitleText}>
              Sign in to continue to your account
            </Text>

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
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={loading ? ['#9CA3AF', '#9CA3AF'] : ['#3B82F6', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>Continue with OTP</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => navigation.navigate('ForgotPassword')}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              style={styles.signupButton}
              onPress={() => navigation.navigate('Signup')}
              activeOpacity={0.7}
            >
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: verticalScale(40),
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  logoWrapper: {
    marginBottom: 16,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#6B7280',
  },
  formSection: {
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(20),
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 32,
  },
  inputWrapper: {
    marginBottom: verticalScale(24),
  },
  inputContainer: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  loginButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: verticalScale(16),
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(16),
    gap: 10,
  },
  loginButtonText: {
    color: '#FFF',
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(16),
  },
  forgotPasswordButton: {
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  forgotPasswordText: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Medium,
    color: '#3B82F6',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: verticalScale(24),
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: scale(15),
    fontSize: moderateScale(14),
    fontFamily: Fonts.Medium,
    color: '#9CA3AF',
  },
  signupButton: {
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  signupButtonText: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Medium,
    color: '#374151',
  },
  signupLink: {
    color: '#3B82F6',
    fontFamily: Fonts.Bold,
  },
  termsContainer: {
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  termsText: {
    fontSize: moderateScale(12),
    fontFamily: Fonts.Regular,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: moderateScale(18),
  },
  termsLink: {
    color: '#3B82F6',
    fontFamily: Fonts.Medium,
  },
});