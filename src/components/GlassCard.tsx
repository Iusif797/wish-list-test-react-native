import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '../lib/theme';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
}

export function GlassCard({ children, style, ...props }: GlassCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
  },
  cardLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: 'rgba(0, 0, 0, 0.08)',
  },
  cardDark: {
    backgroundColor: 'rgba(10, 5, 40, 0.6)',
    borderColor: 'rgba(139, 92, 246, 0.2)',
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.15,
  },
});
