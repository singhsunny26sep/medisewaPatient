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
    borderTopLeftRadius: moderateScale(25),
    borderTopRightRadius: moderateScale(25),
    elevation: 20,
    shadowColor: COLORS.DODGERBLUE,
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    marginHorizontal: scale(10),
    marginBottom: verticalScale(15),
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    minHeight: verticalScale(70),
    maxHeight: verticalScale(80),
    overflow: 'hidden',
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
    width: isSmallScreen ? scale(42) : scale(48),
    height: isSmallScreen ? scale(42) : scale(48),
    minWidth: scale(35),
    minHeight: scale(35),
    maxWidth: scale(55),
    maxHeight: scale(55),
    borderRadius: moderateScale(isSmallScreen ? 21 : 24),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(4),
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    position: 'relative',
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
    bottom: verticalScale(12),
    width: scale(30),
    height: scale(4),
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(2),
    shadowColor: COLORS.DODGERBLUE,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 10,
  },
  badgeContainer: {
    position: 'absolute',
    top: scale(-5),
    right: scale(-5),
    backgroundColor: COLORS.VERMILION,
    borderRadius: moderateScale(10),
    minWidth: scale(18),
    height: scale(18),
    maxWidth: scale(25),
    maxHeight: scale(25),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(4),
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: COLORS.VERMILION,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: moderateScale(9),
    fontFamily: Fonts.Bold,
    textAlign: 'center',
    includeFontPadding: false,
  },
  glowEffect: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: moderateScale(26),
    backgroundColor: 'rgba(255,255,255,0.1)',
    shadowColor: COLORS.DODGERBLUE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
});

function CustomTabBar({state, descriptors, navigation}) {
  const animationValue = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const floatingAnimation = useRef(new Animated.Value(0)).current;
  const cartItems = useSelector(state => state.cart?.cartItems?.length || 0);

  useEffect(() => {
    Animated.spring(animationValue, {
      toValue: state.index,
      useNativeDriver: true,
      tension: 80,
      friction: 8,
    }).start();
  }, [state.index, animationValue]);

  // Floating animation for the entire tab bar
  useEffect(() => {
    const floatingAnimationLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnimation, {
          toValue: -2,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnimation, {
          toValue: 2,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    floatingAnimationLoop.start();

    return () => {
      floatingAnimationLoop.stop();
    };
  }, [floatingAnimation]);

  // Pulse animation for active tab
  useEffect(() => {
    const pulseAnimationLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1200,
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
    <Animated.View style={{transform: [{translateY: floatingAnimation}]}}>
      <LinearGradient
        colors={[COLORS.DODGERBLUE, COLORS.STEELBLUE, COLORS.RobinBlue, COLORS.TEAL, COLORS.greenViridian]}
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
              activeOpacity={0.5}>
              <Animated.View style={[
                styles.iconContainer,
                {
                  transform: [
                    {scale: isFocused ? pulseAnimation : scaleValue},
                    {translateY: bounceValue}
                  ],
                  backgroundColor: isFocused
                    ? 'rgba(255,255,255,0.3)'
                    : 'rgba(255,255,255,0.08)',
                  borderColor: isFocused
                    ? 'rgba(255,255,255,0.5)'
                    : 'rgba(255,255,255,0.2)',
                  shadowColor: isFocused ? COLORS.DODGERBLUE : 'transparent',
                  shadowOffset: {
                    width: 0,
                    height: isFocused ? 6 : 0,
                  },
                  shadowOpacity: isFocused ? 0.9 : 0,
                  shadowRadius: isFocused ? 12 : 0,
                  elevation: isFocused ? 12 : 0,
                }
              ]}>
                {isFocused && (
                  <View style={styles.glowEffect} />
                )}
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
    </Animated.View>
  );
}
