import React from "react";
import { Pressable, Text } from "react-native";
import useThemeColors from "../hooks/useThemeColors";

export default function Menu({ label, onPress }) {
  const c = useThemeColors();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ paddingVertical: 10, paddingHorizontal: 12, backgroundColor: pressed ? c.tintBlue : "transparent" })}>
      <Text style={{ fontFamily: "Merriweather", color: c.text }}>{label}</Text>
    </Pressable>
  );
}
