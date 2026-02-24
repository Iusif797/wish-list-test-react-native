import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';

interface ProgressBarProps {
  progress: number;
  height?: number;
}

export function ProgressBar({ progress, height = 8 }: ProgressBarProps) {
  const widthAnim = useSharedValue(0);
  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    const clamped = Math.min(Math.max(progress, 0), 1);
    widthAnim.value = withSpring(clamped, {
      damping: 20,
      stiffness: 90,
      mass: 1,
    });

    if (clamped >= 1) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    } else {
      pulseAnim.value = withTiming(1, { duration: 300 });
    }
  }, [progress]);

  const barStyle = useAnimatedStyle(() => {
    const bg = interpolateColor(
      widthAnim.value,
      [0, 0.5, 1],
      ['#8b5cf6', '#6366f1', '#10b981'],
    );
    return {
      width: `${widthAnim.value * 100}%`,
      backgroundColor: bg,
      transform: [{ scaleY: pulseAnim.value }],
    };
  });

  return (
    <View style={[styles.container, { height }]}>
      <Animated.View style={[styles.bar, barStyle, { height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  bar: {
    borderRadius: 9999,
  },
});
