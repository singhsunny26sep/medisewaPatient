import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Instance} from '../../api/Instance';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
import {COLORS} from '../../Theme/Colors';
import Icon from 'react-native-vector-icons/Ionicons';
import {StatusBar} from 'react-native';
import {Container} from '../../component/Container/Container';
import CustomHeader from '../../component/header/CustomHeader';
import { Fonts } from '../../Theme/Fonts';

export default function SelectHealthP({}) {
  const navigation = useNavigation();
  const route = useRoute();
  const {onSelectProblem} = route.params;

  const [healthProblems, setHealthProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const numColumns = 3;

  useEffect(() => {
    const fetchHealthProblems = async () => {
      try {
        const response = await Instance.get('/health-problems');
        setHealthProblems(response.data.healthProblems);
      } catch (error) {
        setError('Failed to load health problems');
      } finally {
        setLoading(false);
      }
    };

    fetchHealthProblems();
  }, []);

  const handleSelectItem = item => {
    onSelectProblem(item);
    navigation.goBack();
  };

  const renderItem = ({item}) => (
      <TouchableOpacity
        style={styles.item}
        onPress={() => handleSelectItem(item)}>
        <View style={styles.imageContainer}>
          <Image source={{uri: item.image}} style={styles.imageStyle} />
        </View>
        <Text style={styles.itemText}>{item.name}</Text>
      </TouchableOpacity>
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Container
      statusBarStyle={'dark-content'}
      statusBarBackgroundColor={COLORS.white}
      backgroundColor={COLORS.white}>
      <CustomHeader title="Select Health Problem" navigation={navigation} />
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.DODGERBLUE} />
        </View>
      ) : (
        <FlatList
          data={healthProblems}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          numColumns={numColumns}
          contentContainerStyle={styles.contentContainer}
        />
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  contentContainer:{
   marginHorizontal:scale(10)
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    marginBottom: verticalScale(20),
    color: COLORS.black,
    textAlign: 'center',
  },
  
  item: {
    flex: 1,
    margin: scale(5),
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(8),
    alignItems: 'center',
    justifyContent: 'center',
    padding: verticalScale(4),
    elevation: 3,
  },
  imageContainer: {
    height: verticalScale(70),
    width: scale(70),
    marginBottom: verticalScale(10),
    borderRadius: moderateScale(60),
    overflow: 'hidden',
  },
  imageStyle: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  itemText: {
    fontFamily:Fonts.Light,
    color: COLORS.black,
    textAlign: 'center',
    fontSize:moderateScale(11)
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.red,
    fontSize: moderateScale(18),
    marginBottom: verticalScale(10),
  },
  retryText: {
    color: COLORS.DODGERBLUE,
    fontSize: moderateScale(16),
  },
});
