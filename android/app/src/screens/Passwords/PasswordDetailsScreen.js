import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useStore } from "../../context/StoreProvider";
import useThemeColors from "../../hooks/useThemeColors";
import { getStrength } from "../../utils/passwordUtils";
import { downloadPasswordPDF } from "../../utils/pdfUtils";

export default function PasswordDetailsScreen({ route, navigation }) {
  const { id } = route.params || {};
  const { passwords, movePassword, deletePassword, clearSearchHistoryFor } = useStore();
  const item = passwords.find((x) => x.id === id);
  const c = useThemeColors();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: item?.account || "Password",
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 8 }}>
          <Ionicons name="chevron-back" size={22} color={c.text} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
          <TouchableOpacity onPress={() => movePassword(id, "archived")}>
            <MaterialIcons name="archive" size={22} color={c.primary} />
          </TouchableOpacity>
          <View>
            <TouchableOpacity onPress={() => setMenuOpen((v) => !v)}>
              <Ionicons name="ellipsis-vertical" size={20} color={c.text} />
            </TouchableOpacity>
            {menuOpen && (
              <View style={{ position: "absolute", right: 0, top: 26, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 12, width: 220 }}>
                {[
                  ["Clear history", () => { setMenuOpen(false); clearSearchHistoryFor(id); Alert.alert("Cleared"); }],
                  ["Delete", () => { setMenuOpen(false); deletePassword(id); navigation.goBack(); }],
                  ["Download (PDF)", () => { setMenuOpen(false); downloadPasswordPDF(item); }],
                  ["Make a copy", () => { setMenuOpen(false); Alert.alert("Copy created"); }],
                  ["Share", () => { setMenuOpen(false); Alert.alert("Share", "A secure link was generated (demo). Only signed-in users can open it."); }]
                ].map(([label, onPress]) => (
                  <TouchableOpacity key={label} onPress={onPress} style={{ padding: 12 }}>
                    <Text style={{ fontFamily: "Merriweather", color: c.text }}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      )
    });
  }, [navigation, item, c]);

  if (!item) return null;

  const strength = getStrength(item.password);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background, padding: 16 }}>
      <View style={{ gap: 14 }}>
        <View style={{ gap: 6 }}>
          <Text style={{ fontFamily: "Merriweather", color: c.text }}>Account</Text>
          <TextInput editable={false} value={item.account}
            style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, backgroundColor: "#fff", fontFamily: "Merriweather" }} />
        </View>

        <View style={{ gap: 6 }}>
          <Text style={{ fontFamily: "Merriweather", color: c.text }}>Username</Text>
          <TextInput editable={false} value={item.username}
            style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, backgroundColor: "#fff", fontFamily: "Merriweather" }} />
        </View>

        <View style={{ gap: 6 }}>
          <Text style={{ fontFamily: "Merriweather", color: c.text }}>Password</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <TextInput editable={false} value={showPwd ? item.password : "••••••••"}
              style={{ flex: 1, borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, backgroundColor: "#fff", fontFamily: "Merriweather" }} />
            <TouchableOpacity onPress={() => setShowPwd((v) => !v)}>
              <Ionicons name={showPwd ? "eye-off" : "eye"} size={22} color={c.primary} />
            </TouchableOpacity>
          </View>
          <Text style={{ fontFamily: "Merriweather", color: strength.color }}>Strength: {strength.label}</Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate("EditPassword", { id })} style={{ alignSelf: "flex-start", backgroundColor: c.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 }}>
          <Text style={{ fontFamily: "Merriweather-Bold", color: "white" }}>Edit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
