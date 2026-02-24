/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useCallback, useRef } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

interface AnimatedItemWrapperProps {
  children: React.ReactNode;
  index: number;
  isDeleting: boolean;
  onDeleteAnimationEnd?: () => void;
}

export function AnimatedItemWrapper({
  children,
  index,
  isDeleting,
  onDeleteAnimationEnd,
}: AnimatedItemWrapperProps) {
  const hasEntered = useRef(false);
  const translateY = useSharedValue(50);
  const scale = useSharedValue(0.88);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (hasEntered.current) return;
    hasEntered.current = true;

    const stagger = Math.min(index * 70, 350);

    translateY.value = withDelay(
      stagger,
      withSpring(0, { damping: 20, stiffness: 140, mass: 0.8 }),
    );
    scale.value = withDelay(
      stagger,
      withSpring(1, { damping: 18, stiffness: 120 }),
    );
    opacity.value = withDelay(
      stagger,
      withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) }),
    );
  }, []);

  const fireDeleteEnd = useCallback(() => {
    onDeleteAnimationEnd?.();
  }, [onDeleteAnimationEnd]);

  useEffect(() => {
    if (!isDeleting) return;

    opacity.value = withTiming(0, {
      duration: 280,
      easing: Easing.in(Easing.quad),
    }, (finished) => {
      if (finished) runOnJS(fireDeleteEnd)();
    });

    scale.value = withTiming(0.5, {
      duration: 300,
      easing: Easing.in(Easing.back(1.8)),
    });

    translateY.value = withTiming(12, {
      duration: 300,
      easing: Easing.in(Easing.quad),
    });
  }, [isDeleting]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
}
