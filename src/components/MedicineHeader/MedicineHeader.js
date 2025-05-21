import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
} from 'react-native';
import {COLORS} from '../../Theme/Colors';
import {scale, verticalScale, moderateScale} from '../../utils/Scaling';
import {Fonts} from '../../Theme/Fonts';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import LinearGradient from 'react-native-linear-gradient';

const MedicineHeader = ({
  onLocationPress,
  onCartPress,
  onBackPress,
  location,
  cartItemsCount = 0,
  showBackButton = true,
  onSearch,
}) => {
  return (
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor="#E3F2FD" barStyle="dark-content" />
      <LinearGradient
        colors={['#E3F2FD', '#BBDEFB']}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={styles.gradientContainer}>
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <View style={styles.locationContainer}>
              {showBackButton && (
                <TouchableOpacity
                  onPress={onBackPress}
                  style={styles.backButton}>
                  <AntDesign
                    name="arrowleft"
                    size={22}
                    color={COLORS.airForceBlue}
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.locationTextContainer}
                onPress={onLocationPress}>
                <Text style={styles.subText}>Your location</Text>
                <View style={styles.locationRow}>
                  <Text style={styles.locationText}>
                    {location || 'Loading..'}
                  </Text>
                  <Entypo
                    name="chevron-down"
                    size={16}
                    color={COLORS.airForceBlue}
                    style={styles.chevronIcon}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.cartIcon} onPress={onCartPress}>
              <FontAwesome
                name="shopping-cart"
                size={20}
                color={COLORS.airForceBlue}
              />
              {cartItemsCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.badgeText}>{cartItemsCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.searchBox}>
            <FontAwesome
              name="search"
              size={18}
              color={COLORS.airForceBlue}
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search here: Medicine name"
              placeholderTextColor={COLORS.grey}
              style={styles.searchInput}
              onChangeText={onSearch}
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#E3F2FD',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
    borderBottomLeftRadius: moderateScale(20),
    borderBottomRightRadius: moderateScale(20),
  },
  gradientContainer: {
    borderBottomLeftRadius: moderateScale(20),
    borderBottomRightRadius: moderateScale(20),
  },
  headerContainer: {
    padding: scale(15),
    paddingTop: Platform.OS === 'ios' ? scale(40) : scale(5),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: scale(8),
    marginRight: scale(5),
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: moderateScale(10),
  },
  locationTextContainer: {
    flex: 1,
    marginLeft: scale(5),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: moderateScale(12),
    fontFamily: Fonts.Medium,
    color: COLORS.airForceBlue,
    marginRight: scale(5),
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(15),
    marginTop: verticalScale(20),
    height: verticalScale(45),
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cartIcon: {
    padding: scale(10),
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: moderateScale(12),
    marginLeft: scale(10),
  },
  searchIcon: {
    marginRight: scale(10),
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.Regular,
    color: COLORS.black,
    fontSize: moderateScale(14),
    paddingVertical: 0,
  },
  chevronIcon: {
    marginLeft: 5,
  },
  subText: {
    fontSize: moderateScale(12),
    color: COLORS.airForceBlue,
    fontFamily: Fonts.Medium,
    marginBottom: scale(2),
  },
  cartBadge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: COLORS.red,
    borderRadius: moderateScale(8),
    minWidth: scale(20),
    height: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: moderateScale(10),
    fontFamily: Fonts.Bold,
    paddingHorizontal: scale(4),
  },
});

export default MedicineHeader;
