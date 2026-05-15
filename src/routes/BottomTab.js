import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React, {useRef} from 'react';
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

const {width} = Dimensions.get('window');
const isSmallScreen = width < 380;

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
    elevation: 15,
    shadowColor: COLORS.DODGERBLUE,
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    marginHorizontal: scale(8),
    marginBottom: verticalScale(12),
    backgroundColor: COLORS.white,
    minHeight: verticalScale(65),
    maxHeight: verticalScale(75),
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    height: verticalScale(60),
    paddingTop: verticalScale(6),
    paddingBottom: verticalScale(6),
    paddingHorizontal: scale(8),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(4),
  },
  iconContainer: {
    width: isSmallScreen ? scale(40) : scale(44),
    height: isSmallScreen ? scale(40) : scale(44),
    borderRadius: moderateScale(22),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(2),
  },
  tabLabel: {
    fontFamily: Fonts.Medium,
    fontSize: moderateScale(11),
    textAlign: 'center',
    marginTop: verticalScale(1),
  },
  activeTabBackground: {
    position: 'absolute',
    top: verticalScale(4),
    width: isSmallScreen ? scale(44) : scale(48),
    height: verticalScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: COLORS.DODGERBLUE,
  },
  badgeContainer: {
    position: 'absolute',
    top: scale(-4),
    right: scale(-4),
    backgroundColor: COLORS.VERMILION,
    borderRadius: moderateScale(10),
    minWidth: scale(18),
    height: scale(18),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(4),
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: moderateScale(10),
    fontFamily: Fonts.Bold,
    textAlign: 'center',
  },
});

function CustomTabBar({state, descriptors, navigation}) {
  const cartItems = useSelector(state => state.cart?.cartItems?.length || 0);
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Smooth indicator animation
  const animateIndicator = (index) => {
    Animated.spring(animatedValue, {
      toValue: index,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  // Calculate indicator position
  const getIndicatorPosition = (index) => {
    const tabWidth = (width - scale(16)) / 4;
    return index * tabWidth + (tabWidth - scale(40)) / 2;
  };

  return (
    <View style={styles.tabBarContainer}>
      <LinearGradient
        colors={['#ffffff', '#f8f9fa']}
        style={styles.tabBar}>
        {/* Animated indicator background */}
        <Animated.View
          style={[
            styles.activeTabBackground,
            {
              transform: [
                {
                  translateX: animatedValue.interpolate({
                    inputRange: [0, 1, 2, 3],
                    outputRange: [
                      getIndicatorPosition(0),
                      getIndicatorPosition(1),
                      getIndicatorPosition(2),
                      getIndicatorPosition(3),
                    ],
                  }),
                },
              ],
            },
          ]}
        />
        
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
            animateIndicator(index);
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
              <View style={styles.iconContainer}>
                {options.tabBarIcon({
                  color: isFocused ? COLORS.white : COLORS.lightGrey,
                  size: 22,
                  focused: isFocused,
                })}
                {route.name === strings.Cart && cartItems > 0 && (
                  <View style={styles.badgeContainer}>
                    <Animated.Text style={styles.badgeText}>
                      {cartItems > 99 ? '99+' : cartItems}
                    </Animated.Text>
                  </View>
                )}
              </View>
              <Animated.Text
                style={[
                  styles.tabLabel,
                  {
                    color: isFocused ? COLORS.DODGERBLUE : COLORS.lightGrey,
                    fontWeight: isFocused ? '600' : '400',
                  },
                ]}>
                {label}
              </Animated.Text>
            </TouchableOpacity>
          );
        })}
      </LinearGradient>
    </View>
  );
}
