import React, { useEffect, useRef, useState } from 'react';
import { 
  Animated, 
  Image, 
  StyleSheet, 
  Text, 
  View, 
  Dimensions,
  ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Container } from '../../component/Container/Container';
import { COLORS } from '../../Theme/Colors';
import { moderateScale, scale } from '../../utils/Scaling';
import { Fonts } from '../../Theme/Fonts';

const { width, height } = Dimensions.get('window');

export default function Splash() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);

  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(50)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered animation sequence
    const animationSequence = async () => {
      // Logo animation
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      // Wait for logo animation to complete
      await new Promise(resolve => setTimeout(resolve, 600));

      // Text animation
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();

      // Wait for text animation to complete
      await new Promise(resolve => setTimeout(resolve, 400));

      // Show loading indicator
      Animated.timing(loadingOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Check authentication after animations
      setTimeout(() => {
        checkUserAuth();
      }, 500);
    };

    animationSequence();
  }, []);

  const checkUserAuth = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      console.log("token", userToken);
      
      // Add a minimum delay for better UX
      setTimeout(() => {
        setIsLoading(false);
        if (userToken) {
          navigation.replace('MainStack');
        } else {
          navigation.replace('Login');
        }
      }, 2000);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsLoading(false);
      navigation.replace('Login');
    }
  };

  return (
    <Container
      statusBarStyle={'light-content'}
      statusBarBackgroundColor={COLORS.BITTERSEWWT}
      backgroundColor={COLORS.BITTERSEWWT}>
      <View style={styles.container}>
        <View style={styles.backgroundGradient} />  
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }]
            }
          ]}>
          <View style={styles.logoWrapper}>
            <Image
              style={styles.logo}
              source={{
                uri: 'https://static.vecteezy.com/system/resources/previews/020/487/373/non_2x/clipboard-with-stethoscope-medical-check-form-report-health-checkup-concept-metaphor-illustration-flat-design-eps10-simple-and-modern-style-vector.jpg',
              }}
            />
          </View>
        </Animated.View>

        <Animated.View 
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }]
            }
          ]}>
          <Text style={styles.appName}>New Medihub</Text>
          <Text style={styles.tagline}>Your Health, Our Priority</Text>
        </Animated.View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.BITTERSEWWT,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: scale(40),
  },
  logoWrapper: {
    width: scale(180),
    height: scale(180),
    borderRadius: scale(90),
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: scale(140),
    height: scale(140),
    resizeMode: 'contain',
    borderRadius: scale(70),
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: scale(60),
  },
  appName: {
    color: COLORS.white,
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(32),
    marginBottom: scale(8),
    textAlign: 'center',
    letterSpacing: 1,
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: Fonts.Regular,
    fontSize: moderateScale(16),
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: scale(40),
  },
  loadingIndicator: {
    marginBottom: scale(12),
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(14),
  },
  versionContainer: {
    position: 'absolute',
    bottom: scale(40),
    alignItems: 'center',
  },
  versionText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: Fonts.Regular,
    fontSize: moderateScale(12),
  },
});
