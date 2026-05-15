import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Animated,
  RefreshControl,
  Platform,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { GET_BRANDS } from '../../api/Api_Controller';
import ImageSlider from '../../component/ImageSlider/ImageSlider';
import LocationModal from '../../component/LocationModal';
import { useUserLocation } from '../../utils/useUserLocation';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;
const isSmallPhone = width < 380;

// Responsive functions
const responsiveWidth = (percentage) => (width * percentage) / 100;
const responsiveHeight = (percentage) => (height * percentage) / 100;
const responsiveFont = (size) => {
  const baseWidth = 375;
  const scaleFactor = width / baseWidth;
  return Math.round(size * Math.min(scaleFactor, 1.5));
};

// Banner Data
const banners = [
  { id: 1, title: '20% OFF', subtitle: 'on first medicine order', color1: '#3B82F6', color2: '#2563EB', icon: 'medkit-outline' },
  { id: 2, title: 'Free Delivery', subtitle: 'on orders above ₹499', color1: '#10B981', color2: '#059669', icon: 'car-outline' },
  { id: 3, title: 'Buy 1 Get 1', subtitle: 'on selected medicines', color1: '#8B5CF6', color2: '#6D28D9', icon: 'gift-outline' },
  { id: 4, title: 'Cashback', subtitle: 'upto ₹500 on prepaid', color1: '#F59E0B', color2: '#D97706', icon: 'wallet-outline' },
];

// Featured categories
const featuredCategories = [
  { id: 'f1', title: 'Pain Relief', icon: 'medkit-outline', color: '#EF4444' },
  { id: 'f2', title: 'Vitamins', icon: 'nutrition-outline', color: '#10B981' },
  { id: 'f3', title: 'Ayurveda', icon: 'leaf-outline', color: '#8B5CF6' },
  { id: 'f4', title: 'Diabetes', icon: 'heart-outline', color: '#3B82F6' },
];

const MedicineCategory = ({ navigation }) => {
  const defaultLocation = useUserLocation();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentBanner, setCurrentBanner] = useState(0);
  const [cartCount, setCartCount] = useState(3);

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    fetchCategories(1);
  }, []);

  const fetchCategories = async (pageNumber = 1, isRefresh = false) => {
    try {
      if (pageNumber === 1) setLoading(true);
      const data = await GET_BRANDS(pageNumber, 10);
      if (data?.success) {
        const formattedItems = data.result.map(item => ({
          id: item._id,
          title: item.title,
          image: item.image,
        }));
        setCategories(prev => pageNumber === 1 ? formattedItems : [...prev, ...formattedItems]);
        setHasMore(pageNumber < data.pagination.totalPages);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      if (pageNumber === 1) setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchCategories(1, true);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setModalVisible(false);
  };

  const filteredCategories = categories.filter((category) =>
    category.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Animated Category Card
  const CategoryCard = ({ item, index }) => {
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const colors = ['#EFF6FF', '#ECFDF5', '#F5F3FF', '#FFFBEB', '#FEF2F2', '#FDF2F8', '#E0F2FE', '#FCE7F3'];
    const iconColors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#F97316'];
    const bgColor = colors[index % colors.length];
    const iconColor = iconColors[index % iconColors.length];

    useEffect(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 40, delay: index * 50, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 400, delay: index * 50, useNativeDriver: true }),
      ]).start();
    }, []);

    return (
      <Animated.View style={[styles.cardWrapper, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
        <TouchableOpacity
          style={[styles.categoryCard, { backgroundColor: bgColor }]}
          onPress={() => navigation.navigate('SubCategory', { brandId: item.id })}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']}
            style={styles.cardGradient}
          />
          <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.categoryImage} />
            ) : (
              <Ionicons name="medkit-outline" size={responsiveFont(28)} color={iconColor} />
            )}
          </View>
          <Text style={styles.categoryTitle} numberOfLines={2}>{item.title}</Text>
          <View style={[styles.arrowCircle, { backgroundColor: `${iconColor}20` }]}>
            <Ionicons name="arrow-forward" size={responsiveFont(14)} color={iconColor} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Featured Category Card
  const FeaturedCard = ({ item, index }) => (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() => navigation.navigate('SubCategory', { brandId: item.id })}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[item.color + '15', item.color + '05']}
        style={styles.featuredGradient}
      >
        <View style={[styles.featuredIconBg, { backgroundColor: item.color + '20' }]}>
          <Ionicons name={item.icon} size={responsiveFont(24)} color={item.color} />
        </View>
        <Text style={styles.featuredTitle}>{item.title}</Text>
        <Text style={styles.featuredCount}>{Math.floor(Math.random() * 50) + 10}+ items</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Banner Card
  const BannerCard = ({ item }) => (
    <LinearGradient
      colors={[item.color1, item.color2]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.bannerCard}
    >
      <View style={styles.bannerContent}>
        <Text style={styles.bannerTitle}>{item.title}</Text>
        <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
        <TouchableOpacity style={styles.bannerBtn}>
          <Text style={styles.bannerBtnText}>Shop Now</Text>
          <Ionicons name="arrow-forward" size={responsiveFont(14)} color="#FFF" />
        </TouchableOpacity>
      </View>
      <View style={styles.bannerIconWrapper}>
        <Ionicons name={item.icon} size={responsiveFont(65)} color="rgba(255,255,255,0.15)" />
      </View>
    </LinearGradient>
  );

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4].map((item) => (
        <View key={item} style={styles.skeletonCard}>
          <ShimmerPlaceholder style={styles.skeletonImage} />
          <ShimmerPlaceholder style={styles.skeletonTitle} />
          <ShimmerPlaceholder style={styles.skeletonSubtitle} />
        </View>
      ))}
    </View>
  );

  // Empty State
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBg}>
        <Ionicons name="search-outline" size={responsiveFont(50)} color="#3B82F6" />
      </View>
      <Text style={styles.emptyTitle}>No Categories Found</Text>
      <Text style={styles.emptySubtitle}>Try searching with a different keyword</Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={() => setSearchQuery('')}>
        <Text style={styles.emptyBtnText}>Clear Search</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={responsiveFont(22)} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.locationBtn} onPress={() => setModalVisible(true)}>
            <Ionicons name="location-outline" size={responsiveFont(16)} color="#3B82F6" />
            <Text style={styles.locationText} numberOfLines={1}>
              {selectedLocation || defaultLocation || 'Select Location'}
            </Text>
            <Ionicons name="chevron-down" size={responsiveFont(14)} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('SearchScreen')}>
            <Ionicons name="search-outline" size={responsiveFont(22)} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('MainStack', { screen: 'Cart' })}>
            <Ionicons name="cart-outline" size={responsiveFont(22)} color="#111827" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />}
      >
        {/* Welcome Banner */}
        <LinearGradient
          colors={['#3B82F6', '#2563EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.welcomeBanner}
        >
          <View>
            <Text style={styles.welcomeText}>Hello, 👋</Text>
            <Text style={styles.welcomeSubtext}>Find your medicines at best price</Text>
          </View>
          <View style={styles.welcomeIcon}>
            <Ionicons name="medkit-outline" size={responsiveFont(50)} color="rgba(255,255,255,0.2)" />
          </View>
        </LinearGradient>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={responsiveFont(20)} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by medicine name..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={responsiveFont(20)} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Banner Slider */}
        <View style={styles.bannerSection}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const offset = e.nativeEvent.contentOffset.x;
              const index = Math.round(offset / (width - 32));
              setCurrentBanner(index);
            }}
            scrollEventThrottle={16}
          >
            {banners.map((banner) => (
              <BannerCard key={banner.id} item={banner} />
            ))}
          </ScrollView>
          <View style={styles.dotContainer}>
            {banners.map((_, index) => (
              <View key={index} style={[styles.dot, currentBanner === index && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* Featured Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Categories</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
            {featuredCategories.map((item, index) => (
              <FeaturedCard key={item.id} item={item} index={index} />
            ))}
          </ScrollView>
        </View>

        {/* Popular Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Categories</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading && page === 1 ? (
            <LoadingSkeleton />
          ) : (
            <View style={styles.categoriesGrid}>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((item, index) => (
                  <CategoryCard key={item.id} item={item} index={index} />
                ))
              ) : (
                <EmptyState />
              )}
            </View>
          )}

          {hasMore && !loading && categories.length > 0 && (
            <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMore}>
              <Text style={styles.loadMoreText}>Load More</Text>
              <Ionicons name="arrow-down" size={responsiveFont(16)} color="#3B82F6" />
            </TouchableOpacity>
          )}
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </Animated.ScrollView>

      <LocationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onLocationSelect={handleLocationSelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveWidth(5),
    paddingTop: Platform.OS === 'ios' ? responsiveHeight(6) : responsiveHeight(4),
    paddingBottom: responsiveHeight(2),
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveWidth(3),
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveWidth(3),
  },
  iconBtn: {
    width: responsiveWidth(10),
    height: responsiveWidth(10),
    borderRadius: responsiveWidth(5),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(1),
    borderRadius: responsiveWidth(5),
    gap: responsiveWidth(2),
    maxWidth: responsiveWidth(45),
  },
  locationText: {
    fontSize: responsiveFont(12),
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  cartBtn: {
    width: responsiveWidth(10),
    height: responsiveWidth(10),
    borderRadius: responsiveWidth(5),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: responsiveWidth(5),
    height: responsiveWidth(5),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(1),
  },
  cartBadgeText: {
    fontSize: responsiveFont(9),
    fontWeight: 'bold',
    color: '#FFF',
  },
  welcomeBanner: {
    marginHorizontal: responsiveWidth(5),
    marginTop: responsiveHeight(2),
    borderRadius: 20,
    padding: responsiveWidth(5),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: responsiveFont(20),
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: responsiveFont(13),
    color: 'rgba(255,255,255,0.9)',
  },
  welcomeIcon: {
    opacity: 0.5,
  },
  searchSection: {
    paddingHorizontal: responsiveWidth(5),
    paddingTop: responsiveHeight(2),
    paddingBottom: responsiveHeight(1),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(1.5),
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
    marginLeft: responsiveWidth(2),
    fontSize: responsiveFont(14),
    color: '#111827',
    padding: 0,
  },
  bannerSection: {
    marginTop: responsiveHeight(1),
  },
  bannerCard: {
    width: width - responsiveWidth(8),
    borderRadius: 20,
    padding: responsiveWidth(5),
    marginHorizontal: responsiveWidth(4),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: responsiveFont(20),
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: responsiveFont(12),
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  bannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: responsiveWidth(3.5),
    paddingVertical: responsiveHeight(1),
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  bannerBtnText: {
    fontSize: responsiveFont(12),
    fontWeight: '600',
    color: '#FFF',
  },
  bannerIconWrapper: {
    marginLeft: responsiveWidth(3),
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: responsiveHeight(1.5),
    marginBottom: responsiveHeight(1),
  },
  dot: {
    width: responsiveWidth(2),
    height: responsiveWidth(2),
    borderRadius: responsiveWidth(1),
    backgroundColor: '#D1D5DB',
    marginHorizontal: responsiveWidth(1),
  },
  dotActive: {
    width: responsiveWidth(6),
    backgroundColor: '#3B82F6',
  },
  section: {
    marginTop: responsiveHeight(2),
    paddingHorizontal: responsiveWidth(5),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveHeight(1.5),
  },
  sectionTitle: {
    fontSize: responsiveFont(18),
    fontWeight: 'bold',
    color: '#111827',
  },
  seeAllText: {
    fontSize: responsiveFont(13),
    color: '#3B82F6',
    fontWeight: '500',
  },
  featuredScroll: {
    paddingBottom: responsiveHeight(0.5),
  },
  featuredCard: {
    width: responsiveWidth(28),
    marginRight: responsiveWidth(3),
  },
  featuredGradient: {
    borderRadius: 16,
    padding: responsiveWidth(3),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  featuredIconBg: {
    width: responsiveWidth(11),
    height: responsiveWidth(11),
    borderRadius: responsiveWidth(5.5),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveHeight(1),
  },
  featuredTitle: {
    fontSize: responsiveFont(12),
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  featuredCount: {
    fontSize: responsiveFont(10),
    color: '#9CA3AF',
    marginTop: responsiveHeight(0.5),
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: (width - responsiveWidth(13)) / 2,
    marginBottom: responsiveWidth(3),
  },
  categoryCard: {
    borderRadius: 20,
    padding: responsiveWidth(4),
    minHeight: responsiveHeight(13),
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  iconContainer: {
    width: responsiveWidth(12),
    height: responsiveWidth(12),
    borderRadius: responsiveWidth(6),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveHeight(1),
  },
  categoryImage: {
    width: responsiveWidth(8),
    height: responsiveWidth(8),
    resizeMode: 'contain',
  },
  categoryTitle: {
    fontSize: responsiveFont(13),
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    lineHeight: responsiveFont(18),
  },
  arrowCircle: {
    position: 'absolute',
    bottom: responsiveWidth(2),
    right: responsiveWidth(2),
    width: responsiveWidth(6),
    height: responsiveWidth(6),
    borderRadius: responsiveWidth(3),
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsiveHeight(1.5),
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(2),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
    gap: 8,
  },
  loadMoreText: {
    fontSize: responsiveFont(14),
    fontWeight: '500',
    color: '#3B82F6',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: responsiveHeight(8),
    paddingHorizontal: responsiveWidth(8),
  },
  emptyIconBg: {
    width: responsiveWidth(25),
    height: responsiveWidth(25),
    borderRadius: responsiveWidth(12.5),
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveHeight(2),
  },
  emptyTitle: {
    fontSize: responsiveFont(18),
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: responsiveHeight(0.5),
  },
  emptySubtitle: {
    fontSize: responsiveFont(13),
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: responsiveFont(18),
    marginBottom: responsiveHeight(2),
  },
  emptyBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: responsiveWidth(6),
    paddingVertical: responsiveHeight(1.2),
    borderRadius: 25,
  },
  emptyBtnText: {
    fontSize: responsiveFont(14),
    fontWeight: '500',
    color: '#FFF',
  },
  skeletonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  skeletonCard: {
    width: (width - responsiveWidth(13)) / 2,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: responsiveWidth(4),
    alignItems: 'center',
    marginBottom: responsiveWidth(3),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  skeletonImage: {
    width: responsiveWidth(12),
    height: responsiveWidth(12),
    borderRadius: responsiveWidth(6),
    marginBottom: responsiveHeight(1),
  },
  skeletonTitle: {
    width: responsiveWidth(20),
    height: responsiveHeight(1.5),
    borderRadius: 7,
    marginBottom: responsiveHeight(0.8),
  },
  skeletonSubtitle: {
    width: responsiveWidth(15),
    height: responsiveHeight(1.2),
    borderRadius: 6,
  },
  bottomPadding: {
    height: responsiveHeight(8),
  },
});

export default MedicineCategory;