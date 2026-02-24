import React from 'react';
import { View, Text, StyleSheet, Image, Linking } from 'react-native';
import { GlassCard } from './GlassCard';
import { PremiumButton } from './PremiumButton';
import { ProgressBar } from './ProgressBar';
import { useTheme } from '../lib/theme';
import { FontSize } from '../lib/typography';
import { ExternalLink, Edit2, Trash2, CheckCircle2 } from 'lucide-react-native';

export interface ItemType {
  id: string;
  name: string;
  url: string;
  price: number;
  image_url: string | null;
  target_amount?: number | null;
  reserved: boolean;
  reserved_by_me?: boolean;
  total_contributed: number;
  contributed_by_me?: number;
  progress: number;
}

interface ItemCardProps {
  item: ItemType;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onReserve?: () => void;
  onUnreserve?: () => void;
  onContribute?: () => void;
  loadingId?: string | null;
}

export const ItemCard = React.memo(function ItemCard({
  item,
  isOwner,
  onEdit,
  onDelete,
  onReserve,
  onUnreserve,
  onContribute,
  loadingId,
}: ItemCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const hasTarget = item.target_amount != null && item.target_amount > 0;
  const target = item.target_amount ?? item.price;
  const isLoading = loadingId === item.id;

  const handleOpenUrl = () => {
    if (item.url) {
      Linking.openURL(item.url).catch(() => {});
    }
  };

  return (
    <GlassCard style={[styles.card, item.reserved && styles.cardReserved]}>
      <View style={styles.header}>
        <View style={styles.imageContainer}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.image} />
          ) : (
            <Text style={styles.emojiIcon}>🎁</Text>
          )}
        </View>
        <View style={styles.info}>
          <Text
            style={[
              styles.name,
              isDark ? styles.textDark : styles.textLight,
              item.reserved && styles.nameReserved,
            ]}
          >
            {item.name}
          </Text>
          <Text style={styles.url} numberOfLines={1} onPress={handleOpenUrl}>
            {item.url} <ExternalLink size={12} color="#8b5cf6" />
          </Text>
          <Text style={[styles.price, isDark ? styles.textDark : styles.textLight]}>
            {item.price} ₽
            {isOwner && item.target_amount && item.target_amount !== item.price && (
              <Text style={styles.targetText}> / цель {item.target_amount} ₽</Text>
            )}
          </Text>

          {!isOwner && item.reserved && !item.reserved_by_me && (
            <View style={styles.badgeReserved}>
              <CheckCircle2 size={12} color="#6366f1" />
              <Text style={styles.badgeReservedText}>Забронировано</Text>
            </View>
          )}

          {!isOwner && item.reserved_by_me && (
            <View style={styles.badgeMyReserve}>
              <CheckCircle2 size={12} color="#8b5cf6" />
              <Text style={styles.badgeMyReserveText}>Вы забронировали</Text>
            </View>
          )}

          {isOwner && item.reserved && (
            <View style={styles.badgeReserved}>
              <CheckCircle2 size={12} color="#6366f1" />
              <Text style={styles.badgeReservedText}>Забронировано</Text>
            </View>
          )}
        </View>
      </View>

      {hasTarget && (
        <View style={styles.progressContainer}>
          <ProgressBar progress={item.progress} />
          <Text
            style={[styles.progressText, isDark ? styles.textMutedDark : styles.textMutedLight]}
          >
            {item.total_contributed} / {target} ₽
          </Text>
        </View>
      )}

      {isOwner ? (
        <View style={styles.actionRow}>
          <PremiumButton
            title="Изменить"
            variant="secondary"
            onPress={onEdit}
            style={styles.actionButton}
            icon={<Edit2 size={16} color={isDark ? '#e2d6ff' : '#6d28d9'} />}
          />
          <PremiumButton
            title="Удалить"
            variant="danger"
            onPress={onDelete}
            style={styles.actionButton}
            icon={<Trash2 size={16} color="#ffffff" />}
          />
        </View>
      ) : (
        <View style={styles.actionRow}>
          {!item.reserved && !item.reserved_by_me && (
            <PremiumButton
              title="Забронировать"
              onPress={onReserve}
              loading={isLoading}
              style={styles.actionButton}
            />
          )}
          {item.reserved_by_me && (
            <PremiumButton
              title="Отменить бронь"
              variant="secondary"
              onPress={onUnreserve}
              loading={isLoading}
              style={styles.actionButton}
            />
          )}
          {hasTarget && item.progress < 1 && !item.reserved && (
            <PremiumButton
              title="Скинуться"
              onPress={onContribute}
              loading={isLoading}
              style={[styles.actionButton, item.reserved_by_me ? { marginTop: 12 } : null]}
            />
          )}
        </View>
      )}
    </GlassCard>
  );
});

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginBottom: 16,
  },
  cardReserved: {
    borderColor: 'rgba(16, 185, 129, 0.25)',
    opacity: 0.85,
  },
  nameReserved: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  emojiIcon: {
    fontSize: 32,
  },
  info: {
    flex: 1,
    paddingTop: 4,
  },
  name: {
    fontSize: FontSize.body,
    fontWeight: '700',
    marginBottom: 4,
  },
  url: {
    fontSize: FontSize.caption,
    color: '#8b5cf6',
    marginBottom: 8,
  },
  price: {
    fontSize: FontSize.secondary,
    fontWeight: '600',
  },
  targetText: {
    fontWeight: '400',
    color: '#94a3b8',
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
  badgeReserved: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 10,
    gap: 6,
  },
  badgeReservedText: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    color: '#06b6d4',
  },
  badgeMyReserve: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 10,
    gap: 6,
  },
  badgeMyReserveText: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    color: '#a855f7',
  },
  progressContainer: {
    marginTop: 16,
  },
  progressText: {
    fontSize: FontSize.caption,
    marginTop: 6,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
  },
});
