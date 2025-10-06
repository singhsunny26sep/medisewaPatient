import React, {useState, useEffect} from 'react';
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
} from 'react-native';
import {Container} from '../../component/Container/Container';
import {COLORS} from '../../Theme/Colors';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
import {Fonts} from '../../Theme/Fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Instance} from '../../api/Instance';
import { INITIATE_CALL } from '../../api/Api_Controller';

export default function Specialist_List({route,navigation}) {
  const {specialistId} = route.params;
  console.log('Specialist ID:', specialistId);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDoctorsByDepartment = async () => {
      try {
        console.log('Specialist_List: fetching doctors for specialistId:', specialistId);
        console.log('Specialist_List: request ->', `/api/v1/doctors/search/${specialistId}?type=Specialist`);
        const response = await Instance.get(
          `/api/v1/doctors/search/${specialistId}?type=Specialist`,
        );
        console.log('Specialist_List: response summary:', {
          status: response?.status,
          success: response?.data?.success,
          length: Array.isArray(response?.data?.result)
            ? response.data.result.length
            : undefined,
        });
        console.log('Specialist_List: full response data:', response?.data);
        setDoctors(response.data.result);
        setFilteredDoctors(response.data.result);
      } catch (error) {
        console.log('Specialist_List: error while fetching doctors:', {
          message: error?.message,
          status: error?.response?.status,
          data: error?.response?.data,
        });
        console.error('Error fetching doctor data by department: ', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctorsByDepartment();
  }, [specialistId]);

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
    console.log('=== handleMobilePress START ===');
    console.log('Doctor:', doctor?.name, doctor?._id);
    console.log('Current modal state:', isModalVisible);
    console.log('Setting selectedDoctor to:', doctor?.name);

    setSelectedDoctor(doctor);
    console.log('Setting modal visibility to true');
    setIsModalVisible(true);

    // Force update check
    setTimeout(() => {
      console.log('After timeout - Modal state:', isModalVisible);
      console.log('Selected doctor:', selectedDoctor?.name);
    }, 100);

    console.log('=== handleMobilePress END ===');
  };

  const initiateCall = async (doctor, type) => {
    if (!doctor?.userId) {
      console.log('initiateCall: missing doctor.userId, item:', doctor);
      return;
    }
    try {
      const recieverId = doctor.userId;
      const callType = type; // 'audio' | 'video'
      console.log('Specialist_List initiateCall: request ->', { recieverId, callType });
      const data = await INITIATE_CALL({ recieverId, callType });
      console.log('Specialist_List initiateCall: response ->', data);
      return data; // Return the call data
    } catch (error) {
      console.log('Specialist_List initiateCall: error ->', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      throw error; // Re-throw to handle in calling component
    }
  };

  return (
    <Container
      statusBarStyle={'light-content'}
      statusBarBackgroundColor={COLORS.DODGERBLUE}
      backgroundColor={COLORS.white}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={25} color={COLORS.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.LocationView}>
          <Text numberOfLines={1} style={styles.locationText}>
            Dr List
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchHeader}>
        <View style={styles.searchTouch}>
          <TextInput
            placeholder="Search...."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <Ionicons
            name="search-circle-sharp"
            size={40}
            color={COLORS.DODGERBLUE}
          />
        </View>
      </View>
      {/* Temporary test button to force modal open */}


      <FlatList
        data={filteredDoctors}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item._id.toString()}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={50} color={COLORS.gray} />
            <Text style={styles.emptyText}>No doctors found</Text>
            <Text style={styles.emptySubText}>
              Try searching with different keywords
            </Text>
          </View>
        )}
        renderItem={({item}) => {
          return (
            <View style={styles.card}>
              <View style={styles.cardContent}>
                <Image source={{uri: item.image}} style={styles.cardImage} />
                <View style={styles.cardText}>
                  <Text style={styles.drName}>{item.name}</Text>
                  <Text style={styles.drType}>{item.department?.name || 'Not Available'}</Text>
                  <Text style={styles.experience}>
                    {item.doctorId?.experience || '0'} years experience
                  </Text>
                  <Text style={styles.specialization}>
                    {item.specialization?.name || 'Not Available'}
                  </Text>

                  {/* Simple button for calling */}
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => {
                      console.log('=== CALL BUTTON PRESSED ===');
                      console.log('Doctor:', item.name, item._id);
                      console.log('Current state before:', { isModalVisible, selectedDoctor: selectedDoctor?.name });
                      handleMobilePress(item);
                    }}
                    activeOpacity={0.7}>
                    <Ionicons name="call" size={20} color={COLORS.white} />
                    <Text style={styles.callButtonText}>Call Now</Text>
                  </TouchableOpacity>

                  <View style={styles.statusContainer}>
                    <View
                      style={[
                        styles.statusDot,
                        {backgroundColor: item.isOnline ? 'green' : 'red'},
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        {color: item.isOnline ? 'green' : 'red'},
                      ]}>
                      {item.isOnline ? 'Online' : 'Offline'}
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.bookingButton}
                onPress={() =>
                  navigation.navigate('Dr_AppointmentBook', {
                    doctorId: item.userId,
                  })
                }>
                <Text style={styles.bookingText}>Booking Appointment</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
      {console.log('=== MODAL RENDER CHECK ===')}
      {console.log('isModalVisible:', isModalVisible)}
      {console.log('selectedDoctor:', selectedDoctor?.name)}
      {console.log('========================')}
      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => {
          console.log('Modal onRequestClose called');
          setIsModalVisible(false);
        }}
        onShow={() => console.log('Modal onShow called - modal is now visible!')}
        onDismiss={() => console.log('Modal onDismiss called - modal is now hidden')}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.callOption}
                onPress={async () => {
                  console.log('Audio call button pressed for doctor:', selectedDoctor?.name);
                  setIsModalVisible(false);
                  try {
                    const callData = await initiateCall(selectedDoctor, 'audio');
                    console.log('Audio call initiated successfully, navigating to AudioCall');
                    navigation.navigate('AudioCall', {
                      doctor: selectedDoctor,
                      callData: callData?.data
                    });
                  } catch (error) {
                    // Handle error - show alert or toast
                    console.log('Failed to initiate audio call:', error);
                  }
                }}>
                <Ionicons name="call" size={30} color={COLORS.DODGERBLUE} />
                <Text style={styles.callOptionText}>Audio Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.callOption}
                onPress={async () => {
                  console.log('Video call button pressed for doctor:', selectedDoctor?.name);
                  setIsModalVisible(false);
                  try {
                    const callData = await initiateCall(selectedDoctor, 'video');
                    console.log('Video call initiated successfully, navigating to VideoCall');
                    navigation.navigate('VideoCall', {
                      doctor: selectedDoctor,
                      callData: callData?.data
                    });
                  } catch (error) {
                    // Handle error - show alert or toast
                    console.log('Failed to initiate video call:', error);
                  }
                }}>
                <Ionicons name="videocam" size={30} color={COLORS.DODGERBLUE} />
                <Text style={styles.callOptionText}>Video Call</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                console.log('Cancel button pressed');
                setIsModalVisible(false);
              }}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    backgroundColor: COLORS.DODGERBLUE,
  },
  locationText: {
    fontSize: moderateScale(18),
    color: COLORS.white,
    paddingLeft: scale(10),
    fontFamily: Fonts.Light,
  },
  LocationView: {
    flex: 1,
  },
  searchHeader: {
    height: verticalScale(70),
    backgroundColor: COLORS.DODGERBLUE,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: moderateScale(10),
    borderBottomRightRadius: moderateScale(10),
  },
  searchTouch: {
    flexDirection: 'row',
    width: '90%',
    backgroundColor: COLORS.white,
    borderColor: COLORS.AntiFlashWhite,
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(15),
    elevation: 3,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: verticalScale(40),
  },
  card: {
    marginVertical: verticalScale(7),
    marginHorizontal: scale(15),
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(8),
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(4),
    paddingBottom: verticalScale(5),
  },
  cardTouchable: {
    borderRadius: moderateScale(8),
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(10),
  },
  cardImage: {
    width: scale(85),
    height: scale(85),
    borderRadius: moderateScale(45),
    marginRight: scale(16),
    borderWidth: 0.5,
    borderColor: COLORS.black,
  },
  cardText: {
    flex: 1,
  },
  drName: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Bold,
    color: COLORS.black,
  },
  drType: {
    fontSize: moderateScale(14),
    color: COLORS.DODGERBLUE,
    marginVertical: verticalScale(1),
    fontFamily: Fonts.Light,
  },
  experience: {
    fontSize: moderateScale(13),
    color: COLORS.gray,
    fontFamily: Fonts.Regular,
  },
  specialization: {
    fontSize: moderateScale(13),
    color: COLORS.DODGERBLUE,
    fontFamily: Fonts.Regular,
    marginVertical: verticalScale(3),
  },
  callButton: {
    backgroundColor: COLORS.DODGERBLUE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(8),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(20),
    borderRadius: moderateScale(8),
    elevation: 3,
    shadowColor: COLORS.DODGERBLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  mobile: {
    fontSize: moderateScale(14),
    color: COLORS.black,
    marginLeft: scale(5),
    fontFamily: Fonts.Medium,
  },
  callButtonText: {
    color: COLORS.white,
    fontSize: moderateScale(14),
    fontFamily: Fonts.Medium,
    marginLeft: scale(8),
  },
  bookingButton: {
    marginTop: verticalScale(3),
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: COLORS.AshGray,
  },
  bookingText: {
    color: COLORS.DODGERBLUE,
    fontSize: moderateScale(16),
    fontFamily: Fonts.Light,
    paddingTop: scale(5),
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: moderateScale(16),
    color: COLORS.DODGERBLUE,
    fontFamily: Fonts.Medium,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(5),
  },
  statusDot: {
    width: scale(10),
    height: scale(10),
    borderRadius: scale(5),
    marginRight: scale(6),
  },
  statusText: {
    fontSize: moderateScale(13),
    color: COLORS.gray,
    fontFamily: Fonts.Medium,
    top: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    padding: scale(20),
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  callOption: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(15),
    minWidth: scale(80),
    minHeight: scale(80),
    borderRadius: moderateScale(10),
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  callOptionText: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(14),
    color: COLORS.DODGERBLUE,
    fontFamily: Fonts.Medium,
  },
  cancelButton: {
    marginTop: verticalScale(20),
    backgroundColor: COLORS.red,
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(30),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    elevation: 3,
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },

  cancelButtonText: {
    fontSize: moderateScale(16),
    color: COLORS.white,
    fontFamily: Fonts.Medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(50),
  },
  emptyText: {
    fontSize: moderateScale(18),
    color: COLORS.black,
    fontFamily: Fonts.Medium,
    marginTop: verticalScale(10),
  },
  emptySubText: {
    fontSize: moderateScale(14),
    color: COLORS.gray,
    fontFamily: Fonts.Regular,
    marginTop: verticalScale(5),
  },
});
