import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { AIInfoIcon } from 'shared/components/icons/pt-diary-icons';
import Colors, { iosShadow } from 'shared/constants/colors';
import { ptTypography } from 'shared/constants/typography';
import {
  MOCK_AI_GYM_ROUTINES,
  MOCK_AI_HOME_ROUTINES,
} from '../data/mock-routines';
import { RECOMMENDED_ROUTINES } from '../data/recommended-routines';
import type {
  HomeLocation,
  HomeRoutine,
  HomeRoutineTab,
} from '../types/routine';
import { RoutineAccordion } from './routine-accordion';

const ROUTINE_TABS: {
  key: HomeRoutineTab;
  label: string;
}[] = [
  { key: 'ai', label: 'AI추천' },
  { key: 'gym', label: '헬스장' },
  { key: 'crossfit', label: '크로스핏' },
  { key: 'home', label: '홈트' },
];

type RoutineCardProps = {
  onStartRoutine?: (routine: HomeRoutine) => void;
};

export function RoutineCard({ onStartRoutine }: RoutineCardProps) {
  const [activeTab, setActiveTab] = useState<HomeRoutineTab>('ai');
  const [selectedLocation, setSelectedLocation] = useState<HomeLocation>('gym');
  const [expandedRoutineId, setExpandedRoutineId] = useState<string | null>(
    null,
  );

  const routines = useMemo(() => {
    if (activeTab === 'ai') {
      return selectedLocation === 'gym'
        ? MOCK_AI_GYM_ROUTINES
        : MOCK_AI_HOME_ROUTINES;
    }

    return RECOMMENDED_ROUTINES.filter((routine) => {
      if (activeTab === 'gym') {
        return routine.location === 'gym' && routine.pattern === 'general';
      }

      if (activeTab === 'crossfit') {
        return routine.location === 'gym' && routine.pattern === 'crossfit';
      }

      return routine.location === 'home';
    });
  }, [activeTab, selectedLocation]);

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>루틴 선택</Text>
      </View>

      <View style={styles.tabRow}>
        {ROUTINE_TABS.map((tab) => {
          const active = activeTab === tab.key;

          return (
            <Pressable
              accessibilityRole="button"
              key={tab.key}
              onPress={() => {
                setActiveTab(tab.key);
                setExpandedRoutineId(null);
              }}
              style={({ pressed }) => [
                styles.tab,
                active && styles.tabActive,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.tabInner}>
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {activeTab === 'ai' ? (
        <>
          <View style={styles.aiDescCard}>
            <View style={styles.aiIconWrap}>
              <AIInfoIcon />
            </View>
            <Text style={styles.aiDescText}>
              AI가 체형과 자세를 분석해 만든 루틴이에요. 약한 부위를 강화하고
              척추·무릎 정렬을 잡아줘요.
            </Text>
          </View>

          <View style={styles.subTabRow}>
            <SubTabButton
              active={selectedLocation === 'gym'}
              label="헬스장"
              onPress={() => {
                setSelectedLocation('gym');
                setExpandedRoutineId(null);
              }}
            />
            <SubTabButton
              active={selectedLocation === 'home'}
              label="홈트"
              onPress={() => {
                setSelectedLocation('home');
                setExpandedRoutineId(null);
              }}
            />
          </View>
        </>
      ) : null}

      <View style={styles.accordionList}>
        {routines.map((routine) => (
          <RoutineAccordion
            expanded={expandedRoutineId === routine.id}
            key={routine.id}
            onStart={() => onStartRoutine?.(routine)}
            onToggle={() =>
              setExpandedRoutineId((current) =>
                current === routine.id ? null : routine.id,
              )
            }
            routine={routine}
          />
        ))}
      </View>
    </View>
  );
}

function SubTabButton({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.subTab,
        active && styles.subTabActive,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.subTabText, active && styles.subTabTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  accordionList: {
    gap: 10,
  },
  aiDescCard: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  aiDescText: {
    color: Colors.textMuted,
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  aiIconWrap: {
    marginTop: 3,
  },
  card: {
    ...iosShadow,
    backgroundColor: Colors.card,
    borderRadius: 16,
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  pressed: {
    opacity: 0.78,
  },
  subTab: {
    alignItems: 'center',
    borderRadius: 7,
    flex: 1,
    justifyContent: 'center',
  },
  subTabActive: {
    backgroundColor: Colors.white,
    ...(Platform.OS === 'web'
      ? { boxShadow: 'rgba(0,0,0,0.05) 0px 0px 1px' }
      : {
          elevation: 1,
          shadowColor: '#000',
          shadowOffset: { height: 0, width: 0 },
          shadowOpacity: 0.05,
          shadowRadius: 1,
        }),
  },
  subTabRow: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 8,
    flexDirection: 'row',
    height: 38,
    padding: 3,
  },
  subTabText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
  },
  subTabTextActive: {
    color: Colors.text,
  },
  tab: {
    alignItems: 'center',
    borderBottomColor: 'transparent',
    borderBottomWidth: 2,
    flex: 1,
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  tabActive: {
    borderBottomColor: Colors.accent,
  },
  tabInner: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  tabRow: {
    borderBottomColor: Colors.divider,
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  tabText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
  },
  tabTextActive: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
  },
  title: {
    color: Colors.text,
    ...ptTypography.sectionTitle,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});
