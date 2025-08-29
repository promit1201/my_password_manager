import React from "react";
import { SafeAreaView, View, Text, Pressable, Switch, Alert } from "react-native";
import useThemeColors from "../../hooks/useThemeColors";
import { useStore } from "../../context/StoreProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

function Section({ title, children, inset }) {
  const c = useThemeColors();
  return (
    <View style={{ marginTop: 16, paddingHorizontal: inset ? 16 : 0 }}>
      <Text style={{ fontFamily: "Merriweather-Bold", color: c.text, marginLeft: 16, marginBottom: 8 }}>{title}</Text>
      <View style={{ backgroundColor: c.card, borderColor: c.border, borderWidth: 1, borderRadius: 16, overflow: "hidden", marginHorizontal: 16 }}>
        {children}
      </View>
    </View>
  );
}
function Row({ label, right, onPress }) {
  const c = useThemeColors();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: c.border, backgroundColor: pressed ? c.tintBlue : "transparent", flexDirection: "row", alignItems: "center", justifyContent: "space-between" })}>
      <Text style={{ fontFamily: "Merriweather", color: c.text }}>{label}</Text>
      {right}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { autoBackup, setAutoBackup } = useStore();
  const c = useThemeColors();

  const shareDB = async () => {
    try {
      const raw = await AsyncStorage.getItem("promitsproject.db.v1");
      const path = FileSystem.documentDirectory + "passwords-backup.json";
      await FileSystem.writeAsStringAsync(path, raw || "{}");
      await Sharing.shareAsync(path);
    } catch (e) { Alert.alert("Share failed", e.message); }
  };
  const backup = shareDB;
  const restore = async () => {
    Alert.alert("Restore", "Pick your backup and replace AsyncStorage (demo).");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Section title="Appearance">
        {/* Uses device scheme via Navigation theme; add your own toggle here if you want a manual switch */}
        <Row label="Dark Mode (device)" />
      </Section>

      <Section title="Database">
        <Row label="Share database" onPress={shareDB} />
        <Row label="Backup database" onPress={backup} />
        <Row label="Restore database" onPress={restore} />
        <Section title="Auto backup" inset>
          <Row label="Enable auto backup" right={<Switch value={autoBackup} onValueChange={setAutoBackup} />} />
        </Section>
      </Section>
    </SafeAreaView>
  );
}
