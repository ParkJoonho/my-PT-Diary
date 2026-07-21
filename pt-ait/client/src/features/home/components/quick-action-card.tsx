import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { UnimplementedBadge } from 'shared/components/unimplemented-badge';
import Colors, { iosShadow } from 'shared/constants/colors';

type QuickActionCardProps = {
  kind: 'outdoor' | 'guide';
  subtitle: string;
  title: string;
};

const QUICK_IMAGES = {
  outdoor: require('../../../assets/images/shoes.png'),
  guide: require('../../../assets/images/video.png'),
};

export function QuickActionCard({
  kind,
  subtitle,
  title,
}: QuickActionCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => undefined}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Image
        resizeMode="contain"
        source={QUICK_IMAGES[kind]}
        style={styles.icon}
      />
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          <UnimplementedBadge compact />
        </View>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  chevron: {
    color: Colors.iconMuted,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 24,
    lineHeight: 24,
  },
  icon: {
    borderRadius: 17,
    height: 34,
    width: 34,
  },
  info: {
    flex: 1,
    gap: 5,
  },
  pressed: {
    opacity: 0.78,
  },
  subtitle: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
  },
  title: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 16,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});
