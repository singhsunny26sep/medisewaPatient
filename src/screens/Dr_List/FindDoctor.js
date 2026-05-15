import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  TextInput,
  Alert,
  Animated,
  Platform,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Instance } from '../../api/Instance';
import { moderateScale, scale, verticalScale } from '../../utils/Scaling';
import { Fonts } from '../../Theme/Fonts';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 380;

export default function FindDoctor({ navigation }) {
  const [departments, setDepartments] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [symptomInput, setSymptomInput] = useState('');
  const [searchedDoctors, setSearchedDoctors] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
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
  }, [loading]);

  const fetchData = async () => {
    try {
      const [departmentsRes, specialistsRes] = await Promise.all([
        Instance.get('/api/v1/departments'),
        Instance.get('/api/v1/specializations'),
      ]);
      if (departmentsRes.data.success) {
        setDepartments(departmentsRes.data.result);
      }
      if (specialistsRes.data.success) {
        setSpecialists(specialistsRes.data.result);
      }
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const searchDoctorsBySymptom = async () => {
    if (!symptomInput.trim()) {
      Alert.alert('Enter Symptoms', 'Please enter symptoms to search for doctors');
      return;
    }

    try {
      setSearchLoading(true);
      const symptomsArray = symptomInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
      const response = await Instance.get('api/v1/doctors/searchBySymptom', {
        params: { symptom: symptomsArray.join(',') },
      });
      if (response.data.success) {
        if (response.data.result.length === 0) {
          Alert.alert('No Doctors Found', 'No doctors found matching your symptoms.');
        }
        setSearchedDoctors(response.data.result);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      Alert.alert('Error', 'Failed to search doctors. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const CategoryCard = ({ item, index }) => {
    const colors = [
      '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'
    ];
    const color = colors[index % colors.length];

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.categoryCard}
        onPress={() => navigation.navigate('Department_List', { departmentId: item._id })}
      >
        <LinearGradient
          colors={[color, color + 'CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.categoryGradient}
        >
          <View style={styles.categoryIconBg}>
            <Ionicons name="medical-outline" size={28} color="#FFF" />
          </View>
          <Text style={styles.categoryTitle} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.doctorCount || 50}+ Doctors</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const SpecialistCard = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.specialistCard}
      onPress={() => navigation.navigate('Specialist_List', { specialistId: item._id })}
    >
      <View style={styles.specialistImageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.specialistImage} />
        ) : (
          <View style={styles.specialistImagePlaceholder}>
            <Ionicons name="person-outline" size={40} color="#3B82F6" />
          </View>
        )}
        <View style={styles.experienceBadge}>
          <Ionicons name="star" size={10} color="#F59E0B" />
          <Text style={styles.experienceText}>{item.experience || '5+'} yrs</Text>
        </View>
      </View>
      <View style={styles.specialistInfo}>
        <Text style={styles.specialistName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.specialistDescription} numberOfLines={2}>
          {item.description || 'Healthcare Specialist'}
        </Text>
        <View style={styles.specialistBadge}>
          <Ionicons name="medkit-outline" size={12} color="#3B82F6" />
          <Text style={styles.specialistType}>Specialist</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const LoadingSkeleton = () => (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonSeeAll} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.skeletonScroll}>
        {[1, 2, 3, 4].map((item) => (
          <View key={item} style={styles.skeletonCategoryCard}>
            <View style={styles.skeletonCircle} />
            <View style={styles.skeletonLine} />
            <View style={styles.skeletonSmallLine} />
          </View>
        ))}
      </ScrollView>
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonSeeAll} />
      </View>
      <View style={styles.specialistsGrid}>
        {[1, 2, 3, 4].map((item) => (
          <View key={item} style={styles.skeletonSpecialistCard}>
            <View style={styles.skeletonImage} />
            <View style={styles.skeletonName} />
            <View style={styles.skeletonDesc} />
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Doctors</Text>
        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons name="notifications-outline" size={22} color="#111827" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      {/* Hero Banner */}
      <LinearGradient
        colors={['#3B82F6', '#2563EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroBanner}
      >
        <Text style={styles.heroTitle}>Find Your Doctor</Text>
        <Text style={styles.heroSubtitle}>
          Search by specialty or describe your symptoms
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>500+</Text>
            <Text style={styles.statLabel}>Doctors</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>50+</Text>
            <Text style={styles.statLabel}>Specialists</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24/7</Text>
            <Text style={styles.statLabel}>Service</Text>
          </View>
        </View>
      </LinearGradient>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        style={[styles.scrollView, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
      >
        {/* Symptom Search */}
        <View style={styles.symptomSection}>
          <Text style={styles.symptomTitle}>Search by Symptoms</Text>
          <View style={styles.symptomInputContainer}>
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.symptomInput}
              placeholder="e.g. fever, cough, headache"
              placeholderTextColor="#9CA3AF"
              value={symptomInput}
              onChangeText={setSymptomInput}
              returnKeyType="search"
              onSubmitEditing={searchDoctorsBySymptom}
            />
            {symptomInput.length > 0 && (
              <TouchableOpacity onPress={() => setSymptomInput('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={searchDoctorsBySymptom}
            disabled={searchLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.searchGradient}
            >
              {searchLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons name="search" size={18} color="#FFF" />
                  <Text style={styles.searchBtnText}>Search Doctors</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Search Results */}
        {searchedDoctors.length > 0 && (
          <View style={styles.resultsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Matching Doctors</Text>
              <Text style={styles.resultCount}>{searchedDoctors.length} found</Text>
            </View>
            <View style={styles.specialistsGrid}>
              {searchedDoctors.slice(0, 4).map((doctor) => (
                <SpecialistCard key={doctor._id} item={doctor} />
              ))}
            </View>
          </View>
        )}

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              {departments.map((item, index) => (
                <CategoryCard key={item._id} item={item} index={index} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Top Specialists Section */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Specialists</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <View style={styles.specialistsGrid}>
              {specialists.slice(0, 4).map((specialist) => (
                <SpecialistCard key={specialist._id} item={specialist} />
              ))}
            </View>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </Animated.ScrollView>
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
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  heroBanner: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingVertical: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  scrollView: {
    flex: 1,
  },
  symptomSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  symptomTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 10,
  },
  symptomInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  symptomInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#111827',
    padding: 0,
  },
  searchBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  searchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  searchBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  resultsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  lastSection: {
    marginBottom: 20,
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
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  resultCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  categoriesScroll: {
    paddingRight: 20,
    gap: 12,
  },
  categoryCard: {
    width: scale(120),
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryGradient: {
    padding: 14,
    alignItems: 'center',
    minHeight: verticalScale(130),
    justifyContent: 'center',
  },
  categoryIconBg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '500',
    color: '#FFF',
  },
  specialistsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  specialistCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  specialistImageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  specialistImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  specialistImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
  },
  experienceBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  experienceText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#111827',
  },
  specialistInfo: {
    alignItems: 'center',
  },
  specialistName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  specialistDescription: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 15,
  },
  specialistBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  specialistType: {
    fontSize: 11,
    fontWeight: '500',
    color: '#3B82F6',
  },
  bottomPadding: {
    height: 40,
  },
  // Skeleton Styles
  skeletonContainer: {
    paddingHorizontal: 20,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  skeletonTitle: {
    width: 100,
    height: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
  },
  skeletonSeeAll: {
    width: 50,
    height: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  skeletonScroll: {
    marginBottom: 20,
  },
  skeletonCategoryCard: {
    width: 110,
    alignItems: 'center',
    marginRight: 12,
  },
  skeletonCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    marginBottom: 10,
  },
  skeletonLine: {
    width: 80,
    height: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 7,
    marginBottom: 6,
  },
  skeletonSmallLine: {
    width: 60,
    height: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 5,
  },
  skeletonSpecialistCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
  },
  skeletonImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  skeletonName: {
    width: '80%',
    height: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 6,
  },
  skeletonDesc: {
    width: '60%',
    height: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    alignSelf: 'center',
  },
});