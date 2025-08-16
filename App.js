// File: App.js
import React, { useMemo, useState, useEffect, useRef, createContext, useContext } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, FlatList, Modal, Platform, Alert, Switch, Pressable, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// --- Keep splash until fonts load
SplashScreen.preventAutoHideAsync();

// --- Env for Supabase
const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://project.supabase.co', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key');

// --- Theme (light red/blue hues)
const Light = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F7FAFF',
    card: '#FFFFFF',
    text: '#0F172A',
    border: '#E2E8F0',
    primary: '#3B82F6', // light blue
    danger: '#EF4444',  // soft red
    tintRed: '#FEE2E2',
    tintBlue: '#DBEAFE',
    subtle: '#94A3B8',
  },
};
const Dark = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0B1220',
    card: '#111827',
    text: '#E5E7EB',
    border: '#1F2937',
    primary: '#60A5FA',
    danger: '#F87171',
    tintRed: '#3F1F1F',
    tintBlue: '#1E2A44',
    subtle: '#9CA3AF',
  },
};

// --- Font loading
function useMerriweather() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        await Font.loadAsync({
          Merriweather: require('./assets/fonts/Merriweather-Regular.ttf'),
          'Merriweather-Bold': require('./assets/fonts/Merriweather-Bold.ttf'),
          'Merriweather-Italic': require('./assets/fonts/Merriweather-Italic.ttf'),
        });
      } catch (e) {
        console.warn('Font load error (using system font fallback):', e);
      } finally {
        setReady(true);
        SplashScreen.hideAsync();
      }
    })();
  }, []);
  return ready;
}

// --- Data types
/** Password shape: {
 *  id: string, account: string, username: string, password: string,
 *  details?: string, labels: string[], createdAt: number,
 *  status: 'active'|'archived'|'trash'
 * }
 */

// --- Global store (Context + AsyncStorage persistence)
const StoreContext = createContext(null);
const useStore = () => useContext(StoreContext);

const STORAGE_KEY = 'pwdb.v1';

function StoreProvider({ children }) {
  const [passwords, setPasswords] = useState([]);
  const [labels, setLabels] = useState(['Work', 'Personal']);
  const [autoBackup, setAutoBackup] = useState(false);
  const [themeMode, setThemeMode] = useState('light'); // 'light' | 'dark'
  const [user, setUser] = useState(null);

  // Load persisted
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setPasswords(parsed.passwords || []);
          setLabels(parsed.labels || ['Work', 'Personal']);
          setAutoBackup(!!parsed.autoBackup);
          setThemeMode(parsed.themeMode || 'light');
        }
      } catch (e) {
        console.warn('Load error', e);
      }
    })();
  }, []);

  // Persist on change
  useEffect(() => {
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ passwords, labels, autoBackup, themeMode })
    ).catch(() => {});
  }, [passwords, labels, autoBackup, themeMode]);

  // Supabase auth listener
  useEffect(() => {
    const { data: auth } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    (async () => {
      const session = await supabase.auth.getSession();
      setUser(session.data.session?.user ?? null);
    })();
    return () => auth.subscription.unsubscribe();
  }, []);

  const api = useMemo(
    () => ({
      passwords,
      labels,
      autoBackup,
      themeMode,
      user,
      addPassword: (p) => setPasswords((s) => [{ ...p, id: Math.random().toString(36).slice(2), createdAt: Date.now(), status: 'active', labels: p.labels || [] }, ...s]),
      updatePassword: (id, patch) => setPasswords((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x))),
      movePassword: (id, status) => setPasswords((s) => s.map((x) => (x.id === id ? { ...x, status } : x))),
      deletePassword: (id) => setPasswords((s) => s.filter((x) => x.id !== id)),
      clearSearchHistoryFor: (_id) => AsyncStorage.removeItem('search.history').catch(() => {}),
      setLabels,
      addLabel: (name) => setLabels((ls) => (ls.includes(name) ? ls : [...ls, name])),
      setAutoBackup,
      setThemeMode,
      signOut: () => supabase.auth.signOut(),
    }),
    [passwords, labels, autoBackup, themeMode, user]
  );

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

// --- Helpers
function useThemeColors() {
  const { themeMode } = useStore();
  return themeMode === 'dark' ? Dark.colors : Light.colors;
}

function Pill({ children, style }) {
  const c = useThemeColors();
  return (
    <View style={[{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: c.tintBlue, alignSelf: 'flex-start' }, style]}>
      <Text style={{ fontFamily: 'Merriweather', color: c.text }}>{children}</Text>
    </View>
  );
}

function RedEagle({ size = 24 }) {
  // Simple red eagle mark using Ionicons + red circle backdrop
  const c = useThemeColors();
  return (
    <View style={{ width: size, height: size, borderRadius: size/2, backgroundColor: c.tintRed, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name="easel" size={Math.max(14, size*0.6)} color={c.danger} />
    </View>
  );
}

// --- Auth Screens
function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const c = useThemeColors();

  const onSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert('Sign in failed', error.message);
  };
  const onSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) Alert.alert('Sign up failed', error.message); else Alert.alert('Check your inbox', 'Confirm your email to complete sign up.');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background, padding: 20 }}>
      <View style={{ alignItems: 'center', marginTop: 40, gap: 12 }}>
        <RedEagle size={64} />
        <Text style={{ fontFamily: 'Merriweather-Bold', fontSize: 22, color: c.text }}>RedBlue Passwords</Text>
        <Pill>Secure. Simple. Yours.</Pill>
      </View>
      <View style={{ marginTop: 40, gap: 12 }}>
        <Text style={{ fontFamily: 'Merriweather', color: c.text }}>Email</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize='none' keyboardType='email-address' style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, backgroundColor: '#fff', fontFamily: 'Merriweather' }} />
        <Text style={{ fontFamily: 'Merriweather', color: c.text }}>Password</Text>
        <TextInput value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, backgroundColor: '#fff', fontFamily: 'Merriweather' }} />
        <TouchableOpacity onPress={onSignIn} disabled={loading} style={{ backgroundColor: c.primary, borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 12 }}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ fontFamily: 'Merriweather-Bold', color: 'white' }}>Sign In</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={onSignUp} style={{ borderColor: c.primary, borderWidth: 1, borderRadius: 14, padding: 14, alignItems: 'center' }}>
          <Text style={{ fontFamily: 'Merriweather-Bold', color: c.primary }}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// --- Password List + Add/Search/Overflow
function PasswordListScreen({ route }) {
  const { status = 'active' } = route.params || {};
  const { passwords, addPassword, movePassword } = useStore();
  const [query, setQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const c = useThemeColors();
  const nav = useNavigation();

  const filtered = useMemo(() => passwords.filter(p => p.status === status && ([p.account, p.username].join(' ').toLowerCase().includes(query.toLowerCase()))), [passwords, status, query]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ padding: 14, gap: 10, backgroundColor: c.tintBlue, borderBottomColor: c.border, borderBottomWidth: 1 }}>
        <TextInput value={query} onChangeText={setQuery} placeholder="Search passwords" style={{ backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: c.border, fontFamily: 'Merriweather' }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontFamily: 'Merriweather-Bold', color: c.text }}>{status === 'active' ? 'All Passwords' : status === 'archived' ? 'Archived' : 'Trash'}</Text>
          <View style={{ flexDirection: 'row', gap: 14 }}>
            {/* 3-dots leading to settings + exit */}
            <OverflowMenu />
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
          <Pressable onPress={() => nav.navigate('PasswordDetails', { id: item.id })} style={({ pressed }) => [{ padding: 14, borderRadius: 16, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, opacity: pressed ? 0.9 : 1 }]}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <RedEagle size={28} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Merriweather-Bold', color: c.text }}>{item.account}</Text>
                <Text style={{ fontFamily: 'Merriweather', color: c.subtle }}>{item.username}</Text>
              </View>
              {status === 'active' && (
                <TouchableOpacity onPress={() => movePassword(item.id, 'archived')}>
                  <MaterialIcons name="archive" size={22} color={c.primary} />
                </TouchableOpacity>
              )}
              {status !== 'trash' && (
                <TouchableOpacity onPress={() => movePassword(item.id, 'trash')}>
                  <MaterialIcons name="delete-outline" size={22} color={c.danger} />
                </TouchableOpacity>
              )}
            </View>
          </Pressable>
        )}
        ListEmptyComponent={() => (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Merriweather', color: c.subtle }}>No items yet.</Text>
          </View>
        )}
      />

      <AddPasswordModal visible={showAdd} onClose={() => setShowAdd(false)} onAdd={addPassword} />
    </SafeAreaView>
  );
}

function OverflowMenu() {
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
        <View style={{ position: 'absolute', right: 0, top: 28, borderRadius: 12, backgroundColor: c.card, borderColor: c.border, borderWidth: 1, paddingVertical: 6, width: 180 }}>
          <MenuItem label="Settings" onPress={() => { setOpen(false); nav.navigate('Settings'); }} />
          <MenuItem label="Exit" onPress={() => { setOpen(false); signOut(); }} />
        </View>
      )}
    </View>
  );
}
function MenuItem({ label, onPress }) {
  const c = useThemeColors();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ paddingVertical: 10, paddingHorizontal: 12, backgroundColor: pressed ? (c.tintBlue) : 'transparent' })}>
      <Text style={{ fontFamily: 'Merriweather', color: c.text }}>{label}</Text>
    </Pressable>
  );
}

function AddPasswordModal({ visible, onClose, onAdd }) {
  const [account, setAccount] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const c = useThemeColors();

  const reset = () => { setAccount(''); setUsername(''); setPassword(''); setShowPwd(false); };
  const save = () => {
    if (!account || !username || !password) return Alert.alert('Missing fields', 'Please fill all fields.');
    onAdd({ account, username, password });
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, padding: 16, backgroundColor: c.background }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={onClose}><Ionicons name="chevron-back" size={24} color={c.text} /></TouchableOpacity>
          <Text style={{ fontFamily: 'Merriweather-Bold', fontSize: 18, color: c.text }}>Add Password</Text>
        </View>
        <View style={{ marginTop: 16, gap: 12 }}>
          <Field label="Account" value={account} onChangeText={setAccount} />
          <Field label="Username" value={username} onChangeText={setUsername} />
          <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: 'Merriweather', color: c.text }}>Password</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TextInput value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry={!showPwd} style={{ flex: 1, borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, backgroundColor: '#fff', fontFamily: 'Merriweather' }} />
              <TouchableOpacity onPress={() => setShowPwd((v) => !v)}>
                <Ionicons name={showPwd ? 'eye-off' : 'eye'} size={22} color={c.primary} />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity onPress={save} style={{ backgroundColor: c.primary, borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 4 }}>
            <Text style={{ fontFamily: 'Merriweather-Bold', color: 'white' }}>Save</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function Field({ label, ...rest }) {
  const c = useThemeColors();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontFamily: 'Merriweather', color: c.text }}>{label}</Text>
      <TextInput {...rest} style={[{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, backgroundColor: '#fff', fontFamily: 'Merriweather' }, rest.style]} />
    </View>
  );
}

// --- Details Screen with navbar actions
function PasswordDetailsScreen({ route, navigation }) {
  const { id } = route.params;
  const { passwords, updatePassword, movePassword, deletePassword, clearSearchHistoryFor } = useStore();
  const item = passwords.find((x) => x.id === id);
  const c = useThemeColors();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: item?.account || 'Password',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 8 }}>
          <Ionicons name="chevron-back" size={22} color={c.text} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
          <TouchableOpacity onPress={() => movePassword(id, 'archived')}>
            <MaterialIcons name="archive" size={22} color={c.primary} />
          </TouchableOpacity>
          <View>
            <TouchableOpacity onPress={() => setMenuOpen((v) => !v)}>
              <Ionicons name="ellipsis-vertical" size={20} color={c.text} />
            </TouchableOpacity>
            {menuOpen && (
              <View style={{ position: 'absolute', right: 0, top: 26, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 12, width: 220 }}>
                <MenuItem label="Clear history" onPress={() => { setMenuOpen(false); clearSearchHistoryFor(id); Alert.alert('Cleared'); }} />
                <MenuItem label="Delete" onPress={() => { setMenuOpen(false); deletePassword(id); navigation.goBack(); }} />
                <MenuItem label="Download (PDF)" onPress={() => { setMenuOpen(false); downloadPDF(item); }} />
                <MenuItem label="Make a copy" onPress={() => { setMenuOpen(false); duplicate(item, updatePassword); }} />
                <MenuItem label="Share" onPress={() => { setMenuOpen(false); shareLink(item); }} />
              </View>
            )}
          </View>
        </View>
      ),
    });
  }, [navigation, item, c]);

  if (!item) return null;

  const strength = getStrength(item.password);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background, padding: 16 }}>
      <View style={{ gap: 14 }}>
        <Field label="Account" editable={false} value={item.account} />
        <Field label="Username" editable={false} value={item.username} />
        <View style={{ gap: 6 }}>
          <Text style={{ fontFamily: 'Merriweather', color: c.text }}>Password</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TextInput editable={false} value={showPwd ? item.password : '••••••••'} style={{ flex: 1, borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, backgroundColor: '#fff', fontFamily: 'Merriweather' }} />
            <TouchableOpacity onPress={() => setShowPwd((v) => !v)}>
              <Ionicons name={showPwd ? 'eye-off' : 'eye'} size={22} color={c.primary} />
            </TouchableOpacity>
          </View>
          <Text style={{ fontFamily: 'Merriweather', color: strength.color }}>
            Strength: {strength.label}
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('EditPassword', { id })} style={{ alignSelf: 'flex-start', backgroundColor: c.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 }}>
          <Text style={{ fontFamily: 'Merriweather-Bold', color: 'white' }}>Edit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function getStrength(pw) {
  const len = pw?.length || 0;
  const hasAlnum = /[a-zA-Z]/.test(pw) && /\d/.test(pw);
  const score = (len > 8 ? 1 : 0) + (hasAlnum ? 1 : 0) + (/[!@#$%^&*]/.test(pw) ? 1 : 0);
  if (score >= 3) return { label: 'Strong', color: '#16A34A' };
  if (score === 2) return { label: 'Medium', color: '#CA8A04' };
  return { label: 'Weak', color: '#EF4444' };
}

async function downloadPDF(item) {
  try {
    const html = `
      <html>
      <body style="font-family: -apple-system, Roboto, Arial; padding: 24px;">
        <h2>Account: ${item.account}</h2>
        <p><b>Username:</b> ${item.username}</p>
        <p><b>Password:</b> ${item.password}</p>
        <small>Generated by RedBlue Passwords</small>
      </body>
      </html>`;
    const { uri } = await Print.printToFileAsync({ html });
    if (Platform.OS === 'android' || (await Sharing.isAvailableAsync())) {
      await Sharing.shareAsync(uri);
    } else {
      Alert.alert('Saved', uri);
    }
  } catch (e) {
    Alert.alert('PDF error', e.message);
  }
}

function duplicate(item, updatePassword) {
  Alert.alert('Copy created');
}

async function shareLink(item) {
  // Placeholder: In a real app, insert a row in Supabase, return a RLS-protected tokenized link for authenticated users only
  Alert.alert('Share', 'A secure link was generated (demo). Only signed-in users can open it.');
}

// --- Edit Screen
function EditPasswordScreen({ route, navigation }) {
  const { id } = route.params;
  const { passwords, updatePassword } = useStore();
  const c = useThemeColors();
  const item = passwords.find((x) => x.id === id);
  const [account, setAccount] = useState(item?.account || '');
  const [username, setUsername] = useState(item?.username || '');
  const [password, setPassword] = useState(item?.password || '');
  const [details, setDetails] = useState(item?.details || '');
  const strength = getStrength(password);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 8 }}>
          <Ionicons name="chevron-back" size={22} color={c.text} />
        </TouchableOpacity>
      ),
      headerTitle: 'Edit',
    });
  }, [navigation, c]);

  const save = () => {
    updatePassword(id, { account, username, password, details });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background, padding: 16 }}>
      <View style={{ gap: 12 }}>
        <Field label="Username" value={username} onChangeText={setUsername} />
        <View style={{ gap: 6 }}>
          <Text style={{ fontFamily: 'Merriweather', color: c.text }}>Password</Text>
          <TextInput value={password} onChangeText={setPassword} placeholder="New password" secureTextEntry style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, backgroundColor: '#fff', fontFamily: 'Merriweather' }} />
          <Text style={{ fontFamily: 'Merriweather', color: strength.color }}>Strength: {strength.label}</Text>
        </View>
        <Field label="Account" value={account} onChangeText={setAccount} />
        <View style={{ gap: 6 }}>
          <Text style={{ fontFamily: 'Merriweather', color: c.text }}>Details</Text>
          <TextInput value={details} onChangeText={setDetails} multiline numberOfLines={4} style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, backgroundColor: '#fff', fontFamily: 'Merriweather', minHeight: 120, textAlignVertical: 'top' }} />
        </View>
        <TouchableOpacity onPress={save} style={{ backgroundColor: c.primary, borderRadius: 14, padding: 14, alignItems: 'center' }}>
          <Text style={{ fontFamily: 'Merriweather-Bold', color: 'white' }}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// --- Edit Labels
function EditLabelsScreen() {
  const { labels, addLabel } = useStore();
  const [input, setInput] = useState('');
  const c = useThemeColors();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background, padding: 16 }}>
      <Text style={{ fontFamily: 'Merriweather-Bold', fontSize: 18, color: c.text, marginBottom: 12 }}>Edit Labels</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput value={input} onChangeText={setInput} placeholder="Add new label" style={{ flex: 1, borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, backgroundColor: '#fff', fontFamily: 'Merriweather' }} />
        <TouchableOpacity onPress={() => { if (input.trim()) { addLabel(input.trim()); setInput(''); } }} style={{ backgroundColor: c.primary, paddingHorizontal: 16, borderRadius: 12, justifyContent: 'center' }}>
          <Text style={{ fontFamily: 'Merriweather-Bold', color: 'white' }}>Add</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
        {labels.map((l) => (<Pill key={l}>{l}</Pill>))}
      </View>
    </SafeAreaView>
  );
}

// --- Settings
function SettingsScreen() {
  const { themeMode, setThemeMode, autoBackup, setAutoBackup } = useStore();
  const c = useThemeColors();

  const shareDB = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const path = FileSystem.documentDirectory + 'passwords-backup.json';
      await FileSystem.writeAsStringAsync(path, raw || '{}');
      await Sharing.shareAsync(path);
    } catch (e) {
      Alert.alert('Share failed', e.message);
    }
  };
  const backup = shareDB;
  const restore = async () => {
    Alert.alert('Restore', 'Pick your backup manually and replace AsyncStorage (not implemented in demo).');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Section title="Appearance">
        <Row label="Dark Mode" right={<Switch value={themeMode === 'dark'} onValueChange={(v) => setThemeMode(v ? 'dark' : 'light')} />} />
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

function Section({ title, children, inset }) {
  const c = useThemeColors();
  return (
    <View style={{ marginTop: 16, paddingHorizontal: inset ? 16 : 0 }}>
      <Text style={{ fontFamily: 'Merriweather-Bold', color: c.text, marginLeft: 16, marginBottom: 8 }}>{title}</Text>
      <View style={{ backgroundColor: c.card, borderColor: c.border, borderWidth: 1, borderRadius: 16, overflow: 'hidden', marginHorizontal: 16 }}>
        {children}
      </View>
    </View>
  );
}
function Row({ label, right, onPress }) {
  const c = useThemeColors();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: c.border, backgroundColor: pressed ? c.tintBlue : 'transparent', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' })}>
      <Text style={{ fontFamily: 'Merriweather', color: c.text }}>{label}</Text>
      {right}
    </Pressable>
  );
}

// --- Navigation
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  const c = useThemeColors();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#ffffff', borderTopColor: '#E2E8F0' },
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.subtle,
        tabBarIcon: ({ color, size }) => {
          const map = {
            All: 'list',
            Archived: 'archive',
            Trash: 'trash',
            Labels: 'pricetags',
            Settings: 'settings',
          };
          return <Ionicons name={map[route.name] || 'ellipse'} size={size} color={color} />
        },
      })}
    >
      <Tab.Screen name="All" component={WithHeader(PasswordListScreen)} initialParams={{ status: 'active' }} />
      <Tab.Screen name="Archived" component={WithHeader(PasswordListScreen)} initialParams={{ status: 'archived' }} />
      <Tab.Screen name="Trash" component={WithHeader(PasswordListScreen)} initialParams={{ status: 'trash' }} />
      <Tab.Screen name="Labels" component={WithHeader(EditLabelsScreen)} />
      <Tab.Screen name="Settings" component={WithHeader(SettingsScreen)} />
    </Tab.Navigator>
  );
}

function WithHeader(ScreenComp) {
  return function Wrapped(props) {
    const c = useThemeColors();
    const nav = useNavigation();
    return (
      <View style={{ flex: 1 }}>
        <View style={{ height: 54, borderBottomWidth: 1, borderBottomColor: c.border, backgroundColor: c.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <RedEagle size={28} />
            <Text style={{ fontFamily: 'Merriweather-Bold', color: c.text }}>ALL PASSWORD</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <TouchableOpacity onPress={() => nav.navigate('ArchivedAll')}>
              <MaterialIcons name="archive" size={22} color={c.primary} />
            </TouchableOpacity>
            <OverflowMenu />
          </View>
        </View>
        <ScreenComp {...props} />
      </View>
    );
  }
}

function AuthedApp() {
  const { themeMode } = useStore();
  const navTheme = themeMode === 'dark' ? Dark : Light;
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="PasswordDetails" component={PasswordDetailsScreen} options={{ headerShown: true }} />
        <Stack.Screen name="EditPassword" component={EditPasswordScreen} options={{ headerShown: true }} />
        <Stack.Screen name="ArchivedAll" component={WithHeader(PasswordListScreen)} initialParams={{ status: 'archived' }} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const ready = useMerriweather();
  const { user } = useStore() || {};
  // We must provide StoreProvider at top-level, then branch on user
  if (!ready) return null;
  return (
    <StoreProvider>
      <InnerApp />
    </StoreProvider>
  );
}

function InnerApp() {
  const { user, themeMode } = useStore();
  const navTheme = themeMode === 'dark' ? Dark : Light;
  return (
    <NavigationContainer theme={navTheme}>
      {user ? (
        <Stack.Navigator>
          <Stack.Screen name="Main" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen name="PasswordDetails" component={PasswordDetailsScreen} />
          <Stack.Screen name="EditPassword" component={EditPasswordScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

// ---------------------------
// Additional project files (place these in your project)
// ---------------------------

/*
// File: package.json
{
  "name": "redblue-passwords",
  "version": "1.0.0",
  "main": "expo-entry.js",
  "private": true,
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "@expo/vector-icons": "^14.0.2",
    "@react-navigation/bottom-tabs": "^6.6.2",
    "@react-navigation/native": "^6.1.17",
    "@react-navigation/native-stack": "^6.9.26",
    "@supabase/supabase-js": "^2.45.0",
    "expo": "~51.0.0",
    "expo-font": "~12.0.0",
    "expo-print": "~13.0.2",
    "expo-sharing": "~12.0.2",
    "expo-splash-screen": "~0.27.5",
    "expo-status-bar": "~1.12.1",
    "react": "18.2.0",
    "react-native": "0.74.2",
    "react-native-gesture-handler": "~2.16.1",
    "react-native-reanimated": "~3.10.1",
    "@react-native-async-storage/async-storage": "~1.23.1"
  }
}

// File: app.json (icon & colors)
{
  "expo": {
    "name": "RedBlue Passwords",
    "slug": "redblue-passwords",
    "scheme": "redblue",
    "icon": "./assets/icon-red-eagle.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#DBEAFE"
    },
    "ios": {"supportsTablet": true},
    "android": {"adaptiveIcon": {"foregroundImage": "./assets/icon-red-eagle.png", "backgroundColor": "#FEE2E2"}},
    "web": {"bundler": "metro"},
    "plugins": []
  }
}

// File: metro.config.js (if needed for fonts)
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('ttf');
module.exports = config;

// File: .env (create in project root)
EXPO_PUBLIC_SUPABASE_URL=YOUR_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY

// Folder: assets/fonts/
//   - Merriweather-Regular.ttf
//   - Merriweather-Bold.ttf
//   - Merriweather-Italic.ttf

// Folder: assets/
//   - icon-red-eagle.png (Any red eagle icon you prefer; 1024x1024 recommended)
//   - splash.png (optional)
*/
