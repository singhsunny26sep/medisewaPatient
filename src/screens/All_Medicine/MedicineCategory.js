import React, {useState, useEffect} from 'react';
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
} from 'react-native';
import {Container} from '../../component/Container/Container';
import {COLORS} from '../../Theme/Colors';
import {scale, verticalScale, moderateScale} from '../../utils/Scaling';
import {Fonts} from '../../Theme/Fonts';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import CategoryCard from '../../component/Category/CategoryCard';
import {GET_BRANDS} from '../../api/Api_Controller';
import ImageSlider from '../../component/ImageSlider/ImageSlider';
import LocationModal from '../../component/LocationModal';
import {useUserLocation} from '../../utils/useUserLocation';
import ShimmerCard from '../../component/Shimmer/ShimmerCard';
import MedicineHeader from '../../component/header/MedicineHeader';

const CardColor = [
  '#E3F1FA',
  '#FDE7E3',
  '#F3E8FA',
  '#F6F8E3',
  '#FDE7E3',
  '#E3F7E7',
  '#F9F8E3',
  '#FDE7E3',
];

const numColumns = 2;
const CARD_MARGIN = 18;

const MedicineCategory = ({navigation}) => {
  const defaultLocation = useUserLocation();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCategories = async (pageNumber = 1) => {
    try {
      if (pageNumber === 1) setLoading(true);

      const data = await GET_BRANDS(pageNumber, 10);

      if (data?.success) {
        const formattedItems = data.result.map(item => ({
          id: item._id,
          title: item.title,
          image: item.image,
        }));

        if (pageNumber === 1 && data.result.length > 0) {
        }

        setCategories(prev =>
          pageNumber === 1 ? formattedItems : [...prev, ...formattedItems],
        );

        setHasMore(pageNumber < data.pagination.totalPages);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      if (pageNumber === 1) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(page);
  }, [page]);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  return (
    <Container
      statusBarStyle={'dark-content'}
      statusBarBackgroundColor={COLORS.white}
      backgroundColor={COLORS.white}>
      <MedicineHeader
        onLocationPress={() => setModalVisible(true)}
        onCartPress={() => navigation.navigate('MainStack', { screen: 'Cart' })}
        onBackPress={() => navigation.goBack()}
        location={selectedLocation || defaultLocation}
        showBackButton={true}
        onSearch={setSearchQuery}
      />
      <ScrollView>
        <ImageSlider />

        <Text style={styles.heading}>Popular Categories</Text>
        {loading ? (
          <FlatList
            data={[1, 2, 3, 4, 5, 6]}
            renderItem={() => <ShimmerCard type="category" />}
            keyExtractor={(_, index) => index.toString()}
            numColumns={numColumns}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            data={categories}
            renderItem={({item,  index}) => (
              <CategoryCard
                title={item.title}
                image={{uri: item.image}}
                bgColor={CardColor[index % CardColor.length]}
                onPress={() =>
                  navigation.navigate('SubCategory', {brandId: item.id})
                }
              />
            )}
            keyExtractor={item => item.id.toString()}
            numColumns={numColumns}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
            onEndReached={() => {
              if (hasMore) {
                setPage(prev => prev + 1);
              }
            }}
            onEndReachedThreshold={0.5}
          />
        )}
      </ScrollView>
      <LocationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onLocationSelect={handleLocationSelect}
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    borderBottomWidth: 0.5,
    padding: scale(5),
    paddingHorizontal: scale(10),
    marginTop: scale(5),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTextContainer: {
    marginLeft: scale(10),
  },
  chevronIcon: {
    marginLeft: 5,
  },
  heading: {
    fontSize: moderateScale(17),
    fontFamily: Fonts.Light,
    marginHorizontal: scale(15),
    color: COLORS.black,
    marginVertical: verticalScale(10),
  },
  flatListContent: {
    marginHorizontal: CARD_MARGIN,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: CARD_MARGIN,
  },
  subText: {
    fontSize: moderateScale(11),
    color: COLORS.grey,
    fontFamily: Fonts.Bold,
  },
  locationText: {
    fontSize: moderateScale(12),
    fontFamily: Fonts.Medium,
    color: COLORS.black,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.grey,
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(10),
    backgroundColor: COLORS.white,
    marginTop: verticalScale(25),
    marginBottom: scale(10),
  },
  searchIcon: {
    marginRight: scale(8),
  },
  searchInput: {
    flex: 1,
    paddingVertical: verticalScale(8),
    fontFamily: Fonts.Regular,
    color: COLORS.black,
    fontSize: moderateScale(14),
  },
  cartIcon: {
    marginLeft: scale(10),
    padding: scale(10),
    borderWidth: 0.5,
    borderColor: COLORS.grey,
    borderRadius: moderateScale(8),
    backgroundColor: COLORS.white,
  },
});

export default MedicineCategory;
