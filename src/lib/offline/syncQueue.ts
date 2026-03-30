import { getPendingCheckins, removeFromQueue } from './checkinQueue';
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
          isSync: true // Optional flag for backend if needed
        })
      });

      if (res.ok) {
        await removeFromQueue(item.sessionId);
        successCount++;
        console.log(`[Sync] Session ${item.sessionId} synced.`);
      } else {
        const err = await res.json();
        console.error(`[Sync] Failed ${item.sessionId}:`, err);
      }
    } catch (err) {
      console.error('[Sync] Network error during sync:', err);
      break; // Stop syncing if network is unstable
    }
  }

  if (successCount > 0) {
    toast.success(`Đã đồng bộ thành công ${successCount} khách hàng ghi nợ buổi tập.`);
  }
}
