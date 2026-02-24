import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { LoadingSpinner } from '@/components/LoadingSpinner';

import LandingScreen from '@/screens/LandingScreen';
import LoginScreen from '@/screens/LoginScreen';
import RegisterScreen from '@/screens/RegisterScreen';
import DashboardScreen from '@/screens/DashboardScreen';
import NewWishlistScreen from '@/screens/NewWishlistScreen';
import WishlistDetailScreen from '@/screens/WishlistDetailScreen';
import AddItemScreen from '@/screens/AddItemScreen';
import EditItemScreen from '@/screens/EditItemScreen';
import PublicWishlistScreen from '@/screens/PublicWishlistScreen';

export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  NewWishlist: undefined;
  WishlistDetail: { id: string };
  AddItem: { id: string };
  EditItem: { id: string; itemId: string };
  PublicWishlist: { slug: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const prefix = Linking.createURL('/');

export function AppNavigator() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: isDark ? '#030014' : '#f8fafc',
      card: isDark ? 'rgba(10, 5, 30, 0.85)' : 'rgba(255, 255, 255, 0.9)',
      text: isDark ? '#f8fafc' : '#0f172a',
      primary: '#8b5cf6',
    },
  };

  const linking = {
    prefixes: [prefix, 'wishlist://', 'https://wish-list-dun.vercel.app'],
    config: {
      screens: {
        PublicWishlist: 'w/:slug',
      },
    },
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? '#030014' : '#f8fafc' }]}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme} linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen name="PublicWishlist" component={PublicWishlistScreen} />

        {user ? (
          <Stack.Group>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="NewWishlist" component={NewWishlistScreen} />
            <Stack.Screen name="WishlistDetail" component={WishlistDetailScreen} />
            <Stack.Screen name="AddItem" component={AddItemScreen} />
            <Stack.Screen name="EditItem" component={EditItemScreen} />
          </Stack.Group>
        ) : (
          <Stack.Group>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
