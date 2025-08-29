import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useThemeColors from "../hooks/useThemeColors";
import { useNavigation } from "@react-navigation/native";
import Menu from "./Menu";
import { useStore } from "../context/StoreProvider";

export default function OverflowMenu() {
  const [open, setOpen] = useState(false);
  const c = useThemeColors();
  const nav = useNavigation();
  const { signOut } = useStore();

  return (
    <View>
      <TouchableOpacity onPress={() => setOpen((v) => !v)}>
        <Ionicons name="ellipsis-vertical" size={22} color={c.text} />
      </TouchableOpacity>
      {open && (
        <View style={{ position: "absolute", right: 0, top: 28, borderRadius: 12, backgroundColor: c.card, borderColor: c.border, borderWidth: 1, paddingVertical: 6, width: 180 }}>
          <Menu label="Settings" onPress={() => { setOpen(false); nav.navigate("SettingsScreen"); }} />
          <Menu label="Exit" onPress={() => { setOpen(false); signOut(); }} />
        </View>
      )}
    </View>
  );
}
