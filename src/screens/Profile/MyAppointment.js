// import React, {useState} from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
//   Image,
//   StatusBar,
//   TextInput,
//   ActivityIndicator,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import StepIndicator from 'react-native-step-indicator';
// import {COLORS} from '../../Theme/Colors';
// import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
// import {Container} from '../../component/Container/Container';
// import { Fonts } from '../../Theme/Fonts';

// const statusLabels = {
//   Pending: 0,
//   'In Progress': 1,
//   'Interact with Client': 2,
//   'Collected Sample': 3,
//   Completed: 4,
//   Closed: 5,
// };
// const labels = Object.keys(statusLabels);

// const customStyles = {
//   stepIndicatorSize: moderateScale(35),
//   currentStepIndicatorSize: moderateScale(30),
//   separatorStrokeWidth: moderateScale(2),
//   currentStepStrokeWidth: moderateScale(2),
//   stepStrokeCurrentColor: COLORS.gold,
//   stepStrokeWidth: moderateScale(2),
//   stepStrokeFinishedColor: COLORS.gold,
//   stepStrokeUnFinishedColor: COLORS.ARSENIC,
//   separatorFinishedColor: COLORS.gold,
//   separatorUnFinishedColor: COLORS.ARSENIC,
//   stepIndicatorFinishedColor: COLORS.gold,
//   stepIndicatorUnFinishedColor: COLORS.white,
//   stepIndicatorCurrentColor: COLORS.gold,
//   stepIndicatorLabelFontSize: moderateScale(12),
//   currentStepIndicatorLabelFontSize: moderateScale(13),
//   stepIndicatorLabelCurrentColor: COLORS.white,
//   stepIndicatorLabelFinishedColor: COLORS.white,
//   stepIndicatorLabelUnFinishedColor: COLORS.ARSENIC,
//   labelColor: COLORS.ARSENIC,
//   labelSize: moderateScale(12),
//   currentStepLabelColor: COLORS.DODGERBLUE,
// };

// export default function MyAppointment({navigation}) {
//   const [appointments] = useState([
//     {
//       _id: '1',
//       type: 'Blood Test',
//       age: 29,
//       gender: 'Male',
//       problem: 'Fever and Cold',
//       statusIndex: statusLabels['In Progress'],
//       labs: [
//         {
//           lab: {
//             name: 'Health Labs',
//             contactNumber: '123-456-7890',
//             email: 'contact@healthlabs.com',
//           },
//           tests: [
//             {
//               _id: 'test1',
//               test: {
//                 description: 'Complete Blood Count',
//                 labCategory: {
//                   name: 'Hematology',
//                   image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSyhXxuvSzdgOsuCj_ZKVahkth7QzORkX3CQ&s',
//                 },
//                 price: 500,
//               },
//             },
//           ],
//         },
//       ],
//     },
//     {
//       _id: '2',
//       type: 'X-Ray',
//       age: 35,
//       gender: 'Female',
//       problem: 'Bone Pain',
//       statusIndex: statusLabels['Completed'],
//       labs: [
//         {
//           lab: {
//             name: 'X-Ray Center',
//             contactNumber: '987-654-3210',
//             email: 'info@xraycenter.com',
//           },
//           tests: [
//             {
//               _id: 'test2',
//               test: {
//                 description: 'Full Body X-Ray',
//                 labCategory: {
//                   name: 'Radiology',
//                   image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSyhXxuvSzdgOsuCj_ZKVahkth7QzORkX3CQ&s',
//                 },
//                 price: 1200,
//               },
//             },
//           ],
//         },
//       ],
//     },
//   ]);
//   const [loading] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');

//   const renderStepIndicator = params => {
//     const statusIcons = [
//       'time-outline',
//       'construct-outline',
//       'people-outline',
//       'flask-outline',
//       'checkmark-done-outline',
//       'checkmark-circle-outline',
//     ];
//     const icon = statusIcons[params.position];

//     return (
//       <Icon
//         name={icon}
//         size={moderateScale(20)}
//         color={
//           params.stepStatus === 'finished' ? COLORS.DODGERBLUE : COLORS.ARSENIC
//         }
//       />
//     );
//   };

//   const renderItem = ({item}) => (
//     <View style={styles.appointmentContainer}>
//       <Text style={styles.appointmentType}>{item.type}</Text>
//       <View style={styles.TxtView}>
//         <Text style={styles.label}>Age:</Text>
//         <Text style={styles.value}>{item.age}</Text>
//       </View>
//       <View style={styles.TxtView}>
//         <Text style={styles.label}>Gender:</Text>
//         <Text style={styles.value}>{item.gender}</Text>
//       </View>
//       <View style={styles.TxtView}>
//         <Text style={styles.label}>Problem:</Text>
//         <Text style={styles.value}>{item.problem}</Text>
//       </View>

//       <View style={styles.stepIndicatorContainer}>
//         <View style={styles.TxtView}>
//           <Text style={styles.label}>Status:</Text>
//           <Text style={styles.value}>{labels[item.statusIndex]}</Text>
//         </View>
//         <View style={styles.StepIndicatorView}>
//           <StepIndicator
//             customStyles={customStyles}
//             currentPosition={item.statusIndex}
//             labels={labels}
//             stepCount={labels.length}
//             renderStepIndicator={renderStepIndicator}
//           />
//         </View>
//       </View>

//       {item.labs.map((labItem, index) => (
//         <View key={index} style={styles.testContainer}>
//           <Image
//             source={{uri: labItem.tests[0].test.labCategory.image}}
//             style={styles.testImage}
//           />
//           <View style={styles.testInfo}>
//             <Text style={styles.labInfoTitle}>Lab & Test Information</Text>
//             <View style={styles.TxtView}>
//               <Text style={styles.label}>Lab Name:</Text>
//               <Text style={styles.value}>{labItem.lab.name}</Text>
//             </View>
//             <View style={styles.TxtView}>
//               <Text style={styles.label}>Contact:</Text>
//               <Text style={styles.value}>{labItem.lab.contactNumber}</Text>
//             </View>
//             <View style={styles.TxtView}>
//               <Text style={styles.label}>Email:</Text>
//               <Text style={styles.value}>{labItem.lab.email}</Text>
//             </View>
//             <View style={styles.TxtView}>
//               <Text style={styles.label}>Test:</Text>
//               <Text style={styles.value}>
//                 {labItem.tests[0].test.description}
//               </Text>
//             </View>
//             <View style={styles.TxtView}>
//               <Text style={styles.label}>Category:</Text>
//               <Text style={styles.value}>
//                 {labItem.tests[0].test.labCategory.name}
//               </Text>
//             </View>
//             <View style={styles.TxtView}>
//               <Text style={styles.label}>Price:</Text>
//               <Text style={styles.value}>₹{labItem.tests[0].test.price}</Text>
//             </View>
//           </View>
//         </View>
//       ))}
//     </View>
//   );

//   const filteredAppointments = appointments.filter(item =>
//     item.labs[0].lab.name.toLowerCase().includes(searchQuery.toLowerCase()),
//   );

//   return (
//     <Container
//       statusBarStyle={'light-content'}
//       statusBarBackgroundColor={COLORS.DODGERBLUE}
//       backgroundColor={COLORS.white}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="arrow-back-circle-sharp" size={35} color={COLORS.white} />
//         </TouchableOpacity>
//         <View style={styles.TittleView}>
//           <Text style={styles.TittleText}>Appointments</Text>
//         </View>
//       </View>
//       <View style={styles.searchHeader}>
//         <View style={styles.searchTouch}>
//           <TextInput
//             placeholder="Search..."
//             placeholderTextColor={COLORS.grey}
//             style={styles.searchInput}
//             value={searchQuery}
//             onChangeText={text => setSearchQuery(text)}
//           />
//           <Icon
//             name="search-circle-sharp"
//             size={40}
//             color={COLORS.DODGERBLUE}
//           />
//         </View>
//       </View>
//       {loading ? (
//         <View style={styles.centered}>
//           <ActivityIndicator size="large" color={COLORS.DODGERBLUE} />
//         </View>
//       ) : filteredAppointments.length > 0 ? (
//         <FlatList
//           data={filteredAppointments}
//           keyExtractor={item => item._id}
//           renderItem={renderItem}
//         />
//       ) : (
//         <View style={styles.centered}>
//           <Image
//             source={require('../../assets/no-data.jpg')}
//             style={styles.NoDataImage}
//           />
//           <Text style={styles.errorText}>No Appointments Available</Text>
//         </View>
//       )}
//     </Container>
//   );
// }

// const styles = StyleSheet.create({
//   main: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: scale(10),
//     paddingVertical: verticalScale(8),
//     backgroundColor: COLORS.DODGERBLUE,
//   },
//   TittleView: {
//     flex: 1,
//   },
//   TittleText: {
//     fontSize: moderateScale(18),
//     color: COLORS.white,
//     fontFamily:Fonts.Bold,
//     textAlign: 'center',
//   },

//   searchHeader: {
//     height: verticalScale(70),
//     backgroundColor: COLORS.DODGERBLUE,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderBottomLeftRadius: moderateScale(10),
//     borderBottomRightRadius: moderateScale(10),
//   },
//   searchTouch: {
//     flexDirection: 'row',
//     width: '90%',
//     backgroundColor: COLORS.white,
//     borderColor: COLORS.AntiFlashWhite,
//     borderWidth: moderateScale(1),
//     borderRadius: moderateScale(10),
//     paddingHorizontal: scale(10),
//     elevation: 3,
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   searchInput: {
//     flex: 1,
//     height: verticalScale(40),
//     color: COLORS.black,
//     fontSize: moderateScale(16),
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   appointmentContainer: {
//     backgroundColor:COLORS.white,
//     paddingHorizontal: scale(10),
//     paddingVertical: verticalScale(10),
//     borderRadius: moderateScale(10),
//     marginVertical: verticalScale(10),
//     marginHorizontal: scale(12),
//     elevation: 3,
//   },
//   appointmentType: {
//     fontSize: moderateScale(18),
//     fontFamily:Fonts.Light,
//     color: COLORS.midnightblue,
//     marginBottom: verticalScale(5),
//   },
//   TxtView: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: verticalScale(5),
//   },
//   StepIndicatorView: {
//     marginTop: verticalScale(10),
//   },
//   label: {
//     fontSize: moderateScale(16),
//     color: COLORS.black,
//     fontFamily:Fonts.Medium,
//     width: scale(90),
//   },
//   value: {
//     color: COLORS.midnightblue,
//     fontFamily:Fonts.Medium,
//     fontSize: moderateScale(16),
//     flex: 1,
//   },
//   stepIndicatorContainer: {
//     marginTop: verticalScale(10),
//   },
//   labInfoTitle: {
//     fontSize: moderateScale(18),
//     fontFamily:Fonts.Light,
//     color: COLORS.black,
//   },
//   testContainer: {
//     marginTop: verticalScale(10),
//     backgroundColor: COLORS.white,
//     borderRadius: moderateScale(8),
//     overflow: 'hidden',
//     elevation: 2,
//     borderWidth:0.5
//   },
//   testImage: {
//     height: verticalScale(100),
//     width: '100%',
//     alignSelf: 'center',
//     overflow: 'hidden',
//   },
//   testInfo: {
//     padding: scale(10),
//   },
//   NoDataImage: {
//     resizeMode: 'contain',
//     height: verticalScale(150),
//     width: scale(180),
//   },
//   errorText: {
//     color: COLORS.red,
//     textAlign: 'center',
//     fontSize: moderateScale(16),
//     fontFamily:Fonts.Medium,
//   },
// });

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Image,
} from 'react-native';
import {Container} from '../../component/Container/Container';
import {COLORS} from '../../Theme/Colors';
import CustomHeader from '../../component/header/CustomHeader';
import {Instance} from '../../api/Instance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
import {Fonts} from '../../Theme/Fonts';
import strings from '../../../localization';

export default function MyAppointment({navigation}) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.warn('No token found');
        setLoading(false);
        return;
      }

      const response = await Instance.get(
        '/api/v1/bookings/patientBooking/patient/null', 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        setAppointments(response.data.result);
      }
    } catch (error) {
      console.error(
        'Error fetching appointments:',
        error?.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const renderAppointment = ({item}) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Image
          source={{uri: item.doctorId.image}}
          style={styles.doctorImage}
          resizeMode="cover"
        />
        <View style={{flex: 1, paddingLeft: 10}}>
          <Text style={styles.doctorName}>{item.doctorId.name}</Text>
          <Text style={styles.clinicText}>{item.doctorId.clinicAddress}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <Text style={styles.label}>📅 Date</Text>
        <Text style={styles.value}>
          {new Date(item.appointmentDate).toDateString()}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>⏰ Time</Text>
        <Text style={styles.value}>{item.appointmentTime}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>💸 Fee</Text>
        <Text style={styles.value}>₹{item.consultationFee}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>🧾 Total</Text>
        <Text style={styles.value}>₹{item.totalAmount}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>📍 Status</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.bookingStatus.toLowerCase() === 'confirmed'
                  ? COLORS.green + '20'
                  : item.bookingStatus.toLowerCase() === 'pending'
                  ? COLORS.red + '20'
                  : COLORS.yellowgreen + '20',
            },
          ]}>
          <Text
            style={[
              styles.statusText,
              {
                color:
                  item.bookingStatus.toLowerCase() === 'confirmed'
                    ? COLORS.green
                    : item.bookingStatus.toLowerCase() === 'pending'
                    ? COLORS.red
                    : COLORS.yellowgreen,
              },
            ]}>
            {item.bookingStatus}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <Container
      statusBarStyle={'dark-content'}
      statusBarBackgroundColor={COLORS.white}
      backgroundColor={COLORS.white}>
      <CustomHeader title={strings.MyAppointment} navigation={navigation} />

      {loading ? (
         <View style={styles.loaderContainer}>
         <ActivityIndicator size="large" color={COLORS.primary} />
       </View>
      ) : appointments.length === 0 ? (
        <View style={styles.noData}>
          <Text style={styles.noDataText}>No appointments found</Text>
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={item => item._id}
          renderItem={renderAppointment}
          contentContainerStyle={{padding: 16}}
        />
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  card: {
    backgroundColor: COLORS.white,
    padding: moderateScale(15),
    borderRadius: moderateScale(12),
    marginBottom: scale(16),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorImage: {
    width: scale(60),
    height: scale(60),
    borderRadius: moderateScale(35),
  },
  doctorName: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Bold,
    color: COLORS.black,
  },
  clinicText: {
    fontSize: moderateScale(13),
    marginTop: 2,
    fontFamily: Fonts.Medium,
    color: COLORS.gray,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: verticalScale(10),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  label: {
    fontSize: moderateScale(13),
    fontFamily: Fonts.Medium,
    color: COLORS.black,
  },
  value: {
    fontSize: moderateScale(14),
    color: COLORS.black,
    fontFamily: Fonts.Regular,
  },
  statusBadge: {
    paddingVertical: scale(4),
    paddingHorizontal: scale(10),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Bold,
    textTransform: 'capitalize',
  },
  noData: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(50),
  },
  noDataText: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Medium,
    color: COLORS.gray,
  },
});
