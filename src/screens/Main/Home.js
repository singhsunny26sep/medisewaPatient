import React, {useRef, useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  BackHandler,
  Alert,
  Dimensions,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {COLORS} from '../../Theme/Colors';
import {scale, verticalScale, moderateScale} from '../../utils/Scaling';
import ReusableView from '../../component/ReusableView';
import RecommendedLabs from '../../component/HomeCompo/RecommendedLabs';
import Question from '../../component/HomeCompo/Question';
import TrustedBanner from '../../component/HomeCompo/TrustedBanner';
import {StatusBar} from 'react-native';
import CustomModal from '../../component/HomeCompo/CustomModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Fonts} from '../../Theme/Fonts';
import {Container} from '../../component/Container/Container';
import strings from '../../../localization';
import {useSelector} from 'react-redux';
import { Instance } from '../../api/Instance';

const {width} = Dimensions.get('window');

export default function Home({navigation}) {
  const scrollViewRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [profileData, setProfileData] = useState(null);

  const language = useSelector(state => state.Common.language);

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

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <Container
      statusBarStyle={'light-content'}
      statusBarBackgroundColor={'#64B5F6'}
      backgroundColor={COLORS.white}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#64B5F6', '#42A5F5', '#2196F3']}
          start={{x: 0, y: 0}}  
          end={{x: 1, y: 1}}
          style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <View style={styles.welcomeSection}>
              <View style={styles.profileSection}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.15)']}
                  style={styles.profileIconContainer}>
                  <FontAwesome
                    name="user-circle"
                    size={40}
                    color={COLORS.white}
                  />
                </LinearGradient>
              </View>
              <View style={styles.welcomeTextContainer}>
                <Text style={styles.welcomeText}>{strings.welcome},</Text>
                <Text style={styles.userName}>{profileData?.name || "Loading.."}</Text>
              </View>
            </View>
            {/* <TouchableOpacity style={styles.notificationButton}>
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.15)']}
                style={styles.notificationIconContainer}>
                <Ionicons name="notifications" size={24} color={COLORS.white} />
                <View style={styles.notificationBadge} />
              </LinearGradient>
            </TouchableOpacity> */}
          </View>
        </LinearGradient>

        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}>
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={COLORS.ARSENIC} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for doctors, medicines..."
                placeholderTextColor="#999"
                value={searchText}
                onChangeText={setSearchText}
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchText.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchText('')}
                  style={styles.clearButton}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.servicesContainer}>
            <Text style={styles.sectionTitle}>{strings.OurServices}</Text>
            <View style={styles.servicesGrid}>
              <ReusableView
                text={strings.OnlineDoctorConsultations}
                imageSource={require('../../assets/Dr10mint.jpg')}
                imageStyle={styles.DrImageStyle}
                navigation={() => navigation.navigate('FindDoctor')}
              />
              <ReusableView
                text={strings.LabTestsAndScans}
                imageSource={require('../../assets/NearestLabLogo.jpg')}
                navigation={() => navigation.navigate('NearestLabPage')}
                imageStyle={styles.LabImageStyle}
              />
              <ReusableView
                text={strings.Reports}
                imageSource={require('../../assets/Reports.jpg')}
                imageStyle={styles.ReportImageStyle}
                navigation={() => navigation.navigate('Reports')}
              />
              <ReusableView
                text={strings.OrderMedicines}
                imageSource={require('../../assets/MedicinePng.png')}
                navigation={() => navigation.navigate('MedicineCategory')}
                imageStyle={styles.ImageStyle3}
              />
            </View>
          </View>
          <View style={styles.labBannerContainer}>
            <LinearGradient
              colors={['#E3F2FD', '#BBDEFB']}
              style={styles.labBanner}>
              <View style={styles.labBannerContent}>
                <View style={styles.labBannerTextContainer}>
                  <Text style={styles.labBannerTitle}>
                    {strings.BookLabTests}
                  </Text>
                  <Text style={styles.labBannerSubtitle}>
                    {strings.SamplePickupInfo}
                  </Text>
                  <TouchableOpacity
                    style={styles.bookNowButton}
                    onPress={() => navigation.navigate('NearestLabPage')}>
                    <Text style={styles.bookNowText}>{strings.BookNow}</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={20}
                      color={COLORS.white}
                    />
                  </TouchableOpacity>
                </View>
                <Image
                  style={styles.labBannerImage}
                  source={require('../../assets/NearestLabLogo.jpg')}
                />
              </View>
            </LinearGradient>
          </View>
          <TrustedBanner />
        </ScrollView>
      </View>

      <CustomModal
        visible={modalVisible}
        onClose={closeModal}
        imageSource={require('../../assets/coming-soon.jpg')}
        message="This feature will be available soon."
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerGradient: {
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(20),
    borderBottomLeftRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  welcomeSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileSection: {
    marginRight: scale(15),
  },
  profileIconContainer: {
    padding: moderateScale(10),
    borderRadius: moderateScale(15),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  welcomeTextContainer: {
    justifyContent: 'center',
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: Fonts.Regular,
    fontSize: moderateScale(14),
  },
  userName: {
    color: COLORS.white,
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(18),
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  notificationButton: {
    padding: moderateScale(8),
  },
  notificationIconContainer: {
    padding: moderateScale(10),
    borderRadius: moderateScale(15),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  notificationBadge: {
    position: 'absolute',
    top: scale(8),
    right: scale(8),
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: '#FF3B30',
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: scale(20),
    marginTop: verticalScale(20),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(12),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: scale(10),
    color: COLORS.ARSENIC,
    fontFamily: Fonts.Regular,
    fontSize: moderateScale(14),
    padding: 0,
  },
  clearButton: {
    padding: scale(4),
  },
  servicesContainer: {
    paddingHorizontal: scale(20),
    marginTop: verticalScale(10),
  },
  sectionTitle: {
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(20),
    color: COLORS.ARSENIC,
    marginBottom: verticalScale(10),
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  labBannerContainer: {
    paddingHorizontal: scale(20),
    marginTop: verticalScale(25),
  },
  labBanner: {
    borderRadius: moderateScale(20),
    overflow: 'hidden',
  },
  labBannerContent: {
    flexDirection: 'row',
    padding: moderateScale(20),
  },
  labBannerTextContainer: {
    flex: 1,
    marginRight: scale(15),
  },
  labBannerTitle: {
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(20),
    color: COLORS.ARSENIC,
    marginBottom: verticalScale(8),
  },
  labBannerSubtitle: {
    fontFamily: Fonts.Regular,
    fontSize: moderateScale(14),
    color: COLORS.ARSENIC,
    marginBottom: verticalScale(15),
  },
  bookNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.DODGERBLUE,
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(20),
    borderRadius: moderateScale(25),
    alignSelf: 'flex-start',
  },
  bookNowText: {
    color: COLORS.white,
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(14),
    marginRight: scale(8),
  },
  labBannerImage: {
    width: scale(100),
    height: scale(100),
    borderRadius: moderateScale(15),
  },
  bottomSection: {
    marginTop: verticalScale(25),
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
    paddingTop: verticalScale(25),
  },
  DrImageStyle: {
    height: verticalScale(65),
    width: scale(60),
    resizeMode: 'cover',
    borderRadius: moderateScale(25),
  },
  ReportImageStyle: {
    height: verticalScale(55),
    width: scale(60),
    resizeMode: 'cover',
    borderRadius: moderateScale(25),
  },
  ImageStyle3: {
    height: verticalScale(70),
    width: scale(70),
    resizeMode: 'contain',
  },
  LabImageStyle: {
    height: verticalScale(60),
    width: scale(61),
    resizeMode: 'cover',
    borderRadius: moderateScale(10),
  },
});
