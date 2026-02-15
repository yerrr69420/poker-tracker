import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSizes, fontWeights } from '@poker-tracker/shared';
import { useAuth } from '../hooks/useAuth';
import TodayDashboard from '../screens/dashboard/TodayDashboard';
import AddSessionScreen from '../screens/sessions/AddSessionScreen';
import SessionDetailScreen from '../screens/sessions/SessionDetailScreen';
import BankrollScreen from '../screens/bankroll/BankrollScreen';
import HandFeedScreen from '../screens/hands/HandFeedScreen';
import HandPostDetailScreen from '../screens/hands/HandPostDetailScreen';
import CreateHandPostScreen from '../screens/hands/CreateHandPostScreen';
import SyncIndicator from '../components/ui/SyncIndicator';
import { useOfflineSync } from '../hooks/useOfflineSync';
import type { MainTabsParamList } from './types';

const Tab = createBottomTabNavigator<MainTabsParamList>();

function DashboardTab() {
  const [view, setView] = useState<'dashboard' | 'add' | { detail: string }>('dashboard');

  if (view === 'add') {
    return (
      <AddSessionScreen
        onSaved={() => setView('dashboard')}
        onCancel={() => setView('dashboard')}
      />
    );
  }

  if (typeof view === 'object' && 'detail' in view) {
    return (
      <SessionDetailScreen
        sessionId={view.detail}
        onBack={() => setView('dashboard')}
      />
    );
  }

  return (
    <TodayDashboard
      onAddSession={() => setView('add')}
      onSessionPress={(id) => setView({ detail: id })}
    />
  );
}


function HandsTab() {
  const [view, setView] = useState<'feed' | 'create' | { detail: string }>('feed');

  if (view === 'create') {
    return (
      <CreateHandPostScreen
        onCreated={() => setView('feed')}
        onCancel={() => setView('feed')}
      />
    );
  }

  if (typeof view === 'object' && 'detail' in view) {
    return (
      <HandPostDetailScreen
        postId={view.detail}
        onBack={() => setView('feed')}
      />
    );
  }

  return (
    <HandFeedScreen
      onPostPress={(id) => setView({ detail: id })}
      onCreatePost={() => setView('create')}
    />
  );
}

function ProfileScreen() {
  const { user, signOut, loading } = useAuth();
  const { pendingCount } = useOfflineSync();
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>Profile</Text>
      <Text style={styles.emailText}>{user?.email}</Text>
      <View style={styles.syncRow}>
        <SyncIndicator pendingCount={pendingCount} />
      </View>
      <TouchableOpacity
        style={styles.signOutBtn}
        onPress={signOut}
        disabled={loading}
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgSurface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardTab}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="Bankroll"
        component={BankrollScreen}
        options={{ tabBarLabel: 'Bankroll' }}
      />
      <Tab.Screen
        name="Hands"
        component={HandsTab}
        options={{ tabBarLabel: 'Hands' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    backgroundColor: colors.bgDeep,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  placeholderText: {
    color: colors.textPrimary,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
  },
  emailText: {
    color: colors.textSecondary,
    fontSize: fontSizes.md,
    marginTop: spacing.md,
  },
  syncRow: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  signOutBtn: {
    marginTop: spacing.xl,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.loss,
    borderRadius: 8,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  signOutText: {
    color: colors.loss,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
  },
});
