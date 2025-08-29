import React, { useMemo, useState } from "react";
import { SafeAreaView, View, Text, TextInput, FlatList, Pressable, TouchableOpacity } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import useThemeColors from "../../hooks/useThemeColors";
import { useStore } from "../../context/StoreProvider";
import OverflowMenu from "../../components/OverflowMenu";
import RedEagle from "../../components/RedEagle";
import AddPasswordModal from "./AddPasswordModal";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function PasswordListScreen() {
  const route = useRoute();
  const { status = "active" } = route.params || {};
  const { passwords, addPassword, movePassword } = useStore();
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const c = useThemeColors();
  const nav = useNavigation();

  const filtered = useMemo(
    () => passwords.filter(p => p.status === status && ([p.account, p.username].join(" ").toLowerCase().includes(query.toLowerCase()))),
    [passwords, status, query]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ height: 54, borderBottomWidth: 1, borderBottomColor: c.border, backgroundColor: c.card, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <RedEagle size={28} />
          <Text style={{ fontFamily: "Merriweather-Bold", color: c.text }}>ALL PASSWORD</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <TouchableOpacity onPress={() => nav.navigate("PasswordDetails")}>
            <MaterialIcons name="archive" size={22} color={c.primary} />
          </TouchableOpacity>
          <OverflowMenu />
        </View>
      </View>

      <View style={{ padding: 14, gap: 10, backgroundColor: c.tintBlue, borderBottomColor: c.border, borderBottomWidth: 1 }}>
        <TextInput value={query} onChangeText={setQuery} placeholder="Search passwords" style={{ backgroundColor: "#fff", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: c.border, fontFamily: "Merriweather" }} />
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontFamily: "Merriweather-Bold", color: c.text }}>
            {status === "active" ? "All Passwords" : status === "archived" ? "Archived" : "Trash"}
          </Text>
          <View style={{ flexDirection: "row", gap: 14 }}>
            <TouchableOpacity onPress={() => setShowAdd(true)}>
              <Ionicons name="add-circle" size={26} color={c.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 14, gap: 10 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => nav.navigate("PasswordDetails", { id: item.id })}
            style={({ pressed }) => [{ padding: 14, borderRadius: 16, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, opacity: pressed ? 0.9 : 1 }]}
          >
            <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
              <RedEagle size={28} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: "Merriweather-Bold", color: c.text }}>{item.account}</Text>
                <Text style={{ fontFamily: "Merriweather", color: c.subtle }}>{item.username}</Text>
              </View>
              {status === "active" && (
                <TouchableOpacity onPress={() => movePassword(item.id, "archived")}>
                  <MaterialIcons name="archive" size={22} color={c.primary} />
                </TouchableOpacity>
              )}
              {status !== "trash" && (
                <TouchableOpacity onPress={() => movePassword(item.id, "trash")}>
                  <MaterialIcons name="delete-outline" size={22} color={c.danger} />
                </TouchableOpacity>
              )}
            </View>
          </Pressable>
        )}
        ListEmptyComponent={() => (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ fontFamily: "Merriweather", color: c.subtle }}>No items yet.</Text>
          </View>
        )}
      />

      <AddPasswordModal visible={showAdd} onClose={() => setShowAdd(false)} onAdd={addPassword} />
    </SafeAreaView>
  );
}
