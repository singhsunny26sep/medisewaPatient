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
import fcmService from '../../utils/fcmService';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function Splash() {    
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [fcmToken, setFcmToken] = useState(null);
  const [debugInfo, setDebugInfo] = useState(''); 

  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(50)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {   
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

      await new Promise(resolve => setTimeout(resolve, 600));

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

      await new Promise(resolve => setTimeout(resolve, 400));

      Animated.timing(loadingOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        checkUserAuth();
      }, 500);
    };

    animationSequence();
  }, []);

  const checkUserAuth = async () => {
    try {
      setDebugInfo('Requesting FCM permission...');
      
      const token = await fcmService.requestUserPermission();
      setFcmToken(token);
      
      setDebugInfo(`FCM Token: ${token ? 'Received' : 'Failed'}`);

      const userToken = await AsyncStorage.getItem('userToken');
      
      console.log("JWT Token Details:");
      console.log("====================");

      if (userToken) {
        console.log("JWT Token Found");
        console.log("Token Length:", userToken.length, "characters");
        console.log("Token Value:", userToken);
        
        try {
          const tokenParts = userToken.split('.');
          if (tokenParts.length === 3) {
            console.log("Token Format: JWT (3 parts detected)");
            
            const header = JSON.parse(atob(tokenParts[0]));
            
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log("Token Payload:", payload);
            
            if (payload.exp) {
              const expirationDate = new Date(payload.exp * 1000);
              const now = new Date();
              
              if (payload.userId) {
                console.log("User ID:", payload.userId);
              }
              if (payload.email) {
                console.log("User Email:", payload.email);
              }
            }
          } else {
            console.log("ℹ Token Format: Not a standard JWT");
          }
        } catch (decodeError) {
          console.log("Cannot decode token - may not be a JWT:", decodeError.message);
        }
      } else {
        console.log("No JWT Token Found in AsyncStorage");
        console.log("Available keys in AsyncStorage:", await AsyncStorage.getAllKeys());
      }
      
      console.log("====================");
      
      setDebugInfo(`User Auth: ${userToken ? 'Logged In' : 'Not Logged In'}`);
      
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
      setDebugInfo(`Error: ${error.message}`);
      setIsLoading(false);
      navigation.replace('Login');
    }
  };

  return (
    <Container
      statusBarStyle={'light-content'}
      statusBarBackgroundColor={COLORS.DODGERBLUE}
      backgroundColor={COLORS.DODGERBLUE}>
      <LinearGradient
        colors={[COLORS.DODGERBLUE, COLORS.STEELBLUE, COLORS.RobinBlue, COLORS.TEAL, COLORS.greenViridian]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}>
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
          <Text style={styles.appName}>Medisewa-Patient</Text>
          <Text style={styles.tagline}>Your Health, Our Priority</Text>
        </Animated.View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </LinearGradient>
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
    marginBottom: scale(20),
  },
  appName: {
    color: COLORS.white,
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(25),
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
  debugContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: scale(10),
    borderRadius: scale(8),
    marginBottom: scale(20),
    alignItems: 'center',
    minWidth: width * 0.8,
  },
  debugText: {
    color: COLORS.white,
    fontSize: moderateScale(10),
    fontFamily: Fonts.Medium,
    textAlign: 'center',
    marginBottom: scale(2),
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