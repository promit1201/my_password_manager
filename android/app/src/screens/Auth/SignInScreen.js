import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { supabase } from "../../main/supabase";
import useThemeColors from "../../hooks/useThemeColors";
import RedEagle from "../../components/RedEagle";
import Pill from "../../components/Pill";

export default function SignInScreen({ navigation }) {
  const c = useThemeColors();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert("Sign in failed", error.message);
    else navigation.replace("Main");
  };

  const signUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) Alert.alert("Sign up failed", error.message);
    else Alert.alert("Check your inbox", "Confirm your email to complete sign up.");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background, padding: 20 }}>
      <View style={{ alignItems: "center", marginTop: 40, gap: 12 }}>
        <RedEagle size={64} />
        <Text style={{ fontFamily: "Merriweather-Bold", fontSize: 22, color: c.text }}>promitsproject</Text>
        <Pill>Secure. Simple. Yours.</Pill>
      </View>

      <View style={{ marginTop: 40, gap: 12 }}>
        <Text style={{ fontFamily: "Merriweather", color: c.text }}>Email</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address"
          style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, backgroundColor: "#fff", fontFamily: "Merriweather" }} />
        <Text style={{ fontFamily: "Merriweather", color: c.text }}>Password</Text>
        <TextInput value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry
          style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, backgroundColor: "#fff", fontFamily: "Merriweather" }} />

        <TouchableOpacity onPress={signIn} disabled={loading} style={{ backgroundColor: c.primary, borderRadius: 14, padding: 14, alignItems: "center", marginTop: 12 }}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ fontFamily: "Merriweather-Bold", color: "white" }}>Sign In</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={signUp} style={{ borderColor: c.primary, borderWidth: 1, borderRadius: 14, padding: 14, alignItems: "center" }}>
          <Text style={{ fontFamily: "Merriweather-Bold", color: c.primary }}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
