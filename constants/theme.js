import { Platform } from 'react-native';

const tintColorLight = '#4C52BF';
const tintColorDark = '#BFC2FF';

export const Colors = {
  light: {
    text: '#1B1B1F',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#777680',
    tabIconDefault: '#777680',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#E5E1E6',
    background: '#1B1B1F',
    tint: tintColorDark,
    icon: '#918F9A',
    tabIconDefault: '#918F9A',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});


