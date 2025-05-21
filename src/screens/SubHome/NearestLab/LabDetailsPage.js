import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
  ImageBackground,
  Modal,
} from 'react-native';
import {COLORS} from '../../../Theme/Colors';
import {moderateScale, scale, verticalScale} from '../../../utils/Scaling';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import {StatusBar} from 'react-native';
import {Container} from '../../../component/Container/Container';
import { Fonts } from '../../../Theme/Fonts';

const DEFAULT_IMAGE =
  'https://passion.healthcare/wp-content/uploads/2023/02/labimage.jpeg';
const TestImage =
  'https://th.bing.com/th/id/OIP.oVyEFHbxvD8ZFkERMHZp7wHaFK?w=477&h=333&rs=1&pid=ImgDetMain';

// this LabDetailsPage sub page of NearestLabPage screens
export default function LabDetailsPage({route, navigation}) {
  const {lab, locationAddress} = route.params;
  const [cart, setCart] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const addToCart = item => {
    setCart(prevCart => [...prevCart, item]);
  };

  const removeFromCart = item => {
    const newCart = cart.filter(
      cartItem => cartItem.labCategory.name !== item.labCategory.name,
    );
    setCart(newCart);
  };

  const handlePressAddress = address => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address,
    )}`;
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Unable to open Google Maps');
        }
      })
      .catch(() => {
        Alert.alert('Error', 'Unable to open Google Maps');
      });
  };

  const handlePressContactNumber = number => {
    const url = `tel:${number}`;
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Unable to make a call');
        }
      })
      .catch(() => {
        Alert.alert('Error', 'Unable to make a call');
      });
  };

  const renderTest = ({item}) => {
    const isInCart = cart.some(
      cartItem => cartItem.labCategory.name === item.labCategory.name,
    );
    const imageUrl = item.labCategory.image;
    return (
      <View style={styles.MaintestItemContainer}>
        <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          colors={['#F8F8F8', '#E2E3E3']}
          style={styles.testItemContainer}>
          <Image
            style={styles.testImage}
            source={{uri: item.labCategory.image}}
            resizeMode="contain"
          />
          <View style={styles.testDetailsContainer}>
            <View style={styles.testNameView}>
              <Text style={styles.testName}>{item.labCategory.name}</Text>
              <Text style={styles.testPrice}>Price: ₹ {item.price} /-</Text>
            </View>
            <View
              style={{
                justifyContent: 'center',
              }}>
              {isInCart ? (
                <TouchableOpacity
                  onPress={() => removeFromCart(item)}
                  accessibilityLabel="Remove from cart">
                  <Icon
                    name="trash-bin"
                    size={moderateScale(24)}
                    color={COLORS.red}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => addToCart(item)}
                  style={styles.addButton}
                  accessibilityLabel="Add to cart">
                  <MaterialIcons
                    name="add"
                    size={moderateScale(16)}
                    color={COLORS.white}
                  />
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const handleProceedToBook = () => {
    navigation.navigate('BookAppointment', {
      labName: lab.name,
      labId: lab._id,
      selectedTestIds: cart.map(item => item._id),
      selectedTestsname: cart.map(item => item.labCategory.name),
      locationAddress,
    });
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <ImageBackground
        style={styles.labImage}
        source={{uri: lab.image || DEFAULT_IMAGE}}
        resizeMode="contain">
        <View style={styles.headerSubContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon
              name="arrow-back-circle-sharp"
              size={35}
              color={COLORS.ARSENIC}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleModal} style={styles.modalIcon}>
            <Icon name="information-circle" size={30} color={COLORS.ARSENIC} />
          </TouchableOpacity>
        </View>
      </ImageBackground>
      <Text style={styles.title}>{lab.name}</Text>
      <View style={styles.TouchableTxt}>
        <Icon
          name="flask-outline"
          size={moderateScale(18)}
          color={COLORS.ARSENIC}
          style={styles.icon}
        />
        <Text style={styles.details}>Tests Offered:</Text>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Lab Information</Text>
            <TouchableOpacity
              style={styles.ModalAddressView}
              onPress={handlePressAddress}>
              <View style={styles.ModalSubAddressView}>
                <Icon
                  name="location-outline"
                  size={moderateScale(18)}
                  color={COLORS.ARSENIC}
                  style={styles.icon}
                />
                <Text style={styles.AddressTxt}>Address</Text>
              </View>
              <Text style={styles.modalText}>
                {`: ${lab.address.address}, ${lab.address.city}, ${lab.address.state} - ${lab.address.pinCode}`}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ModalAddressView}
              onPress={handlePressContactNumber}>
              <View style={styles.ModalSubAddressView}>
                <Icon
                  name="call-outline"
                  size={moderateScale(18)}
                  color={COLORS.ARSENIC}
                  style={styles.icon}
                />
                <Text style={styles.AddressTxt}>Mobile</Text>
              </View>
              <Text style={styles.modalText}>{`: ${lab.contactNumber}`}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );

  return (
    <Container
      statusBarStyle={'dark-content'}
      statusBarBackgroundColor={COLORS.white}
      backgroundColor={COLORS.background}>
      <FlatList
        ListHeaderComponent={renderHeader}
        data={lab.testsOffered}
        renderItem={renderTest}
        keyExtractor={item => item._id.toString()}
        contentContainerStyle={styles.scrollViewContent}
        ListEmptyComponent={
          <Text style={styles.noTests}>No tests offered</Text>
        }
      />
      {cart.length > 0 && (
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={handleProceedToBook}>
          <Text style={styles.bottomButtonText}>Proceed to book</Text>
        </TouchableOpacity>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerContainer: {
    backgroundColor: COLORS.white,
    paddingBottom: verticalScale(10),
  },
  headerSubContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  modalIcon: {},
  scrollViewContent: {
    paddingBottom: verticalScale(70),
  },
  title: {
    fontSize: moderateScale(18),
    fontFamily:Fonts.Light,
    color: COLORS.black,
    textAlign: 'center',
    paddingTop: verticalScale(5),
  },
  labImage: {
    height: verticalScale(150),
    width: '100%',
    resizeMode: 'contain',
    overflow: 'hidden',
  },
  TouchableTxt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(10),
    paddingHorizontal: scale(10),
    alignSelf: 'center',
  },
  icon: {
    paddingHorizontal: scale(2),
  },
  details: {
    fontSize: moderateScale(14),
    color: COLORS.ARSENIC,
    fontFamily:Fonts.Medium,
    width: scale(100),
    top:scale(2)
  },
  MaintestItemContainer: {
    flex: 1,
    marginHorizontal: scale(15),
    alignItems: 'center',
  },
  testItemContainer: {
    flex: 1,
    height: verticalScale(70),
    width: '100%',
    flexDirection: 'row',
    borderRadius: moderateScale(10),
    overflow: 'hidden',
    marginHorizontal: scale(15),
    marginVertical: verticalScale(10),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },

  testImage: {
    width: scale(70),
    height: verticalScale(70),
    marginRight: scale(10),
    overflow: 'hidden',
  },
  testDetailsContainer: {
    flex: 1,
    paddingHorizontal: scale(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testNameView: {},
  testName: {
    fontSize: moderateScale(15),
    fontFamily:Fonts.Bold,
    color: COLORS.black,
    width: scale(130),
  },
  testPrice: {
    fontSize: moderateScale(14),
    color: COLORS.green,
    fontFamily:Fonts.Light,
    paddingTop: verticalScale(5),
  },
  addButton: {
    backgroundColor: COLORS.DODGERBLUE,
    borderColor: COLORS.DODGERBLUE,
    borderWidth: moderateScale(1),
    paddingVertical: verticalScale(5),
    paddingHorizontal: scale(8),
    borderRadius: moderateScale(5),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  addButtonText: {
    color: COLORS.white,
    fontFamily:Fonts.Light,
    fontSize: moderateScale(14),
  },
  noTests: {
    fontSize: moderateScale(16),
    color: COLORS.ARSENIC,
    textAlign: 'center',
    marginTop: verticalScale(20),
  },
  bottomButton: {
    position: 'absolute',
    bottom: verticalScale(10),
    backgroundColor: COLORS.DODGERBLUE,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    width: scale(320),
    height: verticalScale(50),
    borderRadius: moderateScale(10),
    elevation: 3,
  },
  bottomButtonText: {
    color: COLORS.white,
    fontFamily:Fonts.Bold,
    fontSize: moderateScale(15),
    top:scale(4)
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(10),
    width: scale(320),
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: moderateScale(16),
    fontFamily:Fonts.Bold,
    marginBottom: verticalScale(10),
    color: COLORS.ARSENIC,
    textAlign: 'center',
  },
  ModalAddressView: {
    flexDirection: 'row',
    alignItems: 'center',
    width: scale(295),
    marginTop: verticalScale(5),
    backgroundColor: COLORS.white,
  },
  ModalSubAddressView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  AddressTxt: {
    fontFamily:Fonts.Bold,
    color: COLORS.ARSENIC,
    width: scale(60),
  },
  modalText: {
    fontSize: moderateScale(15),
    color: COLORS.DODGERBLUE,
    width: scale(220),
    fontFamily:Fonts.Medium,

  },
  closeButton: {
    marginTop: verticalScale(13),
    backgroundColor: COLORS.DODGERBLUE,
    height: verticalScale(30),
    width: scale(60),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: moderateScale(14),
    textAlign: 'center',
    fontFamily:Fonts.Light,
  },
});
