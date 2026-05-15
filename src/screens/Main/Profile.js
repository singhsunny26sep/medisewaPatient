import React, { useState, useEffect } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Instance } from '../../api/Instance';
import strings from '../../../localization';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }) {
  const language = useSelector((state) => state.Common.language);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getProfileData();
  }, []);

  const getProfileData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await Instance.get('/api/v1/users/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setProfileData(response.data.result);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getProfileData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userToken');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Logout Error:', error);
              Alert.alert('Error', 'Something went wrong during logout.');
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      id: 'appointments',
      title: strings.MyAppointment,
      icon: 'calendar-outline',
      color: '#3B82F6',
      bgColor: '#EFF6FF',
      route: 'MyAppointment',
    },
    {
      id: 'orders',
      title: strings.OrderHistory,
      icon: 'receipt-outline',
      color: '#10B981',
      bgColor: '#ECFDF5',
      route: 'OrderHistory',
    },
    {
      id: 'language',
      title: strings.ChangeLanguage,
      icon: 'language-outline',
      color: '#F59E0B',
      bgColor: '#FFFBEB',
      route: 'ChangeLanguage',
    },
    {
      id: 'password',
      title: strings.PasswordManager,
      icon: 'key-outline',
      color: '#8B5CF6',
      bgColor: '#F5F3FF',
      route: 'PasswordManager',
    },
    {
      id: 'help',
      title: strings.HelpCenter,
      icon: 'help-buoy-outline',
      color: '#06B6D4',
      bgColor: '#ECFEFF',
      route: 'HelpCenter',
    },
    {
      id: 'calls',
      title: strings.CallHistory,
      icon: 'call-outline',
      color: '#EC4899',
      bgColor: '#FDF2F8',
      route: 'CallHistory',
    },
    {
      id: 'privacy',
      title: strings.PrivacyPolicy,
      icon: 'shield-outline',
      color: '#6B7280',
      bgColor: '#F3F4F6',
      route: 'PrivacyPolicy',
    },
  ];

  const stats = [
    { id: '1', label: 'Appointments', value: '12', icon: 'calendar-outline', color: '#3B82F6' },
    { id: '2', label: 'Orders', value: '8', icon: 'cart-outline', color: '#10B981' },
    { id: '3', label: 'Calls', value: '24', icon: 'call-outline', color: '#F59E0B' },
    { id: '4', label: 'Wallet', value: '₹1,250', icon: 'wallet-outline', color: '#8B5CF6' },
  ];

  const familyMembers = [
    {
      id: '1',
      name: 'Sanjay',
      relation: 'Family',
      contact: '+91 70968 88015',
      email: 'sanjay@example.com',
      avatar: 'S',
    },
  ];

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} style={styles.editBtn}>
          <Ionicons name="create-outline" size={22} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileImageWrapper}>
            <Image
              source={{ uri: profileData?.image || 'https://via.placeholder.com/100' }}
              style={styles.profileImage}
            />
            <View style={styles.onlineDot} />
          </View>
          <Text style={styles.profileName}>{profileData?.name || 'Guest User'}</Text>
          <Text style={styles.profileContact}>{profileData?.mobile || 'Not provided'}</Text>
          <Text style={styles.profileEmail}>{profileData?.email || 'No email'}</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            {stats.map((stat) => (
              <View key={stat.id} style={styles.statCard}>
                <View style={[styles.statIconBg, { backgroundColor: `${stat.color}10` }]}>
                  <Ionicons name={stat.icon} size={22} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Family Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Family Members</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Add_FamilyMember')}>
              <Text style={styles.addText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {familyMembers.map((member) => (
            <View key={member.id} style={styles.familyCard}>
              <View style={styles.familyAvatarWrapper}>
                <LinearGradient
                  colors={['#3B82F6', '#2563EB']}
                  style={styles.familyAvatarGradient}
                >
                  <Text style={styles.familyAvatarText}>{member.avatar}</Text>
                </LinearGradient>
                <View style={styles.familyRelationBadge}>
                  <Text style={styles.familyRelationText}>{member.relation}</Text>
                </View>
              </View>
              <View style={styles.familyInfo}>
                <Text style={styles.familyName}>{member.name}</Text>
                <Text style={styles.familyContact}>{member.contact}</Text>
                <Text style={styles.familyEmail}>{member.email}</Text>
              </View>
              <TouchableOpacity style={styles.familyEditBtn}>
                <Ionicons name="create-outline" size={20} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBg, { backgroundColor: item.bgColor }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={styles.menuText}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LinearGradient
            colors={['#EF4444', '#DC2626']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoutGradient}
          >
            <Ionicons name="log-out-outline" size={20} color="#FFF" />
            <Text style={styles.logoutText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>Version 2.0.0</Text>
        <View style={styles.bottomPadding} />
      </ScrollView>
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
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  profileCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileImageWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#3B82F6',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  profileContact: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  addText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  familyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  familyAvatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  familyAvatarGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  familyAvatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  familyRelationBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  familyRelationText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FFF',
  },
  familyInfo: {
    flex: 1,
  },
  familyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  familyContact: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  familyEmail: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  familyEditBtn: {
    padding: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  menuIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  logoutBtn: {
    marginHorizontal: 20,
    marginTop: 32,
    borderRadius: 14,
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 20,
    marginBottom: 8,
  },
  bottomPadding: {
    height: 40,
  },
});