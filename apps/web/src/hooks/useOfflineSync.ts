'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { flush, getPendingCount } from '@/lib/offlineQueue';

/**
 * Hook that manages offline queue syncing for the web app.
 *
 * Triggers flush on:
 *  - Mount (page load)
 *  - Page becomes visible (visibilitychange)
 *  - Network connectivity restored (navigator.onLine)
 *
 * Exposes pendingCount for the SyncIndicator component.
 */
export function useOfflineSync() {
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const lastFlush = useRef(0);

  const refreshCount = useCallback(() => {
    setPendingCount(getPendingCount());
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
      refreshCount();
    }
  }, [refreshCount]);

  // Flush on mount
  useEffect(() => {
    doFlush();
  }, [doFlush]);

  // Flush on visibility change (tab becomes active)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        doFlush();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [doFlush]);

  // Flush on network restore
  useEffect(() => {
    const handleOnline = () => {
      doFlush();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [doFlush]);

  return { pendingCount, syncing, flush: doFlush, refreshCount };
}
