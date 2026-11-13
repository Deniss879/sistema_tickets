import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Auth Screens
import SplashScreen from '../screens/auth/SplashScreen';
import RoleSelectScreen from '../screens/auth/RoleSelectScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import AccountCreatedScreen from '../screens/auth/AccountCreatedScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import NewPasswordScreen from '../screens/auth/NewPasswordScreen';

// Main Screens
import DashboardScreen from '../screens/main/DashboardScreen';
import TicketListScreen from '../screens/main/TicketListScreen';
import TicketDetailScreen from '../screens/main/TicketDetailScreen';
import CreateTicketScreen from '../screens/main/CreateTicketScreen';
import EquipmentListScreen from '../screens/main/EquipmentListScreen';
import RegisterEquipmentScreen from '../screens/main/RegisterEquipmentScreen';
import ReportsScreen from '../screens/main/ReportsScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import DrawerMenu from '../screens/main/DrawerMenu';

const Stack = createStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="AccountCreated" component={AccountCreatedScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Dashboard">
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="TicketList" component={TicketListScreen} />
      <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
      <Stack.Screen name="CreateTicket" component={CreateTicketScreen} />
      <Stack.Screen name="EquipmentList" component={EquipmentListScreen} />
      <Stack.Screen name="RegisterEquipment" component={RegisterEquipmentScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen
        name="DrawerMenu"
        component={DrawerMenu}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator({ initialRoute = 'Auth' }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
      <Stack.Screen name="Auth" component={AuthStack} />
      <Stack.Screen name="Main" component={MainStack} />
    </Stack.Navigator>
  );
}
