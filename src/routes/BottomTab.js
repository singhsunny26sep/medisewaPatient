import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import Home from '../screens/Main/Home';
import ProfileScreen from '../screens/Main/Profile';
import Icon from 'react-native-vector-icons/Ionicons';
import Cart from '../screens/Cart/Cart';
import Wallet from '../screens/Wallet/Wallet';
import strings from '../../localization';
import {useSelector} from 'react-redux';
import { Fonts } from '../Theme/Fonts';

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
        tabBarLabelStyle: {
          fontFamily:Fonts.Medium,
          fontSize: 12,
        },
      }}>
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
