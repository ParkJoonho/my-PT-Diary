import { AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Colors from 'shared/constants/colors';

export type AnalysisRecordSaveBannerValue = {
  message?: string;
  status: 'failed' | 'saved';
};

export function AnalysisRecordSaveBanner({
  actionLabel,
  failedFallbackMessage,
  onActionPress,
  pending = false,
  successMessage,
  value,
}: {
  actionLabel?: string;
  failedFallbackMessage: string;
  onActionPress?: () => void;
  pending?: boolean;
  successMessage: string;
  value: AnalysisRecordSaveBannerValue | null;
}) {
  if (!value) {
    return null;
  }

  const isSaved = value.status === 'saved';

  return (
    <View
      style={[
        styles.recordSaveCard,
        isSaved ? styles.recordSaveCardSuccess : styles.recordSaveCardWarning,
      ]}
    >
      {isSaved ? (
        <CheckCircle2 color={Colors.success} size={16} strokeWidth={2.1} />
      ) : (
        <AlertCircle color={Colors.warning} size={16} strokeWidth={2.1} />
      )}
      <Text style={styles.recordSaveText}>
        {isSaved ? successMessage : value.message ?? failedFallbackMessage}
      </Text>
      {!isSaved && onActionPress ? (
        <Pressable
          disabled={pending}
          onPress={onActionPress}
          style={[
            styles.retryButton,
            pending && styles.retryButtonDisabled,
          ]}
        >
          <Text style={styles.retryButtonText}>
            {pending ? '저장 중...' : (actionLabel ?? '다시 시도')}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  recordSaveCard: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  recordSaveCardSuccess: {
    backgroundColor: '#E8F8EE',
  },
  recordSaveCardWarning: {
    backgroundColor: '#FFF3E0',
  },
  recordSaveText: {
    color: Colors.text,
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  retryButton: {
    alignItems: 'center',
    borderColor: Colors.warning,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 30,
    paddingHorizontal: 10,
  },
  retryButtonDisabled: {
    opacity: 0.6,
  },
  retryButtonText: {
    color: Colors.warning,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
  },
});
