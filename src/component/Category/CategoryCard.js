import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {scale, moderateScale} from '../../utils/Scaling';
import {COLORS} from '../../Theme/Colors';
import {Fonts} from '../../Theme/Fonts';

const CARD_MARGIN = 18;
const CARD_WIDTH = (Dimensions.get('window').width - CARD_MARGIN * 3) / 2;

const CategoryCard = ({title, image, bgColor, onPress}) => (
  <TouchableOpacity
    style={[styles.card, {backgroundColor: bgColor}]}
    onPress={onPress}>
    <Text style={styles.cardTitle}>{title}</Text>
    <View style={styles.bgShape} />
    <Image source={image} style={styles.cardImage} resizeMode="contain" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: moderateScale(18),
    padding: scale(10),
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    minHeight: scale(120),
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    overflow: 'hidden',
    position: 'relative',
  },
  cardTitle: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Light,
    color: COLORS.black,
    marginBottom: 10,
    width: scale(100),
  },
  bgShape: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 90,
    height: 90,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderTopLeftRadius: 30,
    zIndex: 0,
  },
  cardImage: {
    width: scale(65),
    height: scale(65),
    alignSelf: 'flex-end',
    zIndex: 1,
    top: 5,
    left: 5,
  },
});

export default CategoryCard;
