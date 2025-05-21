import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {Container} from '../../component/Container/Container';
import {COLORS} from '../../Theme/Colors';
import CustomHeader from '../../component/header/CustomHeader';
import {moderateScale, scale} from '../../utils/Scaling';
import {Fonts} from '../../Theme/Fonts';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomTextInput from '../../component/texinput/CustomTextInput';
import CustomDropdown from '../../component/CustomDropdown/CustomDropdown';
import {Instance} from '../../api/Instance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import ToastMessage from '../../component/ToastMessage/ToastMessage';

export default function Dr_AppointmentBook({route, navigation}) {
  const {doctorId} = route.params;
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [checkupType, setCheckupType] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointmentTypeOpen, setAppointmentTypeOpen] = useState(false);
  const [appointmentType, setAppointmentType] = useState(null);
  const appointmentTypeItems = [
    {label: 'For Myself', value: 'self'},
    {label: 'For Family Member', value: 'family'},
  ];

  const availableSlots = [
    '9:00 AM',
    '9:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
  ];

  const handleConfirm = date => {
    setSelectedDate(date);
    setDatePickerVisibility(false);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const handleTimeSelect = time => {
    setSelectedTime(time);
  };

  const fetchDoctorDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const response = await Instance.get(`/api/v1/doctors/${doctorId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.success) {
          setDoctorDetails(response.data.result);
        }
      } else {
        console.log('Token not found!');
      }
    } catch (error) {
      console.error(
        'Error fetching doctor details:',
        error.response ? error.response.data : error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorDetails();
  }, [doctorId]);

  const renderDoctorItem = () => {
    if (!doctorDetails) return null;

    const {
      doctorId: {
        name,
        specialization,
        contactNumber,
        experience,
        image,
        department,
        clinicAddress,
        fee,
        oldFee,
        gender: doctorGender,
        startTime,
        endTime,
      },
    } = doctorDetails;
    return (
      <View style={styles.container}>
        <Image
          source={{
            uri:
              image ||
              'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLU7h0cdnX8yFq-73gpabJjRLSJDVu7oQZ4w&s',
          }}
          style={styles.doctorImage}
        />
        <View style={styles.detailsContainer}>
          <Text style={styles.doctorName}>Dr. {name}</Text>
          <Text style={styles.doctorSpecialization}>
            Specialization: {specialization?.name}
          </Text>

          <View style={styles.doctorInfoContainer}>
            <View style={styles.doctorInfoRow}>
              <Icon name="phone" size={scale(20)} color={COLORS.DODGERBLUE} />
              <Text style={styles.doctorInfoText}>Mo. {contactNumber}</Text>
            </View>
            <View style={styles.doctorInfoRow}>
              <Icon name="work" size={scale(20)} color={COLORS.DODGERBLUE} />
              <Text style={styles.doctorInfoText}>
                {experience} years of experience
              </Text>
            </View>
            <View style={styles.doctorInfoRow}>
              <Icon
                name="business"
                size={scale(20)}
                color={COLORS.DODGERBLUE}
              />
              <Text style={styles.doctorInfoText}>
                Department: {department?.name}
              </Text>
            </View>
            <View style={styles.doctorInfoRow}>
              <Icon
                name="accessibility"
                size={scale(20)}
                color={COLORS.DODGERBLUE}
              />
              <Text style={styles.doctorInfoText}>Gender: {doctorGender}</Text>
            </View>
            <View style={styles.doctorInfoRow}>
              <Icon
                name="location-on"
                size={scale(20)}
                color={COLORS.DODGERBLUE}
              />
              <Text style={styles.doctorInfoText}>Clinic: {clinicAddress}</Text>
            </View>
            <View style={styles.doctorInfoRow}>
              <Icon
                name="attach-money"
                size={scale(20)}
                color={COLORS.DODGERBLUE}
              />
              <Text style={styles.doctorInfoText}>
                Fee: ₹{fee} (Old Fee: ₹{oldFee})
              </Text>
            </View>
            <View style={styles.doctorInfoRow}>
              <Icon
                name="access-time"
                size={scale(20)}
                color={COLORS.DODGERBLUE}
              />
              <Text style={styles.doctorInfoText}>
                Availability: {startTime} to {endTime}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const handleSubmitAppointment = async () => {
    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        alert('User not authenticated!');
        return;
      }

      if (!appointmentType) {
        setToastMessage('Please select appointment type');
        setToastType('danger');
        setIsSubmitting(false);
        return;
      }

      const date = selectedDate || new Date();
      const formattedDate = moment(date).format(
        'YYYY-MM-DDT00:00:00.000+00:00',
      );
      const formattedTime = moment(selectedTime, 'h:mm A').format('HH:mm');

      const payload = {
        doctorId: doctorDetails?.doctorId?._id,
        appointmentDate: formattedDate,
        appointmentTime: formattedTime,
        consultationFee: doctorDetails?.doctorId?.fee?.toString() || '500',
        serviceCharge: '0',
        appointmentType: appointmentType,
      };

      console.log('Booking payload:', payload);

      const response = await Instance.post(
        '/api/v1/bookings/book/appointment/null',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        setToastMessage('Appointment booked successfully!');
        setToastType('success');
        navigation.goBack();
      } else {
        setToastMessage('Failed to book appointment');
        setToastType('danger');
      }
    } catch (error) {
      console.error('Booking error:', error.response?.data || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container
      statusBarStyle={'dark-content'}
      statusBarBackgroundColor={COLORS.white}
      backgroundColor={COLORS.white}>
      <CustomHeader title="Dr. Appointment Booking" navigation={navigation} />
      <ScrollView contentContainerStyle={styles.scrollView}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.DODGERBLUE}
            style={styles.loader}
          />
        ) : doctorDetails ? (
          <FlatList
            data={[doctorDetails]}
            renderItem={renderDoctorItem}
            keyExtractor={item => item?.doctorId?._id?.toString()}
          />
        ) : (
          {}
        )}

        <View style={styles.dropdownContainer}>
          <Text style={[styles.selectDateText,{marginHorizontal:scale(0)}]}>Appointment For</Text>
          <CustomDropdown
            data={appointmentTypeItems}
            value={appointmentType}
            onChange={setAppointmentType}
            placeholder="Select appointment type"
            style={styles.dropdown}
            containerStyle={styles.dropdownContainerStyle}
          />
        </View>

        <View>
          <Text style={styles.selectDateText}>Select Date</Text>
          <TouchableOpacity onPress={showDatePicker}>
            <View style={styles.dateContainer}>
              <Icon
                name="date-range"
                size={scale(20)}
                color={'grey'}
                style={styles.icon}
              />
              <Text style={styles.selectedDate}>
                {selectedDate
                  ? selectedDate.toLocaleDateString()
                  : 'Select a date'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={[styles.selectDateText, styles.availableSlotsText]}>
          Available Slots
        </Text>
        <View style={styles.timeSlotsContainer}>
          <FlatList
            data={availableSlots}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.timeSlotBox,
                  selectedTime === item && styles.selectedTimeSlot,
                ]}
                onPress={() => handleTimeSelect(item)}>
                <Text
                  style={[
                    styles.timeSlotText,
                    selectedTime === item && styles.selectedTimeText,
                  ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={item => item}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <TouchableOpacity onPress={handleSubmitAppointment} disabled={isSubmitting}>
          <View style={styles.submitButton}>
            {isSubmitting ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>Submit Appointment</Text>
            )}
          </View>
        </TouchableOpacity>
      </ScrollView>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={() => setDatePickerVisibility(false)}
      />
      {toastMessage && <ToastMessage type={toastType} message={toastMessage} />}
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    paddingBottom: scale(20),
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: scale(20),
  },
  errorText: {
    fontSize: moderateScale(16),
    color: COLORS.red,
    textAlign: 'center',
    marginTop: scale(20),
  },
  container: {
    paddingHorizontal: scale(15),
    marginTop: scale(20),
  },
  doctorImage: {
    height: scale(175),
    width: scale(175),
    alignSelf: 'center',
    borderRadius: scale(90),
    borderWidth: 1,
  },
  detailsContainer: {
    marginTop: scale(5),
    padding: scale(15),
    backgroundColor: COLORS.white,
    borderRadius: scale(10),
    shadowColor: COLORS.black,
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: scale(5),
    elevation: 5,
    marginBottom: 10,
  },
  doctorImage: {
    height: scale(180),
    width: scale(180),
    alignSelf: 'center',
    borderRadius: scale(90),
    borderWidth: 1,
    marginBottom: scale(15),
  },
  doctorName: {
    fontFamily: Fonts.Bold,
    color: COLORS.black,
    fontSize: moderateScale(20),
    textAlign: 'center',
    marginBottom: scale(5),
  },
  doctorSpecialization: {
    fontFamily: Fonts.Medium,
    color: COLORS.DODGERBLUE,
    fontSize: moderateScale(16),
    textAlign: 'center',
    marginBottom: scale(10),
  },
  doctorInfoContainer: {
    marginTop: scale(10),
  },
  doctorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: scale(5),
  },
  doctorInfoText: {
    fontFamily: Fonts.Medium,
    color: COLORS.black,
    fontSize: moderateScale(14),
    marginLeft: scale(10),
  },
  inputContainer: {
    paddingHorizontal: scale(15),
    borderTopWidth: 0.5,
    borderColor: COLORS.AshGray,
    paddingTop: scale(15),
    marginTop: scale(5),
  },
  selectDateText: {
    fontFamily: Fonts.Medium,
    color: COLORS.black,
    marginHorizontal: scale(15),
    fontSize: moderateScale(16),
    marginBottom: scale(8),
  },
  availableSlotsText: {
    marginTop: scale(15),
  },
  dateContainer: {
    padding: scale(10),
    borderWidth: 1,
    borderColor: COLORS.AshGray,
    borderRadius: scale(8),
    backgroundColor: COLORS.white,
    marginHorizontal: scale(15),
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: scale(10),
  },
  selectedDate: {
    fontFamily: Fonts.Medium,
    color: 'grey',
    fontSize: moderateScale(15),
    top: 2,
  },
  timeSlotsContainer: {
    paddingHorizontal: scale(15),
  },
  timeSlotBox: {
    padding: scale(10),
    marginRight: scale(10),
    borderWidth: 1,
    borderColor: COLORS.AshGray,
    borderRadius: scale(8),
    backgroundColor: COLORS.white,
  },
  selectedTimeSlot: {
    backgroundColor: COLORS.DODGERBLUE,
    borderColor: COLORS.DODGERBLUE,
  },
  timeSlotText: {
    color: COLORS.black,
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(14),
  },
  selectedTimeText: {
    color: COLORS.white,
  },
  submitButton: {
    marginTop: scale(30),
    marginHorizontal: scale(15),
    backgroundColor: COLORS.DODGERBLUE,
    paddingVertical: scale(9),
    borderRadius: scale(8),
    alignItems: 'center',
  },
  submitButtonText: {
    color: COLORS.white,
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(16),
  },
  dropdownContainer: {
    marginHorizontal: scale(15),
    marginTop: scale(10),
    zIndex: 3000,
    marginBottom:scale(10)
  },
  dropdown: {
    borderColor: COLORS.AshGray,
    borderRadius: scale(8),
    height: scale(45),
  },
  dropdownContainerStyle: {
    borderColor: COLORS.AshGray,
    borderRadius: scale(8),
  },
});
