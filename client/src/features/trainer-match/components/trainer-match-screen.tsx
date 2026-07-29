import { useNavigation } from '@granite-js/react-native';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Heart,
  MapPin,
  Star,
  Users,
} from 'lucide-react-native';
import { type ReactNode, useMemo, useState } from 'react';
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
import Colors, { iosShadow } from 'shared/constants/colors';
import {
  useCreateTrainerConnectRequest,
  useRecommendedTrainers,
  useSetTrainerLike,
  useTrainers,
} from '../api/trainers';

type SortMode = 'ai' | 'default' | 'popular';
type TrainerListItem = RecommendedTrainerDto | TrainerDto;

const SORT_OPTIONS: Array<{ label: string; mode: SortMode }> = [
  { label: '기본순', mode: 'default' },
  { label: 'AI 추천순', mode: 'ai' },
  { label: '인기순', mode: 'popular' },
];

export function TrainerMatchScreen() {
  const navigation = useNavigation();
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
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <ArrowLeft color={Colors.text} size={20} />
        </Pressable>
        <Text style={styles.headerTitle}>AI 추천 트레이너</Text>
        <View style={styles.headerButton} />
      </View>

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
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        </View>

        <Text style={styles.subtitle}>
          현재 운동 기록과 PT 수업일지를 바탕으로 잘 맞는 트레이너를
          추천해드려요.
        </Text>

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
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.cardHeader}>
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
        <View style={styles.cardTitleWrap}>
          <View style={styles.cardTitleRow}>
            <View style={styles.cardNameRow}>
              <Text style={styles.cardName}>{trainer.name}</Text>
              <ChevronRight color={Colors.iconMuted} size={16} />
            </View>
            <Pressable
              accessibilityLabel={`${trainer.name} 찜`}
              hitSlop={8}
              onPress={(event) => {
                event?.stopPropagation?.();
                onToggleLike();
              }}
              style={styles.likeButton}
            >
              <Heart
                color={trainer.liked ? Colors.accent : Colors.textMuted}
                fill={trainer.liked ? Colors.accent : 'transparent'}
                size={18}
              />
            </Pressable>
          </View>
          <Text style={styles.cardGym}>{trainer.gymName}</Text>
        </View>
      </View>

      <View style={styles.cardMetaRow}>
        <MetaBadge
          icon={<Star color={Colors.warning} fill={Colors.warning} size={13} />}
          text={Number(trainer.rating).toFixed(1)}
        />
        <MetaBadge
          icon={<Users color={Colors.info} size={13} />}
          text={`회원 ${trainer.memberCount}명`}
        />
        <MetaBadge
          icon={<MapPin color={Colors.textSecondary} size={13} />}
          text={trainer.region}
        />
      </View>

      <Text style={styles.specialtiesText}>
        {trainer.specialties.join(' · ')}
      </Text>
      <Text style={styles.cardPrice}>
        {trainer.pricePerSession} / {trainer.experienceYears}년 경력
      </Text>

      {isRecommended ? (
        <View style={styles.recommendBox}>
          <View style={styles.recommendHeader}>
            <Text style={styles.recommendTag}>{trainer.highlightTag}</Text>
            <Text style={styles.recommendScore}>{trainer.matchScore}점</Text>
          </View>
          <Text style={styles.recommendReason}>{trainer.matchReason}</Text>
        </View>
      ) : null}

      {connectLabel ? (
        <Text style={styles.connectStateText}>{connectLabel}</Text>
      ) : null}
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
    <Modal onRequestClose={onClose} transparent visible>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>트레이너 상세</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.modalCloseText}>닫기</Text>
            </Pressable>
          </View>

          <View style={styles.modalProfileRow}>
            <View
              style={[
                styles.modalAvatar,
                {
                  backgroundColor: trainer.avatarColor,
                },
              ]}
            >
              <Text style={styles.avatarText}>{trainer.name.slice(0, 1)}</Text>
            </View>
            <View style={styles.modalNameWrap}>
              <Text style={styles.modalTrainerName}>{trainer.name}</Text>
              <Text style={styles.modalTrainerMeta}>
                {trainer.gymName} · {trainer.experienceYears}년 경력
              </Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <DetailSection
              label="전문 분야"
              value={trainer.specialties.join(', ')}
            />
            <DetailSection
              label="집중 부위"
              value={trainer.focusBodyParts.join(', ')}
            />
            <DetailSection label="소개" value={trainer.bio} />
            <DetailSection label="경력" value={trainer.career} />
            <DetailSection
              label="자격 사항"
              value={trainer.certifications.join(', ')}
            />
            <DetailSection label="코칭 철학" value={trainer.philosophy} />
            <DetailSection label="세션 비용" value={trainer.pricePerSession} />
            {'matchReason' in trainer ? (
              <DetailSection
                label="추천 이유"
                value={`${trainer.highlightTag} · ${trainer.matchReason}`}
              />
            ) : null}
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

function DetailSection({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailSection}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function MetaBadge({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <View style={styles.metaBadge}>
      {icon}
      <Text style={styles.metaBadgeText}>{text}</Text>
    </View>
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
  avatar: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  avatarText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 20,
  },
  card: {
    ...iosShadow,
    backgroundColor: Colors.card,
    borderRadius: 18,
    gap: 12,
    padding: 16,
  },
  cardGym: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  cardMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cardName: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 17,
  },
  cardNameRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  cardPrice: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
  },
  cardTitleWrap: {
    flex: 1,
    gap: 3,
  },
  cardTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  connectButton: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: 52,
  },
  connectButtonDisabled: {
    backgroundColor: Colors.systemGray3,
  },
  connectButtonText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
  },
  connectStateText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  content: {
    paddingBottom: 32,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  detailLabel: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
  },
  detailSection: {
    gap: 4,
  },
  detailValue: {
    color: Colors.text,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  dropdown: {
    ...iosShadow,
    backgroundColor: Colors.card,
    borderRadius: 14,
    marginTop: 6,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 44,
    width: 120,
    zIndex: 10,
  },
  dropdownOption: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownOptionText: {
    color: Colors.text,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
  },
  dropdownOptionTextActive: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
  },
  header: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderBottomColor: Colors.cardBorder,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  headerTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 17,
  },
  list: {
    gap: 12,
  },
  likeButton: {
    alignItems: 'center',
    borderRadius: 999,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  metaBadge: {
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  metaBadgeText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Medium',
    fontSize: 11,
  },
  modalAvatar: {
    alignItems: 'center',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  modalCard: {
    backgroundColor: Colors.card,
    borderRadius: 22,
    gap: 16,
    maxHeight: '80%',
    padding: 20,
    width: '90%',
  },
  modalCloseText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
  },
  modalContent: {
    gap: 14,
    paddingBottom: 4,
  },
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalNameWrap: {
    flex: 1,
    gap: 4,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: '#00000066',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalProfileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  modalTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
  },
  modalTrainerMeta: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
  },
  modalTrainerName: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
  },
  pageTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 28,
  },
  recommendBox: {
    backgroundColor: Colors.accentLight,
    borderRadius: 14,
    gap: 6,
    padding: 12,
  },
  recommendHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recommendReason: {
    color: Colors.text,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  recommendScore: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  recommendTag: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
  },
  sortButton: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  specialtiesText: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
    marginTop: 6,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
});
