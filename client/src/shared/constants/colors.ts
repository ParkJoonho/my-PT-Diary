import { Platform } from 'react-native';

const Colors = {
  primary: '#1B2A4A',
  primaryLight: '#2A3F6B',
  accent: '#FF6A33',
  accentLight: '#FFF0EA',
  background: '#F4F5F7',
  card: '#FFFFFF',
  cardBorder: '#E8E8E8',
  text: '#00192B',
  textSecondary: '#6B7280',
  textMuted: '#8E8E8E',
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  info: '#007AFF',
  white: '#FFFFFF',
  divider: '#E8E8E8',
  inputBg: '#F0F2F5',
  inputBorder: '#E8E8E8',
  tabIconDefault: '#B8C1CC',
  tint: '#FF6A33',

  score1: '#FF3B30',
  score2: '#FF9500',
  score3: '#007AFF',
  score4: '#34C759',
  score5: '#AF52DE',

  systemGray: '#8E8E8E',
  systemGray2: '#B8C1CC',
  systemGray3: '#C7C7CC',
  systemGray4: '#E8E8E8',
  systemGray5: '#EEF0F3',
  systemGray6: '#F0F2F5',
  separator: '#E8E8E8',
  groupedBg: '#F4F5F7',
  elevatedCard: '#FFFFFF',

  infoBlue: '#2563EB',
  successGreen: '#16A34A',

  iconMuted: '#B8C1CC',
  line: '#E8E8E8',
  surfaceMuted: '#F0F2F5',
  dayCircleInactive: '#EEF0F3',
};

export const gradeColors: Record<string, string> = {
  S: '#AF52DE',
  A: '#34C759',
  B: '#007AFF',
  C: '#FF9500',
  D: '#FF6A33',
  F: '#FF3B30',
};

export const iosShadow =
  Platform.OS === 'web'
    ? { boxShadow: '0px 1px 8px rgba(0,0,0,0.07)' }
    : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 2,
      };

export const iosShadowLight =
  Platform.OS === 'web'
    ? { boxShadow: '0px 1px 4px rgba(0,0,0,0.05)' }
    : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
      };

export default Colors;
