import { HomeTabBar } from 'features/home/components/home-tab-bar';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Heart,
  Star,
  Zap,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {
  RecommendedTrainerDto,
  TrainerDto,
} from 'shared/api/generated/models';
import { SuspenseSection } from 'shared/components/async-state';
import { AIInfoIcon } from 'shared/components/icons/pt-diary-icons';
import Colors, { iosShadow } from 'shared/constants/colors';
import {
  useCreateTrainerConnectRequest,
  useRecommendedTrainers,
  useSetTrainerLike,
  useTrainers,
} from '../api/trainers';

type SortMode = 'ai' | 'default' | 'popular';
type TrainerListItem = RecommendedTrainerDto | TrainerDto;
const GOLD = '#D4AF37';

const SORT_OPTIONS: Array<{ label: string; mode: SortMode }> = [
  { label: '기본순', mode: 'default' },
  { label: 'AI 추천순', mode: 'ai' },
  { label: '인기순', mode: 'popular' },
];

export function TrainerMatchScreen() {
  const setTrainerLikeMutation = useSetTrainerLike();
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] =
    useState<TrainerListItem | null>(null);
  const sortLabel =
    SORT_OPTIONS.find((option) => option.mode === sortMode)?.label ?? '기본순';

  const handleToggleLike = async (trainer: TrainerListItem) => {
    try {
      await setTrainerLikeMutation.mutateAsync({
        payload: { liked: !trainer.liked },
        trainerId: trainer.id,
      });
    } catch {
      Alert.alert('오류', '트레이너 찜 상태를 저장하지 못했어요.');
    }
  };

  return (
    <View style={styles.container}>
      {sortMenuOpen ? (
        <Pressable
          onPress={() => setSortMenuOpen(false)}
          style={styles.dropdownOverlay}
        />
      ) : null}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>AI 트레이너 추천</Text>
          <View style={styles.sortWrap}>
            <Pressable
              onPress={() => setSortMenuOpen((current) => !current)}
              style={styles.sortButton}
            >
              <Text style={styles.sortButtonText}>{sortLabel}</Text>
              <ChevronDown color={Colors.textSecondary} size={14} />
            </Pressable>
            {sortMenuOpen ? (
              <View style={styles.dropdown}>
                {SORT_OPTIONS.map((option) => (
                  <Pressable
                    key={option.mode}
                    onPress={() => {
                      setSortMode(option.mode);
                      setSortMenuOpen(false);
                    }}
                    style={styles.dropdownOption}
                  >
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        option.mode === sortMode &&
                          styles.dropdownOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {option.mode === sortMode ? (
                      <Check color={Colors.accent} size={14} />
                    ) : null}
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.descriptionRow}>
          <View style={styles.descriptionIcon}>
            <AIInfoIcon />
          </View>
          <Text style={styles.descriptionText}>
            AI 추천순을 선택하면 AI가 내 운동기록을 분석해 최적의 트레이너를
            추천해요.
          </Text>
        </View>

        {sortMode === 'ai' ? (
          <SuspenseSection errorMessage="추천 트레이너를 불러오지 못했어요.">
            <RecommendedTrainerList
              onSelect={setSelectedTrainer}
              onToggleLike={handleToggleLike}
            />
          </SuspenseSection>
        ) : (
          <SuspenseSection errorMessage="트레이너 목록을 불러오지 못했어요.">
            <TrainerCatalogList
              onSelect={setSelectedTrainer}
              onToggleLike={handleToggleLike}
              sortMode={sortMode}
            />
          </SuspenseSection>
        )}
      </ScrollView>

      <TrainerDetailModal
        onClose={() => setSelectedTrainer(null)}
        trainer={selectedTrainer}
      />
      <HomeTabBar activeKey="pt-log" />
    </View>
  );
}

function TrainerCatalogList({
  onSelect,
  onToggleLike,
  sortMode,
}: {
  onSelect: (trainer: TrainerDto) => void;
  onToggleLike: (trainer: TrainerDto) => void;
  sortMode: Exclude<SortMode, 'ai'>;
}) {
  const { data } = useTrainers();
  const sortedTrainers = useMemo(() => {
    if (sortMode === 'popular') {
      return data
        .slice()
        .sort((left, right) =>
          right.rating === left.rating
            ? right.memberCount - left.memberCount
            : right.rating - left.rating,
        );
    }

    return data;
  }, [data, sortMode]);

  return (
    <View style={styles.list}>
      {sortedTrainers.map((trainer) => (
        <TrainerCard
          key={trainer.id}
          onPress={() => onSelect(trainer)}
          onToggleLike={() => onToggleLike(trainer)}
          trainer={trainer}
        />
      ))}
    </View>
  );
}

function RecommendedTrainerList({
  onSelect,
  onToggleLike,
}: {
  onSelect: (trainer: RecommendedTrainerDto) => void;
  onToggleLike: (trainer: RecommendedTrainerDto) => void;
}) {
  const { data } = useRecommendedTrainers();

  return (
    <View style={styles.list}>
      {data.map((trainer) => (
        <TrainerCard
          key={trainer.id}
          onPress={() => onSelect(trainer)}
          onToggleLike={() => onToggleLike(trainer)}
          trainer={trainer}
        />
      ))}
    </View>
  );
}

function TrainerCard({
  onPress,
  onToggleLike,
  trainer,
}: {
  onPress: () => void;
  onToggleLike: () => void;
  trainer: TrainerListItem;
}) {
  const isRecommended = 'matchScore' in trainer;
  const connectLabel = resolveConnectRequestLabel(trainer.connectRequestStatus);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.trainerCard,
        pressed && styles.trainerCardPressed,
      ]}
    >
      <View style={styles.cardTop}>
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: trainer.avatarColor,
            },
          ]}
        >
          <Text style={styles.avatarText}>{trainer.name.slice(0, 1)}</Text>
        </View>

        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.trainerName}>{trainer.name}</Text>
            <Star color={GOLD} fill={GOLD} size={12} />
            <Text style={styles.ratingText}>
              {Number(trainer.rating).toFixed(1)}
            </Text>
          </View>
          <Text style={styles.gymText}>{trainer.gymName}</Text>
          <View style={styles.tagRow}>
            {trainer.specialties.map((specialty) => (
              <View key={specialty} style={styles.specialtyTag}>
                <Text style={styles.specialtyTagText}>{specialty}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.actionButtons}>
          <Pressable
            accessibilityLabel={`${trainer.name} 찜`}
            hitSlop={8}
            onPress={(event) => {
              event?.stopPropagation?.();
              onToggleLike();
            }}
          >
            <Heart
              color={trainer.liked ? Colors.accent : Colors.textMuted}
              fill={trainer.liked ? Colors.accent : 'transparent'}
              size={20}
            />
          </Pressable>
          <ChevronRight color={Colors.textMuted} size={18} />
        </View>
      </View>

      {isRecommended ? (
        <View style={styles.matchRow}>
          <View style={styles.highlightTag}>
            <Zap color={GOLD} fill={GOLD} size={10} />
            <Text style={styles.highlightTagText}>{trainer.highlightTag}</Text>
          </View>
          <Text numberOfLines={2} style={styles.reasonText}>
            {trainer.matchReason}
          </Text>
        </View>
      ) : null}

      <View style={styles.cardFooter}>
        <View style={styles.metaLeft}>
          <Clock3 color={Colors.textMuted} size={12} />
          <Text style={styles.metaText}>경력 {trainer.experienceYears}년</Text>
          {trainer.certifications.map((certification) => (
            <View key={certification} style={styles.certTag}>
              <Text style={styles.certTagText}>{certification}</Text>
            </View>
          ))}
          {connectLabel ? (
            <View style={styles.connectStateTag}>
              <Text style={styles.connectStateText}>{connectLabel}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.priceRow}>
          {isRecommended ? (
            <View style={styles.scoreChip}>
              <Text style={styles.scoreChipText}>{trainer.matchScore}점</Text>
            </View>
          ) : null}
          <Text style={styles.priceText}>{trainer.pricePerSession}/회</Text>
        </View>
      </View>
    </Pressable>
  );
}

function TrainerDetailModal({
  onClose,
  trainer,
}: {
  onClose: () => void;
  trainer: TrainerListItem | null;
}) {
  const connectRequestMutation = useCreateTrainerConnectRequest();

  if (!trainer) {
    return null;
  }

  const isLocked =
    trainer.connectRequestStatus === 'pending' ||
    trainer.connectRequestStatus === 'accepted';
  const ctaLabel = isLocked
    ? (resolveConnectRequestLabel(trainer.connectRequestStatus) ?? '요청 완료')
    : 'PT 신청하기';

  const handleConnectRequest = () => {
    if (isLocked) {
      return;
    }

    Alert.alert(
      '트레이너 연결',
      `${trainer.name} 트레이너에게 연결 요청을 보낼까요?`,
      [
        {
          style: 'cancel',
          text: '닫기',
        },
        {
          onPress: async () => {
            try {
              await connectRequestMutation.mutateAsync({
                payload: {},
                trainerId: trainer.id,
              });
              onClose();
              Alert.alert('완료', '트레이너 연결 요청을 보냈어요.');
            } catch {
              Alert.alert('오류', '연결 요청을 보내지 못했어요.');
            }
          },
          text: '보내기',
        },
      ],
    );
  };

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible>
      <View style={styles.modalRoot}>
        <Pressable onPress={onClose} style={styles.modalBackdrop} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <View
              style={[
                styles.modalAvatar,
                {
                  backgroundColor: trainer.avatarColor,
                },
              ]}
            >
              <Text style={styles.modalAvatarText}>
                {trainer.name.slice(0, 1)}
              </Text>
            </View>
            <View style={styles.modalNameWrap}>
              <View style={styles.modalNameRow}>
                <Text style={styles.modalTrainerName}>{trainer.name}</Text>
                <Star color={GOLD} fill={GOLD} size={13} />
                <Text style={styles.modalRating}>
                  {Number(trainer.rating).toFixed(1)}
                </Text>
              </View>
              <Text style={styles.modalGym}>{trainer.gymName}</Text>
            </View>
            <Pressable hitSlop={10} onPress={onClose}>
              <Text style={styles.modalCloseText}>×</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>전문 분야</Text>
              <View style={styles.modalTagRow}>
                {trainer.specialties.map((specialty) => (
                  <View key={specialty} style={styles.modalTag}>
                    <Text style={styles.modalTagText}>{specialty}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>경력 및 자격증</Text>
              <Text style={styles.modalMetaText}>
                경력 {trainer.experienceYears}년
              </Text>
              <View style={styles.modalTagRow}>
                {trainer.certifications.map((certification) => (
                  <View
                    key={certification}
                    style={[styles.modalTag, styles.modalCertTag]}
                  >
                    <Text style={styles.modalTagText}>{certification}</Text>
                  </View>
                ))}
              </View>
            </View>

            {'matchReason' in trainer ? (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>AI 추천 이유</Text>
                <Text style={styles.modalDescription}>
                  {trainer.highlightTag} · {trainer.matchReason}
                </Text>
              </View>
            ) : null}

            <View style={styles.modalPriceSection}>
              <Text style={styles.modalSectionTitle}>PT 비용</Text>
              <Text style={styles.modalPrice}>
                {trainer.pricePerSession}/회
              </Text>
            </View>
          </ScrollView>

          <Pressable
            disabled={isLocked || connectRequestMutation.isPending}
            onPress={handleConnectRequest}
            style={[
              styles.connectButton,
              (isLocked || connectRequestMutation.isPending) &&
                styles.connectButtonDisabled,
            ]}
          >
            <Text style={styles.connectButtonText}>
              {connectRequestMutation.isPending ? '전송 중...' : ctaLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function resolveConnectRequestLabel(status?: string | null) {
  if (status === 'pending') {
    return '연결 요청 보냄';
  }

  if (status === 'accepted') {
    return '연결 승인됨';
  }

  if (status === 'rejected') {
    return '이전 요청 거절됨';
  }

  return null;
}

const styles = StyleSheet.create({
  actionButtons: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    gap: 6,
    paddingTop: 2,
  },
  avatar: {
    alignItems: 'center',
    borderRadius: 14,
    flexShrink: 0,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  avatarText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 22,
  },
  cardFooter: {
    alignItems: 'center',
    borderTopColor: Colors.divider,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  cardTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  certTag: {
    backgroundColor: `${Colors.primary}12`,
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  certTagText: {
    color: Colors.primary,
    fontFamily: 'Pretendard-Medium',
    fontSize: 10,
  },
  connectButton: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 48,
  },
  connectButtonDisabled: {
    backgroundColor: Colors.systemGray3,
  },
  connectButtonText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
  },
  connectStateTag: {
    backgroundColor: Colors.accentLight,
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  connectStateText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-Medium',
    fontSize: 10,
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  content: {
    paddingBottom: 104,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  descriptionIcon: {
    marginTop: 3,
  },
  descriptionRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  descriptionText: {
    color: Colors.textMuted,
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  dropdown: {
    ...iosShadow,
    backgroundColor: Colors.card,
    borderRadius: 10,
    minWidth: 130,
    overflow: 'hidden',
    paddingVertical: 4,
    position: 'absolute',
    right: 0,
    top: 34,
    zIndex: 200,
  },
  dropdownOption: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dropdownOptionText: {
    color: Colors.text,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
  },
  dropdownOptionTextActive: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
  },
  dropdownOverlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 99,
  },
  gymText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
  },
  highlightTag: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 3,
  },
  highlightTagText: {
    color: GOLD,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 11,
  },
  list: {
    gap: 10,
  },
  matchRow: {
    backgroundColor: `${GOLD}0D`,
    borderRadius: 8,
    gap: 5,
    marginBottom: 10,
    padding: 9,
  },
  metaLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 11,
  },
  modalAvatar: {
    alignItems: 'center',
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  modalAvatarText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 22,
  },
  modalBackdrop: {
    backgroundColor: '#00000055',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  modalCertTag: {
    backgroundColor: `${Colors.primary}12`,
  },
  modalCloseText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 28,
    lineHeight: 28,
  },
  modalContent: {
    gap: 20,
    paddingBottom: 4,
  },
  modalDescription: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  modalGym: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
  },
  modalHandle: {
    alignSelf: 'center',
    backgroundColor: Colors.systemGray3,
    borderRadius: 2,
    height: 4,
    width: 38,
  },
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  modalMetaText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
  },
  modalNameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  modalNameWrap: {
    flex: 1,
    gap: 4,
  },
  modalPrice: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 17,
  },
  modalPriceSection: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalRating: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSection: {
    gap: 10,
  },
  modalSectionTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  modalSheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    gap: 18,
    maxHeight: '82%',
    paddingBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  modalTag: {
    backgroundColor: Colors.inputBg,
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  modalTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  modalTagText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
  },
  modalTrainerName: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
  },
  nameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  pageTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 17,
  },
  priceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    gap: 6,
    marginLeft: 8,
  },
  priceText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  ratingText: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  reasonText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    lineHeight: 17,
  },
  scoreChip: {
    backgroundColor: `${GOLD}18`,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  scoreChipText: {
    color: GOLD,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 11,
  },
  sortButton: {
    ...iosShadow,
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sortButtonText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
  },
  sortWrap: {
    alignItems: 'flex-end',
    position: 'relative',
  },
  specialtyTag: {
    backgroundColor: Colors.inputBg,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  specialtyTagText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 11,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 2,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    zIndex: 100,
  },
  trainerCard: {
    ...iosShadow,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
  },
  trainerCardPressed: {
    opacity: 0.85,
  },
  trainerName: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
  },
});
