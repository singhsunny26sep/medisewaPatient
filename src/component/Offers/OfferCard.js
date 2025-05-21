import React from 'react';
import {View, Text, StyleSheet, FlatList, Image, TouchableOpacity} from 'react-native';
import {COLORS} from '../../Theme/Colors';
import {moderateScale, scale} from '../../utils/Scaling';
import {Fonts} from '../../Theme/Fonts';

const OfferCard = ({item,onPress,AddCart}) => {
  return (
    <>
    <TouchableOpacity style={styles.card}onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={{uri: item.image}}
          style={styles.image}
        />
      </View>
      <View style={styles.contentContainer}>
        <Text numberOfLines={2} style={styles.productTitle}>
          {item.title}
        </Text>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.discountedPrice}>₹{item.discountedPrice}</Text>
          <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
          <Text style={styles.discount}>{item.discount}</Text>
        </View>
        <View style={styles.deliveryContainer}>
          <Text style={styles.deliveryTime}>{item.deliveryTime}</Text>
        </View>
        <TouchableOpacity style={styles.addButton}onPress={AddCart}>
          <Text style={styles.addButtonText}>ADD</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
    </>
    
  );
};

export default OfferCard; 

const styles = StyleSheet.create({
  container: {
    marginVertical: scale(10),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(15),
    marginBottom: scale(10),
  },
  title: {
    fontSize: moderateScale(18),
    fontFamily: Fonts.Bold,
    color: COLORS.black,
  },

  card: {
    width: scale(170),
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(10),
    marginRight: scale(15),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
    overflow: 'hidden',
    marginBottom: scale(5),
    left:2,
  },
  imageContainer: {
    height: scale(100),
    backgroundColor: '#F5F5F5',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  contentContainer: {
    padding: scale(8),
  },
  productTitle: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Medium,
    color: COLORS.black,
    marginBottom: scale(2),
  },
  quantity: {
    fontSize: moderateScale(12),
    color: COLORS.ARSENIC,
    marginBottom: scale(4),
    fontFamily: Fonts.Regular,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(4),
  },
  discountedPrice: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Bold,
    color: COLORS.black,
    marginRight: scale(8),
  },
  originalPrice: {
    fontSize: moderateScale(14),
    color: COLORS.ARSENIC,
    textDecorationLine: 'line-through',
    marginRight: scale(8),
    fontFamily: Fonts.Regular,
  },
  discount: {
    fontSize: moderateScale(12),
    color: COLORS.red,
    fontFamily: Fonts.Medium,
  },
  deliveryContainer: {
    marginBottom: scale(5),
  },
  deliveryTime: {
    fontSize: moderateScale(12),
    color: COLORS.ARSENIC,
    fontFamily: Fonts.Regular,
  },
  addButton: {
    backgroundColor: COLORS.DODGERBLUE,
    paddingVertical: scale(5),
    borderRadius: moderateScale(5),
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: moderateScale(14),
    fontFamily: Fonts.Medium,
  },
});

