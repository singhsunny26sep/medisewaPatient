import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {Container} from '../../component/Container/Container';
import {COLORS} from '../../Theme/Colors';
import CustomHeader from '../../component/header/CustomHeader';
import {BrandDetailsData} from '../../utils/LocalDataBase';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
import {Fonts} from '../../Theme/Fonts';
import CustomBrandCard from '../../component/Category/CustomBrandCard';
import {Instance} from '../../api/Instance';
import ToastMessage from '../../component/ToastMessage/ToastMessage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ADD_TO_CART} from '../../api/Api_Controller';

export default function BrandCardDetails({navigation, route}) {
  const {brandId} = route.params;
  const [brandMedicines, setBrandMedicines] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('');

  useEffect(() => {
    const fetchBrandMedicines = async () => {
      try {
        const response = await Instance.get(
          `/api/v1/medicines/brand/${brandId}`,
        );
        if (response.data.success) {
          setBrandMedicines(response.data.result);
        }
      } catch (error) {
        console.error('Failed to fetch brand medicines:', error);
      }
    };

    fetchBrandMedicines();
  }, [brandId]);

  const handleAddToCart = async item => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setToastType('error');
        setToastMessage('Please login to add items to cart');
        return;
      }
      const payload = {
        id: item._id,
        quantity: item.quntity,
      };

      const data = await ADD_TO_CART(payload, token);

      if (data.success) {
        setToastType('success');
        setToastMessage('Item added to cart!');
      } else {
        setToastType('error');
        setToastMessage('Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setToastType('error');
      setToastMessage('Something went wrong');
    }
  };

  return (
    <Container
      statusBarStyle={'dark-content'}
      statusBarBackgroundColor={COLORS.white}
      backgroundColor={COLORS.white}>
      <CustomHeader title="Brand List" navigation={navigation} />
      {brandMedicines.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No medicines found for this brand.
          </Text>
        </View>
      ) : (
        <FlatList
          data={brandMedicines}
          keyExtractor={item => item._id.toString()}
          renderItem={({item}) => (
            <CustomBrandCard
              item={{
                title: item.title,
                Img: item.images?.[0]?.image || '',
                price: `₹${item.price}`,
                nonPrice: `₹${Math.round(item.price * 1.2)}`,
                off: `${item.offer}${
                  item.offerType === 'percentage' ? '%' : '₹'
                } OFF`,
              }}
              onPress={() => navigation.navigate('BrandPurches', {item})}
              onAddPress={() => handleAddToCart(item)}
            />
          )}
          contentContainerStyle={{paddingVertical: 10}}
        />
      )}
      {toastMessage && <ToastMessage type={toastType} message={toastMessage} />}
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(10),
    marginHorizontal: scale(16),
    marginVertical: verticalScale(8),
    padding: scale(5),
    elevation: 3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  emptyText: {
    fontSize: moderateScale(14),
    color: COLORS.gray,
    fontFamily: Fonts.Light,
    textAlign: 'center',
  },
  image: {
    width: 80,
    height: 100,
    resizeMode: 'contain',
  },
  details: {
    flex: 1,
  },
  title: {
    fontSize: moderateScale(13),
    color: COLORS.black || '#000',
    fontFamily: Fonts.Bold,
    marginBottom: scale(8),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Light,
    color: COLORS.DODGERBLUE || '#00aaff',
    marginRight: scale(10),
  },
  nonPrice: {
    fontSize: moderateScale(14),
    color: COLORS.gray || '#999',
    textDecorationLine: 'line-through',
    marginRight: moderateScale(10),
    fontFamily: Fonts.Light,
  },
  off: {
    fontSize: moderateScale(14),
    color: COLORS.green,
    fontFamily: Fonts.Light,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(6),
  },
  addButton: {
    backgroundColor: COLORS.airForceBlue,
    paddingVertical: verticalScale(4),
    paddingHorizontal: scale(25),
    borderRadius: moderateScale(5),
    marginRight: scale(10),
  },
  addButtonText: {
    color: COLORS.white,
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(13),
    textAlign: 'center',
  },
  optionText: {
    fontSize: moderateScale(13),
    fontFamily: Fonts.Light,
    color: COLORS.airForceBlue || '#888',
  },
});
