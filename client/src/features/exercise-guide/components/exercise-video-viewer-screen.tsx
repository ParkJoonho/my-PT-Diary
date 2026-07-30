import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SuspenseSection } from 'shared/components/async-state';
import {
  OriginalAppIcon,
  type OriginalAppIconName,
} from 'shared/components/icons/pt-diary-icons';
import Colors from 'shared/constants/colors';
import {
  useExerciseGuide,
  useSetExerciseGuideLike,
} from '../api/exercise-guides';
import { getYoutubeEmbedUrl } from '../lib/get-youtube-embed-url';
import { YoutubeVideoPlayer } from './youtube-video-player';

export function ExerciseVideoViewerScreen({
  contentBottomInset,
  guideId,
}: {
  contentBottomInset: number;
  guideId: string;
}) {
  return (
    <View style={styles.container}>
      <SuspenseSection errorMessage="운동 가이드를 불러오지 못했어요.">
        <ExerciseVideoViewerContent
          contentBottomInset={contentBottomInset}
          guideId={guideId}
        />
      </SuspenseSection>
    </View>
  );
}

function ExerciseVideoViewerContent({
  contentBottomInset,
  guideId,
}: {
  contentBottomInset: number;
  guideId: string;
}) {
  const { data: guide } = useExerciseGuide(guideId);
  const likeMutation = useSetExerciseGuideLike();
  const [pending, setPending] = useState(false);

  const handleLike = async () => {
    if (pending) {
      return;
    }

    setPending(true);

    try {
      await likeMutation.mutateAsync({
        guideId: guide.id,
        liked: !guide.likedByMe,
      });
    } catch {
      Alert.alert('오류', '좋아요를 저장하지 못했어요.');
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <YoutubeVideoPlayer embedUrl={getYoutubeEmbedUrl(guide.videoUrl)} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: contentBottomInset },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <Text style={styles.title}>{guide.title}</Text>
          <Pressable
            disabled={pending}
            onPress={handleLike}
            style={styles.likeButton}
            testID="video-like-button"
          >
            <OriginalAppIcon
              color={guide.likedByMe ? Colors.danger : Colors.textSecondary}
              name={guide.likedByMe ? 'heart' : 'heartOutline'}
              size={24}
            />
            {guide.likeCount > 0 ? (
              <Text style={styles.likeCount}>{guide.likeCount}</Text>
            ) : null}
          </Pressable>
        </View>

        {guide.equipment ? <MetaBadge label={guide.equipment} /> : null}

        {guide.targetMuscles ? (
          <InfoBlock
            icon="body"
            iconColor={Colors.info}
            label="타겟 근육"
            value={guide.targetMuscles}
          />
        ) : null}

        {guide.description ? (
          <InfoBlock
            icon="documentText"
            iconColor={Colors.accent}
            label="운동 설명"
            value={guide.description}
          />
        ) : null}
      </ScrollView>
    </>
  );
}

function MetaBadge({ label }: { label: string }) {
  return (
    <View style={styles.metaRow}>
      <View style={styles.metaBadge}>
        <OriginalAppIcon color={Colors.primaryLight} name="barbell" size={14} />
        <Text style={styles.metaBadgeText}>{label}</Text>
      </View>
    </View>
  );
}

function InfoBlock({
  icon,
  iconColor,
  label,
  value,
}: {
  icon: OriginalAppIconName;
  iconColor: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoBlock}>
      <OriginalAppIcon color={iconColor} name={icon} size={16} />
      <View style={styles.infoBlockContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoText}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  infoBlock: {
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    padding: 14,
  },
  infoBlockContent: {
    flex: 1,
  },
  infoLabel: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
    marginBottom: 4,
  },
  infoText: {
    color: Colors.text,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 22,
  },
  likeButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  likeCount: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
  },
  metaBadge: {
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  metaBadgeText: {
    color: Colors.primaryLight,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  title: {
    color: Colors.text,
    flex: 1,
    fontFamily: 'Pretendard-Medium',
    fontSize: 22,
    paddingRight: 12,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
