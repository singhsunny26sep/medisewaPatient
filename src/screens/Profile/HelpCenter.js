import React, {useState} from 'react';
import {
  Animated,
  Image,
  Linking,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  StyleSheet,
} from 'react-native';
import CustomHeader from '../../component/header/CustomHeader';
import {COLORS} from '../../Theme/Colors';
import {Fonts} from '../../Theme/Fonts';
import {Container} from '../../component/Container/Container';
import {moderateScale, scale} from '../../utils/Scaling';

export default function HelpCenter ({navigation}) {
  const menuItems = [
    {
      title: 'Chat with us',
      iconName: require('../../assets/chat.png'),
      onPress: () => console.log('Price alert'),
    },
    {
      title: '+91 80152 5582',
      iconName: require('../../assets/phone.png'),
      onPress: () => Linking.openURL(`tel:${'+91 63 5656 3434'}`),
    },
    {
      title: 'www.test.com',
      iconName: require('../../assets/chain.png'),
      onPress: () => Linking.openURL(`https:${'www.test.com'}`),
    },
    {
      title: 'hello@gmail.com',
      iconName: require('../../assets/mail.png'),
      onPress: () => Linking.openURL(`mailto:${'hello@gmail.com'}`),
    },
  ];

  const renderItem = ({item}) => (
    <TouchableOpacity style={styles.menuItem} onPress={item.onPress}>
      <View style={styles.iconAndText}>
        <Animated.View style={styles.iconWrapper}>
          <Image
            style={styles.icon}
            resizeMode="contain"
            source={item.iconName}
          />
        </Animated.View>
        <Text style={styles.menuTitle}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Container
      statusBarStyle={'dark-content'}
      statusBarBackgroundColor={COLORS.white}
      backgroundColor={COLORS.white}>
      <CustomHeader title="Help Center" navigation={navigation}/>
      <Text style={styles.heading}>Hi Test How can we help you?</Text>
      <Image
        style={styles.logoImage}
        resizeMode="contain"
        source={require('../../assets/supportIcon.jpeg')}
      />
      <FlatList
        data={menuItems}
        renderItem={renderItem}
        keyExtractor={item => item.title}
        numColumns={2}
        contentContainerStyle={[styles.container_]}
      />
    </Container>
  );
};


const styles = StyleSheet.create({
  container_: {
    marginHorizontal: scale(15),
  },
  logoImage: {
    width: scale(230),
    height: scale(150),
    alignSelf: 'center',
  },
  menuItem: {
    flex: 1,
    margin: 10,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.lightBlue,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  iconAndText: {
    alignItems: 'center',
  },
  iconWrapper: {
    marginBottom: 10,
  },
  icon: {
    width: 40,
    height: 40,
  },
  menuTitle: {
    fontSize: moderateScale(11),
    fontFamily: Fonts.Medium,
    textAlign: 'center',
    color: COLORS.black,
  },
  heading: {
    textAlign: 'center',
    fontSize: 18,
    fontFamily: Fonts.Medium,
    marginTop: scale(50),
    color: COLORS.black,
  },
  menuSubtitle: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
  },
});
