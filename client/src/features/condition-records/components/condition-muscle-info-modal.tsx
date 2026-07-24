import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Colors from 'shared/constants/colors';
import type { MuscleInfo } from '../lib/condition-muscle-info';

export function ConditionMuscleInfoModal({
  info,
  onClose,
}: {
  info: MuscleInfo | null;
  onClose: () => void;
}) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={!!info}
    >
      <Pressable onPress={onClose} style={styles.overlay}>
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={styles.card}
        >
          {info ? (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>{info.label}</Text>
                <Pressable onPress={onClose}>
                  <Text style={styles.closeText}>닫기</Text>
                </Pressable>
              </View>

              <Image
                resizeMode="contain"
                source={info.image}
                style={styles.image}
              />

              <InfoSection label="위치" value={info.location} />
              <InfoSection label="설명" value={info.description} />
              <InfoSection label="관련 운동" value={info.exercises} />
            </>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function InfoSection({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoSection}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    gap: 14,
    marginHorizontal: 20,
    maxWidth: 420,
    padding: 18,
    width: '100%',
  },
  closeText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  image: {
    alignSelf: 'center',
    height: 180,
    width: '100%',
  },
  infoLabel: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  infoSection: {
    gap: 6,
  },
  infoText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: '#00000066',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: Colors.text,
    flex: 1,
    fontFamily: 'Pretendard-Bold',
    fontSize: 17,
    marginRight: 12,
  },
});
