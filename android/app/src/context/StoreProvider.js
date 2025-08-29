import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../main/supabase";

const STORAGE_KEY = "promitsproject.db.v1";
const StoreContext = createContext(null);
export const useStore = () => useContext(StoreContext);

export function StoreProvider({ children }) {
  const [passwords, setPasswords] = useState([]);
  const [labels, setLabels] = useState(["Work", "Personal"]);
  const [autoBackup, setAutoBackup] = useState(false);
  const [user, setUser] = useState(null);

  // Load persisted
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setPasswords(parsed.passwords || []);
          setLabels(parsed.labels || ["Work", "Personal"]);
          setAutoBackup(!!parsed.autoBackup);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ passwords, labels, autoBackup })
    ).catch(() => {});
  }, [passwords, labels, autoBackup]);

  // Supabase auth
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    (async () => {
      const session = await supabase.auth.getSession();
      setUser(session.data.session?.user ?? null);
    })();
    return () => sub.subscription.unsubscribe();
  }, []);

  const api = useMemo(
    () => ({
      user,
      passwords,
      labels,
      autoBackup,
      setAutoBackup,
      setLabels,
      addLabel: (name) =>
        setLabels((ls) => (ls.includes(name) ? ls : [...ls, name])),

      addPassword: (p) =>
        setPasswords((s) => [
          {
            ...p,
            id: Math.random().toString(36).slice(2),
            createdAt: Date.now(),
            status: "active",
            labels: p.labels || []
          },
          ...s
        ]),
      updatePassword: (id, patch) =>
        setPasswords((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x))),
      movePassword: (id, status) =>
        setPasswords((s) => s.map((x) => (x.id === id ? { ...x, status } : x))),
      deletePassword: (id) =>
        setPasswords((s) => s.filter((x) => x.id !== id)),
      clearSearchHistoryFor: async () =>
        AsyncStorage.removeItem("search.history").catch(() => {}),

      signOut: () => supabase.auth.signOut()
    }),
    [passwords, labels, autoBackup, user]
  );

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}
