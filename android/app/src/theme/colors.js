import { DefaultTheme, DarkTheme } from '@react-navigation/native';

export const Light = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F7FAFF',
    card: '#FFFFFF',
    text: '#0F172A',
    border: '#E2E8F0',
    primary: '#3B82F6',
    danger: '#EF4444',
    tintRed: '#FEE2E2',
    tintBlue: '#DBEAFE',
    subtle: '#94A3B8',
  },
};

export const Dark = {
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
