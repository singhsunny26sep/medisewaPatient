import React, {useEffect, useState, useRef} from 'react';
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
  Animated,
  Platform,
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

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

// Responsive helpers
const isSmallDevice = screenWidth < 375;
const isTablet = screenWidth >= 768;

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

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Trigger entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatTimeSlotKey = key => {
    const timeMap = {
      at9AM: '09:00 AM',
      at9_30AM: '09:30 AM',
      at10AM: '10:00 AM',
      at10_30AM: '10:30 AM',
      at11AM: '11:00 AM',
      at11_30AM: '11:30 AM',
      at12PM: '12:00 PM',
      at12_30PM: '12:30 PM',
      at1PM: '01:00 PM',
      at1_30PM: '01:30 PM',
      at2PM: '02:00 PM',
      at2_30PM: '02:30 PM',
      at3PM: '03:00 PM',
      at3_30PM: '03:30 PM',
      at4PM: '04:00 PM',
      at4_30PM: '04:30 PM',
      at5PM: '05:00 PM',
      at5_30PM: '05:30 PM',
      at6PM: '06:00 PM',
      at6_30PM: '06:30 PM',
      at7PM: '07:00 PM',
      at7_30PM: '07:30 PM',
      at8PM: '08:00 PM',
      at8_30PM: '08:30 PM',
    };
    return timeMap[key] || key;
  };

  const getUserId = async () => {
    const userDataStr = await AsyncStorage.getItem('userData');
    if (userDataStr) {
      try {
        const parsed = JSON.parse(userDataStr);
        const id =
          parsed?.id || parsed?.userId || parsed?._id || parsed?.user_id;
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
          const jsonStr = global.atob(base64);
          const payload = JSON.parse(jsonStr);
          const id =
            payload?.id ||
            payload?.userId ||
            payload?._id ||
            payload?.user_id ||
            payload?.sub ||
            payload?.uid;
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

    const totalSlots =
      morningSlots.length + afternoonSlots.length + eveningSlots.length;

    return {
      id: timeSlotData._id,
      date: moment(date).format('ddd, D MMM'),
      day: getDayLabel(date),
      slots: totalSlots,
      available: totalSlots > 0,
      fullDate: moment(date).format('YYYY-MM-DD'),
      timeSlots: {
        morning: morningSlots,
        afternoon: afternoonSlots,
        evening: eveningSlots,
      },
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

  const generateEmptySlotRange = () =>
    generateDateRange().map(date => createEmptySlotData(date));

   const fetchAllTimeSlots = async doctorUserId => {
    try {
      setLoadingSlots(true);
      if (!doctorUserId) {
        setAvailableSlots(generateEmptySlotRange());
        return;
      }
      const token = await AsyncStorage.getItem('userToken');
      const response = await Instance.get(
        `/api/v1/time-slots/getAll?page=1&limit=10&userId=${doctorUserId}`,
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );
      if (response.data.success && response.data.data.timeSlots.length > 0) {
        const dates = generateDateRange();
        const dateStrSet = new Set(
          dates.map(d => moment(d).format('YYYY-MM-DD')),
        );
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
      const errMsg = error.response?.data?.message || error.message || 'Failed to load time slots';
      console.error('Error fetching time slots:', errMsg);
      setToastMessage(errMsg);
      setToastType('danger');
      setAvailableSlots(generateEmptySlotRange());
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleTimeSelect = time => setSelectedTime(time);

  const handleDaySelect = async index => {
    if (!availableSlots[index]?.available) return;
    setSelectedDay(index);
    setSelectedTime(null);
    const date = generateDateRange()[index];
    const dateStr = moment(date).format('YYYY-MM-DD');
    const doctorUserId = doctorDetails?.doctorId?.userId;
    if (!doctorUserId) return;
    const token = await AsyncStorage.getItem('userToken');
    console.log('handleDaySelect - doctorUserId:', doctorUserId, 'dateStr:', dateStr, 'index:', index);
    try {
      const response = await Instance.get(
        `api/v1/time-slots/getAll?userId=${encodeURIComponent(
          doctorUserId,
        )}&page=1&limit=10`,
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );
      console.log(
       response.data,"+++++++++++++++++++++++++++"
      );
  
      if (
        response?.data?.success &&
        Array.isArray(response.data.data?.timeSlots)
      ) {
        const matched = response.data.data.timeSlots.find(
          slot => moment(slot.date).format('YYYY-MM-DD') === dateStr,
        );
        console.log(
          'handleDaySelect - matched:',
          matched ? 'found' : 'not found',
        );
        if (matched) {
          const updatedSlot = processTimeSlotData(matched, date);
          setAvailableSlots(prev => {
            const updatedSlots = [...prev];
            if (updatedSlots[index]) {
              updatedSlots[index] = updatedSlot;
            } else {
              console.warn(
                'handleDaySelect - index out of bounds:',
                index,
                'length:',
                updatedSlots.length,
              );
            }
            return updatedSlots;
          });
        }
      } else {
        console.log(
          'handleDaySelect - API returned no success or no timeSlots array',
        );
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Failed to refresh time slots';
      console.error('handleDaySelect - Error refreshing time slots:', errMsg, 'Status:', error.response?.status);
      setToastMessage(errMsg);
      setToastType('danger');
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
          return response.data.result?.doctorId?.userId || null;
        }
      } else {
        console.log('Token not found!');
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Failed to load doctor details';
      console.error('Error fetching doctor details:', errMsg);
      setToastMessage(errMsg);
      setToastType('danger');
    } finally {
      setLoading(false);
    }
    return null;
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const doctorUserId = await fetchDoctorDetails();
      if (!cancelled && doctorUserId) {
        fetchAllTimeSlots(doctorUserId);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [doctorId]);

  // ---- RENDER FUNCTIONS ----

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
      <Animated.View
        style={[
          styles.doctorCard,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}, {scale: scaleAnim}],
          },
        ]}>
        <View style={styles.doctorImageWrapper}>
          <Image
            source={{
              uri:
                image ||
                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLU7h0cdnX8yFq-73gpabJjRLSJDVu7oQZ4w&s',
            }}
            style={styles.doctorImage}
          />
          <View style={styles.verifiedBadge}>
            <Icon name="verified" size={scale(16)} color="#fff" />
          </View>
        </View>

        <View style={styles.doctorInfoCard}>
          <Text style={styles.doctorName}>Dr. {name}</Text>
          <View style={styles.specialtyBadge}>
            <Text style={styles.specialtyText}>{specialization?.name}</Text>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={styles.infoIconCircle}>
                <Icon name="phone" size={scale(18)} color="#4A90D9" />
              </View>
              <Text style={styles.infoText}>{contactNumber}</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoIconCircle}>
                <Icon name="work" size={scale(18)} color="#4A90D9" />
              </View>
              <Text style={styles.infoText}>{experience} yrs exp</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoIconCircle}>
                <Icon name="business" size={scale(18)} color="#4A90D9" />
              </View>
              <Text style={styles.infoText}>{department?.name}</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoIconCircle}>
                <Icon name="accessibility" size={scale(18)} color="#4A90D9" />
              </View>
              <Text style={styles.infoText}>{doctorGender}</Text>
            </View>
            <View style={[styles.infoItem, styles.infoItemFull]}>
              <View style={styles.infoIconCircle}>
                <Icon name="location-on" size={scale(18)} color="#4A90D9" />
              </View>
              <Text style={styles.infoText} numberOfLines={1}>
                {clinicAddress}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoIconCircle}>
                <Icon name="attach-money" size={scale(18)} color="#4A90D9" />
              </View>
              <View style={styles.feeContainer}>
                <Text style={styles.infoText}>₹{fee}</Text>
                {oldFee && <Text style={styles.oldFeeText}>₹{oldFee}</Text>}
              </View>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoIconCircle}>
                <Icon name="access-time" size={scale(18)} color="#4A90D9" />
              </View>
              <Text style={styles.infoText}>
                {startTime} - {endTime}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderDayButtons = () => (
    <View style={styles.daysContainer}>
      {loadingSlots ? (
        <ActivityIndicator size="small" color="#4A90D9" />
      ) : (
        <FlatList
          data={availableSlots}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.daysListContent}
          renderItem={({item, index}) => {
            const isSelected = selectedDay === index;
            return (
              <TouchableOpacity
                style={[
                  styles.dayButton,
                  isSelected && styles.selectedDayButton,
                  !item.available && styles.disabledDayButton,
                ]}
                onPress={() => handleDaySelect(index)}
                disabled={!item.available}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.dayText,
                    isSelected && styles.selectedDayText,
                    !item.available && styles.disabledDayText,
                  ]}>
                  {item.day}
                </Text>
                <Text
                  style={[
                    styles.dateText,
                    isSelected && styles.selectedDayText,
                    !item.available && styles.disabledDayText,
                  ]}>
                  {item.date}
                </Text>
                {item.available ? (
                  <View
                    style={[
                      styles.slotsBadge,
                      isSelected && styles.selectedSlotsBadge,
                    ]}>
                    <Text
                      style={[
                        styles.slotsText,
                        isSelected && styles.selectedSlotsText,
                      ]}>
                      {item.slots} slots
                    </Text>
                  </View>
                ) : (
                  <View style={styles.unavailableBadge}>
                    <Text style={styles.unavailableText}>Unavailable</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );

  const renderTimeSlots = () => {
    if (loadingSlots) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90D9" />
          <Text style={styles.loadingText}>Loading time slots...</Text>
        </View>
      );
    }

    const selectedSlot = availableSlots[selectedDay];
    if (!selectedSlot || !selectedSlot.timeSlots) {
      return (
        <View style={styles.noSlotsContainer}>
          <Icon name="schedule" size={scale(48)} color="#B0B0B0" />
          <Text style={styles.noSlotsText}>
            No slots available for this day
          </Text>
        </View>
      );
    }

    const {morning = [], afternoon = [], evening = []} = selectedSlot.timeSlots;
    const hasAnySlots =
      morning.length > 0 || afternoon.length > 0 || evening.length > 0;

    if (!hasAnySlots) {
      return (
        <View style={styles.noSlotsContainer}>
          <Icon name="event-busy" size={scale(48)} color="#B0B0B0" />
          <Text style={styles.noSlotsText}>No time slots available</Text>
        </View>
      );
    }

    const renderSlotGroup = (slots, title) => {
      if (slots.length === 0) return null;
      return (
        <View style={styles.timeSlotSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.timeSlotSectionTitle}>{title}</Text>
            <Text style={styles.timeSlotCount}>{slots.length} slots</Text>
          </View>
          <View style={styles.timeSlotsGrid}>
            {slots.map((timeSlot, index) => {
              const isSelected = selectedTime === timeSlot.time;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeSlotButton,
                    isSelected && styles.selectedTimeSlotButton,
                    !timeSlot.available && styles.disabledTimeSlotButton,
                  ]}
                  onPress={() =>
                    timeSlot.available && handleTimeSelect(timeSlot.time)
                  }
                  disabled={!timeSlot.available}
                  activeOpacity={0.7}>
                  <Text
                    style={[
                      styles.timeSlotText,
                      isSelected && styles.selectedTimeSlotText,
                      !timeSlot.available && styles.disabledTimeSlotText,
                    ]}>
                    {timeSlot.time}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkMark}>
                      <Icon name="check" size={scale(10)} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      );
    };

    return (
      <View style={styles.timeSlotsContainer}>
        {renderSlotGroup(morning, 'Morning')}
        {renderSlotGroup(afternoon, 'Afternoon')}
        {renderSlotGroup(evening, 'Evening')}
      </View>
    );
  };

  const handleSubmitAppointment = async (doctorUserId) => {
    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setToastMessage('User not authenticated!');
        setToastType('danger');
        setIsSubmitting(false);
        return;
      }

      const profileRes = await Instance.get('/api/v1/users/profile', {
        headers: {Authorization: `Bearer ${token}`},
      });
      const userProfile = profileRes.data?.result || profileRes.data;
      const patientId = userProfile?.patientId?.[0]?._id;
      if (!patientId) {
        setToastMessage('Patient profile not found. Please complete your profile.');
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

      const response = await Instance.post(
        `/api/v1/bookings/book/appointment/${patientId}`,
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
        error.response?.data?.message ||
          'Failed to book appointment. Please try again.',
      );
      setToastType('danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container
      statusBarStyle={'dark-content'}
      statusBarBackgroundColor={COLORS.white}
      backgroundColor={COLORS.white}>
      <CustomHeader title="Book Appointment" navigation={navigation} />
      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#4A90D9" />
          </View>
        ) : doctorDetails ? (
          renderDoctorItem()
        ) : (
          <Text style={styles.errorText}>Failed to load doctor details</Text>
        )}

        <View style={styles.slotsContainer}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Available Slots</Text>
            <View style={styles.sectionTitleLine} />
          </View>
          {renderDayButtons()}
          {renderTimeSlots()}
        </View>

        <View style={styles.priceSummaryContainer}>
          <View style={styles.priceHeader}>
            <Text style={styles.priceSummaryTitle}>Price Details</Text>
            <Icon name="receipt-long" size={scale(20)} color="#4A90D9" />
          </View>
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
            <Text style={styles.totalLabel}>Total Amount</Text>
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
          disabled={isSubmitting}
          activeOpacity={0.8}>
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Book Appointment</Text>
              <Icon name="arrow-forward" size={scale(20)} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {toastMessage && <ToastMessage type={toastType} message={toastMessage} />}
    </Container>
  );
}

// ─── STYLES ──────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollView: {
    paddingBottom: scale(30),
    backgroundColor: '#F8FAFE',
  },

  // ── Loader ──
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: screenHeight * 0.5,
  },
  errorText: {
    fontSize: moderateScale(16),
    color: '#E74C3C',
    textAlign: 'center',
    marginTop: scale(20),
    fontFamily: Fonts.Medium,
  },

  // ── Doctor Card ──
  doctorCard: {
    backgroundColor: '#fff',
    marginHorizontal: scale(16),
    marginTop: scale(16),
    borderRadius: scale(20),
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: {width: 0, height: 6},
    shadowRadius: scale(16),
    elevation: 4,
    overflow: 'hidden',
    paddingBottom: scale(16),
  },
  doctorImageWrapper: {
    alignItems: 'center',
    paddingTop: scale(20),
    position: 'relative',
  },
  doctorImage: {
    height: scale(110),
    width: scale(110),
    borderRadius: scale(55),
    borderWidth: 3,
    borderColor: '#4A90D9',
    backgroundColor: '#E8F0FE',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: scale(4),
    right: screenWidth / 2 - scale(50),
    backgroundColor: '#4A90D9',
    borderRadius: scale(12),
    padding: scale(3),
    borderWidth: 2,
    borderColor: '#fff',
  },
  doctorInfoCard: {
    paddingHorizontal: scale(16),
    paddingTop: scale(12),
  },
  doctorName: {
    fontFamily: Fonts.Bold,
    color: '#1A2B4A',
    fontSize: isSmallDevice ? moderateScale(20) : moderateScale(24),
    textAlign: 'center',
    marginBottom: scale(4),
  },
  specialtyBadge: {
    alignSelf: 'center',
    backgroundColor: '#E8F0FE',
    paddingHorizontal: scale(16),
    paddingVertical: scale(4),
    borderRadius: scale(20),
    marginBottom: scale(12),
  },
  specialtyText: {
    fontFamily: Fonts.Medium,
    color: '#4A90D9',
    fontSize: moderateScale(14),
  },

  // ── Doctor Info Grid ──
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: scale(4),
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginVertical: scale(5),
  },
  infoItemFull: {
    width: '100%',
  },
  infoIconCircle: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(10),
  },
  infoText: {
    fontFamily: Fonts.Medium,
    color: '#2C3E50',
    fontSize: isSmallDevice ? moderateScale(12) : moderateScale(14),
    flex: 1,
  },
  feeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  oldFeeText: {
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(12),
    color: '#B0B0B0',
    textDecorationLine: 'line-through',
    marginLeft: scale(6),
  },

  // ── Slots Container ──
  slotsContainer: {
    marginHorizontal: scale(16),
    marginTop: scale(20),
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(14),
  },
  sectionTitle: {
    fontFamily: Fonts.SemiBold,
    fontSize: moderateScale(18),
    color: '#1A2B4A',
    marginRight: scale(12),
  },
  sectionTitleLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E8ECF4',
    borderRadius: 1,
  },

  // ── Day Buttons ──
  daysContainer: {
    marginBottom: scale(12),
  },
  daysListContent: {
    paddingVertical: scale(4),
    paddingHorizontal: scale(2),
  },
  dayButton: {
    width: isSmallDevice ? scale(88) : scale(100),
    paddingVertical: scale(12),
    paddingHorizontal: scale(8),
    marginHorizontal: scale(5),
    borderRadius: scale(16),
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E8ECF4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: scale(6),
    elevation: 2,
  },
  selectedDayButton: {
    backgroundColor: '#4A90D9',
    borderColor: '#4A90D9',
    shadowColor: '#4A90D9',
    shadowOpacity: 0.2,
    elevation: 6,
  },
  disabledDayButton: {
    backgroundColor: '#F2F4F8',
    borderColor: '#E0E4EC',
    opacity: 0.6,
  },
  dayText: {
    fontFamily: Fonts.SemiBold,
    fontSize: isSmallDevice ? moderateScale(12) : moderateScale(14),
    color: '#1A2B4A',
    marginBottom: scale(2),
  },
  dateText: {
    fontFamily: Fonts.Medium,
    fontSize: isSmallDevice ? moderateScale(10) : moderateScale(12),
    color: '#7F8C8D',
    marginBottom: scale(6),
  },
  selectedDayText: {
    color: '#fff',
  },
  disabledDayText: {
    color: '#A0A8B4',
  },
  slotsBadge: {
    backgroundColor: '#E8F0FE',
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: scale(12),
  },
  selectedSlotsBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  slotsText: {
    fontFamily: Fonts.Medium,
    fontSize: isSmallDevice ? moderateScale(8) : moderateScale(10),
    color: '#4A90D9',
  },
  selectedSlotsText: {
    color: '#fff',
  },
  unavailableBadge: {
    backgroundColor: '#F2F4F8',
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: scale(12),
  },
  unavailableText: {
    fontFamily: Fonts.Medium,
    fontSize: isSmallDevice ? moderateScale(8) : moderateScale(10),
    color: '#A0A8B4',
  },

  // ── Time Slots ──
  timeSlotsContainer: {
    marginTop: scale(8),
  },
  timeSlotSection: {
    marginBottom: scale(20),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(10),
  },
  timeSlotSectionTitle: {
    fontFamily: Fonts.SemiBold,
    fontSize: moderateScale(15),
    color: '#1A2B4A',
  },
  timeSlotCount: {
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(12),
    color: '#7F8C8D',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: scale(-3),
  },
  timeSlotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallDevice ? scale(10) : scale(12),
    paddingHorizontal: isSmallDevice ? scale(12) : scale(16),
    margin: scale(4),
    borderRadius: scale(12),
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E8ECF4',
    minWidth: isSmallDevice ? scale(72) : scale(85),
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: scale(4),
    elevation: 1,
  },
  selectedTimeSlotButton: {
    backgroundColor: '#4A90D9',
    borderColor: '#4A90D9',
    shadowColor: '#4A90D9',
    shadowOpacity: 0.15,
    elevation: 4,
  },
  disabledTimeSlotButton: {
    backgroundColor: '#F2F4F8',
    borderColor: '#E8ECF4',
    opacity: 0.5,
  },
  timeSlotText: {
    fontFamily: Fonts.Medium,
    fontSize: isSmallDevice ? moderateScale(12) : moderateScale(14),
    color: '#1A2B4A',
  },
  selectedTimeSlotText: {
    color: '#fff',
    fontFamily: Fonts.SemiBold,
  },
  disabledTimeSlotText: {
    color: '#A0A8B4',
  },
  checkMark: {
    marginLeft: scale(4),
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: scale(10),
    padding: scale(2),
  },

  // ── Empty / Loading States ──
  noSlotsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(36),
    backgroundColor: '#F8FAFE',
    borderRadius: scale(16),
    marginTop: scale(8),
  },
  noSlotsText: {
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(14),
    color: '#7F8C8D',
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
    color: '#7F8C8D',
    marginTop: scale(10),
  },

  // ── Price Summary ──
  priceSummaryContainer: {
    marginHorizontal: scale(16),
    marginTop: scale(24),
    backgroundColor: '#fff',
    padding: scale(18),
    borderRadius: scale(18),
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: scale(12),
    elevation: 3,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(12),
  },
  priceSummaryTitle: {
    fontFamily: Fonts.SemiBold,
    fontSize: moderateScale(16),
    color: '#1A2B4A',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: scale(5),
  },
  priceLabel: {
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(14),
    color: '#5A6A7E',
  },
  priceValue: {
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(14),
    color: '#1A2B4A',
  },
  dividerPrice: {
    height: 1,
    backgroundColor: '#E8ECF4',
    marginVertical: scale(10),
  },
  totalLabel: {
    fontFamily: Fonts.SemiBold,
    fontSize: moderateScale(16),
    color: '#1A2B4A',
  },
  totalValue: {
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(18),
    color: '#4A90D9',
  },

  // ── Submit Button ──
  submitButton: {
    marginTop: scale(28),
    marginHorizontal: scale(16),
    backgroundColor: '#4A90D9',
    paddingVertical: scale(16),
    borderRadius: scale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4A90D9',
    shadowOpacity: 0.25,
    shadowOffset: {width: 0, height: 6},
    shadowRadius: scale(16),
    elevation: 6,
    marginBottom: scale(20),
  },
  submitButtonDisabled: {
    backgroundColor: '#A0A8B4',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#fff',
    fontFamily: Fonts.SemiBold,
    fontSize: moderateScale(16),
    marginRight: scale(10),
  },
});
