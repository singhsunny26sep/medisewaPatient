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
  Platform,
  PermissionsAndroid,
  Linking,
  Dimensions
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
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import usePhonePePayment from '../../component/PhonePay/usePhonePePayment';
import useRazorpayPayment from '../../component/Rozar/useRazorpayPayment';

const { width: screenWidth } = Dimensions.get('window');

export default function Dr_AppointmentBook({route, navigation}) {
  const {submitHandler: razorpaySubmitHandler, loading: paymentLoading} =
    useRazorpayPayment();

  const {doctorId} = route.params;
  console.log('🔍 route.params:', route.params);
  console.log('🔍 doctorId from route.params:', doctorId);
  console.log('🔍 Type of doctorId:', typeof doctorId);
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
  const [consultationType, setConsultationType] = useState('offline');
  const [familyMemberName, setFamilyMemberName] = useState('');
  const [familyMemberAge, setFamilyMemberAge] = useState('');
  const [familyMemberGender, setFamilyMemberGender] = useState('');
  const [familyMemberRelation, setFamilyMemberRelation] = useState('');
  const [reports, setReports] = useState([]);
  const [uploading, setUploading] = useState(false);
  const {submitHandler} = usePhonePePayment();
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const appointmentTypeItems = [
    {label: 'For Myself', value: 'self'},
    {label: 'For Family Member', value: 'family'},
  ];

  const genderItems = [
    {label: 'Male', value: 'male'},
    {label: 'Female', value: 'female'},
    {label: 'Other', value: 'other'},
  ];

  const relationItems = [
    {label: 'Father', value: 'father'},
    {label: 'Mother', value: 'mother'},
    {label: 'Spouse', value: 'spouse'},
    {label: 'Child', value: 'child'},
    {label: 'Sibling', value: 'sibling'},
    {label: 'Other', value: 'other'},
  ];

  const formatTimeSlotKey = (key) => {
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
      'at8_30PM': '08:30 PM'
    };
    
    return timeMap[key] || key;
  };

  // Function to fetch time slots for a specific date
  const fetchTimeSlots = async (date) => {
    try {
      setLoadingSlots(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('Token not found!');
        return;
      }

      const formattedDate = moment(date).format('YYYY-MM-DD');
      const response = await Instance.get(`api/v1/time-slots/getAll?doctorId=${"68e75b523f50d39c33ac1f32"}&date=${formattedDate}&page=1&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success && response.data.data.timeSlots.length > 0) {
        const timeSlotData = response.data.data.timeSlots[0];
        return processTimeSlotData(timeSlotData, date);
      } else {
        // No slots available for this date
        return createEmptySlotData(date);
      }
    } catch (error) {
      console.error('Error fetching time slots:', error.response?.data || error.message);
      return createEmptySlotData(date);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Process time slot data from API
  const processTimeSlotData = (timeSlotData, date) => {
    const { morning = {}, afternoon = {}, evening = {} } = timeSlotData;
    
    const morningSlots = [];
    const afternoonSlots = [];
    const eveningSlots = [];

    // Process morning slots
    Object.keys(morning).forEach(key => {
      if (morning[key]) {
        morningSlots.push({
          time: formatTimeSlotKey(key),
          available: true
        });
      }
    });

    // Process afternoon slots
    Object.keys(afternoon).forEach(key => {
      if (afternoon[key]) {
        afternoonSlots.push({
          time: formatTimeSlotKey(key),
          available: true
        });
      }
    });

    // Process evening slots
    Object.keys(evening).forEach(key => {
      if (evening[key]) {
        eveningSlots.push({
          time: formatTimeSlotKey(key),
          available: true
        });
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
      timeSlots: {
        morning: morningSlots,
        afternoon: afternoonSlots,
        evening: eveningSlots
      }
    };
  };

  // Create empty slot data when no slots are available
  const createEmptySlotData = (date) => {
    return {
      id: `empty-${moment(date).format('YYYY-MM-DD')}`,
      date: moment(date).format('ddd, D MMM'),
      day: getDayLabel(date),
      slots: 0,
      available: false,
      fullDate: moment(date).format('YYYY-MM-DD'),
      timeSlots: null
    };
  };

  // Get day label (Today, Tomorrow, etc.)
  const getDayLabel = (date) => {
    const today = moment().startOf('day');
    const tomorrow = moment().add(1, 'days').startOf('day');
    const targetDate = moment(date).startOf('day');

    if (targetDate.isSame(today)) return 'Today';
    if (targetDate.isSame(tomorrow)) return 'Tomorrow';
    return targetDate.format('dddd');
  };

  // Generate dates for the next 7 days
  const generateDateRange = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(moment().add(i, 'days').toDate());
    }
    return dates;
  };

  // Fetch time slots for all dates in range
  const fetchAllTimeSlots = async () => {
    const dates = generateDateRange();
    const slotsPromises = dates.map(date => fetchTimeSlots(date));
    
    try {
      const slotsData = await Promise.all(slotsPromises);
      setAvailableSlots(slotsData);
    } catch (error) {
      console.error('Error fetching all time slots:', error);
    }
  };

  const handleConfirm = date => {
    setSelectedDate(date);
    setDatePickerVisibility(false);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleDaySelect = async (index) => {
    if (availableSlots[index]?.available) {
      setSelectedDay(index);
      setSelectedTime(null);
      
      // Refresh slots for selected day
      const date = generateDateRange()[index];
      const updatedSlot = await fetchTimeSlots(date);
      
      const updatedSlots = [...availableSlots];
      updatedSlots[index] = updatedSlot;
      setAvailableSlots(updatedSlots);
    }
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
        console.log('🔍 Doctor details response:', response.data);

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
              <Icon
                name="business"
                size={scale(20)}
                color={COLORS.DODGERBLUE}
              />
              <Text style={styles.doctorInfoText}>{department?.name}</Text>
            </View>
            <View style={styles.doctorInfoRow}>
              <Icon
                name="accessibility"
                size={scale(20)}
                color={COLORS.DODGERBLUE}
              />
              <Text style={styles.doctorInfoText}>{doctorGender}</Text>
            </View>
            <View style={styles.doctorInfoRow}>
              <Icon
                name="location-on"
                size={scale(20)}
                color={COLORS.DODGERBLUE}
              />
              <Text style={styles.doctorInfoText}>{clinicAddress}</Text>
            </View>
            <View style={styles.doctorInfoRow}>
              <Icon
                name="attach-money"
                size={scale(20)}
                color={COLORS.DODGERBLUE}
              />
              <Text style={styles.doctorInfoText}>
                ₹{fee}{' '}
                <Text
                  style={{
                    textDecorationLine: 'line-through',
                    color: COLORS.gray,
                  }}>
                  ₹{oldFee}
                </Text>
              </Text>
            </View>
            <View style={styles.doctorInfoRow}>
              <Icon
                name="access-time"
                size={scale(20)}
                color={COLORS.DODGERBLUE}
              />
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

      // Validation checks
      if (!appointmentType) {
        setToastMessage('Please select appointment type');
        setToastType('danger');
        setIsSubmitting(false);
        return;
      }

      if (appointmentType === 'family') {
        if (!familyMemberName || !familyMemberAge || !familyMemberGender || !familyMemberRelation) {
          setToastMessage('Please fill all family member details');
          setToastType('danger');
          setIsSubmitting(false);
          return;
        }
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

      const payload = {
        doctorId: doctorDetails?.doctorId?._id,
        appointmentDate: formattedDate,
        appointmentTime: formattedTime,
        consultationFee: doctorDetails?.doctorId?.fee?.toString() || '500',
        serviceCharge: '0',
        appointmentType: appointmentType,
        consultationType: consultationType,
        familyMemberDetails: appointmentType === 'family' ? {
          name: familyMemberName,
          age: familyMemberAge,
          gender: familyMemberGender,
          relation: familyMemberRelation,
        } : null,
      };

      console.log('Booking payload:', JSON.stringify(payload, null, 2));

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
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      } else {
        setToastMessage(response.data.message || 'Failed to book appointment');
        setToastType('danger');
      }
    } catch (error) {
      console.error('Booking error:', error.response?.data || error.message);
      setToastMessage(error.response?.data?.message || 'Failed to book appointment. Please try again.');
      setToastType('danger');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs access to your camera to take photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleImagePick = async type => {
    try {
      if (type === 'camera') {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
          setToastMessage('Camera permission is required');
          setToastType('danger');
          return;
        }
      }

      const options = {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
        saveToPhotos: true,
        cameraType: 'back',
      };

      const result =
        type === 'camera'
          ? await launchCamera(options)
          : await launchImageLibrary(options);

      if (result.didCancel) {
        console.log('User cancelled image picker');
        return;
      }

      if (result.errorCode) {
        console.log('ImagePicker Error: ', result.errorMessage);
        setToastMessage('Error capturing image');
        setToastType('danger');
        return;
      }

      if (result.assets && result.assets[0]) {
        const newReport = {
          type: 'image',
          name: result.assets[0].fileName || 'image.jpg',
          uri: result.assets[0].uri,
          size: result.assets[0].fileSize,
        };

        setReports([...reports, newReport]);
      }
    } catch (err) {
      console.error('Image picker error:', err);
      setToastMessage('Error capturing image');
      setToastType('danger');
    }
  };

  const removeReport = index => {
    const newReports = [...reports];
    newReports.splice(index, 1);
    setReports(newReports);
  };

  const renderReportItem = ({item, index}) => (
    <View style={styles.reportItem}>
      <Image source={{uri: item.uri}} style={styles.reportThumbnail} />
      <Text style={styles.reportName} numberOfLines={1}>
        {item.name}
      </Text>
      <TouchableOpacity onPress={() => removeReport(index)}>
        <Icon name="close" size={scale(20)} color={COLORS.red} />
      </TouchableOpacity>
    </View>
  );

  const handleConsultationTypeChange = async type => {
    setConsultationType(type);
    if (type === 'online') {
      try {
        const paymentAmount = doctorDetails?.doctorId?.fee || 500;

        const paymentResult = await razorpaySubmitHandler(paymentAmount, {
          description: 'Doctor Consultation Fee',
          appName: 'Mediseva',
          doctorId: doctorDetails?.doctorId?._id,
          appointmentType: 'online_consultation',
        });

        if (paymentResult.status === 'SUCCESS') {
          setToastMessage(
            'Payment successful! Proceeding with online consultation.',
          );
          setToastType('success');
        } else if (paymentResult.status === 'CANCELLED') {
          setToastMessage(
            'Payment was cancelled. Please select offline consultation or try again.',
          );
          setToastType('warning');
          setConsultationType('offline');
        } else {
          setToastMessage(
            'Payment failed. Please try again or select offline consultation.',
          );
          setToastType('danger');
          setConsultationType('offline');
        }
      } catch (error) {
        console.error('Payment error:', error);
        setToastMessage(
          'Payment failed. Please try again or select offline consultation.',
        );
        setToastType('danger');
        setConsultationType('offline');
      }
    }
  };

  // Enhanced renderDayButtons with horizontal FlatList
  const renderDayButtons = () => (
    <View style={styles.daysContainer}>
      {loadingSlots ? (
        <ActivityIndicator size="small" color={COLORS.DODGERBLUE} />
      ) : (
        <FlatList
          data={availableSlots}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.daysListContent}
          renderItem={({item, index}) => (
            <TouchableOpacity
              style={[
                styles.dayButton,
                selectedDay === index && styles.selectedDayButton,
                !item.available && styles.disabledDayButton
              ]}
              onPress={() => handleDaySelect(index)}
              disabled={!item.available}
            >
              <Text style={[
                styles.dayText,
                selectedDay === index && styles.selectedDayText,
                !item.available && styles.disabledDayText
              ]}>
                {item.day}
              </Text>
              <Text style={[
                styles.dateText,
                selectedDay === index && styles.selectedDayText,
                !item.available && styles.disabledDayText
              ]}>
                {item.date}
              </Text>
              
              {item.available ? (
                <View style={[
                  styles.slotsBadge,
                  selectedDay === index && styles.selectedSlotsBadge
                ]}>
                  <Text style={[
                    styles.slotsText,
                    selectedDay === index && styles.selectedSlotsText
                  ]}>
                    {item.slots} slots
                  </Text>
                </View>
              ) : (
                <View style={styles.unavailableBadge}>
                  <Text style={styles.unavailableText}>
                    Not available
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );

  // Enhanced renderTimeSlots with better UI
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
          <Icon name="event-busy" size={scale(40)} color={COLORS.gray} />
          <Text style={styles.noSlotsText}>No slots available for this day</Text>
        </View>
      );
    }

    const { morning = [], afternoon = [], evening = [] } = selectedSlot.timeSlots;

    return (
      <View style={styles.timeSlotsContainer}>
        {/* Morning Slots */}
        {morning.length > 0 && (
          <View style={styles.timeSlotSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.timeSlotSectionTitle}>Morning</Text>
              <Text style={styles.timeSlotCount}>
                {morning.length} slots
              </Text>
            </View>
            <View style={styles.timeSlotsGrid}>
              {morning.map((timeSlot, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeSlotButton,
                    selectedTime === timeSlot.time && styles.selectedTimeSlotButton,
                    !timeSlot.available && styles.disabledTimeSlotButton
                  ]}
                  onPress={() => timeSlot.available && handleTimeSelect(timeSlot.time)}
                  disabled={!timeSlot.available}
                >
                  <Text style={[
                    styles.timeSlotText,
                    selectedTime === timeSlot.time && styles.selectedTimeSlotText,
                    !timeSlot.available && styles.disabledTimeSlotText
                  ]}>
                    {timeSlot.time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Afternoon Slots */}
        {afternoon.length > 0 && (
          <View style={styles.timeSlotSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.timeSlotSectionTitle}>Afternoon</Text>
              <Text style={styles.timeSlotCount}>
                {afternoon.length} slots
              </Text>
            </View>
            <View style={styles.timeSlotsGrid}>
              {afternoon.map((timeSlot, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeSlotButton,
                    selectedTime === timeSlot.time && styles.selectedTimeSlotButton,
                    !timeSlot.available && styles.disabledTimeSlotButton
                  ]}
                  onPress={() => timeSlot.available && handleTimeSelect(timeSlot.time)}
                  disabled={!timeSlot.available}
                >
                  <Text style={[
                    styles.timeSlotText,
                    selectedTime === timeSlot.time && styles.selectedTimeSlotText,
                    !timeSlot.available && styles.disabledTimeSlotText
                  ]}>
                    {timeSlot.time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Evening Slots */}
        {evening.length > 0 && (
          <View style={styles.timeSlotSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.timeSlotSectionTitle}>Evening</Text>
              <Text style={styles.timeSlotCount}>
                {evening.length} slots
              </Text>
            </View>
            <View style={styles.timeSlotsGrid}>
              {evening.map((timeSlot, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeSlotButton,
                    selectedTime === timeSlot.time && styles.selectedTimeSlotButton,
                    !timeSlot.available && styles.disabledTimeSlotButton
                  ]}
                  onPress={() => timeSlot.available && handleTimeSelect(timeSlot.time)}
                  disabled={!timeSlot.available}
                >
                  <Text style={[
                    styles.timeSlotText,
                    selectedTime === timeSlot.time && styles.selectedTimeSlotText,
                    !timeSlot.available && styles.disabledTimeSlotText
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

        <View style={styles.dropdownContainer}>
          <Text style={[styles.selectDateText, {marginHorizontal: scale(0)}]}>
            Appointment For
          </Text>
          <CustomDropdown
            data={appointmentTypeItems}
            value={appointmentType}
            onChange={setAppointmentType}
            placeholder="Select appointment type"
            style={styles.dropdown}
            containerStyle={styles.dropdownContainerStyle}
          />
        </View>

        <View style={styles.consultationTypeContainer}>
          <Text style={[styles.selectDateText, {marginHorizontal: scale(0)}]}>
            Consultation Type
          </Text>
          <View style={styles.radioContainer}>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => handleConsultationTypeChange('offline')}>
              <View style={styles.radioOuter}>
                {consultationType === 'offline' && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <Text style={styles.radioText}>Clinic visit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => handleConsultationTypeChange('online')}>
              <View style={styles.radioOuter}>
                {consultationType === 'online' && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <Text style={styles.radioText}>Online Consultation</Text>
            </TouchableOpacity>
          </View>
        </View>

        {consultationType === 'offline' &&
          doctorDetails?.doctorId?.clinicAddress && (
            <TouchableOpacity
              style={styles.getDirectionButton}
              onPress={() => {
                const address = encodeURIComponent(
                  doctorDetails.doctorId.clinicAddress,
                );
                const url =
                  Platform.OS === 'ios'
                    ? `http://maps.apple.com/?daddr=${address}`
                    : `https://www.google.com/maps/dir/?api=1&destination=${address}`;
                Linking.openURL(url);
              }}>
              <Text style={styles.getDirectionButtonText}>Get Direction</Text>
            </TouchableOpacity>
          )}

        {appointmentType === 'family' && (
          <View style={styles.familyMemberContainer}>
            <Text style={styles.sectionTitle}>Family Member Details</Text>
            <CustomTextInput
              placeholder="Enter Name"
              value={familyMemberName}
              onChangeText={setFamilyMemberName}
              style={styles.input}
            />
            <CustomTextInput
              placeholder="Enter Age"
              value={familyMemberAge}
              onChangeText={setFamilyMemberAge}
              keyboardType="numeric"
              style={styles.input}
            />
            <CustomDropdown
              data={genderItems}
              value={familyMemberGender}
              onChange={setFamilyMemberGender}
              placeholder="Select Gender"
              style={styles.dropdown}
              containerStyle={styles.dropdownContainerStyle}
            />
            <CustomDropdown
              data={relationItems}
              value={familyMemberRelation}
              onChange={setFamilyMemberRelation}
              placeholder="Select Relation"
              style={[styles.dropdown, {marginTop: scale(12)}]}
              containerStyle={styles.dropdownContainerStyle}
            />
          </View>
        )}

        <View style={styles.slotsContainer}>
          <Text style={styles.selectDateText}>Available Slots</Text>
          
          {/* Day Selection Buttons */}
          {renderDayButtons()}
          
          {/* Time Slots for Selected Day */}
          {renderTimeSlots()}
        </View>

        <View style={styles.reportsContainer}>
          <Text style={styles.sectionTitle}>Past Reports</Text>
          <View style={styles.uploadButtonsContainer}>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => handleImagePick('gallery')}>
              <Icon
                name="photo-library"
                size={scale(24)}
                color={COLORS.DODGERBLUE}
              />
              <Text style={styles.uploadButtonText}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => handleImagePick('camera')}>
              <Icon
                name="camera-alt"
                size={scale(24)}
                color={COLORS.DODGERBLUE}
              />
              <Text style={styles.uploadButtonText}>Camera</Text>
            </TouchableOpacity>
          </View>

          {reports.length > 0 && (
            <View style={styles.reportsList}>
              <Text style={styles.reportsListTitle}>Uploaded Reports</Text>
              <FlatList
                data={reports}
                renderItem={renderReportItem}
                keyExtractor={(item, index) => index.toString()}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled
          ]}
          onPress={handleSubmitAppointment}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.submitButtonText}>Submit Appointment</Text>
          )}
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
  inputContainer: {
    paddingHorizontal: scale(15),
    borderTopWidth: 0.5,
    borderColor: COLORS.AshGray,
    paddingTop: scale(15),
    marginTop: scale(5),
  },
  selectDateText: {
    fontFamily: Fonts.Light,
    color: COLORS.black,
    marginHorizontal: scale(15),
    fontSize: moderateScale(16),
    marginBottom: scale(10),
    marginTop: scale(15),
  },
  availableSlotsText: {
    marginTop: scale(15),
  },
  dateContainer: {
    padding: scale(12),
    borderWidth: 1,
    borderColor: COLORS.AshGray,
    borderRadius: scale(12),
    backgroundColor: COLORS.white,
    marginHorizontal: scale(15),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: scale(4),
    elevation: 2,
  },
  icon: {
    marginRight: scale(10),
  },
  selectedDate: {
    fontFamily: Fonts.Medium,
    color: COLORS.black,
    fontSize: moderateScale(15),
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
  dropdownContainer: {
    marginHorizontal: scale(15),
    marginTop: scale(10),
    zIndex: 3000,
    marginBottom: scale(10),
  },
  dropdown: {
    borderColor: COLORS.AshGray,
    borderRadius: scale(12),
    height: scale(50),
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: scale(4),
    elevation: 2,
  },
  dropdownContainerStyle: {
    borderColor: COLORS.AshGray,
    borderRadius: scale(12),
    backgroundColor: COLORS.white,
  },
  familyMemberContainer: {
    marginHorizontal: scale(15),
    marginTop: scale(10),
    backgroundColor: COLORS.white,
    padding: scale(15),
    borderRadius: scale(15),
    shadowColor: COLORS.black,
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: scale(8),
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.AshGray,
    borderRadius: scale(12),
    paddingHorizontal: scale(15),
    height: scale(50),
    marginBottom: scale(12),
    fontFamily: Fonts.Medium,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: scale(4),
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: Fonts.Light,
    color: COLORS.black,
    fontSize: moderateScale(16),
    marginBottom: scale(10),
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.AshGray,
    marginVertical: scale(15),
    opacity: 0.5,
  },
  reportsContainer: {
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
  uploadButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: scale(10),
  },
  uploadButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.lightGray,
    padding: scale(12),
    borderRadius: scale(12),
    marginHorizontal: scale(10),
  },
  uploadButtonText: {
    fontFamily: Fonts.Medium,
    color: COLORS.black,
    fontSize: moderateScale(12),
    marginTop: scale(5),
  },
  reportsList: {
    marginTop: scale(15),
  },
  reportsListTitle: {
    fontFamily: Fonts.Light,
    color: COLORS.black,
    fontSize: moderateScale(16),
    marginBottom: scale(10),
  },
  reportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    padding: scale(12),
    borderRadius: scale(8),
    marginBottom: scale(8),
  },
  reportThumbnail: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(4),
  },
  reportName: {
    flex: 1,
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(14),
    color: COLORS.black,
    marginLeft: scale(10),
  },
  consultationTypeContainer: {
    marginHorizontal: scale(15),
    marginBottom: scale(10),
  },
  radioContainer: {
    flexDirection: 'row',
    marginTop: scale(5),
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: scale(20),
  },
  radioOuter: {
    height: scale(20),
    width: scale(20),
    borderRadius: scale(10),
    borderWidth: 2,
    borderColor: COLORS.DODGERBLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    height: scale(10),
    width: scale(10),
    borderRadius: scale(5),
    backgroundColor: COLORS.DODGERBLUE,
  },
  radioText: {
    marginLeft: scale(8),
    fontSize: moderateScale(14),
    fontFamily: Fonts.Medium,
    color: COLORS.black,
  },
  getDirectionButton: {
    marginTop: scale(8),
    marginBottom: scale(8),
    backgroundColor: COLORS.DODGERBLUE,
    paddingVertical: scale(8),
    paddingHorizontal: scale(16),
    borderRadius: scale(8),
    alignSelf: 'flex-start',
    marginLeft: scale(15),
  },
  getDirectionButtonText: {
    color: COLORS.white,
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(14),
  },

  // New enhanced styles for timing slots UI
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
});