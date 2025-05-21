import {StyleSheet, Text, View, Image} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../Theme/Colors';
import {scale, verticalScale, moderateScale} from '../../utils/Scaling';
import { Fonts } from '../../Theme/Fonts';
export default function TrustedBanner() {
  return (
    <View>
      <View style={styles.TrustedViewMain}>
        <View style={styles.TrustedView}>
          <View style={styles.SubTrustedView}>
            <Text style={styles.TrustedViewHedarTxt}>
              Trusted by 1,00,000 + user Every month
            </Text>
            <Ionicons
              name="shield-checkmark-sharp"
              size={35}
              color={COLORS.DODGERBLUE}
            />
          </View>
          <View style={styles.innerViewTrusted}>
            <View style={styles.innerSubView}>
              <Ionicons
                name="shield-checkmark-sharp"
                size={25}
                color="#ff6347"
              />
              <Text style={styles.innerSubViewTxt}>
                7000 + Approved Diagnostic Centres
              </Text>
            </View>
            <View style={styles.innerSubView}>
              <Ionicons name="flask" size={25} color="#ff6347" />
              <Text style={styles.innerSubViewTxt}>
                3000 + Lab Tests Offered
              </Text>
            </View>
          </View>
          <View style={styles.innerViewTrusted}>
            <View style={styles.innerSubView}>
              <Ionicons name="location" size={25} color="#ff6347" />
              <Text style={styles.innerSubViewTxt}>
                5000 + Pincodes Covered
              </Text>
            </View>
          </View>
          <Text style={styles.SafeSecureTxt}>100% Safe & Secure Lab Tests</Text>
          <View style={styles.SafeSecureViewMain}>
            <View style={styles.SafeSecureViews}>
              <Ionicons
                name="checkmark-circle-sharp"
                size={35}
                color="#ff6347"
              />
              <Text style={styles.SafeSecureViewTxt}>
                Gov. Approved Diagnostic Centres
              </Text>
            </View>
            <View style={styles.SafeSecureViews}>
              <Image
                source={require('../../assets/Temerature.jpg')}
                style={styles.SafeSecureImage}
              />
              <Text style={styles.SafeSecureViewTxt}>
                Daily Temerature Check of all Technicians
              </Text>
            </View>
          </View>
          <View style={styles.SafeSecureViewMain}>
            <View style={styles.SafeSecureViews}>
              <Image
                source={require('../../assets/Mask.jpg')}
                style={styles.SafeSecureImage}
              />
              <Text style={styles.SafeSecureViewTxt}>
                Mandatory use of Mask & Sanitizers
              </Text>
            </View>
            <View style={styles.SafeSecureViews}>
              <Image
                source={require('../../assets/Disinfectation.jpg')}
                style={styles.SafeSecureImage}
              />
              <Text style={styles.SafeSecureViewTxt}>
                Regular Disinfectation of Labs
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  TrustedViewMain: {
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(10),
    backgroundColor: COLORS.white,
    flex: 1,
  },
  TrustedView: {
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(10),
    marginHorizontal: scale(15),
    borderRadius: moderateScale(10),
    backgroundColor: '#eef0f2',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    elevation: 5,
  },
  TrustedViewHedarTxt: {
    fontSize: moderateScale(18),
    fontFamily:Fonts.Light,
    color: COLORS.ARSENIC,
    width: scale(200),
  },
  SubTrustedView: {
    paddingVertical: verticalScale(10),
    marginHorizontal: scale(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  innerViewTrusted: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: verticalScale(10),
  },
  innerSubView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  innerSubViewTxt: {
    width: scale(130),
    fontSize: moderateScale(14),
    color: COLORS.ARSENIC,
    paddingHorizontal: scale(10),
    fontFamily:Fonts.Regular,
  },
  SafeSecureTxt: {
    fontSize: moderateScale(18),
    color: COLORS.ARSENIC,
    paddingVertical: verticalScale(10),
    fontFamily:Fonts.Medium,
  },
  SafeSecureViewMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: verticalScale(10),
  },
  SafeSecureViews: {
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(15),
    backgroundColor: COLORS.white,
    borderColor: COLORS.white,
    borderWidth: moderateScale(0.5),
    borderRadius: moderateScale(10),
    height: verticalScale(125),
    width: scale(150),
    alignSelf: 'center',
    justifyContent: 'space-evenly',
    marginHorizontal: scale(5),
    flex: 1,
    elevation: 3,
  },
  SafeSecureImage: {
    height: verticalScale(35),
    width: scale(35),
    resizeMode: 'cover',
  },
  SafeSecureViewTxt: {
    paddingTop: verticalScale(10),
    fontFamily:Fonts.Regular,
  },
  VideoConsultingMain: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  VideoConsultingView: {
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(10),
    backgroundColor: COLORS.white,
    borderColor: COLORS.white,
    borderWidth: moderateScale(0.5),
    borderRadius: moderateScale(6),
    marginHorizontal: scale(10),
    marginVertical: verticalScale(10),
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    elevation: 3,
  },
  VideoConsultingTxt: {
    fontSize: moderateScale(18),
    fontFamily:Fonts.Medium,
    color: COLORS.ARSENIC,
    width: scale(200),
  },
  VideoConsultingSubTxt: {
    fontSize: moderateScale(14),
    width: scale(190),
    paddingTop: verticalScale(5),
  },
  VideoCallDrImage: {
    height: verticalScale(90),
    width: scale(90),
  },
  VideoCallDrImage2: {
    height: verticalScale(110),
    width: scale(110),
  },
});
