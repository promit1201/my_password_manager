import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity } from "react-native";
import { useStore } from "../../context/StoreProvider";
import useThemeColors from "../../hooks/useThemeColors";
import Pill from "../../components/Pill";

export default function EditLabelsScreen() {
  const { labels, addLabel } = useStore();
  const [input, setInput] = useState("");
  const c = useThemeColors();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background, padding: 16 }}>
      <Text style={{ fontFamily: "Merriweather-Bold", fontSize: 18, color: c.text, marginBottom: 12 }}>Edit Labels</Text>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <TextInput value={input} onChangeText={setInput} placeholder="Add new label"
          style={{ flex: 1, borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, backgroundColor: "#fff", fontFamily: "Merriweather" }} />
        <TouchableOpacity
          onPress={() => { if (input.trim()) { addLabel(input.trim()); setInput(""); } }}
          style={{ backgroundColor: c.primary, paddingHorizontal: 16, borderRadius: 12, justifyContent: "center" }}>
          <Text style={{ fontFamily: "Merriweather-Bold", color: "white" }}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
        {labels.map((l) => (<Pill key={l}>{l}</Pill>))}
      </View>
    </SafeAreaView>
  );
}
