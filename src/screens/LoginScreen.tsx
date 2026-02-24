import React, { useState } from "react";
import { View, StyleSheet, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, SafeAreaView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useAuth } from "@/lib/auth";
import { InputField } from "@/components/InputField";
import { PremiumButton } from "@/components/PremiumButton";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { FaceIDAuthButton } from "@/components/FaceIDAuthButton";
import { GlassCard } from "@/components/GlassCard";
import { useTheme } from "@/lib/theme";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ChevronLeft } from "lucide-react-native";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  async function handleLogin() {
    if (!email || !password) {
      setError("Заполните все поля");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      // Navigation is handled automatically by auth state change in AppNavigator
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color={isDark ? "#f8fafc" : "#0f172a"} />
            <Text style={[styles.backText, isDark ? styles.textDark : styles.textLight]}>Назад</Text>
          </TouchableOpacity>

          <Animated.View entering={FadeInDown.duration(600).springify()}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Text style={styles.emojiLogo}>🎁</Text>
              </View>
              <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>С возвращением</Text>
              <Text style={styles.subtitle}>Войдите в свой аккаунт, чтобы продолжить</Text>
            </View>

            <GlassCard style={styles.card}>
              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <InputField
                label="Эл. почта"
                placeholder="name@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <InputField
                label="Пароль"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />

              <PremiumButton
                title="Войти"
                onPress={handleLogin}
                loading={loading}
                style={styles.submitBtn}
              />

              <View style={styles.divider}>
                <View style={[styles.line, isDark ? styles.lineDark : styles.lineLight]} />
                <Text style={styles.dividerText}>ИЛИ</Text>
                <View style={[styles.line, isDark ? styles.lineDark : styles.lineLight]} />
              </View>

              <GoogleAuthButton />

              <View style={styles.footer}>
                <Text style={styles.subtitle}>Нет аккаунта? </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                  <Text style={styles.link}>Зарегистрироваться</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgDark: {
    backgroundColor: "#030014",
  },
  bgLight: {
    backgroundColor: "#f8fafc",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },
  backText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 4,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 40,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emojiLogo: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748b",
  },
  textLight: {
    color: "#0f172a",
  },
  textDark: {
    color: "#f8fafc",
  },
  card: {
    padding: 24,
  },
  faceIdBtn: {
    marginBottom: 24,
  },
  errorBox: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    textAlign: "center",
  },
  submitBtn: {
    marginTop: 8,
    marginBottom: 24,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  line: {
    flex: 1,
    height: 1,
  },
  lineLight: {
    backgroundColor: "#e2e8f0",
  },
  lineDark: {
    backgroundColor: "rgba(139, 92, 246, 0.3)",
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  link: {
    color: "#8b5cf6",
    fontWeight: "600",
    fontSize: 15,
  }
});
