import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { api } from '@/lib/api';
import { useWishlistWebSocket } from '@/lib/websocket';
import { PremiumButton } from '@/components/PremiumButton';
import { EmptyState } from '@/components/EmptyState';
import { ProgressBar } from '@/components/ProgressBar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ItemCard, ItemType } from '@/components/ItemCard';
import { SwipeableItemCard } from '@/components/SwipeableItemCard';
import { AnimatedItemWrapper } from '@/components/AnimatedItemWrapper';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useTheme } from '@/lib/theme';
import { FontSize } from '@/lib/typography';
import { hapticSuccess, hapticError, hapticWarning, hapticMedium } from '@/lib/haptics';
import useSWR from 'swr';
import * as Clipboard from 'expo-clipboard';
import { ChevronLeft, Plus, Copy } from 'lucide-react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'WishlistDetail'>;

const fetcher = (url: string) => api<any>(url);

const SWR_OPTIONS = { revalidateOnFocus: false, dedupingInterval: 3000 };

export default function WishlistDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const {
    data: wishlist,
    mutate,
    isLoading,
  } = useSWR<any>(`/wishlists/${id}`, fetcher, SWR_OPTIONS);

  // Real-time updates
  useWishlistWebSocket(wishlist?.slug || null, () => {
    mutate();
  });

  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [animatingDeleteId, setAnimatingDeleteId] = useState<string | null>(null);
  const [localItems, setLocalItems] = useState<ItemType[] | null>(null);
  const itemIndexMap = useRef<Map<string, number>>(new Map());

  const items: ItemType[] = useMemo(() => localItems ?? wishlist?.items ?? [], [localItems, wishlist?.items]);

  const stats = useMemo(() => {
    const total = items.length;
    const reserved = items.filter((i) => i.reserved).length;
    const progress = total > 0 ? reserved / total : 0;
    return { total, reserved, progress };
  }, [items]);

  const handleDeleteConfirm = useCallback(() => {
    if (!deletingItemId) return;
    setAnimatingDeleteId(deletingItemId);
    setDeletingItemId(null);
  }, [deletingItemId]);

  const handleDeleteAnimationEnd = useCallback(async () => {
    const itemId = animatingDeleteId;
    setAnimatingDeleteId(null);
    if (!itemId) return;
    try {
      await api(`/wishlists/${id}/items/${itemId}`, { method: 'DELETE' });
      hapticSuccess();
      mutate();
      setLocalItems(null);
    } catch (err: any) {
      hapticError();
      Alert.alert('Ошибка', err.message || 'Не удалось удалить предмет');
      mutate();
    }
  }, [animatingDeleteId, id, mutate]);

  const handleToggleReserved = useCallback(
    async (item: ItemType) => {
      try {
        if (item.reserved) {
          await api(`/wishlists/${id}/items/${item.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ reserved: false }),
          });
        } else {
          await api(`/wishlists/${id}/items/${item.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ reserved: true }),
          });
        }
        hapticSuccess();
        mutate();
        setLocalItems(null);
      } catch {
        hapticError();
      }
    },
    [id, mutate],
  );

  const shareLink = `https://wish-list-dun.vercel.app/w/${wishlist?.slug}`;

  const copyLink = async () => {
    await Clipboard.setStringAsync(shareLink);
    hapticSuccess();
    Alert.alert('Готово', 'Ссылка скопирована в буфер обмена');
  };

  const handleDragEnd = useCallback(
    ({ data }: { data: ItemType[] }) => {
      hapticMedium();
      setLocalItems(data);
      const itemIds = data.map((item) => item.id);
      api(`/wishlists/${id}/reorder`, {
        method: 'PATCH',
        body: JSON.stringify({ item_ids: itemIds }),
      }).catch(() => {
        setLocalItems(null);
      });
    },
    [id],
  );

  const renderItem = useCallback(
    ({ item, drag, isActive, getIndex }: RenderItemParams<ItemType>) => {
      const idx = getIndex() ?? 0;
      if (!itemIndexMap.current.has(item.id)) {
        itemIndexMap.current.set(item.id, itemIndexMap.current.size);
      }
      const entryIndex = itemIndexMap.current.get(item.id) ?? idx;

      return (
        <ScaleDecorator>
          <AnimatedItemWrapper
            index={entryIndex}
            isDeleting={animatingDeleteId === item.id}
            onDeleteAnimationEnd={handleDeleteAnimationEnd}
          >
            <TouchableOpacity
              activeOpacity={1}
              onLongPress={() => {
                hapticMedium();
                drag();
              }}
              disabled={isActive}
              style={isActive ? styles.draggingItem : undefined}
            >
              <SwipeableItemCard
                onSwipeLeft={() => {
                  hapticWarning();
                  setDeletingItemId(item.id);
                }}
                onSwipeRight={() => handleToggleReserved(item)}
                isReserved={item.reserved}
              >
                <ItemCard
                  item={item}
                  isOwner={true}
                  onEdit={() => navigation.navigate('EditItem', { id, itemId: item.id })}
                  onDelete={() => {
                    hapticWarning();
                    setDeletingItemId(item.id);
                  }}
                />
              </SwipeableItemCard>
            </TouchableOpacity>
          </AnimatedItemWrapper>
        </ScaleDecorator>
      );
    },
    [id, navigation, handleToggleReserved, animatingDeleteId, handleDeleteAnimationEnd],
  );

  const renderEmptyState = useCallback(() => {
    return (
      <EmptyState
        emoji="🎁"
        title="Список пуст"
        subtitle="Добавьте свой первый подарок — начните собирать идеи, которые порадуют вас или ваших близких"
        actionLabel="Добавить первый подарок"
        onAction={() => navigation.navigate('AddItem', { id })}
      />
    );
  }, [id, navigation]);

  const renderAllReservedBanner = () => {
    if (stats.total === 0 || stats.reserved < stats.total) return null;
    return (
      <View style={[styles.allReservedBanner, isDark ? styles.bannerDark : styles.bannerLight]}>
        <Text style={styles.bannerEmoji}>🎉</Text>
        <Text style={[styles.bannerText, isDark ? styles.textDark : styles.textLight]}>
          Все подарки забронированы!
        </Text>
      </View>
    );
  };

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
          <ChevronLeft size={24} color={isDark ? '#f8fafc' : '#0f172a'} />
        </TouchableOpacity>
        <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]} numberOfLines={1}>
          {wishlist?.name || 'Список'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <DraggableFlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onDragEnd={handleDragEnd}
        containerStyle={styles.listFlex}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          wishlist ? (
            <View>
              <View style={styles.shareSection}>
                <Text style={styles.shareLabel}>Публичная ссылка на список:</Text>
                <View style={[styles.shareBox, isDark ? styles.shareBoxDark : styles.shareBoxLight]}>
                  <Text
                    style={[styles.shareText, isDark ? styles.textDark : styles.textLight]}
                    numberOfLines={1}
                  >
                    {shareLink}
                  </Text>
                  <TouchableOpacity style={styles.copyBtn} onPress={copyLink}>
                    <Copy size={20} color="#8b5cf6" />
                  </TouchableOpacity>
                </View>
              </View>

              {stats.total > 0 && (
                <View style={[styles.statsCard, isDark ? styles.statsCardDark : styles.statsCardLight]}>
                  <View style={styles.statsRow}>
                    <Text style={[styles.statsLabel, isDark ? styles.textMutedDark : styles.textMutedLight]}>
                      Забронировано
                    </Text>
                    <Text style={[styles.statsValue, isDark ? styles.textDark : styles.textLight]}>
                      {stats.reserved} из {stats.total}
                    </Text>
                  </View>
                  <ProgressBar progress={stats.progress} height={6} />
                </View>
              )}

              {renderAllReservedBanner()}

              {items.length > 1 && (
                <Text style={styles.dragHint}>Удерживайте подарок, чтобы переместить · свайп для действий</Text>
              )}
            </View>
          ) : null
        }
        ListEmptyComponent={!items.length ? renderEmptyState : null}
      />

      <View style={styles.fabContainer}>
        <PremiumButton
          title="Добавить подарок"
          icon={<Plus size={20} color="#fff" />}
          onPress={() => navigation.navigate('AddItem', { id })}
        />
      </View>

      <ConfirmModal
        visible={!!deletingItemId}
        title="Удалить предмет?"
        message="Вы уверены, что хотите удалить этот предмет из списка? Все бронирования и скидывания будут отменены."
        confirmLabel="Удалить"
        variant="danger"
        onConfirm={handleDeleteConfirm}
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
    backgroundColor: '#030014',
  },
  bgLight: {
    backgroundColor: '#f8fafc',
  },
  textLight: {
    color: '#0f172a',
  },
  textDark: {
    color: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  shareSection: {
    marginBottom: 16,
  },
  shareLabel: {
    fontSize: FontSize.caption,
    color: '#64748b',
    marginBottom: 8,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  shareBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingLeft: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  shareBoxLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
  },
  shareBoxDark: {
    backgroundColor: 'rgba(10, 5, 40, 0.6)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  shareText: {
    flex: 1,
    fontSize: FontSize.secondary,
  },
  copyBtn: {
    padding: 8,
    marginLeft: 8,
  },
  listFlex: {
    flex: 1,
  },
  listContent: {
    padding: 24,
    paddingBottom: 100,
  },
  draggingItem: {
    opacity: 0.95,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
  },
  statsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  statsCardLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  statsCardDark: {
    backgroundColor: 'rgba(10, 5, 40, 0.6)',
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statsLabel: {
    fontSize: FontSize.secondary,
    fontWeight: '500',
  },
  statsValue: {
    fontSize: FontSize.secondary,
    fontWeight: '700',
  },
  textMutedLight: {
    color: '#64748b',
  },
  textMutedDark: {
    color: '#94a3b8',
  },
  allReservedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
  },
  bannerLight: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  bannerDark: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  bannerEmoji: {
    fontSize: 20,
  },
  bannerText: {
    fontSize: FontSize.secondary,
    fontWeight: '700',
  },
  dragHint: {
    fontSize: FontSize.caption,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
  },
});
