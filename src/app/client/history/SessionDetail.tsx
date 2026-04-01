'use client';

import { useEffect } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ClipboardList, Dumbbell, CalendarDays, User, X } from 'lucide-react';

type LogbookSet = {
  reps: number;
  kg: number;
};

type LogbookEntry = {
  exercise: string;
  sets: LogbookSet[];
};

export function SessionDetail({ session, isOpen, onClose }: { session: any; isOpen: boolean; onClose: () => void }) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!session || !isOpen) return null;

  const logbook: LogbookEntry[] = session.logbook || [];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet/Modal */}
      <div className="relative z-10 bg-[#1a1c1e] w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 border border-[#2a2b2e]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#d4af37]/10 to-[#8c7442]/10 border-b border-[#2a2b2e] sm:rounded-t-2xl rounded-t-2xl flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <ClipboardList className="w-5 h-5 text-[#d4af37]" />
            <h2 className="text-lg font-bold text-zinc-100">Chi tiết buổi tập</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#2a2b2e] flex items-center justify-center text-zinc-400 hover:bg-[#3a3b3e] hover:text-zinc-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#121212]">
          {/* Info section */}
          <div className="bg-[#1e1e1e] p-4 rounded-xl border border-[#2a2b2e] space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <div className="p-2 bg-[#d4af37]/10 text-[#d4af37] rounded-lg shrink-0 border border-[#d4af37]/20">
                <CalendarDays size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase">Ngày tập</p>
                <p className="font-medium text-zinc-200">
                  {format(new Date(session.checked_in_at || session.scheduled_at), 'EEEE, dd/MM/yyyy · HH:mm', { locale: vi })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-sm">
              <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg shrink-0 border border-sky-500/20">
                <User size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase">Huấn luyện viên</p>
                <p className="font-medium text-zinc-200">{session.pt?.name || 'Không có tên'}</p>
              </div>
            </div>

            {session.notes && (
              <div className="mt-3 pt-3 border-t border-[#2a2b2e] text-sm">
                <p className="text-xs font-semibold text-zinc-500 uppercase mb-2">Ghi chú của PT</p>
                <p className="text-zinc-300 bg-[#121212] p-3 rounded-md italic border border-[#2a2b2e]">"{session.notes}"</p>
              </div>
            )}
          </div>

          {/* Logbook section */}
          <div>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 px-1">
              Nhật ký bài tập (Logbook)
            </h3>

            {logbook.length > 0 ? (
              <div className="space-y-3">
                {logbook.map((entry, idx) => (
                  <div key={idx} className="bg-[#1e1e1e] rounded-xl border border-[#2a2b2e] overflow-hidden">
                    <div className="bg-[#1a1c1e] flex items-center p-3 border-b border-[#2a2b2e]">
                      <Dumbbell className="w-4 h-4 text-[#d4af37] mr-2" />
                      <h4 className="font-bold text-zinc-200 text-sm">{entry.exercise}</h4>
                      <span className="ml-auto text-xs font-bold text-zinc-500 bg-[#121212] px-2 py-0.5 rounded-md border border-[#2a2b2e]">
                        {entry.sets.length} SETS
                      </span>
                    </div>
                    <ul className="divide-y divide-[#2a2b2e]">
                      {entry.sets.map((set, sIdx) => (
                        <li key={sIdx} className="flex justify-between items-center text-sm py-2 px-4 hover:bg-[#1a1c1e] transition-colors">
                          <span className="font-medium text-zinc-500 text-xs uppercase w-16">Hiệp {sIdx + 1}</span>
                          <span className="flex-1 text-center font-bold text-zinc-200">
                            {set.reps} <span className="text-zinc-500 font-normal text-xs">reps</span>
                          </span>
                          <span className="flex-1 text-right font-bold text-[#d4af37]">
                            {set.kg} <span className="text-zinc-500 font-normal text-xs">kg</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center bg-[#1e1e1e] p-8 rounded-xl border border-dashed border-[#2a2b2e] text-zinc-500">
                <Dumbbell className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <p className="font-medium">Chưa có dữ liệu bài tập.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
