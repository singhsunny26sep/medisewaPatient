import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {Container} from '../../component/Container/Container';
import {COLORS} from '../../Theme/Colors';
import CustomHeader from '../../component/header/CustomHeader';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
import {Fonts} from '../../Theme/Fonts';
import {useRoute} from '@react-navigation/native';
import {Instance} from '../../api/Instance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ToastMessage from '../../component/ToastMessage/ToastMessage';
import usePhonePePayment from '../../component/PhonePay/usePhonePePayment';

export default function Pre_View_Order({navigation}) {
  const route = useRoute('');
  const {cartData, totalPrice} = route.params;

  const [isLoading, setIsLoading] = useState(false);
  const {submitHandler} = usePhonePePayment();

  const ConfirmOrderHandler = async () => {
  try {
    setIsLoading(true);

    const paymentResult = await submitHandler(totalPrice);

    if (paymentResult.status === 'SUCCESS') {
      const token = await AsyncStorage.getItem('userToken');

      for (const item of cartData) {
        const medicine = item.medicineId;
        const quantity = item.quantity;

        const selectedSize =
          medicine.size.find(s => s.size === '400' && s.unit === 'ml') ||
          medicine.size[0];

        if (!selectedSize) {
          console.warn('No valid size found for medicine:', medicine.title);
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
          paymentId: paymentResult.transactionId,
          paymentMethod: paymentResult.paymentMethod,
        };

        console.log('Sending order item:', payload);

        const response = await Instance.post('api/v1/selles/sellSingle', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Order response:', response.data);
      }

      ToastMessage('Order placed successfully!');
      navigation.goBack();
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

  return (
    <Container
      statusBarStyle={'dark-content'}
      statusBarBackgroundColor={COLORS.white}
      backgroundColor={COLORS.white}>
      <CustomHeader title="Order Details" navigation={navigation} />

      <FlatList
        data={cartData}
        keyExtractor={item => item._id.toString()}
        contentContainerStyle={styles.scrollContainer}
        renderItem={({item}) => {
          const medicine = item.medicineId;
          const user = item.userId;
          return (
            <View key={item._id} style={styles.card}>
              <Image
                source={{uri: medicine.images?.[0]?.image}}
                style={styles.productImage}
              />
              <View style={styles.detailsContainer}>
                <Text style={styles.productTitle}>{medicine.title}</Text>

                <View style={styles.row}>
                  <Text style={styles.productText}>
                    ₹{medicine.price} x {item.quantity}
                  </Text>
                  <Text style={styles.productText}>Subtotal:₹{totalPrice}</Text>
                </View>

                <View style={styles.userInfoContainer}>
                  <Icon name="person" size={24} color={COLORS.DODGERBLUE} />
                  <Text style={styles.userInfoText}>{user?.name || 'N/A'}</Text>
                </View>
                <View style={styles.userInfoContainer}>
                  <Icon name="phone" size={24} color={COLORS.DODGERBLUE} />
                  <Text style={styles.userInfoText}>{user?.mobile}</Text>
                </View>
                <View style={styles.userInfoContainer}>
                  <Icon name="email" size={24} color={COLORS.DODGERBLUE} />
                  <Text style={styles.userInfoText}>{user?.email}</Text>
                </View>
                <View style={styles.userInfoContainer}>
                  <Icon
                    name="location-on"
                    size={24}
                    color={COLORS.DODGERBLUE}
                  />
                  <Text style={styles.userInfoText}>{user?.address}</Text>
                </View>
              </View>
            </View>
          );
        }}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Cancel Order</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.confirmButton]}
          onPress={ConfirmOrderHandler}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>Confirm Order</Text>
          )}
        </TouchableOpacity>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: scale(20),
    paddingHorizontal: scale(15),
  },
  card: {
    marginVertical: verticalScale(10),
    borderRadius: moderateScale(8),
    padding: scale(20),
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: scale(200),
    marginBottom: 15,
    resizeMode: 'contain',
  },
  detailsContainer: {
    flex: 1,
  },
  productTitle: {
    fontSize: moderateScale(20),
    fontFamily: Fonts.Medium,
    color: COLORS.black,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: verticalScale(8),
  },
  productText: {
    fontSize: moderateScale(15),
    color: COLORS.TEAL,
    fontFamily: Fonts.Light,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: verticalScale(5),
  },
  userInfoText: {
    fontSize: moderateScale(15),
    marginLeft: 10,
    color: COLORS.black,
    fontFamily: Fonts.Regular,
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(10),
    backgroundColor: COLORS.white,
  },
  button: {
    flex: 1,
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.red,
    marginRight: scale(10),
  },
  confirmButton: {
    backgroundColor: COLORS.green,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: moderateScale(16),
    fontFamily: Fonts.Medium,
  },
});
