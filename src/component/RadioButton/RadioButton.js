import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; 

const CustomRadioButton = ({ checked, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.radioContainer}>
      <Icon
        name={checked ? 'radio-button-checked' : 'radio-button-unchecked'} 
        size={24} 
        color={checked ? '#0A3A67' : '#B0B0B0'} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  radioContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
});

export default CustomRadioButton;
