import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {COLORS} from '../../Theme/Colors';
import {Fonts} from '../../Theme/Fonts';
import {OtpInput} from 'react-native-otp-entry';
import {Instance} from '../../api/Instance';
import {scale, moderateScale, verticalScale} from '../../utils/Scaling';
import LinearGradient from 'react-native-linear-gradient';

const {width, height} = Dimensions.get('window');

export default function ForgotPassword({navigation}) {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [timer, setTimer] = useState(180);
  const [canResend, setCanResend] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const otpInputRef = useRef(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Auto focus OTP input after animation when step 2
    if (step === 2) {
      const timer = setTimeout(() => {
        if (otpInputRef.current) {
          otpInputRef.current.focus();
        }
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    if (step === 2) {
      const interval = setInterval(() => {
        setTimer(prevTimer => {
          if (prevTimer <= 1) {
            setCanResend(true);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [step]);

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const requestOTP = async () => {
    try {
      const requestData = {
        mobile: mobile,
      };

      console.log('Request OTP Data:', requestData);

      const response = await Instance.post(
        `api/v1/users/request/otp`,
        requestData,
      );

      const data = response.data;
      console.log('Request OTP Response:', data);

      if (data.success) {
        setSessionId(data.result.Details);
        console.log('Session ID stored:', data.result.Details);
        setStep(2);
        setTimer(180);
        setCanResend(false);
      } else {
        Alert.alert(
          'Error',
          data.message || 'Failed to send OTP. Please try again.',
        );
      }
    } catch (error) {
      console.error('Error requesting OTP:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      if (error.response?.status === 500) {
        Alert.alert(
          'Server Error',
          'There was a server error. Please try again later or contact support.',
        );
      } else if (error.response?.data?.message) {
        Alert.alert('Error', error.response.data.message);
      } else {
        Alert.alert('Error', 'Network error. Please check your connection.');
      }
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    try {
      const response = await Instance.post('/api/v1/users/request/otp', {
        mobile: mobile,
      });
      if (response.data?.success && response.data.result?.Details) {
        setSessionId(response.data.result.Details);
        setTimer(180);
        setCanResend(false);
        setOtp('');
        Alert.alert('Success', 'OTP has been resent to your mobile number.');
      } else {
        Alert.alert('Error', 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      console.log('Resend OTP Error:', error);
      Alert.alert('Error', 'Unable to resend OTP. Please try again.');
    }
  };

  const resetPassword = async () => {
    try {
      const otpString = Array.isArray(otp) ? otp.join('') : otp;

      const requestData = {
        sessionId: sessionId,
        otp: otpString,
        mobile: mobile,
        fcmToken: '',
        password: newPassword,
      };

      console.log('Reset Password Request Data:', requestData);

      const response = await Instance.post(
        `api/v1/users/forgot/password`,
        requestData,
      );

      const data = response.data;
      console.log('Reset Password Response:', data);

      if (data.success) {
        Alert.alert('Success', 'Password updated successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]);
      } else {
        Alert.alert(
          'Error',
          data.message ||
            'Failed to update password. Please check your OTP and try again.',
        );
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      if (error.response?.status === 500) {
        Alert.alert(
          'Server Error',
          'There was a server error. Please try again later or contact support.',
        );
      } else if (error.response?.data?.message) {
        Alert.alert('Error', error.response.data.message);
      } else {
        Alert.alert('Error', 'Network error. Please check your connection.');
      }
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      if (mobile && mobile.length >= 10) {
        setLoading(true);
        await requestOTP();
        setLoading(false);
      } else {
        Alert.alert('Error', 'Please enter a valid mobile number.');
      }
    } else if (step === 2) {
      if (otp && otp.length === 6) {
        setLoading(true);
        setStep(3);
        setLoading(false);
      } else {
        Alert.alert('Error', 'Please enter a valid 6-digit OTP.');
      }
    } else if (step === 3) {
      if (newPassword && newPassword.length >= 6) {
        setLoading(true);
        await resetPassword();
        setLoading(false);
      } else {
        Alert.alert('Error', 'Password must be at least 6 characters long.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.DODGERBLUE, '#4A90E2', '#7BB3F0']}
        style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Image
              source={{
                uri: 'https://static.vecteezy.com/system/resources/previews/004/112/232/non_2x/forgot-password-and-account-login-for-web-page-protection-security-key-access-system-in-smartphone-or-computer-flat-illustration-vector.jpg',
              }}
              style={styles.logo}
            />
          </View>
          <Text style={styles.title}>
            {step === 1
              ? 'Forgot Password'
              : step === 2
              ? 'Enter OTP'
              : 'Update Password'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 1
              ? 'Enter your mobile number to receive OTP'
              : step === 2
              ? `We've sent a 6-digit code to ${mobile}`
              : 'Enter your new password'}
          </Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <Animated.View style={[styles.contentContainer, {opacity: fadeAnim}]}>
            {step === 1 && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Mobile No</Text>
                  <TextInput
                    placeholder="Enter your mobile no"
                    value={mobile}
                    onChangeText={setMobile}
                    keyboardType="number-pad"
                    style={styles.textInput}
                  />
                </View>
              </>
            )}

            {step === 2 && (
              <>
                <View style={styles.otpContainer}>
                  <Text style={styles.otpLabel}>Enter OTP</Text>
                  <View style={styles.otpInputContainer}>
                    <OtpInput
                      ref={otpInputRef}
                      numberOfDigits={6}
                      onTextChange={text => setOtp(text)}
                      value={otp}
                      focusColor={COLORS.DODGERBLUE}
                      autoFocus={true}
                      keyboardType="number-pad"
                      clearInputs={false}
                      theme={{
                        containerStyle: styles.otpThemeContainer,
                        pinCodeContainerStyle: styles.pinCodeContainer,
                        pinCodeTextStyle: styles.pinCodeText,
                        focusStickStyle: styles.focusStick,
                        focusedPinCodeContainerStyle:
                          styles.focusedPinCodeContainer,
                      }}
                    />
                  </View>
                </View>

                <View style={styles.timerContainer}>
                  <Text style={styles.timerText}>
                    OTP expires in{' '}
                    <Text style={styles.timerValue}>{formatTime(timer)}</Text>
                  </Text>
                </View>

                <View style={styles.resendContainer}>
                  <Text style={styles.resendText}>
                    Didn't receive the OTP?{' '}
                  </Text>
                  <TouchableOpacity
                    onPress={handleResendOTP}
                    disabled={!canResend}
                    style={[
                      styles.resendButton,
                      !canResend && styles.resendButtonDisabled,
                    ]}>
                    <Text
                      style={[
                        styles.resendButtonText,
                        !canResend && styles.resendButtonTextDisabled,
                      ]}>
                      Resend OTP
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {step === 3 && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>New Password</Text>
                  <TextInput
                    placeholder="Enter new password"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={true}
                    style={styles.textInput}
                  />
                </View>
              </>
            )}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleNext}
              disabled={loading}>
              <LinearGradient
                colors={
                  loading ? ['#ccc', '#ccc'] : [COLORS.DODGERBLUE, '#4A90E2']
                }
                style={styles.buttonGradient}>
                {loading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.buttonText}>
                    {step === 1
                      ? 'Send OTP'
                      : step === 2
                      ? 'Verify OTP'
                      : 'Update Password'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (step === 1) {
                  navigation.goBack();
                } else {
                  setStep(step - 1);
                  if (step === 2) {
                    setOtp('');
                    setTimer(180);
                    setCanResend(false);
                  }
                }
              }}>
              <Text style={styles.backButtonText}>
                ← {step === 1 ? 'Back to Login' : 'Go Back'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerGradient: {
    height: height * 0.3,
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
  iconContainer: {
    width: scale(70),
    height: scale(70),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: moderateScale(35),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(15),
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
    width: scale(40),
    height: scale(40),
    resizeMode: 'contain',
  },
  title: {
    fontSize: moderateScale(24),
    fontFamily: Fonts.Bold,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: verticalScale(8),
  },
  subtitle: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Medium,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: scale(15),
    paddingTop: verticalScale(40),
  },
  inputContainer: {
    marginBottom: verticalScale(25),
  },
  label: {
    fontSize: moderateScale(18),
    fontFamily: Fonts.Bold,
    color: '#333',
    marginBottom: verticalScale(10),
  },
  textInput: {
    height: verticalScale(55),
    borderColor: COLORS.DODGERBLUE,
    borderWidth: 2,
    borderRadius: moderateScale(12),
    fontSize: moderateScale(16),
    paddingLeft: scale(15),
    fontFamily: Fonts.Medium,
    backgroundColor: '#F8F9FA',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  otpContainer: {
    marginBottom: verticalScale(30),
  },
  otpLabel: {
    fontSize: moderateScale(18),
    fontFamily: Fonts.Bold,
    color: '#333',
    textAlign: 'center',
    marginBottom: verticalScale(20),
  },
  otpInputContainer: {
    alignItems: 'center',
  },
  otpThemeContainer: {
    gap: scale(10),
  },
  pinCodeContainer: {
    width: scale(45),
    height: scale(55),
    backgroundColor: '#F8F9FA',
    borderRadius: moderateScale(12),
    borderWidth: 2,
    borderColor: '#E9ECEF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pinCodeText: {
    fontSize: moderateScale(20),
    fontFamily: Fonts.Bold,
    color: '#333',
  },
  focusStick: {
    backgroundColor: COLORS.DODGERBLUE,
    width: 2,
  },
  focusedPinCodeContainer: {
    borderColor: COLORS.DODGERBLUE,
    backgroundColor: COLORS.white,
    elevation: 4,
    shadowColor: COLORS.DODGERBLUE,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  timerText: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Medium,
    color: '#666',
  },
  timerValue: {
    color: COLORS.DODGERBLUE,
    fontFamily: Fonts.Bold,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(30),
  },
  resendText: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Medium,
    color: '#666',
  },
  resendButton: {
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(5),
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Bold,
    color: COLORS.DODGERBLUE,
  },
  resendButtonTextDisabled: {
    color: '#999',
  },
  button: {
    marginBottom: verticalScale(25),
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
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(15),
    alignItems: 'center',
  },
  buttonText: {
    fontSize: moderateScale(18),
    fontFamily: Fonts.Bold,
    color: COLORS.white,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: verticalScale(10),
  },
  backButtonText: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Medium,
    color: '#666',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: verticalScale(20),
  },
});
