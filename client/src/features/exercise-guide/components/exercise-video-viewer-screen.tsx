import { useNavigation } from "@granite-js/react-native";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  useExerciseGuide,
  useSetExerciseGuideLike,
} from "../api/exercise-guides";
import { getYoutubeEmbedUrl } from "../lib/get-youtube-embed-url";
import { YoutubeVideoPlayer } from "./youtube-video-player";
import { SuspenseSection } from "shared/components/async-state";
import Colors from "shared/constants/colors";

export function ExerciseVideoViewerScreen({ guideId }: { guideId: string }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <VideoViewerHeader />
      </View>
      <SuspenseSection errorMessage="운동 가이드를 불러오지 못했어요.">
        <ExerciseVideoViewerContent guideId={guideId} />
      </SuspenseSection>
    </View>
  );
}

function VideoViewerHeader() {
  const navigation = useNavigation();

  return (
    <>
      <Pressable
        onPress={() => navigation.goBack()}
        style={styles.headerButton}
      >
        <Text style={styles.headerButtonText}>닫기</Text>
      </Pressable>
      <Text style={styles.headerTitle}>운동 영상</Text>
      <View style={styles.headerSide} />
    </>
  );
}

function ExerciseVideoViewerContent({ guideId }: { guideId: string }) {
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
      Alert.alert("오류", "좋아요를 저장하지 못했어요.");
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <YoutubeVideoPlayer embedUrl={getYoutubeEmbedUrl(guide.videoUrl)} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <Text style={styles.title}>{guide.title}</Text>
          <Pressable
            disabled={pending}
            onPress={handleLike}
            style={styles.likeButton}
          >
            <Text
              style={[
                styles.likeHeart,
                guide.likedByMe
                  ? styles.likeHeartActive
                  : styles.likeHeartInactive,
              ]}
            >
              {guide.likedByMe ? "♥" : "♡"}
            </Text>
            <Text style={styles.likeCount}>{guide.likeCount}</Text>
          </Pressable>
        </View>

        <View style={styles.metaRow}>
          <MetaBadge label={guide.equipment} />
          {guide.targetMuscles ? (
            <MetaBadge label={guide.targetMuscles} />
          ) : null}
        </View>

        <InfoBlock label="운동 설명" value={guide.description} />
      </ScrollView>
    </>
  );
}

function MetaBadge({ label }: { label: string }) {
  return (
    <View style={styles.metaBadge}>
      <Text style={styles.metaBadgeText}>{label}</Text>
    </View>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoBlock}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
    paddingTop: 16,
  },
  content: {
    paddingBottom: 28,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
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
  infoBlock: {
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 16,
    padding: 14,
  },
  infoLabel: {
    color: Colors.textSecondary,
    fontFamily: "Pretendard-SemiBold",
    fontSize: 12,
    marginBottom: 6,
  },
  infoText: {
    color: Colors.text,
    fontFamily: "Pretendard-Regular",
    fontSize: 14,
    lineHeight: 22,
  },
  likeButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    paddingVertical: 4,
  },
  likeCount: {
    color: Colors.textSecondary,
    fontFamily: "Pretendard-Medium",
    fontSize: 14,
  },
  likeHeart: {
    fontSize: 21,
    lineHeight: 24,
  },
  likeHeartActive: {
    color: Colors.danger,
  },
  likeHeartInactive: {
    color: Colors.textSecondary,
  },
  metaBadge: {
    backgroundColor: "#eef2ff",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  metaBadgeText: {
    color: Colors.primaryLight,
    fontFamily: "Pretendard-Medium",
    fontSize: 13,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  title: {
    color: Colors.text,
    flex: 1,
    fontFamily: "Pretendard-Medium",
    fontSize: 22,
    paddingRight: 12,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
