import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Image,
  Alert,
  Dimensions,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import LinearGradient from 'react-native-linear-gradient';

import {COLORS} from '../../Theme/Colors';
import {Fonts} from '../../Theme/Fonts';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';

import {Container} from '../../component/Container/Container';
import CustomHeader from '../../component/header/CustomHeader';
import CustomTextInput from '../../component/texinput/CustomTextInput';
import CustomRadioButton from '../../component/CustomRadioButton';

import {Instance} from '../../api/Instance';

const {width} = Dimensions.get('window');

export default function BookAppointment({route, navigation}) {
  const {
    labId = null,
    selectedTestIds = [],
    labName = '',
    selectedTestsname = [],
    locationAddress = '',
  } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [date, setDate] = useState('');
  const [textShowDate, setTextShowDate] = useState('');
  const [selectedHealthProblem, setSelectedHealthProblem] = useState(null);

  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    visittype: '',
    mobile: '',
    problemDescription: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const genderOptions = [
    {label: 'Male', value: 'male'},
    {label: 'Female', value: 'female'},
  ];

  const visitOptions = [
    {label: 'Home Visit', value: 'home'},
    {label: 'Lab Visit', value: 'lab'},
  ];

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = selectedDate => {
    const dt = new Date(selectedDate);

    const formattedDate = `${dt.getDate()}/${
      dt.getMonth() + 1
    }/${dt.getFullYear()}`;

    setTextShowDate(formattedDate);
    setDate(dt.toISOString());

    hideDatePicker();
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const userToken = await AsyncStorage.getItem('userToken');

      if (!userToken) {
        Alert.alert('Error', 'Please login again');
        return;
      }

      if (!formData.age) {
        Alert.alert('Validation', 'Please enter age');
        return;
      }

      if (!formData.gender) {
        Alert.alert('Validation', 'Please select gender');
        return;
      }

      if (!selectedHealthProblem) {
        Alert.alert('Validation', 'Please select health problem');
        return;
      }

      const appointmentData = {
        type: 'General Checkup',
        age: Number(formData.age),
        gender: formData.gender,
        referral: formData.mobile,
        vistType: formData.visittype,
        locationAddress: locationAddress,

        problem: selectedHealthProblem?.name,

        healthProblem: [selectedHealthProblem?._id],

        appointmentDate: date,

        problemDescription: formData.problemDescription,

        labs: {
          lab: labId,
          tests: selectedTestIds.map(testId => ({
            test: testId,
          })),
        },

        address: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
      };

      await Instance.post('api/v1/appointments', appointmentData, {
        headers: {
          authorization: userToken,
        },
      });

      setSuccessModal(true);
    } catch (error) {
      console.log(error);

      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setSuccessModal(false);

    navigation.navigate('UserAppointments');
  };

  return (
    <Container backgroundColor={COLORS.white} statusBarStyle={'dark-content'}>
      <CustomHeader title="Book Appointment" navigation={navigation} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: verticalScale(40),
        }}>
        {/* HERO HEADER */}
        <LinearGradient
          colors={[COLORS.DODGERBLUE, '#4A90E2']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.heroSection}>
          <View style={styles.heroContent}>
            <View style={styles.iconCircle}>
              <Icon name="calendar" size={28} color={COLORS.white} />
            </View>
            <Text style={styles.heroTitle}>Book Your Appointment</Text>
            <Text style={styles.heroSubtitle}>
              Schedule your lab test with trusted diagnostic centers
            </Text>
          </View>
        </LinearGradient>

        {/* LAB INFO CARD */}
        {labName ? (
          <View style={styles.section}>
            <View style={styles.labCard}>
              <View style={styles.labIconWrapper}>
                <Icon name="business" size={24} color={COLORS.white} />
              </View>
              <View style={styles.labInfo}>
                <Text style={styles.labLabel}>Selected Lab</Text>
                <Text style={styles.labName}>{labName}</Text>
              </View>
            </View>

            {selectedTestsname.length > 0 && (
              <View style={styles.testsCard}>
                <Text style={styles.testsLabel}>
                  Selected Tests ({selectedTestsname.length})
                </Text>
                <View style={styles.testsGrid}>
                  {selectedTestsname.map((item, index) => (
                    <View key={index} style={styles.testBadge}>
                      <Icon name="flask" size={14} color={COLORS.DODGERBLUE} />
                      <Text style={styles.testBadgeText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        ) : null}

        {/* FORM CARD */}
        <View style={styles.section}>
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Personal Details</Text>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <CustomTextInput
                  label="Age"
                  placeholder="Enter age"
                  keyboardType="numeric"
                  maxLength={2}
                  value={formData.age}
                  onChangeText={value => handleInputChange('age', value)}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>Appointment Date</Text>
                <TouchableOpacity
                  style={styles.dateBox}
                  onPress={showDatePicker}>
                  <Icon
                    name="calendar-outline"
                    size={20}
                    color={textShowDate ? COLORS.DODGERBLUE : COLORS.silver}
                  />
                  <Text
                    style={[
                      styles.dateText,
                      !textShowDate && styles.placeholderText,
                    ]}>
                    {textShowDate || 'Select date'}
                  </Text>
                  <Icon
                    name="chevron-forward"
                    size={18}
                    color={COLORS.silver}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.label}>Gender</Text>
            <View style={styles.radioContainer}>
              <CustomRadioButton
                options={genderOptions}
                selectedValue={formData.gender}
                onValueChange={gender =>
                  setFormData(prev => ({
                    ...prev,
                    gender,
                  }))
                }
              />
            </View>

            <Text style={styles.label}>Visit Type</Text>
            <View style={styles.radioContainer}>
              <CustomRadioButton
                options={visitOptions}
                selectedValue={formData.visittype}
                onValueChange={visittype =>
                  setFormData(prev => ({
                    ...prev,
                    visittype,
                  }))
                }
              />
            </View>

            <CustomTextInput
              label="Referral Mobile"
              placeholder="Enter referral mobile"
              keyboardType="phone-pad"
              maxLength={10}
              value={formData.mobile}
              onChangeText={value => handleInputChange('mobile', value)}
            />

            <Text style={styles.label}>Health Problem</Text>
            <TouchableOpacity
              style={styles.problemBox}
              onPress={() =>
                navigation.navigate('SelectHealthP', {
                  onSelectProblem: setSelectedHealthProblem,
                })
              }>
              <View style={styles.problemLeft}>
                <Icon
                  name="medical"
                  size={20}
                  color={
                    selectedHealthProblem ? COLORS.DODGERBLUE : COLORS.silver
                  }
                />
                <Text
                  style={[
                    styles.problemText,
                    !selectedHealthProblem && styles.placeholderText,
                  ]}>
                  {selectedHealthProblem?.name || 'Select health problem'}
                </Text>
              </View>
              <Icon name="chevron-forward" size={20} color={COLORS.silver} />
            </TouchableOpacity>

            <CustomTextInput
              label="Pincode"
              placeholder="Enter pincode"
              keyboardType="number-pad"
              maxLength={6}
              value={formData.pincode}
              onChangeText={value => handleInputChange('pincode', value)}
            />

            <CustomTextInput
              label="Address"
              placeholder="Enter full address"
              value={formData.address}
              onChangeText={value => handleInputChange('address', value)}
            />

            <View style={styles.row}>
              <View style={styles.halfField}>
                <CustomTextInput
                  label="City"
                  placeholder="City"
                  value={formData.city}
                  onChangeText={value => handleInputChange('city', value)}
                />
              </View>

              <View style={styles.halfField}>
                <CustomTextInput
                  label="State"
                  placeholder="State"
                  value={formData.state}
                  onChangeText={value => handleInputChange('state', value)}
                />
              </View>
            </View>

            <CustomTextInput
              label="Symptoms Description"
              placeholder="Describe your symptoms..."
              value={formData.problemDescription}
              onChangeText={value =>
                handleInputChange('problemDescription', value)
              }
              multiline
              numberOfLines={3}
            />

            {/* SECURITY BOX */}
            <View style={styles.securityBox}>
              <MaterialCommunityIcons
                name="shield-check"
                size={20}
                color={COLORS.DODGERBLUE}
              />
              <View style={styles.securityTextWrapper}>
                <Text style={styles.securityTitle}>Secure & Private</Text>
                <Text style={styles.securityDesc}>
                  Your appointment details are encrypted and secure
                </Text>
              </View>
            </View>

            {/* SUBMIT BUTTON */}
            <TouchableOpacity
              disabled={loading}
              onPress={handleSubmit}
              activeOpacity={0.9}>
              <LinearGradient
                colors={[COLORS.DODGERBLUE, '#4A90E2']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.submitButton}>
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <Icon
                      name="checkmark-circle"
                      size={22}
                      color={COLORS.white}
                    />
                    <Text style={styles.submitButtonText}>
                      Book Appointment
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* SUCCESS MODAL */}
      <Modal transparent visible={successModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIconWrapper}>
              <Icon
                name="checkmark-circle"
                size={80}
                color={COLORS.greenViridian}
              />
            </View>

            <Text style={styles.successTitle}>Appointment Booked!</Text>
            <Text style={styles.successSubtitle}>
              Your appointment has been confirmed successfully. You will receive
              a confirmation shortly.
            </Text>

            <TouchableOpacity onPress={closeModal} activeOpacity={0.9}>
              <LinearGradient
                colors={[COLORS.DODGERBLUE, '#4A90E2']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.modalButton}>
                <Text style={styles.modalButtonText}>View Appointments</Text>
                <Icon name="arrow-forward" size={18} color={COLORS.white} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* DATE PICKER */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: scale(16),
    marginTop: verticalScale(16),
  },
  heroSection: {
    marginHorizontal: scale(16),
    marginTop: verticalScale(16),
    borderRadius: moderateScale(20),
    padding: scale(20),
    shadowColor: COLORS.DODGERBLUE,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  heroContent: {
    alignItems: 'center',
  },
  iconCircle: {
    width: scale(56),
    height: scale(56),
    borderRadius: moderateScale(28),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  heroTitle: {
    fontSize: moderateScale(20),
    fontFamily: Fonts.Bold,
    color: COLORS.white,
    marginBottom: verticalScale(4),
  },
  heroSubtitle: {
    fontSize: moderateScale(13),
    fontFamily: Fonts.Regular,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: moderateScale(18),
  },

  labCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    padding: scale(16),
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.lightTurquoise,
  },
  labIconWrapper: {
    width: scale(48),
    height: scale(48),
    borderRadius: moderateScale(14),
    backgroundColor: COLORS.DODGERBLUE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(14),
  },
  labInfo: {
    flex: 1,
  },
  labLabel: {
    fontSize: moderateScale(12),
    fontFamily: Fonts.Regular,
    color: COLORS.silver,
    marginBottom: verticalScale(2),
  },
  labName: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Bold,
    color: COLORS.black,
  },

  testsCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    padding: scale(16),
    marginTop: verticalScale(10),
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.lightTurquoise,
  },
  testsLabel: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Bold,
    color: COLORS.black,
    marginBottom: verticalScale(10),
  },
  testsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
  },
  testBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightTurquoise,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
    gap: scale(6),
  },
  testBadgeText: {
    fontSize: moderateScale(12),
    fontFamily: Fonts.Medium,
    color: COLORS.DODGERBLUE,
  },

  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(20),
    padding: scale(18),
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F0F4F8',
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontFamily: Fonts.Bold,
    color: COLORS.black,
    marginBottom: verticalScale(16),
  },
  row: {
    flexDirection: 'row',
    gap: scale(12),
  },
  halfField: {
    flex: 1,
  },
  label: {
    fontSize: moderateScale(13),
    fontFamily: Fonts.Bold,
    color: COLORS.black,
    marginBottom: verticalScale(8),
    marginTop: verticalScale(4),
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: verticalScale(52),
    borderWidth: 1.5,
    borderColor: COLORS.lightTurquoise,
    backgroundColor: COLORS.whiteSeasalt,
    borderRadius: moderateScale(14),
    paddingHorizontal: scale(14),
    gap: scale(10),
  },
  dateText: {
    flex: 1,
    fontSize: moderateScale(14),
    fontFamily: Fonts.Medium,
    color: COLORS.black,
  },
  placeholderText: {
    color: COLORS.silver,
  },
  radioContainer: {
    marginBottom: verticalScale(4),
  },
  problemBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: verticalScale(52),
    borderWidth: 1.5,
    borderColor: COLORS.lightTurquoise,
    backgroundColor: COLORS.whiteSeasalt,
    borderRadius: moderateScale(14),
    paddingHorizontal: scale(14),
    marginBottom: verticalScale(14),
  },
  problemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
    flex: 1,
  },
  problemText: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Medium,
    color: COLORS.black,
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightTurquoise,
    padding: scale(14),
    borderRadius: moderateScale(14),
    marginTop: verticalScale(6),
    marginBottom: verticalScale(20),
    gap: scale(12),
  },
  securityTextWrapper: {
    flex: 1,
  },
  securityTitle: {
    fontSize: moderateScale(13),
    fontFamily: Fonts.Bold,
    color: COLORS.DODGERBLUE,
    marginBottom: verticalScale(2),
  },
  securityDesc: {
    fontSize: moderateScale(11),
    fontFamily: Fonts.Regular,
    color: COLORS.DODGERBLUE,
    opacity: 0.8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: verticalScale(56),
    borderRadius: moderateScale(16),
    gap: scale(10),
    shadowColor: COLORS.DODGERBLUE,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Bold,
    color: COLORS.white,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(24),
  },
  modalContent: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(24),
    padding: scale(28),
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  successIconWrapper: {
    width: scale(100),
    height: scale(100),
    borderRadius: moderateScale(50),
    backgroundColor: '#E6F9F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  successTitle: {
    fontSize: moderateScale(22),
    fontFamily: Fonts.Bold,
    color: COLORS.black,
    marginBottom: verticalScale(8),
  },
  successSubtitle: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Regular,
    color: COLORS.silver,
    textAlign: 'center',
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(24),
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: verticalScale(52),
    borderRadius: moderateScale(14),
    gap: scale(8),
  },
  modalButtonText: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Bold,
    color: COLORS.white,
  },
});
