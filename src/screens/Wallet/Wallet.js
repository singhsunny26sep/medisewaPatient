import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {GET_WALLET_BALANCE} from '../../api/Api_Controller';
import AddMoneyModal from '../../component/AddMoneyModal/AddMoneyModal';
import strings from '../../../localization';

const { width } = Dimensions.get('window');

export default function Wallet({ navigation }) {
  const [balance, setBalance] = useState(1250.50);
  const [refreshing, setRefreshing] = useState(false);
  const [addMoneyVisible, setAddMoneyVisible] = useState(false);
  const [transactions, setTransactions] = useState([]);

  const fetchBalance = useCallback(async () => {
    try {
      const data = await GET_WALLET_BALANCE();
      if (data?.balance !== undefined) {
        setBalance(data.balance);
      } else if (data?.data?.balance !== undefined) {
        setBalance(data.data.balance);
      }
    } catch (error) {
      console.log('Failed to fetch wallet balance');
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBalance();
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  const handleAddMoneySuccess = (amount, paymentId) => {
    setBalance(prev => prev + amount);
    setTransactions(prev => [
      {
        id: Date.now().toString(),
        type: 'credit',
        amount,
        description: 'Added to wallet',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
        orderId: paymentId || `TRX-${Date.now()}`,
      },
      ...prev,
    ]);
  };

  const quickActions = [
    {
      id: '1',
      title: 'Add Money',
      icon: 'add-circle-outline',
      color: '#3B82F6',
      bgColor: '#EFF6FF',
      onPress: () => {
        setAddMoneyVisible(true);
      },
    },
    {
      id: '2',
      title: 'Send Money',
      icon: 'send-outline',
      color: '#10B981',
      bgColor: '#ECFDF5',
      onPress: () => console.log('Send Money'),
    },
    {
      id: '3',
      title: 'Pay Bills',
      icon: 'receipt-outline',
      color: '#F59E0B',
      bgColor: '#FFFBEB',
      onPress: () => console.log('Pay Bills'),
    },
    {
      id: '4',
      title: 'History',
      icon: 'time-outline',
      color: '#8B5CF6',
      bgColor: '#F5F3FF',
      onPress: () => console.log('History'),
    },
    {
      id: '5',
      title: 'Withdraw',
      icon: 'arrow-down-outline',
      color: '#EF4444',
      bgColor: '#FEF2F2',
      onPress: () => console.log('Withdraw'),
    },
    {
      id: '6',
      title: 'Rewards',
      icon: 'gift-outline',
      color: '#EC4899',
      bgColor: '#FDF2F8',
      onPress: () => console.log('Rewards'),
    },
  ];

  const TransactionItem = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={[
        styles.transactionIcon,
        { backgroundColor: item.type === 'credit' ? '#ECFDF5' : '#FEF2F2' },
      ]}>
        <Ionicons
          name={item.type === 'credit' ? 'arrow-down-circle' : 'arrow-up-circle'}
          size={24}
          color={item.type === 'credit' ? '#10B981' : '#EF4444'}
        />
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionDate}>{item.date} • {item.time}</Text>
        <Text style={styles.transactionOrderId}>ID: {item.orderId}</Text>
      </View>
      <Text style={[
        styles.transactionAmount,
        { color: item.type === 'credit' ? '#10B981' : '#EF4444' },
      ]}>
        {item.type === 'credit' ? '+' : '-'}₹{item.amount}
      </Text>
    </View>
  );

  const EmptyTransactions = () => (
    <View style={styles.emptyTransactions}>
      <View style={styles.emptyIconWrapper}>
        <Ionicons name="receipt-outline" size={50} color="#9CA3AF" />
      </View>
      <Text style={styles.emptyTitle}>No transactions yet</Text>
      <Text style={styles.emptySubtitle}>
        Your transaction history will appear here
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
      >
        <LinearGradient
          colors={['#3B82F6', '#2563EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceCardContent}>
            <View>
              <Text style={styles.balanceLabel}>Total Balance</Text>
              <Text style={styles.balanceAmount}>₹{balance.toFixed(2)}</Text>
              <View style={styles.balanceStatus}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Active Wallet</Text>
              </View>
            </View>
            <View style={styles.walletIconContainer}>
              <View style={styles.walletIconBg}>
                <FontAwesome5 name="wallet" size={32} color="#FFF" />
              </View>
              <Text style={styles.walletText}>MediSeva</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={action.onPress}
                activeOpacity={0.8}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.bgColor }]}>
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => console.log('View All')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.transactionsCard}>
            {transactions.length > 0 ? (
              transactions.map((item) => (
                <TransactionItem key={item.id} item={item} />
              ))
            ) : (
              <EmptyTransactions />
            )}
          </View>
        </View>

        <View style={styles.paymentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment Methods</Text>
            <TouchableOpacity onPress={() => console.log('Add')}>
              <Text style={styles.viewAllText}>+ Add New</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.paymentMethodsRow}>
            <View style={styles.paymentMethodCard}>
              <View style={styles.paymentIconBg}>
                <Ionicons name="card-outline" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.paymentMethodName}>Credit Card</Text>
              <Text style={styles.paymentMethodDetails}>•••• 4589</Text>
            </View>
            <View style={styles.paymentMethodCard}>
              <View style={styles.paymentIconBg}>
                <Ionicons name="business-outline" size={24} color="#10B981" />
              </View>
              <Text style={styles.paymentMethodName}>UPI</Text>
              <Text style={styles.paymentMethodDetails}>user@okhdfc</Text>
            </View>
            <TouchableOpacity style={styles.addPaymentCard}>
              <View style={styles.addPaymentIcon}>
                <Ionicons name="add" size={28} color="#3B82F6" />
              </View>
              <Text style={styles.addPaymentText}>Add New</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.faqCard}
          onPress={() => navigation.navigate('FAQ')}
          activeOpacity={0.8}
        >
          <View style={styles.faqContent}>
            <View style={styles.faqIconWrapper}>
              <Text style={styles.faqIcon}>❓</Text>
            </View>
            <View style={styles.faqTextContent}>
              <Text style={styles.faqTitle}>Need Help?</Text>
              <Text style={styles.faqSubtitle}>
                Check out our frequently asked questions
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <AddMoneyModal
        visible={addMoneyVisible}
        onClose={() => setAddMoneyVisible(false)}
        onSuccess={handleAddMoneySuccess}
        balance={balance}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  balanceCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  balanceCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  balanceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  walletIconContainer: {
    alignItems: 'center',
  },
  walletIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  walletText: {
    fontWeight: '600',
    color: '#FFF',
    fontSize: 12,
  },
  quickActionsSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 52) / 3,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  transactionsSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  transactionsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  transactionOrderId: {
    fontSize: 11,
    color: '#6B7280',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyTransactions: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  paymentSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  paymentMethodsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentMethodCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paymentIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  paymentMethodName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  paymentMethodDetails: {
    fontSize: 11,
    color: '#6B7280',
  },
  addPaymentCard: {
    width: 80,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  addPaymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  addPaymentText: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '500',
  },
  faqCard: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  faqContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  faqIcon: {
    fontSize: 24,
  },
  faqTextContent: {
    flex: 1,
  },
  faqTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  faqSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  bottomPadding: {
    height: 100,
  },
});
