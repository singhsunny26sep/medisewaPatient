import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {Container} from '../../component/Container/Container';
import {COLORS} from '../../Theme/Colors';
import CustomHeader from '../../component/header/CustomHeader';
import CustomTextInput from '../../component/texinput/CustomTextInput';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
import { Fonts } from '../../Theme/Fonts';
import strings from '../../../localization';

export default function PasswordManager({navigation}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = () => {
    let formErrors = {};

    if (!currentPassword)
      formErrors.currentPassword = 'Current Password is required';
    if (!newPassword) formErrors.newPassword = 'New Password is required';
    if (newPassword !== confirmNewPassword)
      formErrors.confirmNewPassword = 'Passwords do not match';

    if (Object.keys(formErrors).length === 0) {
      alert('Password changed successfully!');
    } else {
      setErrors(formErrors);
    }
  };

  return (
    <Container
      statusBarStyle={'dark-content'}
      statusBarBackgroundColor={COLORS.white}
      backgroundColor={COLORS.white}>
      <CustomHeader title={strings.PasswordManager} navigation={navigation} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <CustomTextInput
            label={strings.CurrentPassword}
            placeholder={strings.EnterCurrentPassword}
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
            error={errors.currentPassword}
          />
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>{strings.ForgotPassword}?</Text>
          </TouchableOpacity>
          <CustomTextInput
            label={strings.NewPassword}
            placeholder={strings.EnterNewPassword}
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            error={errors.newPassword}
          />
          <CustomTextInput
            label={strings.ConfirmNewPassword}
            placeholder={strings.EnterConfirmNewPassword}
            secureTextEntry
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
            error={errors.confirmNewPassword}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>{strings.Submit}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: scale(20),
  },
  formContainer: {
    paddingHorizontal: scale(20),
    paddingTop: scale(20),
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    bottom: scale(12),
  },
  forgotPasswordText: {
    color: COLORS.black,
    fontSize: moderateScale(14),
    fontFamily: Fonts.Medium,
  },
  submitButton: {
    backgroundColor: COLORS.DODGERBLUE,
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    marginTop: scale(25),
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: moderateScale(16),
    fontWeight: 'bold',
  },
});
