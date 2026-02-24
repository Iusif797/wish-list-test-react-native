import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { api, getAnonymousToken } from '@/lib/api';
import { useWishlistWebSocket } from '@/lib/websocket';
import { PremiumButton } from '@/components/PremiumButton';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ItemCard, ItemType } from '@/components/ItemCard';
import { InputField } from '@/components/InputField';
import { GlassCard } from '@/components/GlassCard';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth';
import useSWR from 'swr';
import { Gift, X } from 'lucide-react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'PublicWishlist'>;

const fetcher = async (url: string) => {
  const token = await getAnonymousToken();
  return api<any>(url, { headers: { 'X-Anonymous-Token': token } });
};

export default function PublicWishlistScreen({ route, navigation }: Props) {
  const slug = route.params?.slug;
  const { theme } = useTheme();
  const { user } = useAuth();

  const isDark = theme === 'dark';
  const {
    data: wishlist,
    mutate,
    isLoading,
    error,
  } = useSWR<any>(slug ? `/public/wishlists/${slug}` : null, fetcher);

  useWishlistWebSocket(slug || '', () => mutate());

  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  const [contributeItem, setContributeItem] = useState<ItemType | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');
  const [contributing, setContributing] = useState(false);

  useEffect(() => {
    if (!slug) {
      navigation.replace(user ? 'Dashboard' : 'Landing');
    }
  }, [slug, user, navigation]);

  if (!slug) {
    return null;
  }

  const performAction = async (path: string, method: 'POST' | 'DELETE', body?: any) => {
    const token = await getAnonymousToken();
    return api(`/public/wishlists/${slug}${path}`, {
      method,
      headers: { 'X-Anonymous-Token': token },
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  const handleReserve = async (item: ItemType) => {
    setLoadingItemId(item.id);
    try {
      await performAction(`/items/${item.id}/reserve`, 'POST');
      mutate();
    } catch (err: any) {
      Alert.alert('Ошибка', err.message || 'Не удалось забронировать');
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleUnreserve = async (item: ItemType) => {
    setLoadingItemId(item.id);
    try {
      await performAction(`/items/${item.id}/reserve`, 'DELETE');
      mutate();
    } catch (err: any) {
      Alert.alert('Ошибка', err.message || 'Не удалось отменить бронь');
    } finally {
      setLoadingItemId(null);
    }
  };

  const submitContribute = async () => {
    if (!contributeItem) return;
    const amount = parseFloat(contributeAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Ошибка', 'Введите корректную сумму');
      return;
    }
    setContributing(true);
    try {
      await performAction(`/items/${contributeItem.id}/contribute`, 'POST', { amount });
      mutate();
      setContributeItem(null);
      setContributeAmount('');
      Alert.alert('Спасибо!', 'Ваш взнос успешно добавлен');
    } catch (err: any) {
      Alert.alert('Ошибка', err.message || 'Не удалось сделать взнос');
    } finally {
      setContributing(false);
    }
  };

  if (isLoading && !wishlist) {
    return (
      <SafeAreaView style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (error && error.message?.includes('404')) {
    return (
      <SafeAreaView style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
        <EmptyState
          icon={<Gift size={32} color="#8b5cf6" />}
          message="Список желаний не найден или удален"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]} numberOfLines={1}>
          {wishlist?.name || 'Список желаний'}
        </Text>
        <Text style={[styles.subtitle, isDark ? styles.textMutedDark : styles.textMutedLight]}>
          {wishlist?.occasion}
        </Text>
      </View>

      <FlatList
        data={wishlist?.items || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            isOwner={false}
            loadingId={loadingItemId}
            onReserve={() => handleReserve(item)}
            onUnreserve={() => handleUnreserve(item)}
            onContribute={() => setContributeItem(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !wishlist?.items?.length ? (
            <EmptyState
              icon={<Gift size={32} color="#8b5cf6" />}
              message="В этом списке пока нет подарков"
            />
          ) : null
        }
      />

      {/* Contribute Modal */}
      <Modal
        visible={!!contributeItem}
        transparent
        animationType="slide"
        onRequestClose={() => setContributeItem(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <GlassCard style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark ? styles.textDark : styles.textLight]}>
                Поддержать
              </Text>
              <TouchableOpacity onPress={() => setContributeItem(null)}>
                <X size={24} color={isDark ? '#94a3b8' : '#475569'} />
              </TouchableOpacity>
            </View>

            {contributeItem && (
              <View style={styles.modalItemInfo}>
                <Text style={[styles.modalItemName, isDark ? styles.textDark : styles.textLight]}>
                  {contributeItem.name}
                </Text>
                <Text style={isDark ? styles.textMutedDark : styles.textMutedLight}>
                  Осталось собрать:{' '}
                  {(contributeItem.target_amount ?? contributeItem.price) -
                    contributeItem.total_contributed}{' '}
                  ₽
                </Text>
              </View>
            )}

            <InputField
              label="Сумма (₽)"
              placeholder="e.g. 1000"
              keyboardType="numeric"
              value={contributeAmount}
              onChangeText={setContributeAmount}
            />

            <PremiumButton
              title="Отправить"
              onPress={submitContribute}
              loading={contributing}
              style={styles.modalSubmit}
            />
          </GlassCard>
        </KeyboardAvoidingView>
      </Modal>
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
  textMutedLight: {
    color: '#64748b',
  },
  textMutedDark: {
    color: '#94a3b8',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  listContent: {
    padding: 24,
    paddingBottom: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 48 : 24,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalItemInfo: {
    marginBottom: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 16,
    borderRadius: 16,
  },
  modalItemName: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  modalSubmit: {
    marginTop: 8,
  },
});
