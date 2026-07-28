import { Camera, FolderOpen, X } from 'lucide-react-native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Colors, { iosShadow } from 'shared/constants/colors';
import type { PickedImage } from '../lib/pick-image';

export function PhotoCard({
  image,
  onPickAlbum,
  onPickCamera,
  onRemove,
  required = false,
  title,
}: {
  image?: PickedImage;
  onPickAlbum: () => void;
  onPickCamera: () => void;
  onRemove?: () => void;
  required?: boolean;
  title: string;
}) {
  return (
    <View style={[styles.photoCard, iosShadow]}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionHeaderTitleRow}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {required ? (
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredBadgeText}>필수</Text>
            </View>
          ) : null}
        </View>
        {image && onRemove ? (
          <Pressable hitSlop={8} onPress={onRemove}>
            <X color={Colors.textMuted} size={18} strokeWidth={2.2} />
          </Pressable>
        ) : null}
      </View>

      {image ? (
        <Image source={{ uri: image.uri }} style={styles.previewImage} />
      ) : (
        <View style={styles.photoPlaceholder}>
          <FolderOpen color={Colors.textMuted} size={26} strokeWidth={2} />
          <Text style={styles.photoPlaceholderText}>아직 선택한 사진이 없어요</Text>
        </View>
      )}

      <View style={styles.photoActionRow}>
        <Pressable style={styles.photoActionButton} onPress={onPickCamera}>
          <Camera color={Colors.accent} size={18} strokeWidth={2.1} />
          <Text style={styles.photoActionText}>카메라</Text>
        </Pressable>
        <Pressable style={styles.photoActionButton} onPress={onPickAlbum}>
          <FolderOpen color={Colors.accent} size={18} strokeWidth={2.1} />
          <Text style={styles.photoActionText}>앨범</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  photoActionButton: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 12,
    flex: 1,
    gap: 6,
    justifyContent: 'center',
    minHeight: 52,
  },
  photoActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  photoActionText: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
  },
  photoCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    gap: 12,
    padding: 16,
  },
  photoPlaceholder: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: 6,
    height: 180,
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
  },
  previewImage: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 12,
    height: 220,
    width: '100%',
  },
  requiredBadge: {
    backgroundColor: Colors.accentLight,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  requiredBadgeText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 10,
  },
  sectionHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionHeaderTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  sectionTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
  },
});
