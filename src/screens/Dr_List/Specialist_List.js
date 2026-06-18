import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
  Dimensions,
  Platform,
  Animated,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Instance } from '../../api/Instance';
import { INITIATE_CALL } from '../../api/Api_Controller';
import { sendEnhancedAudioCallInvite, sendEnhancedVideoCallInvite } from '../../utils/rtmService';
import { useCallManager } from '../../utils/CallManager';
import { moderateScale, scale, verticalScale } from '../../utils/Scaling';
import { Fonts } from '../../Theme/Fonts';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 380;

export default function Specialist_List({ route, navigation }) {
  const { specialistId } = route.params;
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { initiateCall: initiateCallFromManager } = useCallManager();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchDoctors();
  }, [specialistId]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [filteredDoctors]);

  const fetchDoctors = async () => {
    try {
      const response = await Instance.get(
        `/api/v1/doctors/search/${specialistId}?type=Specialist`
      );
      setDoctors(response.data.result);
      setFilteredDoctors(response.data.result);
    } catch (error) {
      console.error('Error fetching doctor data: ', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDoctors();
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredDoctors(doctors);
    } else {
      const filtered = doctors.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(text.toLowerCase()) ||
          (doctor.doctorId?.specialization?.name || '')
            .toLowerCase()
            .includes(text.toLowerCase())
      );
      setFilteredDoctors(filtered);
    }
  };

  const handleContactPress = (doctor) => {
    setSelectedDoctor(doctor);
    setIsModalVisible(true);
  };

  const initiateCall = async (doctor, type) => {
    if (!doctor?.userId && !doctor?._id) {
      console.log('Missing doctor.userId or doctor._id');
      return;
    }
    // Use userId if available, otherwise use _id
    const targetId = doctor.userId || doctor._id;
    try {
      const data = await INITIATE_CALL({ recieverId: targetId, callType: type });
      // Handle both wrapped and direct response formats
      if (data?.data || data?.callId) {
        const callData = {
          callId: data?.data?.callId || data?.callId,
          channelName: data?.data?.channelName || data?.channelName,
          token: data?.data?.token || data?.token,
          callerId: data?.data?.callerId || data?.callerId,
          callerName: data?.data?.callerName || data?.callerName,
          callerAvatar: data?.data?.callerAvatar || data?.callerAvatar,
        };

        if (type === 'audio') {
          await sendEnhancedAudioCallInvite(targetId, {
            callId: callData.callId,
            channel: callData.channelName,
            callerId: callData.callerId,
            callerName: callData.callerName,
            callerAvatar: callData.callerAvatar,
          }).catch(err => console.warn('RTM send failed:', err));
        } else {
          await sendEnhancedVideoCallInvite(targetId, {
            callId: callData.callId,
            channel: callData.channelName,
            callerId: callData.callerId,
            callerName: callData.callerName,
            callerAvatar: callData.callerAvatar,
          }).catch(err => console.warn('RTM send failed:', err));
        }
      }
      return data;
    } catch (error) {
      console.error('Error initiating call:', error);
      // Check if it's FCM error - call may still be created
      if (error.response?.data?.error?.code === 'messaging/invalid-payload') {
        Alert.alert('Call Error', 'Unable to reach doctor. Please try again or ensure the doctor has notifications enabled.');
      }
      throw error;
    }
  };

  const DoctorCard = ({ item, index }) => {
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          delay: index * 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    return (
      <Animated.View
        style={[
          styles.doctorCard,
          {
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.doctorImageWrapper}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.doctorImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="person-outline" size={32} color="#3B82F6" />
              </View>
            )}
            <View style={[styles.onlineDot, item.isOnline && styles.onlineDotActive]} />
          </View>
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{item.name}</Text>
            <View style={styles.specialtyBadge}>
              <Ionicons name="medkit-outline" size={12} color="#3B82F6" />
              <Text style={styles.specialtyText}>
                {item.specialization?.name || 'General Physician'}
              </Text>
            </View>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}>{item.doctorId?.rating || '4.5'}</Text>
              <Text style={styles.reviewText}>({item.doctorId?.reviews || '500'} reviews)</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="briefcase-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              {item.doctorId?.experience || '5'}+ years experience
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="people-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              {item.doctorId?.patientsCount || '1500'}+ patients
            </Text>
          </View>
          <View style={styles.detailItem}>
            <View style={[styles.statusDot, item.isOnline ? styles.onlineStatus : styles.offlineStatus]} />
            <Text style={[styles.statusText, item.isOnline ? styles.onlineStatusText : styles.offlineStatusText]}>
              {item.isOnline ? 'Available Now' : 'Offline'}
            </Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.contactBtn}
            onPress={() => handleContactPress(item)}
          >
            <Ionicons name="call-outline" size={18} color="#3B82F6" />
            <Text style={styles.contactBtnText}>Contact</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() =>
              navigation.navigate('Dr_AppointmentBook', { doctorId: item.userId || item._id })
            }
          >
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.bookGradient}
            >
              <Text style={styles.bookBtnText}>Book Appointment</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const EmptyList = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBg}>
        <Ionicons name="medical-outline" size={60} color="#3B82F6" />
      </View>
      <Text style={styles.emptyTitle}>No Doctors Found</Text>
      <Text style={styles.emptySubtitle}>
        Try adjusting your search or try another specialty
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loaderText}>Loading doctors...</Text>
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
        <Text style={styles.headerTitle}>Doctors List</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={22} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or specialty..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{filteredDoctors.length}</Text>
          <Text style={styles.statLabel}>Doctors</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: '#10B981' }]}>
            {filteredDoctors.filter((d) => d.isOnline).length}
          </Text>
          <Text style={styles.statLabel}>Available Now</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: '#F59E0B' }]}>4.8</Text>
          <Text style={styles.statLabel}>Avg Rating</Text>
        </View>
      </View>

      {/* Doctors List */}
      <Animated.FlatList
        data={filteredDoctors}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item, index }) => <DoctorCard item={item} index={index} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
        ListEmptyComponent={<EmptyList />}
        style={{ opacity: fadeAnim }}
      />

      {/* Contact Modal */}
      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Contact Dr. {selectedDoctor?.name}</Text>
                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={styles.callOption}
                  onPress={async () => {
                    setIsModalVisible(false);
                    try {
                      const callData = await initiateCall(selectedDoctor, 'audio');
                      navigation.navigate('AudioCall', {
                        doctor: selectedDoctor,
                        callData: callData?.data,
                      });
                    } catch (error) {
                      Alert.alert('Error', 'Failed to initiate audio call');
                    }
                  }}
                >
                  <LinearGradient
                    colors={['#3B82F6', '#2563EB']}
                    style={styles.callOptionGradient}
                  >
                    <Ionicons name="call-outline" size={28} color="#FFF" />
                  </LinearGradient>
                  <Text style={styles.callOptionText}>Audio Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.callOption}
                  onPress={async () => {
                    setIsModalVisible(false);
                    try {
                      const callData = await initiateCall(selectedDoctor, 'video');
                      navigation.navigate('VideoCall', {
                        doctor: selectedDoctor,
                        callData: callData?.data,
                      });
                    } catch (error) {
                      Alert.alert('Error', 'Failed to initiate video call');
                    }
                  }}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.callOptionGradient}
                  >
                    <Ionicons name="videocam-outline" size={28} color="#FFF" />
                  </LinearGradient>
                  <Text style={styles.callOptionText}>Video Call</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#111827',
    padding: 0,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
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
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  doctorCard: {
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  doctorImageWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  doctorImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  imagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#9CA3AF',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  onlineDotActive: {
    backgroundColor: '#10B981',
  },
  doctorInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  specialtyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  specialtyText: {
    fontSize: 13,
    color: '#6B7280',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F59E0B',
  },
  reviewText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  cardDetails: {
    padding: 16,
    gap: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 13,
    color: '#4B5563',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  onlineStatus: {
    backgroundColor: '#10B981',
  },
  offlineStatus: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  onlineStatusText: {
    color: '#10B981',
  },
  offlineStatusText: {
    color: '#EF4444',
  },
  cardActions: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3B82F6',
    gap: 6,
  },
  contactBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  bookBtn: {
    flex: 1.5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bookGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  bookBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EFF6FF',
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
    lineHeight: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  callOption: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
  },
  callOptionGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  callOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  cancelButton: {
    marginTop: 20,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});