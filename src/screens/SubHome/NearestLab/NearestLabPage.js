import React, {useRef, useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Instance} from '../../../api/Instance';

const {width, height} = Dimensions.get('window');

const LabCard = ({item, onPress}) => {
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
    <Animated.View style={[styles.labCard, {transform: [{scale: scaleAnim}]}]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <Image source={{uri: item.image}} style={styles.labCoverImage} />
        <View style={styles.labLogoWrapper}>
          <Image source={{uri: item.logo}} style={styles.labLogo} />
        </View>
        <View style={styles.labInfo}>
          <View style={styles.labNameRow}>
            <Fontisto name="laboratory" size={16} color="#3B82F6" />
            <Text style={styles.labName} numberOfLines={1}>
              {item.name}
            </Text>
          </View>
          <Text style={styles.labName} numberOfLines={1}>
            {item.description}
          </Text>
          <Text style={styles.labName} numberOfLines={1}>
            ₹ {item.price}
          </Text>
          
           <View style={styles.labMetaRow}>
             <View style={styles.metaBadge}>
               <Ionicons name="flask-outline" size={10} color="#10B981" />
               <Text style={styles.metaText}>{item.tests}+ Tests</Text>
             </View>
             <View style={styles.metaBadge}>
               <Ionicons name="mail-outline" size={10} color="#8B5CF6" />
               <Text style={styles.metaText}>{item.user?.email || 'N/A'}</Text>
             </View>
               <View style={styles.metaBadge}>
               <Ionicons name="location-outline" size={14} color="#6B7280" />
               <Text style={styles.metaText}>{item.user?.address || 'N/A'}</Text>
             </View>
             <View style={styles.metaBadge}>
               <Ionicons name="call-outline" size={10} color="#10B981" />
               <Text style={styles.metaText}>{item.user?.mobile || 'N/A'}</Text>
             </View>
             <View style={styles.metaBadge}>
               <Ionicons name="time-outline" size={10} color="#F59E0B" />
               <Text style={styles.metaText}>48 hrs Report</Text>
             </View>
           </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconBg}>
      <Ionicons name="flask-outline" size={50} color="#3B82F6" />
    </View>
    <Text style={styles.emptyTitle}>No Labs Found</Text>
    <Text style={styles.emptySubtitle}>
      Try searching with a different keyword
    </Text>
  </View>
);

export default function NearestLabPage({navigation}) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [labs, setLabs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [totalPages, setTotalPages] = React.useState(1);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Fetch labs from API
  const fetchLabs = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');

      const response = await Instance.get(`api/v1/labs?page=${page}&limit=${limit}`, {
        headers: {
          Authorization: token,
        },
      });
      if (response.data.success) {
        setLabs(response.data.data);
        setTotalPages(response.data.totalPages);
        console.log();
      }
    } catch (error) {
      console.error('Error fetching labs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs();

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
  }, [page, limit]);

  // Filter labs based on search
  React.useEffect(() => {
    // Filtering will be done on the client side for now
    // In a real app, you might want to send search query to the API
  }, [searchQuery]);

  const handleLabPress = item => {
    navigation.navigate('LabDetailsPage', {
      lab: item,
      locationAddress: 'Delhi, India',
    });
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      setPage(prevPage => prevPage + 1);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.locationBtn}>
          <Ionicons name="location-outline" size={16} color="#3B82F6" />
          <Text style={styles.locationText} numberOfLines={1}>
            Delhi, India
          </Text>
          <Ionicons name="chevron-down" size={14} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={22} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <LinearGradient
          colors={['#3B82F6', '#2563EB']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.searchGradient}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search labs by name or location..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </View>

      {/* Stats Row */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{labs.length}</Text>
          <Text style={styles.statLabel}>Labs Found</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>100+</Text>
          <Text style={styles.statLabel}>Tests Available</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>4.8</Text>
          <Text style={styles.statLabel}>Avg Rating</Text>
        </View>
      </View>

      {/* Welcome Banner */}
      <LinearGradient
        colors={['#EFF6FF', '#DBEAFE']}
        style={styles.welcomeBanner}>
        <View>
          <Text style={styles.welcomeTitle}>Find Best Labs Near You</Text>
          <Text style={styles.welcomeSubtitle}>
            Book lab tests at affordable prices
          </Text>
        </View>
        <View style={styles.welcomeIcon}>
          <Ionicons
            name="flask-outline"
            size={50}
            color="#3B82F6"
            opacity={0.3}
          />
        </View>
      </LinearGradient>

      {/* Labs List */}
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}],
        }}>
        <FlatList
          data={labs}
          renderItem={({item}) => (
            <LabCard item={item} onPress={() => handleLabPress(item)} />
          )}
          keyExtractor={item => item._id || item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="flask-outline" size={50} color="#3B82F6" />
              </View>
              <Text style={styles.emptyTitle}>No Labs Found</Text>
              <Text style={styles.emptySubtitle}>
                Try searching with a different keyword
              </Text>
            </View>
          )}
          onEndReached={() => {
            if (page < totalPages) {
              handleLoadMore();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && (
              <ActivityIndicator
                size="small"
                color="#3B82F6"
                style={{padding: 16}}
              />
            )
          }
        />
      </Animated.View>
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
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    maxWidth: width * 0.5,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
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
    marginTop: 16,
    marginBottom: 8,
  },
  searchGradient: {
    borderRadius: 14,
    padding: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
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
  welcomeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  welcomeIcon: {
    opacity: 0.5,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  labCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  labCoverImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  labLogoWrapper: {
    position: 'absolute',
    top: 80,
    left: 16,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  labLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: 'contain',
  },
  labInfo: {
    padding: 16,
    paddingTop: 24,
  },
  labNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  labName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textTransform: 'capitalize',
  },
  labAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  labAddress: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
   labMetaRow: {
     flexDirection: 'row',
     flexWrap: 'wrap',
     gap: 8,
     marginTop: 8,
   },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
  },
  metaText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#4B5563',
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
});
