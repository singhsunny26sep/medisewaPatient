import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, FlatList } from 'react-native';
import { Container } from '../../component/Container/Container';
import { COLORS } from '../../Theme/Colors';
import CustomHeader from '../../component/header/CustomHeader';
import { moderateScale, scale, verticalScale } from '../../utils/Scaling';
import { Fonts } from '../../Theme/Fonts';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { LanguageData } from '../../utils/LocalDataBase';
import { actionTypes } from '../../redux/ActionTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import RadioBtn from '../../component/RadioButton/RadioButton';
import strings from '../../../localization';

export default function ChangeLanguage({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
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
      setModalVisible(false);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const renderLanguageItem = ({ item }) => {
    const isSelected = languages === item.code;
    return (
      <TouchableOpacity
        style={styles.languageOption}
        onPress={() => changeLanguage(item.code)}
      >
        <Text style={styles.languageText}>{item.name}</Text>
        <RadioBtn checked={isSelected} onPress={() => changeLanguage(item.code)} />
      </TouchableOpacity>
    );
  };

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
      <TouchableOpacity
        style={[styles.shadowView, {
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: scale(2),
        }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.silverText}>{strings.ChangeLanguage}</Text>
        <AntDesign name="caretdown" size={25} style={{ marginRight: scale(8) }} />
      </TouchableOpacity>

      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.ModalHeaderContainer}>
              <Text style={styles.MHeadrTxt}>Select your language</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <AntDesign name='closecircleo' size={25} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={LanguageData}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item) => item.code}
              renderItem={renderLanguageItem}
            />
          </View>
        </View>
      </Modal>
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
  shadowView: {
    backgroundColor: COLORS.white,
    width: '90%',
    alignSelf: 'center',
    borderRadius: moderateScale(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 5,
    paddingVertical: verticalScale(8),
    marginTop: verticalScale(15),
  },
  silverText: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Light,
    color: COLORS.black,
    left: scale(10),
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    width: '100%',
    height: '50%',
    borderTopLeftRadius: moderateScale(25),
    borderTopRightRadius: moderateScale(25),
    paddingBottom: scale(5),
  },
  ModalHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(15),
    marginVertical: verticalScale(5),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.black,
  },
  MHeadrTxt: {
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(16),
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
