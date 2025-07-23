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
  const [consultationType, setConsultationType] = useState('offline');
  const [familyMemberName, setFamilyMemberName] = useState('');
  const [familyMemberAge, setFamilyMemberAge] = useState('');
  const [familyMemberGender, setFamilyMemberGender] = useState('');
  const [familyMemberRelation, setFamilyMemberRelation] = useState('');
  const [reports, setReports] = useState([]);
  const [uploading, setUploading] = useState(false);
  const {submitHandler} = usePhonePePayment();
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

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

  const handleConfirm = date => {
    setSelectedDate(date);
    setDatePickerVisibility(false);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const showTimePicker = () => {
    setTimePickerVisibility(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisibility(false);
  };

  const handleTimeConfirm = time => {
    const formattedTime = moment(time).format('h:mm A');
    setSelectedTime(formattedTime);
    hideTimePicker();
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
        alert('User not authenticated!');
        return;
      }

      if (!appointmentType) {
        setToastMessage('Please select appointment type');
        setToastType('danger');
        setIsSubmitting(false);
        return;
      }

      if (appointmentType === 'family') {
        if (
          !familyMemberName ||
          !familyMemberAge ||
          !familyMemberGender ||
          !familyMemberRelation
        ) {
          setToastMessage('Please fill all family member details');
          setToastType('danger');
          setIsSubmitting(false);
          return;
        }
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
        consultationType: consultationType,
        familyMemberDetails:
          appointmentType === 'family'
            ? {
                name: familyMemberName,
                age: familyMemberAge,
                gender: familyMemberGender,
                relation: familyMemberRelation,
              }
            : null,
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
        setToastMessage('Failed to book appointment');
        setToastType('danger');
      }
    } catch (error) {
      console.error('Booking error:', error.response?.data || error.message);
      setToastMessage('Failed to book appointment. Please try again.');
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

        const paymentResult = await submitHandler(paymentAmount);

        if (paymentResult.status === 'SUCCESS') {
          setToastMessage(
            'Payment successful! Proceeding with online consultation.',
          );
          setToastType('success');
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
          Select Time
        </Text>
        <TouchableOpacity onPress={showTimePicker}>
          <View style={styles.dateContainer}>
            <Icon
              name="access-time"
              size={scale(20)}
              color={'grey'}
              style={styles.icon}
            />
            <Text style={styles.selectedDate}>
              {selectedTime ? selectedTime : 'Select a time'}
            </Text>
          </View>
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={isTimePickerVisible}
          mode="time"
          onConfirm={handleTimeConfirm}
          onCancel={hideTimePicker}
          is24Hour={false}
        />

        {/* Remove the old time slots FlatList section and replace with our new time picker UI that we added above */}

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
          onPress={handleSubmitAppointment}
          disabled={isSubmitting}>
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
  timeSlotsContainer: {
    paddingHorizontal: scale(15),
    marginTop: scale(5),
  },
  timeSlotBox: {
    padding: scale(12),
    marginRight: scale(10),
    borderWidth: 1,
    borderColor: COLORS.AshGray,
    borderRadius: scale(12),
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: scale(4),
    elevation: 2,
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
    paddingVertical: scale(15),
    borderRadius: scale(12),
    alignItems: 'center',
    shadowColor: COLORS.DODGERBLUE,
    shadowOpacity: 0.3,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: scale(8),
    elevation: 5,
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
  hiddenSlotNote: {
    marginHorizontal: scale(15),
    marginBottom: scale(10),
    fontSize: moderateScale(13),
    fontFamily: Fonts.Medium,
    color: COLORS.red,
  },
});
