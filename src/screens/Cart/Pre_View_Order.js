import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import { COLORS } from '../../Theme/Colors';
import { moderateScale, scale, verticalScale } from '../../utils/Scaling';
import { Fonts } from '../../Theme/Fonts';
import { useRoute } from '@react-navigation/native';
import { Instance } from '../../api/Instance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ToastMessage from '../../component/ToastMessage/ToastMessage';
import useRazorpayPayment from '../../component/Rozar/useRazorpayPayment';
import PaymentMethodModal from '../../component/Rozar/PaymentMethodModal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

export default function Pre_View_Order({ navigation }) {
  const route = useRoute();
  const { cartData, totalPrice } = route.params;

  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('online');
  const { submitHandler: razorpaySubmitHandler } = useRazorpayPayment();

  const handleConfirmOrderPress = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentMethodSelect = (methodId) => {
    setSelectedPaymentMethod(methodId);
  };

  const handleProceedWithPayment = async () => {
    setShowPaymentModal(false);
    
    if (selectedPaymentMethod === 'online') {
      await ConfirmOrderHandler();
    } else if (selectedPaymentMethod === 'offline') {
      await processOfflineOrder();
    } else if (selectedPaymentMethod === 'cod') {
      await processCODOrder();
    }
  };

  const processOfflineOrder = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('userToken');

      for (const item of cartData) {
        const medicine = item.medicineId;
        const quantity = item.quantity;

        const selectedSize =
          medicine.size.find(s => s.size === '400' && s.unit === 'ml') ||
          medicine.size[0];

        if (!selectedSize) {
          ToastMessage(`No size found for ${medicine.title}`);
          continue;
        }

        const sizeId = '680f3707b34b5e41f7f542e6';
        const price = selectedSize.price;
        const discount = selectedSize.discount || 0;
        const discountType = selectedSize.discountType || 'percentage';

        let priceAtSale = 0;

        if (discount > 0) {
          if (discountType === 'percentage') {
            priceAtSale = quantity * price - (quantity * price * discount) / 100;
          } else {
            priceAtSale = quantity * (price - discount);
          }
        } else {
          priceAtSale = quantity * price;
        }

        const payload = {
          sizeId: sizeId,
          quntity: quantity.toString(),
          priceAtSale: priceAtSale.toFixed(2),
          paymentId: 'offline_payment',
          paymentMethod: 'offline',
        };

        await Instance.post('api/v1/selles/sellSingle', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      ToastMessage('Offline order placed successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error processing offline order:', error?.response?.data || error.message);
      ToastMessage('Failed to place offline order.');
    } finally {
      setIsLoading(false);
    }
  };

  const processCODOrder = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('userToken');

      for (const item of cartData) {
        const medicine = item.medicineId;
        const quantity = item.quantity;

        const selectedSize =
          medicine.size.find(s => s.size === '400' && s.unit === 'ml') ||
          medicine.size[0];

        if (!selectedSize) {
          ToastMessage(`No size found for ${medicine.title}`);
          continue;
        }

        const sizeId = '680f3707b34b5e41f7f542e6';
        const price = selectedSize.price;
        const discount = selectedSize.discount || 0;
        const discountType = selectedSize.discountType || 'percentage';

        let priceAtSale = 0;

        if (discount > 0) {
          if (discountType === 'percentage') {
            priceAtSale = quantity * price - (quantity * price * discount) / 100;
          } else {
            priceAtSale = quantity * (price - discount);
          }
        } else {
          priceAtSale = quantity * price;
        }

        const payload = {
          sizeId: sizeId,
          quntity: quantity.toString(),
          priceAtSale: priceAtSale.toFixed(2),
          paymentId: 'cod_payment',
          paymentMethod: 'cod',
        };

        await Instance.post('api/v1/selles/sellSingle', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      ToastMessage('Cash on Delivery order placed successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error processing COD order:', error?.response?.data || error.message);
      ToastMessage('Failed to place COD order.');
    } finally {
      setIsLoading(false);
    }
  };

  const ConfirmOrderHandler = async () => {
    try {
      setIsLoading(true);

      const paymentResult = await razorpaySubmitHandler(
        totalPrice,
        {
          description: 'Medicine Purchase',
          appName: 'Medisewa',
          order_type: 'medicine_order',
          items_count: cartData.length.toString()
        }
      );

      if (paymentResult.status === 'SUCCESS') {
        const token = await AsyncStorage.getItem('userToken');

        for (const item of cartData) {
          const medicine = item.medicineId;
          const quantity = item.quantity;

          const selectedSize =
            medicine.size.find(s => s.size === '400' && s.unit === 'ml') ||
            medicine.size[0];

          if (!selectedSize) {
            ToastMessage(`No size found for ${medicine.title}`);
            continue;
          }

          const sizeId = '680f3707b34b5e41f7f542e6';
          const price = selectedSize.price;
          const discount = selectedSize.discount || 0;
          const discountType = selectedSize.discountType || 'percentage';

          let priceAtSale = 0;

          if (discount > 0) {
            if (discountType === 'percentage') {
              priceAtSale = quantity * price - (quantity * price * discount) / 100;
            } else {
              priceAtSale = quantity * (price - discount);
            }
          } else {
            priceAtSale = quantity * price;
          }

          const payload = {
            sizeId: sizeId,
            quntity: quantity.toString(),
            priceAtSale: priceAtSale.toFixed(2),
            paymentId: paymentResult.paymentId,
            paymentMethod: 'razorpay',
          };

          await Instance.post('api/v1/selles/sellSingle', payload, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }

        ToastMessage('Order placed successfully!');
        navigation.goBack();
      } else if (paymentResult.status === 'CANCELLED') {
        ToastMessage('Payment cancelled by user');
      } else {
        ToastMessage('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Error confirming order:', error?.response?.data || error.message);
      ToastMessage('Failed to confirm order.');
    } finally {
      setIsLoading(false);
    }
  };

  const OrderItem = ({ item }) => {
    const medicine = item.medicineId;
    const user = item.userId;
    const itemTotal = (medicine?.price || 0) * (item.quantity || 1);

    return (
      <View style={styles.orderCard}>
        <View style={styles.cardHeader}>
          <View style={styles.productImageWrapper}>
            {medicine?.images?.[0]?.image ? (
              <Image source={{ uri: medicine.images[0].image }} style={styles.productImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="medical-outline" size={30} color="#3B82F6" />
              </View>
            )}
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productTitle} numberOfLines={2}>
              {medicine?.title || 'Medicine Product'}
            </Text>
            <Text style={styles.productVariant}>
              {medicine?.quntity || 'Standard'} ML • Qty: {item.quantity}
            </Text>
          </View>
        </View>

        <View style={styles.priceBreakdown}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Price per unit</Text>
            <Text style={styles.priceValue}>₹{medicine?.price || 0}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Quantity</Text>
            <Text style={styles.priceValue}>x {item.quantity}</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>₹{itemTotal}</Text>
          </View>
        </View>

        <View style={styles.deliveryInfo}>
          <Text style={styles.deliveryTitle}>Delivery Address</Text>
          <View style={styles.addressInfo}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={styles.addressText}>
              {user?.address || 'No address provided'}
            </Text>
          </View>
          <View style={styles.contactInfo}>
            <Ionicons name="person-outline" size={14} color="#9CA3AF" />
            <Text style={styles.contactText}>{user?.name || 'N/A'}</Text>
            <Ionicons name="call-outline" size={14} color="#9CA3AF" style={styles.contactIcon} />
            <Text style={styles.contactText}>{user?.mobile || 'N/A'}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Summary</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Order Items List */}
      <FlatList
        data={cartData}
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <OrderItem item={item} />}
        ListHeaderComponent={
          <View style={styles.deliveryEstimate}>
            <View style={styles.estimateBadge}>
              <Ionicons name="time-outline" size={16} color="#10B981" />
              <Text style={styles.estimateText}>Estimated Delivery: 3-5 days</Text>
            </View>
          </View>
        }
      />

      {/* Order Summary Footer */}
      <View style={styles.footer}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{totalPrice}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>₹40</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>GST (5%)</Text>
            <Text style={styles.summaryValue}>₹{(totalPrice * 0.05).toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>₹{(totalPrice + 40 + (totalPrice * 0.05)).toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={handleConfirmOrderPress}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.confirmGradient}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Text style={styles.confirmBtnText}>Confirm Order</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFF" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Payment Method Modal */}
      <PaymentMethodModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onProceed={handleProceedWithPayment}
        selectedMethod={selectedPaymentMethod}
        onMethodSelect={handlePaymentMethodSelect}
        proceedButtonText="Proceed to Payment"
      />
    </View>
  );
}



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
    paddingTop: 20,
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
  placeholder: {
    width: 40,
  },
  listContent: {
    padding: 16,
    paddingBottom: 180,
  },
  deliveryEstimate: {
    marginBottom: 16,
  },
  estimateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 6,
  },
  estimateText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '500',
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  productImageWrapper: {
    marginRight: 14,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    lineHeight: 22,
  },
  productVariant: {
    fontSize: 13,
    color: '#6B7280',
  },
  priceBreakdown: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  priceValue: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  deliveryInfo: {
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  deliveryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 10,
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  contactIcon: {
    marginLeft: 8,
  },
  contactText: {
    fontSize: 12,
    color: '#6B7280',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  grandTotalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  grandTotalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmBtn: {
    flex: 2,
    borderRadius: 14,
    overflow: 'hidden',
  },
  confirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});

// Add Platform import
import { Platform } from 'react-native';