import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import axios from 'axios';
import {COLORS} from '../../Theme/Colors';
import {verticalScale, scale, moderateScale} from '../../utils/Scaling';
import {OtpInput} from 'react-native-otp-entry';
import CustomHeader from '../../component/header/CustomHeader';
import {Fonts} from '../../Theme/Fonts';
import CustomTextInput from '../../component/texinput/CustomTextInput';
import { Instance } from '../../api/Instance';

export default function ForgotPassword({navigation}) {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [sessionId, setSessionId] = useState('');

  const handleNext = async () => {
    if (step === 1) {
      if (mobile) {
        try {
          const response = await Instance.post(
            'api/v1/users/request/otp',
            {
              mobile: mobile,
            },
          );
          const sessionId = response.data.sessionId;
          setSessionId(sessionId);
          Alert.alert('OTP Sent', 'OTP has been sent to your mobile number');
          setStep(2);
        } catch (error) {
          console.error(error);
          Alert.alert('Error', 'Failed to send OTP. Try again.');
        }
      } else {
        Alert.alert('Input Required', 'Please enter a valid mobile number');
      }
    } else if (step === 2) {
      if (otp.length === 6) {
        console.log('Entered OTP:', otp);
        setStep(3); 
      } else {
        Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP');
      }
    } else if (step === 3) {
      if (newPassword && confirmPassword) {
        if (newPassword === confirmPassword) {
          try {
            await Instance.post(
              'api/v1/users/forgot/password',
              {
                sessionId: sessionId,
                otp: otp,
                mobile: mobile,
                password: newPassword,
              },
            );
            Alert.alert('Success', 'Password updated successfully');
          } catch (error) {
            console.error(error);
            Alert.alert(
              'Error',
              'Failed to reset password. Check OTP and try again.',
            );
          }
        } else {
          Alert.alert('Mismatch', 'Passwords do not match');
        }
      } else {
        Alert.alert('Required', 'Please enter both password fields');
      }
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Forgot Password" navigation={navigation} />
      <View style={styles.header}>
        <Image
          source={{
            uri: 'https://static.vecteezy.com/system/resources/previews/004/112/232/non_2x/forgot-password-and-account-login-for-web-page-protection-security-key-access-system-in-smartphone-or-computer-flat-illustration-vector.jpg',
          }}
          style={styles.logo}
        />
        <Text style={styles.title}>
          {step === 1
            ? 'Forgot Password'
            : step === 2
            ? 'Enter OTP'
            : 'Update Password'}
        </Text>
      </View>

      {step === 1 && (
        <>
          <Text style={styles.infoText}>
            Please enter your mobile no. We'll send you an OTP to verify.
          </Text>
          <View style={styles.Commanstyle}>
            <CustomTextInput
              placeholder="Enter your mobile number"
              value={mobile}
              onChangeText={setMobile}
              leftIcon="call-outline"
              keyboardType="phone-pad"
            />
          </View>
        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.infoText}>
            Enter the OTP sent to your mobile. Please check your SMS inbox.
          </Text>
          <View
            style={[styles.inputContainer, {borderWidth: 0, marginLeft: 15}]}>
            <OtpInput
              value={otp}
              onChange={setOtp}
              inputCount={6}
              keyboardType="numeric"
              tintColor={COLORS.maroon}
              offTintColor={COLORS.red}
              textInputStyle={styles.otpTextInput}
            />
          </View>
        </>
      )}

      {step === 3 && (
        <>
          <Text style={styles.infoText}>
            Make sure both passwords match and meet the security requirements
            (e.g., minimum 8 characters).
          </Text>
          <View style={styles.Commanstyle}>
            <CustomTextInput
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={true}
              leftIcon="lock-closed"
            />
            <CustomTextInput
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={true}
              leftIcon="lock-closed"
            />
          </View>
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>
          {step === 1 ? 'Next' : step === 2 ? 'Submit' : 'Update Password'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    alignItems: 'center',
    marginBottom: moderateScale(20),
  },
  logo: {
    width: scale(120),
    height: scale(120),
    marginBottom: moderateScale(10),
    marginTop: scale(20),
  },
  title: {
    fontSize: moderateScale(18),
    color: COLORS.black,
    fontFamily: Fonts.Medium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(15),
    borderRadius: moderateScale(5),
    paddingHorizontal: moderateScale(10),
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderRadius: moderateScale(8),
    marginHorizontal: scale(15),
  },
  otpTextInput: {
    width: scale(35),
    height: verticalScale(45),
    borderWidth: 1,
    borderRadius: moderateScale(5),
    borderColor: COLORS.RoyalBlue,
    textAlign: 'center',
    fontSize: moderateScale(18),
    color: COLORS.black,
  },
  button: {
    backgroundColor: COLORS.DODGERBLUE,
    borderRadius: moderateScale(5),
    paddingVertical: moderateScale(12),
    alignItems: 'center',
    marginTop: moderateScale(20),
    elevation: 3,
    marginHorizontal: scale(15),
  },
  buttonText: {
    color: COLORS.white,
    fontSize: moderateScale(15),
    fontFamily: Fonts.Medium,
  },
  infoText: {
    fontSize: moderateScale(13),
    color: COLORS.gray,
    textAlign: 'center',
    marginHorizontal: scale(15),
    marginBottom: scale(15),
    fontFamily: Fonts.Regular,
  },
  Commanstyle: {
    marginHorizontal: scale(15),
  },
});
