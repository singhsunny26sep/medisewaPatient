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

export default function BookAppointment({route, navigation}) {
  const {
    labId,
    selectedTestIds,
    labName,
    selectedTestsname,
    locationAddress,
  } = route.params;

  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const [date, setDate] = useState('');
  const [textShowDate, setTextShowDate] = useState('');

  const [selectedHealthProblem, setSelectedHealthProblem] =
    useState(null);

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
    {label: 'Home', value: 'home'},
    {label: 'Lab', value: 'lab'},
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
        Alert.alert(
          'Validation',
          'Please select health problem',
        );
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

        problemDescription:
          formData.problemDescription,

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

      await Instance.post(
        'api/v1/appointments',
        appointmentData,
        {
          headers: {
            authorization: userToken,
          },
        },
      );

      setSuccessModal(true);
    } catch (error) {
      console.log(error);

      Alert.alert(
        'Error',
        'Something went wrong. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setSuccessModal(false);

    navigation.navigate('UserAppointments');
  };

  return (
    <Container
      backgroundColor={'#F5F7FB'}
      statusBarStyle={'dark-content'}>
      <CustomHeader
        title="Book Appointment"
        navigation={navigation}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: verticalScale(30),
        }}
        style={styles.container}>
        {/* TOP CARD */}

        <View style={styles.topCard}>
          <View style={styles.row}>
            <Icon
              name="business-outline"
              size={20}
              color="#2563EB"
            />

            <Text style={styles.labTitle}>
              {' '}
              {labName}
            </Text>
          </View>

          <Text style={styles.selectedText}>
            Selected Tests
          </Text>

          <View style={styles.badgeWrapper}>
            {selectedTestsname.map((item, index) => (
              <View key={index} style={styles.badge}>
                <Text style={styles.badgeText}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* FORM */}

        <View style={styles.formCard}>
          <CustomTextInput
            label="Age"
            placeholder="Enter age"
            keyboardType="numeric"
            maxLength={2}
            value={formData.age}
            onChangeText={value =>
              handleInputChange('age', value)
            }
          />

          {/* DATE */}

          <Text style={styles.label}>
            Appointment Date
          </Text>

          <TouchableOpacity
            style={styles.dateBox}
            onPress={showDatePicker}>
            <Text style={styles.dateText}>
              {textShowDate ||
                'Select appointment date'}
            </Text>

            <Icon
              name="calendar-outline"
              size={22}
              color="#2563EB"
            />
          </TouchableOpacity>

          {/* GENDER */}

          <View style={styles.radioSection}>
            <Text style={styles.label}>Gender</Text>

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

          {/* VISIT TYPE */}

          <View style={styles.radioSection}>
            <Text style={styles.label}>
              Visit Type
            </Text>

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
            onChangeText={value =>
              handleInputChange('mobile', value)
            }
          />

          {/* HEALTH PROBLEM */}

          <Text style={styles.label}>
            Health Problem
          </Text>

          <TouchableOpacity
            style={styles.problemBox}
            onPress={() =>
              navigation.navigate(
                'SelectHealthP',
                {
                  onSelectProblem:
                    setSelectedHealthProblem,
                },
              )
            }>
            <Text style={styles.problemText}>
              {selectedHealthProblem?.name ||
                'Select health problem'}
            </Text>

            <Icon
              name="chevron-forward"
              size={22}
              color="#2563EB"
            />
          </TouchableOpacity>

          <CustomTextInput
            label="Pincode"
            placeholder="Enter pincode"
            keyboardType="number-pad"
            maxLength={6}
            value={formData.pincode}
            onChangeText={value =>
              handleInputChange('pincode', value)
            }
          />

          <CustomTextInput
            label="Address"
            placeholder="Enter address"
            value={formData.address}
            onChangeText={value =>
              handleInputChange('address', value)
            }
          />

          <CustomTextInput
            label="City"
            placeholder="Enter city"
            value={formData.city}
            onChangeText={value =>
              handleInputChange('city', value)
            }
          />

          <CustomTextInput
            label="State"
            placeholder="Enter state"
            value={formData.state}
            onChangeText={value =>
              handleInputChange('state', value)
            }
          />

          <CustomTextInput
            label="Tell us more about symptoms"
            placeholder="Write symptoms..."
            value={formData.problemDescription}
            onChangeText={value =>
              handleInputChange(
                'problemDescription',
                value,
              )
            }
          />

          {/* SECURITY BOX */}

          <View style={styles.securityBox}>
            <MaterialCommunityIcons
              name="shield-check"
              size={18}
              color="#2563EB"
            />

            <Text style={styles.securityText}>
              Your appointment is secure &
              private
            </Text>
          </View>

          {/* BUTTON */}

          <TouchableOpacity
            disabled={loading}
            onPress={handleSubmit}>
            <LinearGradient
              colors={['#2563EB', '#3B82F6']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.button}>
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>
                  Book Appointment
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* SUCCESS MODAL */}

      <Modal transparent visible={successModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Image
              source={require('../../assets/done-icon.jpg')}
              style={styles.successImage}
            />

            <Text style={styles.successTitle}>
              Appointment Booked
            </Text>

            <Text style={styles.successSubTitle}>
              Your appointment has been booked
              successfully
            </Text>

            <TouchableOpacity
              onPress={closeModal}>
              <LinearGradient
                colors={['#2563EB', '#3B82F6']}
                style={styles.modalButton}>
                <Text
                  style={styles.modalButtonText}>
                  Continue
                </Text>
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
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  topCard: {
    backgroundColor: '#FFFFFF',
    marginTop: 18,
    borderRadius: 22,
    padding: 18,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 6,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  labTitle: {
    fontSize: 17,
    color: '#111827',
    fontFamily: Fonts.Bold,
    marginLeft: 6,
  },

  selectedText: {
    fontSize: 15,
    color: '#111827',
    fontFamily: Fonts.Bold,
    marginTop: 18,
  },

  badgeWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },

  badge: {
    backgroundColor: '#E8F0FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 25,
    marginRight: 10,
    marginBottom: 10,
  },

  badgeText: {
    color: '#2563EB',
    fontFamily: Fonts.Medium,
    fontSize: 13,
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginTop: 18,
    marginBottom: 30,

    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 6,
  },

  label: {
    fontSize: 15,
    color: '#111827',
    fontFamily: Fonts.Bold,
    marginBottom: 10,
  },

  dateBox: {
    height: 54,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderRadius: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  dateText: {
    color: '#111827',
    fontFamily: Fonts.Medium,
    fontSize: 14,
  },

  radioSection: {
    marginBottom: 18,
  },

  problemBox: {
    height: 54,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderRadius: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  problemText: {
    color: '#111827',
    fontFamily: Fonts.Medium,
    fontSize: 14,
  },

  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 14,
    marginTop: 10,
  },

  securityText: {
    color: '#2563EB',
    marginLeft: 8,
    fontSize: 13,
    fontFamily: Fonts.Medium,
  },

  button: {
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.Bold,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
  },

  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 24,
    alignItems: 'center',
  },

  successImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },

  successTitle: {
    fontSize: 22,
    color: '#111827',
    fontFamily: Fonts.Bold,
    marginTop: 12,
  },

  successSubTitle: {
    color: '#6B7280',
    fontFamily: Fonts.Medium,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
  },

  modalButton: {
    width: 220,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },

  modalButtonText: {
    color: '#FFFFFF',
    fontFamily: Fonts.Bold,
    fontSize: 15,
  },
});