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
import strings from '../../../localization';

export default function Add_FamilyMember({navigation}) {
  const handleSubmit = () => {};

  return (
    <Container
      statusBarStyle={'dark-content'}
      statusBarBackgroundColor={COLORS.white}
      backgroundColor={COLORS.white}>
      <CustomHeader title={strings.AddMember} navigation={navigation} />

      <ScrollView>
        <Image
          source={{
            uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdrxAyQ4zvfMK_7L0eUgHTJ4gdiwCnWk8MMuVX0K7wR_JHa8OEmHZmrjgndESQM4RIuSs&usqp=CAU',
          }}
          style={styles.image}
        />

        <View style={styles.inputContainer}>
          <CustomTextInput
            label={strings.AddMoreMember}
            placeholder={strings.AddMoreMember}
            leftIcon="person-add-outline"
          />
        </View>

        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
          <Text style={styles.submitText}>{strings.Submit}</Text>
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
