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
import {Fonts} from '../../Theme/Fonts';
import axios from 'axios';

export default function MobileVerify({route, navigation}) {
  const {mobile, sessionId} = route.params;

  const [timer, setTimer] = useState(180);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

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
  

  return (
    <Container
      statusBarStyle={'dark-content'}
      statusBarBackgroundColor={COLORS.white}
      backgroundColor={COLORS.white}>
      <View style={styles.VerifyotpSection}>
        <Image
          source={{
            uri: 'https://thumbs.dreamstime.com/b/one-time-password-otp-verification-methods-concept-unique-codes-protection-against-cyber-crime-one-time-password-otp-312847096.jpg',
          }}
          style={styles.Verifyimage}
        />
        <Text style={styles.Verifytitle}>OTP sent to your Email</Text>
        <View style={styles.OTptimeingView}>
          <Text style={styles.VerifyotpTimer}>
            OTP expires in 
          </Text>
        </View>
        <View style={styles.OtpInputView}>
          <OtpInput
            numberOfDigits={6}
            onTextChange={text => setCode(text)}
            value={code}
            focusColor={COLORS.DODGERBLUE}
          />
        </View>
        <TouchableOpacity
          style={styles.Verifybutton2}
     onPress={verifyOtp}
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
          <TouchableOpacity disabled={loading}>
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
    marginTop: scale(50),
  },
  Verifytitle: {
    fontSize: moderateScale(18),
    fontFamily: Fonts.Medium,
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
    fontFamily: Fonts.Bold,
    color: COLORS.AntiFlashWhite,
  },
  VerifyotpTimer: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Medium,
    color: COLORS.midnightblue,
    marginBottom: verticalScale(20),
  },
  VerifyResendOtpView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  VerifyResendOtpTXt: {
    fontSize: moderateScale(13),
    fontFamily: Fonts.Medium,
    color: COLORS.ARSENIC,
  },
  VerifyResendOtpTXt2: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Medium,
    color: COLORS.DODGERBLUE,
  },
  OtpInputView: {
    width: '70%',
    marginVertical: verticalScale(10),
  },
});
