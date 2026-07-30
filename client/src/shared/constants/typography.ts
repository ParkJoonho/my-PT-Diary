import type { TextStyle } from 'react-native';

export const ptFontFamilies = {
  bold: 'Pretendard-Bold',
  medium: 'Pretendard-Medium',
  regular: 'Pretendard-Regular',
  semiBold: 'Pretendard-SemiBold',
} as const;

export const ptTypography = {
  rowActionSubtitle: {
    fontFamily: ptFontFamilies.regular,
    fontSize: 13,
  },
  rowActionTitle: {
    fontFamily: ptFontFamilies.medium,
    fontSize: 16,
  },
  sectionTitle: {
    fontFamily: ptFontFamilies.medium,
    fontSize: 17,
  },
  tabLabel: {
    fontFamily: ptFontFamilies.medium,
    fontSize: 10,
    letterSpacing: -0.1,
  },
} as const satisfies Record<string, TextStyle>;
