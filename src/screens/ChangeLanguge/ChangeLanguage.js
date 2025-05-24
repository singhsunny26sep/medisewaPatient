import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
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
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' }
  ];

  return (
    <Container
      statusBarStyle="dark-content"
      statusBarBackgroundColor={COLORS.white}
      backgroundColor={COLORS.white}
    >
      <CustomHeader title={strings.ChangeLanguage}/>
      <Image
        style={styles.logoImage}
        resizeMode="contain"
        source={require('../../assets/language.png')}
      />
      <View style={styles.topHeaderView}>
        <Text style={styles.yourChildText}>{strings.ChoosePreferredLanguage}</Text>
      </View>
      
      <View style={styles.languageContainer}>
        {languageOptions.map((item) => (
          <TouchableOpacity 
            key={item.code} 
            style={styles.languageOption}
            onPress={() => changeLanguage(item.code)}
          >
            <Text style={styles.languageText}>{item.name}</Text>
            <RadioBtn 
              checked={languages === item.code} 
              onPress={() => changeLanguage(item.code)} 
            />
          </TouchableOpacity>
        ))}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  logoImage: {
    width: scale(225),
    height: scale(225),
    alignSelf: 'center',
    marginTop: scale(30),
  },
  yourChildText: {
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(20),
    textAlign: 'center',
    color: COLORS.black,
    marginHorizontal: scale(50),
  },
  languageContainer: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginTop: verticalScale(15),
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(15),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.AshGray,
    paddingHorizontal: scale(15),
  },
  languageText: {
    fontSize: moderateScale(16),
    color: COLORS.black,
    fontFamily: Fonts.Medium,
  },
});
