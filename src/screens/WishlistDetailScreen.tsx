import React, { useState } from "react";
import { View, StyleSheet, Text, FlatList, TouchableOpacity, SafeAreaView, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { api } from "@/lib/api";
import { useWishlistWebSocket } from "@/lib/websocket";
import { PremiumButton } from "@/components/PremiumButton";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ItemCard, ItemType } from "@/components/ItemCard";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useTheme } from "@/lib/theme";
import useSWR from "swr";
import * as Clipboard from "expo-clipboard";
import { ChevronLeft, Plus, Share2, Copy, Gift } from "lucide-react-native";

type Props = NativeStackScreenProps<RootStackParamList, "WishlistDetail">;

const fetcher = (url: string) => api<any>(url);

const SWR_OPTIONS = { revalidateOnFocus: false, dedupingInterval: 3000 };

export default function WishlistDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { data: wishlist, mutate, isLoading } = useSWR<any>(`/wishlists/${id}`, fetcher, SWR_OPTIONS);
  
  // Real-time updates
  useWishlistWebSocket(wishlist?.slug || null, () => {
    mutate();
  });

  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const handleDeleteItem = async () => {
    if (!deletingItemId) return;
    try {
      await api(`/wishlists/${id}/items/${deletingItemId}`, { method: "DELETE" });
      mutate();
    } catch (err: any) {
      Alert.alert("Ошибка", err.message || "Не удалось удалить предмет");
    } finally {
      setDeletingItemId(null);
    }
  };

  const shareLink = `https://wish-list-dun.vercel.app/w/${wishlist?.slug}`;

  const copyLink = async () => {
    await Clipboard.setStringAsync(shareLink);
    Alert.alert("Готово", "Ссылка скопирована в буфер обмена");
  };

  const renderItem = ({ item }: { item: ItemType }) => (
    <ItemCard
      item={item}
      isOwner={true}
      onEdit={() => navigation.navigate("EditItem", { id, itemId: item.id })}
      onDelete={() => setDeletingItemId(item.id)}
    />
  );

  if (isLoading && !wishlist) {
    return (
      <SafeAreaView style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={isDark ? "#f8fafc" : "#0f172a"} />
        </TouchableOpacity>
        <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]} numberOfLines={1}>
          {wishlist?.name || "Список"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={wishlist?.items || []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews={true}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        ListHeaderComponent={
          wishlist ? (
            <View style={styles.shareSection}>
              <Text style={styles.shareLabel}>Публичная ссылка на список:</Text>
              <View style={[styles.shareBox, isDark ? styles.shareBoxDark : styles.shareBoxLight]}>
                <Text style={[styles.shareText, isDark ? styles.textDark : styles.textLight]} numberOfLines={1}>
                  {shareLink}
                </Text>
                <TouchableOpacity style={styles.copyBtn} onPress={copyLink}>
                  <Copy size={20} color="#8b5cf6" />
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !wishlist?.items?.length ? (
            <EmptyState
              icon={<Gift size={32} color="#8b5cf6" />}
              message="В этом списке пока нет подарков"
              actionLabel="Добавить первый подарок"
              onAction={() => navigation.navigate("AddItem", { id })}
            />
          ) : null
        }
      />

      <View style={styles.fabContainer}>
        <PremiumButton
          title="Добавить подарок"
          icon={<Plus size={20} color="#fff" />}
          onPress={() => navigation.navigate("AddItem", { id })}
        />
      </View>

      <ConfirmModal
        visible={!!deletingItemId}
        title="Удалить предмет?"
        message="Вы уверены, что хотите удалить этот предмет из списка? Все бронирования и скидывания будут отменены."
        confirmLabel="Удалить"
        variant="danger"
        onConfirm={handleDeleteItem}
        onCancel={() => setDeletingItemId(null)}
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148, 163, 184, 0.2)",
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  shareSection: {
    marginBottom: 24,
  },
  shareLabel: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 8,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  shareBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingLeft: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  shareBoxLight: {
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
  },
  shareBoxDark: {
    backgroundColor: "rgba(10, 5, 40, 0.6)",
    borderColor: "rgba(139, 92, 246, 0.3)",
  },
  shareText: {
    flex: 1,
    fontSize: 14,
  },
  copyBtn: {
    padding: 8,
    marginLeft: 8,
  },
  listContent: {
    padding: 24,
    paddingBottom: 100,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
  }
});
