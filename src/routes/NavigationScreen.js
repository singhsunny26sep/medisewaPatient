import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS} from '../Theme/Colors';
import {moderateScale, scale, verticalScale} from '../utils/Scaling';

import Home from '../screens/Main/Home';
import Profile from '../screens/Main/Profile';
import Transactions from '../screens/SubProfile/Transactions';
import Login from '../screens/LoginScreen/Login';
import Splash from '../screens/LoginScreen/Splash';
import UserVerify from '../screens/LoginScreen/UserVerify';
import LabDetailsPage from '../screens/SubHome/NearestLab/LabDetailsPage';
import NearestLabPage from '../screens/SubHome/NearestLab/NearestLabPage';
import BookAppointment from '../screens/BookAppointment/BookAppointment';
import SelectHealthP from '../screens/BookAppointment/SelectHealthP';
import Reports from '../screens/SubHome/Reports/Reports';
import HealthCheckUp from '../screens/SubHome/HealthCheckUp/HealthCheckUp';
import Dr10 from '../screens/SubHome/DR10Mint/drin10min';
import RecommendedLabDetails from '../screens/SubHome/HealthCheckUp/RecommendedLabDetails';
import UserAppointments from '../screens/BookAppointment/UserAppointments';
import EditProfile from '../screens/Profile/EditProfile';
import PasswordManager from '../screens/Profile/PasswordManager';
import MyAppointment from '../screens/Profile/MyAppointment';
import HelpCenter from '../screens/Profile/HelpCenter';
import PrivacyPolicy from '../screens/Profile/PrivacyPolicy';
import ForgotPassword from '../screens/Profile/ForgotPassword';
import MainStack from './BottomTab';
import Dr_List from '../screens/Dr_List/Dr_List';
import Dr_AppointmentBook from '../screens/Dr_List/Dr_AppointmentBook';
import All_Medicine_Category from '../screens/All_Medicine/AllMedicineCategory';
import AllMedicineCategory from '../screens/All_Medicine/AllMedicineCategory';
import CommanCategoryDetails from '../screens/All_Medicine/CommanCategoryDetails';
import CommanSubCategory from '../screens/All_Medicine/CommanSubCategory';
import PurchesScreen from '../screens/PurchesScreen/PurchesScreen';
import Signup from '../screens/LoginScreen/Signup';
import Pre_View_Order from '../screens/Cart/Pre_View_Order';
import OrderHistory from '../screens/OrderHistory/OrderHistory';
import Add_FamilyMember from '../screens/Profile/Add_FamilyMember';
import MedicineScreen from '../screens/All_Medicine/MedicineScreen';
import MainPurchesScreen from '../screens/PurchesScreen/MainPurchesScreen';
import BrandCardDetails from '../screens/All_Medicine/BrandCardDetails';
import BrandPurches from '../screens/PurchesScreen/BrandPurches';
import MobileVerify from '../screens/LoginScreen/MobileVerify';
import FAQ from '../screens/Profile/FAQ';
import OfferPurches from '../screens/PurchesScreen/OfferPurches';
import AudioCall from '../screens/Calling/AudioCall';
import VideoCall from '../screens/Calling/VideoCall';
import CallHistory from '../screens/Calling/CallHistory';
import MedicineCategory from '../screens/All_Medicine/MedicineCategory';
import SubCategory from '../screens/All_Medicine/SubCategory';
import Edit_Address from '../screens/Maps/Edit_Address';
import SpeciaList from '../screens/Dr_List/FindDoctor';
import FindDoctor from '../screens/Dr_List/FindDoctor';
import Specialist_List from '../screens/Dr_List/Specialist_List';
import Department_List from '../screens/Dr_List/Department_List';
import ChangeLanguage from '../screens/ChangeLanguge/ChangeLanguage';

const Stack = createNativeStackNavigator();

export default function NavigationScreen() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="UserVerify" component={UserVerify} />
        <Stack.Screen name="MainStack" component={MainStack} />
        <Stack.Screen name="NearestLabPage" component={NearestLabPage} />
        <Stack.Screen name="LabDetailsPage" component={LabDetailsPage} />
        <Stack.Screen name="BookAppointment" component={BookAppointment} />
        <Stack.Screen name="SelectHealthP" component={SelectHealthP} />
        <Stack.Screen name="UserAppointments" component={UserAppointments} />
        <Stack.Screen name="Reports" component={Reports} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="PasswordManager" component={PasswordManager} />
        <Stack.Screen name="MyAppointment" component={MyAppointment} />
        <Stack.Screen name="HelpCenter" component={HelpCenter} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="Dr_List" component={Dr_List} />
        <Stack.Screen
          name="Dr_AppointmentBook"
          component={Dr_AppointmentBook}
        />
        <Stack.Screen
          name="AllMedicineCategory"
          component={AllMedicineCategory}
        />
        <Stack.Screen
          name="CommanCategoryDetails"
          component={CommanCategoryDetails}
        />
        <Stack.Screen name="CommanSubCategory" component={CommanSubCategory} />
        <Stack.Screen name="PurchesScreen" component={PurchesScreen} />
        <Stack.Screen name="Pre_View_Order" component={Pre_View_Order} />
        <Stack.Screen name="OrderHistory" component={OrderHistory} />
        <Stack.Screen name="Add_FamilyMember" component={Add_FamilyMember} />
        <Stack.Screen name="MedicineScreen" component={MedicineScreen} />
        <Stack.Screen name="MainPurchesScreen" component={MainPurchesScreen} />
        <Stack.Screen name="BrandCardDetails" component={BrandCardDetails} />
        <Stack.Screen name="BrandPurches" component={BrandPurches} />
        <Stack.Screen name="MobileVerify" component={MobileVerify} />
        <Stack.Screen name="FAQ" component={FAQ} />
        <Stack.Screen name="OfferPurches" component={OfferPurches} />
        <Stack.Screen name="AudioCall" component={AudioCall} />
        <Stack.Screen name="VideoCall" component={VideoCall} />
        <Stack.Screen name="CallHistory" component={CallHistory} />
        <Stack.Screen name="MedicineCategory" component={MedicineCategory} />
        <Stack.Screen name="SubCategory" component={SubCategory} />
        <Stack.Screen name="Edit_Address" component={Edit_Address} />
        <Stack.Screen name="FindDoctor" component={FindDoctor} />
        <Stack.Screen name="Specialist_List" component={Specialist_List} />
        <Stack.Screen name="Department_List" component={Department_List} />
        <Stack.Screen name="ChangeLanguage" component={ChangeLanguage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
