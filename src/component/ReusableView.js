import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import {COLORS} from '../Theme/Colors';
import {scale, verticalScale, moderateScale} from '../utils/Scaling';
import React from 'react';
import { Fonts } from '../Theme/Fonts';
import LinearGradient from 'react-native-linear-gradient';

export default function ReusableView({
  navigation,
  text,
  imageSource,
  imageStyle,
}) {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={navigation}
      activeOpacity={0.8}>
      <LinearGradient
        colors={['#FFFFFF', '#F8F9FA']}
        style={styles.gradientContainer}>
        <View style={styles.imageWrapper}>
          <Image source={imageSource} style={[styles.image, imageStyle]} />
        </View>
        <Text style={styles.text} numberOfLines={2}>{text}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: verticalScale(160),
    marginBottom: verticalScale(15),
    borderRadius: moderateScale(20),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  gradientContainer: {
    flex: 1,
    borderRadius: moderateScale(20),
    padding: moderateScale(15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapper: {
    width: scale(85),
    height: scale(85),
    borderRadius: moderateScale(45),
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(12),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  image: {
    width: scale(45),
    height: scale(45),
    resizeMode: 'contain',
  },
  text: {
    fontSize: moderateScale(13),
    fontFamily: Fonts.Bold,
    color: COLORS.ARSENIC,
    textAlign: 'center',
    lineHeight: moderateScale(18),
  },
});
