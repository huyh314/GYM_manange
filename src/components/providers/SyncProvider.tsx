'use client';

import { useEffect, useRef } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { getPendingCheckins, getAllLogbookDrafts, removeFromQueue, clearLogbookDraft } from '@/lib/offline/checkinQueue';
import { toast } from 'sonner';

export default function SyncProvider({ children }: { children: React.ReactNode }) {
  const isOnline = useNetworkStatus();
  const prevIsOnline = useRef(isOnline);

  const syncData = async () => {
    try {
      // 1. Process Check-in Queue
      const pendingCheckins = await getPendingCheckins();
      if (pendingCheckins.length > 0) {
        toast.info(`🔄 Đang đồng bộ ${pendingCheckins.length} buổi điểm danh offline...`);
        
        for (const item of pendingCheckins) {
          try {
            const res = await fetch(`/api/pt/sessions/${item.sessionId}/check-in`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ logbook: item.logbook, notes: item.notes })
            });
            
            if (res.ok) {
              await removeFromQueue(item.sessionId);
            }
          } catch (err) {
            console.error('Failed to sync check-in for session', item.sessionId, err);
          }
        }
      }

      // 2. Process Logbook Drafts
      const drafts = await getAllLogbookDrafts();
      if (drafts.length > 0) {
        // We only sync drafts that are NOT also in the check-in queue (to avoid double work)
        const pendingSessionIds = new Set(pendingCheckins.map(p => p.sessionId));
        const relevantDrafts = drafts.filter(d => !pendingSessionIds.has(d.sessionId));

        if (relevantDrafts.length > 0) {
          toast.info(`📤 Đang đẩy ${relevantDrafts.length} bản nháp lên máy chủ...`);
          
          for (const draft of relevantDrafts) {
            try {
              const res = await fetch(`/api/pt/sessions/${draft.sessionId}/logbook`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ logbook: draft.logbook, notes: draft.notes })
              });
              
              if (res.ok) {
                await clearLogbookDraft(draft.sessionId);
              }
            } catch (err) {
              console.error('Failed to sync draft for session', draft.sessionId, err);
            }
          }
        }
      }

      if (pendingCheckins.length > 0 || drafts.length > 0) {
        toast.success('✅ Đã đồng bộ dữ liệu tập luyện thành công.');
      }
    } catch (err) {
      console.error('Sync process error:', err);
    }
  };

  useEffect(() => {
    // If we just came back online
    if (isOnline && !prevIsOnline.current) {
      syncData();
    }
    prevIsOnline.current = isOnline;
  }, [isOnline]);

  // Also try to sync on initial load if online
  useEffect(() => {
    if (isOnline) {
      syncData();
    }
  }, []);

  return <>{children}</>;
}
