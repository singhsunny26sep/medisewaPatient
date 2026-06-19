import React, { useCallback, useEffect, useState, useRef } from 'react';
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
  Animated,
} from 'react-native';
import { COLORS } from '../../Theme/Colors';
import { moderateScale, scale, verticalScale } from '../../utils/Scaling';
import { Fonts } from '../../Theme/Fonts';
import { Instance } from '../../api/Instance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import strings from '../../../localization';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder'; // npm install react-native-shimmer-placeholder
import { jwtDecode } from 'jwt-decode';

const { width } = Dimensions.get('window');

export default function MyAppointment({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Animated values for cards
  const cardAnimations = useRef([]).current;

  const filters = [
    { id: 'all', label: 'All', icon: 'apps-outline' },
    { id: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle-outline' },
    { id: 'pending', label: 'Pending', icon: 'time-outline' },
    { id: 'completed', label: 'Completed', icon: 'checkbox-outline' },
    { id: 'cancelled', label: 'Cancelled', icon: 'close-circle-outline' },
  ];

  const fetchAppointments = useCallback(async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        console.warn('No token found');
        setLoading(false);
        return;
      }

      const decodedToken = jwtDecode(userToken);
      const patientId =
        decodedToken?._id ||
        decodedToken?.id ||
        decodedToken?.userId ||
        decodedToken?.user?._id ||
        decodedToken?.user?.id ||
        decodedToken?.sub;
      if (!patientId) {
        console.warn('Patient id not found in token:', decodedToken);
        setLoading(false);
        return;
      }

      const response = await Instance.get(
        `api/v1/labs/getByPatientId/${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      if (response.data.success) {
        const result = response.data.result || [];
        setAppointments(result);
        // Initialize animations for each card
        cardAnimations.length = result.length;
        result.forEach((_, index) => {
          if (!cardAnimations[index]) {
            cardAnimations[index] = new Animated.Value(0);
          }
        });
      }
    } catch (error) {
      console.error(
        'Error fetching appointments:',
        error?.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  }, [cardAnimations]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Animate cards on mount
  useEffect(() => {
    if (!loading && appointments.length > 0) {
      const animations = appointments.map((_, index) => {
        return Animated.timing(cardAnimations[index], {
          toValue: 1,
          duration: 300,
          delay: index * 100,
          useNativeDriver: true,
        });
      });
      Animated.stagger(80, animations).start();
    }
  }, [loading, appointments, cardAnimations]);

  const getStatusConfig = (status) => {
    const statusMap = {
      confirmed: {
        gradient: ['#10B981', '#059669'],
        icon: 'checkmark-circle',
        bgColor: '#ECFDF5',
        color: '#10B981',
      },
      pending: {
        gradient: ['#F59E0B', '#D97706'],
        icon: 'time',
        bgColor: '#FFFBEB',
        color: '#F59E0B',
      },
      completed: {
        gradient: ['#3B82F6', '#2563EB'],
        icon: 'checkbox',
        bgColor: '#EFF6FF',
        color: '#3B82F6',
      },
      cancelled: {
        gradient: ['#EF4444', '#DC2626'],
        icon: 'close-circle',
        bgColor: '#FEF2F2',
        color: '#EF4444',
      },
    };
    return statusMap[status?.toLowerCase()] || statusMap['pending'];
  };

  const getAppointmentStatus = (item) => {
    if (item.bookingStatus) {
      return item.bookingStatus.toLowerCase();
    }

    if (item.paid || item.totalPaid > 0 || item.paidAmounts?.length > 0) {
      return 'confirmed';
    }

    return 'pending';
  };

  const filteredAppointments = appointments.filter((item) => {
    if (selectedFilter === 'all') return true;
    return getAppointmentStatus(item) === selectedFilter;
  });

  const AppointmentCard = ({ item, index }) => {
    const status = getAppointmentStatus(item);
    const statusConfig = getStatusConfig(status);
    const isLabAppointment = Boolean(item.labId || item.test || item.type === 'test');
    const provider = item.labId || item.doctorId || {};
    const appointmentDate = item.appointmentDate || item.createdAt;
    const appointmentTime = item.appointmentTime || (appointmentDate ? new Date(appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');
    const today = new Date();
    const isUpcoming = appointmentDate ? new Date(appointmentDate) > today : false;
    const appointmentDateText = appointmentDate ? new Date(appointmentDate).toDateString() : 'Date not available';
    const appointmentTimeText = appointmentTime || 'Time not available';

    // Animated card style
    const animatedStyle = {
      opacity: cardAnimations[index] || new Animated.Value(1),
      transform: [
        {
          translateY: Animated.multiply(
            cardAnimations[index] || new Animated.Value(1),
            new Animated.Value(-10)
          ),
        },
      ],
    };

    return (
      <Animated.View style={[styles.cardContainer, animatedStyle]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('AppointmentDetails', { appointment: item })}
        >
          <LinearGradient
            colors={['#FFFFFF', '#FAFBFC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.appointmentCard}
          >
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View style={styles.doctorInfo}>
                <View style={styles.doctorImageWrapper}>
                  {provider?.image ? (
                    <Image source={{ uri: provider.image }} style={styles.doctorImage} />
                  ) : (
                    <LinearGradient
                      colors={['#EFF6FF', '#DBEAFE']}
                      style={styles.doctorImagePlaceholder}
                    >
                      <Ionicons name={isLabAppointment ? 'flask-outline' : 'person-outline'} size={28} color="#3B82F6" />
                    </LinearGradient>
                  )}
                </View>
                <View style={styles.doctorDetails}>
                  <Text style={styles.doctorName}>
                    {isLabAppointment ? item.testName || item.test?.name || 'Lab Test' : item.doctorId?.name || 'Doctor'}
                  </Text>
                  <Text style={styles.doctorSpecialty}>
                    {isLabAppointment ? provider.name || 'Lab' : item.doctorId?.specialty || 'General Physician'}
                  </Text>
                  {!isLabAppointment && (
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text style={styles.ratingText}>{item.doctorId?.rating || '4.5'}</Text>
                      <Text style={styles.reviewCount}>({item.doctorId?.reviews || '120'})</Text>
                    </View>
                  )}
                  {isLabAppointment && (
                    <View style={styles.ratingRow}>
                      <Ionicons name="cube-outline" size={14} color="#3B82F6" />
                      <Text style={styles.ratingText}>{item.type === 'test' ? 'Test' : 'Lab'}</Text>
                    </View>
                  )}
                </View>
              </View>
              <LinearGradient
                colors={statusConfig.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.statusBadge}
              >
                <Ionicons name={statusConfig.icon} size={12} color="#FFF" />
                <Text style={styles.statusText}>{status === 'confirmed' ? 'Confirmed' : status}</Text>
              </LinearGradient>
            </View>

            {/* Appointment Info */}
            <View style={styles.appointmentInfo}>
              <View style={styles.infoRow}>
                <View style={styles.infoIconBg}>
                  <Ionicons name="calendar-outline" size={16} color="#3B82F6" />
                </View>
                <Text style={styles.infoText}>{appointmentDateText}</Text>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoIconBg}>
                  <Ionicons name="time-outline" size={16} color="#3B82F6" />
                </View>
                <Text style={styles.infoText}>{appointmentTimeText}</Text>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoIconBg}>
                  <Ionicons name="location-outline" size={16} color="#3B82F6" />
                </View>
                <Text style={styles.infoText} numberOfLines={1}>
                  {provider.address || provider.clinicAddress || 'Address not available'}
                </Text>
              </View>
            </View>

            {/* Fee Section */}
            <View style={styles.feeSection}>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>{isLabAppointment ? 'Test Fee' : 'Consultation Fee'}</Text>
                <Text style={styles.feeValue}>
                  ₹{item.consultationFee || item.price || item.totalPaid || 0}
                </Text>
              </View>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Total Amount</Text>
                <Text style={styles.totalAmount}>₹{item.totalAmount || item.totalPaid || item.price || 0}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            {status === 'pending' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.rescheduleBtn}>
                  <Ionicons name="calendar-outline" size={16} color="#3B82F6" />
                  <Text style={styles.rescheduleBtnText}>Reschedule</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelAppointmentBtn}>
                  <Ionicons name="close-outline" size={16} color="#EF4444" />
                  <Text style={styles.cancelAppointmentText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}

            {status === 'confirmed' && isUpcoming && !isLabAppointment && (
              <LinearGradient
                colors={['#EFF6FF', '#DBEAFE']}
                style={styles.upcomingBadge}
              >
                <Ionicons name="alert-circle-outline" size={14} color="#3B82F6" />
                <Text style={styles.upcomingText}>Upcoming Appointment</Text>
              </LinearGradient>
            )}

            {isLabAppointment && status === 'confirmed' && (
              <LinearGradient
                colors={['#EFF6FF', '#DBEAFE']}
                style={styles.upcomingBadge}
              >
                <Ionicons name="checkmark-circle-outline" size={14} color="#3B82F6" />
                <Text style={styles.upcomingText}>Lab Test Booked</Text>
              </LinearGradient>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const EmptyAppointments = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrapper}>
        <Ionicons name="calendar-outline" size={60} color="#CBD5E1" />
      </View>
      <Text style={styles.emptyTitle}>No Appointments Yet</Text>
      <Text style={styles.emptySubtitle}>
        Ready to take a step toward better health? Book your first appointment now.
      </Text>
      <TouchableOpacity
        style={styles.bookNowBtn}
        onPress={() => navigation.navigate('BookAppointment')}
        activeOpacity={0.8}
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
            <ShimmerPlaceholder style={styles.skeletonAvatar} />
            <View style={styles.skeletonTextBlock}>
              <ShimmerPlaceholder style={styles.skeletonLine} />
              <ShimmerPlaceholder style={[styles.skeletonLine, { width: '60%' }]} />
            </View>
          </View>
          <View style={styles.skeletonDetail}>
            <ShimmerPlaceholder style={styles.skeletonSmallLine} />
            <ShimmerPlaceholder style={styles.skeletonSmallLine} />
            <ShimmerPlaceholder style={styles.skeletonSmallLine} />
          </View>
          <View style={styles.skeletonFooter}>
            <ShimmerPlaceholder style={styles.skeletonMediumLine} />
            <ShimmerPlaceholder style={styles.skeletonButton} />
          </View>
        </View>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnWhite}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitleWhite}>My Appointments</Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
        <LoadingSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnWhite}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitleWhite}>My Appointments</Text>
          <TouchableOpacity style={styles.filterBtnWhite}>
            <Ionicons name="options-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats Summary - Floating Pill */}
      <View style={styles.statsPill}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{appointments.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#10B981' }]}>
            {appointments.filter((a) => getAppointmentStatus(a) === 'confirmed').length}
          </Text>
          <Text style={styles.statLabel}>Confirmed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#F59E0B' }]}>
            {appointments.filter((a) => getAppointmentStatus(a) === 'pending').length}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {/* Filter Chips with Icons */}
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
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.icon}
                size={16}
                color={selectedFilter === item.id ? '#FFF' : '#6B7280'}
              />
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === item.id && styles.filterChipTextActive,
                ]}
              >
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
        renderItem={({ item, index }) => <AppointmentCard item={item} index={index} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
        ListEmptyComponent={<EmptyAppointments />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backBtnWhite: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitleWhite: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  filterBtnWhite: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  placeholder: {
    width: 40,
  },
  statsPill: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: -16,
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    zIndex: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  filterContainer: {
    marginTop: 18,
    paddingHorizontal: 20,
  },
  filterScroll: {
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  cardContainer: {
    marginBottom: 14,
  },
  appointmentCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 13,
    color: '#64748B',
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
    color: '#94A3B8',
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
    color: '#FFF',
    textTransform: 'capitalize',
  },
  appointmentInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
    color: '#334155',
    flex: 1,
  },
  feeSection: {
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  feeLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  feeValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B82F6',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  rescheduleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3B82F6',
    gap: 6,
  },
  rescheduleBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  cancelAppointmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    gap: 6,
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
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  skeletonCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  skeletonHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  skeletonAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  skeletonTextBlock: {
    flex: 1,
  },
  skeletonLine: {
    height: 14,
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
    borderRadius: 6,
    width: '40%',
  },
  skeletonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  skeletonMediumLine: {
    width: 100,
    height: 14,
    borderRadius: 7,
  },
  skeletonButton: {
    width: 80,
    height: 14,
    borderRadius: 7,
  },
});