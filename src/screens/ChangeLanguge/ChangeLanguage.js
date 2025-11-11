import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { Container } from '../../component/Container/Container';
import { COLORS } from '../../Theme/Colors';
import CustomHeader from '../../component/header/CustomHeader';
import { moderateScale, scale, verticalScale } from '../../utils/Scaling';
import { Fonts } from '../../Theme/Fonts';
import { actionTypes } from '../../redux/ActionTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import RadioBtn from '../../component/RadioButton/RadioButton';
import strings from '../../../localization';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const { width } = Dimensions.get('window');

export default function ChangeLanguage({ navigation }) {
  const languages = useSelector((state) => state.Common.language);
  const dispatch = useDispatch();

  useEffect(() => {
    const loadLanguage = async () => {
      const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
      if (savedLanguage) {
        dispatch({ type: actionTypes.SET_LANGUAGE, payload: savedLanguage });
      }
    };
    loadLanguage();
  }, []);

  const changeLanguage = async (lang) => {
    try {
      await AsyncStorage.setItem('selectedLanguage', lang);
      dispatch({ type: actionTypes.SET_LANGUAGE, payload: lang });
      navigation.setParams({ language: lang });
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const languageOptions = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      icon: 'language',
      gradient: [COLORS.DODGERBLUE, COLORS.STEELBLUE]
    },
    {
      code: 'hi',
      name: 'हिंदी',
      nativeName: 'हिन्दी',
      flag: '🇮🇳',
      icon: 'language',
      gradient: [COLORS.orange, COLORS.BITTERSEWWT]
    }
  ];

  return (
    <Container backgroundColor={COLORS.AntiFlashWhite}>
     

      {/* Hero Section with Gradient */}
      <LinearGradient
        colors={[COLORS.DODGERBLUE, COLORS.STEELBLUE, COLORS.RobinBlue]}
        style={styles.heroSection}>
        <View style={styles.heroContent}>
          <View style={styles.logoContainer}>
            <Image
              style={styles.logoImage}
              resizeMode="contain"
              source={require('../../assets/language.png')}
            />
          </View>
          <Text style={styles.heroTitle}>{strings.ChoosePreferredLanguage}</Text>
          <Text style={styles.heroSubtitle}>Select your preferred language to continue</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
        {/* Language Selection Cards */}
        <View style={styles.languagesContainer}>
          <Text style={styles.sectionTitle}>Available Languages</Text>

          {languageOptions.map((item, index) => (
            <TouchableOpacity
              key={item.code}
              style={styles.languageCard}
              onPress={() => changeLanguage(item.code)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={item.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.languageCardGradient}>
                <View style={styles.languageCardContent}>
                  <View style={styles.languageInfo}>
                    <View style={styles.flagContainer}>
                      <Text style={styles.flagEmoji}>{item.flag}</Text>
                    </View>
                    <View style={styles.languageDetails}>
                      <Text style={styles.languageName}>{item.name}</Text>
                      <Text style={styles.languageNative}>{item.nativeName}</Text>
                    </View>
                  </View>

                  <View style={styles.selectionIndicator}>
                    {languages === item.code ? (
                      <LinearGradient
                        colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                        style={styles.selectedIndicator}>
                        <MaterialIcons name="check-circle" size={24} color={COLORS.white} />
                      </LinearGradient>
                    ) : (
                      <View style={styles.unselectedIndicator} />
                    )}
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <LinearGradient
            colors={[COLORS.white, COLORS.AntiFlashWhite]}
            style={styles.infoCard}>
            <View style={styles.infoContent}>
              <MaterialIcons name="info-outline" size={24} color={COLORS.DODGERBLUE} />
              <Text style={styles.infoText}>
                Changing language will restart the app to apply changes throughout the application.
              </Text>
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
  logoContainer: {
    marginBottom: verticalScale(20),
  },
  logoImage: {
    width: scale(120),
    height: scale(120),
    borderRadius: moderateScale(60),
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: scale(20),
  },
  heroTitle: {
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(24),
    textAlign: 'center',
    color: COLORS.white,
    marginBottom: verticalScale(8),
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroSubtitle: {
    fontFamily: Fonts.Regular,
    fontSize: moderateScale(14),
    textAlign: 'center',
    color: 'rgba(255,255,255,0.9)',
    lineHeight: moderateScale(20),
  },
  scrollContainer: {
    flex: 1,
  },
  languagesContainer: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(30),
  },
  sectionTitle: {
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(20),
    color: COLORS.ARSENIC,
    marginBottom: verticalScale(20),
    textAlign: 'center',
  },
  languageCard: {
    marginBottom: verticalScale(15),
    borderRadius: moderateScale(20),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  languageCardGradient: {
    borderRadius: moderateScale(20),
  },
  languageCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(20),
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flagContainer: {
    width: scale(50),
    height: scale(50),
    borderRadius: moderateScale(25),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(15),
  },
  flagEmoji: {
    fontSize: moderateScale(24),
  },
  languageDetails: {
    flex: 1,
  },
  languageName: {
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(18),
    color: COLORS.white,
    marginBottom: verticalScale(2),
  },
  languageNative: {
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(14),
    color: 'rgba(255,255,255,0.8)',
  },
  selectionIndicator: {
    width: scale(40),
    height: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicator: {
    width: scale(32),
    height: scale(32),
    borderRadius: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  unselectedIndicator: {
    width: scale(20),
    height: scale(20),
    borderRadius: moderateScale(10),
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  infoSection: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(30),
  },
  infoCard: {
    borderRadius: moderateScale(15),
    padding: scale(20),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(14),
    color: COLORS.ARSENIC,
    lineHeight: moderateScale(20),
    marginLeft: scale(12),
  },
});
