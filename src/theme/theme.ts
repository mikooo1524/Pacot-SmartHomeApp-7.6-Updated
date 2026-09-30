export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  background: string;
  surface: string;
  surfaceSubdued: string;
  surfaceElevated: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  info: string;
  infoLight: string;
  cardShadow: string;
  switchTrackActive: string;
  switchTrackInactive: string;
}

export const lightTheme: ThemeColors = {
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  primaryDark: '#1D4ED8',
  accent: '#7C3AED',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSubdued: '#F1F5F9',
  surfaceElevated: '#FFFFFF',
  border: '#E2E8F0',
  borderSubtle: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  success: '#10B981',
  successLight: '#ECFDF5',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  danger: '#EF4444',
  dangerLight: '#FEF2F2',
  info: '#0EA5E9',
  infoLight: '#F0F9FF',
  cardShadow: 'rgba(0, 0, 0, 0.05)',
  switchTrackActive: '#93C5FD',
  switchTrackInactive: '#CBD5E1',
};

export const darkTheme: ThemeColors = {
  primary: '#3B82F6',
  primaryLight: 'rgba(59, 130, 246, 0.15)',
  primaryDark: '#1D4ED8',
  accent: '#8B5CF6',
  background: '#0F172A',
  surface: '#1E293B',
  surfaceSubdued: '#162032',
  surfaceElevated: '#334155',
  border: '#334155',
  borderSubtle: '#1E293B',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0F172A',
  success: '#10B981',
  successLight: 'rgba(16, 185, 129, 0.15)',
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.15)',
  danger: '#EF4444',
  dangerLight: 'rgba(239, 68, 68, 0.15)',
  info: '#38BDF8',
  infoLight: 'rgba(56, 189, 248, 0.15)',
  cardShadow: 'rgba(0, 0, 0, 0.3)',
  switchTrackActive: '#1E40AF',
  switchTrackInactive: '#475569',
};
