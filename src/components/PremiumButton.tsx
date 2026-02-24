import React, { useEffect } from "react";
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, View, Platform } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withRepeat, withTiming, Easing } from "react-native-reanimated";

interface PremiumButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  icon?: React.ReactNode;
}

export function PremiumButton({ title, variant = "primary", loading, icon, style, disabled, ...props }: PremiumButtonProps) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  useEffect(() => {
    if (variant === "primary") {
      glowOpacity.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [variant]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";
  const isDisabled = disabled || loading;

  return (
    <Animated.View style={[animatedStyle, style, { width: '100%' }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[
          styles.container,
          isPrimary && styles.primaryContainer,
          variant === "secondary" && styles.secondaryContainer,
          isDanger && styles.dangerContainer,
          isDisabled && styles.disabledContainer,
        ]}
        {...props}
      >
        {isPrimary && !isDisabled && (
          <Animated.View style={[StyleSheet.absoluteFillObject, styles.glowContainer, glowStyle]}>
            <View style={styles.glow} />
          </Animated.View>
        )}
        <View style={styles.content}>
          {loading ? (
            <Text style={[styles.text, isPrimary || isDanger ? styles.textLight : styles.textDark]}>Загрузка...</Text>
          ) : (
            <>
              {icon && <View style={styles.iconContainer}>{icon}</View>}
              <Text style={[styles.text, isPrimary || isDanger ? styles.textLight : styles.textDark]}>{title}</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    position: 'relative',
  },
  primaryContainer: {
    backgroundColor: "#8b5cf6",
    ...Platform.select({
      ios: {
        shadowColor: "#8b5cf6",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  secondaryContainer: {
    backgroundColor: "rgba(139, 92, 246, 0.05)",
    borderWidth: 1.5,
    borderColor: "rgba(139, 92, 246, 0.4)",
  },
  dangerContainer: {
    backgroundColor: "#ef4444",
  },
  disabledContainer: {
    opacity: 0.4,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  textLight: {
    color: "#ffffff",
  },
  textDark: {
    color: "#f8fafc",
  },
  glowContainer: {
    zIndex: 1,
    overflow: 'hidden',
    borderRadius: 16,
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#c084fc',
    opacity: 0.5,
  }
});
