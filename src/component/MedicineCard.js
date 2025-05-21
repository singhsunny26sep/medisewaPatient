import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {COLORS} from '../Theme/Colors';
import {moderateScale, scale} from '../utils/Scaling';
import {Fonts} from '../Theme/Fonts';

const MedicineCard = ({item, cardWidth, onpress}) => {
  return (
    <TouchableOpacity
      onPress={onpress}
      style={[styles.cardContainer, {width: cardWidth}]}>
      <View style={styles.itemContainer}>
        <Image
          source={{uri: item.Img}}
          style={styles.image}
        />
        <View style={styles.discountContainer}>
          <Text style={styles.discountLabel}>{item.off}% OFF</Text>
        </View>
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    alignItems: 'center',
    marginBottom: scale(10),
    paddingHorizontal: scale(6),
    marginLeft:scale(10)
  },
  itemContainer: {
    backgroundColor: '#ADD8E6',
    borderTopRightRadius: moderateScale(50),
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(5),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
  },
  discountContainer: {
    position: 'absolute',
    bottom: -scale(8),
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  discountLabel: {
    backgroundColor: COLORS.red,
    color: COLORS.white,
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    fontSize: scale(10),
    fontFamily: Fonts.Light,
    borderRadius: moderateScale(5),
  },
  image: {
    height: '80%',
    width: '50%',
    borderRadius: moderateScale(5),
    bottom:scale(5),
    right:scale(2)
  },
  titleContainer: {
    width: '100%',
    paddingVertical: scale(5),
    paddingHorizontal: scale(5),
    marginTop: scale(5),
  },
  itemTitle: {
    fontSize: scale(12),
    fontFamily: Fonts.Medium,
    textAlign: 'center',
    color: COLORS.black,
    width: '100%',
  },
});

export default MedicineCard;
