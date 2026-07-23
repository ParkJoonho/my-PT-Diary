import { Pressable, StyleSheet, Text, View } from 'react-native';
import Colors from 'shared/constants/colors';

type ActiveCountdownOverlayProps = {
  countdown: number;
  onSkip: () => void;
  routineLabel: string;
};

export function ActiveCountdownOverlay({
  countdown,
  onSkip,
  routineLabel,
}: ActiveCountdownOverlayProps) {
  return (
    <View style={styles.overlay}>
      <View style={styles.content}>
        <Text style={styles.label}>{routineLabel}</Text>
        <View style={styles.circle}>
          <Text style={styles.number}>{countdown}</Text>
        </View>
        <Text style={styles.ready}>준비하세요!</Text>
        <Pressable
          accessibilityRole="button"
          onPress={onSkip}
          style={({ pressed }) => [
            styles.skipButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.skipText}>건너뛰기</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderColor: Colors.white,
    borderRadius: 45,
    borderWidth: 3,
    height: 90,
    justifyContent: 'center',
    width: 90,
  },
  content: {
    alignItems: 'center',
    gap: 12,
  },
  label: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Pretendard-Medium',
    fontSize: 16,
  },
  number: {
    color: Colors.white,
    fontFamily: 'Pretendard-Medium',
    fontSize: 42,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    zIndex: 10,
  },
  pressed: {
    opacity: 0.78,
  },
  ready: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
  },
  skipButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  skipText: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
  },
});
