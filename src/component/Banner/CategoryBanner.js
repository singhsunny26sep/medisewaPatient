import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS} from '../../Theme/Colors';
import {scale} from '../../utils/Scaling';

const CategoryBanner = ({
  title,
  subtitle,
  imageUrl,
  gradientColors = ['#0088cc', '#00b4d8', '#48cae4'],
}) => {
  return (
    <LinearGradient
      colors={gradientColors}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={styles.bannerContainer}>
      <View style={styles.bannerContent}>
        <View style={styles.textContainer}>
          <Text style={styles.bannerTitle}>{title}</Text>
          <Text style={styles.bannerSubtitle}>{subtitle}</Text>
        </View>
        <Image
          source={{uri: imageUrl}}
          style={styles.bannerImage}
          resizeMode="contain"
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    marginHorizontal: scale(15),
    marginVertical: scale(10),
    borderRadius: scale(12),
    overflow: 'hidden',
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(15),
  },
  textContainer: {
    flex: 1,
    paddingRight: scale(10),
  },
  bannerTitle: {
    fontSize: scale(24),
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: scale(5),
  },
  bannerSubtitle: {
    fontSize: scale(14),
    color: COLORS.white,
    opacity: 0.9,
  },
  bannerImage: {
    width: scale(100),
    height: scale(100),
    borderRadius: 8,
  },
});

export default CategoryBanner; 