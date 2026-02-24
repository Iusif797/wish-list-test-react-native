import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};
const API_URL = extra.apiUrl || 'https://wish-list-fqg6.onrender.com/api';
const WS_URL = extra.wsUrl || 'wss://wish-list-fqg6.onrender.com';

export function getApiUrl(path: string): string {
  return `${API_URL}${path}`;
}

export function getWsUrl(path: string): string {
  const base = WS_URL.replace(/^http/, 'ws');
  return `${base}${path}`;
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem('token');
}

export async function getAnonymousToken(): Promise<string> {
  let t = await AsyncStorage.getItem('anonymous_token');
  if (!t) {
    t = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      let r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    await AsyncStorage.setItem('anonymous_token', t);
  }
  return t;
}

const PROD_SPINUP_MS = 70000;

async function fetchWithTimeout(
  url: string,
  opts: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((opts.headers as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = getApiUrl(path);
  const timeout = PROD_SPINUP_MS;
  let lastErr: unknown;
  const maxAttempts = 2;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await fetchWithTimeout(url, { ...opts, headers }, timeout);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const detail =
          typeof err.detail === 'string'
            ? err.detail
            : Array.isArray(err.detail)
              ? err.detail.map((x: any) => x.msg).join(', ')
              : res.statusText;
        const errMsg = detail || res.statusText || 'Unknown API error';
        throw new Error(errMsg);
      }
      return res.json();
    } catch (e) {
      lastErr = e;
      if (
        e instanceof Error &&
        (e.message.includes('invalid_client') ||
          e.message.includes('oauth') ||
          e.message.includes('Unauthorized') ||
          e.message.includes('Not authenticated'))
      ) {
        throw e;
      }
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      throw new Error('Сервер временно недоступен. Пожалуйста, попробуйте еще раз.');
    }
  }
  throw lastErr;
}
