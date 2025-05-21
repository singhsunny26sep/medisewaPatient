import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../Theme/Colors';
import { moderateScale, scale } from '../../utils/Scaling';
import { Fonts } from '../../Theme/Fonts';

const CommanCategory = ({ title, imageUrl,onPress }) => {
  return (
    <TouchableOpacity style={styles.touchableOpacity} onPress={onPress}>
      <View style={styles.itemContainer}>
        <Image source={{ uri: imageUrl }} style={styles.itemImage} />
      </View>
      <Text style={styles.itemTitle} numberOfLines={2}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  itemTitle: {
    color: COLORS.black,
    fontSize: moderateScale(11),
    textAlign: 'center',
    width: scale(70),
    fontFamily: Fonts.Medium,
  },
  touchableOpacity: {
    alignItems: 'center',
    marginTop: scale(5),
    marginBottom: scale(4),
  },
  itemContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(8),
    height: scale(70),
    width: scale(70),
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
    margin: scale(3),
  },
  itemImage: {
    width: scale(60),
    height: scale(60),
    borderRadius: moderateScale(8),
  },
});

export default CommanCategory;
