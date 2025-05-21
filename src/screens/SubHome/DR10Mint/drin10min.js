import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import {moderateScale, scale, verticalScale} from '../../../utils/Scaling';
import {COLORS} from '../../../Theme/Colors';
import Icon from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomRadioButton from '../../../component/CustomRadioButton';
import {Instance} from '../../../api/Instance';
import {StatusBar} from 'react-native';

export default function Dr10({navigation}) {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedButton, setSelectedButton] = useState(null);
  const [selectedHealthProblem, setSelectedHealthProblem] = useState(null);

  const handleSelectHealthProblem = problem => {
    setSelectedHealthProblem(problem);
  };

  const [mutualData, setMutualData] = useState({
    type: '',
    age: '',
    gender: '',
    mobile: '',
    problem: '',
    problemdescription: '',
  });

  const handleMutualPost = async () => {
    try {
      const res = await Instance.post('/user/appointment', mutualData);
      if (res.data) {
        console.log('Information submitted');
        setModalVisible(true);
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to submit information. Please try again.');
    }
  };

  const genderOptions = [
    {label: 'Male', value: 'male'},
    {label: 'Female', value: 'female'},
  ];

  const buttons = [
    'Self',
    'Mother',
    'Brother',
    'Sister',
    'Father',
    'Daughter',
    'Husband',
    'Son',
    'Wife',
    'Other',
    'Partner',
  ];

  const handleButtonPress = button => {
    console.log(`Button pressed: ${button}`);
    setSelectedButton(button);
    setMutualData(prevState => ({...prevState, type: button}));
  };

  const handleModalConfirm = () => {
    setModalVisible(false);
    console.log('Consultation confirmed');
  };
  const help = () => {
    setModalVisible(true);
  };
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.DODGERBLUE} barStyle="light-content" />
      <View style={styles.headerView}>
        <View style={styles.headerSub}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Dr. in 10 mins.</Text>
        </View>
        <ScrollView
          horizontal
          contentContainerStyle={styles.header}
          showsHorizontalScrollIndicator={false}>
          {buttons.map((button, index) => (
            <TouchableOpacity
              key={index}
              style={styles.button}
              onPress={() => handleButtonPress(button)}>
              <Text style={styles.buttonText}>{button}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <View style={styles.inputView}>
              <Text style={styles.label}>Age:</Text>
              <View style={styles.input}>
                <TextInput
                  style={styles.inputtxt}
                  keyboardType="numeric"
                  value={mutualData.age}
                  onChangeText={age =>
                    setMutualData(prevState => ({...prevState, age}))
                  }
                />
                <Text style={styles.label2}> Years</Text>
              </View>
            </View>
            <View style={styles.radioGroupView}>
              <Text style={styles.label3}>Gender:</Text>
              <CustomRadioButton
                options={genderOptions}
                selectedValue={mutualData.gender}
                onValueChange={gender =>
                  setMutualData(prevState => ({...prevState, gender}))
                }
              />
            </View>
          </View>
          <View style={styles.FeedBackHead}>
            <Text style={styles.FeedBackHeadTxt}>
              Doctor will call you on this number
            </Text>
          </View>
          <View style={styles.inputContainer}>
            <View style={styles.iconInputView}>
              <Icon name="call" size={24} color={COLORS.DODGERBLUE} />
              <TextInput
                style={styles.iconInputText}
                keyboardType="phone-pad"
                value={mutualData.mobile}
                onChangeText={mobile =>
                  setMutualData(prevState => ({...prevState, mobile}))
                }
                placeholder="Enter mobile number"
              />
            </View>
          </View>
          <View style={styles.FeedBackHead}>
            <Text style={styles.FeedBackHeadTxt}>Name</Text>
          </View>
          <View style={styles.inputContainer}>
            <View style={styles.iconInputView}>
              <AntDesign name="user" size={24} color={COLORS.DODGERBLUE} />
              <TextInput
                style={styles.iconInputText}
                keyboardType="phone-pad"
                value={mutualData.mobile}
                onChangeText={mobile =>
                  setMutualData(prevState => ({...prevState, mobile}))
                }
                placeholder="Enter Name"
              />
            </View>
          </View>
          <View style={styles.FeedBackHead}>
            <Text style={styles.FeedBackHeadTxt}>Selected heath problem</Text>
          </View>
          <View style={styles.inputContainer2}>
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
              <View style={styles.SelectederrowView}>
                <Icon
                  name="arrow-forward"
                  size={24}
                  color={COLORS.DODGERBLUE}
                />
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.FeedBackHead}>
            <Text style={styles.FeedBackHeadTxt3}>
              Tell Us more about the symptoms ?
            </Text>
            <Text style={styles.FeedBackHeadTxt2}>
              This will help us to find the right Doctor for you
            </Text>
          </View>
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.FeedBackInputView}>
              <TextInput
                style={styles.FeedBackInputText}
                value={mutualData.problemdescription}
                onChangeText={problemdescription =>
                  setMutualData(prevState => ({
                    ...prevState,
                    problemdescription,
                  }))
                }
                placeholder="Enter feedback"
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.ButtonFlex}>
          <View style={styles.shieldView}>
            <MaterialCommunityIcons
              name="shield-check"
              size={16}
              color={COLORS.DODGERBLUE}
            />
            <Text style={styles.shieldViewTxt}>
              Message to Doctors are 100% Private and Secure
            </Text>
          </View>
          <TouchableOpacity
            style={styles.buttonMAin}
            onPress={handleMutualPost}>
            <Text style={styles.buttonMAinTxt}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Consultation Options</Text>
            <TouchableOpacity style={styles.modalOption}>
              <Ionicons name="videocam" size={24} color={COLORS.DODGERBLUE} />
              <Text style={styles.modalOptionText}>Video Consult</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption}>
              <Ionicons name="call-sharp" size={24} color={COLORS.DODGERBLUE} />
              <Text style={styles.modalOptionText}>Phone Consult</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalConfirmButton}
              onPress={handleModalConfirm}>
              <Text style={styles.modalConfirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerView: {
    width: '100%',
    paddingVertical: verticalScale(5),
    backgroundColor: COLORS.DODGERBLUE,
    borderBottomLeftRadius: moderateScale(10),
    borderBottomRightRadius: moderateScale(10),
  },
  headerSub: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(10),
    paddingBottom: verticalScale(5),
  },
  headerText: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: COLORS.white,
    marginLeft: scale(25),
  },
  header: {
    flexDirection: 'row',
    paddingVertical: verticalScale(10),
    backgroundColor: COLORS.DODGERBLUE,
    paddingHorizontal: scale(10),
  },
  button: {
    marginRight: scale(10),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(20),
    backgroundColor: COLORS.white,
    borderRadius: 5,
  },
  buttonText: {
    color: COLORS.DODGERBLUE,
    fontSize: moderateScale(16),
    fontWeight: 'bold',
  },
  content: {
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: scale(10),
    marginTop: verticalScale(5),
  },
  inputContainer2: {
    flexDirection: 'row',
    paddingHorizontal: scale(10),
    marginTop: verticalScale(10),
  },
  inputView: {
    flex: 1,
    marginRight: scale(15),
  },
  radioGroupView: {
    flex: 1,
  },
  label: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    marginBottom: verticalScale(5),
    paddingHorizontal: scale(5),
  },
  label2: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
  },
  label3: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    paddingVertical: verticalScale(5),
    paddingBottom: verticalScale(15),
  },
  input: {
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(10),
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: COLORS.AshGray,
    backgroundColor: COLORS.white,
    elevation: 2,
    justifyContent: 'space-around',
  },
  inputtxt: {
    fontSize: moderateScale(16),
  },
  iconInputView: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(10),
    height: verticalScale(50),
    flex: 1,
    borderColor: COLORS.AshGray,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  iconInputText: {
    fontSize: moderateScale(16),
    marginLeft: scale(10),
  },
  searchInputView: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(10),
    height: verticalScale(50),
    flex: 1,
    borderColor: COLORS.AshGray,
    backgroundColor: COLORS.white,
    elevation: 2,
    justifyContent: 'space-between',
  },
  problemContainer: {
    paddingHorizontal: scale(15),
  },
  searchInputText: {
    fontSize: moderateScale(16),
    marginLeft: scale(10),
    flex: 1,
  },
  FeedBackHead: {
    width: '100%',
    justifyContent: 'center',
  },
  FeedBackHeadTxt: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.ARSENIC,
    marginHorizontal: scale(15),
    marginTop: verticalScale(15),
  },
  FeedBackHeadTxt3: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.ARSENIC,
    marginHorizontal: scale(15),
    marginTop: verticalScale(15),
  },
  FeedBackHeadTxt2: {
    fontSize: moderateScale(14),
    fontWeight: '200',
    color: COLORS.ARSENIC,
    marginHorizontal: scale(15),
  },
  FeedBackInputView: {
    flex: 1,
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(10),
    height: verticalScale(120),
    marginTop: verticalScale(5),
    borderColor: COLORS.AshGray,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  FeedBackInputText: {
    fontSize: moderateScale(16),
  },
  ButtonFlex: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginHorizontal: scale(15),
    flex: 1,
    paddingBottom: verticalScale(10),
  },
  shieldView: {
    flexDirection: 'row',
    marginTop: verticalScale(30),
  },
  shieldViewTxt: {
    color: COLORS.DODGERBLUE,
    fontSize: moderateScale(11),
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
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    padding: scale(20),
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    marginBottom: verticalScale(10),
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: scale(10),
    height: verticalScale(50),
    borderColor: COLORS.AshGray,
    backgroundColor: COLORS.white,
    elevation: 2,
    marginVertical: verticalScale(5),
  },
  modalOptionText: {
    fontSize: moderateScale(16),
    paddingHorizontal: scale(10),
    color: COLORS.DODGERBLUE,
    fontWeight: 'bold',
  },
  modalConfirmButton: {
    backgroundColor: COLORS.DODGERBLUE,
    paddingVertical: verticalScale(10),
    marginTop: verticalScale(20),
    borderRadius: moderateScale(10),
  },
  modalConfirmButtonText: {
    color: COLORS.white,
    fontSize: moderateScale(16),
    textAlign: 'center',
    fontWeight: 'bold',
  },
  noProblemText: {
    paddingHorizontal: scale(10),
  },
});
