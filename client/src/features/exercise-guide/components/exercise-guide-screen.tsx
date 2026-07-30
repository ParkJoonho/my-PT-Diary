import { useSafeAreaInsets } from '@granite-js/native/react-native-safe-area-context';
import { useNavigation } from '@granite-js/react-native';
import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  type ImageSourcePropType,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SuspenseSection } from 'shared/components/async-state';
import { OriginalAppIcon } from 'shared/components/icons/pt-diary-icons';
import Colors, { iosShadowLight } from 'shared/constants/colors';
import { getAssetSource } from 'shared/lib/asset-url';
import {
  useExerciseGuides,
  useSetExerciseGuideLike,
} from '../api/exercise-guides';
import { BODY_PART_FILTERS } from '../data/exercise-guide-filters';
import { filterBodyPartGuides } from '../lib/filter-exercise-guides';
import type { BodyPartFilter, ExerciseGuideTab } from '../types/exercise-guide';
import { ExerciseGuideCard } from './exercise-guide-card';
import { ExerciseGuideFilterRow } from './exercise-guide-filter-row';
import { ExerciseGuideTabSelector } from './exercise-guide-tab-selector';

const CAMERA_ICON = getAssetSource('icons/camera.png');
const GALLERY_ICON = getAssetSource('icons/gallery.png');

type ExerciseGuideScreenProps = {
  contentBottomInset: number;
};

export function ExerciseGuideScreen({
  contentBottomInset,
}: ExerciseGuideScreenProps) {
  return (
    <SuspenseSection errorMessage="운동 가이드를 불러오지 못했어요.">
      <ExerciseGuideScreenContent contentBottomInset={contentBottomInset} />
    </SuspenseSection>
  );
}

function ExerciseGuideScreenContent({
  contentBottomInset,
}: ExerciseGuideScreenProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { data } = useExerciseGuides();
  const likeMutation = useSetExerciseGuideLike();
  const [selectedTab, setSelectedTab] = useState<ExerciseGuideTab>('부위별');
  const [selectedBodyPart, setSelectedBodyPart] =
    useState<BodyPartFilter>('전체');
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [pendingGuideId, setPendingGuideId] = useState<string | null>(null);

  const bodyPartGuides = useMemo(
    () =>
      filterBodyPartGuides(
        data.filter((guide) => guide.catalogType === 'body_part'),
        selectedBodyPart,
      ),
    [data, selectedBodyPart],
  );
  const equipmentGuides = useMemo(
    () => data.filter((guide) => guide.catalogType === 'equipment'),
    [data],
  );
  const visibleGuides =
    selectedTab === '부위별' ? bodyPartGuides : equipmentGuides;

  const handleToggleLike = async (guideId: string, likedByMe: boolean) => {
    if (pendingGuideId) {
      return;
    }

    setPendingGuideId(guideId);

    try {
      await likeMutation.mutateAsync({
        guideId,
        liked: !likedByMe,
      });
    } catch {
      Alert.alert('오류', '좋아요를 저장하지 못했어요.');
    } finally {
      setPendingGuideId(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleArea}>
        <Text style={styles.title}>운동 배우기</Text>
      </View>

      <ExerciseGuideTabSelector
        onSelectTab={setSelectedTab}
        selectedTab={selectedTab}
      />

      {selectedTab === '부위별' ? (
        <View style={styles.filterArea}>
          <ExerciseGuideFilterRow
            items={BODY_PART_FILTERS}
            onSelect={(key) => setSelectedBodyPart(key as BodyPartFilter)}
            selectedKey={selectedBodyPart}
          />
        </View>
      ) : (
        <>
          <Pressable
            onPress={() => setShowActionSheet(true)}
            style={styles.cameraCard}
          >
            <Image source={CAMERA_ICON} style={styles.cameraIcon} />
            <Text style={styles.cameraText}>사진으로 기구 찾기</Text>
          </Pressable>
        </>
      )}

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: contentBottomInset },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.listCard}>
          {visibleGuides.length ? (
            visibleGuides.map((guide, index) => (
              <ExerciseGuideCard
                guide={guide}
                isEquipmentTab={selectedTab === '기구별'}
                isFirst={index === 0}
                isLast={index === visibleGuides.length - 1}
                key={guide.id}
                likeDisabled={pendingGuideId === guide.id}
                onPress={() =>
                  navigation.navigate({
                    name: '/exercise-video-viewer',
                    params: { guideId: guide.id },
                  })
                }
                onToggleLike={() => handleToggleLike(guide.id, guide.likedByMe)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <OriginalAppIcon color="#C7C7CC" name="searchOutline" size={40} />
              <Text style={styles.emptyText}>운동이 없습니다</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        onRequestClose={() => setShowActionSheet(false)}
        transparent
        visible={showActionSheet}
      >
        <Pressable
          onPress={() => setShowActionSheet(false)}
          style={styles.modalOverlay}
        />
        <View
          style={[
            styles.modalSheet,
            { paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 8 },
          ]}
        >
          <View style={styles.modalHandle} />
          <View style={styles.modalCard}>
            <ModalOption
              icon={CAMERA_ICON}
              label="카메라로 촬영"
              onPress={() => {
                setShowActionSheet(false);
                Alert.alert('카메라로 촬영', '준비 중입니다.');
              }}
            />
            <View style={styles.modalDivider} />
            <ModalOption
              icon={GALLERY_ICON}
              label="갤러리에서 선택"
              onPress={() => {
                setShowActionSheet(false);
                Alert.alert('갤러리에서 선택', '준비 중입니다.');
              }}
            />
          </View>
          <Pressable
            onPress={() => setShowActionSheet(false)}
            style={styles.modalCancel}
          >
            <Text style={styles.modalCancelText}>취소</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

function ModalOption({
  icon,
  label,
  onPress,
}: {
  icon: ImageSourcePropType;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.modalOption}>
      <Image source={icon} style={styles.modalIcon} />
      <Text style={styles.modalOptionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cameraCard: {
    ...iosShadowLight,
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 16,
    marginHorizontal: 16,
    marginTop: 4,
    paddingVertical: 16,
  },
  cameraIcon: {
    height: 20,
    width: 20,
  },
  cameraText: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 15,
  },
  container: {
    backgroundColor: '#F2F2F7',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 60,
  },
  emptyText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 15,
  },
  filterArea: {
    marginTop: 4,
    paddingBottom: 16,
  },
  listCard: {
    ...iosShadowLight,
    backgroundColor: Colors.card,
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
  },
  modalCancel: {
    alignItems: 'center',
    backgroundColor: '#F3F4F7',
    borderRadius: 14,
    marginBottom: 8,
    paddingVertical: 18,
  },
  modalCancelText: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
  },
  modalCard: {
    backgroundColor: Colors.white,
  },
  modalDivider: {
    backgroundColor: '#E5E5EA',
    height: StyleSheet.hairlineWidth,
    marginLeft: 56,
  },
  modalHandle: {
    alignSelf: 'center',
    backgroundColor: '#C7C7CC',
    borderRadius: 2,
    height: 4,
    marginBottom: 4,
    width: 36,
  },
  modalIcon: {
    height: 22,
    width: 22,
  },
  modalOption: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  modalOptionText: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 16,
  },
  modalOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    flex: 1,
  },
  modalSheet: {
    backgroundColor: Colors.white,
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  title: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 18,
    marginBottom: 4,
  },
  titleArea: {
    paddingBottom: 0,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
});
