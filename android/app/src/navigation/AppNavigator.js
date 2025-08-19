import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useStore } from '../context/StoreProvider';
import { Light, Dark } from '../theme/colors';
import SignInScreen from '../screens/Auth/SignInScreen';
import Tabs from './Tabs';
import PasswordDetailsScreen from '../screens/Passwords/PasswordDetailsScreen';
import EditPasswordScreen from '../screens/Passwords/EditPasswordScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, themeMode } = useStore();
  const navTheme = themeMode === 'dark' ? Dark : Light;

  return (
    <NavigationContainer theme={navTheme}>
      {user ? (
        <Stack.Navigator>
          <Stack.Screen name="Main" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen name="PasswordDetails" component={PasswordDetailsScreen} />
          <Stack.Screen name="EditPassword" component={EditPasswordScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
