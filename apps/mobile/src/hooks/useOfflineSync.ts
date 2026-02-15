import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { flush, getPendingCount } from '../lib/offlineQueue';

/**
 * Hook that manages offline queue syncing.
 *
 * Triggers flush on:
 *  - Mount (app start)
 *  - App returning to foreground
 *  - Network connectivity restored
 *
 * Exposes pendingCount for the SyncIndicator component.
 */
export function useOfflineSync() {
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const lastFlush = useRef(0);

  const refreshCount = useCallback(async () => {
    const count = await getPendingCount();
    setPendingCount(count);
  }, []);

  const doFlush = useCallback(async () => {
    // Debounce: don't flush more than once every 5 seconds
    if (Date.now() - lastFlush.current < 5000) return;
    lastFlush.current = Date.now();

    setSyncing(true);
    try {
      await flush();
    } catch {
      // swallow — items stay in queue
    } finally {
      setSyncing(false);
      await refreshCount();
    }
  }, [refreshCount]);

  // Flush on mount
  useEffect(() => {
    doFlush();
  }, [doFlush]);

  // Flush on app foreground
  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        doFlush();
      }
    };
    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [doFlush]);

  // Flush on network restore
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        doFlush();
      }
    });
    return () => unsubscribe();
  }, [doFlush]);

  return { pendingCount, syncing, flush: doFlush, refreshCount };
}
