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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet/Modal */}
      <div className="relative z-10 bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b sm:rounded-t-2xl rounded-t-2xl flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <ClipboardList className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-indigo-900">Chi tiết buổi tập</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-gray-500 hover:bg-white hover:text-gray-800 transition-colors shadow-sm"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-50/50">
          {/* Info section */}
          <div className="bg-white p-4 rounded-xl shadow-sm border space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                <CalendarDays size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Ngày tập</p>
                <p className="font-medium text-gray-900">
                  {format(new Date(session.checked_in_at || session.scheduled_at), 'EEEE, dd/MM/yyyy · HH:mm', { locale: vi })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-sm">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0">
                <User size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Huấn luyện viên</p>
                <p className="font-medium text-gray-900">{session.pt?.name || 'Không có tên'}</p>
              </div>
            </div>

            {session.notes && (
              <div className="mt-3 pt-3 border-t text-sm">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Ghi chú của PT</p>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md italic">"{session.notes}"</p>
              </div>
            )}
          </div>

          {/* Logbook section */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
              Nhật ký bài tập (Logbook)
            </h3>

            {logbook.length > 0 ? (
              <div className="space-y-3">
                {logbook.map((entry, idx) => (
                  <div key={idx} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="bg-gray-50 flex items-center p-3 border-b">
                      <Dumbbell className="w-4 h-4 text-gray-500 mr-2" />
                      <h4 className="font-bold text-gray-800 text-sm">{entry.exercise}</h4>
                      <span className="ml-auto text-xs font-bold text-gray-400 bg-white px-2 py-0.5 rounded-md border border-gray-100">
                        {entry.sets.length} SETS
                      </span>
                    </div>
                    <ul className="divide-y divide-gray-50">
                      {entry.sets.map((set, sIdx) => (
                        <li key={sIdx} className="flex justify-between items-center text-sm py-2 px-4 hover:bg-gray-50 transition-colors">
                          <span className="font-medium text-gray-400 text-xs uppercase w-16">Hiệp {sIdx + 1}</span>
                          <span className="flex-1 text-center font-bold text-gray-900">
                            {set.reps} <span className="text-gray-400 font-normal text-xs">reps</span>
                          </span>
                          <span className="flex-1 text-right font-bold text-blue-600">
                            {set.kg} <span className="text-gray-400 font-normal text-xs">kg</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center bg-white p-8 rounded-xl border border-dashed text-gray-500">
                <Dumbbell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="font-medium">Chưa có dữ liệu bài tập.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
