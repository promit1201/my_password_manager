import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import useMerriweather from "./src/hooks/useMerriweather";
import { StoreProvider } from "./src/context/StoreProvider";
import { LightTheme, DarkTheme } from "./src/theme/colors";
import { useColorScheme } from "react-native";

export default function App() {
  const fontsReady = useMerriweather();
  const scheme = useColorScheme();
  if (!fontsReady) return null;

  return (
    <StoreProvider>
      <NavigationContainer theme={scheme === "dark" ? DarkTheme : LightTheme}>
        <AppNavigator />
      </NavigationContainer>
    </StoreProvider>
  );
}
