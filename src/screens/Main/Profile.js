import React, {useState, useEffect} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {COLORS} from '../../Theme/Colors';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Container} from '../../component/Container/Container';
import {Fonts} from '../../Theme/Fonts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Instance} from '../../api/Instance';
import {useNavigation} from '@react-navigation/native';
import strings from '../../../localization';
import { useSelector } from 'react-redux';
import CustomHeader from '../../component/header/CustomHeader';

export default function ProfileScreen({}) {
  const navigation = useNavigation('');
  const language = useSelector((state) => state.Common.language);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // const profileData = {
  //   profile: {
  //     firstName: 'Test',
  //   },
  //   contact: {
  //     phone: 'test@gmail.com',
  //   },
  // };

  useEffect(() => {
    const getProfileData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const response = await Instance.get('/api/v1/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setProfileData(response.data.result);
        } else {
          console.warn('Failed to fetch profile');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    getProfileData();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    } catch (error) {
      console.error('Logout Error:', error);
      Alert.alert('Error', 'Something went wrong during logout.');
    }
  };

  return (
    <Container
      statusBarStyle={'dark-content'}
      statusBarBackgroundColor={COLORS.white}
      backgroundColor={COLORS.white}>
      <CustomHeader showIcon={false} title={strings.Profile}/>
      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.DODGERBLUE} />
        ) : profileData ? (
          <View style={styles.PROFILECONTAINERS}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Image
                source={{uri: profileData?.image}}
                style={styles.profileImage}
              />
              <View style={{marginLeft: scale(10)}}>
                <Text style={styles.FRISTNAME}>{profileData?.name}</Text>
                <Text style={styles.MOBILENUMMBER}>{profileData?.mobile}</Text>
                <Text style={styles.MOBILENUMMBER}>{profileData?.email}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.EditButton}
              onPress={() => navigation.navigate('EditProfile')}>
              <View style={styles.EditButtonSecondView}>
                <AntDesign name="edit" size={18} color={COLORS.white} />
                <Text style={styles.EditBtnTxt}>Edit</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{alignItems: 'center', marginTop: verticalScale(20)}}>
            <Text style={{color: COLORS.gray, fontSize: scale(14)}}>
              Unable to load profile information.
            </Text>
          </View>
        )}

        <View>
          <Text style={styles.FAMILYFONT}>{strings.FamilyInformation}</Text>
          <View style={styles.familyCard}>
            <View style={styles.familyRow}>
              <Image
                source={{
                  uri: 'https://image.made-in-china.com/318f0j00rQuYWiOMsDqz/IbuprofenTabs-mp4.webp',
                }}
                style={styles.profileImage}
              />
              <View style={styles.familyDetails}>
                <Text style={styles.FRISTNAME}>Sanjay</Text>
                <Text style={styles.MOBILENUMMBER}>709688015</Text>
                <Text style={styles.MOBILENUMMBER}>vaghasiya@gmail.com</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.addFamilyBtn}
            onPress={() => navigation.navigate('Add_FamilyMember')}>
            <Text style={styles.addFamilyBtnText}>+ {strings.AddFamilyMember}</Text>
          </TouchableOpacity>
        </View>

        <View style={{marginTop: scale(10)}}>
          <View style={styles.BorderBottom}>
            <TouchableOpacity
              style={styles.editProfileContainer}
              onPress={() => navigation.navigate('MyAppointment')}>
              <View style={styles.profileContent}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name="calendar-outline"
                    size={25}
                    color={COLORS.black}
                  />
                </View>
                <Text style={styles.editProfileText}>{strings.MyAppointment}</Text>
              </View>
              <AntDesign
                name="right"
                size={20}
                color={COLORS.black}
                style={styles.rightIcon}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.BorderBottom}>
            <TouchableOpacity
              style={styles.editProfileContainer}
              onPress={() => navigation.navigate('OrderHistory')}>
              <View style={styles.profileContent}>
                <View style={styles.iconContainer}>
                  <FontAwesome5 name="receipt" size={25} color={COLORS.black} />
                </View>
                <Text style={styles.editProfileText}>{strings.OrderHistory}</Text>
              </View>
              <AntDesign
                name="right"
                size={20}
                color={COLORS.black}
                style={styles.rightIcon}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.BorderBottom}>
            <TouchableOpacity
              style={styles.editProfileContainer}
              onPress={() => navigation.navigate('ChangeLanguage')}>
              <View style={styles.profileContent}>
                <View style={styles.iconContainer}>
                  <AntDesign name="earth" size={25} color={COLORS.black} />
                </View>
                <Text style={styles.editProfileText}>{strings.ChangeLanguage}</Text>
              </View>
              <AntDesign
                name="right"
                size={20}
                color={COLORS.black}
                style={styles.rightIcon}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.BorderBottom}>
            <TouchableOpacity
              style={styles.editProfileContainer}
              onPress={() => navigation.navigate('PasswordManager')}>
              <View style={styles.profileContent}>
                <View style={styles.iconContainer}>
                  <FontAwesome5 name="key" size={25} color={COLORS.black} />
                </View>
                <Text style={styles.editProfileText}>{strings.PasswordManager}</Text>
              </View>
              <AntDesign
                name="right"
                size={20}
                color={COLORS.black}
                style={styles.rightIcon}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.BorderBottom}>
            <TouchableOpacity
              style={styles.editProfileContainer}
              onPress={() => navigation.navigate('HelpCenter')}>
              <View style={styles.profileContent}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name="help-buoy-sharp"
                    size={25}
                    color={COLORS.black}
                  />
                </View>
                <Text style={styles.editProfileText}>{strings.HelpCenter}</Text>
              </View>
              <AntDesign
                name="right"
                size={20}
                color={COLORS.black}
                style={styles.rightIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.BorderBottom}>
          <TouchableOpacity
            style={styles.editProfileContainer}
            onPress={() => navigation.navigate('CallHistory')}>
            <View style={styles.profileContent}>
              <View style={styles.iconContainer}>
                <FontAwesome5 name="phone-alt" size={25} color={COLORS.black} />
              </View>

              <Text style={styles.editProfileText}>{strings.CallHistory}</Text>
            </View>
            <AntDesign
              name="right"
              size={20}
              color={COLORS.black}
              style={styles.rightIcon}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.BorderBottom}>
          <TouchableOpacity
            style={styles.editProfileContainer}
            onPress={() => navigation.navigate('PrivacyPolicy')}>
            <View style={styles.profileContent}>
              <View style={styles.iconContainer}>
                <FontAwesome5
                  name="shield-alt"
                  size={25}
                  color={COLORS.black}
                />
              </View>

              <Text style={styles.editProfileText}>{strings.PrivacyPolicy}</Text>
            </View>
            <AntDesign
              name="right"
              size={20}
              color={COLORS.black}
              style={styles.rightIcon}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <AntDesign name="logout" size={20} color={COLORS.white} />
            <Text style={styles.logoutText}>{strings.Logout}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  Header: {
    elevation: 10,
    backgroundColor: COLORS.white,
    paddingVertical: verticalScale(15),
    borderBottomLeftRadius: moderateScale(15),
    borderBottomRightRadius: moderateScale(15),
  },
  HeaderFonts: {
    fontFamily: Fonts.Bold,
    color: COLORS.black,
    fontSize: moderateScale(18),
    paddingLeft: scale(15),
  },
  FRISTNAME: {
    color: COLORS.black,
    fontSize: moderateScale(18),
    fontFamily: Fonts.Light,
  },
  MOBILENUMMBER: {
    color: COLORS.grey,
    fontSize: moderateScale(12),
    fontFamily: Fonts.Light,
  },
  profileImage: {
    height: scale(65),
    width: scale(65),
    borderRadius: moderateScale(100),
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  EditButton: {
    alignSelf: 'center',
    backgroundColor: COLORS.DODGERBLUE,
    paddingVertical: verticalScale(7),
    paddingHorizontal: scale(10),
    borderRadius: moderateScale(20),
  },
  EditButtonSecondView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  EditBtnTxt: {
    color: COLORS.white,
    marginLeft: scale(5),
    fontFamily: Fonts.Bold,
  },
  PROFILECONTAINERS: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: scale(15),
    marginVertical: verticalScale(15),
    paddingBottom: scale(15),
    borderBottomWidth: 0.5,
  },
  FAMILYCONTAINERS: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: scale(15),
    marginVertical: verticalScale(5),
    paddingBottom: scale(5),
  },
  FAMILYFONT: {
    marginHorizontal: scale(15),
    fontFamily: Fonts.Medium,
    color: COLORS.black,
    fontSize: moderateScale(15),
  },
  BorderBottom: {
    borderBottomWidth: 0.8,
    borderBottomColor: COLORS.black,
  },
  editProfileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(10),
    width: '100%',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(15),
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: moderateScale(16),
  },
  editProfileText: {
    color: COLORS.black,
    fontSize: moderateScale(15),
    marginLeft: scale(10),
    fontFamily: Fonts.Medium,
    top: scale(2),
  },
  rightIcon: {
    marginLeft: 'auto',
  },
  logoutContainer: {
    marginTop: scale(20),
    padding: scale(15),
    backgroundColor: COLORS.white,
    borderTopColor: COLORS.grey,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.red,
    padding: scale(5),
    borderRadius: moderateScale(8),
    justifyContent: 'center',
    width: scale(100),
    alignSelf: 'center',
  },
  logoutText: {
    color: COLORS.white,
    fontSize: moderateScale(18),
    marginLeft: scale(10),
    fontFamily: Fonts.Light,
    bottom: scale(2),
    top: 1,
  },
  familyCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: scale(15),
    marginVertical: verticalScale(10),
    padding: scale(10),
    borderRadius: moderateScale(10),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  familyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  familyDetails: {
    marginLeft: scale(10),
    flex: 1,
  },
  familyEditBtn: {
    marginTop: verticalScale(10),
    alignSelf: 'flex-end',
    backgroundColor: COLORS.DODGERBLUE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(5),
    paddingHorizontal: scale(10),
    borderRadius: moderateScale(20),
  },
  addFamilyBtn: {
    alignSelf: 'center',
    marginTop: verticalScale(5),
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(20),
    backgroundColor: COLORS.DODGERBLUE,
    borderRadius: moderateScale(20),
  },
  addFamilyBtnText: {
    color: COLORS.white,
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(14),
  },
});
