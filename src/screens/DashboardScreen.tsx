import React, { useState, useCallback } from "react";
import { View, StyleSheet, Text, FlatList, TouchableOpacity, RefreshControl, SafeAreaView, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useAuth } from "@/lib/auth";
import { api, getApiUrl } from "@/lib/api";
import { PremiumButton } from "@/components/PremiumButton";
import { EmptyState } from "@/components/EmptyState";
import { GlassCard } from "@/components/GlassCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useTheme } from "@/lib/theme";
import useSWR from "swr";
import { LogOut, Plus, Gift, Trash2, Moon, Sun } from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

type Props = NativeStackScreenProps<RootStackParamList, "Dashboard">;

interface Wishlist {
  id: string;
  name: string;
  occasion: string;
  slug: string;
  created_at: string;
  items: any[];
}

const fetcher = (url: string) => api<any>(url);

const SWR_OPTIONS = { revalidateOnFocus: false, dedupingInterval: 5000 };

export default function DashboardScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  const { data: wishlists, mutate, isLoading } = useSWR<Wishlist[]>("/wishlists/my", fetcher, SWR_OPTIONS);
  
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = useCallback(async () => {
    if (!deletingId) return;
    try {
      await api(`/wishlists/${deletingId}`, { method: "DELETE" });
      mutate();
    } catch (err: any) {
      Alert.alert("Ошибка", err.message || "Не удалось удалить список");
    } finally {
      setDeletingId(null);
    }
  }, [deletingId, mutate]);

  const renderItem = useCallback(({ item, index }: { item: Wishlist, index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 100)}>
      <TouchableOpacity onPress={() => navigation.navigate("WishlistDetail", { id: item.id })}>
        <GlassCard style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardEmoji}>🎁</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, isDark ? styles.textDark : styles.textLight]}>{item.name}</Text>
              <Text style={styles.cardOccasion}>{item.occasion}</Text>
            </View>
            <TouchableOpacity 
              style={styles.deleteBtn} 
              onPress={(e) => {
                e.stopPropagation();
                setDeletingId(item.id);
              }}
            >
              <Trash2 size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  ), [isDark, navigation]);

  return (
    <SafeAreaView style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, isDark ? styles.textDark : styles.textLight]}>
            Привет, {user?.name || "Пользователь"} 👋
          </Text>
          <Text style={styles.subtitle}>Мои списки желаний</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={toggle} style={styles.iconButton}>
            {isDark ? <Sun size={24} color="#f8fafc" /> : <Moon size={24} color="#0f172a" />}
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={styles.iconButton}>
            <LogOut size={24} color={isDark ? "#f8fafc" : "#0f172a"} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={wishlists || []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews={true}
        initialNumToRender={10}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={mutate} 
            tintColor={isDark ? "#f8fafc" : "#0f172a"}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <LoadingSpinner />
          ) : (
            <EmptyState
              icon={<Gift size={32} color="#8b5cf6" />}
              message="У вас пока нет списков желаний"
              actionLabel="Создать список"
              onAction={() => navigation.navigate("NewWishlist")}
            />
          )
        }
      />

      <View style={styles.fabContainer}>
        <PremiumButton
          title="Новый список"
          icon={<Plus size={20} color="#fff" />}
          onPress={() => navigation.navigate("NewWishlist")}
        />
      </View>

      <ConfirmModal
        visible={!!deletingId}
        title="Удалить список?"
        message="Вы уверены, что хотите удалить этот список желаний? Все элементы и бронирования будут безвозвратно удалены."
        confirmLabel="Удалить"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
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
  textLight: {
    color: "#0f172a",
  },
  textDark: {
    color: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748b",
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
  },
  iconButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
    padding: 16,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  cardEmoji: {
    fontSize: 24,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardOccasion: {
    fontSize: 14,
    color: "#64748b",
  },
  deleteBtn: {
    padding: 8,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
  }
});
