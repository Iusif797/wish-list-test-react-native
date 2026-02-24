import { Platform } from 'react-native';

const BIOMETRIC_TOKEN_KEY = 'auth_token';
const BIOMETRIC_FLAG_KEY = 'biometric_enabled';

/* eslint-disable @typescript-eslint/no-require-imports */
function getLocalAuth() {
  try {
    return require('expo-local-authentication');
  } catch {
    return null;
  }
}

function getSecureStore() {
  try {
    return require('expo-secure-store');
  } catch {
    return null;
  }
}
/* eslint-enable @typescript-eslint/no-require-imports */

export async function isBiometricAvailable(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const LocalAuthentication = getLocalAuth();
  if (!LocalAuthentication) return false;
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return types.length > 0 && enrolled;
  } catch {
    return false;
  }
}

export function getBiometricLabel(): string {
  return Platform.OS === 'ios' ? 'Face ID' : 'Отпечаток';
}

export async function authenticateWithBiometrics(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const LocalAuthentication = getLocalAuth();
  if (!LocalAuthentication) return false;
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Вход в приложение',
      fallbackLabel: 'Использовать пароль',
    });
    return result.success;
  } catch {
    return false;
  }
}

export async function hasStoredBiometricCredentials(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const SecureStore = getSecureStore();
  if (!SecureStore) return false;
  try {
    const flag = await SecureStore.getItemAsync(BIOMETRIC_FLAG_KEY);
    return flag === '1';
  } catch {
    return false;
  }
}

export async function saveBiometricCredentials(token: string): Promise<void> {
  if (Platform.OS === 'web') return;
  const SecureStore = getSecureStore();
  if (!SecureStore) return;
  try {
    await SecureStore.setItemAsync(BIOMETRIC_TOKEN_KEY, token);
    await SecureStore.setItemAsync(BIOMETRIC_FLAG_KEY, '1');
  } catch (e) {
    // Fail silently but acknowledge
  }
}

export async function getBiometricToken(): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  const SecureStore = getSecureStore();
  if (!SecureStore) return null;
  try {
    return await SecureStore.getItemAsync(BIOMETRIC_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function clearBiometricCredentials(): Promise<void> {
  if (Platform.OS === 'web') return;
  const SecureStore = getSecureStore();
  if (!SecureStore) return;
  try {
    await SecureStore.deleteItemAsync(BIOMETRIC_TOKEN_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_FLAG_KEY);
  } catch (e) {
    // Fail silently but acknowledge
  }
}
