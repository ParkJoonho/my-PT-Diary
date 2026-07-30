import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  OriginalAppIcon,
  type OriginalAppIconName,
} from 'shared/components/icons/pt-diary-icons';
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
                <Pressable
                  accessibilityLabel="근육 위치 안내 닫기"
                  hitSlop={8}
                  onPress={onClose}
                >
                  <OriginalAppIcon
                    color={Colors.textMuted}
                    name="closeCircle"
                    size={24}
                  />
                </Pressable>
              </View>

              <Image
                resizeMode="contain"
                source={info.image}
                style={styles.image}
              />

              <InfoSection
                color={Colors.accent}
                icon="location"
                label="위치"
                value={info.location}
              />
              <InfoSection
                color={Colors.info}
                icon="body"
                label="설명"
                value={info.description}
              />
              <InfoSection
                color={Colors.success}
                icon="barbell"
                label="관련 운동"
                value={info.exercises}
              />
            </>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function InfoSection({
  color,
  icon,
  label,
  value,
}: {
  color: string;
  icon: OriginalAppIconName;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoSection}>
      <View style={styles.infoRow}>
        <OriginalAppIcon color={color} name={icon} size={16} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    maxHeight: '85%',
    maxWidth: 360,
    padding: 20,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  image: {
    backgroundColor: '#1B2A4A',
    borderRadius: 14,
    height: 200,
    marginBottom: 16,
    width: '100%',
  },
  infoLabel: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  infoSection: {
    gap: 4,
    marginBottom: 12,
  },
  infoText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 20,
    paddingLeft: 22,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: Colors.primary,
    flex: 1,
    fontFamily: 'Pretendard-Medium',
    fontSize: 18,
  },
});
