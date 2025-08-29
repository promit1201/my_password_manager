import React from "react";
import { View, Text, TextInput } from "react-native";
import useThemeColors from "../hooks/useThemeColors";

export default function Field({ label, style, ...rest }) {
  const c = useThemeColors();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontFamily: "Merriweather", color: c.text }}>{label}</Text>
      <TextInput
        {...rest}
        style={[
          { borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, backgroundColor: "#fff", fontFamily: "Merriweather" },
          style
        ]}
      />
    </View>
  );
}
