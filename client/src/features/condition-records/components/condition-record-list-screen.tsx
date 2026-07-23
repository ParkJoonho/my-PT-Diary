import { useNavigation } from '@granite-js/react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState, SuspenseSection } from 'shared/components/async-state';
import Colors from 'shared/constants/colors';
import { useConditionRecords } from '../api/condition-records';
import { ConditionRecordCard } from './condition-record-card';

export function ConditionRecordListScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>닫기</Text>
        </Pressable>
        <Text style={styles.headerTitle}>컨디션 기록</Text>
        <Pressable
          onPress={() =>
            navigation.navigate({ name: '/condition-form', params: {} })
          }
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>작성</Text>
        </Pressable>
      </View>

      <SuspenseSection errorMessage="컨디션 기록을 불러오지 못했어요.">
        <ConditionRecordListContent />
      </SuspenseSection>
    </View>
  );
}

function ConditionRecordListContent() {
  const navigation = useNavigation();
  const { data } = useConditionRecords();

  if (!data.length) {
    return <EmptyState message="아직 컨디션 기록이 없어요." />;
  }

  return (
    <ScrollView
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    >
      {data.map((record) => (
        <ConditionRecordCard
          key={record.id}
          onPress={() =>
            navigation.navigate({
              name: '/condition-form',
              params: {
                conditionId: record.id,
              },
            })
          }
          record={record}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerButton: {
    minWidth: 44,
    paddingVertical: 8,
  },
  headerButtonText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  headerTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-Bold',
    fontSize: 18,
  },
  listContent: {
    gap: 10,
    paddingBottom: 32,
  },
});
