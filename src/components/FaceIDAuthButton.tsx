import React, { useState, useEffect } from "react";
import { TouchableOpacity, Text, StyleSheet, View, ViewStyle, ActivityIndicator } from "react-native";
import { useAuth } from "../lib/auth";
import { isBiometricAvailable, hasStoredBiometricCredentials, getBiometricLabel } from "../lib/biometric";
import { ScanFace } from "lucide-react-native";

interface FaceIDAuthButtonProps {
  label?: string;
  style?: ViewStyle;
  variant?: "primary" | "secondary";
}

export function FaceIDAuthButton({ label, style, variant = "secondary" }: FaceIDAuthButtonProps) {
  const { loginWithBiometrics } = useAuth();
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const available = await isBiometricAvailable();
      const hasCredentials = await hasStoredBiometricCredentials();
      if (mounted) setVisible(available && hasCredentials);
    })();
    return () => { mounted = false; };
  }, []);

  const handlePress = async () => {
    if (loading || !visible) return;
    setLoading(true);
    try {
      await loginWithBiometrics();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  const isPrimary = variant === "primary";

  return (
    <View style={style}>
      <TouchableOpacity
        style={[
          styles.button,
          isPrimary ? styles.buttonPrimary : styles.buttonSecondary,
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={isPrimary ? "#fff" : "#8b5cf6"} size="small" />
        ) : (
          <>
            <ScanFace size={20} color={isPrimary ? "#fff" : "#8b5cf6"} style={styles.icon} />
            <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textSecondary]}>
              {label || `Войти с ${getBiometricLabel()}`}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonPrimary: {
    backgroundColor: "#8b5cf6",
  },
  buttonSecondary: {
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    borderWidth: 2,
    borderColor: "#8b5cf6",
  },
  icon: {
    marginRight: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  textPrimary: {
    color: "#ffffff",
  },
  textSecondary: {
    color: "#8b5cf6",
  },
});
