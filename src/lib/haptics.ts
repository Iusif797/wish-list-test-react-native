import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

export function hapticSuccess() {
  if (!isNative) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export function hapticError() {
  if (!isNative) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

export function hapticWarning() {
  if (!isNative) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}

export function hapticLight() {
  if (!isNative) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function hapticMedium() {
  if (!isNative) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export function hapticHeavy() {
  if (!isNative) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

export function hapticSelection() {
  if (!isNative) return;
  Haptics.selectionAsync();
}
