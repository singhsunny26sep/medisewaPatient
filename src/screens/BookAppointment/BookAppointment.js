import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  ActivityIndicator,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {COLORS} from '../../Theme/Colors';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
import {Instance} from '../../api/Instance';
import CustomRadioButton from '../../component/CustomRadioButton';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {StatusBar} from 'react-native';
import Base64 from 'react-native-base64';
import sha256 from 'sha256';
// import PhonePePaymentSDK from 'react-native-phonepe-pg';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {Container} from '../../component/Container/Container';
import CustomHeader from '../../component/header/CustomHeader';
import CustomTextInput from '../../component/texinput/CustomTextInput';
import {Fonts} from '../../Theme/Fonts';

export default function BookAppointment({route, navigation}) {
  const environment = 'SANDBOX';
  const appId = null;
  const enableLogging = true;
  // const amount = 400;

  const {labId, selectedTestIds, labName, selectedTestsname, locationAddress} =
    route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setpaymentSuccess] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [date, setDate] = useState('');
  const [textShowDate, setTextShowDate] = useState('');

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

  const [selectedHealthProblem, setSelectedHealthProblem] = useState(null);
  // console.log('tour test id', selectedTestIds, 'lovccc', locationAddress);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = date => {
    const dt = new Date(date);
    const sdt = dt.toISOString();
    const TextDate = dt.toISOString().split('T');
    const TextDateOne = TextDate[0].split('-');
    setTextShowDate(`${TextDateOne[2]}/${TextDateOne[1]}/${TextDateOne[0]}`);
    setDate(sdt);

    hideDatePicker();
  };

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}>
          <Icon name="arrow-back" size={24} color={COLORS.ARSENIC} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const generateTransactionIds = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    const merchantPrefix = 'T';
    return `${merchantPrefix}${timestamp}${random}`;
  };

  const handlePayment = async (
    merchantid,
    generateTransactionId,
    genrateMerchantUserId,
    amount,
    callbackUrl,
    paymentInstrumentType,
    saltKey,
    saltIndex,
  ) => {
    console.log(
      merchantid,
      generateTransactionId,
      genrateMerchantUserId,
      amount,
      callbackUrl,
      paymentInstrumentType,
      saltKey,
      saltIndex,
    );

    /* PhonePePaymentSDK.init(environment, merchantid, appId, enableLogging)
      .then(result => {
        // if (!result) {
        //   Alert.alert('Error', 'Failed to initialize PhonePe SDK.');
        // }
        console.log(result, 'iniii');
        const requestBody = {
          merchantId: merchantid,
          // PGTESTPAYUAT86
          merchantTransactionId: `MID${generateTransactionId}`,
          merchantUserId: '',
          amount: amount,
          mobileNumber: null,
          callbackUrl: '',
          paymentInstrument: {
            type: paymentInstrumentType,
          },
        };
        const salt_key = saltKey;
        const salt_index = saltIndex;
        const payload = JSON.stringify(requestBody);
        const payload_main = Base64.encode(payload);
        const string = payload_main + '/pg/v1/pay' + salt_key;

        const checksum = sha256(string) + '###' + salt_index;
        // const checksum = checkSum
        PhonePePaymentSDK.startTransaction(payload_main, checksum, null, null)
          .then(async resp => {
            console.log(resp, 'startt');
            const userToken = await AsyncStorage.getItem('userToken');
            console.log('User Token =', userToken);
            if (!userToken) {
              Alert.alert('Error', 'User token not found. Please login again.');
              setLoading(false);
              return;
            }
            const payload = {
              merchantId: merchantid,
              merchantTransactionId: generateTransactionId,
              status: resp?.status,
            };
            if (resp?.status == 'SUCCESS') {
              // Alert.alert('Payment Successfully')
              try {
                // console.log('Sending data:', JSON.stringify(appointmentData, null, 2));

                const response = await Instance.post(
                  '/api/payment-callback',
                  payload,
                  {
                    headers: {
                      authorization: userToken,
                    },
                  },
                );

                console.log(response?.data, 'appoinment api callback:');
                if (response?.data?.status == 'PAYMENT_SUCCESS') {
                  setpaymentSuccess(true);
                  setLoading(false);
                  // Alert.alert('Payment Successfully')
                } else {
                  Alert.alert('Payment Failed');
                }
              } catch (error) {
                console.error('Error details:', error);
                setLoading(false);

                if (error.response) {
                  console.error('Server Error:', error.response.data);
                  const message =
                    error.response.data?.message ||
                    'An unexpected server error occurred';

                  Alert.alert(
                    'Server Error',
                    `Status: ${error.response.status}, Message: ${message}`,
                  );
                } else if (error.request) {
                  console.error('Network Error:', error.request);
                  Alert.alert(
                    'Network Error',
                    'No response received from the server.',
                  );
                } else {
                  console.error('Error:', error.message);
                  Alert.alert('Error', `Request failed: ${error.message}`);
                }
              }
            } else if (resp?.status == 'FAILURE') {
              Alert.alert('Payment Failed');
              setLoading(false);
            }
          })
          .catch(error => {
            console.log(error);
            setLoading(false);
          });
      })
      .catch(error => {
        console.log(error);
        setLoading(false);
        Alert.alert('Error', `SDK initialization failed: ${error.message}`);
      })*/
  };

  const handleInputChange = (name, value) => {
    setFormData(prevState => ({...prevState, [name]: value}));
  };

  const handleSelectHealthProblem = problem => {
    setSelectedHealthProblem(problem);
  };

  const handleSubmit = async () => {
    setLoading(true);

    const userToken = await AsyncStorage.getItem('userToken');
    console.log('User Token =', userToken);
    if (!userToken) {
      Alert.alert('Error', 'User token not found. Please login again.');
      setLoading(false);
      return;
    }

    if (!formData.age.trim()) {
      Alert.alert('Error', 'Age is required.');
      setLoading(false);
      return;
    }

    if (!formData.gender) {
      Alert.alert('Error', 'Gender is required.');
      setLoading(false);
      return;
    }

    if (!selectedHealthProblem) {
      Alert.alert('Error', 'Please select a health problem.');
      setLoading(false);
      return;
    }

    if (!formData.problemDescription.trim()) {
      Alert.alert('Error', 'Please tell us more about the symptoms.');
      setLoading(false);
      return;
    }
    console.log(formData.mobile, 'refer buuuuu');
    const appointmentData = {
      type: 'General Checkup',
      age: Number(formData.age),
      gender: formData.gender,
      referral: formData.mobile,
      vistType: formData.visittype,
      locationAddress: locationAddress,
      problem: selectedHealthProblem
        ? selectedHealthProblem.name
        : 'No Health Problem Selected',
      healthProblem: [selectedHealthProblem._id],
      appointmentDate: date,
      problemDescription: formData.problemDescription,
      labs: {
        lab: labId,
        tests: selectedTestIds.map(testId => ({
          test: testId,
        })),
      },
      address: {
        address: formData?.address,
        city: formData?.city,
        state: formData?.state,
        pincode: formData?.pincode,
      },
    };

    try {
      // console.log('Sending data:', JSON.stringify(appointmentData, null, 2));
      const response = await Instance.post('/appointments', appointmentData, {
        headers: {
          authorization: userToken,
        },
      });

      // console.log(response.data?.phonepeDetails?.payload, 'Response appoinment api:' ,response.data?.phonepeDetails?.saltKey, response.data?.phonepeDetails?.saltIndex);

      handlePayment(
        response.data?.phonepeDetails?.payload?.merchantId,
        response.data?.phonepeDetails?.payload?.merchantTransactionId,
        response.data?.phonepeDetails?.payload?.merchantUserId,
        response.data?.phonepeDetails?.payload?.amount,
        response.data?.phonepeDetails?.payload?.callbackUrl,
        response.data?.phonepeDetails?.payload?.paymentInstrument?.type,
        response.data?.phonepeDetails?.saltKey,
        response.data?.phonepeDetails?.saltIndex,
      );
    } catch (error) {
      console.error('Error details:', error);
      setLoading(false);
      if (error.response) {
        console.error('Server Error:', error.response.data);
        const message =
          error.response.data?.message || 'An unexpected server error occurred';
        Alert.alert(
          'Server Error',
          `Status: ${error.response.status}, Message: ${message}`,
        );
      } else if (error.request) {
        console.error('Network Error:', error.request);
        Alert.alert('Network Error', 'No response received from the server.');
      } else {
        console.error('Error:', error.message);
        Alert.alert('Error', `Request failed: ${error.message}`);
      }
    }
    // finally {
    //   setLoading(false);
    // }
  };

  const genderOptions = [
    {label: 'Male', value: 'male'},
    {label: 'Female', value: 'female'},
  ];

  const visitOptions = [
    {label: 'Home', value: 'home'},
    {label: 'Lab', value: 'lab'},
  ];

  const closeModal = () => {
    setModalVisible(false);
    navigation.navigate('UserAppointments');
  };

  return (
    <Container
      statusBarStyle={'dark-content'}
      statusBarBackgroundColor={COLORS.white}
      backgroundColor={COLORS.white}>
      <CustomHeader title="Book Appointment"  navigation={navigation}/>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{marginHorizontal: scale(15)}}>
        <View style={styles.LabNameView}>
          <Text style={styles.testsTitle}>Lab: </Text>
          <Text style={styles.Mobdetails}>{labName}</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: moderateScale(4),
          }}>
          <Text style={styles.testsTitle2}>Selected Tests:</Text>
          {selectedTestsname.map((selectedTestsname, index) => (
            <Text key={index} style={styles.testItem}>
              {selectedTestsname}
            </Text>
          ))}
        </View>
        <View style={styles.formContainer}>
          <CustomTextInput
            label="Age"
            placeholder="Enter age"
            keyboardType="numeric"
            value={formData.age}
            maxLength={2}
            onChangeText={value => handleInputChange('age', value)}
          />
          <Text style={styles.label}>Appointment Date</Text>
          <TouchableOpacity onPress={showDatePicker}>
            <View
              style={{
                borderWidth: 0.8,
                borderColor: COLORS.AshGray,
                borderRadius: moderateScale(8),
                paddingHorizontal: scale(10),
                height: verticalScale(40),
                marginBottom: verticalScale(15),
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontSize: moderateScale(14),
                  fontFamily:Fonts.Medium
                }}>
                {!!textShowDate ? textShowDate : 'Select Appointment Date'}
              </Text>
            </View>
          </TouchableOpacity>
          <View style={styles.radioGroupView}>
            <Text style={styles.Genderlabel}>Gender</Text>
            <CustomRadioButton
              options={genderOptions}
              selectedValue={formData.gender}
              onValueChange={gender =>
                setFormData(prevState => ({...prevState, gender}))
              }
            />
          </View>

          <View style={styles.radioGroupView}>
            <Text style={styles.Genderlabel}>Visit Type</Text>
            <CustomRadioButton
              options={visitOptions}
              selectedValue={formData.visittype}
              onValueChange={visittype =>
                setFormData(prevState => ({...prevState, visittype}))
              }
            />
          </View>

          <CustomTextInput
            label="Referral-Mobile (optional)"
            placeholder="Enter referral mobile"
            keyboardType="phone-pad"
            value={formData.mobile}
            maxLength={10}
            onChangeText={value => handleInputChange('mobile', value)}
          />
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Health Problem</Text>
            <TouchableOpacity
              style={styles.searchInputView}
              onPress={() =>
                navigation.navigate('SelectHealthP', {
                  onSelectProblem: handleSelectHealthProblem,
                })
              }>
              {selectedHealthProblem ? (
                <View style={styles.problemContainer}>
                  <Text style={styles.problemText}>
                    {selectedHealthProblem.name}
                  </Text>
                </View>
              ) : (
                <Text style={styles.noProblemText}>
                  No health problem selected
                </Text>
              )}
              <View style={styles.selectedArrowView}>
                <Icon
                  name="arrow-forward"
                  size={24}
                  color={COLORS.DODGERBLUE}
                />
              </View>
            </TouchableOpacity>
          </View>

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
            placeholder="Enter address"
            value={formData.address}
            onChangeText={value => handleInputChange('address', value)}
          />

          <CustomTextInput
            label="City"
            placeholder="Enter city"
            value={formData.city}
            onChangeText={value => handleInputChange('city', value)}
          />

          <CustomTextInput
            label="State"
            placeholder="Enter state"
            value={formData.state}
            onChangeText={value => handleInputChange('state', value)}
          />

  
           <CustomTextInput
            label="Tell Us more about the symptoms ?"
            placeholder="Tell us about symptoms ...."
            value={formData.problemDescription}
            onChangeText={value =>
              handleInputChange('problemDescription', value)
            }
          />
       

          <View style={styles.ButtonFlex}>
            <View style={styles.shieldView}>
              <MaterialCommunityIcons
                name="shield-check"
                size={16}
                color={COLORS.DODGERBLUE}
              />
              <Text style={styles.shieldViewTxt}>
                Book Appointment are 100% Private and Secure
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.buttonMAin,
                loading && {backgroundColor: COLORS.lightGrey},
              ]}
              onPress={handleSubmit}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.buttonMAinTxt}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Success</Text>
            <Text style={styles.modalSubText}>
              Appointment booked successfully
            </Text>
            <Image
              style={styles.doneimage}
              source={require('../../assets/done-icon.jpg')}
            />
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={paymentSuccess}
        onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Payment successfully</Text>
            {/* <Text style={styles.modalSubText}>
              Payment successfully
            </Text> */}
            <Image
              style={styles.doneimage}
              source={require('../../assets/done-icon.jpg')}
            />
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  AppointmentView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: verticalScale(10),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: COLORS.DODGERBLUE,
    textAlign: 'center',
    flex: 1,
  },
  LabNameView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testsTitle: {
    fontSize: moderateScale(18),
    color: COLORS.ARSENIC,
    paddingVertical: verticalScale(10),
    fontFamily:Fonts.Medium,
  },
  testsTitle2: {
    fontSize: moderateScale(18),
    color: COLORS.ARSENIC,
    fontFamily:Fonts.Medium
  },
  testItem: {
    fontSize: moderateScale(18),
    fontFamily:Fonts.Light,
    color: COLORS.DODGERBLUE,
  },
  formContainer: {
    marginTop: verticalScale(20),
  },
  label: {
    fontSize: moderateScale(16),
    marginBottom: scale(8),
    color: COLORS.black,
    fontFamily: Fonts.Medium,
  },
  Genderlabel: {
    fontSize: moderateScale(16),
    marginBottom: verticalScale(5),
    color: COLORS.black,
    fontFamily: Fonts.Medium,
    width: scale(90),
    top:scale(4)
  },
  Mobdetails: {
    fontSize: moderateScale(18),
    fontFamily:Fonts.Light,
    color: COLORS.DODGERBLUE,
    paddingVertical: verticalScale(10),
  },

  headerButton: {
    padding: scale(10),
  },
  inputContainer: {
    marginBottom: verticalScale(15),
  },
  searchInputView: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.AshGray,
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(10),
    height: verticalScale(40),
    justifyContent: 'space-between',
  },
  problemContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  problemText: {
    fontSize: moderateScale(16),
    color: COLORS.ARSENIC,
  },
  noProblemText: {
    fontSize: moderateScale(13),
    fontFamily:Fonts.Medium,
    top:scale(2)
  },
  selectedArrowView: {
    paddingLeft: scale(10),
  },
  radioGroupView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  ButtonFlex: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginHorizontal: scale(15),
    flex: 1,
    paddingBottom: verticalScale(15),
  },
  shieldView: {
    flexDirection: 'row',
    marginTop: verticalScale(15),
  },
  shieldViewTxt: {
    color: COLORS.DODGERBLUE,
    fontSize: moderateScale(13),
    fontWeight: '500',
  },
  buttonMAin: {
    marginTop: verticalScale(10),
    backgroundColor: COLORS.DODGERBLUE,
    borderRadius: moderateScale(10),
    height: verticalScale(45),
    width: scale(320),
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonMAinTxt: {
    color: COLORS.white,
    fontSize: moderateScale(16),
    fontFamily:Fonts.Medium,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalText: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalSubText: {
    fontSize: moderateScale(15),
    marginBottom: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: COLORS.DODGERBLUE,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeButtonText: {
    color: 'white',
    fontFamily:Fonts.Medium,
    fontSize: moderateScale(15),
  },
  doneimage: {
    height: verticalScale(100),
    width: scale(150),
    overflow: 'hidden',
  },
});
