import { StyleSheet, View } from 'react-native';

export function AccountBackground() {
  return (
    <View pointerEvents="none" style={styles.container}>
      <View style={styles.topGlow} />
      <View style={styles.sideGlow} />
      <View style={styles.bottomGlow} />
    </View>
  );
}

const styles = StyleSheet.create({
  bottomGlow: {
    backgroundColor: 'rgba(255, 106, 51, 0.08)',
    borderRadius: 180,
    bottom: -120,
    height: 240,
    position: 'absolute',
    right: -60,
    width: 240,
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  sideGlow: {
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    borderRadius: 220,
    height: 260,
    left: -120,
    position: 'absolute',
    top: 180,
    width: 260,
  },
  topGlow: {
    backgroundColor: 'rgba(27, 42, 74, 0.06)',
    borderRadius: 220,
    height: 220,
    position: 'absolute',
    right: -40,
    top: -70,
    width: 220,
  },
});
