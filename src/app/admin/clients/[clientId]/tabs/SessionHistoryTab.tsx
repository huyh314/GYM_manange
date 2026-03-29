import { Card, CardContent } from "@/components/ui/card";
import { format } from 'date-fns';
import { Clock, User } from 'lucide-react';
import { vi } from 'date-fns/locale';

interface SessionRow {
  id: string;
  checked_in_at: string;
  pt?: { name: string };
  status: string;
  logbook: any;
  pt_notes?: string;
}

export default function SessionHistoryTab({ sessions }: { sessions: SessionRow[] }) {
  if (!sessions || sessions.length === 0) {
    return (
      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden mt-6">
        <CardContent className="p-0 h-[300px] flex flex-col items-center justify-center text-gray-400">
          <Clock className="w-8 h-8 opacity-20 mb-2" />
          <p className="text-sm font-medium">Chưa có lịch sử tập luyện</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <Clock size={20} className="text-blue-500" /> Các buổi đã hoàn thành
      </h3>
      <div className="space-y-4">
        {sessions.map((session) => (
          <Card key={session.id} className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                   <p className="text-base font-bold text-gray-900">
                     {format(new Date(session.checked_in_at), "EEEE, dd 'tháng' MM yyyy — HH:mm", { locale: vi })}
                   </p>
                   <p className="text-sm text-gray-500 flex items-center font-medium mt-1">
                     <User size={14} className="mr-1 inline text-gray-400" />
                     Bởi HLV: <span className="text-gray-900 ml-1">{session.pt?.name || 'N/A'}</span>
                   </p>
                </div>
                <div>
                   <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                     Hoàn thành
                   </span>
                </div>
              </div>

              {/* Logbook Area */}
              <div className="p-5 bg-gray-50/50">
                <h4 className="text-sm font-bold text-gray-700 mb-3">Nhật ký tập luyện (Logbook)</h4>
                {session.logbook && session.logbook.length > 0 ? (
                  <div className="space-y-2">
                    {session.logbook.map((exercise: any, idx: number) => (
                      <div key={idx} className="bg-white border rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
                         <p className="font-bold text-gray-800">{exercise.exerciseName}</p>
                         <p className="font-medium text-gray-600 font-mono text-sm bg-gray-50 px-2 py-1 rounded-lg">
                           {exercise.sets} sets — {exercise.details}
                         </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm italic text-gray-400">Không có dữ liệu logbook.</p>
                )}

                {session.pt_notes && (
                  <div className="mt-4 bg-amber-50/50 border border-amber-100 rounded-xl p-3">
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Ghi chú thêm</p>
                    <p className="text-sm text-amber-900 font-medium">{session.pt_notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
