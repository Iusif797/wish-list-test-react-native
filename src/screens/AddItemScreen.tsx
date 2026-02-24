import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Keyboard,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { InputField } from '@/components/InputField';
import { PremiumButton } from '@/components/PremiumButton';
import { GlassCard } from '@/components/GlassCard';
import { useTheme } from '@/lib/theme';
import { FontSize } from '@/lib/typography';
import { hapticSuccess, hapticError } from '@/lib/haptics';
import { api } from '@/lib/api';
import { ChevronLeft, Search } from 'lucide-react-native';
import { mutate } from 'swr';

type Props = NativeStackScreenProps<RootStackParamList, 'AddItem'>;

export default function AddItemScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [error, setError] = useState('');
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const fetchMeta = async () => {
    if (!url) return;
    Keyboard.dismiss();
    setLoadingMeta(true);
    setError('');
    try {
      const meta = await api<any>('/meta/fetch', {
        method: 'POST',
        body: JSON.stringify({ url: url.trim() }),
      });
      if (meta.title) setName(meta.title);
      if (meta.price != null) setPrice(meta.price.toString());
      if (meta.image_url) setImageUrl(meta.image_url);
    } catch (err: any) {
      setError('Не удалось автоматически заполнить данные: ' + err.message);
    } finally {
      setLoadingMeta(false);
    }
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedUrl = url.trim();

    if (!trimmedName || !trimmedUrl || !price) {
      hapticError();
      setError('Название, ссылка и цена обязательны');
      return;
    }

    if (trimmedName.length > 100) {
      hapticError();
      setError('Название не должно превышать 100 символов');
      return;
    }

    // Check for duplicates in current wishlist if data is available locally
    try {
      const { data: currentWishlist } = await api<any>(`/wishlists/${id}`);
      if (currentWishlist?.items?.some((i: any) => i.name.toLowerCase() === trimmedName.toLowerCase())) {
        hapticError();
        setError('Подарок с таким названием уже существует в этом списке');
        return;
      }
    } catch {
      // Ignore network errors on duplicate check to not block creation completely
    }

    setLoadingSave(true);
    setError('');
    try {
      await api(`/wishlists/${id}/items`, {
        method: 'POST',
        body: JSON.stringify({
          name,
          url,
          price: parseFloat(price),
          image_url: imageUrl || null,
          target_amount: targetAmount ? parseFloat(targetAmount) : null,
        }),
      });
      hapticSuccess();
      mutate(`/wishlists/${id}`);
      mutate('/wishlists/my');
      navigation.goBack();
    } catch (err: any) {
      hapticError();
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
      setLoadingSave(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color={isDark ? '#f8fafc' : '#0f172a'} />
            <Text style={[styles.backText, isDark ? styles.textDark : styles.textLight]}>
              Назад
            </Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>
              Добавить подарок
            </Text>
          </View>

          <GlassCard style={styles.card}>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <InputField
              label="Ссылка на товар"
              placeholder="https://..."
              value={url}
              onChangeText={setUrl}
              keyboardType="url"
              autoCapitalize="none"
            />

            <PremiumButton
              title="Найти информацию по ссылке"
              icon={<Search size={18} color={isDark ? '#e2d6ff' : '#6d28d9'} />}
              onPress={fetchMeta}
              loading={loadingMeta}
              variant="secondary"
              style={styles.findBtn}
            />

            <InputField label="Название" placeholder="" value={name} onChangeText={setName} />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <InputField
                  label="Цена (₽)"
                  placeholder="100000"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfInput}>
                <InputField
                  label="Цель сбора (₽)"
                  placeholder="Опционально"
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <InputField
              label="Ссылка на картинку"
              placeholder="https://... (опционально)"
              value={imageUrl}
              onChangeText={setImageUrl}
              keyboardType="url"
              autoCapitalize="none"
            />

            <PremiumButton
              title="Добавить"
              onPress={handleSave}
              loading={loadingSave}
              style={styles.submitBtn}
            />
          </GlassCard>
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
    backgroundColor: '#030014',
  },
  bgLight: {
    backgroundColor: '#f8fafc',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  backText: {
    fontSize: FontSize.body,
    fontWeight: '500',
    marginLeft: 4,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: FontSize.header,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  textLight: {
    color: '#0f172a',
  },
  textDark: {
    color: '#f8fafc',
  },
  card: {
    padding: 24,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: FontSize.secondary,
    textAlign: 'center',
  },
  findBtn: {
    marginBottom: 20,
    marginTop: -4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  submitBtn: {
    marginTop: 16,
  },
});
