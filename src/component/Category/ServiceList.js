import React, {useState, useEffect} from 'react';
import {
  FlatList,
  Image,
  Text,
  StyleSheet,
  Pressable,
  View,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {verticalScale, scale, moderateScale} from '../../utils/Scaling';
import {Fonts} from '../../Theme/Fonts';
import {COLORS} from '../../Theme/Colors';
import {useNavigation} from '@react-navigation/native';
import strings from '../../../localization';
import {useSelector} from 'react-redux';

const backgroundColors = [
  ['#e0f7fa', '#b2ebf2', '#80deea'],
  ['#f3e5f5', '#e1bee7', '#ce93d8'],
  ['#FFE3EC', '#FFB6C1', '#FF9AA2'],
  ['#e8f5e9', '#c8e6c9', '#a5d6a7'],
];

const ServiceList = () => {
  const navigation = useNavigation();
  const language = useSelector(state => state.Common.language);
  const [servicesData, setServicesData] = useState([]);

  useEffect(() => {
    setServicesData([
      {
        id: 1,
        title: strings.OnlineDoctorConsultations,
        img: 'https://png.pngtree.com/png-clipart/20240701/original/pngtree-indian-doctor-woman-smiling-at-camera-png-image_15456626.png',
        screen: 'Dr_List',
      },
      {
        id: 2,
        title: strings.LabTestsAndScans,
        img: 'https://static.vecteezy.com/system/resources/thumbnails/048/742/000/small/microscope-isolated-against-a-transparent-background-png.png',
        screen: 'NearestLabPage',
      },
      {
        id: 3,
        title: strings.Reports,
        img: 'https://static.vecteezy.com/system/resources/previews/021/950/979/non_2x/3d-file-report-icon-illustration-png.png',
        screen: 'Reports',
      },
      {
        id: 4,
        title: strings.OrderMedicines,
        img: 'https://static.vecteezy.com/system/resources/thumbnails/043/987/887/small/medicine-3d-icon-png.png',
        screen: 'MedicineScreen',
      },
    ]);
  }, [language]);

  return (
    <View>
      <FlatList
        data={servicesData}
        keyExtractor={item => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          marginHorizontal: scale(5),
        }}
        renderItem={({item, index}) => (
          <TouchableOpacity onPress={() => navigation.navigate(item.screen)}>
            <LinearGradient
              colors={backgroundColors[index % backgroundColors.length]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.serviceCard}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View style={{flex: 1}}>
                  <Text style={styles.serviceTitle}>{item.title}</Text>
                  <View style={styles.arrowWrapper}>
                    <FontAwesome5 name="arrow-right" size={14} color="#fff" />
                  </View>
                </View>
                <Image source={{uri: item.img}} style={styles.serviceImage} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default ServiceList;

const styles = StyleSheet.create({
  serviceCard: {
    width: scale(200),
    height: verticalScale(100),
    borderRadius: moderateScale(15),
    padding: moderateScale(15),
    marginHorizontal: scale(5),
    marginVertical: verticalScale(10),
    justifyContent: 'center',
    overflow: 'hidden',
  },
  serviceTitle: {
    fontSize: moderateScale(14),
    color: COLORS.black,
    fontFamily: Fonts.Bold,
    marginBottom: verticalScale(10),
  },
  serviceImage: {
    height: scale(65),
    width: scale(65),
    marginLeft: scale(10),
    resizeMode: 'contain',
  },
  arrowWrapper: {
    position: 'absolute',
    right: 80,
    bottom: -25,
    backgroundColor: '#007bb2',
    padding: scale(8),
    borderRadius: scale(50),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    height: scale(30),
    width: scale(30),
  },
});
