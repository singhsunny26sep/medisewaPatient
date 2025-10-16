import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import React, {useRef, useEffect} from 'react';
import Home from '../screens/Main/Home';
import ProfileScreen from '../screens/Main/Profile';
import Icon from 'react-native-vector-icons/Ionicons';
import Cart from '../screens/Cart/Cart';
import Wallet from '../screens/Wallet/Wallet';
import strings from '../../localization';
import {useSelector} from 'react-redux';
import {Fonts} from '../Theme/Fonts';
import {COLORS} from '../Theme/Colors';
import {scale, verticalScale, moderateScale} from '../utils/Scaling';
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const {width, height} = Dimensions.get('window');
const isSmallScreen = width < 380;
const isLargeScreen = width > 420;


const Tab = createBottomTabNavigator();

export default function MainStack() {
  const language = useSelector(state => state.Common.language);

  return (
    <Tab.Navigator
      key={language}
      initialRouteName={strings.Home}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
      tabBar={props => <CustomTabBar {...props} />}>
      <Tab.Screen
        name={strings.Home}
        component={Home}
        options={{
          tabBarIcon: ({color, size, focused}) => (
            <Icon
              name={focused ? 'home' : 'home-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name={strings.Cart}
        component={Cart}
        options={{
          tabBarIcon: ({color, size, focused}) => (
            <Icon
              name={focused ? 'cart' : 'cart-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tab.Screen
        name={strings.Wallet}
        component={Wallet}
        options={{
          tabBarIcon: ({color, size, focused}) => (
            <Icon
              name={focused ? 'wallet' : 'wallet-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name={strings.Profile}
        component={ProfileScreen}
        options={{
          tabBarIcon: ({color, size, focused}) => (
            <Icon
              name={focused ? 'person' : 'person-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'relative',
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    elevation: 12,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    marginHorizontal: scale(15),
    marginBottom: verticalScale(8),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    minHeight: verticalScale(60),
    maxHeight: verticalScale(70),
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    height: isSmallScreen ? verticalScale(60) : verticalScale(65),
    minHeight: verticalScale(55),
    maxHeight: verticalScale(75),
    paddingTop: verticalScale(8),
    paddingBottom: verticalScale(5),
    paddingHorizontal: isSmallScreen ? scale(2) : scale(5),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(5),
    paddingHorizontal: scale(2),
    minWidth: scale(50),
    maxWidth: scale(80),
  },
  iconContainer: {
    width: isSmallScreen ? scale(35) : scale(40),
    height: isSmallScreen ? scale(35) : scale(40),
    minWidth: scale(30),
    minHeight: scale(30),
    maxWidth: scale(50),
    maxHeight: scale(50),
    borderRadius: moderateScale(isSmallScreen ? 17.5 : 20),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(2),
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  tabLabel: {
    fontFamily: Fonts.Bold,
    textAlign: 'center',
    marginTop: verticalScale(2),
    marginBottom: verticalScale(2),
    backgroundColor: 'transparent',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: verticalScale(5),
    width: scale(16),
    height: scale(2),
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(1),
  },
  animatedIndicator: {
    position: 'absolute',
    bottom: verticalScale(10),
    width: scale(25),
    height: scale(3),
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(2),
    shadowColor: '#4facfe',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 8,
  },
  badgeContainer: {
    position: 'absolute',
    top: scale(-3),
    right: scale(-3),
    backgroundColor: '#FF3B30',
    borderRadius: moderateScale(8),
    minWidth: scale(14),
    height: scale(14),
    maxWidth: scale(20),
    maxHeight: scale(20),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(3),
    borderWidth: 1.5,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: moderateScale(8),
    fontFamily: Fonts.Bold,
    textAlign: 'center',
  },
});

function CustomTabBar({state, descriptors, navigation}) {
  const animationValue = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const cartItems = useSelector(state => state.cart?.cartItems?.length || 0);

  useEffect(() => {
    Animated.spring(animationValue, {
      toValue: state.index,
      useNativeDriver: true,
      tension: 80,
      friction: 8,
    }).start();
  }, [state.index, animationValue]);

  // Pulse animation for active tab
  useEffect(() => {
    const pulseAnimationLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimationLoop.start();

    return () => {
      pulseAnimationLoop.stop();
    };
  }, [pulseAnimation]);

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const {options} = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          // Animated icon scale and pulse
          const scaleValue = useRef(new Animated.Value(1)).current;
          const bounceValue = useRef(new Animated.Value(0)).current;

          useEffect(() => {
            if (isFocused) {
              // Pulse animation for active tab
              Animated.spring(scaleValue, {
                toValue: 1.3,
                useNativeDriver: true,
                tension: 100,
                friction: 3,
              }).start();

              // Bounce animation - only for active tab
              const bounceAnimation = Animated.loop(
                Animated.sequence([
                  Animated.timing(bounceValue, {
                    toValue: -3,
                    duration: 800,
                    useNativeDriver: true,
                  }),
                  Animated.timing(bounceValue, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                  }),
                ])
              );
              bounceAnimation.start();

              return () => bounceAnimation.stop();
            } else {
              Animated.spring(scaleValue, {
                toValue: 1,
                useNativeDriver: true,
                tension: 100,
                friction: 3,
              }).start();

              Animated.timing(bounceValue, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }).start();
            }
          }, [isFocused, scaleValue, bounceValue]);

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? {selected: true} : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
              activeOpacity={0.7}>
              <Animated.View style={[
                styles.iconContainer,
                {
                  transform: [
                    {scale: isFocused ? pulseAnimation : scaleValue},
                    {translateY: bounceValue}
                  ],
                  backgroundColor: isFocused
                    ? 'rgba(255,255,255,0.25)'
                    : 'rgba(255,255,255,0.05)',
                  borderColor: isFocused
                    ? 'rgba(255,255,255,0.4)'
                    : 'rgba(255,255,255,0.1)',
                  shadowColor: isFocused ? '#4facfe' : 'transparent',
                  shadowOffset: {
                    width: 0,
                    height: isFocused ? 4 : 0,
                  },
                  shadowOpacity: isFocused ? 0.8 : 0,
                  shadowRadius: isFocused ? 8 : 0,
                  elevation: isFocused ? 8 : 0,
                }
              ]}>
                {options.tabBarIcon({
                  color: isFocused ? COLORS.white : 'rgba(255,255,255,0.7)',
                  size: isFocused ? 22 : 20,
                  focused: isFocused,
                })}
                {route.name === strings.Cart && cartItems > 0 && (
                  <View style={styles.badgeContainer}>
                    <Animated.Text style={styles.badgeText}>
                      {cartItems > 99 ? '99+' : cartItems}
                    </Animated.Text>
                  </View>
                )}
              </Animated.View>
              <Animated.Text style={[
                styles.tabLabel,
                {
                  color: isFocused ? COLORS.white : 'rgba(255,255,255,0.7)',
                  fontSize: isFocused ? moderateScale(13) : moderateScale(12),
                  textShadowColor: isFocused ? 'rgba(79, 172, 254, 0.8)' : 'transparent',
                  textShadowOffset: {width: 0, height: 0},
                  textShadowRadius: isFocused ? 4 : 0,
                }
              ]}>
                {label}
              </Animated.Text>
              {isFocused && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Animated indicator */}
      <Animated.View
        style={[
          styles.animatedIndicator,
          {
            transform: [
              {
                translateX: animationValue.interpolate({
                  inputRange: [0, 1, 2, 3],
                  outputRange: [
                    scale(20),
                    scale(20) + scale(55),
                    scale(20) + scale(110),
                    scale(20) + scale(165),
                  ],
                }),
              },
            ],
          },
        ]}
      />
    </LinearGradient>
  );
}
