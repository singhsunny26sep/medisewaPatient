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
import ShimmerCard from '../../component/Shimmer/ShimmerCard';

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
        <FlatList
          data={[1, 2, 3, 4, 5]}
          keyExtractor={(item) => item.toString()}
          renderItem={() => <ShimmerCard type="order" />}
          contentContainerStyle={{padding: 16}}
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
