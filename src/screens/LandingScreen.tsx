import React from 'react';
import { View, StyleSheet, Text, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { PremiumButton } from '@/components/PremiumButton';
import { GoogleAuthButton } from '@/components/GoogleAuthButton';
import { FaceIDAuthButton } from '@/components/FaceIDAuthButton';
import { FontSize } from '@/lib/typography';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { LogIn, UserPlus } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

export default function LandingScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={[StyleSheet.absoluteFill, styles.bgOverlay]} />

      <SafeAreaView style={styles.safe}>
        <Animated.View entering={FadeInUp.duration(800).delay(200)} style={styles.content}>
          <View style={styles.logoContainer}>
            <Text style={styles.emojiLogo}>🎁</Text>
          </View>

          <Text style={styles.title}>Список желаний</Text>
          <Text style={styles.description}>
            Создавайте списки желаний, делитесь с друзьями, пусть они бронируют подарки или
            скидываются.
          </Text>

          <View style={styles.buttonContainer}>
            <FaceIDAuthButton style={styles.btn} variant="primary" />
            <PremiumButton
              title="Войти"
              onPress={() => navigation.navigate('Login')}
              icon={<LogIn size={18} color="#fff" />}
              style={styles.btn}
            />
            <PremiumButton
              title="Создать аккаунт"
              variant="secondary"
              onPress={() => navigation.navigate('Register')}
              icon={<UserPlus size={18} color="#f8fafc" />}
              style={styles.btn}
            />
            <GoogleAuthButton style={styles.btn} />
          </View>

          <Text style={styles.footerText}>
            Есть ссылка? Откройте её в браузере, чтобы перейти к списку.
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030014',
  },
  bgOverlay: {
    backgroundColor: 'rgba(3, 0, 20, 0.7)',
  },
  safe: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiLogo: {
    fontSize: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: FontSize.body,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
    paddingHorizontal: 16,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 340,
    gap: 16,
  },
  btn: {
    marginBottom: 16,
  },
  footerText: {
    marginTop: 48,
    fontSize: FontSize.caption,
    color: '#64748b',
    textAlign: 'center',
  },
});
