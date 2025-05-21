// CustomRadioButton.js
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {scale, verticalScale, moderateScale} from '../utils/Scaling';
import {COLORS} from '../Theme/Colors';
import { Fonts } from '../Theme/Fonts';
export default function CustomRadioButton({
  options,
  selectedValue,
  onValueChange,
}) {
  return (
    <View style={styles.radioContainer}>
      {options.map(option => (
        <TouchableOpacity
          key={option.value}
          style={styles.radioButton}
          onPress={() => onValueChange(option.value)}>
          <View style={styles.radioCircle}>
            {selectedValue === option.value && (
              <View style={styles.selectedRb} />
            )}
          </View>
          <Text style={styles.radioText}>{option.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: scale(10),
  },
  radioCircle: {
    height: scale(20),
    width: scale(20),
    borderRadius: scale(10),
    borderWidth: 2,
    borderColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRb: {
    width: scale(10),
    height: scale(10),
    borderRadius: scale(10),
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  radioText: {
    marginLeft: scale(5),
    fontSize: moderateScale(16),
    color: COLORS.DODGERBLUE,
    fontFamily:Fonts.Medium,
    top:scale(2)
  },
});
