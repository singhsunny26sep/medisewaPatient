import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import {Container} from '../../component/Container/Container';
import {COLORS} from '../../Theme/Colors';
import CustomHeader from '../../component/header/CustomHeader';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Fonts} from '../../Theme/Fonts';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
import {
  offerData,
  ShopByBrandData,
  TabData,
  HeathEssentialData,
} from '../../utils/LocalDataBase';
import OfferCard from '../../component/Offers/OfferCard';
import ImageSlider from '../../component/ImageSlider/ImageSlider';
import SectionHeader from '../../component/header/SectionHeader';
import {useUserLocation} from '../../utils/useUserLocation';
import {Instance} from '../../api/Instance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ToastMessage from '../../component/ToastMessage/ToastMessage';
import {
  ADD_TO_CART,
  GET_BRANDS,
  GET_HEALTH_ESSENTIALS,
  GET_OFFER_MEDICINES,
} from '../../api/Api_Controller';

export default function MedicineScreen({navigation}) {
  const location = useUserLocation();
  const [healthEssentials, setHealthEssentials] = useState([]);
  const [loadingEssentials, setLoadingEssentials] = useState(true);
  const [healthEssentialDescription, setHealthEssentialDescription] =
    useState('');

  const [offerMedicines, setOfferMedicines] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [offerDescription, setOfferDescription] = useState('');

  const [brandData, setBrandData] = useState([]);
  const [brandDescription, setBrandDescription] = useState('');
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageCategory, setPageCategory] = useState(1);
  const [totalPagesCategory, setTotalPagesCategory] = useState(1);
  const [pageOffers, setPageOffers] = useState(1);
  const [totalPagesOffers, setTotalPagesOffers] = useState(1);
  const [skinCare, setSkinCare] = useState([]);
  const [skinCareDescription, setSkinCareDescription] = useState('');
  const [loadingSkinCare, setLoadingSkinCare] = useState(true);
  const [pageSkinCare, setPageSkinCare] = useState(1);
  const [totalPagesSkinCare, setTotalPagesSkinCare] = useState(1);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('');

  const fetchHealthEssentials = async (pageNumber = 1) => {
    try {
      if (pageNumber === 1) setLoadingEssentials(true);

      const data = await GET_HEALTH_ESSENTIALS(pageNumber, 20);

      if (data.success) {
        const newItems = data.result;
        setHealthEssentials(prev =>
          pageNumber === 1 ? newItems : [...prev, ...newItems],
        );
        setTotalPagesCategory(data.pagination.totalPages);

        if (pageNumber === 1 && newItems.length > 0) {
          setHealthEssentialDescription(newItems[0].description || '');
        }
      }
    } catch (error) {
      console.error('Error fetching paginated health essentials:', error);
    } finally {
      setLoadingEssentials(false);
    }
  };

  useEffect(() => {
    fetchHealthEssentials(pageCategory);
  }, [pageCategory]);

  const fetchOfferMedicines = async (pageNumber = 1) => {
    try {
      if (pageNumber === 1) setLoadingOffers(true);

      const data = await GET_OFFER_MEDICINES(pageNumber, 10);

      if (data.success) {
        const filteredOffers = data.result.filter(item => item.isOffer);

        if (pageNumber === 1 && filteredOffers.length > 0) {
          setOfferDescription(filteredOffers[0]?.description || '');
        }

        setOfferMedicines(prev =>
          pageNumber === 1 ? filteredOffers : [...prev, ...filteredOffers],
        );
        setTotalPagesOffers(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching offer medicines:', error);
    } finally {
      setLoadingOffers(false);
    }
  };

  useEffect(() => {
    fetchOfferMedicines(pageOffers);
  }, [pageOffers]);

  const fetchSkinCare = async (pageNumber = 1) => {
    try {
      if (pageNumber === 1) setLoadingSkinCare(true);

      const data = await GET_OFFER_MEDICINES(pageNumber, 10);

      if (data.success) {
        const filteredSkincare = data.result.filter(item => item.isOffer);

        if (pageNumber === 1 && filteredSkincare.length > 0) {
          setSkinCareDescription(filteredSkincare[0]?.description || '');
        }

        setSkinCare(prev =>
          pageNumber === 1 ? filteredSkincare : [...prev, ...filteredSkincare],
        );
        setTotalPagesSkinCare(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching skincare:', error);
    } finally {
      setLoadingSkinCare(false);
    }
  };

  useEffect(() => {
    fetchSkinCare(pageSkinCare);
  }, [pageSkinCare]);

  const getDiscountedPrice = (price, offer, type) => {
    if (type === 'percentage') {
      return Math.round(price - (price * offer) / 100);
    } else {
      return price - offer;
    }
  };

  const fetchBrandData = async (pageNumber = 1) => {
    try {
      if (pageNumber === 1) setLoadingBrands(true);

      const data = await GET_BRANDS(pageNumber, 10);

      if (data.success) {
        if (pageNumber === 1 && data.result.length > 0) {
          setBrandDescription(data.result[0]?.description || '');
        }

        setBrandData(prev =>
          pageNumber === 1 ? data.result : [...prev, ...data.result],
        );
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching brand data:', error);
    } finally {
      if (pageNumber === 1) setLoadingBrands(false);
    }
  };

  useEffect(() => {
    fetchBrandData(page);
  }, [page]);

  const handleAddToCart = async item => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setToastType('error');
        setToastMessage('Please login to add items to cart');
        return;
      }
      const payload = {
        id: item._id,
        quantity: item.quntity,
      };

      const data = await ADD_TO_CART(payload, token);

      if (data.success) {
        setToastType('success');
        setToastMessage('Item added to cart!');
      } else {
        setToastType('error');
        setToastMessage('Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setToastType('error');
      setToastMessage('Something went wrong');
    }
  };

  const brandCardColors = ['#D0F0FD', '#D8F3DC', '#FFD1DC', '#E0BBE4'];
  const renderBrandCard = ({item, index}) => {
    const backgroundColor = brandCardColors[index % brandCardColors.length];
    return (
      <TouchableOpacity
        style={[styles.brandCard, {backgroundColor}]}
        onPress={() =>
          navigation.navigate('BrandCardDetails', {brandId: item._id})
        }>
        <View style={styles.imageCircle}>
          <Image source={{uri: item.image}} style={styles.brandImage} />
        </View>
        <Text style={styles.brandName}>{item.title}</Text>
        <Text style={styles.brandOff}>Brand</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Container
      statusBarStyle={'dark-content'}
      statusBarBackgroundColor={COLORS.white}
      backgroundColor={COLORS.white}>
      <CustomHeader title="Medicine" navigation={navigation} />
      <ScrollView>
        <View style={{borderBottomWidth: 0.5}}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.subText}>Delivering to</Text>
              <Text style={styles.locationText}>{location || 'Loading..'}</Text>
            </View>
            <View style={styles.iconRow}>
              <TouchableOpacity
                style={styles.icon}
                onPress={() => navigation.navigate('Profile')}>
                <FontAwesome
                  name="user-circle-o"
                  size={25}
                  color={COLORS.black}
                />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="notifications" size={25} color={COLORS.black} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.searchContainer}>
            <View style={styles.searchRow}>
              <View style={styles.searchBox}>
                <TextInput
                  placeholder="Search Medicine"
                  style={styles.searchInput}
                  placeholderTextColor={COLORS.grey}
                />
                <FontAwesome name="search" size={20} color={COLORS.grey} />
              </View>
              <TouchableOpacity
                style={styles.cartIcon}
                onPress={() => navigation.navigate('Cart')}>
                <Ionicons name="cart-outline" size={24} color={COLORS.black} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <ImageSlider />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabContainer}>
          {TabData.map(item => (
            <TouchableOpacity key={item.id} style={styles.smallCard} onPress={()=>navigation.navigate('MedicineCategory')}>
              <Image source={{uri: item.Img}} style={styles.smallCardImage} />
              <Text style={styles.smallCardTitle}>{item.title}</Text>
              <Text style={styles.offtitle}>{item.off}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={styles.Lable}>
          {healthEssentialDescription || 'Health Essentials'}
        </Text>

        {loadingEssentials ? (
          <ActivityIndicator
            size="large"
            color={COLORS.DODGERBLUE}
            style={{marginVertical: 20}}
          />
        ) : (
          <FlatList
            data={healthEssentials}
            keyExtractor={(item, index) => `${item._id}-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContainer}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.essentialCard}
                onPress={() =>
                  navigation.navigate('AllMedicineCategory', {id: item._id})
                }>
                <Image
                  source={{uri: item.image}}
                  style={styles.essentialImage}
                />
                <Text style={styles.essentialTitle} numberOfLines={2}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            )}
            onEndReached={() => {
              if (pageCategory < totalPagesCategory) {
                setPageCategory(prev => prev + 1);
              }
            }}
            onEndReachedThreshold={0.5}
          />
        )}
        <Text style={styles.Lable}>
          {offerDescription || "Offers You Can't Miss"}
        </Text>
        {loadingOffers ? (
          <ActivityIndicator
            size="large"
            color={COLORS.DODGERBLUE}
            style={{marginVertical: 20}}
          />
        ) : (
          <View style={styles.flatlistContainer}>
            <FlatList
              data={offerMedicines}
              horizontal
              renderItem={({item}) => (
                <OfferCard
                  item={{
                    title: item.title,
                    image: item.images[0]?.image,
                    discountedPrice: getDiscountedPrice(
                      item.price,
                      item.offer,
                      item.offerType,
                    ),
                    originalPrice: item.price,
                    discount: `${item.offer}${
                      item.offerType === 'percentage' ? '%' : '₹'
                    } OFF`,
                    quantity: `${item.quntity} ${item.unit}`,
                    deliveryTime: 'Delivery in 2-4 days',
                    _id: item._id,
                  }}
                  onPress={() => navigation.navigate('OfferPurches', {item})}
                  AddCart={() => handleAddToCart(item)}
                />
              )}
              keyExtractor={(item, index) => `${item._id}-${index}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.flatListContent}
              onEndReached={() => {
                if (pageOffers < totalPagesOffers) {
                  setPageOffers(prev => prev + 1);
                }
              }}
              onEndReachedThreshold={0.5}
            />
          </View>
        )}
        <Text style={[styles.offerTitle, styles.OfferLable]}>
          {brandDescription || 'Shop by Brand'}
        </Text>
        {loadingBrands ? (
          <ActivityIndicator
            size="large"
            color={COLORS.DODGERBLUE}
            style={{marginVertical: 20}}
          />
        ) : (
          <FlatList
            data={brandData}
            horizontal
            renderItem={renderBrandCard}
            keyExtractor={(item, index) => `${item._id}-${index}`}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.ShopFlatlist}
            onEndReached={() => {
              if (page < totalPages) {
                setPage(prev => prev + 1);
              }
            }}
            onEndReachedThreshold={0.5}
          />
        )}
        <Text style={styles.Lable}>
          {skinCareDescription || 'Best of Skincare'}
        </Text>

        <View style={styles.flatlistContainer}>
          {loadingSkinCare ? (
            <ActivityIndicator
              size="large"
              color={COLORS.DODGERBLUE}
              style={{marginVertical: 20}}
            />
          ) : (
            <FlatList
              data={skinCare}
              horizontal
              renderItem={({item}) => (
                <OfferCard
                  item={{
                    title: item.title,
                    image: item.images?.[0]?.image,
                    discountedPrice: getDiscountedPrice(
                      item.price,
                      item.offer,
                      item.offerType,
                    ),
                    originalPrice: item.price,
                    discount: `${item.offer}${
                      item.offerType === 'percentage' ? '%' : '₹'
                    } OFF`,
                    quantity: `${item.quntity} ${item.unit}`,
                    deliveryTime: 'Delivery in 2-4 days',
                    _id: item._id,
                  }}
                  onPress={() =>
                    navigation.navigate('MainPurchesScreen', {item})
                  }
                  AddCart={() => handleAddToCart(item)}
                />
              )}
              keyExtractor={(item, index) => `${item._id}-${index}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.flatListContent}
              onEndReached={() => {
                if (pageSkinCare < totalPagesSkinCare) {
                  setPageSkinCare(prev => prev + 1);
                }
              }}
              onEndReachedThreshold={0.5}
            />
          )}
        </View>
      </ScrollView>
      {toastMessage && <ToastMessage type={toastType} message={toastMessage} />}
    </Container>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
  },
  flatlistContainer: {
    flex: 1,
  },
  OfferLable: {
    marginHorizontal: scale(15),
    marginTop: scale(15),
  },
  Lable: {
    fontSize: moderateScale(18),
    fontFamily: Fonts.Bold,
    color: COLORS.black,
    marginHorizontal: scale(15),
  },
  flatListContent: {
    marginHorizontal: scale(15),
    marginTop: scale(5),
  },
  ShopFlatlist: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
  },
  subText: {
    fontSize: moderateScale(14),
    color: COLORS.black,
    fontFamily: Fonts.Bold,
  },
  locationText: {
    fontSize: moderateScale(12),
    fontFamily: Fonts.Medium,
    color: COLORS.black,
  },
  SectionHeader: {
    marginTop: scale(10),
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: scale(10),
  },
  searchContainer: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.grey,
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(10),
    backgroundColor: COLORS.white,
  },
  searchInput: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(0),
    fontFamily: Fonts.Regular,
    color: COLORS.black,
    fontSize: moderateScale(14),
    width: scale(230),
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cartIcon: {
    marginLeft: scale(10),
    padding: scale(10),
    borderWidth: 0.5,
    borderColor: COLORS.grey,
    borderRadius: moderateScale(8),
    backgroundColor: COLORS.white,
  },
  smallCard: {
    width: scale(80),
    marginRight: scale(10),
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(8),
    alignItems: 'center',
    padding: scale(6),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  smallCardImage: {
    width: scale(50),
    height: scale(50),
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(5),
  },
  smallCardTitle: {
    fontSize: moderateScale(11),
    fontFamily: Fonts.Medium,
    color: COLORS.black,
    textAlign: 'center',
  },
  offtitle: {
    fontSize: moderateScale(11),
    fontFamily: Fonts.Medium,
    color: COLORS.green,
    textAlign: 'center',
  },
  tabContainer: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(10),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Bold,
    color: COLORS.black,
  },
  viewAll: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Medium,
    color: COLORS.DODGERBLUE,
  },
  flatListContainer: {
    paddingHorizontal: scale(5),
    paddingVertical: verticalScale(10),
    bottom: scale(10),
  },
  essentialCard: {
    marginRight: scale(10),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    width: scale(80),
  },
  essentialImage: {
    width: scale(60),
    height: scale(60),
    borderRadius: moderateScale(5),
    marginBottom: verticalScale(5),
  },
  essentialTitle: {
    fontSize: moderateScale(12),
    fontFamily: Fonts.Medium,
    color: COLORS.black,
    textAlign: 'center',
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(15),
    marginBottom: scale(10),
  },
  offerTitle: {
    fontSize: moderateScale(18),
    fontFamily: Fonts.Bold,
    color: COLORS.black,
  },
  viewAll: {
    fontSize: moderateScale(14),
    color: COLORS.DODGERBLUE,
    fontFamily: Fonts.Medium,
  },
  brandCard: {
    width: scale(120),
    height: scale(135),
    backgroundColor: '#ADD8E6',
    alignItems: 'center',
    padding: scale(10),
    marginRight: scale(10),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderTopRightRadius: moderateScale(100),
    borderTopLeftRadius: moderateScale(100),
    borderBottomLeftRadius: moderateScale(14),
    borderBottomRightRadius: moderateScale(14),
  },
  imageCircle: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(35),
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(5),
  },
  brandImage: {
    width: scale(40),
    height: scale(40),
    resizeMode: 'contain',
  },
  brandName: {
    fontSize: moderateScale(13),
    fontFamily: Fonts.Bold,
    color: COLORS.black,
    textAlign: 'center',
  },
  brandOff: {
    fontSize: moderateScale(12),
    fontFamily: Fonts.Light,
    color: COLORS.green,
    textAlign: 'center',
  },
});
