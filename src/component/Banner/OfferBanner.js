import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {COLORS} from '../../Theme/Colors';
import {scale} from '../../utils/Scaling';

const OfferBanner = ({
  offerText,
  subText,
  paymentLogos = [
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0MuXXvowCeVggXbyeWUoPk6lYBenZYRHh0A&s',
    'https://www.eqimg.com/images/2024/06102024-image5-thumb-equitymaster.jpg',
    'https://i.pinimg.com/736x/db/42/53/db4253052cfc0f80ac281486c19f9d57.jpg',
  ],
}) => {
  return (
    <View style={styles.offerContainer}>
      <View style={styles.offerTextContainer}>
        <Text style={styles.offerTitle}>{offerText}</Text>
        <Text style={styles.offerSubtext}>{subText}</Text>
      </View>
      <View style={styles.paymentLogos}>
        {paymentLogos.map((logo, index) => (
          <Image
            key={index}
            source={{uri: logo}}
            style={styles.paymentLogo}
            resizeMode="contain"
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  offerContainer: {
    marginHorizontal: scale(15),
    marginVertical: scale(10),
    padding: scale(15),
    backgroundColor: COLORS.white,
    borderRadius: scale(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  offerTextContainer: {
    flex: 1,
  },
  offerTitle: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: '#333',
  },
  offerSubtext: {
    fontSize: scale(12),
    color: '#666',
    marginTop: scale(2),
  },
  paymentLogos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  paymentLogo: {
    width: scale(40),
    height: scale(25),
  },
});

export default OfferBanner; 