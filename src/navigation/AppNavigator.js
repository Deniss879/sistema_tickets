import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Auth Screens (Flujo limpio sin selector de rol)
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import AccountCreatedScreen from '../screens/auth/AccountCreatedScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import NewPasswordScreen from '../screens/auth/NewPasswordScreen';

// Admin Screens (Completamente intacto, sin tocar)
import DashboardScreen from '../screens/main/DashboardScreen';
import TicketListScreen from '../screens/main/TicketListScreen';
import TicketDetailScreen from '../screens/main/TicketDetailScreen';
import CreateTicketScreen from '../screens/main/CreateTicketScreen';
import EquipmentListScreen from '../screens/main/EquipmentListScreen';
import RegisterEquipmentScreen from '../screens/main/RegisterEquipmentScreen';
import ReportsScreen from '../screens/main/ReportsScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import DrawerMenu from '../screens/main/DrawerMenu';

// User Screens (Flujo 100% independiente para el Usuario)
import UserHomeScreen from '../screens/user/UserHomeScreen';
import UserCreateTicketScreen from '../screens/user/UserCreateTicketScreen';
import UserTicketDetailScreen from '../screens/user/UserTicketDetailScreen';
import UserTicketListScreen from '../screens/user/UserTicketListScreen';
import UserDrawerMenu from '../screens/user/UserDrawerMenu';

const Stack = createStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="AccountCreated" component={AccountCreatedScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
    </Stack.Navigator>
  );
}

// Stack exclusivo de Administrador (Sin tocar, 100% intacto y preservado)
function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Dashboard">
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="TicketList" component={TicketListScreen} />
      <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
      <Stack.Screen name="CreateTicket" component={CreateTicketScreen} />
      <Stack.Screen name="EquipmentList" component={EquipmentListScreen} />
      <Stack.Screen name="RegisterEquipment" component={RegisterEquipmentScreen} />
      <Stack.Screen name="RegisterUser" component={RegisterScreen} />
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

// Stack exclusivo de Usuario (Simple, claro, enfocado en reportar fallas)
function UserStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="UserHome">
      <Stack.Screen name="UserHome" component={UserHomeScreen} />
      <Stack.Screen name="CreateTicket" component={UserCreateTicketScreen} />
      <Stack.Screen name="TicketDetail" component={UserTicketDetailScreen} />
      <Stack.Screen name="TicketList" component={UserTicketListScreen} />
      <Stack.Screen
        name="UserDrawer"
        component={UserDrawerMenu}
        options={{
          presentation: 'transparentModal',
          headerShown: false,
          cardStyle: { backgroundColor: 'transparent' },
        }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator({ initialRoute = 'Auth' }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
      <Stack.Screen name="Auth" component={AuthStack} />
      <Stack.Screen name="User" component={UserStack} />
      <Stack.Screen name="Admin" component={AdminStack} />
      <Stack.Screen name="Main" component={AdminStack} />
    </Stack.Navigator>
  );
}
