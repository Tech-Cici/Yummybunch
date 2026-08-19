/**
 * Design tokens, mirroring the web app's palette so the two feel like one product.
 * Brand orange ≈ #EA580C.
 */
import { useColorScheme } from 'react-native';

export const palette = {
  light: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceAlt: '#FAF7F5',
    text: '#1C1917',
    textMuted: '#78716C',
    primary: '#EA580C',
    primaryText: '#FFFFFF',
    accent: '#FFF1E7',
    accentText: '#9A3412',
    border: '#E7E1DD',
    success: '#15803D',
    successBg: '#DCFCE7',
    danger: '#DC2626',
    dangerBg: '#FEE2E2',
    warning: '#B45309',
    warningBg: '#FEF3C7',
  },
  dark: {
    background: '#141110',
    surface: '#1F1B19',
    surfaceAlt: '#262120',
    text: '#F5F0EC',
    textMuted: '#A8A29E',
    // Lifted so the brand still reads as vivid on a dark surface
    primary: '#F97316',
    primaryText: '#141110',
    accent: '#2C2422',
    accentText: '#FDBA74',
    border: '#332C2A',
    success: '#4ADE80',
    successBg: '#14321F',
    danger: '#F87171',
    dangerBg: '#3B1D1D',
    warning: '#FCD34D',
    warningBg: '#332611',
  },
};

export type Colors = typeof palette.light;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 12, lg: 16, pill: 999 };

/** Colours for the active system theme. */
export function useColors(): Colors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? palette.dark : palette.light;
}

export function useIsDark(): boolean {
  return useColorScheme() === 'dark';
}

/** Money formatting shared by every screen. */
export const money = (n: number | string | null | undefined) => {
  const v = typeof n === 'string' ? parseFloat(n) : n ?? 0;
  return `$${(Number.isFinite(v) ? v : 0).toFixed(2)}`;
};
