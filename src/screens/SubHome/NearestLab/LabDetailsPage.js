import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
  Modal,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {COLORS} from '../../../Theme/Colors';
import {moderateScale, scale, verticalScale} from '../../../utils/Scaling';
import {Fonts} from '../../../Theme/Fonts';
import {Instance} from '../../../api/Instance';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width, height} = Dimensions.get('window');
const isSmallPhone = width < 380;

const DEFAULT_IMAGE =
  'https://passion.healthcare/wp-content/uploads/2023/02/labimage.jpeg';

export default function LabDetailsPage({route, navigation}) {
  const labId = route?.params?.labId || route?.params?.lab?._id || null;
  const locationAddress = route?.params?.locationAddress || '';

  const [labData, setLabData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('tests');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchLabDetails();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fetchLabDetails = async () => {
    console.log(labId, 'this is labId');
    if (!labId) {
      setLoading(false);
      return;
    }
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await Instance.get(`api/v1/labs/single/${labId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data?.success && response.data?.result) {
        setLabData(response.data.result);
      }
      console.log(response.data, 'this is lab details response');
    } catch (error) {
      console.error('Error fetching lab details:', error);
      Alert.alert('Error', 'Failed to load lab details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!labData) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIconBg}>
          <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
        </View>
        <Text style={styles.errorTitle}>Lab Not Found</Text>
        <Text style={styles.errorText}>Lab information is not available</Text>
        <TouchableOpacity
          style={styles.errorBtn}
          onPress={() => navigation.goBack()}>
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            style={styles.errorGradient}>
            <Text style={styles.errorBtnText}>Go Back</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  const lab = labData;
  const labInfo = lab.userId || {};

  const toggleModal = () => setIsModalVisible(!isModalVisible);

  const addToCart = item => {
    setCart(prevCart => [...prevCart, item]);
  };

  const removeFromCart = item => {
    setCart(prevCart => prevCart.filter(cartItem => cartItem._id !== item._id));
  };

  const handlePressAddress = () => {
    const address = `${labInfo?.address || ''}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address,
    )}`;
    Linking.openURL(url).catch(() =>
      Alert.alert('Error', 'Unable to open Google Maps'),
    );
  };

  const handlePressContactNumber = () => {
    const url = `tel:${labInfo?.mobile || ''}`;
    Linking.openURL(url).catch(() =>
      Alert.alert('Error', 'Unable to make a call'),
    );
  };

  const handleProceedToBook = () => {
    if (cart.length === 0) {
      Alert.alert('Error', 'Please select at least one test');
      return;
    }
    const totalAmount = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    navigation.navigate('BookAppointment', {
      labName: labInfo?.name || lab.name,
      labId: lab._id,
      selectedTestsname: cart.map(item => item.name),
      locationAddress: locationAddress,
      paidAmount: totalAmount,
    });
  };

  const TestCard = ({item}) => {
    const isInCart = cart.some(cartItem => cartItem._id === item._id);
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        style={[styles.testCard, {transform: [{scale: scaleAnim}]}]}>
        <LinearGradient
          colors={['#FFF', '#F9FAFB']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.testCardGradient}>
          <View style={styles.testImageWrapper}>
            <Image
              style={styles.testImage}
              source={{uri: item.image || DEFAULT_IMAGE}}
              resizeMode="cover"
            />
          </View>
          <View style={styles.testInfo}>
            <Text style={styles.testName} numberOfLines={2}>
              {item.name || 'Unknown Test'}
            </Text>
            <Text style={styles.testDescription} numberOfLines={2}>
              {item.description || ''}
            </Text>
            <Text style={styles.testPrice}>₹ {item.price || 0}</Text>
            <View style={styles.testMeta}>
              <View style={styles.testMetaBadge}>
                <Ionicons name="time-outline" size={12} color="#6B7280" />
                <Text style={styles.testMetaText}>48 hrs report</Text>
              </View>
              <View style={styles.testMetaBadge}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={12}
                  color="#10B981"
                />
                <Text style={styles.testMetaText}>NABL Certified</Text>
              </View>
            </View>
          </View>
          <View style={styles.testAction}>
            {isInCart ? (
              <TouchableOpacity
                onPress={() => removeFromCart(item)}
                style={styles.removeBtn}>
                <Ionicons name="trash-outline" size={22} color="#EF4444" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => addToCart(item)}
                style={styles.addBtn}>
                <LinearGradient
                  colors={['#3B82F6', '#2563EB']}
                  style={styles.addBtnGradient}>
                  <MaterialIcons name="add" size={16} color="#FFF" />
                  <Text style={styles.addBtnText}>Add</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const HeaderComponent = () => (
    <Animated.View
      style={{opacity: fadeAnim, transform: [{translateY: slideAnim}]}}>
      {/* Hero Banner */}
      <LinearGradient
        colors={['#3B82F6', '#2563EB']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.heroBanner}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleModal} style={styles.infoBtn}>
          <Ionicons name="information-circle-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Lab Info Card */}
      <View style={styles.labInfoCard}>
        <View style={styles.labLogoWrapper}>
          <LinearGradient
            colors={['#EFF6FF', '#DBEAFE']}
            style={styles.labLogoBg}>
            <Image
              style={styles.labLogo}
              source={{uri: labInfo.image || lab.image || DEFAULT_IMAGE}}
              resizeMode="contain"
            />
          </LinearGradient>
        </View>
        <Text style={styles.labName}>
          {labInfo.name || lab.name || 'Lab Name'}
        </Text>
        <View style={styles.labRatingRow}>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.ratingText}>4.8</Text>
          </View>
          <Text style={styles.ratingCount}>(1.2k+ reviews)</Text>
        </View>
        <View style={styles.labStatsRow}>
          <View style={styles.labStat}>
            <Ionicons name="flask-outline" size={18} color="#3B82F6" />
            <Text style={styles.labStatText}>1 Test</Text>
          </View>
          <View style={styles.labStatDivider} />
          <View style={styles.labStat}>
            <Ionicons name="time-outline" size={18} color="#3B82F6" />
            <Text style={styles.labStatText}>48 hrs Report</Text>
          </View>
          <View style={styles.labStatDivider} />
          <View style={styles.labStat}>
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color="#10B981"
            />
            <Text style={styles.labStatText}>Certified</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'tests' && styles.tabActive]}
          onPress={() => setSelectedTab('tests')}>
          <Text
            style={[
              styles.tabText,
              selectedTab === 'tests' && styles.tabTextActive,
            ]}>
            Test Details
          </Text>
          <View style={selectedTab === 'tests' && styles.tabIndicator} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'info' && styles.tabActive]}
          onPress={() => setSelectedTab('info')}>
          <Text
            style={[
              styles.tabText,
              selectedTab === 'info' && styles.tabTextActive,
            ]}>
            Lab Info
          </Text>
          <View style={selectedTab === 'info' && styles.tabIndicator} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const InfoTab = () => (
    <View style={styles.infoTabContainer}>
      <TouchableOpacity style={styles.infoCard} onPress={handlePressAddress}>
        <View style={styles.infoIconBg}>
          <Ionicons name="location-outline" size={24} color="#3B82F6" />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Address</Text>
          <Text style={styles.infoValue}>{labInfo?.address || 'N/A'}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.infoCard}
        onPress={handlePressContactNumber}>
        <View style={styles.infoIconBg}>
          <Ionicons name="call-outline" size={24} color="#10B981" />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Contact Number</Text>
          <Text style={styles.infoValue}>{labInfo?.mobile || 'N/A'}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
      </TouchableOpacity>

      <View style={styles.infoCard}>
        <View style={styles.infoIconBg}>
          <Ionicons name="time-outline" size={24} color="#F59E0B" />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Working Hours</Text>
          <Text style={styles.infoValue}>Mon - Sat: 8:00 AM - 8:00 PM</Text>
          <Text style={styles.infoSubValue}>Sunday: 9:00 AM - 2:00 PM</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoIconBg}>
          <Ionicons name="card-outline" size={24} color="#8B5CF6" />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Payment Methods</Text>
          <Text style={styles.infoValue}>Cash, Card, UPI, Insurance</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={HeaderComponent}
        data={selectedTab === 'tests' ? [lab] : []}
        renderItem={({item}) => <TestCard item={item} />}
        keyExtractor={item => item._id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          selectedTab === 'tests' ? (
            <View style={styles.emptyTests}>
              <Ionicons name="flask-outline" size={50} color="#9CA3AF" />
              <Text style={styles.emptyTestsTitle}>No Tests Available</Text>
              <Text style={styles.emptyTestsSubtitle}>
                Please check back later
              </Text>
            </View>
          ) : (
            <InfoTab />
          )
        }
      />

      {/* Cart Bottom Sheet */}
      {cart.length > 0 && (
        <Animated.View style={styles.cartSheet}>
          <LinearGradient
            colors={['#FFF', '#F9FAFB']}
            style={styles.cartSheetContent}>
            <View style={styles.cartSheetInfo}>
              <Text style={styles.cartSheetTitle}>
                {cart.length} Test{cart.length > 1 ? 's' : ''} Selected
              </Text>
              <Text style={styles.cartSheetPrice}>
                Total: ₹{cart.reduce((sum, item) => sum + (item.price || 0), 0)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.cartSheetBtn}
              onPress={handleProceedToBook}>
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.cartSheetGradient}>
                <Text style={styles.cartSheetBtnText}>Proceed to Book</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Info Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lab Information</Text>
              <TouchableOpacity onPress={toggleModal}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={styles.modalInfoRow}
                onPress={handlePressAddress}>
                <View style={styles.modalInfoIcon}>
                  <Ionicons name="location-outline" size={22} color="#3B82F6" />
                </View>
                <View style={styles.modalInfoText}>
                  <Text style={styles.modalInfoLabel}>Address</Text>
                  <Text style={styles.modalInfoValue}>
                    {`${lab?.address?.address || 'N/A'}, ${
                      lab?.address?.city || 'N/A'
                    }, ${lab?.address?.state || 'N/A'}`}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalInfoRow}
                onPress={handlePressContactNumber}>
                <View style={styles.modalInfoIcon}>
                  <Ionicons name="call-outline" size={22} color="#10B981" />
                </View>
                <View style={styles.modalInfoText}>
                  <Text style={styles.modalInfoLabel}>Contact</Text>
                  <Text style={styles.modalInfoValue}>
                    {lab?.contactNumber || 'N/A'}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.modalInfoRow}>
                <View style={styles.modalInfoIcon}>
                  <Ionicons name="mail-outline" size={22} color="#8B5CF6" />
                </View>
                <View style={styles.modalInfoText}>
                  <Text style={styles.modalInfoLabel}>Email</Text>
                  <Text style={styles.modalInfoValue}>
                    {lab?.email || 'info@lab.com'}
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
  },
  errorIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  errorBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  errorGradient: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 14,
  },
  errorBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  heroBanner: {
    height: 180,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labInfoCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: -40,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  labLogoWrapper: {
    marginTop: -50,
    marginBottom: 12,
  },
  labLogoBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  labLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  labName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  labRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  labStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  labStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  labStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E7EB',
  },
  labStatText: {
    fontSize: 12,
    color: '#4B5563',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  tabActive: {
    borderBottomWidth: 0,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 40,
    height: 3,
    backgroundColor: '#3B82F6',
    borderRadius: 1.5,
  },
  listContent: {
    paddingBottom: 100,
  },
  testCard: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  testCardGradient: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  testImageWrapper: {
    width: 70,
    height: 70,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  testImage: {
    width: '100%',
    height: '100%',
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  testPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 6,
  },
  testMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  testMetaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  testMetaText: {
    fontSize: 10,
    color: '#6B7280',
  },
  testAction: {
    justifyContent: 'center',
    marginLeft: 8,
  },
  addBtn: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  addBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 4,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  removeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTabContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  infoSubValue: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  emptyTests: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTestsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyTestsSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  cartSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  cartSheetContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cartSheetInfo: {
    flex: 1,
  },
  cartSheetTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  cartSheetPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginTop: 2,
  },
  cartSheetBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  cartSheetGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  cartSheetBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: height * 0.8,
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
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalInfoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  modalInfoText: {
    flex: 1,
  },
  modalInfoLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  modalInfoValue: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
});
