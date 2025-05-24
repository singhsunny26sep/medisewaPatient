import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import {Container} from '../../component/Container/Container';
import {COLORS} from '../../Theme/Colors';
import {verticalScale, scale, moderateScale} from '../../utils/Scaling';
import LinearGradient from 'react-native-linear-gradient';
import CustomHeader from '../../component/header/CustomHeader';
import {Fonts} from '../../Theme/Fonts';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import ServiceList from '../../component/Category/ServiceList';
import strings from '../../../localization';

export default function Wallet({navigation}) {
  return (
    <Container
      statusBarBackgroundColor={COLORS.white}
      statusBarStyle="dark-content"
      backgroundColor={COLORS.white}>
      <CustomHeader showIcon={false} title={strings.Wallet}/>
        <LinearGradient
          colors={['#e0f7ff', '#b3e5fc', '#81d4fa']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.earningsInfo}>
              <Text style={styles.earningsText}>{strings.Balance}</Text>
              <Text style={styles.amount}>₹ 50</Text>
            </View>
            <View style={styles.iconContainer}>
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/512/3692/3692056.png',
                }}
                style={styles.icon}
              />
              <Text style={styles.walletLabel}>{strings.MedisevaWallet}</Text>
            </View>
          </View>
        </LinearGradient>

      <Text style={styles.label}>{strings.MedisevaServices}</Text>
      <ServiceList />
      <TouchableOpacity
        style={styles.faqButton}
        onPress={() => navigation.navigate('FAQ')}>
        <Text style={styles.faqText}>❓ {strings.FrequentlyAskedQuestions}</Text>
        <FontAwesome5 name="chevron-right" size={16} color={COLORS.black} />
      </TouchableOpacity>
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: scale(15),
    borderRadius: moderateScale(20),
    marginVertical: verticalScale(15),
    padding: moderateScale(20),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
    height: scale(135),
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  earningsInfo: {
    flex: 1,
    paddingTop: scale(10),
  },
  earningsText: {
    fontSize: moderateScale(18),
    color: '#007bb2',
    fontFamily: Fonts.Medium,
  },
  amount: {
    fontSize: moderateScale(30),
    color: '#005f8d',
    fontFamily: Fonts.Bold,
  },
  iconContainer: {
    alignItems: 'center',
  },
  icon: {
    height: scale(55),
    width: scale(55),
    borderRadius: scale(27.5),
  },
  walletLabel: {
    fontFamily: Fonts.Bold,
    color: '#005f8d',
    marginTop: verticalScale(5),
    fontSize: moderateScale(12),
  },
  label: {
    color: COLORS.black,
    fontFamily: Fonts.Bold,
    marginHorizontal: scale(15),
    fontSize: moderateScale(15),
    marginTop: verticalScale(10),
  },
  faqButton: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: scale(15),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(15),
    borderRadius: moderateScale(10),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: verticalScale(10),
    marginTop: scale(15),
  },
  faqText: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Medium,
    color: COLORS.black,
    top: scale(3),
  },
});
