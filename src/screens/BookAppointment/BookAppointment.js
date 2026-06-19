import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';
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

const {width, height} = Dimensions.get('window');

export default function BookAppointment({route, navigation}) {
  const {
    labId = null,
    labName = '',
    selectedTestsname = [],
    locationAddress = '',
    paidAmount = '',
  } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [date, setDate] = useState('');
  const [textShowDate, setTextShowDate] = useState('');
  const [errors, setErrors] = useState({});

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const modalScaleAnim = useRef(new Animated.Value(0.8)).current;
  const modalFadeAnim = useRef(new Animated.Value(0)).current;

  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    visittype: '',
    mobile: '',
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({...prev, [name]: null}));
    }
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
    if (errors.date) {
      setErrors(prev => ({...prev, date: null}));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.age) newErrors.age = 'Age is required';
    else if (parseInt(formData.age) < 1 || parseInt(formData.age) > 120) {
      newErrors.age = 'Please enter a valid age (1-120)';
    }
    if (!formData.gender) newErrors.gender = 'Please select gender';
    if (!textShowDate) newErrors.date = 'Please select appointment date';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('Error', 'Please login again');
        return;
      }
      const decodedToken = jwtDecode(userToken);
      const patientId =
        decodedToken?._id ||
        decodedToken?.id ||
        decodedToken?.userId ||
        decodedToken?.user?._id ||
        decodedToken?.user?.id ||
        decodedToken?.sub ||
        '';

      const appointmentData = {
        patientId,
        paidAmount: paidAmount || '',
      };
      await Instance.post(`api/v1/labs/book/${labId}`, appointmentData, {
        headers: {
          Authorization: userToken,
        },
      });
      Animated.parallel([
        Animated.spring(modalScaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(modalFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setSuccessModal(true);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(modalScaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(modalFadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSuccessModal(false);
      navigation.navigate('UserAppointments');
    });
  };

  const renderStepIndicator = () => (
    <View style={styles.stepContainer}>
      {[1, 2, 3].map(step => (
        <View key={step} style={styles.stepWrapper}>
          <View
            style={[
              styles.stepCircle,
              step <= 2 ? styles.stepActive : styles.stepInactive,
            ]}>
            <Text style={styles.stepNumber}>{step}</Text>
          </View>
          {step < 3 && (
            <View
              style={[
                styles.stepLine,
                step < 2 ? styles.stepLineActive : styles.stepLineInactive,
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  return (
    <Container backgroundColor={COLORS.white} statusBarStyle={'dark-content'}>
      <CustomHeader title="Book Appointment" navigation={navigation} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <Animated.View
            style={[
              styles.animatedContainer,
              {
                opacity: fadeAnim,
                transform: [{translateY: slideAnim}],
              },
            ]}>
            <LinearGradient
              colors={['#4A90D9', '#357ABD', '#2C6EAD']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
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

            {/* Step Indicator */}
            {renderStepIndicator()}

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
                    {locationAddress && (
                      <Text style={styles.labAddress} numberOfLines={1}>
                        <Icon
                          name="location-outline"
                          size={12}
                          color={COLORS.silver}
                        />{' '}
                        {locationAddress}
                      </Text>
                    )}
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
                          <Icon
                            name="flask"
                            size={14}
                            color={COLORS.DODGERBLUE}
                          />
                          <Text style={styles.testBadgeText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ) : null}

            <TouchableOpacity
              disabled={loading}
              onPress={handleSubmit}
              activeOpacity={0.9}>
              <LinearGradient
                colors={
                  loading ? ['#B0B8C4', '#8A92A0'] : ['#4A90D9', '#357ABD']
                }
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
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* SUCCESS MODAL */}
      <Modal transparent visible={successModal} animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: modalFadeAnim,
                transform: [{scale: modalScaleAnim}],
              },
            ]}>
            <View style={styles.successIconWrapper}>
              <LinearGradient
                colors={['#4CAF50', '#45A049']}
                style={styles.successIconGradient}>
                <Icon name="checkmark" size={60} color={COLORS.white} />
              </LinearGradient>
            </View>

            <Text style={styles.successTitle}>Appointment Booked! 🎉</Text>
            <Text style={styles.successSubtitle}>
              Your appointment has been confirmed successfully. You will receive
              a confirmation shortly.
            </Text>

            <View style={styles.successDetails}>
              <View style={styles.successDetailItem}>
                <Icon
                  name="calendar-outline"
                  size={18}
                  color={COLORS.DODGERBLUE}
                />
                <Text style={styles.successDetailText}>{textShowDate}</Text>
              </View>
              {labName && (
                <View style={styles.successDetailItem}>
                  <Icon
                    name="business-outline"
                    size={18}
                    color={COLORS.DODGERBLUE}
                  />
                  <Text style={styles.successDetailText}>{labName}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity onPress={closeModal} activeOpacity={0.8}>
              <LinearGradient
                colors={['#4A90D9', '#357ABD']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.modalButton}>
                <Text style={styles.modalButtonText}>View Appointments</Text>
                <Icon name="arrow-forward" size={18} color={COLORS.white} />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* DATE PICKER */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        minimumDate={new Date()}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: verticalScale(40),
  },
  animatedContainer: {
    flex: 1,
  },
  section: {
    paddingHorizontal: scale(16),
    marginTop: verticalScale(16),
  },
  heroSection: {
    marginHorizontal: scale(16),
    marginTop: verticalScale(16),
    borderRadius: moderateScale(24),
    padding: scale(24),
    shadowColor: '#4A90D9',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  heroContent: {
    alignItems: 'center',
  },
  iconCircle: {
    width: scale(60),
    height: scale(60),
    borderRadius: moderateScale(30),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroTitle: {
    fontSize: moderateScale(22),
    fontFamily: Fonts.Bold,
    color: COLORS.white,
    marginBottom: verticalScale(4),
  },
  heroSubtitle: {
    fontSize: moderateScale(13),
    fontFamily: Fonts.Regular,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    lineHeight: moderateScale(20),
  },

  // Step Indicator
  stepContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(40),
    marginTop: verticalScale(20),
    marginBottom: verticalScale(4),
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: scale(34),
    height: scale(34),
    borderRadius: moderateScale(17),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  stepActive: {
    backgroundColor: COLORS.DODGERBLUE,
    borderColor: COLORS.DODGERBLUE,
  },
  stepInactive: {
    backgroundColor: COLORS.white,
    borderColor: '#E0E4EC',
  },
  stepNumber: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Bold,
    color: COLORS.white,
  },
  stepLine: {
    width: scale(40),
    height: 2,
    marginHorizontal: scale(4),
  },
  stepLineActive: {
    backgroundColor: COLORS.DODGERBLUE,
  },
  stepLineInactive: {
    backgroundColor: '#E0E4EC',
  },

  labCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(18),
    padding: scale(16),
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F4F8',
  },
  labIconWrapper: {
    width: scale(50),
    height: scale(50),
    borderRadius: moderateScale(14),
    backgroundColor: COLORS.DODGERBLUE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(14),
    shadowColor: COLORS.DODGERBLUE,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  labInfo: {
    flex: 1,
  },
  labLabel: {
    fontSize: moderateScale(11),
    fontFamily: Fonts.Regular,
    color: COLORS.silver,
    marginBottom: verticalScale(2),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labName: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Bold,
    color: COLORS.black,
  },
  labAddress: {
    fontSize: moderateScale(12),
    fontFamily: Fonts.Regular,
    color: COLORS.silver,
    marginTop: verticalScale(2),
  },

  testsCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(18),
    padding: scale(16),
    marginTop: verticalScale(10),
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F4F8',
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
    backgroundColor: '#E8F0FE',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(7),
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
    borderRadius: moderateScale(22),
    padding: scale(20),
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F0F4F8',
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontFamily: Fonts.Bold,
    color: COLORS.black,
    marginBottom: verticalScale(18),
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
    color: '#2C3E50',
    marginBottom: verticalScale(6),
    marginTop: verticalScale(2),
  },
  fieldGroup: {
    marginBottom: verticalScale(4),
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: verticalScale(52),
    borderWidth: 1.5,
    borderColor: '#E8ECF4',
    backgroundColor: '#F8FAFE',
    borderRadius: moderateScale(14),
    paddingHorizontal: scale(14),
    gap: scale(10),
  },
  inputError: {
    borderColor: '#E74C3C',
    borderWidth: 2,
  },
  dateText: {
    flex: 1,
    fontSize: moderateScale(14),
    fontFamily: Fonts.Medium,
    color: '#1A2B4A',
  },
  placeholderText: {
    color: '#B0B8C4',
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
    borderColor: '#E8ECF4',
    backgroundColor: '#F8FAFE',
    borderRadius: moderateScale(14),
    paddingHorizontal: scale(14),
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
    color: '#1A2B4A',
  },
  errorText: {
    fontSize: moderateScale(11),
    fontFamily: Fonts.Regular,
    color: '#E74C3C',
    marginTop: verticalScale(4),
    marginLeft: scale(4),
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0FE',
    padding: scale(14),
    borderRadius: moderateScale(16),
    marginTop: verticalScale(8),
    marginBottom: verticalScale(20),
    gap: scale(12),
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 217, 0.15)',
  },
  securityIconWrapper: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(12),
    backgroundColor: 'rgba(74, 144, 217, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
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
    shadowColor: '#4A90D9',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    width: '80%',
    alignSelf: 'center',
    marginTop: verticalScale(10),
  },
  submitButtonText: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Bold,
    color: COLORS.white,
  },

  // Modal Styles
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
    borderRadius: moderateScale(28),
    padding: scale(28),
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },
  successIconWrapper: {
    marginBottom: verticalScale(16),
  },
  successIconGradient: {
    width: scale(80),
    height: scale(80),
    borderRadius: moderateScale(40),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  successTitle: {
    fontSize: moderateScale(22),
    fontFamily: Fonts.Bold,
    color: '#1A2B4A',
    marginBottom: verticalScale(6),
  },
  successSubtitle: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Regular,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(20),
  },
  successDetails: {
    flexDirection: 'row',
    gap: scale(16),
    marginBottom: verticalScale(24),
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(12),
    backgroundColor: '#F8FAFE',
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: '#E8ECF4',
  },
  successDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  successDetailText: {
    fontSize: moderateScale(13),
    fontFamily: Fonts.Medium,
    color: '#1A2B4A',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: verticalScale(52),
    borderRadius: moderateScale(16),
    gap: scale(8),
    shadowColor: '#4A90D9',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  modalButtonText: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Bold,
    color: COLORS.white,
  },
});
