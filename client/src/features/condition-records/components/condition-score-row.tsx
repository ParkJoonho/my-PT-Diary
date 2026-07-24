import { Pressable, StyleSheet, Text, View } from 'react-native';
import Colors from 'shared/constants/colors';

export function ConditionScoreRow({
  colorForScore,
  label,
  maxScore,
  onSelect,
  score,
}: {
  colorForScore: (score: number) => string;
  label: string;
  maxScore: number;
  onSelect: (score: number) => void;
  score: number;
}) {
  return (
    <View style={styles.scoreRow}>
      <Text numberOfLines={1} style={styles.scoreLabel}>
        {label}
      </Text>
      <View style={styles.scoreButtons}>
        {Array.from({ length: maxScore }, (_, index) => index + 1).map(
          (value) => (
            <Pressable
              key={value}
              onPress={() => onSelect(value)}
              style={[
                styles.scoreButton,
                score === value && {
                  backgroundColor: colorForScore(value),
                  borderColor: colorForScore(value),
                },
              ]}
            >
              <Text
                style={[
                  styles.scoreButtonText,
                  score === value && styles.scoreButtonTextActive,
                ]}
              >
                {value}
              </Text>
            </Pressable>
          ),
        )}
      </View>
    </View>
  );
}

export function MuscleSorenessScoreRow({
  colorForScore,
  label,
  maxScore,
  onInfoPress,
  onSelect,
  score,
}: {
  colorForScore: (score: number) => string;
  label: string;
  maxScore: number;
  onInfoPress: () => void;
  onSelect: (score: number) => void;
  score: number;
}) {
  return (
    <View style={styles.scoreRow}>
      <Pressable onPress={onInfoPress} style={styles.muscleLabelButton}>
        <Text numberOfLines={1} style={styles.scoreLabel}>
          {label}
        </Text>
        <View style={styles.helpBadge}>
          <Text style={styles.helpBadgeText}>?</Text>
        </View>
      </Pressable>
      <View style={styles.scoreButtons}>
        {Array.from({ length: maxScore }, (_, index) => index + 1).map(
          (value) => (
            <Pressable
              key={value}
              onPress={() => onSelect(value)}
              style={[
                styles.scoreButton,
                score === value && {
                  backgroundColor: colorForScore(value),
                  borderColor: colorForScore(value),
                },
              ]}
            >
              <Text
                style={[
                  styles.scoreButtonText,
                  score === value && styles.scoreButtonTextActive,
                ]}
              >
                {value}
              </Text>
            </Pressable>
          ),
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  helpBadge: {
    alignItems: 'center',
    backgroundColor: `${Colors.info}16`,
    borderRadius: 999,
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  helpBadgeText: {
    color: Colors.info,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 11,
  },
  muscleLabelButton: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    marginRight: 8,
  },
  scoreButton: {
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderColor: Colors.inputBorder,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  scoreButtonText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  scoreButtonTextActive: {
    color: Colors.white,
  },
  scoreButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  scoreLabel: {
    color: Colors.text,
    flex: 1,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
  },
  scoreRow: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});
