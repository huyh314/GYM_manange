import { getPendingCheckins, removeFromQueue, getAllLogbookDrafts, clearLogbookDraft } from './checkinQueue';
import { toast } from 'sonner';

export async function syncPendingCheckins() {
  const queue = await getPendingCheckins();
  if (queue.length === 0) return;

  let successCount = 0;
  for (const item of queue) {
    try {
      const res = await fetch(`/api/pt/sessions/${item.sessionId}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          logbook: item.logbook, 
          notes: item.notes,
          isSync: true 
        })
      });

      if (res.ok) {
        await removeFromQueue(item.sessionId);
        await clearLogbookDraft(item.sessionId); // Also clear draft if checkin is successful
        successCount++;
      }
    } catch (err) {
      console.error('[Sync] Network error:', err);
      break; 
    }
  }

  if (successCount > 0) {
    toast.success(`✅ Đã đồng bộ ${successCount} khách hàng ghi nợ buổi tập.`);
  }
}

export async function syncLogbookDrafts() {
  const drafts = await getAllLogbookDrafts();
  if (drafts.length === 0) return;

  // Don't sync drafts for sessions that are already in the check-in queue
  const pendingCheckins = await getPendingCheckins();
  const pendingIds = new Set(pendingCheckins.map(p => p.sessionId));
  const relevantDrafts = drafts.filter(d => !pendingIds.has(d.sessionId));

  if (relevantDrafts.length === 0) return;

  let count = 0;
  for (const draft of relevantDrafts) {
    try {
      const res = await fetch(`/api/pt/sessions/${draft.sessionId}/logbook`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logbook: draft.logbook, notes: draft.notes })
      });

      if (res.ok) {
        await clearLogbookDraft(draft.sessionId);
        count++;
      }
    } catch (err) {
      break;
    }
  }

  if (count > 0) {
    toast.info(`📤 Đã đẩy ${count} bản nháp lên máy chủ.`);
  }
}

