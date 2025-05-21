// import React, {useEffect} from 'react';
// import {Image, StyleSheet, Text, View} from 'react-native';
// import {useNavigation} from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {Container} from '../../component/Container/Container';
// import {COLORS} from '../../Theme/Colors';
// import {moderateScale, scale} from '../../utils/Scaling';
// import {Fonts} from '../../Theme/Fonts';

// export default function Splash() {
//   const navigation = useNavigation();

//   // useEffect(() => {
//   //   const checkUserToken = async () => {
//   //     try {
//   //       const userToken = await AsyncStorage.getItem('userToken');
//   //       console.log(userToken);
//   //       console.log('Splash screen');
//   //       if (userToken) {
//   //         navigation.navigate('MainStack');
//   //       } else {
//   //         navigation.navigate('Login');
//   //       }
//   //     } catch (error) {
//   //       console.error('Failed to retrieve user token:', error);
//   //       navigation.navigate('Login');
//   //     }
//   //   };

//   //   const splashTimeout = setTimeout(() => {
//   //     checkUserToken();
//   //   }, 5000);

//   //   return () => {
//   //     clearTimeout(splashTimeout);
//   //   };
//   // }, [navigation]);

//   useEffect(() => {
//     const splashTimeout = setTimeout(() => {
//       // navigation.navigate('Login');
//     }, 5000);

//     return () => {
//       clearTimeout(splashTimeout);
//     };
//   }, [navigation]);

//   return (
//     <Container
//       statusBarStyle={'dark-content'}
//       statusBarBackgroundColor={COLORS.white}
//       backgroundColor={COLORS.white}>
//       <View style={{alignItems: 'center', justifyContent: 'center', flex: 1,bottom:scale(30)}}>
//         <Image
//           style={styles.splashImage}
//           source={{
//             uri: 'https://static.vecteezy.com/system/resources/previews/020/487/373/non_2x/clipboard-with-stethoscope-medical-check-form-report-health-checkup-concept-metaphor-illustration-flat-design-eps10-simple-and-modern-style-vector.jpg',
//           }}
//         />
//         <Text
//           style={{
//             color: COLORS.BITTERSEWWT,
//             fontFamily: Fonts.Bold,
//             fontSize: moderateScale(25),
            
//           }}>
//           Pathology
//         </Text>
//       </View>
//     </Container>
//   );
// }

// const styles = StyleSheet.create({
//   // splashImage: {
//   //   flex: 1,
//   //   width: '100%',
//   //   height: '100%',
//   //   resizeMode: 'cover',
//   // },
//   splashImage: {
//     width: scale(250),
//     height: scale(250),
//     resizeMode: 'contain',
//     alignSelf: 'center',
//   },
// });

import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Container } from '../../component/Container/Container';
import { COLORS } from '../../Theme/Colors';
import { moderateScale, scale } from '../../utils/Scaling';
import { Fonts } from '../../Theme/Fonts';

export default function Splash() {
  const navigation = useNavigation();

  const imageAnim = useRef(new Animated.Value(-300)).current;
  const textAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    // Animation for splash screen
    Animated.parallel([
      Animated.timing(imageAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(textAnim, {
        toValue: 230,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    const checkUserAuth = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        console.log("token",userToken)
        setTimeout(() => {
          if (userToken) {
            navigation.replace('MainStack');  
          } else {
            navigation.replace('Login');  
          }
        }, 1000);
      } catch (error) {
        console.error('Error checking auth status:', error);
        navigation.replace('Login');  
      }
    };

    checkUserAuth(); 
    return () => {
      clearTimeout();
    };
  }, [navigation, imageAnim, textAnim]);

  return (
    <Container
      statusBarStyle={'dark-content'}
      statusBarBackgroundColor={COLORS.white}
      backgroundColor={COLORS.white}>
      <View style={styles.container}>
        <Animated.View style={[styles.imageWrapper, { transform: [{ translateY: imageAnim }] }]}>
          <Image
            style={styles.splashImage}
            source={{
              uri: 'https://static.vecteezy.com/system/resources/previews/020/487/373/non_2x/clipboard-with-stethoscope-medical-check-form-report-health-checkup-concept-metaphor-illustration-flat-design-eps10-simple-and-modern-style-vector.jpg',
            }}
          />
        </Animated.View>

        <Animated.View style={[styles.textWrapper, { transform: [{ translateY: textAnim }] }]}>
          <Text style={styles.text}>New Medihub</Text>
        </Animated.View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    bottom: scale(30),
  },
  imageWrapper: {
    transform: [{ translateY: -300 }],
  },
  splashImage: {
    width: scale(250),
    height: scale(250),
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  textWrapper: {
    transform: [{ translateY: 100 }],
  },
  text: {
    color: COLORS.BITTERSEWWT,
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(25),
  },
});
