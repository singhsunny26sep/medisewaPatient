import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  StatusBar,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import StepIndicator from 'react-native-step-indicator';
import {Instance} from '../../api/Instance';
import {COLORS} from '../../Theme/Colors';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';

const statusLabels = {
  Pending: 0,
  'In Progress': 1,
  'Interact with Client': 2,
  'Collected Sample': 3,
  Completed: 4,
  Closed: 5,
};
const labels = Object.keys(statusLabels);

const customStyles = {
  stepIndicatorSize: moderateScale(35),
  currentStepIndicatorSize: moderateScale(30),
  separatorStrokeWidth: moderateScale(2),
  currentStepStrokeWidth: moderateScale(2),
  stepStrokeCurrentColor: COLORS.gold,
  stepStrokeWidth: moderateScale(2),
  stepStrokeFinishedColor: COLORS.gold,
  stepStrokeUnFinishedColor: COLORS.ARSENIC,
  separatorFinishedColor: COLORS.gold,
  separatorUnFinishedColor: COLORS.ARSENIC,
  stepIndicatorFinishedColor: COLORS.gold,
  stepIndicatorUnFinishedColor: COLORS.white,
  stepIndicatorCurrentColor: COLORS.gold,
  stepIndicatorLabelFontSize: moderateScale(12),
  currentStepIndicatorLabelFontSize: moderateScale(13),
  stepIndicatorLabelCurrentColor: COLORS.white,
  stepIndicatorLabelFinishedColor: COLORS.white,
  stepIndicatorLabelUnFinishedColor: COLORS.ARSENIC,
  labelColor: COLORS.ARSENIC,
  labelSize: moderateScale(12),
  currentStepLabelColor: COLORS.DODGERBLUE,
};

export default function UserAppointments({navigation}) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const response = await Instance.get('/get-user-appointment', {
            headers: {
              Authorization: token,
            },
          });
          const transformedAppointments = response.data.map(appointment => ({
            ...appointment,
            statusIndex: statusLabels[appointment.labs.tests[0].status],
          }));
          setAppointments(transformedAppointments);
        } else {
          console.error('No token found');
        }
      } catch (error) {
        console.error(
          'Error fetching appointments:',
          error.response ? error.response.status : error.message,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const renderStepIndicator = params => {
    const statusIcons = [
      'time-outline',
      'construct-outline',
      'people-outline',
      'flask-outline',
      'checkmark-done-outline',
      'checkmark-circle-outline',
    ];
    const icon = statusIcons[params.position];

    return (
      <Icon
        name={icon}
        size={moderateScale(20)}
        color={
          params.stepStatus === 'finished' ? COLORS.DODGERBLUE : COLORS.ARSENIC
        }
      />
    );
  };

  const renderItem = ({item}) => (
    <View style={styles.appointmentContainer}>
      <Text style={styles.appointmentType}>{item.type}</Text>
      <View style={styles.TxtView}>
        <Text style={styles.label}>Age:</Text>
        <Text style={styles.value}>{item.age}</Text>
      </View>
      <View style={styles.TxtView}>
        <Text style={styles.label}>Gender:</Text>
        <Text style={styles.value}>{item.gender}</Text>
      </View>
      <View style={styles.TxtView}>
        <Text style={styles.label}>Problem:</Text>
        <Text style={styles.value}>{item.problem}</Text>
      </View>

      <View style={styles.stepIndicatorContainer}>
        <View style={styles.TxtView}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>{item.labs.tests[0].status}</Text>
        </View>
        <View style={styles.StepIndicatorView}>
          <StepIndicator
            customStyles={customStyles}
            currentPosition={item.statusIndex}
            labels={labels}
            stepCount={labels.length}
            renderStepIndicator={renderStepIndicator}
          />
        </View>
      </View>

      {item.labs.tests.map(testItem => (
        <View key={testItem._id} style={styles.testContainer}>
          <Image
            source={{uri: testItem.test.labCategory.image}}
            style={styles.testImage}
          />
          <View style={styles.testInfo}>
            <Text style={styles.labInfoTitle}>Lab & Test Information</Text>
            <View style={styles.TxtView}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{item.labs.lab.name}</Text>
            </View>
            <View style={styles.TxtView}>
              <Text style={styles.label}>Contact:</Text>
              <Text style={styles.value}>{item.labs.lab.contactNumber}</Text>
            </View>
            <View style={styles.TxtView}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{item.labs.lab.email}</Text>
            </View>
            <View style={styles.TxtView}>
              <Text style={styles.label}>Test:</Text>
              <Text style={styles.value}>{testItem.test.description}</Text>
            </View>
            <View style={styles.TxtView}>
              <Text style={styles.label}>Category:</Text>
              <Text style={styles.value}>{testItem.test.labCategory.name}</Text>
            </View>
            <View style={styles.TxtView}>
              <Text style={styles.label}>Price:</Text>
              <Text style={styles.value}>₹{testItem.test.price}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const filteredAppointments = appointments.filter(item =>
    item.labs.lab.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <View style={styles.main}>
      <StatusBar backgroundColor={COLORS.DODGERBLUE} barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back-circle-sharp" size={35} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.TittleView}>
          <Text style={styles.TittleText}>Appointment's</Text>
        </View>
      </View>
      <View style={styles.searchHeader}>
        <View style={styles.searchTouch}>
          <TextInput
            placeholder="Search..."
            placeholderTextColor={COLORS.grey}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={text => setSearchQuery(text)}
          />
          <Ionicons
            name="search-circle-sharp"
            size={40}
            color={COLORS.DODGERBLUE}
          />
        </View>
      </View>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.DODGERBLUE} />
        </View>
      ) : filteredAppointments.length > 0 ? (
        <FlatList
          data={filteredAppointments}
          keyExtractor={(item, index) =>
            item._id ? item._id.toString() : index.toString()
          }
          renderItem={renderItem}
        />
      ) : (
        <View style={styles.centered}>
          <Image
            source={require('../../assets/no-data.jpg')}
            style={styles.NoDataImage}
          />
          <Text style={styles.errorText}>No Appointment available</Text>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(8),
    backgroundColor: COLORS.DODGERBLUE,
  },
  TittleView: {
    flex: 1,
  },
  TittleText: {
    fontSize: moderateScale(18),
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  searchHeader: {
    height: verticalScale(70),
    backgroundColor: COLORS.DODGERBLUE,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: moderateScale(10),
    borderBottomRightRadius: moderateScale(10),
  },
  searchTouch: {
    flexDirection: 'row',
    width: '90%',
    backgroundColor: COLORS.white,
    borderColor: COLORS.AntiFlashWhite,
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(10),
    elevation: 3,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: verticalScale(40),
    color: COLORS.black,
    fontSize: moderateScale(16),
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentContainer: {
    backgroundColor: '#C9B8FF',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(10),
    marginVertical: verticalScale(10),
    marginHorizontal: scale(12),
    elevation: 3,
  },
  appointmentType: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: COLORS.midnightblue,
    marginBottom: verticalScale(5),
  },
  TxtView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(5),
  },
  StepIndicatorView: {
    marginTop: verticalScale(10),
  },
  label: {
    fontSize: moderateScale(16),
    color: COLORS.black,
    fontWeight: '500',
    width: scale(90),
  },
  value: {
    color: COLORS.midnightblue,
    fontWeight: '700',
    fontSize: moderateScale(16),
    flex: 1,
  },
  stepIndicatorContainer: {
    marginTop: verticalScale(10),
  },
  labInfoTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: COLORS.ARSENIC,
  },
  testContainer: {
    marginTop: verticalScale(10),
    backgroundColor: COLORS.LAVENDER,
    borderRadius: moderateScale(8),
    overflow: 'hidden',
    elevation: 2,
  },
  testImage: {
    height: verticalScale(100),
    width: '100%',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  testInfo: {
    padding: scale(10),
  },
  NoDataImage: {
    resizeMode: 'contain',
    height: verticalScale(150),
    width: scale(180),
  },
  errorText: {
    color:COLORS.red,
    textAlign: 'center',
    fontSize: moderateScale(16),
  },
});
