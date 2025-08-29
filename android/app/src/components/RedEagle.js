import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useThemeColors from "../hooks/useThemeColors";

export default function RedEagle({ size = 24 }) {
  const c = useThemeColors();
  return (
    <View
      style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: c.tintRed, alignItems: "center", justifyContent: "center"
      }}>
      <Ionicons name="easel" size={Math.max(14, size * 0.6)} color={c.danger} />
    </View>
  );
}
