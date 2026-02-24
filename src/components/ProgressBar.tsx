import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
}

export function ProgressBar({ progress, height = 8 }: ProgressBarProps) {
  const widthAnim = useSharedValue(0);

  useEffect(() => {
    widthAnim.value = withTiming(Math.min(Math.max(progress, 0), 1), {
      duration: 1000,
      easing: Easing.out(Easing.exp),
    });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${widthAnim.value * 100}%`,
    };
  });

  return (
    <View style={[styles.container, { height }]}>
      <Animated.View style={[styles.bar, animatedStyle, { height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "rgba(148, 163, 184, 0.2)", // slate-400/20
    borderRadius: 9999,
    overflow: "hidden",
  },
  bar: {
    backgroundColor: "#8b5cf6", // primary-500
    borderRadius: 9999,
  },
});
