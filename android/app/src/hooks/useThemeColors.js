import { useStore } from '../context/StoreProvider';
import { Light, Dark } from '../theme/colors';

export default function useThemeColors() {
  const { themeMode } = useStore();
  return themeMode === 'dark' ? Dark.colors : Light.colors;
}
