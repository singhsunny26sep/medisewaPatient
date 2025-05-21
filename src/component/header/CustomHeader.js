import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {COLORS} from '../../Theme/Colors';
import Icon from 'react-native-vector-icons/AntDesign';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
import {Fonts} from '../../Theme/Fonts';

const  CustomHeader = ({navigation, title, showIcon = true}) => {
  return (
    <View style={styles.header}>
      {showIcon && (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack('')}>
          <Icon name="arrowleft" size={25} color={COLORS.black} />
        </TouchableOpacity>
      )}
      <Text
        style={[
          styles.headerText,
          !showIcon && {textAlign: 'center', marginRight: scale(5)},
        ]}>
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: verticalScale(3),
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderBottomLeftRadius: moderateScale(15),
    borderBottomRightRadius: moderateScale(15),
  },
  iconButton: {
    padding: scale(10),
    marginRight: scale(10),
  },
  headerText: {
    flex: 1,
    textAlign: 'left',
    fontSize: moderateScale(17),
    fontFamily: Fonts.Medium,
    color: COLORS.black,
  },
});

export default CustomHeader;
