import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {Container} from '../../component/Container/Container';
import {COLORS} from '../../Theme/Colors';
import CustomHeader from '../../component/header/CustomHeader';
import {Fonts} from '../../Theme/Fonts';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
import AntDesign from 'react-native-vector-icons/AntDesign';

export default function PurchesScreen({navigation}) {
  const images = [
    {
      id: '1',
      uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9SRRmhH4X5N2e4QalcoxVbzYsD44C-sQv-w&s',
    },
    {
      id: '2',
      uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUPIfiGgUML8G3ZqsNLHfaCnZK3I5g4tJabQ&s',
    },
    {
      id: '3',
      uri: 'https://st2.depositphotos.com/1718692/7425/i/450/depositphotos_74257459-stock-photo-lake-near-the-mountain-in.jpg',
    },
    {
      id: '4',
      uri: 'https://images.unsplash.com/photo-1575936123452-b67c3203c357?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D',
    },
  ];

  const packSizes = [
    {id: '1', size: '340 ml', price: '₹405.70', stock: 'In stock'},
    {id: '2', size: '500 ml', price: '₹599.00', stock: 'In stock'},
    {id: '3', size: '1 L', price: '₹899.00', stock: 'Out of stock'},
    {id: '4', size: '250 ml', price: '₹299.00', stock: 'In stock'},
  ];

  const [mainImage, setMainImage] = useState(images[0].uri);
  const [selectedImageId, setSelectedImageId] = useState(images[0].id);
  const [selectedPackId, setSelectedPackId] = useState(packSizes[0].id);
  const [quantity, setQuantity] = useState(1);

  const handleImageChange = (newImage, id) => {
    setMainImage(newImage);
    setSelectedImageId(id);
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const selectedPack = packSizes.find(pack => pack.id === selectedPackId);
  const selectedPrice = selectedPack
    ? parseFloat(selectedPack.price.replace('₹', '').replace(',', ''))
    : 0;

  return (
    <Container
      statusBarStyle={'dark-content'}
      statusBarBackgroundColor={COLORS.white}
      backgroundColor={COLORS.white}>
      <CustomHeader title="Product Screen" navigation={navigation} />
      <ScrollView>
        <View style={styles.titleContainer}>
          <Text style={styles.productTitle}>Dabur Vatika Amla Hair Oil</Text>
        </View>
        <View style={styles.mainImageContainer}>
          <Image source={{uri: mainImage}} style={styles.mainImage} />
        </View>

        <FlatList
          data={images}
          horizontal
          renderItem={({item}) => {
            const isSelected = item.id === selectedImageId;
            return (
              <TouchableOpacity
                onPress={() => handleImageChange(item.uri, item.id)}
                style={[
                  styles.imageContainer,
                  isSelected && {
                    borderColor: COLORS.primary,
                    borderWidth: 2,
                    borderRadius: 12,
                  },
                ]}>
                <Image
                  source={{uri: item.uri}}
                  style={[
                    styles.thumbnailImage,
                    isSelected && {
                      borderColor: COLORS.primary,
                      borderWidth: 2,
                    },
                  ]}
                />
              </TouchableOpacity>
            );
          }}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.flatListContainer}
        />
        <Text style={styles.SELECTETXT}>Select Pack Size</Text>
        <View style={styles.packContainer}>
          {packSizes.map(pack => {
            const isSelected = selectedPackId === pack.id;
            const isOutOfStock = pack.stock === 'Out of stock';
            return (
              <TouchableOpacity
                key={pack.id}
                onPress={() => {
                  if (!isOutOfStock) setSelectedPackId(pack.id);
                }}
                style={[
                  styles.packBox,
                  isSelected && styles.selectedPackBox,
                  isOutOfStock && styles.outOfStockBox,
                ]}>
                <Text
                  style={[
                    styles.sizeText,
                    {
                      backgroundColor: isSelected
                        ? COLORS.DODGERBLUE
                        : COLORS.TEAL,
                    },
                  ]}>
                  {pack.size}
                </Text>
                <Text style={styles.priceText}>{pack.price}</Text>
                <Text
                  style={[
                    styles.stockText,
                    {color: isOutOfStock ? COLORS.red : COLORS.green},
                  ]}>
                  {isOutOfStock ? 'Out of stock' : 'In stock'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.PRICETXT}>
          ₹402
          <Text style={{textDecorationLine: 'line-through'}}>
            {'  '}MRP₹445
          </Text>
        </Text>
        <View style={styles.MenufactirDetailsContainer}>
          <Text style={styles.Title1}>Manufacturing/Marketer</Text>
          <Text style={styles.Title2}>Hindustan Universal</Text>
          <Text style={styles.Title1}>Manufacturing/Marketer</Text>
          <Text style={styles.Title2}>Hindustan Universal</Text>
        </View>
      </ScrollView>
      <View style={styles.bottomCartSection}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={decreaseQuantity}
            style={styles.iconButton}>
            <AntDesign name="minus" size={18} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity
            onPress={increaseQuantity}
            style={styles.iconButton}>
            <AntDesign name="plus" size={18} color={COLORS.black} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.cartButton}>
          <Text style={styles.cartButtonText}>Add to Cart</Text>
          <Text style={[styles.priceText, {color: COLORS.white}]}>
            ₹{(selectedPrice * quantity).toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  productTitle: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Bold,
    color: COLORS.black,
    marginBottom: scale(10),
    marginLeft: scale(15),
    marginTop: scale(8),
  },
  mainImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(20),
  },
  mainImage: {
    width: scale(250),
    height: scale(250),
    borderRadius: 10,
    resizeMode: 'cover',
  },
  flatListContainer: {
    paddingHorizontal: scale(15),
  },
  imageContainer: {
    marginRight: scale(8),
    padding: scale(2),
    borderRadius: moderateScale(10),
  },
  thumbnailImage: {
    width: scale(50),
    height: scale(50),
    borderRadius: moderateScale(8),
    borderWidth: moderateScale(1),
    borderColor: COLORS.gray,
    resizeMode: 'cover',
  },
  SELECTETXT: {
    marginHorizontal: scale(15),
    fontSize: moderateScale(15),
    fontFamily: Fonts.Light,
    color: COLORS.black,
    marginTop: scale(15),
  },
  packContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: scale(15),
    marginTop: scale(10),
  },
  PRICETXT: {
    marginHorizontal: scale(15),
    color: COLORS.black,
    fontSize: moderateScale(15),
    fontFamily: Fonts.Light,
  },
  packBox: {
    width: '47%',
    borderRadius: moderateScale(10),
    backgroundColor: COLORS.white,
    marginBottom: scale(12),
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  selectedPackBox: {
    borderColor: COLORS.DODGERBLUE,
    backgroundColor: COLORS.white,
  },
  outOfStockBox: {
    opacity: 0.6,
  },
  sizeText: {
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(14),
    color: COLORS.white,
    marginBottom: scale(4),
    backgroundColor: COLORS.DODGERBLUE,
    textAlign: 'center',
    borderTopRightRadius: moderateScale(8),
    borderTopLeftRadius: moderateScale(8),
    paddingVertical: verticalScale(3),
  },
  priceText: {
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(13),
    color: COLORS.darkGray,
    marginBottom: scale(3),
    textAlign: 'center',
  },
  stockText: {
    fontFamily: Fonts.Regular,
    fontSize: moderateScale(12),
    textAlign: 'center',
  },
  bottomCartSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(15),
    backgroundColor: COLORS.white,
    borderTopLeftRadius: moderateScale(18),
    borderTopRightRadius: moderateScale(18),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 25,
    borderColor: COLORS.gray,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.AshGray,
    borderRadius: moderateScale(100),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(5),
  },

  iconButton: {
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
  },

  quantityText: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Medium,
    marginHorizontal: scale(8),
    color: COLORS.black,
  },

  cartButton: {
    backgroundColor: COLORS.DODGERBLUE,
    borderRadius: moderateScale(30),
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  cartButtonText: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Bold,
    color: COLORS.white,
    marginRight: scale(10),
  },

  priceText: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Medium,
    color: COLORS.black,
    textAlign: 'center',
  },
  MenufactirDetailsContainer: {
    marginHorizontal: scale(15),
  },
  Title1: {
    fontFamily: Fonts.Bold,
    color: COLORS.black,
    fontSize: moderateScale(15),
    marginTop: scale(10),
  },
  Title2: {
    fontFamily: Fonts.Regular,
    fontSize: moderateScale(15),
    color: COLORS.DODGERBLUE,
  },
});
