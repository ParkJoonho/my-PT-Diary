import {
  ArrowRight,
  Camera,
  CheckCheck,
  FolderOpen,
  Timer,
  Utensils,
  XCircle,
} from 'lucide-react-native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { UnimplementedBadge } from 'shared/components/unimplemented-badge';
import Colors, { iosShadow } from 'shared/constants/colors';
import type { MealPhoto, MealPhotoTarget } from '../types/meal-analysis';

type MealPhotoSectionProps = {
  afterPhoto?: MealPhoto;
  beforePhoto?: MealPhoto;
  onPick: (target: MealPhotoTarget, useCamera: boolean) => void;
  onRemove: (target: MealPhotoTarget) => void;
};

function PhotoColumn({
  accent,
  image,
  label,
  onPickAlbum,
  onPickCamera,
  onRemove,
  required,
}: {
  accent: string;
  image?: MealPhoto;
  label: string;
  onPickAlbum: () => void;
  onPickCamera: () => void;
  onRemove: () => void;
  required: boolean;
}) {
  return (
    <View style={styles.photoColumn}>
      <View style={styles.photoLabelRow}>
        {required ? (
          <Utensils color={accent} size={16} strokeWidth={2.1} />
        ) : (
          <CheckCheck color={accent} size={16} strokeWidth={2.1} />
        )}
        <Text style={styles.photoLabel}>{label}</Text>
        <Text
          style={[
            styles.photoTypeBadge,
            required
              ? { backgroundColor: accent, color: Colors.white }
              : { backgroundColor: `${accent}18`, color: accent },
          ]}
        >
          {required ? '필수' : '선택'}
        </Text>
      </View>

      {image ? (
        <View style={styles.previewCard}>
          <Image
            resizeMode="cover"
            source={{ uri: image.uri }}
            style={styles.previewImage}
          />
          <Pressable hitSlop={8} onPress={onRemove} style={styles.removeButton}>
            <XCircle color={Colors.danger} fill={Colors.white} size={23} />
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={onPickAlbum} style={styles.emptyPhoto}>
          <Camera color={Colors.textMuted} size={31} strokeWidth={1.8} />
          <Text style={styles.emptyPhotoText}>사진 추가</Text>
        </Pressable>
      )}

      <View style={styles.actionRow}>
        <Pressable
          onPress={onPickCamera}
          style={[styles.actionButton, { backgroundColor: accent }]}
        >
          <Camera color={Colors.white} size={16} strokeWidth={2.1} />
        </Pressable>
        <Pressable
          onPress={onPickAlbum}
          style={[
            styles.actionButton,
            styles.actionButtonOutline,
            { borderColor: accent },
          ]}
        >
          <FolderOpen color={accent} size={16} strokeWidth={2.1} />
        </Pressable>
      </View>
    </View>
  );
}

export function MealPhotoSection({
  afterPhoto,
  beforePhoto,
  onPick,
  onRemove,
}: MealPhotoSectionProps) {
  return (
    <View style={[styles.card, iosShadow]}>
      <View style={styles.columns}>
        <PhotoColumn
          accent={Colors.accent}
          image={beforePhoto}
          label="식사 전"
          onPickAlbum={() => onPick('before', false)}
          onPickCamera={() => onPick('before', true)}
          onRemove={() => onRemove('before')}
          required
        />

        <View style={styles.arrowColumn}>
          <ArrowRight color={Colors.textMuted} size={18} strokeWidth={2} />
        </View>

        <PhotoColumn
          accent={Colors.info}
          image={afterPhoto}
          label="식사 후"
          onPickAlbum={() => onPick('after', false)}
          onPickCamera={() => onPick('after', true)}
          onRemove={() => onRemove('after')}
          required={false}
        />
      </View>

      {!beforePhoto && !afterPhoto ? (
        <Text style={styles.helpText}>
          식사 전 사진은 필수, 식사 후 사진을 함께 등록하면 실제 섭취량을
          분석합니다
        </Text>
      ) : null}

      <View style={styles.durationRow}>
        <Timer color={Colors.textMuted} size={15} strokeWidth={2} />
        <Text style={styles.durationText}>
          촬영 시간으로 식사 속도 자동 계산
        </Text>
        <UnimplementedBadge compact />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
    minHeight: 34,
  },
  actionButtonOutline: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 6,
  },
  arrowColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 55,
    width: 28,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    padding: 16,
  },
  columns: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  durationRow: {
    alignItems: 'center',
    borderTopColor: Colors.cardBorder,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 6,
    marginTop: 13,
    paddingTop: 11,
  },
  durationText: {
    color: Colors.textMuted,
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 11,
  },
  emptyPhoto: {
    alignItems: 'center',
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 2,
    height: 140,
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyPhotoText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
    marginTop: 4,
  },
  helpText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
    textAlign: 'center',
  },
  photoColumn: {
    flex: 1,
  },
  photoLabel: {
    color: Colors.text,
    flex: 1,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
  },
  photoLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  photoTypeBadge: {
    borderRadius: 6,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 10,
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  previewCard: {
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    borderRadius: 12,
    height: 140,
    width: '100%',
  },
  removeButton: {
    position: 'absolute',
    right: 2,
    top: 2,
  },
});
