import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../Theme/Colors';
import { moderateScale, scale } from '../../utils/Scaling';
import { Fonts } from '../../Theme/Fonts';
import fcmService from '../../utils/fcmService';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

export default function Splash() {    
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [fcmToken, setFcmToken] = useState(null);

  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(50)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {   
    const animationSequence = async () => {
      // Logo animation
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
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
      const token = await fcmService.requestUserPermission();
      setFcmToken(token);

      const userToken = await AsyncStorage.getItem('userToken');
      
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
    <LinearGradient
      colors={['#3B82F6', '#2563EB']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0.7 }}
      style={styles.container}
    >
      <Animated.View 
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }]
          }
        ]}>
        <View style={styles.logoWrapper}>
          <LinearGradient
            colors={['#FFF', '#F3F4F6']}
            style={styles.logoGradient}
          >
            <Ionicons name="medkit-outline" size={80} color="#3B82F6" />
          </LinearGradient>
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
        <Text style={styles.appName}>MediSewa</Text>
        <Text style={styles.tagline}>Your Health, Our Priority</Text>
      </Animated.View>

      <Animated.View style={[styles.loadingContainer, { opacity: loadingOpacity }]}>
        <View style={styles.loadingDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
        <Text style={styles.loadingText}>Loading...</Text>
      </Animated.View>

      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Version 2.0.0</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: scale(30),
  },
  logoWrapper: {
    width: scale(140),
    height: scale(140),
    borderRadius: scale(70),
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    borderRadius: scale(70),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: scale(40),
  },
  appName: {
    color: '#FFF',
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(32),
    marginBottom: scale(8),
    textAlign: 'center',
    letterSpacing: 1,
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontFamily: Fonts.Regular,
    fontSize: moderateScale(14),
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: height * 0.25,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
    marginHorizontal: 4,
  },
  dot1: {
    opacity: 0.6,
  },
  dot2: {
    opacity: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dot3: {
    opacity: 0.6,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(12),
  },
  versionContainer: {
    position: 'absolute',
    bottom: scale(40),
    alignItems: 'center',
  },
  versionText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: Fonts.Regular,
    fontSize: moderateScale(11),
  },
});