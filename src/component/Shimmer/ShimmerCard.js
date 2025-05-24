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

  if (type === 'order') {
    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <ShimmerPlaceholder
            style={styles.orderIcon}
            shimmerColors={shimmerColors}
          />
          <ShimmerPlaceholder
            style={styles.orderTitle}
            shimmerColors={shimmerColors}
          />
        </View>
        <View style={styles.orderInfo}>
          <ShimmerPlaceholder
            style={styles.orderInfoLine}
            shimmerColors={shimmerColors}
          />
          <ShimmerPlaceholder
            style={styles.orderInfoLine}
            shimmerColors={shimmerColors}
          />
          <ShimmerPlaceholder
            style={styles.orderInfoLine}
            shimmerColors={shimmerColors}
          />
        </View>
        <View style={styles.orderDate}>
          <ShimmerPlaceholder
            style={styles.orderDateLine}
            shimmerColors={shimmerColors}
          />
        </View>
      </View>
    );
  }

  if (type === 'appointment') {
    return (
      <View style={styles.appointmentCard}>
        <View style={styles.appointmentHeader}>
          <ShimmerPlaceholder
            style={styles.appointmentImage}
            shimmerColors={shimmerColors}
          />
          <View style={styles.appointmentHeaderContent}>
            <ShimmerPlaceholder
              style={styles.appointmentName}
              shimmerColors={shimmerColors}
            />
            <ShimmerPlaceholder
              style={styles.appointmentClinic}
              shimmerColors={shimmerColors}
            />
          </View>
        </View>

        <View style={styles.appointmentDivider} />

        <View style={styles.appointmentInfo}>
          <ShimmerPlaceholder
            style={styles.appointmentInfoLine}
            shimmerColors={shimmerColors}
          />
          <ShimmerPlaceholder
            style={styles.appointmentInfoLine}
            shimmerColors={shimmerColors}
          />
          <ShimmerPlaceholder
            style={styles.appointmentInfoLine}
            shimmerColors={shimmerColors}
          />
          <ShimmerPlaceholder
            style={styles.appointmentInfoLine}
            shimmerColors={shimmerColors}
          />
          <ShimmerPlaceholder
            style={styles.appointmentInfoLine}
            shimmerColors={shimmerColors}
          />
        </View>
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
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(14),
    marginVertical: verticalScale(5),
    padding: scale(15),
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(15),
  },
  orderIcon: {
    width: scale(35),
    height: scale(35),
    borderRadius: moderateScale(20),
    marginRight: scale(15),
  },
  orderTitle: {
    width: '85%',
    height: scale(25),
    borderRadius: moderateScale(6),
  },
  orderInfo: {
    marginBottom: scale(15),
  },
  orderInfoLine: {
    width: '100%',
    height: scale(20),
    borderRadius: moderateScale(6),
    marginBottom: scale(10),
  },
  orderDate: {
    marginTop: scale(15),
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: scale(15),
  },
  orderDateLine: {
    width: '60%',
    height: scale(20),
    borderRadius: moderateScale(6),
  },
  appointmentCard: {
    backgroundColor: COLORS.white,
    padding: moderateScale(15),
    borderRadius: moderateScale(12),
    marginBottom: scale(16),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentImage: {
    width: scale(60),
    height: scale(60),
    borderRadius: moderateScale(35),
  },
  appointmentHeaderContent: {
    flex: 1,
    marginLeft: scale(10),
  },
  appointmentName: {
    width: '70%',
    height: scale(20),
    borderRadius: moderateScale(4),
    marginBottom: scale(8),
  },
  appointmentClinic: {
    width: '90%',
    height: scale(16),
    borderRadius: moderateScale(4),
  },
  appointmentDivider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: verticalScale(10),
  },
  appointmentInfo: {
    gap: scale(8),
  },
  appointmentInfoLine: {
    width: '100%',
    height: scale(16),
    borderRadius: moderateScale(4),
  },
});

export default ShimmerCard;
