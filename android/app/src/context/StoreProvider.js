import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

const StoreContext = createContext(null);
export const useStore = () => useContext(StoreContext);

const STORAGE_KEY = 'pwdb.v1';

export function StoreProvider({ children }) {
  const [passwords, setPasswords] = useState([]);
  const [labels, setLabels] = useState(['Work', 'Personal']);
  const [autoBackup, setAutoBackup] = useState(false);
  const [themeMode, setThemeMode] = useState('light');
  const [user, setUser] = useState(null);

  // ... load / persist logic (same as your App.js)

  const api = useMemo(() => ({
    passwords, labels, autoBackup, themeMode, user,
    addPassword: (p) => setPasswords((s) => [...s, { ...p, id: Date.now().toString(), status: 'active' }]),
    updatePassword: (id, patch) => setPasswords((s) => s.map((x) => x.id === id ? { ...x, ...patch } : x)),
    movePassword: (id, status) => setPasswords((s) => s.map((x) => x.id === id ? { ...x, status } : x)),
    deletePassword: (id) => setPasswords((s) => s.filter((x) => x.id !== id)),
    setLabels, addLabel: (name) => setLabels((ls) => ls.includes(name) ? ls : [...ls, name]),
    setAutoBackup, setThemeMode,
    signOut: () => supabase.auth.signOut(),
  }), [passwords, labels, autoBackup, themeMode, user]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}
