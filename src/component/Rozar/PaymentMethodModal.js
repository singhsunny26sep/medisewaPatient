import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {COLORS} from '../../Theme/Colors';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
import {Fonts} from '../../Theme/Fonts';
import CustomRadioButton from '../RadioButton/RadioButton';

const PaymentMethodModal = ({
  visible,
  onClose,
  onProceed,
  selectedMethod,
  onMethodSelect,
  paymentMethods = [],
  title = "Select Payment Method",
  proceedButtonText = "Proceed"
}) => {
  const defaultPaymentMethods = [
    { 
      id: 'online', 
      label: 'Online Payment', 
      description: 'Pay using Razorpay',
      icon: 'credit-card'
    },
    { 
      id: 'offline', 
      label: 'Offline Purchase', 
      description: 'Pay at store',
      icon: 'store'
    },
    { 
      id: 'cod', 
      label: 'Cash on Delivery', 
      description: 'Pay when you receive',
      icon: 'local-shipping'
    },
  ];

  const methodsToUse = paymentMethods.length > 0 ? paymentMethods : defaultPaymentMethods;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          
          {methodsToUse.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentOption,
                selectedMethod === method.id && styles.selectedPaymentOption
              ]}
              onPress={() => onMethodSelect(method.id)}>
              <CustomRadioButton
                checked={selectedMethod === method.id}
                onPress={() => onMethodSelect(method.id)}
              />
              <Icon 
                name={method.icon} 
                size={scale(24)} 
                color={selectedMethod === method.id ? COLORS.DODGERBLUE : COLORS.gray} 
                style={styles.paymentIcon}
              />
              <View style={styles.paymentOptionText}>
                <Text style={styles.paymentOptionLabel}>{method.label}</Text>
                <Text style={styles.paymentOptionDescription}>{method.description}</Text>
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelModalButton]}
              onPress={onClose}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.proceedModalButton]}
              onPress={onProceed}>
              <Text style={styles.modalButtonText}>{proceedButtonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(12),
    padding: scale(20),
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontFamily: Fonts.Medium,
    color: COLORS.black,
    marginBottom: verticalScale(20),
    textAlign: 'center',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(10),
    marginVertical: verticalScale(5),
    borderRadius: moderateScale(8),
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  selectedPaymentOption: {
    borderColor: COLORS.DODGERBLUE,
    backgroundColor: COLORS.lightBlue,
  },
  paymentIcon: {
    marginLeft: scale(10),
    marginRight: scale(10),
  },
  paymentOptionText: {
    flex: 1,
  },
  paymentOptionLabel: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Medium,
    color: COLORS.black,
  },
  paymentOptionDescription: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Regular,
    color: COLORS.gray,
    marginTop: verticalScale(2),
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: verticalScale(20),
  },
  modalButton: {
    flex: 1,
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelModalButton: {
    backgroundColor: COLORS.red,
    marginRight: scale(10),
  },
  proceedModalButton: {
    backgroundColor: COLORS.green,
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: moderateScale(16),
    fontFamily: Fonts.Medium,
  },
});

export default PaymentMethodModal;