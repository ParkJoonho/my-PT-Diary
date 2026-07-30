import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { OriginalAppIcon } from 'shared/components/icons/pt-diary-icons';
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
          <Image
            resizeMode="contain"
            source={
              isPaused
                ? require('../../../assets/icons/play.png')
                : require('../../../assets/icons/pause.png')
            }
            style={styles.workoutIcon}
          />
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
          <OriginalAppIcon color={Colors.white} name="close" size={20} />
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
  iconButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  pressed: {
    opacity: 0.78,
  },
  time: {
    color: Colors.white,
    flex: 1,
    fontFamily: 'Pretendard-Medium',
    fontSize: 28,
    letterSpacing: 2,
  },
  workoutIcon: {
    height: 32,
    width: 32,
  },
});
