import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import {COLORS} from '../../Theme/Colors';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';

const {width} = Dimensions.get('window');

const ShimmerCard = ({type = 'medicine'}) => {
  const shimmerColors = ['#E0E0E0', '#F5F5F5', '#E0E0E0'];

  if (type === 'medicine') {
    return (
      <View style={styles.shimmerCard}>
        <ShimmerPlaceholder
          style={styles.shimmerImage}
          shimmerColors={shimmerColors}
        />
        <View style={styles.shimmerContent}>
          <ShimmerPlaceholder
            style={styles.shimmerTitle}
            shimmerColors={shimmerColors}
          />
          <ShimmerPlaceholder
            style={styles.shimmerPrice}
            shimmerColors={shimmerColors}
          />
          <ShimmerPlaceholder
            style={styles.shimmerButton}
            shimmerColors={shimmerColors}
          />
        </View>
      </View>
    );
  }

  if (type === 'category') {
    return (
      <View style={styles.categoryCard}>
        <ShimmerPlaceholder
          style={styles.categoryImage}
          shimmerColors={shimmerColors}
        />
        <ShimmerPlaceholder
          style={styles.categoryTitle}
          shimmerColors={shimmerColors}
        />
      </View>
    );
  }

  if (type === 'banner') {
    return (
      <View style={styles.bannerCard}>
        <ShimmerPlaceholder
          style={styles.bannerImage}
          shimmerColors={shimmerColors}
        />
      </View>
    );
  }

  if (type === 'doctor') {
    return (
      <View style={styles.doctorCard}>
        <View style={styles.doctorCardContent}>
          <ShimmerPlaceholder
            style={styles.doctorImage}
            shimmerColors={shimmerColors}
          />
          <View style={styles.doctorContent}>
            <ShimmerPlaceholder
              style={styles.doctorName}
              shimmerColors={shimmerColors}
            />
            <ShimmerPlaceholder
              style={styles.doctorRole}
              shimmerColors={shimmerColors}
            />
            <ShimmerPlaceholder
              style={styles.doctorExp}
              shimmerColors={shimmerColors}
            />
            <ShimmerPlaceholder
              style={styles.doctorSpec}
              shimmerColors={shimmerColors}
            />
            <ShimmerPlaceholder
              style={styles.doctorContact}
              shimmerColors={shimmerColors}
            />
          </View>
        </View>
        <ShimmerPlaceholder
          style={styles.doctorBooking}
          shimmerColors={shimmerColors}
        />
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  shimmerCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(10),
    marginHorizontal: scale(16),
    marginVertical: verticalScale(8),
    padding: scale(15),
    elevation: 3,
  },
  shimmerImage: {
    width: scale(80),
    height: scale(100),
    borderRadius: moderateScale(8),
  },
  shimmerContent: {
    flex: 1,
    marginLeft: scale(15),
  },
  shimmerTitle: {
    width: '80%',
    height: scale(20),
    borderRadius: moderateScale(4),
    marginBottom: scale(10),
  },
  shimmerPrice: {
    width: '40%',
    height: scale(16),
    borderRadius: moderateScale(4),
    marginBottom: scale(10),
  },
  shimmerButton: {
    width: '30%',
    height: scale(35),
    borderRadius: moderateScale(4),
  },
  categoryCard: {
    width: (Dimensions.get('window').width - 54) / 2,
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(10),
    padding: scale(10),
    marginBottom: scale(18),
    elevation: 3,
  },
  categoryImage: {
    width: '100%',
    height: scale(120),
    borderRadius: moderateScale(8),
    marginBottom: scale(10),
  },
  categoryTitle: {
    width: '80%',
    height: scale(20),
    borderRadius: moderateScale(4),
  },
  bannerCard: {
    width: width - 32,
    height: scale(185),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: scale(15),
    padding: scale(15),
    borderRadius: scale(10),
    overflow: 'hidden',
  },
  bannerImage: {
    width: width - 32,
    height: '100%',
    borderRadius: scale(10),
  },
  doctorCard: {
    marginVertical: verticalScale(7),
    marginHorizontal: scale(15),
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(8),
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(4),
    paddingBottom: verticalScale(5),
  },
  doctorCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(10),
  },
  doctorImage: {
    width: scale(85),
    height: scale(85),
    borderRadius: moderateScale(45),
    marginRight: scale(16),
  },
  doctorContent: {
    flex: 1,
  },
  doctorName: {
    width: '60%',
    height: scale(20),
    borderRadius: moderateScale(4),
    marginBottom: scale(5),
  },
  doctorRole: {
    width: '40%',
    height: scale(16),
    borderRadius: moderateScale(4),
    marginBottom: scale(5),
  },
  doctorExp: {
    width: '50%',
    height: scale(16),
    borderRadius: moderateScale(4),
    marginBottom: scale(5),
  },
  doctorSpec: {
    width: '70%',
    height: scale(16),
    borderRadius: moderateScale(4),
    marginBottom: scale(5),
  },
  doctorContact: {
    width: '40%',
    height: scale(16),
    borderRadius: moderateScale(4),
  },
  doctorBooking: {
    width: '100%',
    height: scale(40),
    marginTop: scale(5),
    borderTopWidth: 1,
    borderColor: COLORS.AshGray,
  },
});

export default ShimmerCard;
