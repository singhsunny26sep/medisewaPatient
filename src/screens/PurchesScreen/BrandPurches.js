import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Container } from '../../component/Container/Container';
import { COLORS } from '../../Theme/Colors';
import CustomHeader from '../../component/header/CustomHeader';
import { Fonts } from '../../Theme/Fonts';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ADD_TO_CART } from '../../api/Api_Controller';
import ToastMessage from '../../component/ToastMessage/ToastMessage';
import { useDispatch } from 'react-redux';

const { width } = Dimensions.get('window');

export default function BrandPurches({ navigation }) {
  const route = useRoute();
  const dispatch = useDispatch();
  const { item } = route.params || {};

  if (!item) {
    return (
      <Container backgroundColor={COLORS.white}>
        <CustomHeader title="Product" navigation={navigation} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Product not found</Text>
        </View>
      </Container>
    );
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
      quantity: pack.quntity,
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

  const handleAddToCart = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setToastType('error');
        setToastMessage('Please login to add items to cart');
        return;
      }
      const payload = {
        id: item._id,
        quantity: quantity,
        selectedPack: selectedPackId,
      };

      const data = await ADD_TO_CART(payload, token);

      if (data.success) {
        setToastType('success');
        setToastMessage('Item added to cart!');
        dispatch({ type: 'ADD_TO_CART', payload: { ...item, quantity } });
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
      <CustomHeader title="Product Detail" navigation={navigation} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Product Title */}
        <Text style={styles.productTitle}>{item.title}</Text>

        {/* Main Image with Shadow */}
        <View style={styles.mainImageWrapper}>
          <Image source={{ uri: mainImage }} style={styles.mainImage} />
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>
                {discountType === 'percentage' ? `${discount}% OFF` : `₹${discount} OFF`}
              </Text>
            </View>
          )}
        </View>

        {/* Thumbnail Gallery */}
        <FlatList
          data={images}
          horizontal
          renderItem={({ item }) => {
            const isSelected = item.id === selectedImageId;
            return (
              <TouchableOpacity
                onPress={() => handleImageChange(item.uri, item.id)}
                activeOpacity={0.8}
                style={[
                  styles.thumbnailWrapper,
                  isSelected && styles.selectedThumbnail,
                ]}>
                <Image source={{ uri: item.uri }} style={styles.thumbnailImage} />
                {isSelected && <View style={styles.thumbnailOverlay} />}
              </TouchableOpacity>
            );
          }}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailList}
        />

        {/* Pack Size Selection */}
        <Text style={styles.sectionLabel}>Select Pack Size</Text>
        <View style={styles.packContainer}>
          {packSizes.map(pack => {
            const isSelected = selectedPackId === pack.id;
            const isOutOfStock = pack.stock === 'Out of stock';
            const discountValue = pack.discount;
            const discountType = pack.discountType;
            let discountText = '';
            if (discountValue > 0) {
              discountText =
                discountType === 'percentage'
                  ? `${discountValue}% off`
                  : `₹${discountValue} off`;
            }
            return (
              <TouchableOpacity
                key={pack.id}
                onPress={() => {
                  if (!isOutOfStock) setSelectedPackId(pack.id);
                }}
                activeOpacity={0.7}
                style={[
                  styles.packCard,
                  isSelected && styles.selectedPackCard,
                  isOutOfStock && styles.outOfStockPack,
                ]}
                disabled={isOutOfStock}>
                <View style={styles.packHeader}>
                  <Text style={[styles.packSize, isSelected && styles.selectedPackText]}>
                    {pack.size}
                  </Text>
                  {discountText !== '' && !isOutOfStock && (
                    <View style={styles.packDiscountBadge}>
                      <Text style={styles.packDiscountText}>{discountText}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.packPrice, isSelected && styles.selectedPackText]}>
                  {pack.price}
                </Text>
                <Text
                  style={[
                    styles.packStock,
                    isOutOfStock ? styles.outOfStockText : styles.inStockText,
                  ]}>
                  {isOutOfStock ? 'Out of stock' : 'In stock'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Price Display */}
        <View style={styles.priceContainer}>
          <Text style={styles.discountedPrice}>₹{discountedPrice.toFixed(2)}</Text>
          {discount > 0 && (
            <>
              <Text style={styles.originalPrice}>₹{originalPrice.toFixed(2)}</Text>
              <View style={styles.saveBadge}>
                <Text style={styles.saveText}>
                  Save ₹{(originalPrice - discountedPrice).toFixed(2)}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Manufacturer Details */}
        <View style={styles.manufacturerCard}>
          <MaterialIcons name="store" size={24} color={COLORS.DODGERBLUE} />
          <View style={styles.manufacturerInfo}>
            <Text style={styles.manufacturerLabel}>Manufacturer</Text>
            <Text style={styles.manufacturerName}>{item.manufacturer}</Text>
          </View>
        </View>

        {/* Description (if available) */}
        {item.description && (
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{item.description}</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Fixed Bar */}
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFE']}
        style={styles.bottomBar}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={decreaseQuantity} style={styles.qtyButton} activeOpacity={0.7}>
            <AntDesign name="minus" size={20} color={COLORS.DODGERBLUE} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity onPress={increaseQuantity} style={styles.qtyButton} activeOpacity={0.7}>
            <AntDesign name="plus" size={20} color={COLORS.DODGERBLUE} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity activeOpacity={0.8} onPress={handleAddToCart} style={styles.cartButtonWrapper}>
          <LinearGradient
            colors={[COLORS.DODGERBLUE, '#4A90E2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cartButton}>
            <AntDesign name="shoppingcart" size={22} color="#fff" />
            <Text style={styles.cartButtonText}>Add to Cart</Text>
            <Text style={styles.cartTotal}>₹{totalPrice.toFixed(2)}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      {toastMessage && <ToastMessage type={toastType} message={toastMessage} />}
    </Container>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: Fonts.Medium,
    color: COLORS.red,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  productTitle: {
    fontSize: 20,
    fontFamily: Fonts.Bold,
    color: COLORS.black,
    marginVertical: 12,
    letterSpacing: 0.5,
  },
  mainImageWrapper: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  mainImage: {
    width: width - 32,
    height: 280,
    borderRadius: 16,
    resizeMode: 'cover',
    backgroundColor: '#F0F4F8',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  discountBadgeText: {
    color: '#fff',
    fontFamily: Fonts.Bold,
    fontSize: 12,
  },
  thumbnailList: {
    paddingVertical: 8,
  },
  thumbnailWrapper: {
    marginRight: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  selectedThumbnail: {
    borderColor: COLORS.DODGERBLUE,
  },
  thumbnailImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(74,144,217,0.1)',
  },
  sectionLabel: {
    fontSize: 16,
    fontFamily: Fonts.SemiBold,
    color: COLORS.black,
    marginTop: 16,
    marginBottom: 10,
  },
  packContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  packCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#E8ECF4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  selectedPackCard: {
    borderColor: COLORS.DODGERBLUE,
    backgroundColor: '#F0F7FF',
    shadowColor: COLORS.DODGERBLUE,
    shadowOpacity: 0.1,
    elevation: 4,
  },
  outOfStockPack: {
    opacity: 0.6,
    backgroundColor: '#F5F6FA',
  },
  packHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  packSize: {
    fontSize: 14,
    fontFamily: Fonts.Bold,
    color: COLORS.black,
  },
  selectedPackText: {
    color: COLORS.DODGERBLUE,
  },
  packDiscountBadge: {
    backgroundColor: '#FFE8E8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  packDiscountText: {
    fontSize: 10,
    fontFamily: Fonts.Medium,
    color: '#FF6B6B',
  },
  packPrice: {
    fontSize: 16,
    fontFamily: Fonts.Bold,
    color: COLORS.black,
    marginVertical: 2,
  },
  packStock: {
    fontSize: 12,
    fontFamily: Fonts.Medium,
  },
  inStockText: {
    color: COLORS.green,
  },
  outOfStockText: {
    color: COLORS.red,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  discountedPrice: {
    fontSize: 24,
    fontFamily: Fonts.Bold,
    color: COLORS.DODGERBLUE,
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 16,
    fontFamily: Fonts.Medium,
    color: '#A0A8B4',
    textDecorationLine: 'line-through',
    marginRight: 12,
  },
  saveBadge: {
    backgroundColor: '#E6F9F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  saveText: {
    fontSize: 12,
    fontFamily: Fonts.Medium,
    color: COLORS.greenViridian,
  },
  manufacturerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  manufacturerInfo: {
    marginLeft: 12,
  },
  manufacturerLabel: {
    fontSize: 12,
    fontFamily: Fonts.Regular,
    color: '#7F8C8D',
  },
  manufacturerName: {
    fontSize: 15,
    fontFamily: Fonts.Bold,
    color: COLORS.black,
  },
  descriptionCard: {
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    marginVertical: 8,
  },
  descriptionTitle: {
    fontSize: 15,
    fontFamily: Fonts.Bold,
    color: COLORS.black,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: Fonts.Regular,
    color: '#5A6A7E',
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8ECF4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    borderRadius: 30,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  qtyButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  quantityText: {
    fontSize: 18,
    fontFamily: Fonts.Bold,
    color: COLORS.black,
    minWidth: 30,
    textAlign: 'center',
  },
  cartButtonWrapper: {
    flex: 1,
    marginLeft: 12,
    borderRadius: 30,
    overflow: 'hidden',
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cartButtonText: {
    fontSize: 14,
    fontFamily: Fonts.Bold,
    color: '#fff',
    marginLeft: 6,
    flex: 1,
  },
  cartTotal: {
    fontSize: 16,
    fontFamily: Fonts.Bold,
    color: '#fff',
  },
});