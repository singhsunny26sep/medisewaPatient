import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { COLORS } from '../../Theme/Colors';
import { Fonts } from '../../Theme/Fonts';
import { moderateScale, scale, verticalScale } from '../../utils/Scaling';

export default function CustomDropdown({
  data,
  value,
  onChange,
  placeholder = 'Select item',
  style,
  containerStyle,
  ...rest
}) {
  const [isFocus, setIsFocus] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <Dropdown
        style={[styles.dropdown, isFocus && styles.focusedDropdown, style]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        data={data}
        maxHeight={5100}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? placeholder : '...'}
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={item => {
          onChange(item.value);
          setIsFocus(false);
        }}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  },
  dropdown: {
    height: scale(60),
    borderColor: COLORS.DODGERBLUE,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: scale(10),
    backgroundColor: COLORS.white,
  },
  focusedDropdown: {
    borderColor: COLORS.DODGERBLUE,
  },
  placeholderStyle: {
    fontSize: moderateScale(15),
    color: 'grey',
    fontFamily: Fonts.Medium,
  },
  selectedTextStyle: {
    fontSize: moderateScale(15),
    color: COLORS.black,
    fontFamily: Fonts.Medium,
  },
});
