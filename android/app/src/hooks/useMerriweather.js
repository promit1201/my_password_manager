import { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function useMerriweather() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        await Font.loadAsync({
          Merriweather: require('../../assets/fonts/Merriweather-Regular.ttf'),
          'Merriweather-Bold': require('../../assets/fonts/Merriweather-Bold.ttf'),
          'Merriweather-Italic': require('../../assets/fonts/Merriweather-Italic.ttf'),
        });
      } catch (e) {
        console.warn('Font load error', e);
      } finally {
        setReady(true);
        SplashScreen.hideAsync();
      }
    })();
  }, []);
  return ready;
}
