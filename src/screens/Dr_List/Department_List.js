import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  Modal,
  StatusBar,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Container } from '../../component/Container/Container';
import { COLORS } from '../../Theme/Colors';
import { moderateScale, scale, verticalScale } from '../../utils/Scaling';
import { Fonts } from '../../Theme/Fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Instance } from '../../api/Instance';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 380;

export default function Department_List({ route, navigation }) {
  const { departmentId } = route.params;
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDoctorsByDepartment = async () => {
      try {
        const response = await Instance.get(
          `/api/v1/doctors/search/${departmentId}?type=Department`,
        );
        setDoctors(response.data.result);
        setFilteredDoctors(response.data.result);
      } catch (error) {
        console.error('Error fetching doctor data by department: ', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctorsByDepartment();
  }, [departmentId]);

  const handleSearch = text => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredDoctors(doctors);
    } else {
      const filtered = doctors.filter(
        doctor =>
          doctor.name.toLowerCase().includes(text.toLowerCase()) ||
          doctor.role.toLowerCase().includes(text.toLowerCase()) ||
          (doctor.doctorId?.specialization?.name || '')
            .toLowerCase()
            .includes(text.toLowerCase()),
      );
      setFilteredDoctors(filtered);
    }
  };

  const handleMobilePress = doctor => {
    setSelectedDoctor(doctor);
    setIsModalVisible(true);
  };

  const renderDoctorCard = ({ item, index }) => {
    const scaleValue = new Animated.Value(0);
    Animated.spring(scaleValue, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
      delay: index * 100,
    }).start();

    return (
      <Animated.View style={[styles.cardWrapper, { transform: [{ scale: scaleValue }] }]}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.doctorInfo}>
              <View style={styles.imageContainer}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.cardImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="person" size={30} color={COLORS.DODGERBLUE} />
                  </View>
                )}
                <View style={[
                  styles.onlineIndicator,
                  { backgroundColor: item.isOnline ? '#4CAF50' : '#9E9E9E' }
                ]} />
              </View>
              <View style={styles.doctorDetails}>
                <Text style={styles.drName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.departmentBadge}>
                  <Text style={styles.drType}>
                    {item.department?.name || 'Not Available'}
                  </Text>
                </View>
                <View style={styles.specializationBadge}>
                  <Ionicons name="medical" size={12} color={COLORS.DODGERBLUE} />
                  <Text style={styles.specialization} numberOfLines={1}>
                    {item.specialization?.name || 'General'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="briefcase-outline" size={14} color={COLORS.DODGERBLUE} />
              </View>
              <Text style={styles.infoText}>
                {item.doctorId?.experience || '0'} years experience
              </Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="star" size={14} color="#FFD700" />
              </View>
              <Text style={styles.infoText}>
                {item.doctorId?.rating || '4.5'} ({item.doctorId?.reviews || '500'} reviews)
              </Text>
            </View>
            <View style={[styles.statusContainer, item.isOnline ? styles.onlineStatus : styles.offlineStatus]}>
              <View style={[styles.statusDot, { backgroundColor: item.isOnline ? '#4CAF50' : '#9E9E9E' }]} />
              <Text style={[styles.statusText, { color: item.isOnline ? '#4CAF50' : '#9E9E9E' }]}>
                {item.isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => handleMobilePress(item)}>
              <View style={styles.contactButtonContent}>
                <Ionicons name="call-outline" size={18} color={COLORS.DODGERBLUE} />
                <Text style={styles.contactText}>Call Now</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bookingButton}
              onPress={() =>
                navigation.navigate('Dr_AppointmentBook', {
                  doctorId: item.userId,
                })
              }>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.bookingButtonGradient}>
                <Text style={styles.bookingText}>Book Appointment</Text>
                <Ionicons name="arrow-forward" size={14} color={COLORS.white} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="search" size={50} color={COLORS.DODGERBLUE} />
      </View>
      <Text style={styles.emptyText}>No doctors found</Text>
      <Text style={styles.emptySubText}>
        Try searching with different keywords
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <Container
        statusBarStyle={'light-content'}
        statusBarBackgroundColor={COLORS.DODGERBLUE}
        backgroundColor={COLORS.white}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.DODGERBLUE} />
          <Text style={styles.loaderText}>Loading doctors...</Text>
        </View>
      </Container>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar
        backgroundColor={COLORS.DODGERBLUE}
        barStyle="light-content"
      />
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Department Doctors</Text>
            <Text style={styles.headerSubtitle}>
              {filteredDoctors.length} doctors available
            </Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <Ionicons name="search-outline" size={20} color={COLORS.DODGERBLUE} />
            <TextInput
              placeholder="Search doctors..."
              placeholderTextColor={COLORS.lightGrey}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={20} color={COLORS.lightGrey} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={filteredDoctors}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item._id.toString()}
        ListEmptyComponent={renderEmptyList}
        renderItem={renderDoctorCard}
        contentContainerStyle={styles.listContainer}
      />

      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Contact Dr. {selectedDoctor?.name}</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.black} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setIsModalVisible(false);
                  navigation.navigate('AudioCall', { doctor: selectedDoctor });
                }}>
                <View style={[styles.modalIconContainer, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="call" size={28} color={COLORS.DODGERBLUE} />
                </View>
                <View style={styles.modalOptionText}>
                  <Text style={styles.modalOptionTitle}>Audio Call</Text>
                  <Text style={styles.modalOptionDescription}>Voice consultation</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={COLORS.lightGrey} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setIsModalVisible(false);
                  navigation.navigate('VideoCall', { doctor: selectedDoctor });
                }}>
                <View style={[styles.modalIconContainer, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="videocam" size={28} color="#4CAF50" />
                </View>
                <View style={styles.modalOptionText}>
                  <Text style={styles.modalOptionTitle}>Video Call</Text>
                  <Text style={styles.modalOptionDescription}>Face to face</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={COLORS.lightGrey} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setIsModalVisible(false);
                }}>
                <View style={[styles.modalIconContainer, { backgroundColor: '#FFF3E0' }]}>
                  <Ionicons name="chatbubbles" size={28} color="#FF9800" />
                </View>
                <View style={styles.modalOptionText}>
                  <Text style={styles.modalOptionTitle}>Text Chat</Text>
                  <Text style={styles.modalOptionDescription}>Send messages</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={COLORS.lightGrey} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  headerGradient: {
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(15),
    borderBottomLeftRadius: moderateScale(25),
    borderBottomRightRadius: moderateScale(25),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
  },
  backButton: {
    padding: scale(8),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: moderateScale(12),
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: scale(12),
  },
  headerTitle: {
    fontSize: moderateScale(20),
    color: COLORS.white,
    fontFamily: Fonts.Bold,
  },
  headerSubtitle: {
    fontSize: moderateScale(12),
    color: 'rgba(255,255,255,0.8)',
    fontFamily: Fonts.Regular,
    marginTop: verticalScale(2),
  },
  filterButton: {
    padding: scale(8),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: moderateScale(12),
  },
  searchContainer: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(10),
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(15),
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(4),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  searchInput: {
    flex: 1,
    marginLeft: scale(10),
    fontSize: moderateScale(14),
    color: COLORS.black,
    fontFamily: Fonts.Regular,
    height: verticalScale(40),
  },
  listContainer: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(15),
    paddingBottom: verticalScale(20),
  },
  cardWrapper: {
    marginBottom: verticalScale(12),
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(20),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  cardHeader: {
    padding: scale(15),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: scale(65),
    height: scale(65),
    borderRadius: moderateScale(35),
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  imagePlaceholder: {
    width: scale(65),
    height: scale(65),
    borderRadius: moderateScale(35),
    backgroundColor: '#F5F6FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#F5F6FA',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: scale(16),
    height: scale(16),
    borderRadius: scale(8),
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  doctorDetails: {
    marginLeft: scale(12),
    flex: 1,
  },
  drName: {
    fontSize: moderateScale(17),
    fontFamily: Fonts.Bold,
    color: COLORS.black,
    marginBottom: verticalScale(3),
  },
  departmentBadge: {
    backgroundColor: 'rgba(102,126,234,0.1)',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(3),
    borderRadius: moderateScale(8),
    alignSelf: 'flex-start',
    marginBottom: verticalScale(5),
  },
  drType: {
    fontSize: moderateScale(12),
    color: COLORS.DODGERBLUE,
    fontFamily: Fonts.SemiBold,
  },
  specializationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specialization: {
    fontSize: moderateScale(12),
    color: COLORS.lightGrey,
    fontFamily: Fonts.Regular,
    marginLeft: scale(4),
    flex: 1,
  },
  cardBody: {
    padding: scale(15),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(6),
  },
  infoIconContainer: {
    width: scale(26),
    height: scale(26),
    borderRadius: scale(13),
    backgroundColor: 'rgba(102,126,234,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(8),
  },
  infoText: {
    fontSize: moderateScale(12),
    color: COLORS.ARSENIC,
    fontFamily: Fonts.Medium,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
    marginTop: verticalScale(4),
  },
  onlineStatus: {
    backgroundColor: 'rgba(76,175,80,0.1)',
  },
  offlineStatus: {
    backgroundColor: 'rgba(158,158,158,0.1)',
  },
  statusDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    marginRight: scale(6),
  },
  statusText: {
    fontSize: moderateScale(12),
    fontFamily: Fonts.Medium,
  },
  cardFooter: {
    flexDirection: 'row',
    padding: scale(15),
    paddingTop: 0,
  },
  contactButton: {
    flex: 1,
    marginRight: scale(10),
  },
  contactButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(102,126,234,0.1)',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(12),
  },
  contactText: {
    fontSize: moderateScale(13),
    color: COLORS.DODGERBLUE,
    fontFamily: Fonts.SemiBold,
    marginLeft: scale(8),
  },
  bookingButton: {
    flex: 1.5,
    borderRadius: moderateScale(12),
    overflow: 'hidden',
  },
  bookingButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(15),
  },
  bookingText: {
    fontSize: moderateScale(13),
    color: COLORS.white,
    fontFamily: Fonts.SemiBold,
    marginRight: scale(6),
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: verticalScale(10),
    fontSize: moderateScale(14),
    color: COLORS.DODGERBLUE,
    fontFamily: Fonts.Medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(50),
  },
  emptyIconContainer: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    backgroundColor: 'rgba(102,126,234,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  emptyText: {
    fontSize: moderateScale(18),
    fontFamily: Fonts.Bold,
    color: COLORS.black,
    marginBottom: verticalScale(8),
  },
  emptySubText: {
    fontSize: moderateScale(14),
    color: COLORS.lightGrey,
    fontFamily: Fonts.Regular,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: moderateScale(25),
    borderTopRightRadius: moderateScale(25),
    paddingBottom: verticalScale(30),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(20),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontFamily: Fonts.Bold,
    color: COLORS.black,
  },
  modalCloseButton: {
    padding: scale(5),
  },
  modalContent: {
    padding: scale(20),
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(15),
    backgroundColor: '#F8F9FA',
    borderRadius: moderateScale(15),
    marginBottom: scale(12),
  },
  modalIconContainer: {
    width: scale(55),
    height: scale(55),
    borderRadius: moderateScale(15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOptionText: {
    flex: 1,
    marginLeft: scale(15),
  },
  modalOptionTitle: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.SemiBold,
    color: COLORS.black,
  },
  modalOptionDescription: {
    fontSize: moderateScale(13),
    color: COLORS.lightGrey,
    fontFamily: Fonts.Regular,
    marginTop: verticalScale(2),
  },
});
