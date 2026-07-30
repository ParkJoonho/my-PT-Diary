import type { ReactNode } from 'react';
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SemanticIcon } from 'shared/components/icons/pt-diary-icons';
import Colors, { iosShadow } from 'shared/constants/colors';
import { ptTypography } from 'shared/constants/typography';

type RowActionCardProps = {
  onPress: () => void;
  pressedOpacity?: number;
  pressedScale?: number;
  subtitle: string;
  title: string;
  titleAccessory?: ReactNode;
  variant?: 'aiFeature' | 'quickAction';
} & (
  | { imageSource: ImageSourcePropType; leading?: never }
  | { imageSource?: never; leading: ReactNode }
);

export function RowActionCard({
  imageSource,
  leading,
  onPress,
  pressedOpacity,
  pressedScale,
  subtitle,
  title,
  titleAccessory,
  variant = 'quickAction',
}: RowActionCardProps) {
  const isAiFeature = variant === 'aiFeature';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isAiFeature && styles.aiFeatureCard,
        pressed && pressedOpacity !== undefined
          ? { opacity: pressedOpacity }
          : null,
        pressed && pressedScale !== undefined
          ? { transform: [{ scale: pressedScale }] }
          : null,
      ]}
    >
      {imageSource ? (
        <Image resizeMode="contain" source={imageSource} style={styles.image} />
      ) : (
        leading
      )}
      <View style={[styles.textWrap, isAiFeature && styles.aiFeatureTextWrap]}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, isAiFeature && styles.aiFeatureTitle]}>
            {title}
          </Text>
          {titleAccessory}
        </View>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <SemanticIcon
        color={Colors.iconMuted}
        name="chevronRight"
        size={isAiFeature ? 18 : 20}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  aiFeatureCard: {
    borderRadius: 14,
  },
  aiFeatureTextWrap: {
    gap: 2,
  },
  aiFeatureTitle: {
    fontFamily: 'Pretendard-SemiBold',
  },
  card: {
    ...iosShadow,
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 14,
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 19,
  },
  image: {
    borderRadius: 17,
    height: 34,
    width: 34,
  },
  subtitle: {
    color: Colors.textMuted,
    ...ptTypography.rowActionSubtitle,
  },
  textWrap: {
    flex: 1,
    gap: 5,
  },
  title: {
    color: Colors.text,
    ...ptTypography.rowActionTitle,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});
