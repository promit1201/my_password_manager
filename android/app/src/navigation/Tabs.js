import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import PasswordListScreen from "../screens/Passwords/PasswordListScreen";
import EditLabelsScreen from "../screens/Settings/EditLabelsScreen";
import SettingsScreen from "../screens/Settings/SettingsScreen";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import useThemeColors from "../hooks/useThemeColors";

const Tab = createBottomTabNavigator();

export default function Tabs() {
  const c = useThemeColors();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: "#ffffff", borderTopColor: "#E2E8F0" },
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.subtle,
        tabBarIcon: ({ color, size }) => {
          const map = {
            "All Passwords": "list",
            Archived: "archive",
            Trash: "trash",
            "Edit Labels": "pricetags",
            Settings: "settings"
          };
          return <Ionicons name={map[route.name] || "ellipse"} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="All Passwords" component={PasswordListScreen} initialParams={{ status: "active" }} />
      <Tab.Screen name="Archived" component={PasswordListScreen} initialParams={{ status: "archived" }} />
      <Tab.Screen name="Trash" component={PasswordListScreen} initialParams={{ status: "trash" }} />
      <Tab.Screen name="Edit Labels" component={EditLabelsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
