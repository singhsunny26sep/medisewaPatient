import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {scale, moderateScale, verticalScale} from '../../utils/Scaling';
import {COLORS} from '../../Theme/Colors';
import {OtpInput} from 'react-native-otp-entry';
import {Instance} from '../../api/Instance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StatusBar} from 'react-native';
import {Container} from '../../component/Container/Container';
import { Fonts } from '../../Theme/Fonts';

export default function UserVerify({route, navigation}) {
  const [timer, setTimer] = useState(180);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  // const {email} = route.params;

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTime => prevTime - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = time => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleResendOTP = async () => {
    setTimer(180);
    setLoading(true);
    try {
      const res = await Instance.post('/resend-otp', );
      if (res?.data) {
        Alert.alert('Success', 'OTP has been resent.');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      const res = await Instance.put('/verify-otp', {email, otp: code});
      if (res?.data) {
        console.log('OTP verification successful');
        await AsyncStorage.setItem('userToken', res.data.token);
        navigation.navigate('MainStack');
      } else {
        Alert.alert('Error', 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      statusBarStyle={'dark-content'}
      statusBarBackgroundColor={COLORS.white}
      backgroundColor={COLORS.white}>
      <View style={styles.VerifyotpSection}>
        <Image
          source={{uri:"https://thumbs.dreamstime.com/b/one-time-password-otp-verification-methods-concept-unique-codes-protection-against-cyber-crime-one-time-password-otp-312847096.jpg"}}
          style={styles.Verifyimage}
        />
        <Text style={styles.Verifytitle}>OTP sent to your Email</Text>
        <View style={styles.OTptimeingView}>
          <Text style={styles.VerifyotpTimer}>
            OTP expires in {formatTime(timer)}
          </Text>
        </View>
        <View style={styles.OtpInputView}>
          <OtpInput
            numberOfDigits={4}
            onTextChange={text => setCode(text)}
            value={code}
            focusColor={COLORS.DODGERBLUE}
          />
        </View>
        <TouchableOpacity
          style={styles.Verifybutton2}
          onPress={() => navigation.navigate('MainStack')}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.AntiFlashWhite} />
          ) : (
            <Text style={styles.VerifybuttonText}>Verify OTP</Text>
          )}
        </TouchableOpacity>
        <View style={styles.VerifyResendOtpView}>
          <Text style={styles.VerifyResendOtpTXt}>
            Didn't receive the OTP?{' '}
          </Text>
          <TouchableOpacity onPress={handleResendOTP} disabled={loading}>
            <Text style={styles.VerifyResendOtpTXt2}>Resend OTP</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  VerifyotpSection: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  Verifyimage: {
    height: verticalScale(150),
    width: scale(150),
    marginBottom: verticalScale(10),
    marginTop:scale(50)
  },
  Verifytitle: {
    fontSize: moderateScale(18),
    fontFamily:Fonts.Medium,
    color: COLORS.DODGERBLUE,
    textAlign: 'center',
  },
  Verifybutton2: {
    width: scale(250),
    height: verticalScale(45),
    backgroundColor: COLORS.DODGERBLUE,
    borderRadius: moderateScale(10),
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: verticalScale(20),
    elevation: scale(2),
  },
  VerifybuttonText: {
    fontSize: moderateScale(16),
    fontFamily:Fonts.Bold,
    color: COLORS.AntiFlashWhite,
  },
  VerifyotpTimer: {
    fontSize: moderateScale(15),
    fontFamily:Fonts.Medium,
    color: COLORS.midnightblue,
    marginBottom: verticalScale(20),
  },
  VerifyResendOtpView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  VerifyResendOtpTXt: {
    fontSize: moderateScale(13),
    fontFamily:Fonts.Medium,
    color: COLORS.ARSENIC,
  },
  VerifyResendOtpTXt2: {
    fontSize: moderateScale(14),
    fontFamily:Fonts.Medium,
    color: COLORS.DODGERBLUE,
  },
  OtpInputView: {
    width: '70%',
    marginVertical:verticalScale(10)
  },
});
