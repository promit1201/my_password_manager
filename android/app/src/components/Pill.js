import React from "react";
import { View, Text } from "react-native";
import useThemeColors from "../hooks/useThemeColors";

export default function Pill({ children, style }) {
  const c = useThemeColors();
  return (
    <View style={[{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: c.tintBlue }, style]}>
      <Text style={{ fontFamily: "Merriweather", color: c.text }}>{children}</Text>
    </View>
  );
}
