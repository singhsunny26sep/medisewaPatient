import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {Container} from '../../component/Container/Container';
import {COLORS} from '../../Theme/Colors';
import CustomHeader from '../../component/header/CustomHeader';
import {moderateScale, scale} from '../../utils/Scaling';
import {Fonts} from '../../Theme/Fonts';
import CommanCategory from '../../component/Category/CommanCategory';
import {medicinedata} from '../../data/medicineData';
import {Instance} from '../../api/Instance';

export default function AllMedicineCategory({navigation, route}) {
  const {id} = route.params;
  const [subCategories, setSubCategories] = useState([]);
  const [categoryDescription, setCategoryDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchSubCategories = async () => {
    setIsLoading(true);
    try {
      const response = await Instance.get(
        `api/v1/subCategories/category/${id}`,
      );
      if (response.data.success) {
        const results = response.data.result;
        setSubCategories(results);
        if (results.length > 0 && results[0].description) {
          setCategoryDescription(results[0].description);
        }
      } else {
        console.log('API call failed');
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubCategories();
  }, [id]);
  
  return (
    <Container
      statusBarStyle={'dark-content'}
      statusBarBackgroundColor={COLORS.white}
      backgroundColor={COLORS.white}>
      <CustomHeader title="Medicine" navigation={navigation} />
      <ScrollView>
        <View style={styles.container}>
          <Text style={styles.heading}>
            {categoryDescription || 'Look & Feel Good'}
          </Text>

          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={COLORS.DODGERBLUE}
              style={{marginVertical: 20}}
            />
          ) : (
            <FlatList
              data={subCategories}
              showsVerticalScrollIndicator={false}
              renderItem={({item}) => (
                <CommanCategory
                  title={item.title}
                  imageUrl={item.image}
                  onPress={() => navigation.navigate('CommanCategoryDetails')}
                />
              )}
              keyExtractor={item => item.id?.toString()}
              numColumns={4}
              columnWrapperStyle={styles.columnWrapper}
            />
          )}
        </View>
        <View style={styles.container}>
          <Text style={styles.heading}>Stay FIt, Stay Healthy</Text>
          <FlatList
            data={medicinedata}
            showsVerticalScrollIndicator={false}
            renderItem={({item}) => (
              <CommanCategory title={item.title} imageUrl={item.Img} />
            )}
            keyExtractor={item => item.id?.toString()}
            numColumns={4}
            columnWrapperStyle={styles.columnWrapper}
          />
        </View>
        <View style={styles.container}>
          <Text style={styles.heading}>Wellness & Everyday Needs</Text>
          <FlatList
            data={medicinedata}
            showsVerticalScrollIndicator={false}
            renderItem={({item}) => (
              <CommanCategory title={item.title} imageUrl={item.Img} />
            )}
            keyExtractor={item => item.id.toString()}
            numColumns={4}
            columnWrapperStyle={styles.columnWrapper}
          />
        </View>
        <View style={styles.container}>
          <Text style={styles.heading}>For All Your Baby's Needs</Text>
          <FlatList
            data={medicinedata}
            showsVerticalScrollIndicator={false}
            renderItem={({item}) => (
              <CommanCategory title={item.title} imageUrl={item.Img} />
            )}
            keyExtractor={item => item.id.toString()}
            numColumns={4}
            columnWrapperStyle={styles.columnWrapper}
          />
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: scale(15),
  },
  heading: {
    fontFamily: Fonts.Bold,
    color: COLORS.black,
    marginTop: scale(3),
    fontSize: moderateScale(17),
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
});
