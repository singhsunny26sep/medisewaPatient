import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Instance } from '../../api/Instance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Icon from 'react-native-vector-icons/Ionicons';
import AutoScrollFlatList from '../AutoScrollFlatList';
import { COLORS } from '../../Theme/Colors';
import { moderateScale, scale, verticalScale } from '../../utils/Scaling';

export default function RecommendedLabs({ navigation }) {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const response = await Instance.get('/handle-view-labs', {
            headers: {
              Authorization: token,
            },
          });
          setLabs(response.data);
        } else {
          setError(new Error('No token found'));
        }
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchLabs();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (error) return <Text style={{ alignSelf: 'center', fontWeight: 'bold', fontSize: scale(12) }}>Not Found</Text>;

  return (
    <View style={styles.container}>
      <FlatList
        data={labs}
        horizontal
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.packageTicketBox}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('LabDetailsPage', { lab: item })
              }>
              <View style={styles.packImage}>

                <Image source={{ uri: item.image }} style={{width:'90%',height:'90%',resizeMode:'contain'}} />
              </View>
              <View style={styles.ImageTittleView}>
                <View style={styles.LabNameView}>
                  <Fontisto
                    name="laboratory"
                    size={18}
                    color={COLORS.ARSENIC}
                  />
                  <Text style={styles.packagetitle}>{item.name}</Text>
                </View>
                <View style={styles.LabAddressView}>
                  <Icon name="location" size={18} color={COLORS.ARSENIC} />
                  <Text style={styles.price}>{item.address.address}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: COLORS.white,
  },
  packageTicketBox: {
    marginHorizontal: scale(5),
    backgroundColor: COLORS.AntiFlashWhite,
    borderRadius: moderateScale(10),
    marginVertical: verticalScale(5),
    elevation: 5,
  },
  packImage: {
    height: verticalScale(140),
    width: scale(190),
    backgroundColor:COLORS.white,
    // resizeMode: 'cover',
    overflow: 'hidden',
    borderRadius: moderateScale(10),
    alignItems:'center',
    justifyContent:'center'
    // justifyContent: 'flex-end',
  },
  ImageTittleView: {
    justifyContent: 'flex-end',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
  },
  packagetitle: {
    fontWeight: 'bold',
    color: COLORS.ARSENIC,
    fontSize: moderateScale(14),
    paddingLeft: scale(5),
  },
  price: {
    color: COLORS.green,
    fontWeight: 'bold',
    fontSize: moderateScale(14),
    paddingLeft: scale(5),
  },
  LabNameView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(5),
  },
  LabAddressView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: verticalScale(4),
    paddingHorizontal: scale(10),
  },
});
