// CustomModal.js
import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import {COLORS} from '../../Theme/Colors';
import {scale, verticalScale, moderateScale} from '../../utils/Scaling';
import { Fonts } from '../../Theme/Fonts';

export default function CustomModal({visible, onClose, imageSource, message}) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>{message}</Text>
          {imageSource && (
            <Image source={imageSource} style={styles.modalImage} />
          )}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalImage: {
    height: verticalScale(100),
    width: scale(160),
    marginBottom: 20,
  },
  modalText: {
    fontSize: moderateScale(16),
    marginBottom: 20,
    fontFamily:Fonts.Medium,
    textAlign: 'center',
    color: COLORS.ARSENIC,
  },
  closeButton: {
    backgroundColor: COLORS.DODGERBLUE,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: moderateScale(15),
  },
});
