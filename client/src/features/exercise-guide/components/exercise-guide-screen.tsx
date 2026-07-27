import { useNavigation } from "@granite-js/react-native";
import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  useExerciseGuides,
  useSetExerciseGuideLike,
} from "../api/exercise-guides";
import {
  BODY_PART_FILTERS,
  EQUIPMENT_FILTERS,
} from "../data/exercise-guide-filters";
import {
  filterBodyPartGuides,
  filterEquipmentGuides,
} from "../lib/filter-exercise-guides";
import type {
  BodyPartFilter,
  EquipmentFilter,
  ExerciseGuideTab,
} from "../types/exercise-guide";
import { ExerciseGuideCard } from "./exercise-guide-card";
import { ExerciseGuideFilterRow } from "./exercise-guide-filter-row";
import { ExerciseGuideTabSelector } from "./exercise-guide-tab-selector";
import { SuspenseSection } from "shared/components/async-state";
import Colors, { iosShadow } from "shared/constants/colors";

const CAMERA_ICON = require("../../../assets/icons/camera.png");
const GALLERY_ICON = require("../../../assets/icons/gallery.png");

export function ExerciseGuideScreen() {
  return (
    <SuspenseSection errorMessage="운동 가이드를 불러오지 못했어요.">
      <ExerciseGuideScreenContent />
    </SuspenseSection>
  );
}

function ExerciseGuideScreenContent() {
  const navigation = useNavigation();
  const { data } = useExerciseGuides();
  const likeMutation = useSetExerciseGuideLike();
  const [selectedTab, setSelectedTab] = useState<ExerciseGuideTab>("부위별");
  const [selectedBodyPart, setSelectedBodyPart] =
    useState<BodyPartFilter>("전체");
  const [selectedEquipment, setSelectedEquipment] =
    useState<EquipmentFilter>("전체");
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [pendingGuideId, setPendingGuideId] = useState<string | null>(null);

  const bodyPartGuides = useMemo(
    () =>
      filterBodyPartGuides(
        data.filter((guide) => guide.catalogType === "body_part"),
        selectedBodyPart,
      ),
    [data, selectedBodyPart],
  );
  const equipmentGuides = useMemo(
    () =>
      filterEquipmentGuides(
        data.filter((guide) => guide.catalogType === "equipment"),
        selectedEquipment,
      ),
    [data, selectedEquipment],
  );
  const visibleGuides =
    selectedTab === "부위별" ? bodyPartGuides : equipmentGuides;

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
      Alert.alert("오류", "좋아요를 저장하지 못했어요.");
    } finally {
      setPendingGuideId(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>닫기</Text>
        </Pressable>
        <Text style={styles.headerTitle}>운동 배우기</Text>
        <View style={styles.headerSide} />
      </View>

      <ExerciseGuideTabSelector
        onSelectTab={setSelectedTab}
        selectedTab={selectedTab}
      />

      {selectedTab === "부위별" ? (
        <View style={styles.filterArea}>
          <ExerciseGuideFilterRow
            items={BODY_PART_FILTERS}
            mode="body"
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
          <View style={styles.filterArea}>
            <ExerciseGuideFilterRow
              items={EQUIPMENT_FILTERS}
              mode="equipment"
              onSelect={(key) => setSelectedEquipment(key as EquipmentFilter)}
              selectedKey={selectedEquipment}
            />
          </View>
        </>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.listCard}>
          {visibleGuides.length ? (
            visibleGuides.map((guide, index) => (
              <ExerciseGuideCard
                guide={guide}
                isEquipmentTab={selectedTab === "기구별"}
                isFirst={index === 0}
                isLast={index === visibleGuides.length - 1}
                key={guide.id}
                likeDisabled={pendingGuideId === guide.id}
                onPress={() =>
                  navigation.navigate({
                    name: "/exercise-video-viewer",
                    params: { guideId: guide.id },
                  })
                }
                onToggleLike={() => handleToggleLike(guide.id, guide.likedByMe)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>운동이 없습니다</Text>
              <Text style={styles.emptySubtitle}>
                다른 필터를 선택해보세요.
              </Text>
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
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalCard}>
            <ModalOption
              icon={CAMERA_ICON}
              label="카메라로 촬영"
              onPress={() => {
                setShowActionSheet(false);
                Alert.alert("카메라로 촬영", "준비 중입니다.");
              }}
            />
            <View style={styles.modalDivider} />
            <ModalOption
              icon={GALLERY_ICON}
              label="앨범에서 선택"
              onPress={() => {
                setShowActionSheet(false);
                Alert.alert("앨범에서 선택", "준비 중입니다.");
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
  icon: number;
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
    ...iosShadow,
    alignItems: "center",
    backgroundColor: Colors.accent,
    borderRadius: 16,
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 16,
    marginTop: 4,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  cameraIcon: {
    height: 24,
    tintColor: Colors.white,
    width: 24,
  },
  cameraText: {
    color: Colors.white,
    fontFamily: "Pretendard-SemiBold",
    fontSize: 15,
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
    paddingTop: 16,
  },
  emptyState: {
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  emptySubtitle: {
    color: Colors.textMuted,
    fontFamily: "Pretendard-Regular",
    fontSize: 13,
  },
  emptyTitle: {
    color: Colors.text,
    fontFamily: "Pretendard-SemiBold",
    fontSize: 16,
  },
  filterArea: {
    marginBottom: 8,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerButton: {
    minWidth: 44,
    paddingVertical: 8,
  },
  headerButtonText: {
    color: Colors.text,
    fontFamily: "Pretendard-Regular",
    fontSize: 16,
  },
  headerSide: {
    width: 44,
  },
  headerTitle: {
    color: Colors.text,
    fontFamily: "Pretendard-SemiBold",
    fontSize: 18,
  },
  listCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    overflow: "hidden",
  },
  modalCancel: {
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 14,
    marginTop: 10,
    paddingVertical: 16,
  },
  modalCancelText: {
    color: Colors.info,
    fontFamily: "Pretendard-SemiBold",
    fontSize: 17,
  },
  modalCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    overflow: "hidden",
  },
  modalDivider: {
    backgroundColor: Colors.divider,
    height: StyleSheet.hairlineWidth,
  },
  modalHandle: {
    alignSelf: "center",
    backgroundColor: Colors.systemGray3,
    borderRadius: 999,
    height: 5,
    marginBottom: 12,
    width: 48,
  },
  modalIcon: {
    height: 26,
    width: 26,
  },
  modalOption: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  modalOptionText: {
    color: Colors.text,
    fontFamily: "Pretendard-Regular",
    fontSize: 16,
  },
  modalOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    flex: 1,
  },
  modalSheet: {
    backgroundColor: Colors.groupedBg,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 16,
  },
  scrollContent: {
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
});
