import { Pressable, StyleSheet, Text, View } from 'react-native';
import Colors from 'shared/constants/colors';
import { formatTimer } from '../lib/format-duration';

type ActiveTimerBarProps = {
  elapsedSeconds: number;
  isPaused: boolean;
  onEnd: () => void;
  onPauseToggle: () => void;
};

export function ActiveTimerBar({
  elapsedSeconds,
  isPaused,
  onEnd,
  onPauseToggle,
}: ActiveTimerBarProps) {
  return (
    <View style={styles.bar}>
      <Text style={styles.time}>{formatTimer(elapsedSeconds)}</Text>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={onPauseToggle}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.iconText}>{isPaused ? '▶' : 'Ⅱ'}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onEnd}
          style={({ pressed }) => [
            styles.closeButton,
            pressed && styles.pressed,
          ]}
          testID="end-workout"
        >
          <Text style={styles.closeText}>×</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  bar: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 16,
    flexDirection: 'row',
    height: 70,
    marginBottom: 16,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 24,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  closeText: {
    color: Colors.white,
    fontFamily: 'Pretendard-Medium',
    fontSize: 24,
    lineHeight: 26,
  },
  iconButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  iconText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 20,
  },
  pressed: {
    opacity: 0.78,
  },
  time: {
    color: Colors.white,
    flex: 1,
    fontFamily: 'Pretendard-Medium',
    fontSize: 28,
  },
});
