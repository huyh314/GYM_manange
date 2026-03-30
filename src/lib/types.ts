export type LogbookSet = { 
  reps: number | string; 
  kg: number | string 
};

export type LogbookEntry = { 
  exercise: string; 
  sets: LogbookSet[] 
};

export interface CheckinPayload {
  sessionId: string;
  logbook: LogbookEntry[];
  notes: string;
}
