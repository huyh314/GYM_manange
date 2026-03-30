'use client';

import { useEffect } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { syncPendingCheckins, syncLogbookDrafts } from '@/lib/offline/syncQueue';

export function useSyncOnReconnect() {
  const isOnline = useNetworkStatus();

  useEffect(() => {
    if (isOnline) {
      syncPendingCheckins();
      syncLogbookDrafts();
    }
  }, [isOnline]);
}

