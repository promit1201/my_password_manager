import React, { useState } from "react";
import { Modal, SafeAreaView, View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useThemeColors from "../../hooks/useThemeColors";
import Field from "../../components/Field";

export default function AddPasswordModal({ visible, onClose, onAdd }) {
  const c = useThemeColors();
  const [account, setAccount] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const save = () => {
    if (!account || !username || !password) return;
    onAdd({ account, username, password });
    setAccount(""); setUsername(""); setPassword(""); setShowPwd(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, padding: 16, backgroundColor: c.background }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <TouchableOpacity onPress={onClose}><Ionicons name="chevron-back" size={24} color={c.text} /></TouchableOpacity>
          <Text style={{ fontFamily: "Merriweather-Bold", fontSize: 18, color: c.text }}>Add Password</Text>
        </View>

        <View style={{ marginTop: 16, gap: 12 }}>
          <Field label="Account" value={account} onChangeText={setAccount} />
          <Field label="Username" value={username} onChangeText={setUsername} />
          <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: "Merriweather", color: c.text }}>Password</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <TextInput value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry={!showPwd}
                style={{ flex: 1, borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, backgroundColor: "#fff", fontFamily: "Merriweather" }} />
              <TouchableOpacity onPress={() => setShowPwd((v) => !v)}>
                <Ionicons name={showPwd ? "eye-off" : "eye"} size={22} color={c.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={save} style={{ backgroundColor: c.primary, borderRadius: 14, padding: 14, alignItems: "center" }}>
            <Text style={{ fontFamily: "Merriweather-Bold", color: "white" }}>Save</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
