import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import {Container} from '../../component/Container/Container';
import {COLORS} from '../../Theme/Colors';
import CustomHeader from '../../component/header/CustomHeader';
import CustomTextInput from '../../component/texinput/CustomTextInput';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
import { Fonts } from '../../Theme/Fonts';
import strings from '../../../localization';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const { width } = Dimensions.get('window');

export default function PasswordManager({navigation}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return COLORS.VERMILION;
    if (passwordStrength <= 3) return COLORS.orange;
    if (passwordStrength <= 4) return COLORS.yellowgreen;
    return COLORS.green;
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 3) return 'Fair';
    if (passwordStrength <= 4) return 'Good';
    return 'Strong';
  };

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
    <Container backgroundColor={COLORS.AntiFlashWhite}>
      <CustomHeader
        title={strings.PasswordManager}
        navigation={navigation}
        statusBarStyle="light-content"
        statusBarBackgroundColor={COLORS.DODGERBLUE}
      />

      {/* Hero Section */}
      <LinearGradient
        colors={[COLORS.DODGERBLUE, COLORS.STEELBLUE, COLORS.RobinBlue]}
        style={styles.heroSection}>
        <View style={styles.heroContent}>
          <View style={styles.heroIconContainer}>
            <MaterialIcons name="security" size={40} color={COLORS.white} />
          </View>
          <Text style={styles.heroTitle}>Secure Your Account</Text>
          <Text style={styles.heroSubtitle}>Keep your password strong and updated</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
        {/* Password Form Card */}
        <View style={styles.formCard}>
          <LinearGradient
            colors={[COLORS.white, COLORS.AntiFlashWhite]}
            style={styles.formCardGradient}>
            <View style={styles.formHeader}>
              <MaterialIcons name="lock-outline" size={24} color={COLORS.DODGERBLUE} />
              <Text style={styles.formTitle}>Change Password</Text>
            </View>

            <View style={styles.inputContainer}>
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
            </View>

            <View style={styles.inputContainer}>
              <CustomTextInput
                label={strings.NewPassword}
                placeholder={strings.EnterNewPassword}
                secureTextEntry
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  checkPasswordStrength(text);
                }}
                error={errors.newPassword}
              />

              {/* Password Strength Indicator */}
              {newPassword.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBar}>
                    <View
                      style={[
                        styles.strengthFill,
                        {
                          width: `${(passwordStrength / 5) * 100}%`,
                          backgroundColor: getStrengthColor(),
                        }
                      ]}
                    />
                  </View>
                  <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
                    {getStrengthText()}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.inputContainer}>
              <CustomTextInput
                label={strings.ConfirmNewPassword}
                placeholder={strings.EnterConfirmNewPassword}
                secureTextEntry
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                error={errors.confirmNewPassword}
              />
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              activeOpacity={0.8}>
              <LinearGradient
                colors={[COLORS.DODGERBLUE, COLORS.STEELBLUE]}
                style={styles.submitGradient}>
                <MaterialIcons name="check-circle" size={20} color={COLORS.white} />
                <Text style={styles.submitButtonText}>{strings.Submit}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Security Tips */}
        <View style={styles.tipsCard}>
          <LinearGradient
            colors={[COLORS.white, COLORS.AntiFlashWhite]}
            style={styles.tipsCardGradient}>
            <View style={styles.tipsHeader}>
              <FontAwesome5 name="shield-alt" size={20} color={COLORS.green} />
              <Text style={styles.tipsTitle}>Security Tips</Text>
            </View>

            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <MaterialIcons name="check-circle" size={16} color={COLORS.green} />
                <Text style={styles.tipText}>Use at least 8 characters</Text>
              </View>
              <View style={styles.tipItem}>
                <MaterialIcons name="check-circle" size={16} color={COLORS.green} />
                <Text style={styles.tipText}>Include uppercase & lowercase letters</Text>
              </View>
              <View style={styles.tipItem}>
                <MaterialIcons name="check-circle" size={16} color={COLORS.green} />
                <Text style={styles.tipText}>Add numbers and special characters</Text>
              </View>
              <View style={styles.tipItem}>
                <MaterialIcons name="check-circle" size={16} color={COLORS.green} />
                <Text style={styles.tipText}>Don't reuse old passwords</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(40),
    borderBottomLeftRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
    elevation: 10,
    shadowColor: COLORS.DODGERBLUE,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  heroIconContainer: {
    width: scale(80),
    height: scale(80),
    borderRadius: moderateScale(40),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  heroTitle: {
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(24),
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: verticalScale(8),
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroSubtitle: {
    fontFamily: Fonts.Regular,
    fontSize: moderateScale(14),
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: moderateScale(20),
  },
  scrollContainer: {
    flex: 1,
  },
  formCard: {
    marginHorizontal: scale(20),
    marginTop: verticalScale(20),
    borderRadius: moderateScale(20),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  formCardGradient: {
    borderRadius: moderateScale(20),
    padding: scale(20),
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  formTitle: {
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(18),
    color: COLORS.ARSENIC,
    marginLeft: scale(10),
  },
  inputContainer: {
    marginBottom: verticalScale(15),
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: verticalScale(5),
    marginBottom: verticalScale(10),
  },
  forgotPasswordText: {
    color: COLORS.DODGERBLUE,
    fontSize: moderateScale(14),
    fontFamily: Fonts.Medium,
    textDecorationLine: 'underline',
  },
  strengthContainer: {
    marginTop: verticalScale(8),
    flexDirection: 'row',
    alignItems: 'center',
  },
  strengthBar: {
    flex: 1,
    height: scale(4),
    backgroundColor: COLORS.AntiFlashWhite,
    borderRadius: scale(2),
    marginRight: scale(10),
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: scale(2),
  },
  strengthText: {
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(12),
    minWidth: scale(40),
    textAlign: 'right',
  },
  submitButton: {
    marginTop: verticalScale(20),
    borderRadius: moderateScale(25),
    elevation: 5,
    shadowColor: COLORS.DODGERBLUE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(15),
    paddingHorizontal: scale(30),
    borderRadius: moderateScale(25),
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: moderateScale(16),
    fontFamily: Fonts.Bold,
    marginLeft: scale(8),
  },
  tipsCard: {
    marginHorizontal: scale(20),
    marginTop: verticalScale(20),
    marginBottom: verticalScale(30),
    borderRadius: moderateScale(15),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tipsCardGradient: {
    borderRadius: moderateScale(15),
    padding: scale(20),
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  tipsTitle: {
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(16),
    color: COLORS.ARSENIC,
    marginLeft: scale(10),
  },
  tipsList: {
    paddingLeft: scale(5),
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  tipText: {
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(14),
    color: COLORS.ARSENIC,
    marginLeft: scale(10),
    lineHeight: moderateScale(18),
  },
});
