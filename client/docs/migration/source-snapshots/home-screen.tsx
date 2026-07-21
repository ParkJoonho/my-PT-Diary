import React, { useCallback, useState, useMemo } from "react";
import { AppLogo } from "@/components/AppLogo";
import { AppHeader } from "@/components/AppHeader";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
  RefreshControl,
  Image,
  Modal,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { CheckIcon, AIInfoIcon, TimeIcon, FireIcon, ChatIcon } from "@/components/TabIcons";
import { useQuery, useMutation } from "@tanstack/react-query";
import Colors, { iosShadow, iosShadowLight, gradeColors } from "@/constants/colors";
import { useAuth } from "@/lib/auth-context";
import { getPTLessons, getPersonalExercises, getConditionChecks } from "@/lib/storage";
import { getQueryFn, apiRequest, queryClient } from "@/lib/query-client";
import type { PTLesson, PersonalExercise, ConditionCheck } from "@/lib/types";
import type { PersonalizedRoutines, AIRoutineStep } from "@/types/workout";
import type { RecommendedTrainer } from "@/types/auth";

import { RECOMMENDED_ROUTINES } from "@/lib/routines";
import { setActiveRoutine } from "@/lib/active-routine-store";

const EXERCISE_TAG_MAP: Record<string, string> = {
  스쿼트: "하체 근력 강화", 와이드스쿼트: "하체 근력 강화", "와이드 스쿼트": "하체 근력 강화",
  런지: "하체 근력 강화", "사이드 런지": "하체 근력 강화",
  레그프레스: "하체 근력 강화", 레그컬: "하체 근력 강화", 레그익스텐션: "하체 근력 강화",
  박스점프: "하체 폭발력",
  푸시업: "상체 근력 강화", "다이아몬드 푸시업": "삼두 근력 강화", "파이크 푸시업": "어깨 근력 강화",
  벤치프레스: "가슴 근력 강화", "인클라인 덤벨프레스": "가슴 근력 강화", "덤벨 플라이": "가슴 근력 강화",
  "덤벨 숄더프레스": "어깨 근력 강화", "바벨 숄더프레스": "어깨 근력 강화", "사이드 레터럴레이즈": "어깨 근력 강화",
  랫풀다운: "등 근력 강화", "바벨 로우": "등 근력 강화", "시티드 로우": "등 근력 강화", 풀업: "상체 근력 강화",
  플랭크: "코어 근력 강화", "사이드 플랭크": "코어 근력 강화", "토즈투바": "코어 근력 강화",
  크런치: "코어 근력 강화", "자전거 크런치": "코어 근력 강화", "바이시클 크런치": "코어 근력 강화",
  "레그레이즈": "코어 근력 강화", 슈퍼맨: "등·코어 강화",
  "글루트 브릿지": "둔근 강화", 힙쓰러스트: "둔근 강화",
  버피: "전신 근력 강화", "버피 오버 바": "전신 지구력", 쓰러스트: "전신 근력 강화",
  "마운틴 클라이머": "코어·유산소",
  "케틀벨 스윙": "힙·등 근력", "월볼 스로우": "전신 협응력",
  "클린 앤 저크": "전신 파워", 스내치: "전신 파워", 머슬업: "상체 근력 강화",
  "핸드스탠드 푸시업": "어깨·코어 강화",
  러닝머신: "유산소 운동", 사이클: "유산소 운동", "제자리 뛰기": "유산소 운동",
  "점핑잭": "유산소 운동", 로잉머신: "유산소 워밍업",
  "더블언더 줄넘기": "유산소 지구력",
  스트레칭: "유연성 향상", "폼롤러 릴리즈": "근막 이완",
  "캣카우 스트레칭": "척추 안정성 향상", "캣카우": "척추 안정성 향상",
};

const REASON_KEYWORD_PATTERNS: { keyword: string; tag: string }[] = [
  { keyword: "코어", tag: "코어 근력 강화" },
  { keyword: "하체", tag: "하체 근력 강화" },
  { keyword: "상체", tag: "상체 근력 강화" },
  { keyword: "가슴", tag: "가슴 근력 강화" },
  { keyword: "등 근력", tag: "등 근력 강화" },
  { keyword: "어깨", tag: "어깨 근력 강화" },
  { keyword: "삼두", tag: "삼두 근력 강화" },
  { keyword: "이두", tag: "이두 근력 강화" },
  { keyword: "둔근", tag: "둔근 강화" },
  { keyword: "엉덩이", tag: "둔근 강화" },
  { keyword: "척추", tag: "척추 안정성 향상" },
  { keyword: "폭발력", tag: "하체 폭발력" },
  { keyword: "유산소", tag: "유산소 운동" },
  { keyword: "유연성", tag: "유연성 향상" },
  { keyword: "근막", tag: "근막 이완" },
  { keyword: "전신", tag: "전신 근력 강화" },
  { keyword: "자세 교정", tag: "자세 교정" },
  { keyword: "교정", tag: "자세 교정" },
  { keyword: "균형", tag: "균형 감각 향상" },
  { keyword: "협응", tag: "전신 협응력" },
  { keyword: "지구력", tag: "심폐 지구력" },
];

function resolveStepTag(name: string, tag?: string, reason?: string): string | undefined {
  if (tag && tag.length <= 12) return tag;
  const byName = EXERCISE_TAG_MAP[name] ?? EXERCISE_TAG_MAP[name.replace(/\s/g, "")];
  if (byName) return byName;
  if (reason) {
    for (const { keyword, tag: t } of REASON_KEYWORD_PATTERNS) {
      if (reason.includes(keyword)) return t;
    }
  }
  return undefined;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [ptLessons, setPtLessons] = useState<PTLesson[]>([]);
  const [exercises, setExercises] = useState<PersonalExercise[]>([]);
  const [conditions, setConditions] = useState<ConditionCheck[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedRoutine, setExpandedRoutine] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<"gym" | "home">("gym");
  const [activeRoutineTab, setActiveRoutineTab] = useState<"ai" | "gym" | "crossfit" | "home">("ai");
  const [selectedTrainer, setSelectedTrainer] = useState<RecommendedTrainer | null>(null);
  const [showAllTrainers, setShowAllTrainers] = useState(false);

  const { data: recommendedTrainers = [] } = useQuery<RecommendedTrainer[]>({
    queryKey: ["/api/trainers/recommended"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: activeEvents = [] } = useQuery<any[]>({
    queryKey: ["/api/events/active"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: myConnectRequests = [] } = useQuery<any[]>({
    queryKey: ["/api/my-connect-requests"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  const connectRequestMutation = useMutation({
    mutationFn: async ({ trainerId, message }: { trainerId: string; message?: string }) => {
      await apiRequest("POST", `/api/trainer/${trainerId}/connect-request`, { message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-connect-requests"] });
    },
  });

  const { data: aiRoutinesData, isLoading: aiRoutinesLoading } = useQuery<{ success: boolean; routines: PersonalizedRoutines | null; reason?: string }>({
    queryKey: ["/api/ai/personalized-routines"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
    staleTime: 0,
  });

  const aiRoutines = aiRoutinesData?.routines || null;

  const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })();
  const { data: mealDietTip } = useQuery<{ tip: string; icon: string } | null>({
    queryKey: ["/api/meal-records/diet-routine-tip", today],
    queryFn: async () => {
      try {
        const res = await fetch(new URL(`/api/meal-records/daily-summary?date=${today}`, (await import("@/lib/query-client")).getApiUrl()).toString(), {
          headers: { "Authorization": `Bearer ${await (async () => { try { const AS = (await import("@react-native-async-storage/async-storage")).default; return (await AS.getItem("auth_token")) || ""; } catch { return ""; } })()}` },
        });
        const data = await res.json();
        if (!data || data.mealCount === 0) return null;
        const cal = Number(data.totalCalories) || 0;
        const p = Number(data.totalProtein) || 0;
        const c = Number(data.totalCarbs) || 0;
        const f = Number(data.totalFat) || 0;
        const totalMacro = (p * 4) + (c * 4) + (f * 9);
        const pRatio = totalMacro > 0 ? (p * 4 / totalMacro) * 100 : 0;
        const cRatio = totalMacro > 0 ? (c * 4 / totalMacro) * 100 : 0;

        if (cal > 2500) return { tip: `오늘 ${cal}kcal 섭취 — 칼로리 소모를 위해 HIIT나 서킷 트레이닝이 포함된 루틴을 추천합니다`, icon: "flame" };
        if (cal < 1200 && cal > 0) return { tip: `오늘 ${cal}kcal 섭취 — 에너지가 부족할 수 있으니 고강도 운동보다 가벼운 루틴을 권합니다`, icon: "leaf" };
        if (pRatio < 15) return { tip: `단백질 비율 ${Math.round(pRatio)}%로 부족 — 근지구력 위주 운동을 추천합니다. 운동 후 단백질 보충도 잊지 마세요!`, icon: "nutrition" };
        if (cRatio > 65) return { tip: `탄수화물 비율 ${Math.round(cRatio)}%로 높음 — 유산소 비중이 높은 루틴으로 에너지를 효율적으로 사용하세요`, icon: "bicycle" };
        if (cal >= 1800 && cal <= 2500) return { tip: `오늘 ${cal}kcal 섭취 — 적정 칼로리! 균형 잡힌 운동 루틴을 수행하기에 좋은 컨디션입니다`, icon: "checkmark-circle" };
        return null;
      } catch { return null; }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const { data: trainerRoutinesData } = useQuery<{ trainer: any; routines: any[] }>({
    queryKey: ["/api/trainer/routines/for-user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  const { data: latestAIAnalysis } = useQuery<{ success: boolean; records: any[] }>({
    queryKey: ["/api/analysis-records?type=state-vector"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
  });

  const [expandedTrainerRoutine, setExpandedTrainerRoutine] = useState<string | null>(null);

  const now = useMemo(() => new Date(), [refreshing]);

  const loadData = useCallback(async () => {
    const [p, e, c] = await Promise.all([
      getPTLessons(),
      getPersonalExercises(),
      getConditionChecks(),
    ]);
    setPtLessons(p);
    setExercises(e);
    setConditions(c);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const totalVolume = useMemo(() => ptLessons.reduce((acc, l) => {
    return acc + l.exercises.reduce((a, ex) => a + (ex.volume || 0), 0);
  }, 0), [ptLessons]);

  const latestCondition = conditions.length > 0 ? conditions[0] : null;
  const avgCondition = useMemo(() => latestCondition
    ? (
        latestCondition.conditions.reduce((a, c) => a + c.score, 0) /
        Math.max(latestCondition.conditions.filter((c) => c.score > 0).length, 1)
      ).toFixed(1)
    : "-", [latestCondition]);

  const todayStr = now.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" });
  const timeStr = now.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: true });

  const todayDateOnly = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const nextPT = useMemo(() => ptLessons
    .filter((l) => l.date >= todayDateOnly)
    .sort((a, b) => a.date.localeCompare(b.date))[0] || null, [ptLessons, todayDateOnly]);

  const todayStart = useMemo(() => new Date(now.getFullYear(), now.getMonth(), now.getDate()), [now]);
  const twoWeeksLater = useMemo(() => new Date(todayStart.getTime() + 14 * 24 * 60 * 60 * 1000), [todayStart]);
  const { hasUpcomingEvents, upcomingEventCount } = useMemo(() => {
    if (!Array.isArray(activeEvents)) return { hasUpcomingEvents: false, upcomingEventCount: 0 };
    const upcoming = activeEvents.filter((ev: any) => {
      const evDate = new Date(ev.date);
      return evDate >= todayStart && evDate <= twoWeeksLater;
    });
    return { hasUpcomingEvents: upcoming.length > 0, upcomingEventCount: upcoming.length };
  }, [activeEvents, todayStart, twoWeeksLater]);

  const { todayWorkoutCount, todayVolume, todayExerciseCount } = useMemo(() => {
    const todayPTLessons = ptLessons.filter((l) => l.date === todayDateOnly);
    const todayExs = exercises.filter((e) => e.date === todayDateOnly);
    return {
      todayWorkoutCount: todayPTLessons.length + todayExs.length,
      todayVolume: todayPTLessons.reduce((acc, l) => acc + l.exercises.reduce((a, ex) => a + (ex.volume || 0), 0), 0)
        + todayExs.reduce((acc, e) => acc + e.exercises.reduce((a, ex) => a + (ex.volume || 0), 0), 0),
      todayExerciseCount: todayPTLessons.reduce((acc, l) => acc + l.exercises.length, 0)
        + todayExs.reduce((acc, e) => acc + e.exercises.length, 0),
    };
  }, [ptLessons, exercises, todayDateOnly]);

  const streakDays = useMemo(() => {
    const weekDayLabels = ["월", "화", "수", "목", "금", "토", "일"];
    const dayOfWeek = todayStart.getDay(); // 0=일, 1=월, ..., 6=토
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(todayStart.getTime() - daysFromMonday * 24 * 60 * 60 * 1000);
    const days: { date: string; label: string; hasWorkout: boolean }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const hasPT = ptLessons.some((l) => l.date === dateStr);
      const hasEx = exercises.some((e) => e.date === dateStr);
      days.push({ date: dateStr, label: weekDayLabels[i], hasWorkout: hasPT || hasEx || i === 0 || i === 1 });
    }
    return days;
  }, [todayStart, ptLessons, exercises]);
  const streakCount = useMemo(() => {
    let count = 0;
    for (let i = 0; i < streakDays.length; i++) {
      if (streakDays[i].hasWorkout) count++;
      else break;
    }
    return count;
  }, [streakDays]);

  const aiGrade = useMemo(() => {
    if (!latestAIAnalysis?.records?.length) return null;
    const latest = latestAIAnalysis.records[0];
    const data = latest.data as any;
    if (data?.compositeScore?.grade) {
      return { grade: data.compositeScore.grade as string, score: data.compositeScore.total as number };
    }
    return null;
  }, [latestAIAnalysis]);

  return (
    <View style={styles.container}>
      <AppHeader standalone />

      <Modal
        visible={!!selectedTrainer}
        animationType="slide"
        presentationStyle={Platform.OS === "ios" ? "pageSheet" : "fullScreen"}
        onRequestClose={() => setSelectedTrainer(null)}
      >
        {selectedTrainer && (
          <View style={[tdStyles.container, { paddingTop: Platform.OS === "web" ? 20 : insets.top + 8 }]}>
            <View style={tdStyles.header}>
              <Pressable onPress={() => setSelectedTrainer(null)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </Pressable>
              <Text style={tdStyles.headerTitle}>트레이너 프로필</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={tdStyles.body} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
              <View style={tdStyles.photosRow}>
                <View style={tdStyles.photoCol}>
                  {selectedTrainer.profilePhoto ? (
                    <Image source={{ uri: selectedTrainer.profilePhoto }} style={tdStyles.profilePhoto} />
                  ) : (
                    <View style={tdStyles.profilePhotoPlaceholder}>
                      <Ionicons name="person" size={32} color={Colors.textMuted} />
                    </View>
                  )}
                  <Text style={tdStyles.photoCaption}>얼굴 사진</Text>
                </View>
                {selectedTrainer.fullBodyPhoto && (
                  <View style={tdStyles.photoCol}>
                    <Image source={{ uri: selectedTrainer.fullBodyPhoto }} style={tdStyles.fullBodyPhoto} />
                    <Text style={tdStyles.photoCaption}>전신 사진</Text>
                  </View>
                )}
              </View>

              <Text style={tdStyles.trainerName}>{selectedTrainer.name}</Text>
              <View style={tdStyles.memberBadge}>
                <Ionicons name="people-outline" size={14} color={Colors.info} />
                <Text style={tdStyles.memberBadgeText}>회원 {selectedTrainer.memberCount}명 관리 중</Text>
              </View>

              {selectedTrainer.specialties ? (
                <View style={tdStyles.infoCard}>
                  <Text style={tdStyles.infoLabel}>전문 분야</Text>
                  <Text style={tdStyles.infoValue}>{selectedTrainer.specialties}</Text>
                </View>
              ) : null}

              {selectedTrainer.bio ? (
                <View style={tdStyles.infoCard}>
                  <Text style={tdStyles.infoLabel}>자기소개</Text>
                  <Text style={tdStyles.infoValue}>{selectedTrainer.bio}</Text>
                </View>
              ) : null}

              {selectedTrainer.career ? (
                <View style={tdStyles.infoCard}>
                  <Text style={tdStyles.infoLabel}>경력사항</Text>
                  <Text style={tdStyles.infoValue}>{selectedTrainer.career}</Text>
                </View>
              ) : null}

              {selectedTrainer.certifications ? (
                <View style={tdStyles.infoCard}>
                  <Text style={tdStyles.infoLabel}>자격사항</Text>
                  <Text style={tdStyles.infoValue}>{selectedTrainer.certifications}</Text>
                </View>
              ) : null}

              {(() => {
                const req = (myConnectRequests || []).find(
                  (r: any) => r.trainer_id === selectedTrainer.id && (r.status === "pending" || r.status === "accepted")
                );
                if (req?.status === "accepted") {
                  return (
                    <View style={tdStyles.connectStatusBadge}>
                      <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                      <Text style={tdStyles.connectStatusText}>연결됨</Text>
                    </View>
                  );
                }
                if (req?.status === "pending") {
                  return (
                    <View style={tdStyles.connectStatusBadge}>
                      <Ionicons name="time-outline" size={18} color={Colors.accent} />
                      <Text style={[tdStyles.connectStatusText, { color: Colors.accent }]}>요청 대기중</Text>
                    </View>
                  );
                }
                return (
                  <Pressable
                    style={tdStyles.connectBtn}
                    onPress={() => {
                      Alert.alert(
                        "연결 요청",
                        `${selectedTrainer.name} 트레이너에게 연결 요청을 보낼까요?`,
                        [
                          { text: "닫기", style: "cancel" },
                          {
                            text: "요청",
                            onPress: () => {
                              connectRequestMutation.mutate(
                                { trainerId: selectedTrainer.id },
                                {
                                  onSuccess: () => {
                                    Alert.alert("완료", "연결 요청을 보냈습니다.");
                                  },
                                  onError: (err: any) => {
                                    const msg = err?.message?.includes("400")
                                      ? "이미 요청을 보냈거나 연결된 트레이너입니다."
                                      : "연결 요청에 실패했어요.";
                                    Alert.alert("오류", msg);
                                  },
                                }
                              );
                            },
                          },
                        ]
                      );
                    }}
                    disabled={connectRequestMutation.isPending}
                  >
                    <Ionicons name="link-outline" size={18} color={Colors.white} />
                    <Text style={tdStyles.connectBtnText}>연결 요청</Text>
                  </Pressable>
                );
              })()}
            </ScrollView>
          </View>
        )}
      </Modal>

      <Modal
        visible={showAllTrainers}
        animationType="slide"
        presentationStyle={Platform.OS === "ios" ? "pageSheet" : "fullScreen"}
        onRequestClose={() => setShowAllTrainers(false)}
      >
        <View style={[tdStyles.container, { paddingTop: Platform.OS === "web" ? 20 : insets.top + 8 }]}>
          <View style={tdStyles.header}>
            <Pressable onPress={() => setShowAllTrainers(false)}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </Pressable>
            <Text style={tdStyles.headerTitle}>추천 트레이너</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView style={tdStyles.body} contentContainerStyle={{ paddingBottom: 40, gap: 12 }} showsVerticalScrollIndicator={false}>
            <View style={styles.allTrainersHeader}>
              <Ionicons name="people-outline" size={20} color={Colors.info} />
              <Text style={styles.allTrainersTitle}>AI 매칭 추천 트레이너</Text>
            </View>
            {(recommendedTrainers as RecommendedTrainer[]).map((t) => (
              <Pressable
                key={t.id}
                style={styles.allTrainerRow}
                onPress={() => { setShowAllTrainers(false); setSelectedTrainer(t); }}
              >
                {t.profilePhoto ? (
                  <Image source={{ uri: t.profilePhoto }} style={styles.allTrainerAvatar} />
                ) : (
                  <View style={styles.allTrainerAvatarPlaceholder}>
                    <Ionicons name="person" size={20} color={Colors.white} />
                  </View>
                )}
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.allTrainerName}>{t.name}</Text>
                  {t.specialties ? <Text style={styles.allTrainerSpec}>{t.specialties}</Text> : null}
                </View>
                <View style={styles.trainerMemberBadge}>
                  <Ionicons name="people-outline" size={10} color={Colors.info} />
                  <Text style={styles.trainerMemberText}>회원 {t.memberCount}명</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Platform.OS === "web" ? 100 : 120 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />
        }
      >
        {/* 주간 트래커 */}
        <View style={styles.weeklyTrackerCard}>
          <View style={styles.weeklyTrackerHeader}>
            <Text style={styles.weeklyTrackerTitle}>주간 트래커</Text>
            {streakCount > 0 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakBadgeText}>{streakCount}일 연속</Text>
              </View>
            )}
          </View>
          <View style={styles.weeklyDayRow}>
            {streakDays.map((day) => (
              <View key={day.date} style={styles.weeklyDayCol}>
                {day.hasWorkout ? (
                  <CheckIcon />
                ) : (
                  <View style={styles.weeklyDayCircle} />
                )}
                <Text style={styles.weeklyDayLabel}>{day.label}</Text>
              </View>
            ))}
          </View>
          {aiGrade && (
            <Pressable style={styles.aiGradeBanner} onPress={() => router.push("/fitness-state")}>
              <View style={[styles.aiGradeBadge, { backgroundColor: (gradeColors[aiGrade.grade] || Colors.textMuted) + "20" }]}>
                <Text style={[styles.aiGradeText, { color: gradeColors[aiGrade.grade] || Colors.textMuted }]}>{aiGrade.grade}</Text>
              </View>
              <View style={styles.aiGradeInfo}>
                <Text style={styles.aiGradeLabel}>AI Fitness Score</Text>
                <Text style={styles.aiGradeScore}>{aiGrade.score}/100</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </Pressable>
          )}
        </View>

        {/* 루틴 선택 */}
        <View style={styles.routineCard}>
          <Text style={styles.routineCardTitle}>루틴 선택</Text>

          {/* 4 탭 버튼 */}
          <View style={styles.routineTabRow}>
            {([
              { key: "ai" as const, label: "AI추천" },
              { key: "gym" as const, label: "헬스장" },
              { key: "crossfit" as const, label: "크로스핏" },
              { key: "home" as const, label: "홈트" },
            ]).map((tab) => (
              <Pressable
                key={tab.key}
                style={[styles.routineTab, activeRoutineTab === tab.key && styles.routineTabActive]}
                onPress={() => { setActiveRoutineTab(tab.key); setExpandedRoutine(null); }}
              >
                <Text style={[styles.routineTabText, activeRoutineTab === tab.key && styles.routineTabTextActive, { fontFamily: activeRoutineTab === tab.key ? "Pretendard-Medium" : "Pretendard-SemiBold" }]}>
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* AI추천 탭 */}
          {activeRoutineTab === "ai" && (
            <>
              <View style={styles.aiDescCard}>
                <View style={{ marginTop: 3 }}>
                  <AIInfoIcon />
                </View>
                <Text style={styles.aiDescText}>
                  {"AI가 체형과 자세를 분석해 만든 루틴이에요. 약한 부위를 강화하고 척추·무릎 정렬을 잡아줘요."}
                </Text>
              </View>

              {/* 헬스장 / 홈트 서브탭 */}
              <View style={styles.subTabRow}>
                <Pressable
                  style={[styles.subTab, selectedLocation === "gym" && styles.subTabActive]}
                  onPress={() => { setSelectedLocation("gym"); setExpandedRoutine(null); }}
                >
                  <Text style={[styles.subTabText, selectedLocation === "gym" && styles.subTabTextActive]}>헬스장</Text>
                </Pressable>
                <Pressable
                  style={[styles.subTab, selectedLocation === "home" && styles.subTabActive]}
                  onPress={() => { setSelectedLocation("home"); setExpandedRoutine(null); }}
                >
                  <Text style={[styles.subTabText, selectedLocation === "home" && styles.subTabTextActive]}>홈트</Text>
                </Pressable>
              </View>

              {/* AI 루틴 아코디언 */}
              {aiRoutinesLoading ? (
                <View style={styles.aiEmptyState}>
                  <MaterialCommunityIcons name="brain" size={28} color="#D4AF37" />
                  <Text style={styles.aiEmptyText}>AI가 맞춤 루틴을 생성하고 있습니다...{"\n"}잠시만 기다려 주세요</Text>
                </View>
              ) : (() => {
                const aiList = selectedLocation === "gym" ? aiRoutines?.gym : aiRoutines?.home;
                if (!aiList || aiList.length === 0) {
                  return (
                    <View style={styles.aiEmptyState}>
                      <MaterialCommunityIcons name="brain" size={28} color={Colors.textMuted} />
                      <Text style={styles.aiEmptyText}>AI 맞춤 루틴을 불러오지 못했어요.{"\n"}잠시 후 다시 시도해 주세요</Text>
                    </View>
                  );
                }
                return (
                  <View style={styles.accordionList}>
                    {aiList.map((routine) => {
                      const isExpanded = expandedRoutine === routine.id;
                      return (
                        <View key={routine.id} style={[styles.accordionItem, isExpanded && styles.accordionItemExpandedAI]}>
                          <Pressable style={styles.accordionHeader} onPress={() => setExpandedRoutine(isExpanded ? null : routine.id)}>
                            <View style={styles.accordionHeaderLeft}>
                              <TimeIcon active={isExpanded} />
                              <Text style={styles.accordionLabel}>{routine.label}</Text>
                            </View>
                            <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#B8C1CC" />
                          </Pressable>
                          {isExpanded && (
                            <View style={styles.accordionBody}>
                              {(() => {
                                const restStep = routine.steps.find((s: AIRoutineStep) => s.type !== "stretch" && s.restAfter);
                                return restStep?.restAfter ? (
                                  <View style={styles.restNoteRow}>
                                    <ChatIcon />
                                    <Text style={styles.restNoteText}>각 세트당 휴식 {restStep.restAfter}</Text>
                                  </View>
                                ) : null;
                              })()}
                              <View style={styles.routineSteps}>
                                {routine.steps.map((step: AIRoutineStep, idx: number) => (
                                  <View key={idx} style={styles.routineStepRow}>
                                    <View style={styles.routineStepLeft}>
                                      <FireIcon />
                                      {idx < routine.steps.length - 1 && <View style={styles.routineStepLine} />}
                                    </View>
                                    <View style={[styles.routineStepContent, idx === routine.steps.length - 1 && { paddingBottom: 0 }]}>
                                      <View style={styles.routineStepTopRow}>
                                        <Text style={styles.routineStepName}>{step.name}</Text>
                                        <Text style={styles.routineStepDetailRight}>{step.detail}</Text>
                                      </View>
                                      {resolveStepTag(step.name, step.tag, step.reason) && (
                                        <View style={styles.routineStepTag}>
                                          <Text style={styles.routineStepTagText}>{resolveStepTag(step.name, step.tag, step.reason)}</Text>
                                        </View>
                                      )}
                                    </View>
                                  </View>
                                ))}
                              </View>
                              <Pressable
                                testID="start-ai-workout"
                                style={styles.startWorkoutBtn}
                                onPress={async () => {
                                  await setActiveRoutine({ id: routine.id, label: routine.label, duration: routine.duration, location: selectedLocation, steps: routine.steps });
                                  router.push({ pathname: "/active-workout", params: { routineId: routine.id, isAI: "true" } });
                                }}
                              >
                                <Ionicons name="play" size={16} color={Colors.white} />
                                <Text style={styles.startWorkoutBtnText}>운동 시작</Text>
                              </Pressable>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                );
              })()}
            </>
          )}

          {/* 헬스장 / 크로스핏 / 홈트 탭 */}
          {activeRoutineTab !== "ai" && (
            <View style={styles.accordionList}>
              {RECOMMENDED_ROUTINES.filter((r) => {
                if (activeRoutineTab === "gym") return r.location === "gym" && r.pattern === "general";
                if (activeRoutineTab === "crossfit") return r.location === "gym" && r.pattern === "crossfit";
                if (activeRoutineTab === "home") return r.location === "home";
                return false;
              }).map((routine) => {
                const isExpanded = expandedRoutine === routine.id;
                return (
                  <View key={routine.id} style={[styles.accordionItem, isExpanded && styles.accordionItemExpanded]}>
                    <Pressable style={styles.accordionHeader} onPress={() => setExpandedRoutine(isExpanded ? null : routine.id)}>
                      <View style={styles.accordionHeaderLeft}>
                        <TimeIcon active={isExpanded} />
                        <Text style={styles.accordionLabel}>{routine.label}</Text>
                      </View>
                      <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#B8C1CC" />
                    </Pressable>
                    {isExpanded && (
                      <View style={styles.accordionBody}>
                        {(() => {
                          const restStep = routine.steps.find((s) => s.type !== "stretch" && s.restAfter);
                          return restStep?.restAfter ? (
                            <View style={styles.restNoteRow}>
                              <ChatIcon />
                              <Text style={styles.restNoteText}>각 세트당 휴식 {restStep.restAfter}</Text>
                            </View>
                          ) : null;
                        })()}
                        <View style={styles.routineSteps}>
                          {routine.steps.map((step, idx) => (
                            <View key={idx} style={styles.routineStepRow}>
                              <View style={styles.routineStepLeft}>
                                <FireIcon />
                                {idx < routine.steps.length - 1 && <View style={styles.routineStepLine} />}
                              </View>
                              <View style={[styles.routineStepContent, idx === routine.steps.length - 1 && { paddingBottom: 0 }]}>
                                <View style={styles.routineStepTopRow}>
                                  <Text style={styles.routineStepName}>{step.name}</Text>
                                  <Text style={styles.routineStepDetailRight}>{step.detail}</Text>
                                </View>
                                {step.tag && (
                                  <View style={styles.routineStepTag}>
                                    <Text style={styles.routineStepTagText}>{step.tag}</Text>
                                  </View>
                                )}
                              </View>
                            </View>
                          ))}
                        </View>
                        <Pressable
                          testID="start-workout"
                          style={styles.startWorkoutBtn}
                          onPress={() => router.push({ pathname: "/active-workout", params: { routineId: routine.id } })}
                        >
                          <Ionicons name="play" size={16} color={Colors.white} />
                          <Text style={styles.startWorkoutBtnText}>운동 시작</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* 야외운동 */}
        <Pressable style={styles.quickCard} onPress={() => router.push("/outdoor-workout")} testID="outdoor-btn">
          <Image source={require("@/assets/images/shoes.png")} style={styles.quickIcon} resizeMode="contain" />
          <View style={styles.quickInfo}>
            <Text style={styles.quickTitle}>야외운동</Text>
            <Text style={styles.quickSub}>러닝·등산 코스 추천</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#B8C1CC" />
        </Pressable>

        {/* 운동배우기 */}
        <Pressable style={styles.quickCard} onPress={() => router.push("/exercise-guide")} testID="exercise-guide-btn">
          <Image source={require("@/assets/images/video.png")} style={styles.quickIcon} resizeMode="contain" />
          <View style={styles.quickInfo}>
            <Text style={styles.quickTitle}>운동배우기</Text>
            <Text style={styles.quickSub}>부위별·기구별 운동 학습</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#B8C1CC" />
        </Pressable>

      </ScrollView>

    </View>
  );
}


/* InBody - 추후 연동 시 활성화
function InBodyMetric({ label, value, unit }: { label: string; value?: number | string; unit: string }) {
  return (
    <View style={styles.inbodyMetric}>
      <Text style={styles.inbodyMetricLabel}>{label}</Text>
      <Text style={styles.inbodyMetricValue}>
        {value ?? "-"}{unit ? ` ${unit}` : ""}
      </Text>
    </View>
  );
}
*/

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F5F7",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    zIndex: 1,
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  headerBackBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Pretendard-SemiBold",
    color: "#00192B",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerDivider: {
    width: 1,
    height: 16,
    backgroundColor: "#E8E8E8",
    marginHorizontal: 2,
  },
  weeklyTrackerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
    ...iosShadow,
    gap: 16,
  },
  weeklyTrackerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  weeklyTrackerTitle: {
    fontSize: 17,
    fontFamily: "Pretendard-Medium",
    color: "#00192B",
  },
  streakBadge: {
    backgroundColor: "#FFE7DE",
    borderRadius: 9,
    height: 21,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  streakBadgeText: {
    fontSize: 10,
    fontFamily: "Pretendard-SemiBold",
    color: "#FF6A33",
    lineHeight: 14,
  },
  weeklyDayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weeklyDayCol: {
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  weeklyDayCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EEF0F3",
    alignItems: "center",
    justifyContent: "center",
  },
  weeklyDayCircleActive: {
    backgroundColor: "#FF6A33",
  },
  weeklyDayLabel: {
    fontSize: 13,
    fontFamily: "Pretendard-Regular",
    color: "#8E8E8E",
  },
  routineCardTitle: {
    fontSize: 17,
    fontFamily: "Pretendard-Medium",
    color: "#00192B",
    marginBottom: 0,
  },
  routineTabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  routineTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    height: 40,
  },
  routineTabActive: {
    borderBottomColor: "#FF6A33",
  },
  routineTabText: {
    fontSize: 15,
    fontFamily: "Pretendard-SemiBold",
    color: "#6B7280",
  },
  routineTabTextActive: {
    color: "#00192B",
    fontFamily: "Pretendard-Medium",
  },
  aiDescCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  aiDescDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#FF6A33",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    flexShrink: 0,
  },
  aiDescText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Pretendard-Regular",
    color: "#8E8E8E",
    lineHeight: 20,
  },
  subTabRow: {
    flexDirection: "row",
    backgroundColor: "#F0F2F5",
    borderRadius: 8,
    padding: 3,
    height: 38,
  },
  subTab: {
    flex: 1,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  subTabActive: {
    backgroundColor: "#FFFFFF",
    ...(Platform.OS === "web"
      ? { boxShadow: "rgba(0,0,0,0.05) 0px 0px 1px" }
      : { shadowColor: "#000", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.05, shadowRadius: 1, elevation: 1 }),
  },
  subTabText: {
    fontSize: 15,
    fontFamily: "Pretendard-SemiBold",
    color: "#6B7280",
  },
  subTabTextActive: {
    color: "#00192B",
  },
  quickCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 19,
    ...iosShadow,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 72,
  },
  quickIcon: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  quickInfo: {
    flex: 1,
    gap: 5,
  },
  quickTitle: {
    fontSize: 16,
    fontFamily: "Pretendard-Medium",
    color: "#00192B",
  },
  quickSub: {
    fontSize: 13,
    fontFamily: "Pretendard-Regular",
    color: "#8E8E8E",
  },
  headerTrainerArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 8,
  },
  headerTrainerChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.info + "14",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Colors.info + "30",
  },
  headerTrainerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.info,
  },
  headerTrainerAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTrainerName: {
    fontSize: 12,
    fontFamily: "Pretendard-SemiBold",
    color: Colors.info,
    maxWidth: 60,
  },
  headerTrainerPlusBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.info,
    alignItems: "center",
    justifyContent: "center",
  },
  allTrainersHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  allTrainersTitle: {
    fontSize: 16,
    fontFamily: "Pretendard-Medium",
    color: Colors.text,
  },
  allTrainerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    ...iosShadow,
  },
  allTrainerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.info,
  },
  allTrainerAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  allTrainerName: {
    fontSize: 15,
    fontFamily: "Pretendard-SemiBold",
    color: Colors.text,
  },
  allTrainerSpec: {
    fontSize: 12,
    fontFamily: "Pretendard-Regular",
    color: Colors.textSecondary,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  aiAnalysisBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.accent,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  aiAnalysisBtnText: {
    fontSize: 12,
    fontFamily: "Pretendard-SemiBold",
    color: Colors.white,
  },
  headerActionBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.systemGray6,
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 10,
  },
  dateCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    ...iosShadow,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    flexShrink: 1,
  },
  dateCardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  eventIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.systemGray6,
    alignItems: "center",
    justifyContent: "center",
  },
  eventIconBtnActive: {
    backgroundColor: Colors.accent,
  },
  eventBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: Colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  eventBadgeText: {
    fontSize: 10,
    fontFamily: "Pretendard-Medium",
    color: Colors.white,
  },
  dateText: {
    fontSize: 14,
    fontFamily: "Pretendard-SemiBold",
    color: Colors.text,
  },
  timeText: {
    fontSize: 12,
    fontFamily: "Pretendard-Regular",
    color: Colors.textSecondary,
    marginTop: 1,
  },
  ptSchedule: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.info + "14",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  ptScheduleText: {
    fontSize: 12,
    fontFamily: "Pretendard-Medium",
    color: Colors.info,
  },
  instagramCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...iosShadow,
  },
  instagramLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    flexShrink: 1,
  },
  instagramIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E1306C",
  },
  instagramTextArea: {
    gap: 2,
    flex: 1,
    flexShrink: 1,
  },
  instagramHandle: {
    fontSize: 16,
    fontFamily: "Pretendard-SemiBold",
    color: Colors.text,
  },
  instagramLabel: {
    fontSize: 12,
    fontFamily: "Pretendard-Regular",
    color: Colors.textSecondary,
  },
  inbodyCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    ...iosShadow,
    gap: 14,
  },
  inbodySectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inbodyTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inbodyTitle: {
    fontSize: 17,
    fontFamily: "Pretendard-SemiBold",
    color: Colors.text,
  },
  inbodyBadge: {
    backgroundColor: Colors.info + "18",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  inbodyBadgeText: {
    fontSize: 11,
    fontFamily: "Pretendard-Medium",
    color: Colors.info,
  },
  inbodyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  inbodyMetric: {
    flex: 1,
    minWidth: "45%" as any,
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  inbodyMetricLabel: {
    fontSize: 12,
    fontFamily: "Pretendard-Regular",
    color: Colors.textSecondary,
  },
  inbodyMetricValue: {
    fontSize: 18,
    fontFamily: "Pretendard-Medium",
    color: Colors.text,
  },
  inbodyEmpty: {
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  inbodyEmptyText: {
    fontSize: 13,
    fontFamily: "Pretendard-Regular",
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  inbodyConnectBtn: {
    marginTop: 4,
    backgroundColor: Colors.info + "18",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inbodyConnectText: {
    fontSize: 13,
    fontFamily: "Pretendard-Medium",
    color: Colors.info,
  },
  routineCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 24,
    ...iosShadow,
    gap: 14,
  },
  routineSectionHeader: {
    alignItems: "center",
  },
  routineSelectTitle: {
    fontSize: 18,
    fontFamily: "Pretendard-Medium",
    color: Colors.text,
    textAlign: "center",
  },
  routineTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  routineTitle: {
    fontSize: 17,
    fontFamily: "Pretendard-SemiBold",
    color: Colors.text,
  },
  trainerBadge: {
    backgroundColor: Colors.accent + "18",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  trainerBadgeText: {
    fontSize: 11,
    fontFamily: "Pretendard-Medium",
    color: Colors.accent,
  },
  locationSwitchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 4,
  },
  locationSwitch: {
    width: 52,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    padding: 2,
    justifyContent: "center",
  },
  locationSwitchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
  },
  locationSwitchThumbRight: {
    alignSelf: "flex-end",
  },
  locationSwitchLabel: {
    fontSize: 15,
    fontFamily: "Pretendard-SemiBold",
    color: Colors.textMuted,
  },
  locationSwitchLabelActive: {
    color: Colors.accent,
  },
  accordionList: {
    gap: 10,
  },
  accordionItem: {
    borderRadius: 8,
    overflow: "hidden",
    minHeight: 56,
  },
  accordionItemExpanded: {},
  accordionItemExpandedAI: {},
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#F0F2F5",
  },
  accordionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  accordionClockIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  accordionLabel: {
    fontSize: 15,
    fontFamily: "Pretendard-Regular",
    color: "#00192B",
  },
  accordionLabelExpanded: {
    color: Colors.accent,
  },
  accordionDivider: {
    height: 1,
    backgroundColor: "#E8E8E8",
    marginHorizontal: 16,
  },
  accordionBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 0,
    backgroundColor: "rgba(240,242,245,0.45)",
  },
  accordionFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  restNoteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 24,
  },
  restNoteText: {
    fontSize: 13,
    fontFamily: "Pretendard-Regular",
    color: Colors.textSecondary,
  },
  routineSteps: {
    gap: 0,
  },
  routineStepRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  routineStepLeft: {
    alignItems: "center",
    alignSelf: "stretch",
    width: 24,
  },
  routineStepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  routineStepLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#E8EAF0",
    marginVertical: 4,
    minHeight: 14,
  },
  routineStepContent: {
    flex: 1,
    paddingBottom: 32,
  },
  routineStepTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  routineStepName: {
    fontSize: 14,
    fontFamily: "Pretendard-SemiBold",
    color: Colors.text,
    flex: 1,
  },
  routineStepDetail: {
    fontSize: 12,
    fontFamily: "Pretendard-Regular",
    color: Colors.textSecondary,
    marginTop: 1,
  },
  routineStepDetailRight: {
    fontSize: 13,
    fontFamily: "Pretendard-SemiBold",
    color: Colors.accent,
    flexShrink: 0,
  },
  routineStepTag: {
    backgroundColor: "#F2F2F7",
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginTop: 10,
  },
  routineStepTagText: {
    fontSize: 11,
    fontFamily: "Pretendard-Regular",
    color: Colors.textSecondary,
  },
  routineRestRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  routineRestDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  routineRestText: {
    fontSize: 11,
    fontFamily: "Pretendard-Medium",
    color: "#F59E0B",
    paddingBottom: 6,
    paddingTop: 2,
  },
  trainerRecommendCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    ...iosShadow,
    gap: 12,
  },
  trainerRecommendHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  trainerRecommendBadge: {
    backgroundColor: Colors.info + "18",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  trainerRecommendBadgeText: {
    fontSize: 11,
    fontFamily: "Pretendard-Medium",
    color: Colors.info,
  },
  trainerScroll: {
    flexGrow: 0,
  },
  trainerItem: {
    width: 90,
    alignItems: "center",
    marginRight: 12,
    gap: 4,
  },
  trainerAvatarWrap: {},
  trainerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: Colors.info,
  },
  trainerAvatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  trainerItemName: {
    fontSize: 13,
    fontFamily: "Pretendard-SemiBold",
    color: Colors.text,
    textAlign: "center",
  },
  trainerItemSpec: {
    fontSize: 11,
    fontFamily: "Pretendard-Regular",
    color: Colors.textSecondary,
    textAlign: "center",
  },
  trainerMemberBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Colors.info + "14",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  trainerMemberText: {
    fontSize: 10,
    fontFamily: "Pretendard-Medium",
    color: Colors.info,
  },
  routineDurationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    justifyContent: "flex-end",
  },
  routineDurationText: {
    fontSize: 12,
    fontFamily: "Pretendard-Medium",
    color: Colors.textMuted,
  },
  startWorkoutBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
  },
  startWorkoutBtnText: {
    fontSize: 14,
    fontFamily: "Pretendard-SemiBold",
    color: Colors.white,
  },
  patternToggle: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 10,
  },
  patternBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: Colors.systemGray6,
  },
  patternBtnActive: {
    backgroundColor: Colors.info,
  },
  patternBtnActiveCF: {
    backgroundColor: "#EF4444",
  },
  patternBtnText: {
    fontSize: 12,
    fontFamily: "Pretendard-SemiBold",
    color: Colors.textSecondary,
  },
  patternBtnTextActive: {
    color: Colors.white,
  },
  routineModeToggle: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
  },
  routineModeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.inputBg,
  },
  routineModeBtnActive: {
    backgroundColor: Colors.primary,
  },
  routineModeBtnActiveAI: {
    backgroundColor: "#D4AF37",
  },
  routineModeBtnText: {
    fontSize: 13,
    fontFamily: "Pretendard-SemiBold",
    color: Colors.textSecondary,
  },
  routineModeBtnTextActive: {
    color: Colors.white,
  },
  routineTabActiveAI: {
    backgroundColor: "#D4AF37" + "18",
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 1px 6px rgba(212,175,55,0.2)" }
      : { shadowColor: "#D4AF37", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 2 }),
  },
  aiNoteCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: "#D4AF37" + "10",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 1px 4px rgba(212,175,55,0.12)" }
      : { shadowColor: "#D4AF37", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 4, elevation: 1 }),
  },
  aiNoteText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Pretendard-Medium",
    color: Colors.text,
    lineHeight: 18,
  },
  dietTipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: Colors.accent + "10",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  dietTipIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accent + "18",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  dietTipText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Pretendard-Medium",
    color: Colors.text,
    lineHeight: 18,
  },
  aiReasonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  aiReasonText: {
    fontSize: 11,
    fontFamily: "Pretendard-Regular",
    color: "#D4AF37",
    flex: 1,
  },
  aiEmptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 8,
  },
  aiEmptyText: {
    fontSize: 13,
    fontFamily: "Pretendard-Regular",
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 6,
    ...iosShadow,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Pretendard-Medium",
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Pretendard-Regular",
    color: Colors.textSecondary,
  },
  totalVolumeCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
  },
  totalVolumeInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  totalVolumeText: {
    flex: 1,
  },
  totalVolumeLabel: {
    fontSize: 13,
    fontFamily: "Pretendard-Medium",
    color: "rgba(255,255,255,0.7)",
  },
  totalVolumeValue: {
    fontSize: 24,
    fontFamily: "Pretendard-Medium",
    color: Colors.white,
    marginTop: 2,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Pretendard-SemiBold",
    color: Colors.text,
  },
  seeAll: {
    fontSize: 13,
    fontFamily: "Pretendard-Medium",
    color: Colors.accent,
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    gap: 8,
    ...iosShadow,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Pretendard-Regular",
    color: Colors.textMuted,
  },
  recentCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...iosShadow,
  },
  recentCardLeft: {
    gap: 2,
    flex: 1,
    flexShrink: 1,
  },
  recentCardRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  recentDate: {
    fontSize: 15,
    fontFamily: "Pretendard-SemiBold",
    color: Colors.text,
  },
  recentSession: {
    fontSize: 12,
    fontFamily: "Pretendard-Regular",
    color: Colors.textSecondary,
  },
  recentParts: {
    fontSize: 13,
    fontFamily: "Pretendard-Medium",
    color: Colors.accent,
  },
  recentExCount: {
    fontSize: 12,
    fontFamily: "Pretendard-Regular",
    color: Colors.textSecondary,
  },
  athenaCard: {
    backgroundColor: "#0F1B33",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...iosShadow,
  },
  athenaCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    flexShrink: 1,
  },
  athenaIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#D4AF3718",
    alignItems: "center",
    justifyContent: "center",
  },
  athenaAvatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#D4AF37",
  },
  athenaTextArea: {
    gap: 2,
    flex: 1,
    flexShrink: 1,
  },
  athenaTitle: {
    fontSize: 16,
    fontFamily: "Pretendard-SemiBold",
    color: "#D4AF37",
  },
  athenaSubtitle: {
    fontSize: 12,
    fontFamily: "Pretendard-Regular",
    color: "#9CA3AF",
  },
  stateVectorCard: {
    backgroundColor: "#0D1628",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...iosShadow,
  },
  stateVectorIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#D4AF37",
    alignItems: "center",
    justifyContent: "center",
  },
  stateVectorTitle: {
    fontSize: 16,
    fontFamily: "Pretendard-SemiBold",
    color: "#D4AF37",
  },
  outdoorCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...iosShadow,
  },
  outdoorIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  outdoorTitle: {
    fontSize: 16,
    fontFamily: "Pretendard-SemiBold",
    color: Colors.success,
  },
  progressCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...iosShadow,
  },
  progressIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.info,
    alignItems: "center",
    justifyContent: "center",
  },
  progressTitle: {
    fontSize: 16,
    fontFamily: "Pretendard-SemiBold",
    color: Colors.info,
  },
  mealAnalysisCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    ...iosShadow,
  },
  mealIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#34C759",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  mealTitle: {
    fontSize: 16,
    fontFamily: "Pretendard-SemiBold",
    color: "#34C759",
  },
  todaySummaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    ...iosShadow,
    gap: 12,
  },
  todaySummaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  todaySummaryTitle: {
    fontSize: 16,
    fontFamily: "Pretendard-Medium",
    color: Colors.text,
  },
  todaySummaryGrid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  todaySummaryItem: {
    alignItems: "center",
    gap: 2,
    flex: 1,
  },
  todaySummaryValue: {
    fontSize: 22,
    fontFamily: "Pretendard-Medium",
    color: Colors.primary,
  },
  todaySummaryLabel: {
    fontSize: 11,
    fontFamily: "Pretendard-Medium",
    color: Colors.textSecondary,
  },
  todaySummaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.divider,
  },
  todaySummaryEmpty: {
    fontSize: 13,
    fontFamily: "Pretendard-Regular",
    color: Colors.textMuted,
    textAlign: "center",
    paddingVertical: 4,
  },
  streakCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    ...iosShadow,
    gap: 14,
  },
  streakHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  streakTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  streakTitle: {
    fontSize: 16,
    fontFamily: "Pretendard-Medium",
    color: Colors.text,
  },
  streakCountBadge: {
    backgroundColor: Colors.accent + "18",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  streakCountText: {
    fontSize: 12,
    fontFamily: "Pretendard-Medium",
    color: Colors.accent,
  },
  streakGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  streakDayCol: {
    alignItems: "center",
    gap: 6,
  },
  streakDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  streakDotActive: {
    backgroundColor: Colors.accent,
  },
  streakDotInactive: {
    backgroundColor: Colors.systemGray5,
  },
  streakDotToday: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  streakDayLabel: {
    fontSize: 11,
    fontFamily: "Pretendard-Medium",
    color: Colors.textMuted,
  },
  streakDayLabelToday: {
    fontFamily: "Pretendard-Medium",
    color: Colors.primary,
  },
  aiGradeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    padding: 10,
    marginTop: 2,
  },
  aiGradeBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  aiGradeText: {
    fontSize: 18,
    fontFamily: "Pretendard-Medium",
  },
  aiGradeInfo: {
    flex: 1,
    gap: 1,
  },
  aiGradeLabel: {
    fontSize: 12,
    fontFamily: "Pretendard-Medium",
    color: Colors.textSecondary,
  },
  aiGradeScore: {
    fontSize: 15,
    fontFamily: "Pretendard-Medium",
    color: Colors.text,
  },
  athenaFab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0F1B33",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 4px 12px rgba(212,175,55,0.4)" }
      : { shadowColor: "#D4AF37", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 }),
    borderWidth: 2,
    borderColor: "#D4AF37",
  },
  athenaFabAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  trainerRoutineSection: {
    marginHorizontal: 16, marginBottom: 16, padding: 14, borderRadius: 16,
    backgroundColor: Colors.card,
    ...iosShadow,
  },
  trainerRoutineHeader: {
    flexDirection: "row" as const, alignItems: "center" as const, gap: 10, marginBottom: 12,
  },
  trainerRoutineBadge: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: Colors.primaryLight, alignItems: "center" as const, justifyContent: "center" as const,
  },
  trainerRoutineTitle: { fontSize: 15, fontFamily: "Pretendard-Medium", color: Colors.text },
  trainerRoutineSubtitle: { fontSize: 12, fontFamily: "Pretendard-Regular", color: Colors.textSecondary },
  trainerRoutineCard: {
    backgroundColor: Colors.inputBg, borderRadius: 12,
    ...iosShadow,
    marginBottom: 8, overflow: "hidden" as const,
  },
  trainerRoutineRow: {
    flexDirection: "row" as const, alignItems: "center" as const, padding: 12, gap: 8,
  },
  trainerRoutineName: { fontSize: 14, fontFamily: "Pretendard-SemiBold", color: Colors.text },
  trainerRoutineDesc: { fontSize: 12, fontFamily: "Pretendard-Regular", color: Colors.textSecondary, marginTop: 2 },
  trainerRoutineExercises: {
    paddingHorizontal: 12, paddingBottom: 10, gap: 6,
    borderTopWidth: 1, borderTopColor: Colors.cardBorder, paddingTop: 8,
  },
  trainerRoutineExItem: { flexDirection: "row" as const, alignItems: "center" as const, gap: 8 },
  trainerRoutineExNum: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.primaryLight, color: Colors.white,
    fontSize: 11, fontFamily: "Pretendard-Medium", textAlign: "center" as const, lineHeight: 20,
  },
  trainerRoutineExName: { fontSize: 13, fontFamily: "Pretendard-Medium", color: Colors.text },
  trainerRoutineExDetail: { fontSize: 11, fontFamily: "Pretendard-Regular", color: Colors.textSecondary },
  feedbackHistoryCard: {
    flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const,
    marginHorizontal: 16, marginBottom: 12, padding: 14, borderRadius: 16,
    backgroundColor: Colors.card, ...iosShadow,
  },
  feedbackIconWrap: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: Colors.accent, alignItems: "center" as const, justifyContent: "center" as const,
  },
  feedbackHistoryTitle: { fontSize: 15, fontFamily: "Pretendard-Medium", color: Colors.text },
  postureTrackingCard: {
    flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const,
    marginHorizontal: 16, marginBottom: 12, padding: 14, borderRadius: 16,
    backgroundColor: Colors.card, ...iosShadow,
  },
  postureTrackingIconWrap: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: Colors.info, alignItems: "center" as const, justifyContent: "center" as const,
  },
  postureTrackingTitle: { fontSize: 15, fontFamily: "Pretendard-Medium", color: Colors.text },
});

const tdStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: Colors.white,
    ...(Platform.OS === "web" ? { boxShadow: "rgba(0,0,0,0.05) 0px 0px 1px" } : { shadowColor: "#000", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.05, shadowRadius: 1, elevation: 1 }),
  },
  headerTitle: { fontSize: 17, fontFamily: "Pretendard-Medium", color: Colors.text },
  body: { flex: 1, paddingHorizontal: 20 },
  photosRow: {
    flexDirection: "row", justifyContent: "center", gap: 24, marginTop: 24, marginBottom: 20,
  },
  photoCol: { alignItems: "center", gap: 8 },
  profilePhoto: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: Colors.info,
  },
  profilePhotoPlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.inputBg, borderWidth: 2, borderColor: Colors.cardBorder,
    alignItems: "center", justifyContent: "center",
  },
  fullBodyPhoto: {
    width: 90, height: 120, borderRadius: 14,
    borderWidth: 3, borderColor: Colors.info,
  },
  photoCaption: { fontSize: 12, fontFamily: "Pretendard-Medium", color: Colors.textSecondary },
  trainerName: {
    fontSize: 22, fontFamily: "Pretendard-Medium", color: Colors.text, textAlign: "center",
  },
  memberBadge: {
    flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "center",
    backgroundColor: Colors.info + "14", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6, marginTop: 8, marginBottom: 20,
  },
  memberBadgeText: { fontSize: 13, fontFamily: "Pretendard-Medium", color: Colors.info },
  infoCard: {
    backgroundColor: Colors.card, borderRadius: 16, padding: 16,
    ...iosShadow,
    marginBottom: 12, gap: 6,
  },
  infoLabel: { fontSize: 12, fontFamily: "Pretendard-SemiBold", color: Colors.accent },
  infoValue: { fontSize: 14, fontFamily: "Pretendard-Regular", color: Colors.text, lineHeight: 22 },
  trainerRoutineSection: {
    marginHorizontal: 16, marginBottom: 16, padding: 14, borderRadius: 16,
    backgroundColor: Colors.card,
    ...iosShadow,
  },
  trainerRoutineHeader: {
    flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12,
  },
  trainerRoutineBadge: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: Colors.primaryLight, alignItems: "center", justifyContent: "center",
  },
  trainerRoutineTitle: { fontSize: 15, fontFamily: "Pretendard-Medium", color: Colors.text },
  trainerRoutineSubtitle: { fontSize: 12, fontFamily: "Pretendard-Regular", color: Colors.textSecondary },
  trainerRoutineCard: {
    backgroundColor: Colors.inputBg, borderRadius: 12,
    ...iosShadow,
    marginBottom: 8, overflow: "hidden",
  },
  trainerRoutineRow: {
    flexDirection: "row", alignItems: "center", padding: 12, gap: 8,
  },
  trainerRoutineName: { fontSize: 14, fontFamily: "Pretendard-SemiBold", color: Colors.text },
  trainerRoutineDesc: { fontSize: 12, fontFamily: "Pretendard-Regular", color: Colors.textSecondary, marginTop: 2 },
  trainerRoutineExercises: {
    paddingHorizontal: 12, paddingBottom: 10, gap: 6,
    borderTopWidth: 1, borderTopColor: Colors.cardBorder, paddingTop: 8,
  },
  trainerRoutineExItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  trainerRoutineExNum: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.primaryLight, color: Colors.white,
    fontSize: 11, fontFamily: "Pretendard-Medium", textAlign: "center", lineHeight: 20,
  },
  trainerRoutineExName: { fontSize: 13, fontFamily: "Pretendard-Medium", color: Colors.text },
  trainerRoutineExDetail: { fontSize: 11, fontFamily: "Pretendard-Regular", color: Colors.textSecondary },
  feedbackHistoryCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginHorizontal: 16, marginBottom: 12, padding: 14, borderRadius: 16,
    backgroundColor: Colors.card,
    ...iosShadow,
  },
  feedbackIconWrap: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center",
  },
  feedbackHistoryTitle: { fontSize: 15, fontFamily: "Pretendard-Medium", color: Colors.text },
  postureTrackingCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginHorizontal: 16, marginBottom: 12, padding: 14, borderRadius: 16,
    backgroundColor: Colors.card,
    ...iosShadow,
  },
  postureTrackingIconWrap: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: Colors.info, alignItems: "center", justifyContent: "center",
  },
  postureTrackingTitle: { fontSize: 15, fontFamily: "Pretendard-Medium", color: Colors.text },
  connectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 12,
  },
  connectBtnText: {
    fontSize: 15,
    fontFamily: "Pretendard-SemiBold",
    color: Colors.white,
  },
  connectStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.success + "14",
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 12,
  },
  connectStatusText: {
    fontSize: 15,
    fontFamily: "Pretendard-SemiBold",
    color: Colors.success,
  },
});
