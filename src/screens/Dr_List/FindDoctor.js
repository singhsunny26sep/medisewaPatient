import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Dimensions,
  TextInput,
} from 'react-native';
import CustomDropdown from '../../component/CustomDropdown/CustomDropdown';
import {Container} from '../../component/Container/Container';
import {COLORS} from '../../Theme/Colors';
import CustomHeader from '../../component/header/CustomHeader';
import {moderateScale, scale, verticalScale} from '../../utils/Scaling';
import {Instance} from '../../api/Instance';
import {Fonts} from '../../Theme/Fonts';
import ShimmerCard from '../../component/Shimmer/ShimmerCard';

const {width} = Dimensions.get('window');

export default function FindDoctor({navigation}) {
  const [departments, setDepartments] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [filteredSpecialists, setFilteredSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [symptomInput, setSymptomInput] = useState('');
  const [searchedDoctors, setSearchedDoctors] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const fetchDepartments = Instance.get('/api/v1/departments');
    const fetchSpecialists = Instance.get('/api/v1/specializations');

    Promise.all([fetchDepartments, fetchSpecialists])
      .then(([departmentsRes, specialistsRes]) => {
        if (departmentsRes.data.success) {
          setDepartments(departmentsRes.data.result);
        }
        if (specialistsRes.data.success) {
          const result = specialistsRes.data.result;
          setSpecialists(result);
          setFilteredSpecialists(result);
        }
      })
      .catch(error => {
        console.error('API Error:', error);
      })
      .finally(() => setLoading(false));
  }, []);

  const searchDoctorsBySymptom = async () => {
    if (!symptomInput.trim()) {
      Alert.alert('Please enter symptoms', 'Enter at least one symptom to search for doctors');
      return;
    }

    try {
      setSearchLoading(true);
      setFilteredSpecialists([]); 

      const symptomsArray = symptomInput
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0); 

      if (symptomsArray.length === 0) {
        Alert.alert('Invalid Input', 'Please enter valid symptoms');
        return;
      }

      const query = symptomsArray.join(',');

      const response = await Instance.get('api/v1/doctors/searchBySymptom', {
        params: {symptom: query},
      });

      if (response.data.success) {
        if (response.data.result.length === 0) {
          Alert.alert(
            'No Doctors Found',
            'No doctors found matching your symptoms. Please try different symptoms or consult a general physician.'
          );
        }
        setSearchedDoctors(response.data.result);
      } else {
        Alert.alert('Search Failed', response.data.message || 'Failed to search doctors. Please try again.');
        setSearchedDoctors([]);
      }
    } catch (error) {
      console.error(
        'Error fetching doctors by symptom:',
        error.response?.data || error.message,
      );
      Alert.alert(
        'Error',
        'Failed to search doctors. Please check your internet connection and try again.'
      );
      setSearchedDoctors([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSpecialistChange = value => {
    setSelectedSpecialist(value);
    if (value) {
      const selected = specialists.find(spec => spec._id === value);
      setFilteredSpecialists(selected ? [selected] : []);
    } else {
      setFilteredSpecialists(specialists);
    }
  };

  const dropdownData = specialists.map(item => ({
    label: item.name,
    value: item._id,
  }));

  const renderCategory = ({item}) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() =>
        navigation.navigate('Department_List', {departmentId: item._id})
      }>
      <View style={styles.categoryImageContainer}>
        <Image source={{uri: item.image}} style={styles.categoryImage} />
      </View>
      <Text style={styles.categoryTitle} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderSpecialist = ({item}) => (
    <TouchableOpacity
      style={styles.specialistCard}
      onPress={() =>
        navigation.navigate('Specialist_List', {specialistId: item._id})
      }>
      <Image source={{uri: item.image}} style={styles.specialistImage} />
      <View style={styles.specialistInfo}>
        <Text style={styles.specialistName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.specialistType}>Specialist</Text>
      </View>
    </TouchableOpacity>
  );

  const renderShimmerCategories = () => (
    <FlatList
      data={[1, 2, 3, 4]}
      renderItem={() => <ShimmerCard type="category" />}
      keyExtractor={(_, index) => index.toString()}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoriesList}
    />
  );

  const renderShimmerSpecialists = () => (
    <FlatList
      data={[1, 2, 3, 4]}
      renderItem={() => <ShimmerCard type="doctor" />}
      keyExtractor={(_, index) => index.toString()}
      numColumns={2}
      columnWrapperStyle={styles.specialistsRow}
      contentContainerStyle={styles.specialistsList}
      scrollEnabled={false}
    />
  );

  return (
    <Container
      statusBarStyle={'dark-content'}
      statusBarBackgroundColor={COLORS.white}
      backgroundColor={COLORS.white}>
      <CustomHeader title="Find Doctors" navigation={navigation} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <CustomDropdown
              data={dropdownData}
              value={selectedSpecialist}
              onChange={handleSpecialistChange}
              placeholder="Search by Specialist"
              style={styles.dropdown}
              containerStyle={styles.dropdownContainer}
            />
          </View>
        </View>

        <View style={styles.symptomSearchSection}>
          <TextInput
            style={styles.symptomInput}
            placeholder="Search symptom (e.g. fever, cough)"
            value={symptomInput}
            onChangeText={setSymptomInput}
            returnKeyType="search"
            onSubmitEditing={searchDoctorsBySymptom}
          />
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={searchDoctorsBySymptom}>
            <Text style={styles.searchBtnText}>Search</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          {loading ? (
            renderShimmerCategories()
          ) : (
            <FlatList
              data={departments}
              renderItem={renderCategory}
              keyExtractor={item => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
            />  
          )}
        </View>
        <View style={styles.specialistsSection}>
          <Text style={styles.sectionTitle}>Specialists</Text>
          {loading ? (
            renderShimmerSpecialists()
          ) : (
            <FlatList
              data={filteredSpecialists}
              renderItem={renderSpecialist}
              keyExtractor={item => item._id}
              numColumns={2}
              columnWrapperStyle={styles.specialistsRow}
              contentContainerStyle={styles.specialistsList}
              scrollEnabled={false}
            />
          )}
        </View>
        {searchedDoctors.length > 0 && (
          <View style={styles.specialistsSection}>
            <Text style={styles.sectionTitle}>Doctors Matching Symptoms</Text>
            <FlatList
              data={searchedDoctors}
              renderItem={renderSpecialist}
              keyExtractor={item => item._id}
              numColumns={2}
              columnWrapperStyle={styles.specialistsRow}
              contentContainerStyle={styles.specialistsList}
              scrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  searchSection: {
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(15),
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  searchContainer: {
    marginHorizontal: scale(15),
  },
  dropdown: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F6FA',
    borderWidth: 0,
    paddingHorizontal: scale(20),
  },
  dropdownContainer: {
    borderRadius: 25,
    borderWidth: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: verticalScale(20),
    paddingTop: verticalScale(10),
  },
  categoriesSection: {
    marginTop: verticalScale(10),
  },
  specialistsSection: {
    marginTop: verticalScale(10),
  },
  sectionTitle: {
    fontSize: moderateScale(17),
    fontFamily: Fonts.Bold,
    color: COLORS.black,
    marginHorizontal: scale(15),
    marginBottom: scale(5),
  },
  seeAllButton: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: scale(15),
    paddingVertical: scale(8),
    borderRadius: 20,
  },
  seeAllText: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Medium,
    color: COLORS.primary,
  },
  categoriesList: {
    paddingHorizontal: scale(10),
  },
  categoryCard: {
    width: scale(110),
    alignItems: 'center',
    marginHorizontal: scale(3),
  },
  categoryImageContainer: {
    width: scale(100),
    height: scale(100),
    borderRadius: moderateScale(5),
    backgroundColor: '#F5F6FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(10),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryImage: {
    width: scale(60),
    height: scale(60),
    borderRadius: 5,
    resizeMode: 'cover',
  },
  categoryTitle: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Medium,
    color: COLORS.black,
    textAlign: 'center',
  },
  specialistsList: {
    paddingHorizontal: scale(10),
  },
  specialistsRow: {
    justifyContent: 'space-between',
    marginBottom: verticalScale(15),
  },
  specialistCard: {
    width: (width - scale(40)) / 2,
    backgroundColor: '#F5F6FA',
    borderRadius: 15,
    padding: scale(15),
    marginHorizontal: scale(5),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 3,
  },
  specialistImage: {
    width: scale(80),
    height: scale(80),
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: scale(10),
  },
  specialistInfo: {
    alignItems: 'center',
  },
  specialistName: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Bold,
    color: COLORS.black,
    marginBottom: scale(4),
  },
  specialistType: {
    fontSize: moderateScale(12),
    fontFamily: Fonts.Regular,
    color: COLORS.grey,
  },
  loader: {
    marginVertical: verticalScale(20),
  },
  symptomSearchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: scale(15),
    marginBottom: verticalScale(10),
  },
  symptomInput: {
    height: 48,
    width:360,
    borderRadius: 25,
    backgroundColor: '#F5F6FA',
    paddingHorizontal: scale(15),
    fontSize: moderateScale(14),
    borderColor: '#E0E0E0',
  },
  searchBtn: {
    marginLeft: scale(10),
    backgroundColor: COLORS.primary,
    paddingVertical: scale(10),
    paddingHorizontal: scale(15),
    borderRadius: 25,
  },
  searchBtnText: {
    color: COLORS.white,
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(14),
  },
  
});
