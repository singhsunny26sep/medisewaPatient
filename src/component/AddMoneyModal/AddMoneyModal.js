import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {COLORS} from '../../Theme/Colors';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
import {Fonts} from '../../Theme/Fonts';
import {
  ADD_MONEY_TO_WALLET,
  VERIFY_WALLET_PAYMENT,
} from '../../api/Api_Controller';
import useRazorpayPayment from '../Rozar/useRazorpayPayment';
import ToastMessage from '../ToastMessage/ToastMessage';
import strings from '../../../localization';

const AddMoneyModal = ({visible, onClose, onSuccess, balance = 0}) => {
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const [toastConfig, setToastConfig] = useState({type: '', message: ''});
  const {submitHandler, loading: paymentLoading} = useRazorpayPayment();

  useEffect(() => {
    if (!visible) {
      setAmount('');
      setAmountError('');
      setToastConfig({type: '', message: ''});
    }
  }, [visible]);
  useEffect(() => {
    if (!visible) {
      setAmount('');
      setAmountError('');
      setToastConfig({type: '', message: ''});
    }
  }, [visible]);

  const validateForm = () => {
    let isValid = true;
    setAmountError('');

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setAmountError(strings.InvalidAmount);
      isValid = false;
    } else if (parsedAmount < 100) {
      setAmountError(strings.MinimumAmount);
      isValid = false;
    }

    return isValid;
  };

  const handleProceed = async () => {
    if (!validateForm()) {
      return;
    }

    const parsedAmount = parseFloat(amount);

    try {
      const paymentResult = await submitHandler(parsedAmount, {
        description: 'Add Money to MediSeva Wallet',
        appName: 'MediSeva',
      });

      if (paymentResult.status === 'SUCCESS') {
        try {
          const verifyResponse = await VERIFY_WALLET_PAYMENT({
            razorpay_signature: paymentResult.razorpaySignature || '',
            razorpay_order_id: paymentResult.razorpayOrderId || '',
            razorpay_payment_id: paymentResult.paymentId,
            transactionId:
              paymentResult.transactionId || paymentResult.paymentId,
            pay_amount: parsedAmount,
          });

          if (verifyResponse?.success || verifyResponse?.status === 'SUCCESS') {
            setToastConfig({
              type: 'success',
              message: strings.AddMoneySuccess,
            });
            if (onSuccess) {
              onSuccess(parsedAmount, paymentResult.paymentId);
            }
            onClose();
          } else {
            setToastConfig({
              type: 'danger',
              message: verifyResponse?.message || strings.AddMoneyFailed,
            });
          }
        } catch (verifyError) {
          setToastConfig({
            type: 'danger',
            message: strings.AddMoneyFailed,
          });
        }
      } else if (paymentResult.status === 'CANCELLED') {
        setToastConfig({
          type: 'warning',
          message: 'Payment cancelled',
        });
      } else {
        setToastConfig({
          type: 'danger',
          message: strings.AddMoneyFailed,
        });
      }
    } catch (error) {
      setToastConfig({
        type: 'danger',
        message: strings.AddMoneyFailed,
      });
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.overlay} />
        <ScrollView
          contentContainerStyle={styles.modalScrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.modalContent}>
            <View style={styles.handle} />
            <Text style={styles.modalTitle}>{strings.AddMoney}</Text>

            <View style={styles.section}>
              <Text style={styles.label}>{strings.EnterAmount}</Text>
              <View
                style={[
                  styles.amountInputWrapper,
                  amountError ? styles.inputError : null,
                ]}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder={strings.AmountPlaceholder}
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={text => {
                    setAmount(text.replace(/[^0-9.]/g, ''));
                    setAmountError('');
                  }}
                  maxLength={10}
                />
              </View>
              {amountError ? (
                <Text style={styles.errorText}>{amountError}</Text>
              ) : null}

              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>{strings.Balance}: </Text>
                <Text style={styles.balanceValue}>₹{balance.toFixed(2)}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.proceedButton,
                paymentLoading && styles.disabledButton,
              ]}
              onPress={handleProceed}
              disabled={paymentLoading}
              activeOpacity={0.8}>
              <Text style={styles.proceedButtonText}>
                {paymentLoading ? 'Processing...' : strings.ProceedToPay}
              </Text>
              {!paymentLoading && (
                <Icon
                  name="arrow-forward"
                  size={moderateScale(18)}
                  color="#FFF"
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.8}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ToastMessage type={toastConfig.type} message={toastConfig.message} />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(30),
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(20),
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(24),
    maxHeight: '90%',
  },
  handle: {
    width: scale(40),
    height: verticalScale(4),
    backgroundColor: COLORS.gray,
    borderRadius: moderateScale(2),
    alignSelf: 'center',
    marginBottom: verticalScale(16),
  },
  modalTitle: {
    fontSize: moderateScale(20),
    fontFamily: Fonts.SemiBold,
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: verticalScale(20),
  },
  section: {
    marginBottom: verticalScale(20),
  },
  label: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Medium,
    color: COLORS.black,
    marginBottom: verticalScale(8),
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(16),
    backgroundColor: '#FAFAFA',
  },
  currencySymbol: {
    fontSize: moderateScale(24),
    fontFamily: Fonts.SemiBold,
    color: COLORS.DODGERBLUE,
    marginRight: scale(8),
  },
  amountInput: {
    flex: 1,
    fontSize: moderateScale(22),
    fontFamily: Fonts.SemiBold,
    color: COLORS.black,
    paddingVertical: verticalScale(14),
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    fontSize: moderateScale(14),
    fontFamily: Fonts.Regular,
    color: COLORS.black,
    backgroundColor: '#FAFAFA',
  },
  rowInputs: {
    flexDirection: 'row',
    marginTop: verticalScale(10),
  },
  halfInput: {
    flex: 1,
  },
  inputError: {
    borderColor: COLORS.red,
  },
  errorText: {
    fontSize: moderateScale(12),
    fontFamily: Fonts.Regular,
    color: COLORS.red,
    marginTop: verticalScale(4),
  },
  balanceRow: {
    flexDirection: 'row',
    marginTop: verticalScale(8),
  },
  balanceLabel: {
    fontSize: moderateScale(13),
    fontFamily: Fonts.Regular,
    color: COLORS.lightGrey,
  },
  balanceValue: {
    fontSize: moderateScale(13),
    fontFamily: Fonts.SemiBold,
    color: COLORS.DODGERBLUE,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(12),
    marginVertical: verticalScale(4),
    borderRadius: moderateScale(12),
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
  },
  selectedPaymentOption: {
    borderColor: COLORS.DODGERBLUE,
    backgroundColor: COLORS.lightTurquoise,
  },
  paymentOptionText: {
    flex: 1,
  },
  paymentOptionLabel: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Medium,
    color: COLORS.black,
  },
  paymentOptionDescription: {
    fontSize: moderateScale(12),
    fontFamily: Fonts.Regular,
    color: COLORS.lightGrey,
    marginTop: verticalScale(2),
  },
  proceedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.DODGERBLUE,
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    marginTop: verticalScale(16),
    shadowColor: COLORS.DODGERBLUE,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: COLORS.lightGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  proceedButtonText: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.SemiBold,
    color: COLORS.white,
    marginRight: scale(8),
  },
  cancelButton: {
    paddingVertical: verticalScale(14),
    alignItems: 'center',
    marginTop: verticalScale(10),
  },
  cancelButtonText: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Medium,
    color: COLORS.red,
  },
});

export default AddMoneyModal;
