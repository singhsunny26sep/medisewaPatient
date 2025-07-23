import React, {useState, useEffect} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {COLORS} from '../../Theme/Colors';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomHeader from '../../component/header/CustomHeader';
import {Fonts} from '../../Theme/Fonts';
import {Container} from '../../component/Container/Container';
import {Instance} from '../../api/Instance';
import {GET_CART_DATA, DELETE_CART_ITEM} from '../../api/Api_Controller';
import strings from '../../../localization';
import {useDispatch, useSelector} from 'react-redux';

export default function Cart({navigation}) {
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.cartItems);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const data = await GET_CART_DATA(token);
        console.log('API cart data:', data);

        if (data.success) {
          dispatch({
            type: 'SET_CART_COUNT',
            payload: {
              count: data.result.length,
              items: data.result
            }
          });
          console.log('Cart items to be set in Redux:', data.result);
          const initialQuantities = data.result.reduce((acc, item) => {
            acc[item._id] = 1;
            return acc;
          }, {});
          setQuantities(initialQuantities);
        }
      } catch (error) {
        console.error('Failed to fetch cart:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartData();
  }, []);

  useEffect(() => {
    console.log('Redux cartItems:', cartItems);
  }, [cartItems]);

  const handleDeleteItem = async medicineId => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('Deleting item with ID:', medicineId, 'and token:', token);
      const data = await DELETE_CART_ITEM(medicineId, token);
      if (data.success) {
        dispatch({type: 'REMOVE_FROM_CART', payload: medicineId});
      } else {
        console.warn('Failed to delete item:', data.message);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleQuantityChange = (medicineId, type) => {
    setQuantities(prev => {
      const newQuantity = prev[medicineId] + (type === 'increase' ? 1 : -1);
      if (newQuantity >= 1) {
        return {...prev, [medicineId]: newQuantity};
      }
      return prev;
    });
  };

  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const quantity = quantities[item._id] || 1;
      return total + item?.medicineId?.price * quantity;
    }, 0);
  };

  return (
    <Container
      statusBarStyle={'dark-content'}
      statusBarBackgroundColor={COLORS.white}
      backgroundColor={COLORS.white}>
      <CustomHeader title={strings.Cart} showIcon={false} />
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.DODGERBLUE} />
        </View>
      ) : cartItems?.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image
            source={{
              uri: 'https://cdni.iconscout.com/illustration/premium/thumb/empty-cart-illustration-download-in-svg-png-gif-file-formats--shopping-ecommerce-simple-error-state-pack-user-interface-illustrations-6024626.png',
            }}
            style={{height: scale(155), width: scale(155)}}
          />
          <Text style={styles.emptyText}>{strings.CartEmptyMessage}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('MedicineScreen')}>
            <Text style={styles.addButtonText}>{strings.AddMedicines}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
            <FlatList
              data={cartItems}
              keyExtractor={item => item._id.toString()}
              renderItem={({item}) => {
                const medicine = item.medicineId;
                const quantity = quantities[item._id] || 1;
                return (
                  <View style={styles.itemContainer}>
                    <Image
                      source={{uri: medicine?.images?.[0]?.image}}
                      style={styles.image}
                    />
                    <View style={styles.detailsContainer}>
                      <View style={styles.titleContainer}>
                        <Text style={styles.title}>{medicine?.title}</Text>
                        <TouchableOpacity
                          onPress={() => handleDeleteItem(item._id)}>
                          <MaterialIcons
                            name="delete-outline"
                            color={COLORS.black}
                            size={22}
                          />
                        </TouchableOpacity>
                      </View>
                      <Text style={{color: COLORS.black}}>
                        Qty:{medicine?.quntity || 'N/A'} ML
                      </Text>
                      <Text style={styles.price}>₹{medicine?.price}</Text>
                      <View style={styles.quantityContainer}>
                        <TouchableOpacity
                          style={styles.iconButton}
                          onPress={() =>
                            handleQuantityChange(item._id, 'decrease')
                          }>
                          <AntDesign
                            name="minus"
                            size={23}
                            color={COLORS.white}
                          />
                        </TouchableOpacity>
                        <Text style={styles.quantity}>{quantity}</Text>
                        <TouchableOpacity
                          style={styles.iconButton}
                          onPress={() =>
                            handleQuantityChange(item._id, 'increase')
                          }>
                          <AntDesign
                            name="plus"
                            size={23}
                            color={COLORS.white}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              }}
            />
          </ScrollView>
          <View style={styles.checkoutContainer}>
            <View style={styles.totalPriceContainer}>
              <Text style={styles.totalPriceLabel}>{strings.TotalPrice}</Text>
              <Text style={styles.totalPriceValue}>
                ₹{calculateTotalPrice()}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => {
                navigation.navigate('Pre_View_Order', {
                  cartData: cartItems,
                  totalPrice: calculateTotalPrice(),
                });
              }}>
              <Text style={styles.checkoutButtonText}>{strings.CheckOut}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(8),
    padding: scale(5),
    marginBottom: scale(8),
    paddingVertical: verticalScale(15),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginHorizontal: scale(15),
    marginVertical: verticalScale(3),
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    height: scale(85),
    width: scale(85),
    borderRadius: moderateScale(8),
    marginRight: scale(10),
  },
  detailsContainer: {
    flex: 1,
    marginLeft: scale(5),
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: Fonts.Medium,
    fontSize: scale(14),
    color: COLORS.black,
    width: scale(180),
  },
  price: {
    fontSize: scale(14),
    fontFamily: Fonts.Regular,
    color: COLORS.black,
    paddingVertical: verticalScale(5),
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    backgroundColor: COLORS.DODGERBLUE,
    borderRadius: moderateScale(5),
    padding: scale(2),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: scale(3),
  },
  quantity: {
    marginHorizontal: scale(10),
    fontSize: moderateScale(16),
    color: COLORS.black,
    fontFamily: Fonts.Bold,
  },
  checkoutContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: scale(15),
    borderTopColor: COLORS.grey,
    borderTopLeftRadius: moderateScale(15),
    borderTopRightRadius: moderateScale(15),
    borderWidth: 0.3,
    borderColor: COLORS.grey,
  },
  totalPriceContainer: {
    flex: 1,
  },
  totalPriceLabel: {
    color: COLORS.black,
    fontSize: moderateScale(18),
    fontFamily: Fonts.Medium,
  },
  totalPriceValue: {
    color: COLORS.black,
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(18),
  },
  checkoutButton: {
    backgroundColor: COLORS.DODGERBLUE,
    borderRadius: moderateScale(5),
    paddingVertical: scale(6),
    paddingHorizontal: scale(15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonText: {
    color: COLORS.white,
    fontSize: moderateScale(18),
    fontFamily: Fonts.Bold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  emptyText: {
    fontSize: moderateScale(18),
    color: COLORS.black,
    fontFamily: Fonts.Medium,
    marginBottom: verticalScale(10),
  },
  addButton: {
    backgroundColor: COLORS.DODGERBLUE,
    paddingVertical: scale(10),
    paddingHorizontal: scale(20),
    borderRadius: moderateScale(8),
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: moderateScale(16),
    fontFamily: Fonts.Bold,
  },
});
