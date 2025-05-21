import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator} from 'react-native';
import {COLORS} from '../../Theme/Colors';
import {Container} from '../../component/Container/Container';
import CustomHeader from '../../component/header/CustomHeader';
import {offerData} from '../../utils/LocalDataBase';
import OfferCard from '../../component/Offers/OfferCard';
import {moderateScale, scale} from '../../utils/Scaling';
import {Fonts} from '../../Theme/Fonts';
import {GET_OFFER_MEDICINES} from '../../api/Api_Controller';

export default function CommanSubCategory({navigation}) {
  const [offerMedicines, setOfferMedicines] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [pageOffers, setPageOffers] = useState(1);
  const [totalPagesOffers, setTotalPagesOffers] = useState(1);
  const [offerDescription, setOfferDescription] = useState('');

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

  return (
    <Container
      statusBarStyle={'dark-content'}
      statusBarBackgroundColor={COLORS.white}
      backgroundColor={COLORS.white}>
      <CustomHeader title="Category" navigation={navigation} />
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
    </Container>
  );
}

const styles = StyleSheet.create({
  flatlistContainer: {},
  flatListContent: {
    marginHorizontal: scale(15),
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(15),
    marginTop: scale(5),
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
  Lable: {
    fontSize: moderateScale(18),
    fontFamily: Fonts.Bold,
    color: COLORS.black,
    marginHorizontal: scale(15),
  },
});
