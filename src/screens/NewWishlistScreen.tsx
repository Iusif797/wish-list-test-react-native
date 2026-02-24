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
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { InputField } from '../components/InputField';
import { PremiumButton } from '../components/PremiumButton';
import { GlassCard } from '../components/GlassCard';
import { useTheme } from '../lib/theme';
import { FontSize } from '../lib/typography';
import { hapticSuccess, hapticError } from '../lib/haptics';
import { api } from '../lib/api';
import { ChevronLeft } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

type Props = NativeStackScreenProps<RootStackParamList, 'NewWishlist'>;

export default function NewWishlistScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [occasion, setOccasion] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  async function handleCreate() {
    const trimmedName = name.trim();
    const trimmedOccasion = occasion.trim();

    if (!trimmedName || !trimmedOccasion) {
      hapticError();
      setError('Пожалуйста, заполните все поля');
      return;
    }

    if (trimmedName.length > 50) {
      hapticError();
      setError('Название не должно превышать 50 символов');
      return;
    }
    
    // Check for duplicates in current wishlists
    try {
      const { data: currentWishlists } = await api<any>('/wishlists/my');
      if (currentWishlists?.some((w: any) => w.name.toLowerCase() === trimmedName.toLowerCase())) {
        hapticError();
        setError('Список с таким названием уже существует');
        return;
      }
    } catch {
      // Ignore network errors on duplicate check
    }

    setError('');
    setLoading(true);
    try {
      const wishlist = await api<{ id: string }>('/wishlists', {
        method: 'POST',
        body: JSON.stringify({ name: trimmedName, occasion: trimmedOccasion }),
      });
      hapticSuccess();
      navigation.replace('WishlistDetail', { id: wishlist.id });
    } catch (err: any) {
      hapticError();
      setError(err instanceof Error ? err.message : 'Ошибка создания списка');
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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

          <Animated.View entering={FadeInDown.duration(600).springify()}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Text style={styles.emojiLogo}>🎉</Text>
              </View>
              <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>
                Новый список
              </Text>
              <Text style={styles.subtitle}>Создайте новый список желаний для любого повода</Text>
            </View>

            <GlassCard style={styles.card}>
              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <InputField
                label="Название списка"
                placeholder="Например: Мой День Рождения 2026"
                value={name}
                onChangeText={setName}
              />

              <InputField
                label="Повод"
                placeholder="Свадьба, новоселье, просто так..."
                value={occasion}
                onChangeText={setOccasion}
              />

              <PremiumButton
                title="Отправить"
                onPress={handleCreate}
                loading={loading}
                style={styles.submitBtn}
              />
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
    paddingTop: 80,
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
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emojiLogo: {
    fontSize: 32,
  },
  title: {
    fontSize: FontSize.header,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.secondary,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 16,
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
  submitBtn: {
    marginTop: 8,
  },
});
