import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PremiumButton } from './PremiumButton';
import { useTheme } from '../lib/theme';
import { FontSize } from '../lib/typography';

interface EmptyStateProps {
  emoji?: string;
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ emoji, icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      {emoji ? (
        <View style={styles.emojiWrapper}>
          <Text style={styles.emojiText}>{emoji}</Text>
        </View>
      ) : icon ? (
        <View style={styles.iconWrapper}>{icon}</View>
      ) : null}
      <Text style={[styles.title, isDark ? styles.titleDark : styles.titleLight]}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={[styles.subtitle, isDark ? styles.subtitleDark : styles.subtitleLight]}>
          {subtitle}
        </Text>
      ) : null}
      {actionLabel && onAction && (
        <PremiumButton title={actionLabel} onPress={onAction} style={styles.button} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  containerLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  containerDark: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderColor: 'rgba(51, 65, 85, 0.5)',
  },
  emojiWrapper: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emojiText: {
    fontSize: 44,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: FontSize.title,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '700',
  },
  titleLight: {
    color: '#0f172a',
  },
  titleDark: {
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: FontSize.secondary,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '400',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  subtitleLight: {
    color: '#64748b',
  },
  subtitleDark: {
    color: '#94a3b8',
  },
  button: {
    width: 'auto',
    minWidth: 200,
    marginTop: 8,
  },
});
