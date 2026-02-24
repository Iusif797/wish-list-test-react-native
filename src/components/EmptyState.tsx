import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { PremiumButton } from "./PremiumButton";
import { useTheme } from "../lib/theme";

interface EmptyStateProps {
  icon: React.ReactNode;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, message, actionLabel, onAction }: EmptyStateProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <View style={styles.iconWrapper}>
        {icon}
      </View>
      <Text style={[styles.message, isDark ? styles.messageDark : styles.messageLight]}>{message}</Text>
      {actionLabel && onAction && (
        <PremiumButton
          title={actionLabel}
          onPress={onAction}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  containerLight: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderColor: "rgba(226, 232, 240, 0.8)",
  },
  containerDark: {
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    borderColor: "rgba(51, 65, 85, 0.5)",
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.1)', // primary-500/10
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  message: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "500",
  },
  messageLight: {
    color: "#475569", // slate-600
  },
  messageDark: {
    color: "#94a3b8", // slate-400
  },
  button: {
    width: "auto",
    minWidth: 200,
  }
});
