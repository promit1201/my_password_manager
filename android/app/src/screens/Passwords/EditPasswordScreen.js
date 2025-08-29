import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../../context/StoreProvider";
import useThemeColors from "../../hooks/useThemeColors";
import { getStrength } from "../../utils/passwordUtils";

export default function EditPasswordScreen({ route, navigation }) {
  const { id } = route.params || {};
  const { passwords, updatePassword } = useStore();
  const item = passwords.find((x) => x.id === id);
  const c = useThemeColors();
  const [account, setAccount] = useState(item?.account || "");
  const [username, setUsername] = useState(item?.username || "");
  const [password, setPassword] = useState(item?.password || "");
  const [details, setDetails] = useState(item?.details || "");
  const strength = getStrength(password);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "Edit",
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 8 }}>
          <Ionicons name="chevron-back" size={22} color={c.text} />
        </TouchableOpacity>
      )
    });
  }, [navigation, c]);

  const save = () => {
    updatePassword(id, { account, username, password, details });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background, padding: 16 }}>
      <View style={{ gap: 12 }}>
        <View style={{ gap: 6 }}>
          <Text style={{ fontFamily: "Merriweather", color: c.text }}>Username</Text>
          <TextInput value={username} onChangeText={setUsername}
            style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, backgroundColor: "#fff", fontFamily: "Merriweather" }} />
        </View>

        <View style={{ gap: 6 }}>
          <Text style={{ fontFamily: "Merriweather", color: c.text }}>Password</Text>
          <TextInput value={password} onChangeText={setPassword} secureTextEntry
            style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, backgroundColor: "#fff", fontFamily: "Merriweather" }} />
          <Text style={{ fontFamily: "Merriweather", color: strength.color }}>Strength: {strength.label}</Text>
        </View>

        <View style={{ gap: 6 }}>
          <Text style={{ fontFamily: "Merriweather", color: c.text }}>Account</Text>
          <TextInput value={account} onChangeText={setAccount}
            style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, backgroundColor: "#fff", fontFamily: "Merriweather" }} />
        </View>

        <View style={{ gap: 6 }}>
          <Text style={{ fontFamily: "Merriweather", color: c.text }}>Details</Text>
          <TextInput value={details} onChangeText={setDetails} multiline numberOfLines={4}
            style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, backgroundColor: "#fff", fontFamily: "Merriweather", minHeight: 120, textAlignVertical: "top" }} />
        </View>

        <TouchableOpacity onPress={save} style={{ backgroundColor: c.primary, borderRadius: 14, padding: 14, alignItems: "center" }}>
          <Text style={{ fontFamily: "Merriweather-Bold", color: "white" }}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
