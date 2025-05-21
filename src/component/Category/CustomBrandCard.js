import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
import {COLORS} from '../../Theme/Colors';
import {Fonts} from '../../Theme/Fonts';

const CustomBrandCard = ({item, onAddPress, onOptionPress, onPress}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{uri: item.Img}} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{item.price}</Text>
          <Text style={styles.nonPrice}>{item.nonPrice}</Text>
          <Text style={styles.off}>{item.off}</Text>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
            <Text style={styles.addButtonText}>ADD</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onOptionPress}>
            <Text style={styles.optionText}>+1 Options</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CustomBrandCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(10),
    marginHorizontal: scale(16),
    marginVertical: verticalScale(8),
    padding: scale(10),
    elevation: 3,
  },
  image: {
    width: 80,
    height: 100,
    borderRadius: moderateScale(5),
    marginRight: scale(10),
  },
  details: {
    flex: 1,
  },
  title: {
    fontSize: moderateScale(13),
    color: COLORS.black,
    fontFamily: Fonts.Bold,
    marginBottom: scale(8),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Light,
    color: COLORS.DODGERBLUE,
    marginRight: scale(10),
  },
  nonPrice: {
    fontSize: moderateScale(14),
    color: COLORS.gray,
    textDecorationLine: 'line-through',
    marginRight: moderateScale(10),
    fontFamily: Fonts.Light,
  },
  off: {
    fontSize: moderateScale(14),
    color: COLORS.green,
    fontFamily: Fonts.Light,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(6),
  },
  addButton: {
    backgroundColor: COLORS.airForceBlue,
    paddingVertical: verticalScale(4),
    paddingHorizontal: scale(25),
    borderRadius: moderateScale(5),
    marginRight: scale(10),
  },
  addButtonText: {
    color: COLORS.white,
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(13),
    textAlign: 'center',
  },
  optionText: {
    fontSize: moderateScale(13),
    fontFamily: Fonts.Light,
    color: COLORS.airForceBlue,
  },
});
