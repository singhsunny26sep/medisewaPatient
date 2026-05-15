import React, { useState, useEffect } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { GET_CART_DATA, DELETE_CART_ITEM } from '../../api/Api_Controller';
import strings from '../../../localization';
import { useDispatch, useSelector } from 'react-redux';

const { width, height } = Dimensions.get('window');

export default function Cart({ navigation }) {
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.cartItems);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCartData();
  }, [dispatch]);

  const fetchCartData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const data = await GET_CART_DATA(token);
      if (data.success) {
        dispatch({
          type: 'SET_CART_COUNT',
          payload: {
            count: data.result.length,
            items: data.result
          }
        });
        const initialQuantities = data.result.reduce((acc, item) => {
          acc[item._id] = item.quantity || 1;
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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCartData();
    setRefreshing(false);
  };

  const handleDeleteItem = async medicineId => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const data = await DELETE_CART_ITEM(medicineId, token);
      if (data.success) {
        dispatch({ type: 'REMOVE_FROM_CART', payload: medicineId });
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleQuantityChange = (medicineId, type) => {
    setQuantities(prev => {
      const newQuantity = prev[medicineId] + (type === 'increase' ? 1 : -1);
      if (newQuantity >= 1) {
        return { ...prev, [medicineId]: newQuantity };
      }
      return prev;
    });
  };

  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const quantity = quantities[item._id] || 1;
      return total + (item?.medicineId?.price || 0) * quantity;
    }, 0);
  };

  const calculateItemTotal = (item) => {
    const quantity = quantities[item._id] || 1;
    return (item?.medicineId?.price || 0) * quantity;
  };

  const CartItem = ({ item }) => {
    const medicine = item.medicineId;
    const quantity = quantities[item._id] || 1;
    const itemTotal = calculateItemTotal(item);

    return (
      <View style={styles.cartItemCard}>
        <View style={styles.itemImageWrapper}>
          {medicine?.images?.[0]?.image ? (
            <Image source={{ uri: medicine.images[0].image }} style={styles.itemImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="medical" size={32} color="#3B82F6" />
            </View>
          )}
        </View>

        <View style={styles.itemDetails}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle} numberOfLines={2}>
              {medicine?.title || 'Medicine Product'}
            </Text>
            <TouchableOpacity onPress={() => handleDeleteItem(item._id)} style={styles.deleteBtn}>
              <MaterialIcons name="delete-outline" size={22} color="#EF4444" />
            </TouchableOpacity>
          </View>

          <Text style={styles.itemQuantityText}>
            Quantity: {medicine?.quntity || 'Standard'} ML
          </Text>

          <View style={styles.priceSection}>
            <Text style={styles.unitPrice}>₹{medicine?.price || 0}</Text>
            <Text style={styles.itemTotalPrice}>₹{itemTotal}</Text>
          </View>

          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => handleQuantityChange(item._id, 'decrease')}>
              <AntDesign name="minus" size={14} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{quantity}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => handleQuantityChange(item._id, 'increase')}>
              <AntDesign name="plus" size={14} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const EmptyCart = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrapper}>
        <Ionicons name="cart-outline" size={80} color="#3B82F6" />
      </View>
      <Text style={styles.emptyTitle}>{strings.CartEmptyMessage}</Text>
      <Text style={styles.emptySubtitle}>
        Your cart is waiting for some goodies! Add medicines to get started.
      </Text>
      <TouchableOpacity
        style={styles.shopNowBtn}
        onPress={() => navigation.navigate('MedicineCategory')}>
        <LinearGradient
          colors={['#3B82F6', '#2563EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shopNowGradient}>
          <Text style={styles.shopNowText}>Add Medicines</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading your cart...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        {cartItems?.length > 0 && (
          <View style={styles.cartCountBadge}>
            <Text style={styles.cartCountText}>{cartItems.length}</Text>
          </View>
        )}
      </View>

      {cartItems?.length === 0 ? (
        <EmptyCart />
      ) : (
        <>
          {/* Cart Summary Header */}
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryText}>
              {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'} in your cart
            </Text>
          </View>

          {/* Cart Items List */}
          <FlatList
            data={cartItems}
            keyExtractor={item => item._id.toString()}
            renderItem={({ item }) => <CartItem item={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
            }
          />

          {/* Checkout Footer */}
          <View style={styles.checkoutFooter}>
            <View style={styles.totalWrapper}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>₹{calculateTotalPrice()}</Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => {
                navigation.navigate('Pre_View_Order', {
                  cartData: cartItems,
                  totalPrice: calculateTotalPrice(),
                });
              }}>
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.checkoutGradient}>
                <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

// Add RefreshControl import
import { RefreshControl } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  cartCountBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  cartCountText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  summaryHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  summaryText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 120,
  },
  cartItemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemImageWrapper: {
    marginRight: 14,
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  imagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
    lineHeight: 20,
  },
  deleteBtn: {
    padding: 4,
  },
  itemQuantityText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  unitPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  itemTotalPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  qtyBtn: {
    backgroundColor: '#3B82F6',
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyValue: {
    marginHorizontal: 14,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    minWidth: 30,
    textAlign: 'center',
  },
  checkoutFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  totalWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  checkoutBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  checkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  checkoutBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
  },
  shopNowBtn: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  shopNowGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    gap: 8,
  },
  shopNowText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
});