import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {scale, moderateScale, verticalScale} from '../../utils/Scaling';
import {COLORS} from '../../Theme/Colors';
import {OtpInput} from 'react-native-otp-entry';
import {Instance} from '../../api/Instance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StatusBar} from 'react-native';
import {Container} from '../../component/Container/Container';
import {Fonts} from '../../Theme/Fonts';
import LinearGradient from 'react-native-linear-gradient';

const {width, height} = Dimensions.get('window');

export default function MobileVerify({route, navigation}) {
  const {mobile, sessionId} = route.params;

  const [timer, setTimer] = useState(180);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const otpInputRef = useRef(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    
    // Auto focus OTP input after animation
    const timer = setTimeout(() => {
      if (otpInputRef.current) {
        otpInputRef.current.focus();
      }
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
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
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const verifyOtp = async () => {
    if (code.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP.');
      return;
    }
  
    setLoading(true);
    try {
      const response = await Instance.post('api/v1/users/verify/otp', {
        sessionId,
        otp: code,
        mobile,
      });
  
      if (response.data.success) {
        const token = response.data.token;
  
        await AsyncStorage.setItem('userToken', token);
  
        navigation.navigate('MainStack');
      } else {
        Alert.alert('Verification failed', response.data.msg || 'Invalid OTP');
      }
    } catch (error) {
      console.error('OTP Verification Error:', error);
      Alert.alert('Error', 'Something went wrong while verifying the OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    try {
      const response = await Instance.post('/api/v1/users/request/otp', {
        mobile: mobile,
      });
      if (response.data?.success && response.data.result?.Details) {
        setTimer(180);
        setCanResend(false);
        setCode('');
        Alert.alert('Success', 'OTP has been resent to your mobile number.');
      } else {
        Alert.alert('Error', 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      console.log('Resend OTP Error:', error);
      Alert.alert('Error', 'Unable to resend OTP. Please try again.');
    }
  };

  return (
    <Container
      statusBarStyle={'light-content'}
      statusBarBackgroundColor={COLORS.DODGERBLUE}
      backgroundColor={COLORS.white}>
      <LinearGradient
        colors={[COLORS.DODGERBLUE, '#4A90E2', '#7BB3F0']}
        style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Image
              source={{
                uri: 'https://img.icons8.com/color/96/000000/otp.png',
              }}
              style={styles.otpIcon}
            />
          </View>
          <Text style={styles.title}>Verify Your Mobile</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit code to {mobile}
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
          <Animated.View 
            style={[styles.contentContainer, { opacity: fadeAnim }]}>
            <View style={styles.otpContainer}>
              <Text style={styles.otpLabel}>Enter OTP</Text>
              <View style={styles.otpInputContainer}>
                <OtpInput
                  ref={otpInputRef}
                  numberOfDigits={6}
                  onTextChange={text => setCode(text)}
                  value={code}
                  focusColor={COLORS.DODGERBLUE}
                  autoFocus={true}
                  keyboardType="number-pad"
                  clearInputs={false}
                  theme={{
                    containerStyle: styles.otpThemeContainer,
                    pinCodeContainerStyle: styles.pinCodeContainer,
                    pinCodeTextStyle: styles.pinCodeText,
                    focusStickStyle: styles.focusStick,
                    focusedPinCodeContainerStyle: styles.focusedPinCodeContainer,
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

            <TouchableOpacity
              style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
              onPress={verifyOtp}
              disabled={loading}>
              <LinearGradient
                colors={loading ? ['#ccc', '#ccc'] : [COLORS.DODGERBLUE, '#4A90E2']}
                style={styles.buttonGradient}>
                {loading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.verifyButtonText}>Verify OTP</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>
                Didn't receive the OTP?{' '}
              </Text>
              <TouchableOpacity 
                onPress={handleResendOTP}
                disabled={!canResend}
                style={[styles.resendButton, !canResend && styles.resendButtonDisabled]}>
                <Text style={[styles.resendButtonText, !canResend && styles.resendButtonTextDisabled]}>
                  Resend OTP
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>
                ← Back to Login
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}

const styles = StyleSheet.create({
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
  otpIcon: {
    width: scale(40),
    height: scale(40),
    tintColor: COLORS.white,
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
    marginBottom: verticalScale(30),
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
  verifyButton: {
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
  verifyButtonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(15),
    alignItems: 'center',
  },
  verifyButtonText: {
    fontSize: moderateScale(18),
    fontFamily: Fonts.Bold,
    color: COLORS.white,
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
