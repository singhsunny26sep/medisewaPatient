import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Platform,
} from 'react-native';
import { COLORS } from '../../Theme/Colors';
import { moderateScale, scale, verticalScale } from '../../utils/Scaling';
import { Fonts } from '../../Theme/Fonts';
import { Instance } from '../../api/Instance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import strings from '../../../localization';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

export default function MyAppointment({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'pending', label: 'Pending' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const fetchAppointments = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.warn('No token found');
        setLoading(false);
        return;
      }

      const response = await Instance.get(
        '/api/v1/bookings/patientBooking/patient/null',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        setAppointments(response.data.result);
      }
    } catch (error) {
      console.error(
        'Error fetching appointments:',
        error?.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const getStatusConfig = (status) => {
    const statusMap = {
      'confirmed': { color: '#10B981', bgColor: '#ECFDF5', icon: 'checkmark-circle' },
      'pending': { color: '#F59E0B', bgColor: '#FFFBEB', icon: 'time-outline' },
      'completed': { color: '#3B82F6', bgColor: '#EFF6FF', icon: 'checkbox-outline' },
      'cancelled': { color: '#EF4444', bgColor: '#FEF2F2', icon: 'close-circle' },
    };
    return statusMap[status?.toLowerCase()] || statusMap['pending'];
  };

  const getStatusIcon = (status) => {
    const config = getStatusConfig(status);
    return config.icon;
  };

  const filteredAppointments = appointments.filter(item => {
    if (selectedFilter === 'all') return true;
    return item.bookingStatus?.toLowerCase() === selectedFilter;
  });

  const AppointmentCard = ({ item }) => {
    const statusConfig = getStatusConfig(item.bookingStatus);
    const appointmentDate = new Date(item.appointmentDate);
    const today = new Date();
    const isUpcoming = appointmentDate > today;

    return (
      <TouchableOpacity 
        style={styles.appointmentCard}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('AppointmentDetails', { appointment: item })}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.doctorInfo}>
            <View style={styles.doctorImageWrapper}>
              {item.doctorId?.image ? (
                <Image source={{ uri: item.doctorId.image }} style={styles.doctorImage} />
              ) : (
                <View style={styles.doctorImagePlaceholder}>
                  <Ionicons name="person-outline" size={28} color="#3B82F6" />
                </View>
              )}
            </View>
            <View style={styles.doctorDetails}>
              <Text style={styles.doctorName}>{item.doctorId?.name || 'Doctor'}</Text>
              <Text style={styles.doctorSpecialty}>{item.doctorId?.specialty || 'General Physician'}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.ratingText}>{item.doctorId?.rating || '4.5'}</Text>
                <Text style={styles.reviewCount}>({item.doctorId?.reviews || '120'} reviews)</Text>
              </View>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
            <Ionicons name={getStatusIcon(item.bookingStatus)} size={12} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {item.bookingStatus || 'Pending'}
            </Text>
          </View>
        </View>

        {/* Appointment Info */}
        <View style={styles.appointmentInfo}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconBg}>
              <Ionicons name="calendar-outline" size={16} color="#3B82F6" />
            </View>
            <Text style={styles.infoText}>
              {appointmentDate.toDateString()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoIconBg}>
              <Ionicons name="time-outline" size={16} color="#3B82F6" />
            </View>
            <Text style={styles.infoText}>{item.appointmentTime}</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoIconBg}>
              <Ionicons name="location-outline" size={16} color="#3B82F6" />
            </View>
            <Text style={styles.infoText} numberOfLines={1}>
              {item.doctorId?.clinicAddress || 'Clinic Address'}
            </Text>
          </View>
        </View>

        {/* Fee Section */}
        <View style={styles.feeSection}>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Consultation Fee</Text>
            <Text style={styles.feeValue}>₹{item.consultationFee || 0}</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>₹{item.totalAmount || 0}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        {item.bookingStatus?.toLowerCase() === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.rescheduleBtn}>
              <Text style={styles.rescheduleBtnText}>Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelAppointmentBtn}>
              <Text style={styles.cancelAppointmentText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.bookingStatus?.toLowerCase() === 'confirmed' && isUpcoming && (
          <View style={styles.upcomingBadge}>
            <Ionicons name="alert-circle-outline" size={14} color="#3B82F6" />
            <Text style={styles.upcomingText}>Upcoming Appointment</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const EmptyAppointments = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrapper}>
        <Ionicons name="calendar-outline" size={60} color="#9CA3AF" />
      </View>
      <Text style={styles.emptyTitle}>No Appointments</Text>
      <Text style={styles.emptySubtitle}>
        You haven't booked any appointments yet.
      </Text>
      <TouchableOpacity
        style={styles.bookNowBtn}
        onPress={() => navigation.navigate('BookAppointment')}
      >
        <LinearGradient
          colors={['#3B82F6', '#2563EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.bookNowGradient}
        >
          <Text style={styles.bookNowText}>Book an Appointment</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const LoadingSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((item) => (
        <View key={item} style={styles.skeletonCard}>
          <View style={styles.skeletonHeader}>
            <View style={styles.skeletonAvatar} />
            <View style={styles.skeletonTextBlock}>
              <View style={styles.skeletonLine} />
              <View style={[styles.skeletonLine, { width: '60%' }]} />
            </View>
          </View>
          <View style={styles.skeletonDetail}>
            <View style={styles.skeletonSmallLine} />
            <View style={styles.skeletonSmallLine} />
            <View style={styles.skeletonSmallLine} />
          </View>
          <View style={styles.skeletonFooter}>
            <View style={styles.skeletonMediumLine} />
            <View style={styles.skeletonButton} />
          </View>
        </View>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Appointments</Text>
          <View style={styles.placeholder} />
        </View>
        <LoadingSkeleton />
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
        <Text style={styles.headerTitle}>My Appointments</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={22} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{appointments.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: '#10B981' }]}>
            {appointments.filter(a => a.bookingStatus?.toLowerCase() === 'confirmed').length}
          </Text>
          <Text style={styles.statLabel}>Confirmed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: '#F59E0B' }]}>
            {appointments.filter(a => a.bookingStatus?.toLowerCase() === 'pending').length}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <FlatList
          data={filters}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
          renderItem={({ item }) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.filterChip, selectedFilter === item.id && styles.filterChipActive]}
              onPress={() => setSelectedFilter(item.id)}
            >
              <Text style={[styles.filterChipText, selectedFilter === item.id && styles.filterChipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>

      {/* Appointments List */}
      <FlatList
        data={filteredAppointments}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <AppointmentCard item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
        ListEmptyComponent={<EmptyAppointments />}
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
    paddingTop: Platform.OS === 'ios' ? 20 : 20,
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
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  filterContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  filterScroll: {
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  appointmentCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  doctorInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  doctorImageWrapper: {
    marginRight: 12,
  },
  doctorImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  doctorImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  reviewCount: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  appointmentInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    color: '#4B5563',
    flex: 1,
  },
  feeSection: {
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  feeLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  feeValue: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  rescheduleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  rescheduleBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  cancelAppointmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
  },
  cancelAppointmentText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444',
  },
  upcomingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#EFF6FF',
  },
  upcomingText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3B82F6',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  bookNowBtn: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  bookNowGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  bookNowText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  skeletonContainer: {
    padding: 16,
  },
  skeletonCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  skeletonHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  skeletonAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  skeletonTextBlock: {
    flex: 1,
  },
  skeletonLine: {
    height: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 7,
    marginBottom: 8,
    width: '100%',
  },
  skeletonDetail: {
    gap: 8,
    marginBottom: 16,
  },
  skeletonSmallLine: {
    height: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    width: '40%',
  },
  skeletonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  skeletonMediumLine: {
    width: 100,
    height: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 7,
  },
  skeletonButton: {
    width: 80,
    height: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 7,
  },
});