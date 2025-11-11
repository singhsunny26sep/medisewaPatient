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
  Dimensions,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {COLORS} from '../../Theme/Colors';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import {Container} from '../../component/Container/Container';
import {Fonts} from '../../Theme/Fonts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Instance} from '../../api/Instance';
import {useNavigation} from '@react-navigation/native';
import strings from '../../../localization';
import { useSelector } from 'react-redux';
import CustomHeader from '../../component/header/CustomHeader';

const {width} = Dimensions.get('window');

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
    <Container backgroundColor={COLORS.AntiFlashWhite}>
      {/* <CustomHeader
        showIcon={false}
        title={strings.Profile}
        statusBarStyle="light-content"
        statusBarBackgroundColor={COLORS.DODGERBLUE}
      /> */}

      {/* Profile Header with Gradient */}
      <LinearGradient
        colors={[COLORS.DODGERBLUE, COLORS.STEELBLUE, COLORS.RobinBlue]}
        style={styles.profileHeader}>
        <View style={styles.profileHeaderContent}>
          <View style={styles.profileAvatarContainer}>
            <Image
              source={{uri: profileData?.image || 'https://via.placeholder.com/100'}}
              style={styles.profileAvatar}
            />
            <View style={styles.onlineIndicator} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profileData?.name || 'User'}</Text>
            <Text style={styles.profileContact}>{profileData?.mobile || 'N/A'}</Text>
            <Text style={styles.profileEmail}>{profileData?.email || 'N/A'}</Text>
          </View>
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => navigation.navigate('EditProfile')}>
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
              style={styles.editBtnGradient}>
              <AntDesign name="edit" size={20} color={COLORS.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.DODGERBLUE} />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : profileData ? (
          <>
            {/* Quick Stats Section */}
            <View style={styles.statsContainer}>
              <Text style={styles.sectionTitle}>Quick Stats</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <LinearGradient
                    colors={[COLORS.DODGERBLUE, COLORS.STEELBLUE]}
                    style={styles.statGradient}>
                    <Ionicons name="calendar" size={24} color={COLORS.white} />
                    <Text style={styles.statNumber}>12</Text>
                    <Text style={styles.statLabel}>Appointments</Text>
                  </LinearGradient>
                </View>
                <View style={styles.statCard}>
                  <LinearGradient
                    colors={[COLORS.greenViridian, COLORS.TEAL]}
                    style={styles.statGradient}>
                    <FontAwesome5 name="shopping-cart" size={20} color={COLORS.white} />
                    <Text style={styles.statNumber}>8</Text>
                    <Text style={styles.statLabel}>Orders</Text>
                  </LinearGradient>
                </View>
                <View style={styles.statCard}>
                  <LinearGradient
                    colors={[COLORS.orange, COLORS.BITTERSEWWT]}
                    style={styles.statGradient}>
                    <Ionicons name="call" size={24} color={COLORS.white} />
                    <Text style={styles.statNumber}>24</Text>
                    <Text style={styles.statLabel}>Calls</Text>
                  </LinearGradient>
                </View>
                <View style={styles.statCard}>
                  <LinearGradient
                    colors={[COLORS.RobinBlue, COLORS.TEAL]}
                    style={styles.statGradient}>
                    <FontAwesome5 name="wallet" size={20} color={COLORS.white} />
                    <Text style={styles.statNumber}>₹1250</Text>
                    <Text style={styles.statLabel}>Balance</Text>
                  </LinearGradient>
                </View>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color={COLORS.VERMILION} />
            <Text style={styles.errorText}>Unable to load profile information.</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => {/* Retry logic */}}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Family Information Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{strings.FamilyInformation}</Text>
          <View style={styles.familyCard}>
            <LinearGradient
              colors={[COLORS.white, COLORS.AntiFlashWhite]}
              style={styles.familyCardGradient}>
              <View style={styles.familyRow}>
                <View style={styles.familyAvatarContainer}>
                  <Image
                    source={{
                      uri: 'https://via.placeholder.com/60x60/cccccc/666666?text=S',
                    }}
                    style={styles.familyAvatar}
                  />
                  <View style={styles.familyBadge}>
                    <Text style={styles.familyBadgeText}>Family</Text>
                  </View>
                </View>
                <View style={styles.familyDetails}>
                  <Text style={styles.familyName}>Sanjay</Text>
                  <Text style={styles.familyContact}>709688015</Text>
                  <Text style={styles.familyEmail}>vaghasiya@gmail.com</Text>
                </View>
                <TouchableOpacity style={styles.familyEditBtn}>
                  <MaterialIcons name="edit" size={20} color={COLORS.DODGERBLUE} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          <TouchableOpacity
            style={styles.addFamilyBtn}
            onPress={() => navigation.navigate('Add_FamilyMember')}
            activeOpacity={0.8}>
            <LinearGradient
              colors={[COLORS.DODGERBLUE, COLORS.STEELBLUE]}
              style={styles.addFamilyGradient}>
              <AntDesign name="plus" size={20} color={COLORS.white} />
              <Text style={styles.addFamilyBtnText}>{strings.AddFamilyMember}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Menu Items Section */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Account Settings</Text>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => navigation.navigate('MyAppointment')}
            activeOpacity={0.8}>
            <LinearGradient
              colors={[COLORS.white, COLORS.AntiFlashWhite]}
              style={styles.menuCardGradient}>
              <View style={styles.menuContent}>
                <View style={styles.menuIconContainer}>
                  <Ionicons name="calendar-outline" size={24} color={COLORS.DODGERBLUE} />
                </View>
                <Text style={styles.menuText}>{strings.MyAppointment}</Text>
                <AntDesign name="right" size={20} color={COLORS.ARSENIC} />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => navigation.navigate('OrderHistory')}
            activeOpacity={0.8}>
            <LinearGradient
              colors={[COLORS.white, COLORS.AntiFlashWhite]}
              style={styles.menuCardGradient}>
              <View style={styles.menuContent}>
                <View style={styles.menuIconContainer}>
                  <FontAwesome5 name="receipt" size={22} color={COLORS.greenViridian} />
                </View>
                <Text style={styles.menuText}>{strings.OrderHistory}</Text>
                <AntDesign name="right" size={20} color={COLORS.ARSENIC} />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => navigation.navigate('ChangeLanguage')}
            activeOpacity={0.8}>
            <LinearGradient
              colors={[COLORS.white, COLORS.AntiFlashWhite]}
              style={styles.menuCardGradient}>
              <View style={styles.menuContent}>
                <View style={styles.menuIconContainer}>
                  <AntDesign name="earth" size={24} color={COLORS.orange} />
                </View>
                <Text style={styles.menuText}>{strings.ChangeLanguage}</Text>
                <AntDesign name="right" size={20} color={COLORS.ARSENIC} />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => navigation.navigate('PasswordManager')}
            activeOpacity={0.8}>
            <LinearGradient
              colors={[COLORS.white, COLORS.AntiFlashWhite]}
              style={styles.menuCardGradient}>
              <View style={styles.menuContent}>
                <View style={styles.menuIconContainer}>
                  <FontAwesome5 name="key" size={22} color={COLORS.RobinBlue} />
                </View>
                <Text style={styles.menuText}>{strings.PasswordManager}</Text>
                <AntDesign name="right" size={20} color={COLORS.ARSENIC} />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => navigation.navigate('HelpCenter')}
            activeOpacity={0.8}>
            <LinearGradient
              colors={[COLORS.white, COLORS.AntiFlashWhite]}
              style={styles.menuCardGradient}>
              <View style={styles.menuContent}>
                <View style={styles.menuIconContainer}>
                  <Ionicons name="help-buoy-sharp" size={24} color={COLORS.TEAL} />
                </View>
                <Text style={styles.menuText}>{strings.HelpCenter}</Text>
                <AntDesign name="right" size={20} color={COLORS.ARSENIC} />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => navigation.navigate('CallHistory')}
            activeOpacity={0.8}>
            <LinearGradient
              colors={[COLORS.white, COLORS.AntiFlashWhite]}
              style={styles.menuCardGradient}>
              <View style={styles.menuContent}>
                <View style={styles.menuIconContainer}>
                  <FontAwesome5 name="phone-alt" size={22} color={COLORS.BITTERSEWWT} />
                </View>
                <Text style={styles.menuText}>{strings.CallHistory}</Text>
                <AntDesign name="right" size={20} color={COLORS.ARSENIC} />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => navigation.navigate('PrivacyPolicy')}
            activeOpacity={0.8}>
            <LinearGradient
              colors={[COLORS.white, COLORS.AntiFlashWhite]}
              style={styles.menuCardGradient}>
              <View style={styles.menuContent}>
                <View style={styles.menuIconContainer}>
                  <FontAwesome5 name="shield-alt" size={22} color={COLORS.midnightblue} />
                </View>
                <Text style={styles.menuText}>{strings.PrivacyPolicy}</Text>
                <AntDesign name="right" size={20} color={COLORS.ARSENIC} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Logout Section */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}>
            <LinearGradient
              colors={[COLORS.VERMILION, COLORS.orange]}
              style={styles.logoutGradient}>
              <AntDesign name="logout" size={20} color={COLORS.white} />
              <Text style={styles.logoutText}>{strings.Logout}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(30),
    borderBottomLeftRadius: moderateScale(25),
    borderBottomRightRadius: moderateScale(25),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  profileHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  profileAvatarContainer: {
    position: 'relative',
  },
  profileAvatar: {
    width: scale(80),
    height: scale(80),
    borderRadius: moderateScale(40),
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: scale(5),
    right: scale(5),
    width: scale(16),
    height: scale(16),
    borderRadius: scale(8),
    backgroundColor: COLORS.green,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  profileInfo: {
    flex: 1,
    marginLeft: scale(15),
  },
  profileName: {
    fontSize: moderateScale(22),
    fontFamily: Fonts.Bold,
    color: COLORS.white,
    marginBottom: verticalScale(4),
  },
  profileContact: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Medium,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: verticalScale(2),
  },
  profileEmail: {
    fontSize: moderateScale(12),
    fontFamily: Fonts.Regular,
    color: 'rgba(255,255,255,0.8)',
  },
  editProfileBtn: {
    padding: scale(10),
  },
  editBtnGradient: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(50),
  },
  loadingText: {
    marginTop: verticalScale(10),
    fontSize: moderateScale(16),
    color: COLORS.ARSENIC,
    fontFamily: Fonts.Medium,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(50),
    paddingHorizontal: scale(20),
  },
  errorText: {
    fontSize: moderateScale(16),
    color: COLORS.ARSENIC,
    fontFamily: Fonts.Medium,
    textAlign: 'center',
    marginTop: verticalScale(10),
    marginBottom: verticalScale(20),
  },
  retryBtn: {
    backgroundColor: COLORS.DODGERBLUE,
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(20),
    borderRadius: moderateScale(20),
  },
  retryText: {
    color: COLORS.white,
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(14),
  },
  statsContainer: {
    marginTop: verticalScale(20),
    paddingHorizontal: scale(20),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontFamily: Fonts.Bold,
    color: COLORS.ARSENIC,
    marginBottom: verticalScale(15),
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - scale(50)) / 2,
    marginBottom: verticalScale(15),
    borderRadius: moderateScale(15),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statGradient: {
    borderRadius: moderateScale(15),
    padding: scale(20),
    alignItems: 'center',
  },
  statNumber: {
    fontSize: moderateScale(20),
    fontFamily: Fonts.Bold,
    color: COLORS.white,
    marginTop: verticalScale(8),
  },
  statLabel: {
    fontSize: moderateScale(12),
    fontFamily: Fonts.Medium,
    color: 'rgba(255,255,255,0.9)',
    marginTop: verticalScale(4),
  },
  sectionContainer: {
    marginTop: verticalScale(25),
    paddingHorizontal: scale(20),
  },
  familyCard: {
    marginBottom: verticalScale(15),
    borderRadius: moderateScale(15),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  familyCardGradient: {
    borderRadius: moderateScale(15),
    padding: scale(15),
  },
  familyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  familyAvatarContainer: {
    position: 'relative',
  },
  familyAvatar: {
    width: scale(50),
    height: scale(50),
    borderRadius: moderateScale(25),
  },
  familyBadge: {
    position: 'absolute',
    top: scale(-5),
    left: scale(-5),
    backgroundColor: COLORS.DODGERBLUE,
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(8),
  },
  familyBadgeText: {
    color: COLORS.white,
    fontSize: moderateScale(8),
    fontFamily: Fonts.Bold,
  },
  familyDetails: {
    flex: 1,
    marginLeft: scale(12),
  },
  familyName: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Bold,
    color: COLORS.ARSENIC,
    marginBottom: verticalScale(2),
  },
  familyContact: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Medium,
    color: COLORS.ARSENIC,
  },
  familyEmail: {
    fontSize: moderateScale(12),
    fontFamily: Fonts.Regular,
    color: COLORS.lineBlack,
  },
  familyEditBtn: {
    padding: scale(8),
  },
  addFamilyBtn: {
    marginTop: verticalScale(10),
    borderRadius: moderateScale(25),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addFamilyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(25),
    borderRadius: moderateScale(25),
  },
  addFamilyBtnText: {
    color: COLORS.white,
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(14),
    marginLeft: scale(8),
  },
  menuContainer: {
    marginTop: verticalScale(25),
    paddingHorizontal: scale(20),
  },
  menuCard: {
    marginBottom: verticalScale(8),
    borderRadius: moderateScale(12),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  menuCardGradient: {
    borderRadius: moderateScale(12),
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(18),
  },
  menuIconContainer: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(20),
    backgroundColor: 'rgba(40, 127, 240, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(15),
  },
  menuText: {
    flex: 1,
    fontSize: moderateScale(16),
    fontFamily: Fonts.Medium,
    color: COLORS.ARSENIC,
  },
  logoutContainer: {
    marginTop: verticalScale(30),
    marginBottom: verticalScale(30),
    paddingHorizontal: scale(20),
  },
  logoutButton: {
    borderRadius: moderateScale(25),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(15),
    paddingHorizontal: scale(30),
    borderRadius: moderateScale(25),
  },
  logoutText: {
    color: COLORS.white,
    fontSize: moderateScale(16),
    fontFamily: Fonts.Bold,
    marginLeft: scale(10),
  },
});
