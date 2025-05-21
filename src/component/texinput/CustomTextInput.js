import React, { useState } from 'react';
import { StyleSheet, TextInput, Text, View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { moderateScale,scale,verticalScale } from '../../utils/Scaling';
import { COLORS } from '../../Theme/Colors';
import { Fonts } from '../../Theme/Fonts';

const CustomTextInput = ({
  label,
  placeholder,
  secureTextEntry,
  keyboardType,
  value,
  onChangeText,
  error,
  maxLength,
  leftIcon,
  placeholderStyle,  
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        {leftIcon && (
          <View style={styles.iconContainer}>
            <Icon name={leftIcon} size={20} color="#000" />
          </View>
        )}
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={COLORS.placeholderColor}  
          style={[styles.input, error ? styles.inputError : null, placeholderStyle, { fontFamily: Fonts.Medium }]}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          value={value}
          onChangeText={onChangeText}
          maxLength={maxLength}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconContainer}>
            <Icon name={showPassword ? 'eye' : 'eye-off'} size={20} color="#000" />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: scale(16),
  },
  label: {
    fontSize: moderateScale(16),
    marginBottom: scale(8),
    color: COLORS.black,
    fontFamily:Fonts.Medium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(10),
  },
  placeholderColor:{
    color:COLORS.black
  },
  input: {
    height: scale(45),
    flex: 1,
    color:COLORS.black,
    top:scale(2)
  },
  inputError: {
    borderColor:COLORS.red,
  },
  iconContainer: {
    paddingHorizontal: scale(5),
  },
  errorText: {
    color: 'red',
    fontSize: moderateScale(12),
    marginTop: scale(4),
    fontFamily: Fonts.Regular
  },
});

export default CustomTextInput;
