import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { LogbookEntry, CheckinPayload } from '../types';

interface OfflineCheckin extends CheckinPayload {
  queuedAt: string;
  retries: number;
}

interface LogbookDraft {
  sessionId: string;
  logbook: LogbookEntry[];
  notes: string;
  savedAt: string;
}

interface GymDB extends DBSchema {
  checkin_queue: {
    key: string; // sessionId
    value: OfflineCheckin;
  };
  logbook_drafts: {
    key: string; // sessionId
    value: LogbookDraft;
  };
}

let db: IDBPDatabase<GymDB> | null = null;

async function getDB() {
  if (typeof window === 'undefined') return null;
  if (!db) {
    db = await openDB<GymDB>('gym-offline', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('checkin_queue')) {
          db.createObjectStore('checkin_queue', { keyPath: 'sessionId' });
        }
        if (!db.objectStoreNames.contains('logbook_drafts')) {
          db.createObjectStore('logbook_drafts', { keyPath: 'sessionId' });
        }
      },
    });
  }
  return db;
}

export async function queueCheckin(payload: CheckinPayload) {
  const db = await getDB();
  if (!db) return;
  await db.put('checkin_queue', { 
    ...payload, 
    queuedAt: new Date().toISOString(), 
    retries: 0 
  });
}

export async function getPendingCheckins() {
  const db = await getDB();
  if (!db) return [];
  return db.getAll('checkin_queue');
}

export async function removeFromQueue(sessionId: string) {
  const db = await getDB();
  if (!db) return;
  await db.delete('checkin_queue', sessionId);
}

export async function saveLogbookDraft(sessionId: string, logbook: LogbookEntry[], notes: string) {
  const db = await getDB();
  if (!db) return;
  await db.put('logbook_drafts', { 
    sessionId, 
    logbook, 
    notes, 
    savedAt: new Date().toISOString() 
  });
}

export async function getLogbookDraft(sessionId: string) {
  const db = await getDB();
  if (!db) return null;
  return db.get('logbook_drafts', sessionId);
}

export async function clearLogbookDraft(sessionId: string) {
  const db = await getDB();
  if (!db) return;
  await db.delete('logbook_drafts', sessionId);
}

export async function getAllLogbookDrafts() {
  const db = await getDB();
  if (!db) return [];
  return db.getAll('logbook_drafts');
}

