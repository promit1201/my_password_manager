import React from 'react';
import { StoreProvider } from './src/context/StoreProvider';
import useMerriweather from './src/hooks/useMerriweather';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const ready = useMerriweather();
  if (!ready) return null;

  return (
    <StoreProvider>
      <AppNavigator />
    </StoreProvider>
  );
}
