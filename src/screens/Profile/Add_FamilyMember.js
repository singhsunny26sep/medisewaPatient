import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {Container} from '../../component/Container/Container';
import {COLORS} from '../../Theme/Colors';
import CustomHeader from '../../component/header/CustomHeader';
import {scale} from '../../utils/Scaling';
import CustomTextInput from '../../component/texinput/CustomTextInput';

export default function Add_FamilyMember({navigation}) {
  const handleSubmit = () => {
    console.log('Submit button pressed');
  };

  return (
    <Container
      statusBarStyle={'dark-content'}
      statusBarBackgroundColor={COLORS.white}
      backgroundColor={COLORS.white}>
      <CustomHeader title="Add Member" navigation={navigation} />

      <ScrollView>
        <Image
          source={{
            uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdrxAyQ4zvfMK_7L0eUgHTJ4gdiwCnWk8MMuVX0K7wR_JHa8OEmHZmrjgndESQM4RIuSs&usqp=CAU',
          }}
          style={styles.image}
        />

        <View style={styles.inputContainer}>
          <CustomTextInput
            label="Add More Member"
            placeholder={'Add More Member'}
            leftIcon="person-add-outline"
          />
        </View>

        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  image: {
    height: scale(120),
    width: scale(120),
    alignSelf: 'center',
    marginTop: scale(20),
  },
  inputContainer: {
    marginHorizontal: scale(15),
    marginTop: scale(30),
  },
  submitButton: {
    backgroundColor: COLORS.DODGERBLUE,
    marginHorizontal: scale(15),
    marginTop: scale(30),
    paddingVertical: scale(12),
    borderRadius: scale(8),
    alignItems: 'center',
  },
  submitText: {
    color: COLORS.white,
    fontSize: scale(16),
    fontWeight: 'bold',
  },
});
