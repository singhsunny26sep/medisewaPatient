import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/AntDesign';
import {COLORS} from '../../Theme/Colors';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
import {StatusBar} from 'react-native';

export default function Transactions() {
  const navigation = useNavigation();

  const handleGetReport = () => {
    alert('Get Report button pressed');
  };

  return (
    <View style={{flex: 1, backgroundColor: COLORS.white}}>
      <StatusBar backgroundColor={COLORS.DODGERBLUE} barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backArrow}
          onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Transactions</Text>
        <TouchableOpacity
          onPress={handleGetReport}
          style={styles.getReportButton}>
          <Text style={styles.getReportText}>Get Report</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.viewContainer}>
          <View style={styles.ViewSubContainer}>
            <View style={styles.iconView}>
              <Icon name="medicinebox" size={18} color={COLORS.DODGERBLUE} />
            </View>
            <View>
              <Text style={styles.statusText}>On-Going</Text>
              <Text style={styles.statusText}>0 Rs</Text>
            </View>
          </View>
        </View>
        <View style={styles.viewContainer}>
          <View style={styles.ViewSubContainer}>
            <View style={styles.iconView}>
              <Icon name="medicinebox" size={18} color={COLORS.DODGERBLUE} />
            </View>
            <View>
              <Text style={styles.statusText}>Available</Text>
              <Text style={styles.statusText}>0 Rs</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.extraOptionsContainer}>
        <TouchableOpacity style={styles.extraOptionView}>
          <Icon name="calendar" size={18} color={COLORS.DODGERBLUE} />
          <Text style={styles.extraOptionText}>Date Range :</Text>
          <Icon name="down" size={12} color={COLORS.DODGERBLUE} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.extraOptionView2}>
          <Icon name="filter" size={18} color={COLORS.DODGERBLUE} />
          <Text style={styles.extraOptionText}>Filter</Text>
          <Icon name="down" size={12} color={COLORS.DODGERBLUE} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.DODGERBLUE,
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    marginLeft: scale(10),
    color: COLORS.white,
  },
  backArrow: {
    marginLeft: scale(10),
  },
  getReportButton: {
    backgroundColor: COLORS.white,
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(15),
    borderRadius: moderateScale(5),
  },
  getReportText: {
    fontSize: moderateScale(14),
    fontWeight: 'bold',
    color: COLORS.DODGERBLUE,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: verticalScale(20),
  },
  viewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: moderateScale(1),
    borderColor: COLORS.AshGray,
    backgroundColor: COLORS.white,
    marginHorizontal: scale(10),
    padding: scale(10),
    borderRadius: moderateScale(10),
    height: verticalScale(80),
  },
  ViewSubContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconView: {
    height: scale(30),
    width: scale(30),
    borderRadius: scale(10),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.blueGray,
    borderColor: COLORS.AntiFlashWhite,
  },
  statusText: {
    marginLeft: scale(10),
    fontSize: moderateScale(16),
    color: COLORS.black,
  },
  extraOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: verticalScale(10),
    marginHorizontal: scale(10),
  },
  extraOptionView: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: moderateScale(1),
    borderColor: COLORS.AshGray,
    backgroundColor: COLORS.white,
    padding: scale(10),
    width: scale(230),
    borderRadius: moderateScale(10),
  },
  extraOptionView2: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: moderateScale(1),
    borderColor: COLORS.AshGray,
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(10),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(10),
  },
  extraOptionText: {
    marginLeft: scale(5),
    marginRight: scale(5),
    fontSize: moderateScale(12),
    color: COLORS.black,
  },
});
