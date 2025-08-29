import { useColorScheme } from "react-native";
import { LightTheme, DarkTheme } from "../theme/colors";

export default function useThemeColors() {
  const scheme = useColorScheme();
  return scheme === "dark" ? DarkTheme.colors : LightTheme.colors;
}
