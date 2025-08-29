import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Tabs from "./Tabs";
import PasswordDetailsScreen from "../screens/Passwords/PasswordDetailsScreen";
import EditPasswordScreen from "../screens/Passwords/EditPasswordScreen";
import SignInScreen from "../screens/Auth/SignInScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Main" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen name="PasswordDetails" component={PasswordDetailsScreen} />
      <Stack.Screen name="EditPassword" component={EditPasswordScreen} />
    </Stack.Navigator>
  );
}
