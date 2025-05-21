import React, {useEffect, useState} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {Container} from '../../component/Container/Container';
import CustomHeader from '../../component/header/CustomHeader';
import {COLORS} from '../../Theme/Colors';
import {CategoryDetailsData, offerData} from '../../utils/LocalDataBase';
import {moderateScale, scale} from '../../utils/Scaling';
import MedicineCard from '../../component/MedicineCard';
import CategoryBanner from '../../component/Banner/CategoryBanner';
import OfferBanner from '../../component/Banner/OfferBanner';
import OfferCard from '../../component/Offers/OfferCard';
import {Fonts} from '../../Theme/Fonts';
import {Instance} from '../../api/Instance';
import SectionHeader from '../../component/header/SectionHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ToastMessage from '../../component/ToastMessage/ToastMessage';
import {
  ADD_TO_CART,
  GET_OFFER_MEDICINES,
  GET_OFFERSDATA,
} from '../../api/Api_Controller';

export default function CommanCategoryDetails({navigation}) {
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - moderateScale(40)) / 3;

  const [brands, setBrands] = useState([]);
  const [offerMedicines, setOfferMedicines] = useState([]);
  const [pageOffers, setPageOffers] = useState(1);
  const [totalPagesOffers, setTotalPagesOffers] = useState(1);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [loadingOfferMedicines, setLoadingOfferMedicines] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('');

  const fetchOfferData = async (pageNumber = 1) => {
    try {
      if (pageNumber === 1) setLoadingOffers(true);

      const data = await GET_OFFERSDATA(pageNumber, 9);
      if (data.success) {
        const newOffers = data.result;
        setBrands(prev =>
          pageNumber === 1 ? newOffers : [...prev, ...newOffers],
        );
        setTotalPagesOffers(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoadingOffers(false);
    }
  };
  useEffect(() => {
    fetchOfferData(1);
  }, []);

  const fetchOfferMedicines = async (pageNumber = 1) => {
    try {
      if (pageNumber === 1) setLoadingOfferMedicines(true);

      const data = await GET_OFFER_MEDICINES(pageNumber, 10);

      if (data.success) {
        const filteredOffers = data.result.filter(item => item.isOffer);
        setOfferMedicines(prev =>
          pageNumber === 1 ? filteredOffers : [...prev, ...filteredOffers],
        );
        setTotalPagesOffers(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching offer medicines:', error);
    } finally {
      setLoadingOfferMedicines(false);
    }
  };

  useEffect(() => {
    fetchOfferMedicines(pageOffers);
  }, [pageOffers]);

  const getDiscountedPrice = (price, offer, type) => {
    if (type === 'percentage') {
      return Math.round(price - (price * offer) / 100);
    } else {
      return price - offer;
    }
  };

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

  return (
    <Container
      statusBarStyle={'dark-content'}
      statusBarBackgroundColor={COLORS.white}
      backgroundColor={COLORS.white}>
      <CustomHeader title="Medicine Category" navigation={navigation} />
      <ScrollView>
        <CategoryBanner
          title="Hair Care Store"
          subtitle="Find all your hair care essentials"
          imageUrl="https://images.ctfassets.net/j6utfne5ne6b/5U3m7COMSvhJLxCJMxpE7r/8052bd0647a86e6288849bad27cf1c46/SILKY_SMOOTH_SHAMPOO___CONDITIONER_IMAGE_2.jpg"
        />
        <OfferBanner
          offerText="Extra 10% OFF*"
          subText="(Avail on Payment Page) *T&C"
        />
        <View style={styles.flatlistContainer}>
          {loadingOffers && pageOffers === 1 ? (
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
              style={{marginTop: 50}}
            />
          ) : (
            <FlatList
              data={brands}
              numColumns={3}
              renderItem={({item}) => (
                <MedicineCard
                  item={{
                    ...item,
                    Img: item.image,
                    off: item.discount,
                  }}
                  cardWidth={cardWidth}
                  onpress={() => navigation.navigate('CommanSubCategory')}
                />
              )}
              keyExtractor={(item, index) => `${item._id}_${index}`}
              onEndReached={() => {
                if (!loadingOffers && pageOffers < totalPagesOffers) {
                  const nextPage = pageOffers + 1;
                  setPageOffers(nextPage);
                  fetchOfferData(nextPage);
                }
              }}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                loadingOffers && pageOffers > 1 ? (
                  <View style={styles.loaderContainer}>
                    <ActivityIndicator size="small" color={COLORS.DODGERBLUE} />
                  </View>
                ) : null
              }
            />
          )}
        </View>

        <SectionHeader title="Offers You Cant Miss" onPress={console.log} />
        <View style={styles.flatlistContainer}>
          {loadingOfferMedicines ? (
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
              style={{marginTop: 30}}
            />
          ) : (
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
                  }}
                  onPress={() => navigation.navigate('OfferPurches', {item})}
                  AddCart={() => handleAddToCart(item)}
                />
              )}
              keyExtractor={item => item._id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.flatListContent}
            />
          )}
        </View>
      </ScrollView>
      {toastMessage && <ToastMessage type={toastType} message={toastMessage} />}
    </Container>
  );
}

const styles = StyleSheet.create({
  flatlistContainer: {
    flex: 1,
  },
  loaderContainer: {
    paddingVertical: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatListContent: {
    marginHorizontal: scale(15),
    marginTop: scale(5),
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(15),
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
});
