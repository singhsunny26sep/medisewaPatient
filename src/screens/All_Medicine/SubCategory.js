import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
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
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import ShimmerCard from '../../component/Shimmer/ShimmerCard';
import MedicineHeader from '../../components/MedicineHeader/MedicineHeader';

export default function SubCategory({navigation, route}) {
  const {brandId} = route.params;
  const [brandMedicines, setBrandMedicines] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Add filtered data based on search query
  const filteredMedicines = brandMedicines.filter(medicine => 
    medicine.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchBrandMedicines = async () => {
      try {
        setLoading(true);
        const response = await Instance.get(
          `/api/v1/medicines/brand/${brandId}`,
        );
        if (response.data.success) {
          setBrandMedicines(response.data.result);
        }
      } catch (error) {
        console.error('Failed to fetch brand medicines:', error);
      } finally {
        setLoading(false);
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
        setCartItems(prevItems => [...prevItems, item]);
        setTotalPrice(prevPrice => prevPrice + item.price);
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

  const handleNext = () => {
    navigation.navigate('MainStack', {
      screen: 'Cart',
      params: {
        items: cartItems,
        totalPrice
      }
    });
  };

  return (
    <Container
      statusBarStyle={'dark-content'}
      statusBarBackgroundColor={COLORS.white}
      backgroundColor={COLORS.white}>
      <MedicineHeader
        onLocationPress={() => {}}
        onCartPress={() => navigation.navigate('Cart', {items: cartItems, totalPrice})}
        onBackPress={() => navigation.goBack()}
        location="Junagadh"
        cartItemsCount={cartItems.length}
        showBackButton={true}
        onSearch={setSearchQuery}
      />
      {loading ? (
        <FlatList
          data={[1, 2, 3, 4, 5]}
          keyExtractor={(_, index) => index.toString()}
          renderItem={() => <ShimmerCard type="medicine" />}
          contentContainerStyle={{paddingVertical: 10, paddingBottom: 80}}
        />
      ) : brandMedicines.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No medicines found for this brand.
          </Text>
        </View>
      ) : filteredMedicines.length === 0 && searchQuery ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No medicines found matching "{searchQuery}"
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMedicines}
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
          contentContainerStyle={{paddingVertical: 10, paddingBottom: 80}}
        />
      )}
      {cartItems.length > 0 && (
        <View style={styles.bottomBar}>
          <View style={styles.cartSummary}>
            <Text style={styles.cartItemsText}>{cartItems.length} Items</Text>
            <Text style={styles.totalPriceText}>₹{totalPrice.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}
      {toastMessage && <ToastMessage type={toastType} message={toastMessage} />}
    </Container>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    borderBottomWidth: 0.5,
    padding: scale(5),
    paddingHorizontal: scale(10),
    marginTop: scale(5),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTextContainer: {
    marginLeft: scale(10),
  },
  locationText: {
    fontSize: moderateScale(12),
    fontFamily: Fonts.Medium,
    color: COLORS.black,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.grey,
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(10),
    backgroundColor: COLORS.white,
    marginTop: verticalScale(25),
    marginBottom: scale(10),
  },
  cartIcon: {
    marginLeft: scale(10),
    padding: scale(10),
    borderWidth: 0.5,
    borderColor: COLORS.grey,
    borderRadius: moderateScale(8),
    backgroundColor: COLORS.white,
  },
  searchIcon: {
    marginRight: scale(8),
  },
  searchInput: {
    flex: 1,
    paddingVertical: verticalScale(8),
    fontFamily: Fonts.Regular,
    color: COLORS.black,
    fontSize: moderateScale(14),
  },
  chevronIcon: {
    marginLeft: 5,
  },
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
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(15),
    borderTopWidth: 0.5,
    borderTopColor: COLORS.grey,
    elevation: 5,
  },
  cartSummary: {
    flex: 1,
  },
  cartItemsText: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Medium,
    color: COLORS.black,
  },
  totalPriceText: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Bold,
    color: COLORS.airForceBlue,
    marginTop: verticalScale(5),
  },
  nextButton: {
    backgroundColor: COLORS.airForceBlue,
    paddingHorizontal: scale(30),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(8),
  },
  nextButtonText: {
    color: COLORS.white,
    fontSize: moderateScale(16),
    fontFamily: Fonts.Bold,
  },
  cartBadge: {
    position: 'absolute',
    right: -3,
    top: -7,
    backgroundColor: COLORS.red || 'red',
    borderRadius: moderateScale(5),
    width: scale(16),
    height: scale(16),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontFamily: Fonts.Bold,
  },
});
