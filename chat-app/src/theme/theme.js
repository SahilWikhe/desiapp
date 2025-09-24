export const lightTheme = {
  mode: 'light',
  colors: {
    primary: '#FF7A00', // vibrant orange
    primaryDark: '#E86C00',
    primaryLight: '#FFF4EB',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceMuted: '#F7F7F7',
    text: '#111111',
    textMuted: '#555555',
    onPrimary: '#FFFFFF',
    onSurface: '#111111',
    border: '#E5E7EB',
    inputBorder: '#FFDCC4',
    inputBackground: '#FFFFFF',
    bubbleOther: '#F2F2F2',
    overlay: 'rgba(17, 17, 17, 0.05)',
  },
};

export const darkTheme = {
  mode: 'dark',
  colors: {
    primary: '#FF8B3D',
    primaryDark: '#F97316',
    primaryLight: '#2A190B',
    background: '#0F172A',
    surface: '#111827',
    surfaceMuted: '#1F2937',
    text: '#F9FAFB',
    textMuted: '#9CA3AF',
    onPrimary: '#0B1120',
    onSurface: '#F9FAFB',
    border: '#1F2937',
    inputBorder: '#334155',
    inputBackground: '#1E293B',
    bubbleOther: '#1F2937',
    overlay: 'rgba(15, 23, 42, 0.6)',
  },
};

export const themeVariants = {
  light: lightTheme,
  dark: darkTheme,
};
