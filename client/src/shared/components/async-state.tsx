import type { PropsWithChildren } from 'react';
import { Component, Suspense } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Colors from 'shared/constants/colors';

type AsyncErrorBoundaryProps = PropsWithChildren<{
  message: string;
}>;

type AsyncErrorBoundaryState = {
  hasError: boolean;
};

export class AsyncErrorBoundary extends Component<
  AsyncErrorBoundaryProps,
  AsyncErrorBoundaryState
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>{this.props.message}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export function SuspenseSection({
  children,
  errorMessage,
}: PropsWithChildren<{ errorMessage: string }>) {
  return (
    <AsyncErrorBoundary message={errorMessage}>
      <Suspense fallback={<LoadingState />}>{children}</Suspense>
    </AsyncErrorBoundary>
  );
}

export function LoadingState() {
  return (
    <View style={styles.stateBox}>
      <ActivityIndicator color={Colors.accent} />
    </View>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.stateBox}>
      <Text style={styles.stateText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stateBox: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    minHeight: 96,
    padding: 16,
  },
  stateText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
});
