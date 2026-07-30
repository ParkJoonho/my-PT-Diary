import { type ReactNode, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
  useWindowDimensions,
} from 'react-native';

const TRANSITION_DURATION_MS = 240;

type BottomSheetModalProps = {
  backdropAccessibilityLabel?: string;
  backdropColor?: string;
  children: ReactNode;
  onDismiss?: () => void;
  onRequestClose: () => void;
  sheetStyle?: StyleProp<ViewStyle>;
  visible: boolean;
};

export function BottomSheetModal({
  backdropAccessibilityLabel = '바텀시트 닫기',
  backdropColor = 'rgba(0,0,0,0.4)',
  children,
  onDismiss,
  onRequestClose,
  sheetStyle,
  visible,
}: BottomSheetModalProps) {
  const { height: windowHeight } = useWindowDimensions();
  const progress = useRef(new Animated.Value(0)).current;
  const onDismissRef = useRef(onDismiss);
  const [mounted, setMounted] = useState(visible);
  const [renderedChildren, setRenderedChildren] = useState<ReactNode>(
    visible ? children : null,
  );

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setRenderedChildren(children);
    }
  }, [children, visible]);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const animation = Animated.timing(progress, {
      duration: TRANSITION_DURATION_MS,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      toValue: visible ? 1 : 0,
      useNativeDriver: Platform.OS !== 'web',
    });

    animation.start(({ finished }) => {
      if (finished && !visible) {
        setMounted(false);
        setRenderedChildren(null);
        onDismissRef.current?.();
      }
    });

    return () => animation.stop();
  }, [mounted, progress, visible]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [windowHeight, 0],
  });

  return (
    <Modal
      animationType="none"
      onRequestClose={onRequestClose}
      transparent
      visible={mounted}
    >
      <View
        accessibilityViewIsModal
        pointerEvents={visible ? 'auto' : 'none'}
        style={styles.root}
      >
        <Animated.View
          style={[
            styles.backdrop,
            {
              backgroundColor: backdropColor,
              opacity: progress,
            },
          ]}
        >
          <Pressable
            accessibilityLabel={backdropAccessibilityLabel}
            accessibilityRole="button"
            onPress={onRequestClose}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <Animated.View
          style={[
            sheetStyle,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          {visible ? children : renderedChildren}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});
