import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {Container} from '../../component/Container/Container';
import {COLORS} from '../../Theme/Colors';
import CustomHeader from '../../component/header/CustomHeader';
import {Fonts} from '../../Theme/Fonts';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ADD_TO_CART} from '../../api/Api_Controller';
import ToastMessage from '../../component/ToastMessage/ToastMessage';

export default function BrandPurches({navigation}) {
  const route = useRoute();
  const {item} = route.params || {};

  if (!item) {
    return <Text>Loading...</Text>;
  }

  const images =
    item?.images?.map(img => ({
      id: img._id,
      uri: img.image,
    })) || [];

  const packSizes =
    item?.size?.map(pack => ({
      id: pack._id,
      size: `${pack.size} ${pack.unit}`,
      price: `₹${pack.price}`,
      stock: pack.quntity > 0 ? 'In stock' : 'Out of stock',
      discount: pack.discount,
      discountType: pack.discountType,
    })) || [];

  const [mainImage, setMainImage] = useState(images[0]?.uri || '');
  const [selectedImageId, setSelectedImageId] = useState(images[0]?.id || '');
  const [selectedPackId, setSelectedPackId] = useState(packSizes[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('');

  const handleImageChange = (newImage, id) => {
    setMainImage(newImage);
    setSelectedImageId(id);
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const selectedPack = packSizes.find(pack => pack.id === selectedPackId);

  const originalPrice = selectedPack
    ? parseFloat(selectedPack.price.replace('₹', ''))
    : 0;

  const discount = selectedPack?.discount || 0;
  const discountType = selectedPack?.discountType || 'fixed';

  const discountedPrice =
    discountType === 'percentage'
      ? originalPrice - (originalPrice * discount) / 100
      : originalPrice - discount;

  const totalPrice = discountedPrice * quantity;

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
      <CustomHeader title="Product Screen" navigation={navigation} />
      <ScrollView>
        <View style={styles.titleContainer}>
          <Text style={styles.productTitle}>{item.title}</Text>
        </View>
        <View style={styles.mainImageContainer}>
          <Image source={{uri: mainImage}} style={styles.mainImage} />
        </View>

        <FlatList
          data={images}
          horizontal
          renderItem={({item}) => {
            const isSelected = item.id === selectedImageId;
            return (
              <TouchableOpacity
                onPress={() => handleImageChange(item.uri, item.id)}
                style={[
                  styles.imageContainer,
                  isSelected && {
                    borderColor: COLORS.primary,
                    borderWidth: 2,
                    borderRadius: 12,
                  },
                ]}>
                <Image
                  source={{uri: item.uri}}
                  style={[
                    styles.thumbnailImage,
                    isSelected && {borderColor: COLORS.primary, borderWidth: 2},
                  ]}
                />
              </TouchableOpacity>
            );
          }}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.flatListContainer}
        />
        <Text style={styles.SELECTETXT}>Select Pack Size</Text>
        <View style={styles.packContainer}>
          {packSizes.map(pack => {
            const isSelected = selectedPackId === pack.id;
            const isOutOfStock = pack.stock === 'Out of stock';
            return (
              <TouchableOpacity
                key={pack.id}
                onPress={() => {
                  if (!isOutOfStock) setSelectedPackId(pack.id);
                }}
                style={[
                  styles.packBox,
                  isSelected && styles.selectedPackBox,
                  isOutOfStock && styles.outOfStockBox,
                ]}>
                <Text
                  style={[
                    styles.sizeText,
                    {
                      backgroundColor: isSelected
                        ? COLORS.DODGERBLUE
                        : COLORS.TEAL,
                    },
                  ]}>
                  {pack.size}
                </Text>
                <Text style={styles.priceText}>{pack.price}</Text>
                <Text
                  style={[
                    styles.stockText,
                    {color: isOutOfStock ? COLORS.red : COLORS.green},
                  ]}>
                  {isOutOfStock ? 'Out of stock' : 'In stock'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.PRICETXT}>
          ₹{discountedPrice.toFixed(2)}{' '}
          <Text style={{textDecorationLine: 'line-through'}}>
            {' '}
            ₹{originalPrice.toFixed(2)}
          </Text>
        </Text>
        <View style={styles.MenufactirDetailsContainer}>
          <Text style={styles.Title1}>Manufacturer</Text>
          <Text style={styles.Title2}>{item.manufacturer}</Text>
        </View>
      </ScrollView>
      <View style={styles.bottomCartSection}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={decreaseQuantity}
            style={styles.iconButton}>
            <AntDesign name="minus" size={18} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity
            onPress={increaseQuantity}
            style={styles.iconButton}>
            <AntDesign name="plus" size={18} color={COLORS.black} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => handleAddToCart(item)}>
          <Text style={styles.cartButtonText}>Add to Cart</Text>
          <Text style={[styles.cartButtonText, {color: COLORS.white}]}>
            ₹{totalPrice.toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>
      {toastMessage && <ToastMessage type={toastType} message={toastMessage} />}
    </Container>
  );
}

const styles = StyleSheet.create({
  productTitle: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Bold,
    color: COLORS.black,
    marginBottom: scale(10),
    marginLeft: scale(15),
    marginTop: scale(8),
  },
  mainImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(20),
  },
  mainImage: {
    width: scale(250),
    height: scale(250),
    borderRadius: 10,
    resizeMode: 'cover',
  },
  flatListContainer: {
    paddingHorizontal: scale(15),
  },
  imageContainer: {
    marginRight: scale(8),
    padding: scale(2),
    borderRadius: moderateScale(10),
  },
  thumbnailImage: {
    width: scale(50),
    height: scale(50),
    borderRadius: moderateScale(8),
    borderWidth: moderateScale(1),
    borderColor: COLORS.gray,
    resizeMode: 'cover',
  },
  SELECTETXT: {
    marginHorizontal: scale(15),
    fontSize: moderateScale(15),
    fontFamily: Fonts.Light,
    color: COLORS.black,
    marginTop: scale(15),
  },
  packContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: scale(15),
    marginTop: scale(10),
  },
  PRICETXT: {
    marginHorizontal: scale(15),
    color: COLORS.black,
    fontSize: moderateScale(15),
    fontFamily: Fonts.Light,
  },
  packBox: {
    width: '47%',
    borderRadius: moderateScale(10),
    backgroundColor: COLORS.white,
    marginBottom: scale(12),
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  selectedPackBox: {
    borderColor: COLORS.DODGERBLUE,
    backgroundColor: COLORS.white,
  },
  outOfStockBox: {
    opacity: 0.6,
  },
  sizeText: {
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(14),
    color: COLORS.white,
    marginBottom: scale(4),
    backgroundColor: COLORS.DODGERBLUE,
    textAlign: 'center',
    borderTopRightRadius: moderateScale(8),
    borderTopLeftRadius: moderateScale(8),
    paddingVertical: verticalScale(3),
  },
  priceText: {
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(13),
    color: COLORS.darkGray,
    marginBottom: scale(3),
    textAlign: 'center',
  },
  stockText: {
    fontFamily: Fonts.Regular,
    fontSize: moderateScale(15),
    textAlign: 'center',
  },
  bottomCartSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: scale(15),
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.AshGray,
    borderRadius: moderateScale(100),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(5),
  },
  iconButton: {
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
  },
  quantityText: {
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(15),
    color: COLORS.black,
  },
  cartButton: {
    backgroundColor: COLORS.DODGERBLUE,
    borderRadius: moderateScale(30),
    paddingVertical: verticalScale(9),
    paddingHorizontal: scale(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cartButtonText: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Bold,
    color: COLORS.white,
    marginRight: scale(10),
  },

  MenufactirDetailsContainer: {
    marginHorizontal: scale(15),
  },
  Title1: {
    fontFamily: Fonts.Bold,
    color: COLORS.black,
    fontSize: moderateScale(15),
    marginTop: scale(10),
  },
  Title2: {
    fontFamily: Fonts.Regular,
    fontSize: moderateScale(15),
    color: COLORS.DODGERBLUE,
  },
});
