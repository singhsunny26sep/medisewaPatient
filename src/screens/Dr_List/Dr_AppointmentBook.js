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
  Dimensions,
} from 'react-native';
import {Container} from '../../component/Container/Container';
import {COLORS} from '../../Theme/Colors';
import CustomHeader from '../../component/header/CustomHeader';
import {moderateScale, scale} from '../../utils/Scaling';
import {Fonts} from '../../Theme/Fonts';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Instance} from '../../api/Instance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import ToastMessage from '../../component/ToastMessage/ToastMessage';

const atob = global.atob || (str => Buffer.from(str, 'base64').toString('binary'));
const {width: screenWidth} = Dimensions.get('window');

export default function Dr_AppointmentBook({route, navigation}) {
  const {doctorId} = route.params;
  const [selectedTime, setSelectedTime] = useState(null);
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const formatTimeSlotKey = key => {
    const timeMap = {
      'at9AM': '09:00 AM',
      'at9_30AM': '09:30 AM',
      'at10AM': '10:00 AM',
      'at10_30AM': '10:30 AM',
      'at11AM': '11:00 AM',
      'at11_30AM': '11:30 AM',
      'at12PM': '12:00 PM',
      'at12_30PM': '12:30 PM',
      'at1PM': '01:00 PM',
      'at1_30PM': '01:30 PM',
      'at2PM': '02:00 PM',
      'at2_30PM': '02:30 PM',
      'at3PM': '03:00 PM',
      'at3_30PM': '03:30 PM',
      'at4PM': '04:00 PM',
      'at4_30PM': '04:30 PM',
      'at5PM': '05:00 PM',
      'at5_30PM': '05:30 PM',
      'at6PM': '06:00 PM',
      'at6_30PM': '06:30 PM',
      'at7PM': '07:00 PM',
      'at7_30PM': '07:30 PM',
      'at8PM': '08:00 PM',
      'at8_30PM': '08:30 PM',
    };
    return timeMap[key] || key;
  };

  const getUserId = async () => {
    const userDataStr = await AsyncStorage.getItem('userData');
    if (userDataStr) {
      try {
        const parsed = JSON.parse(userDataStr);
        const id = parsed?.id || parsed?.userId || parsed?._id || parsed?.user_id;
        if (id && typeof id === 'string') return id;
      } catch (e) {
        console.error('Error parsing userData:', e);
      }
    }
    const token = await AsyncStorage.getItem('userToken');
    if (token && typeof token === 'string') {
      const parts = token.split('.');
      if (parts.length === 3) {
        try {
          const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const jsonStr = Buffer.from(base64, 'base64').toString('utf-8');
          const payload = JSON.parse(jsonStr);
          const id = payload?.id || payload?.userId || payload?._id || payload?.user_id || payload?.sub || payload?.uid;
          if (id && typeof id === 'string') return id;
        } catch (e) {
          console.error('Error decoding token:', e);
        }
      }
    }
    return null;
  };

  const processTimeSlotData = (timeSlotData, date) => {
    const {morning = {}, afternoon = {}, evening = {}} = timeSlotData;

    const morningSlots = [];
    const afternoonSlots = [];
    const eveningSlots = [];

    Object.keys(morning).forEach(key => {
      if (morning[key]) {
        morningSlots.push({time: formatTimeSlotKey(key), available: true});
      }
    });

    Object.keys(afternoon).forEach(key => {
      if (afternoon[key]) {
        afternoonSlots.push({time: formatTimeSlotKey(key), available: true});
      }
    });

    Object.keys(evening).forEach(key => {
      if (evening[key]) {
        eveningSlots.push({time: formatTimeSlotKey(key), available: true});
      }
    });

    const totalSlots = morningSlots.length + afternoonSlots.length + eveningSlots.length;

    return {
      id: timeSlotData._id,
      date: moment(date).format('ddd, D MMM'),
      day: getDayLabel(date),
      slots: totalSlots,
      available: totalSlots > 0,
      fullDate: moment(date).format('YYYY-MM-DD'),
      timeSlots: {morning: morningSlots, afternoon: afternoonSlots, evening: eveningSlots},
    };
  };

  const createEmptySlotData = date => ({
    id: `empty-${moment(date).format('YYYY-MM-DD')}`,
    date: moment(date).format('ddd, D MMM'),
    day: getDayLabel(date),
    slots: 0,
    available: false,
    fullDate: moment(date).format('YYYY-MM-DD'),
    timeSlots: null,
  });

  const getDayLabel = date => {
    const today = moment().startOf('day');
    const tomorrow = moment().add(1, 'days').startOf('day');
    const targetDate = moment(date).startOf('day');
    if (targetDate.isSame(today)) return 'Today';
    if (targetDate.isSame(tomorrow)) return 'Tomorrow';
    return targetDate.format('dddd');
  };

  const generateDateRange = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(moment().add(i, 'days').toDate());
    }
    return dates;
  };

  const generateEmptySlotRange = () => generateDateRange().map(date => createEmptySlotData(date));
      const userId =  getUserId();
      console.log(userId,"*************************")

  const fetchAllTimeSlots = async () => {
    try {
      setLoadingSlots(true);
      const userId = await getUserId();
      console.log(userId, '*************************');
      if (!userId) {
        setAvailableSlots(generateEmptySlotRange());
        return;
      }
      const token = await AsyncStorage.getItem('userToken');
      const response = await Instance.get(`api/v1/time-slots/getAll?userId=${userId}&page=1&limit=10`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      if (response.data.success && response.data.data.timeSlots.length > 0) {
        const dates = generateDateRange();
        const dateStrSet = new Set(dates.map(d => moment(d).format('YYYY-MM-DD')));
        const slotsMap = {};
        response.data.data.timeSlots.forEach(slot => {
          const slotDate = moment(slot.date).format('YYYY-MM-DD');
          if (dateStrSet.has(slotDate)) {
            slotsMap[slotDate] = processTimeSlotData(slot, slotDate);
          }
        });
        const slotsData = dates.map(d => {
          const key = moment(d).format('YYYY-MM-DD');
          return slotsMap[key] || createEmptySlotData(d);
        });
        setAvailableSlots(slotsData);
      } else {
        setAvailableSlots(generateEmptySlotRange());
      }
    } catch (error) {
      console.error('Error fetching time slots:', error.response?.data || error.message);
      setAvailableSlots(generateEmptySlotRange());
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleTimeSelect = time => setSelectedTime(time);

  const handleDaySelect = async index => {
    if (availableSlots[index]?.available) {
      setSelectedDay(index);
      setSelectedTime(null);
      const date = generateDateRange()[index];
      const dateStr = moment(date).format('YYYY-MM-DD');
      const userId = await getUserId();
      if (!userId) return;
      const token = await AsyncStorage.getItem('userToken');
      try {
        const response = await Instance.get(`api/v1/time-slots/getAll?userId=${userId}&page=1&limit=10`, {
          headers: {Authorization: `Bearer ${token}`},
        });
        if (response.data.success && response.data.data.timeSlots.length > 0) {
          const matched = response.data.data.timeSlots.find(slot => moment(slot.date).format('YYYY-MM-DD') === dateStr);
          if (matched) {
            const updatedSlot = processTimeSlotData(matched, date);
            const updatedSlots = [...availableSlots];
            updatedSlots[index] = updatedSlot;
            setAvailableSlots(updatedSlots);
          }
        }
      } catch (error) {
        console.error('Error refreshing time slots:', error.response?.data || error.message);
      }
    }
  };

  const fetchDoctorDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const response = await Instance.get(`api/v1/doctors/${doctorId}`, {
          headers: {Authorization: `Bearer ${token}`},
        });
        if (response.data.success) {
          setDoctorDetails(response.data.result);
        }
        console.log('🔍 Doctor details response:', response.data);
      } else {
        console.log('Token not found!');
      }
    } catch (error) {
      console.error('Error fetching doctor details:', error.response ? error.response.data : error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorDetails();
    fetchAllTimeSlots();
  }, [doctorId]);

  const renderDoctorItem = () => {
    if (!doctorDetails) return null;
    console.log('🔍 Fetching doctor details for doctorId:', doctorId);
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
            {specialization?.name}
          </Text>
          <View style={styles.doctorInfoContainer}>
            <View style={styles.doctorInfoRow}>
              <Icon name="phone" size={scale(20)} color={COLORS.DODGERBLUE} />
              <Text style={styles.doctorInfoText}>{contactNumber}</Text>
            </View>
            <View style={styles.doctorInfoRow}>
              <Icon name="work" size={scale(20)} color={COLORS.DODGERBLUE} />
              <Text style={styles.doctorInfoText}>
                {experience} years of experience
              </Text>
            </View>
            <View style={styles.doctorInfoRow}>
              <Icon name="business" size={scale(20)} color={COLORS.DODGERBLUE} />
              <Text style={styles.doctorInfoText}>{department?.name}</Text>
            </View>
            <View style={styles.doctorInfoRow}>
              <Icon name="accessibility" size={scale(20)} color={COLORS.DODGERBLUE} />
              <Text style={styles.doctorInfoText}>{doctorGender}</Text>
            </View>
            <View style={styles.doctorInfoRow}>
              <Icon name="location-on" size={scale(20)} color={COLORS.DODGERBLUE} />
              <Text style={styles.doctorInfoText}>{clinicAddress}</Text>
            </View>
            <View style={styles.doctorInfoRow}>
              <Icon name="attach-money" size={scale(20)} color={COLORS.DODGERBLUE} />
              <Text style={styles.doctorInfoText}>
                ₹{fee}{' '}
                <Text style={{textDecorationLine: 'line-through', color: COLORS.gray}}>
                  ₹{oldFee}
                </Text>
              </Text>
            </View>
            <View style={styles.doctorInfoRow}>
              <Icon name="access-time" size={scale(20)} color={COLORS.DODGERBLUE} />
              <Text style={styles.doctorInfoText}>
                {startTime} - {endTime}
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
        setToastMessage('User not authenticated!');
        setToastType('danger');
        setIsSubmitting(false);
        return;
      }

      const userId = await getUserId();
      console.log(userId,"*************************")
      if (!userId) {
        setToastMessage('User ID not found!');
        setToastType('danger');
        setIsSubmitting(false);
        return;
      }

      if (!selectedTime) {
        setToastMessage('Please select a time slot');
        setToastType('danger');
        setIsSubmitting(false);
        return;
      }

      const selectedSlot = availableSlots[selectedDay];
      if (!selectedSlot || !selectedSlot.available) {
        setToastMessage('Please select a valid date with available slots');
        setToastType('danger');
        setIsSubmitting(false);
        return;
      }

      const formattedDate = selectedSlot.fullDate;
      const formattedTime = moment(selectedTime, 'h:mm A').format('HH:mm');

      const bookingPayload = {
        doctorId: doctorDetails?.doctorId?._id,
        appointmentDate: formattedDate,
        appointmentTime: formattedTime,
        consultationFee: doctorDetails?.doctorId?.fee || 50,
        serviceCharge: 10,
      };
      console.log('Booking payload:', JSON.stringify(bookingPayload, null, 2));
      const response = await Instance.post(
        `/api/v1/bookings/book/appointment/${userId}`,
        bookingPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        setToastMessage('Appointment booked successfully!');
        setToastType('success');
        setTimeout(() => navigation.goBack(), 2000);
      } else {
        setToastMessage(response.data.message || 'Failed to book appointment');
        setToastType('danger');
      }
    } catch (error) {
      console.error('Booking error:', error.response?.data || error.message);
      setToastMessage(
        error.response?.data?.message || 'Failed to book appointment. Please try again.',
      );
      setToastType('danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDayButtons = () => (
    <View style={styles.daysContainer}>
      {loadingSlots ? (
        <ActivityIndicator size="small" color={COLORS.DODGERBLUE} />
      ) : (
        <FlatList
          data={availableSlots}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.daysListContent}
          renderItem={({item, index}) => (
            <TouchableOpacity
              style={[
                styles.dayButton,
                selectedDay === index && styles.selectedDayButton,
                !item.available && styles.disabledDayButton,
              ]}
              onPress={() => handleDaySelect(index)}
              disabled={!item.available}>
              <Text
                style={[
                  styles.dayText,
                  selectedDay === index && styles.selectedDayText,
                  !item.available && styles.disabledDayText,
                ]}>
                {item.day}
              </Text>
              <Text
                style={[
                  styles.dateText,
                  selectedDay === index && styles.selectedDayText,
                  !item.available && styles.disabledDayText,
                ]}>
                {item.date}
              </Text>
              {item.available ? (
                <View
                  style={[
                    styles.slotsBadge,
                    selectedDay === index && styles.selectedSlotsBadge,
                  ]}>
                  <Text
                    style={[
                      styles.slotsText,
                      selectedDay === index && styles.selectedSlotsText,
                    ]}>
                    {item.slots} slots
                  </Text>
                </View>
              ) : (
                <View style={styles.unavailableBadge}>
                  <Text style={styles.unavailableText}>Not available</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );

  const renderTimeSlots = () => {
    if (loadingSlots) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.DODGERBLUE} />
          <Text style={styles.loadingText}>Loading time slots...</Text>
        </View>
      );
    }

    const selectedSlot = availableSlots[selectedDay];
    if (!selectedSlot || !selectedSlot.timeSlots) {
      return (
        <View style={styles.noSlotsContainer}>
          <Icon name="schedule" size={scale(40)} color={COLORS.gray} />
          <Text style={styles.noSlotsText}>No slots available for this day</Text>
        </View>
      );
    }

    const {morning = [], afternoon = [], evening = []} = selectedSlot.timeSlots;

    return (
      <View style={styles.timeSlotsContainer}>
        {morning.length > 0 && (
          <View style={styles.timeSlotSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.timeSlotSectionTitle}>Morning</Text>
              <Text style={styles.timeSlotCount}>{morning.length} slots</Text>
            </View>
            <View style={styles.timeSlotsGrid}>
              {morning.map((timeSlot, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeSlotButton,
                    selectedTime === timeSlot.time && styles.selectedTimeSlotButton,
                    !timeSlot.available && styles.disabledTimeSlotButton,
                  ]}
                  onPress={() => timeSlot.available && handleTimeSelect(timeSlot.time)}
                  disabled={!timeSlot.available}>
                  <Text
                    style={[
                      styles.timeSlotText,
                      selectedTime === timeSlot.time && styles.selectedTimeSlotText,
                      !timeSlot.available && styles.disabledTimeSlotText,
                    ]}>
                    {timeSlot.time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {afternoon.length > 0 && (
          <View style={styles.timeSlotSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.timeSlotSectionTitle}>Afternoon</Text>
              <Text style={styles.timeSlotCount}>{afternoon.length} slots</Text>
            </View>
            <View style={styles.timeSlotsGrid}>
              {afternoon.map((timeSlot, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeSlotButton,
                    selectedTime === timeSlot.time && styles.selectedTimeSlotButton,
                    !timeSlot.available && styles.disabledTimeSlotButton,
                  ]}
                  onPress={() => timeSlot.available && handleTimeSelect(timeSlot.time)}
                  disabled={!timeSlot.available}>
                  <Text
                    style={[
                      styles.timeSlotText,
                      selectedTime === timeSlot.time && styles.selectedTimeSlotText,
                      !timeSlot.available && styles.disabledTimeSlotText,
                    ]}>
                    {timeSlot.time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {evening.length > 0 && (
          <View style={styles.timeSlotSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.timeSlotSectionTitle}>Evening</Text>
              <Text style={styles.timeSlotCount}>{evening.length} slots</Text>
            </View>
            <View style={styles.timeSlotsGrid}>
              {evening.map((timeSlot, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeSlotButton,
                    selectedTime === timeSlot.time && styles.selectedTimeSlotButton,
                    !timeSlot.available && styles.disabledTimeSlotButton,
                  ]}
                  onPress={() => timeSlot.available && handleTimeSelect(timeSlot.time)}
                  disabled={!timeSlot.available}>
                  <Text
                    style={[
                      styles.timeSlotText,
                      selectedTime === timeSlot.time && styles.selectedTimeSlotText,
                      !timeSlot.available && styles.disabledTimeSlotText,
                    ]}>
                    {timeSlot.time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    );
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
          <Text style={styles.errorText}>Failed to load doctor details</Text>
        )}

        <View style={styles.slotsContainer}>
          <Text style={styles.selectDateText}>Available Slots</Text>
          {renderDayButtons()}
          {renderTimeSlots()}
        </View>

        <View style={styles.priceSummaryContainer}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Consultation Fee</Text>
            <Text style={styles.priceValue}>
              ₹{doctorDetails?.doctorId?.fee || 50}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Service Charge</Text>
            <Text style={styles.priceValue}>₹10</Text>
          </View>
          <View style={styles.dividerPrice} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              ₹{(doctorDetails?.doctorId?.fee || 50) + 10}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmitAppointment}
          disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.submitButtonText}>Submit Appointment</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {toastMessage && <ToastMessage type={toastType} message={toastMessage} />}
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    paddingBottom: scale(20),
    backgroundColor: COLORS.white,
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
    height: scale(120),
    width: scale(120),
    alignSelf: 'center',
    borderRadius: scale(60),
    borderWidth: 2,
    borderColor: COLORS.DODGERBLUE,
    marginBottom: scale(15),
  },
  detailsContainer: {
    marginTop: scale(5),
    padding: scale(15),
    backgroundColor: COLORS.white,
    borderRadius: scale(15),
    shadowColor: COLORS.black,
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: scale(8),
    elevation: 5,
    marginBottom: scale(15),
  },
  doctorName: {
    fontFamily: Fonts.Bold,
    color: COLORS.black,
    fontSize: moderateScale(22),
    textAlign: 'center',
    marginBottom: scale(5),
  },
  doctorSpecialization: {
    fontFamily: Fonts.Medium,
    color: COLORS.DODGERBLUE,
    fontSize: moderateScale(16),
    textAlign: 'center',
    marginBottom: scale(5),
  },
  doctorInfoContainer: {
    borderRadius: scale(10),
  },
  doctorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: scale(8),
    paddingHorizontal: scale(5),
  },
  doctorInfoText: {
    fontFamily: Fonts.Medium,
    color: COLORS.black,
    fontSize: moderateScale(14),
    marginLeft: scale(12),
    flex: 1,
  },
  selectDateText: {
    fontFamily: Fonts.Light,
    color: COLORS.black,
    marginHorizontal: scale(15),
    fontSize: moderateScale(16),
    marginBottom: scale(10),
    marginTop: scale(15),
  },
  submitButton: {
    marginTop: scale(30),
    marginHorizontal: scale(15),
    backgroundColor: COLORS.DODGERBLUE,
    paddingVertical: scale(15),
    borderRadius: scale(12),
    alignItems: 'center',
    shadowColor: COLORS.DODGERBLUE,
    shadowOpacity: 0.3,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: scale(8),
    elevation: 0,
    marginBottom: scale(30),
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.white,
    fontFamily: Fonts.SemiBold,
    fontSize: moderateScale(16),
  },
  slotsContainer: {
    marginHorizontal: scale(15),
    marginTop: scale(10),
  },
  daysContainer: {
    marginBottom: scale(20),
  },
  daysListContent: {
    paddingHorizontal: scale(5),
  },
  dayButton: {
    width: scale(100),
    padding: scale(12),
    marginHorizontal: scale(5),
    borderRadius: scale(12),
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOpacity: 0.08,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: scale(6),
    elevation: 3,
  },
  selectedDayButton: {
    backgroundColor: COLORS.DODGERBLUE,
    borderColor: COLORS.DODGERBLUE,
    shadowColor: COLORS.DODGERBLUE,
    shadowOpacity: 0.2,
    elevation: 5,
  },
  disabledDayButton: {
    backgroundColor: COLORS.extraLightGray,
    borderColor: COLORS.lightGray,
    opacity: 0.6,
  },
  dayText: {
    fontFamily: Fonts.SemiBold,
    fontSize: moderateScale(14),
    color: COLORS.black,
    marginBottom: scale(2),
  },
  dateText: {
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(12),
    color: COLORS.darkGray,
    marginBottom: scale(6),
  },
  selectedDayText: {
    color: COLORS.white,
  },
  disabledDayText: {
    color: COLORS.gray,
  },
  slotsBadge: {
    backgroundColor: COLORS.lightBlue,
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(12),
  },
  selectedSlotsBadge: {
    backgroundColor: COLORS.white,
  },
  slotsText: {
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(10),
    color: COLORS.DODGERBLUE,
  },
  selectedSlotsText: {
    color: COLORS.DODGERBLUE,
  },
  unavailableBadge: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(12),
  },
  unavailableText: {
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(10),
    color: COLORS.gray,
  },
  timeSlotsContainer: {
    marginTop: scale(10),
  },
  timeSlotSection: {
    marginBottom: scale(25),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(12),
  },
  timeSlotSectionTitle: {
    fontFamily: Fonts.SemiBold,
    fontSize: moderateScale(16),
    color: COLORS.black,
  },
  timeSlotCount: {
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(12),
    color: COLORS.gray,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: scale(-4),
  },
  timeSlotButton: {
    paddingVertical: scale(12),
    paddingHorizontal: scale(16),
    margin: scale(4),
    borderRadius: scale(10),
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    minWidth: scale(85),
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: scale(3),
    elevation: 2,
  },
  selectedTimeSlotButton: {
    backgroundColor: COLORS.DODGERBLUE,
    borderColor: COLORS.DODGERBLUE,
    shadowColor: COLORS.DODGERBLUE,
    shadowOpacity: 0.2,
    elevation: 4,
  },
  disabledTimeSlotButton: {
    backgroundColor: COLORS.extraLightGray,
    borderColor: COLORS.lightGray,
    opacity: 0.5,
  },
  timeSlotText: {
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(14),
    color: COLORS.black,
  },
  selectedTimeSlotText: {
    color: COLORS.white,
    fontFamily: Fonts.SemiBold,
  },
  disabledTimeSlotText: {
    color: COLORS.gray,
  },
  noSlotsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(40),
  },
  noSlotsText: {
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(14),
    color: COLORS.gray,
    marginTop: scale(10),
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(40),
  },
  loadingText: {
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(14),
    color: COLORS.gray,
    marginTop: scale(10),
  },
  priceSummaryContainer: {
    marginHorizontal: scale(15),
    marginTop: scale(20),
    backgroundColor: COLORS.white,
    padding: scale(15),
    borderRadius: scale(15),
    shadowColor: COLORS.black,
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: scale(8),
    elevation: 5,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: scale(6),
  },
  priceLabel: {
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(14),
    color: COLORS.black,
  },
  priceValue: {
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(14),
    color: COLORS.black,
  },
  dividerPrice: {
    height: 1,
    backgroundColor: COLORS.AshGray,
    marginVertical: scale(10),
    opacity: 0.5,
  },
  totalLabel: {
    fontFamily: Fonts.SemiBold,
    fontSize: moderateScale(16),
    color: COLORS.black,
  },
  totalValue: {
    fontFamily: Fonts.SemiBold,
    fontSize: moderateScale(16),
    color: COLORS.DODGERBLUE,
  },
});
