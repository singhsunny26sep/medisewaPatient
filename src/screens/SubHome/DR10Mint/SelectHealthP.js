import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {healthData} from '../../../component/Data/Data';
import {moderateScale, scale, verticalScale} from '../../../utils/Scaling';
import {COLORS} from '../../../Theme/Colors';
import {StatusBar} from 'react-native';

export default function SelectHealthP() {
  const navigation = useNavigation();
  const route = useRoute();
  const {onSelectProblem} = route.params;

  const numColumns = 3;

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

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.DODGERBLUE} barStyle="light-content" />
      <Text style={styles.title}>Select Health Problem</Text>
      <FlatList
        data={healthData}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        numColumns={numColumns}
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: scale(16),
    paddingTop: verticalScale(30),
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    marginBottom: verticalScale(20),
    color: COLORS.black,
    textAlign: 'center',
  },
  listContent: {
    justifyContent: 'center',
  },
  item: {
    flex: 1,
    margin: scale(5),
    backgroundColor: COLORS.DODGERBLUE,
    borderRadius: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    padding: verticalScale(10),
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
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
});
