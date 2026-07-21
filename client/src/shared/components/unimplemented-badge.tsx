import { StyleSheet, Text, View } from 'react-native';
import Colors from 'shared/constants/colors';

type UnimplementedBadgeProps = {
  compact?: boolean;
  tone?: 'default' | 'onAccent';
};

export function UnimplementedBadge({
  compact = false,
  tone = 'default',
}: UnimplementedBadgeProps) {
  const onAccent = tone === 'onAccent';

  return (
    <View
      style={[
        styles.badge,
        compact && styles.compact,
        onAccent && styles.onAccent,
      ]}
    >
      <Text
        style={[
          styles.text,
          compact && styles.compactText,
          onAccent && styles.onAccentText,
        ]}
      >
        미구현
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    backgroundColor: Colors.accentLight,
    borderRadius: 999,
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  compact: {
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  compactText: {
    fontSize: 9,
  },
  onAccent: {
    backgroundColor: Colors.white,
  },
  onAccentText: {
    color: Colors.accent,
  },
  text: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 12,
  },
});
