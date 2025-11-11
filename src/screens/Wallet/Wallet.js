import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import {Container} from '../../component/Container/Container';
import {COLORS} from '../../Theme/Colors';
import {verticalScale, scale, moderateScale} from '../../utils/Scaling';
import LinearGradient from 'react-native-linear-gradient';
import CustomHeader from '../../component/header/CustomHeader';
import {Fonts} from '../../Theme/Fonts';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ServiceList from '../../component/Category/ServiceList';
import strings from '../../../localization';

const {width} = Dimensions.get('window');

export default function Wallet({navigation}) {
  const [balance] = useState(1250.50);

  const quickActions = [
    {
      id: '1',
      title: 'Add Money',
      icon: 'add-circle',
      color: COLORS.DODGERBLUE,
      onPress: () => console.log('Add Money'),
    },
    {
      id: '2',
      title: 'Send Money',
      icon: 'send',
      color: COLORS.greenViridian,
      onPress: () => console.log('Send Money'),
    },
    {
      id: '3',
      title: 'Pay Bills',
      icon: 'receipt',
      color: COLORS.orange,
      onPress: () => console.log('Pay Bills'),
    },
    {
      id: '4',
      title: 'History',
      icon: 'time',
      color: COLORS.STEELBLUE,
      onPress: () => console.log('History'),
    },
  ];

  const transactions = [
    {
      id: '1',
      type: 'credit',
      amount: 500,
      description: 'Added to wallet',
      date: '2024-01-15',
      time: '10:30 AM',
    },
    {
      id: '2',
      type: 'debit',
      amount: 150,
      description: 'Medicine purchase',
      date: '2024-01-14',
      time: '2:45 PM',
    },
    {
      id: '3',
      type: 'debit',
      amount: 200,
      description: 'Lab test booking',
      date: '2024-01-13',
      time: '9:15 AM',
    },
  ];

  const renderTransaction = ({item}) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Ionicons
          name={item.type === 'credit' ? 'arrow-down-circle' : 'arrow-up-circle'}
          size={24}
          color={item.type === 'credit' ? COLORS.green : COLORS.VERMILION}
        />
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionDate}>{item.date} • {item.time}</Text>
      </View>
      <Text style={[styles.transactionAmount, {color: item.type === 'credit' ? COLORS.green : COLORS.VERMILION}]}>
        {item.type === 'credit' ? '+' : '-'}₹{item.amount}
      </Text>
    </View>
  );

  return (
    <Container backgroundColor={COLORS.AntiFlashWhite}>
      {/* <CustomHeader
        showIcon={false}
        title={strings.Wallet}
        statusBarStyle="dark-content"
        statusBarBackgroundColor={COLORS.white}
      /> */}

      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        {/* Enhanced Balance Card */}
        <LinearGradient
          colors={[COLORS.DODGERBLUE, COLORS.STEELBLUE, COLORS.RobinBlue]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.balanceCard}>
          <View style={styles.balanceCardContent}>
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>{strings.Balance}</Text>
              <Text style={styles.balanceAmount}>₹{balance.toFixed(2)}</Text>
              <View style={styles.balanceStatus}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
            <View style={styles.walletIconContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                style={styles.walletIconGradient}>
                <FontAwesome5 name="wallet" size={30} color={COLORS.white} />
              </LinearGradient>
              <Text style={styles.walletText}>{strings.MedisevaWallet}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionButton}
                onPress={action.onPress}
                activeOpacity={0.8}>
                <LinearGradient
                  colors={[action.color, action.color + '80']}
                  style={styles.quickActionGradient}>
                  <Ionicons name={action.icon} size={24} color={COLORS.white} />
                </LinearGradient>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Transaction History */}
        <View style={styles.transactionsContainer}>
          <View style={styles.transactionsHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => console.log('View All')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.transactionsList}>
            <FlatList
              data={transactions}
              renderItem={renderTransaction}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </View>
        </View>

        {/* Services Section */}
        <View style={styles.servicesContainer}>
          <Text style={styles.sectionTitle}>{strings.MedisevaServices}</Text>
          <ServiceList />
        </View>

        {/* Enhanced FAQ Button */}
        <TouchableOpacity
          style={styles.faqButton}
          onPress={() => navigation.navigate('FAQ')}
          activeOpacity={0.8}>
          <LinearGradient
            colors={[COLORS.white, COLORS.AntiFlashWhite]}
            style={styles.faqGradient}>
            <View style={styles.faqContent}>
              <View style={styles.faqIcon}>
                <Text style={styles.faqEmoji}>❓</Text>
              </View>
              <Text style={styles.faqText}>{strings.FrequentlyAskedQuestions}</Text>
              <FontAwesome5 name="chevron-right" size={16} color={COLORS.ARSENIC} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.AntiFlashWhite,
    marginTop:24
  },
  balanceCard: {
    marginHorizontal: scale(20),
    marginTop: verticalScale(10),
    borderRadius: moderateScale(20),
    padding: moderateScale(25),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  balanceCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: moderateScale(16),
    color: 'rgba(255,255,255,0.9)',
    fontFamily: Fonts.Medium,
    marginBottom: verticalScale(5),
  },
  balanceAmount: {
    fontSize: moderateScale(32),
    color: COLORS.white,
    fontFamily: Fonts.Bold,
    marginBottom: verticalScale(8),
  },
  balanceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: COLORS.green,
    marginRight: scale(6),
  },
  statusText: {
    fontSize: moderateScale(12),
    color: 'rgba(255,255,255,0.8)',
    fontFamily: Fonts.Medium,
  },
  walletIconContainer: {
    alignItems: 'center',
  },
  walletIconGradient: {
    padding: scale(15),
    borderRadius: moderateScale(20),
    marginBottom: verticalScale(8),
  },
  walletText: {
    fontFamily: Fonts.Bold,
    color: COLORS.white,
    fontSize: moderateScale(12),
    textAlign: 'center',
  },
  quickActionsContainer: {
    marginTop: verticalScale(25),
    marginHorizontal: scale(20),
  },
  sectionTitle: {
    fontSize: moderateScale(20),
    fontFamily: Fonts.Bold,
    color: COLORS.ARSENIC,
    marginBottom: verticalScale(15),
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: (width - scale(60)) / 2,
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(15),
    padding: scale(20),
    alignItems: 'center',
    marginBottom: verticalScale(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionGradient: {
    width: scale(50),
    height: scale(50),
    borderRadius: moderateScale(25),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  quickActionText: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Medium,
    color: COLORS.ARSENIC,
    textAlign: 'center',
  },
  transactionsContainer: {
    marginTop: verticalScale(10),
    marginHorizontal: scale(20),
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  viewAllText: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Medium,
    color: COLORS.DODGERBLUE,
  },
  transactionsList: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(15),
    padding: scale(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.AntiFlashWhite,
  },
  transactionIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(20),
    backgroundColor: COLORS.AntiFlashWhite,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(15),
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Medium,
    color: COLORS.ARSENIC,
    marginBottom: verticalScale(2),
  },
  transactionDate: {
    fontSize: moderateScale(12),
    fontFamily: Fonts.Regular,
    color: COLORS.lineBlack,
  },
  transactionAmount: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Bold,
  },
  servicesContainer: {
    marginTop: verticalScale(25),
    marginHorizontal: scale(20),
  },
  faqButton: {
    marginHorizontal: scale(20),
    marginTop: verticalScale(20),
    marginBottom: verticalScale(30),
    borderRadius: moderateScale(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  faqGradient: {
    borderRadius: moderateScale(15),
  },
  faqContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(20),
  },
  faqIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(20),
    backgroundColor: 'rgba(40, 127, 240, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(15),
  },
  faqEmoji: {
    fontSize: moderateScale(20),
  },
  faqText: {
    flex: 1,
    fontSize: moderateScale(16),
    fontFamily: Fonts.Medium,
    color: COLORS.ARSENIC,
  },
});
