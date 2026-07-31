import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { OriginalAppIcon } from 'shared/components/icons/pt-diary-icons';
import Colors, { iosShadow } from 'shared/constants/colors';
import { formatEatingDuration } from '../lib/meal-analysis-format';
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
          <OriginalAppIcon color={accent} name="restaurant" size={16} />
        ) : (
          <OriginalAppIcon color={accent} name="checkmark" size={16} />
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
            <OriginalAppIcon
              color={Colors.danger}
              name="closeCircle"
              size={22}
            />
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={onPickAlbum} style={styles.emptyPhoto}>
          <OriginalAppIcon
            color={Colors.textMuted}
            name="cameraOutline"
            size={32}
          />
          <Text style={styles.emptyPhotoText}>사진 추가</Text>
        </Pressable>
      )}

      <View style={styles.actionRow}>
        <Pressable
          onPress={onPickCamera}
          style={[styles.actionButton, { backgroundColor: accent }]}
        >
          <OriginalAppIcon color={Colors.white} name="camera" size={16} />
        </Pressable>
        <Pressable
          onPress={onPickAlbum}
          style={[
            styles.actionButton,
            styles.actionButtonOutline,
            { borderColor: accent },
          ]}
        >
          <OriginalAppIcon color={accent} name="images" size={16} />
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
          <OriginalAppIcon
            color={Colors.textMuted}
            name="arrowForward"
            size={18}
          />
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
    </View>
  );
}

export function MealDurationCard({
  durationMinutes,
  onChangeDuration,
}: {
  durationMinutes: number;
  onChangeDuration?: (value: number) => void;
}) {
  const color =
    durationMinutes < 10
      ? Colors.danger
      : durationMinutes < 15
        ? Colors.warning
        : Colors.success;
  const hint =
    durationMinutes < 10
      ? '⚠️ 너무 빠름'
      : durationMinutes < 15
        ? '조금 빠름'
        : durationMinutes < 30
          ? '적정'
          : '충분';

  return (
    <View style={[styles.durationCard, iosShadow]}>
      <OriginalAppIcon color={color} name="timeOutline" size={20} />
      <View style={styles.durationContent}>
        <Text style={styles.durationTitle}>식사 소요 시간</Text>
        {onChangeDuration ? (
          // Apps in Toss가 EXIF 촬영 시각을 제공하지 않아 키보드 없는 인라인 피커로 원본 시간 값만 조절해요.
          <InlineMinutePicker
            color={color}
            onChange={onChangeDuration}
            value={durationMinutes}
          />
        ) : (
          <Text style={[styles.durationValue, { color }]}>
            {formatEatingDuration(durationMinutes)}
          </Text>
        )}
      </View>
      <Text style={styles.durationHint}>{hint}</Text>
    </View>
  );
}

function InlineMinutePicker({
  color,
  onChange,
  value,
}: {
  color: string;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <View style={styles.minutePicker}>
      <Pressable
        accessibilityLabel="식사 시간 5분 줄이기"
        accessibilityRole="button"
        disabled={value <= 1}
        onPress={() => onChange(Math.max(1, value - 5))}
        style={[
          styles.minutePickerButton,
          value <= 1 && styles.minutePickerButtonDisabled,
        ]}
      >
        <Text style={styles.minutePickerStepText}>-5</Text>
      </Pressable>
      <Pressable
        accessibilityLabel="식사 시간 1분 줄이기"
        accessibilityRole="button"
        disabled={value <= 1}
        onPress={() => onChange(Math.max(1, value - 1))}
        style={[
          styles.minutePickerButton,
          value <= 1 && styles.minutePickerButtonDisabled,
        ]}
      >
        <OriginalAppIcon color={Colors.textSecondary} name="remove" size={16} />
      </Pressable>
      <Text
        accessibilityLabel={`식사 소요 시간 ${value}분`}
        style={[styles.minutePickerValue, { color }]}
      >
        {value}분
      </Text>
      <Pressable
        accessibilityLabel="식사 시간 1분 늘리기"
        accessibilityRole="button"
        disabled={value >= 60}
        onPress={() => onChange(Math.min(60, value + 1))}
        style={[
          styles.minutePickerButton,
          value >= 60 && styles.minutePickerButtonDisabled,
        ]}
      >
        <OriginalAppIcon color={Colors.textSecondary} name="add" size={16} />
      </Pressable>
      <Pressable
        accessibilityLabel="식사 시간 5분 늘리기"
        accessibilityRole="button"
        disabled={value >= 60}
        onPress={() => onChange(Math.min(60, value + 5))}
        style={[
          styles.minutePickerButton,
          value >= 60 && styles.minutePickerButtonDisabled,
        ]}
      >
        <Text style={styles.minutePickerStepText}>+5</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 8,
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
    paddingTop: 60,
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
  durationCard: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
    marginHorizontal: 16,
    padding: 12,
  },
  durationContent: {
    flex: 1,
  },
  durationHint: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
  },
  durationTitle: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
  },
  durationValue: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 16,
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
  minutePicker: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  minutePickerButton: {
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  minutePickerButtonDisabled: {
    opacity: 0.35,
  },
  minutePickerStepText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
  },
  minutePickerValue: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 16,
    minWidth: 42,
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
    paddingVertical: 1,
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
