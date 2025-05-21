// import React, {useState, useEffect} from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   FlatList,
//   ActivityIndicator,
//   Image,
// } from 'react-native';
// import {Container} from '../../component/Container/Container';
// import {COLORS} from '../../Theme/Colors';
// import CustomHeader from '../../component/header/CustomHeader';
// import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
// import {Fonts} from '../../Theme/Fonts';

// const formatDate = isoString => {
//   const date = new Date(isoString);
//   return date.toLocaleString('en-IN', {
//     day: '2-digit',
//     month: 'long',
//     year: 'numeric',
//     hour: 'numeric',
//     minute: '2-digit',
//     hour12: true,
//   });
// };

// const OrderCard = ({item}) => {
//   return (
//     <View style={styles.cardContainer}>
//       <Image
//         source={{uri: item.product.image}}
//         style={styles.productImage}
//         resizeMode="contain"
//       />

//       <View style={styles.cardDetails}>
//         <Text style={styles.productTitle}>{item.product.title}</Text>
//         <Text style={styles.amount}>Total Amount: ₹{item.amount}</Text>

//         <View style={styles.userInfo}>
//           <Text style={styles.userText}>👤 Name: {item.user.name}</Text>
//           <Text style={styles.userText}>📧 Email: {item.user.email}</Text>
//           <Text style={styles.userText}>📞 Mobile: {item.user.mobile}</Text>
//           <Text style={styles.userText}>🏠 Address: {item.user.address}</Text>
//         </View>

//         <Text
//           style={[
//             styles.status,
//             item.status === 'success'
//               ? styles.success
//               : item.status === 'pending'
//               ? styles.pending
//               : styles.cancel,
//           ]}>
//           Status: {item.status.toUpperCase()}
//         </Text>
//         <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
//       </View>
//     </View>
//   );
// };

// const PaymentHistory = ({navigation}) => {
//   const [selectedOption, setSelectedOption] = useState('success');
//   const [paymentHistory, setPaymentHistory] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const dummyData = [
//     {
//       _id: '1',
//       amount: 780,
//       status: 'success',
//       createdAt: '2024-04-08T09:30:00Z',
//       user: {
//         name: 'Dr. Nikhil Sharma',
//         email: 'nikhil.sharma@example.com',
//         mobile: '9876543210',
//         address: 'A-12, Sector 44, Noida, Uttar Pradesh',
//       },
//       product: {
//         title: 'Paracetamol 650mg - Strip of 15 tablets',
//         image:
//           'https://image.made-in-china.com/318f0j00rQuYWiOMsDqz/IbuprofenTabs-mp4.webp',
//       },
//     },
//     {
//       _id: '2',
//       amount: 450,
//       status: 'pending',
//       createdAt: '2024-04-10T11:15:00Z',
//       user: {
//         name: 'Ritu Singh',
//         email: 'ritu.singh@example.com',
//         mobile: '9123456789',
//         address: 'Flat 402, Shanti Apartments, Andheri East, Mumbai',
//       },
//       product: {
//         title: 'Cough Syrup (Benadryl) 150ml Bottle',
//         image:
//           'https://image.made-in-china.com/318f0j00rQuYWiOMsDqz/IbuprofenTabs-mp4.webp',
//       },
//     },
//     {
//       _id: '3',
//       amount: 1200,
//       status: 'success',
//       createdAt: '2024-04-12T14:00:00Z',
//       user: {
//         name: 'Manoj Tiwari',
//         email: 'manoj.tiwari@example.com',
//         mobile: '9988776655',
//         address: 'House No. 34, Phase 2, Chandigarh',
//       },
//       product: {
//         title: 'Vitamin D3 (Cholecalciferol) Capsules - Pack of 10',
//         image:
//           'https://image.made-in-china.com/318f0j00rQuYWiOMsDqz/IbuprofenTabs-mp4.webp',
//       },
//     },
//     {
//       _id: '4',
//       amount: 999,
//       status: 'cancel',
//       createdAt: '2024-04-11T16:45:00Z',
//       user: {
//         name: 'Anusha Iyer',
//         email: 'anusha.iyer@example.com',
//         mobile: '9876541230',
//         address: '27, Residency Road, Bangalore',
//       },
//       product: {
//         title: 'Insulin Injection Pen - 3ml',
//         image:
//           'https://image.made-in-china.com/318f0j00rQuYWiOMsDqz/IbuprofenTabs-mp4.webp',
//       },
//     },
//     {
//       _id: '5',
//       amount: 350,
//       status: 'pending',
//       createdAt: '2024-04-13T08:20:00Z',
//       user: {
//         name: 'Mohammed Faizan',
//         email: 'faizan.m@example.com',
//         mobile: '9090909090',
//         address: '12, Charminar Road, Hyderabad',
//       },
//       product: {
//         title: 'Cetirizine 10mg - Allergy Relief Tablets',
//         image:
//           'https://image.made-in-china.com/318f0j00rQuYWiOMsDqz/IbuprofenTabs-mp4.webp',
//       },
//     },
//   ];

//   useEffect(() => {
//     setLoading(true);
//     setTimeout(() => {
//       setPaymentHistory(dummyData);
//       setLoading(false);
//     }, 1000);
//   }, []);

//   const filteredPayments = paymentHistory.filter(
//     item => item.status.toLowerCase() === selectedOption,
//   );

//   return (
//     <Container
//       statusBarStyle="dark-content"
//       statusBarBackgroundColor={COLORS.white}
//       backgroundColor={COLORS.white}>
//       <CustomHeader navigation={navigation} title="Order History" />

//       <View style={styles.tabsContainer}>
//         {['success', 'pending', 'cancel'].map((status, index) => (
//           <TouchableOpacity
//             key={status}
//             onPress={() => setSelectedOption(status)}
//             style={[
//               styles.tab,
//               selectedOption === status && styles.activeTab,
//               index === 0 && styles.firstTab,
//               index === 1 && styles.middleTab,
//               index === 2 && styles.lastTab,
//             ]}>
//             <Text
//               style={[
//                 styles.tabText,
//                 selectedOption === status && styles.activeTabText,
//               ]}>
//               {status.charAt(0).toUpperCase() + status.slice(1)}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {loading ? (
//         <View style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color={COLORS.DODGERBLUE} />
//       </View>
//       ) : filteredPayments.length === 0 ? (
//         <View style={styles.noDataContainer}>
//           <Text style={styles.noDataText}>No orders available</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={filteredPayments}
//           keyExtractor={item => item._id}
//           renderItem={({item}) => <OrderCard item={item} />}
//           contentContainerStyle={styles.appointmentList}
//           showsVerticalScrollIndicator={false}
//         />
//       )}
//     </Container>
//   );
// };

// export default PaymentHistory;
// const styles = StyleSheet.create({
//   tabsContainer: {
//     flexDirection: 'row',
//     marginHorizontal: scale(15),
//     borderRadius: moderateScale(5),
//     borderWidth: moderateScale(1),
//     borderColor: COLORS.black,
//     overflow: 'hidden',
//     marginTop: scale(10),
//   },
//   tab: {
//     flex: 1,
//     paddingVertical: verticalScale(5),
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   firstTab: {
//     borderRightWidth: moderateScale(1),
//   },
//   middleTab: {
//     borderRightWidth: moderateScale(1),
//   },
//   tabText: {
//     fontSize: moderateScale(14),
//     color: COLORS.darkGray,
//     fontFamily: Fonts.Medium,
//   },
//   activeTabText: {
//     color: COLORS.white,
//     fontFamily: Fonts.Bold,
//   },
//   activeTab: {
//     backgroundColor: COLORS.DODGERBLUE,
//   },

//   cardContainer: {
//     backgroundColor: COLORS.white,
//     marginHorizontal: scale(16),
//     marginVertical: verticalScale(10),
//     borderRadius: moderateScale(12),
//     padding: scale(16),
//     shadowColor: COLORS.black,
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     shadowOffset: {width: 0, height: 2},
//     elevation: 3,
//   },
//   productImage: {
//     width: '100%',
//     height: verticalScale(150),
//     borderRadius: moderateScale(10),
//     marginBottom: verticalScale(12),
//     resizeMode: 'cover',
//   },
//   cardDetails: {
//     width: '100%',
//   },
//   productTitle: {
//     fontSize: moderateScale(16),
//     fontFamily: Fonts.Bold,
//     color: COLORS.black,
//     marginBottom: verticalScale(6),
//   },
//   amount: {
//     fontSize: moderateScale(14),
//     color: COLORS.RobinBlue,
//     fontFamily: Fonts.Medium,
//     marginBottom: verticalScale(10),
//   },
//   userInfo: {
//     marginBottom: verticalScale(12),
//   },
//   userText: {
//     fontSize: moderateScale(13),
//     color: COLORS.black,
//     fontFamily: Fonts.Medium,
//     marginBottom: verticalScale(3),
//   },
//   status: {
//     fontSize: moderateScale(13),
//     fontFamily: Fonts.Bold,
//     textAlign: 'right',
//   },
//   success: {
//     color: COLORS.green,
//   },
//   pending: {
//     color: COLORS.yellow,
//   },
//   cancel: {
//     color: COLORS.red,
//   },
//   appointmentList: {
//     paddingBottom: verticalScale(20),
//     paddingTop: verticalScale(10),
//   },
//   noDataContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: verticalScale(50),
//   },
//   noDataText: {
//     fontSize: moderateScale(16),
//     fontFamily: Fonts.Medium,
//     color: COLORS.grey,
//   },
//   date: {
//     textAlign: 'right',
//     fontFamily: Fonts.Regular,
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {Container} from '../../component/Container/Container';
import {COLORS} from '../../Theme/Colors';
import CustomHeader from '../../component/header/CustomHeader';
import {Instance} from '../../api/Instance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {moderateScale, scale} from '../../utils/Scaling';
import {Fonts} from '../../Theme/Fonts';
import strings from '../../../localization';

export default function OrderHistory({navigation}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrderHistory = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('Token not found');
        return;
      }
      const response = await Instance.get('api/v1/selles/sellesHistory', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }); 
      if (response.data.success) {
        setOrders(response.data.result);
      } else {
        console.log('API call unsuccessful:', response.data);
      }
    } catch (error) {
      console.log('Error fetching order history:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const renderItem = ({item}) => {
    const med = item.medicineId;
    const size = item.sizeId;
  
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.iconCircle}>
            <Icon name="pill" size={20} color={COLORS.white} />
          </View>
          <Text style={styles.title}>
            {med.title} ({size.size}{size.unit})
          </Text>
        </View>
  
        <View style={styles.infoRow}>
          <Text style={styles.label}>Quantity:</Text>
          <Text style={styles.value}>{item.quantity}</Text>
        </View>
  
        <View style={styles.infoRow}>
          <Text style={styles.label}>Price/Unit:</Text>
          <Text style={styles.value}>₹{item.priceAtSale}</Text>
        </View>
  
        <View style={styles.infoRow}>
          <Text style={styles.label}>Total Amount:</Text>
          <Text style={styles.valueBold}>₹{item.amount}</Text>
        </View>
  
        <View style={styles.dateRow}>
          <Icon name="calendar-month" size={24} color={COLORS.black} />
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </View>
      </View>
    );
  };
  

  return (
    <Container
      statusBarStyle="dark-content"
      statusBarBackgroundColor={COLORS.white}
      backgroundColor={COLORS.white}>
      <CustomHeader navigation={navigation} title={strings.OrderHistory} />
      {loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.DODGERBLUE}
          style={{marginTop: 20}}
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={{padding: 16}}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No Orders Found</Text>
            </View>
          }
        />
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: scale(18),
    marginBottom: scale(16),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: '#E6E6E6',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(14),
  },
  iconCircle: {
    width:scale(30),
    height:scale(30),
    backgroundColor: COLORS.DODGERBLUE,
    borderRadius: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  title: {
    fontFamily: Fonts.Light,
    fontSize: scale(15),
    color: COLORS.DODGERBLUE,
    flex: 1,
    flexWrap: 'wrap',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: scale(6),
  },
  label: {
    fontFamily: Fonts.Regular,
    fontSize: scale(13),
    color: COLORS.gray,
  },
  value: {
    fontFamily: Fonts.Medium,
    fontSize: scale(13),
    color: COLORS.black,
  },
  valueBold: {
    fontFamily: Fonts.Bold,
    fontSize: scale(14),
    color: COLORS.green,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scale(12),
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: scale(10),
  },
  dateText: {
    fontFamily: Fonts.Regular,
    fontSize: scale(12),
    color: COLORS.gray,
    marginLeft: scale(8),
    top:scale(1)
  },
  emptyContainer:{
    flex:1,
    justifyContent:"center",
    alignItems:"center"
  },
  emptyText:{
    color:COLORS.red,
    fontFamily:Fonts.Medium,
    fontSize:moderateScale(15)
  }
});
