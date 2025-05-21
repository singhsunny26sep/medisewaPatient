import React from 'react';
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
import Icon from 'react-native-vector-icons/MaterialIcons';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
import {Fonts} from '../../Theme/Fonts';
import {useRoute} from '@react-navigation/native';
import {Instance} from '../../api/Instance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import usePhonePePayment from '../../component/PhonePay/usePhonePePayment';
import ToastMessage from '../../component/ToastMessage/ToastMessage';

export default function Pre_View_Order({navigation}) {
  const {submitHandler} = usePhonePePayment();

  const route = useRoute('');
  const {cartData, totalPrice} = route.params;

  // const ConfirmOrderHandler = async () => {
  //   try {
  //     const token = await AsyncStorage.getItem('userToken');

  //     for (const item of cartData) {
  //       const medicine = item.medicineId;
  //       const sizeId = Array.isArray(item?.sizeId)
  //         ? item?.sizeId[0]?._id
  //         : item?.sizeId;
  //       const quantity = item.quantity;
  //       const price = medicine.price;
  //       const discount = medicine?.discount || 0;
  //       const discountType = medicine?.discountType || 'percentage';

  //       let priceAtSale = 0;

  //       if (discount > 0) {
  //         if (discountType === 'percentage') {
  //           priceAtSale =
  //             quantity * price - (quantity * price * discount) / 100;
  //         } else {
  //           priceAtSale = quantity * (price - discount);
  //         }
  //       } else {
  //         priceAtSale = quantity * price;
  //       }

  //       const payload = {
  //         sizeId: '680f3707b34b5e41f7f542e8',
  //         quntity: '1',
  //         priceAtSale: priceAtSale.toFixed(2),
  //       };

  //       console.log('Sending order item:', payload);

  //       const response = await Instance.post(
  //         'api/v1/selles/sellSingle',
  //         payload,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         },
  //       );

  //       console.log('Order response:', response.data);
  //     }

  //     const paymentResponse = await submitHandler(totalPrice);

  //     if (paymentResponse.status === 'SUCCESS') {
  //       alert('Payment successful via ' + paymentResponse.paymentMethod);
  //       navigation.goBack();
  //     } else {
  //       alert('Order placed but payment failed. You can retry from Orders.');
  //     }
  //   } catch (error) {
  //     console.error(
  //       'Error confirming order:',
  //       error?.response?.data || error.message,
  //     );
  //     alert('Failed to confirm order.');
  //   }
  // };

const ConfirmOrderHandler = async () => {
  try {
    const staticAmount = 100; // ₹100 static amount

    const paymentResponse = await submitHandler(staticAmount);

    if (paymentResponse.status === 'SUCCESS') {
      alert('Payment successful via ' + paymentResponse.paymentMethod);
      navigation.goBack();
    } else {
      alert('Payment failed. Please try again.');
    }
  } catch (error) {
    console.error('Payment Error:', error);
    alert('Something went wrong while processing payment.');
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
        <TouchableOpacity style={[styles.button, styles.cancelButton]}>
          <Text style={styles.buttonText}>Cancel Order</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.confirmButton]}
          onPress={ConfirmOrderHandler}>
          <Text style={styles.buttonText}>Confirm Order</Text>
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
