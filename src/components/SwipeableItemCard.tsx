import React, { useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import { Trash2, CheckCircle2 } from 'lucide-react-native';
import { FontSize } from '../lib/typography';
import { hapticWarning, hapticMedium } from '../lib/haptics';

interface SwipeableItemCardProps {
  children: React.ReactNode;
  onSwipeLeft: () => void;
  onSwipeRight?: () => void;
  isReserved?: boolean;
}

export function SwipeableItemCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  isReserved,
}: SwipeableItemCardProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderLeftActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    if (!onSwipeRight) return null;

    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0.4, 1],
      extrapolate: 'clamp',
    });

    const opacity = dragX.interpolate({
      inputRange: [0, 60, 80],
      outputRange: [0, 0.7, 1],
      extrapolate: 'clamp',
    });

    return (
      <RectButton
        style={[
          styles.swipeAction,
          isReserved ? styles.swipeUnreserve : styles.swipeReserve,
        ]}
        onPress={() => {
          hapticMedium();
          onSwipeRight();
          swipeableRef.current?.close();
        }}
      >
        <Animated.View style={[styles.swipeContent, { opacity, transform: [{ scale }] }]}>
          <CheckCircle2 size={24} color="#ffffff" />
          <Text style={styles.swipeText}>
            {isReserved ? 'Снять' : 'Куплено'}
          </Text>
        </Animated.View>
      </RectButton>
    );
  };

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.4],
      extrapolate: 'clamp',
    });

    const opacity = dragX.interpolate({
      inputRange: [-80, -60, 0],
      outputRange: [1, 0.7, 0],
      extrapolate: 'clamp',
    });

    return (
      <RectButton
        style={[styles.swipeAction, styles.swipeDelete]}
        onPress={() => {
          hapticWarning();
          onSwipeLeft();
          swipeableRef.current?.close();
        }}
      >
        <Animated.View style={[styles.swipeContent, { opacity, transform: [{ scale }] }]}>
          <Trash2 size={24} color="#ffffff" />
          <Text style={styles.swipeText}>Удалить</Text>
        </Animated.View>
      </RectButton>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={onSwipeRight ? renderLeftActions : undefined}
      renderRightActions={renderRightActions}
      overshootLeft={false}
      overshootRight={false}
      friction={2}
      leftThreshold={80}
      rightThreshold={80}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    marginBottom: 16,
    borderRadius: 24,
  },
  swipeReserve: {
    backgroundColor: '#10b981',
  },
  swipeUnreserve: {
    backgroundColor: '#f59e0b',
  },
  swipeDelete: {
    backgroundColor: '#ef4444',
  },
  swipeContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  swipeText: {
    color: '#ffffff',
    fontSize: FontSize.caption,
    fontWeight: '700',
  },
});
