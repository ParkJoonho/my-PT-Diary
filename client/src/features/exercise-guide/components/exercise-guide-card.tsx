import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Colors from 'shared/constants/colors';
import type { ExerciseGuide } from '../types/exercise-guide';

const HEART_ICON = require('../../../assets/icons/heart.png');

export function ExerciseGuideCard({
  guide,
  isEquipmentTab,
  isFirst,
  isLast,
  likeDisabled = false,
  onPress,
  onToggleLike,
}: {
  guide: ExerciseGuide;
  isEquipmentTab: boolean;
  isFirst: boolean;
  isLast: boolean;
  likeDisabled?: boolean;
  onPress: () => void;
  onToggleLike: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        isFirst && styles.cardFirst,
        isLast && styles.cardLast,
      ]}
    >
      <View style={styles.content}>
        {isEquipmentTab ? (
          <Text numberOfLines={1} style={styles.title}>
            {guide.title}
          </Text>
        ) : (
          <View style={styles.titleRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{guide.bodyPart}</Text>
            </View>
            <Text numberOfLines={1} style={styles.title}>
              {guide.title}
            </Text>
          </View>
        )}

        <View style={styles.metaRow}>
          <Text style={styles.meta}>
            {isEquipmentTab
              ? `${guide.bodyPart} · ${guide.duration}`
              : `${guide.equipment} · ${guide.duration}`}
          </Text>
          {guide.likeCount > 0 ? (
            <Pressable
              disabled={likeDisabled}
              hitSlop={8}
              onPress={onToggleLike}
              style={styles.likeButton}
            >
              <Image source={HEART_ICON} style={styles.heartImage} />
              <Text style={styles.likeCount}>{guide.likeCount}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      {!isLast ? <View style={styles.divider} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#f2f3f6',
    borderRadius: 5,
    flexShrink: 0,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 11,
  },
  card: {
    backgroundColor: Colors.card,
    flexDirection: 'column',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  cardFirst: {
    paddingTop: 24,
  },
  cardLast: {
    paddingBottom: 24,
  },
  content: {
    flex: 1,
    gap: 10,
  },
  divider: {
    backgroundColor: '#e5e5ea',
    height: StyleSheet.hairlineWidth,
    marginTop: 16,
  },
  heartImage: {
    height: 16,
    width: 16,
  },
  likeButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  likeCount: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
  },
  meta: {
    color: Colors.textMuted,
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    paddingRight: 8,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: Colors.text,
    flexShrink: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 15,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
});
