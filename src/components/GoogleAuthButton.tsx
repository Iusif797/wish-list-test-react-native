import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { useAuth } from '../lib/auth';
import { api, getApiUrl } from '../lib/api';
import { FontSize } from '../lib/typography';

WebBrowser.maybeCompleteAuthSession();

const extra = Constants.expoConfig?.extra ?? {};
const OAUTH_CALLBACK_URL =
  extra.oauthCallbackUrl || 'https://wish-list-dun.vercel.app/auth/callback';

interface GoogleAuthButtonProps {
  label?: string;
  style?: ViewStyle;
}

const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <Path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <Path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <Path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </Svg>
);

function parseCodeFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    return u.searchParams.get('code');
  } catch {
    return null;
  }
}

export function GoogleAuthButton({ label = 'Войти через Google', style }: GoogleAuthButtonProps) {
  const { loginWithOAuth } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const redirectUri = OAUTH_CALLBACK_URL;
      const urlRes = await fetch(
        getApiUrl(
          `/auth/oauth/google?redirect_uri=${encodeURIComponent(redirectUri)}&state=mobile`,
        ),
      );
      if (!urlRes.ok) {
        const err = await urlRes.json().catch(() => ({}));
        throw new Error(err.detail || 'Не удалось получить URL авторизации');
      }
      const { url } = await urlRes.json();
      const result = await WebBrowser.openAuthSessionAsync(url, redirectUri);
      if (result.type !== 'success' || !result.url) {
        setLoading(false);
        return;
      }
      const code = parseCodeFromUrl(result.url);
      if (!code) {
        throw new Error('Не получен код от Google');
      }
      const res = await api<{
        access_token: string;
        user: { id: string; email: string; name: string | null };
      }>('/auth/oauth/google', {
        method: 'POST',
        body: JSON.stringify({ code, redirect_uri: redirectUri }),
      });
      await loginWithOAuth(res.access_token, res.user);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка входа через Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={style}>
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        activeOpacity={0.8}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#1e293b" size="small" />
        ) : (
          <>
            <View style={styles.iconPlaceholder}>
              <GoogleIcon />
            </View>
            <Text style={styles.text}>{label}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  iconPlaceholder: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  text: {
    color: '#1e293b',
    fontSize: FontSize.body,
    fontWeight: '600',
  },
});
