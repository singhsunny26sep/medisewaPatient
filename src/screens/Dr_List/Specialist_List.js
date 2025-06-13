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
        const response = await Instance.get(
          `/api/v1/doctors/search/${specialistId}?type=Specialist`,
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
    setSelectedDoctor(doctor);
    setIsModalVisible(true);
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
                  <TouchableOpacity
                    style={styles.contact}
                    onPress={() => handleMobilePress(item)}>
                    <Ionicons name="call" size={23} color={COLORS.DODGERBLUE} />
                    <Text style={styles.mobile}>{item.contactNumber}</Text>
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
      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.callOption}
                onPress={() => {
                  setIsModalVisible(false);
                  navigation.navigate('AudioCall', {doctor: selectedDoctor});
                }}>
                <Ionicons name="call" size={30} color={COLORS.DODGERBLUE} />
                <Text style={styles.callOptionText}>Audio Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.callOption}
                onPress={() => navigation.navigate('VideoCall')}>
                <Ionicons name="videocam" size={30} color={COLORS.DODGERBLUE} />
                <Text style={styles.callOptionText}>Video Call</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsModalVisible(false)}>
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
  contact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(5),
  },
  mobile: {
    fontSize: moderateScale(14),
    color: COLORS.black,
    marginLeft: scale(5),
    fontFamily: Fonts.Medium,
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    padding: scale(20),
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
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
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(10),
    alignItems: 'center',
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
