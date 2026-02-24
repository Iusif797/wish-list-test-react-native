import React from "react";
import { TextInput, TextInputProps, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../lib/theme";

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function InputField({ label, error, style, ...props }: InputFieldProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          isDark ? styles.inputDark : styles.inputLight,
          error ? styles.inputError : null,
          style,
        ]}
        placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  labelLight: {
    color: "#334155",
  },
  labelDark: {
    color: "#cbd5e1",
  },
  input: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 15,
  },
  inputLight: {
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
    color: "#0f172a",
  },
  inputDark: {
    backgroundColor: "rgba(10, 5, 40, 0.6)",
    borderColor: "rgba(139, 92, 246, 0.3)",
    color: "#f8fafc",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 13,
    marginTop: 6,
  },
});
