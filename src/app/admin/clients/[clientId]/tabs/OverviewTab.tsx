import { Card, CardContent } from "@/components/ui/card";
import { format } from 'date-fns';
import { BookOpen, Package } from 'lucide-react';

export default function OverviewTab({ user, packages }: { user: any, packages: any[] }) {
  const activePackage = packages?.find(p => p.status === 'active');
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Progress Card */}
        <Card className="border-0 shadow-sm rounded-2xl lg:col-span-1">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package size={20} className="text-emerald-500" /> Tiến độ hiện tại
            </h3>
            {activePackage ? (
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-3xl font-black text-emerald-600">
                    {activePackage.total_sessions - activePackage.remaining_sessions} 
                    <span className="text-lg text-gray-400 font-medium"> / {activePackage.total_sessions}</span>
                  </span>
                </div>
                
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div 
                    className="bg-emerald-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${((activePackage.total_sessions - activePackage.remaining_sessions) / activePackage.total_sessions) * 100}%` }}
                  ></div>
                </div>
                
                <p className="text-sm font-semibold text-gray-600">
                   Gói: <span className="text-gray-900">{activePackage.package?.name}</span>
                </p>
                <p className="text-sm font-semibold text-gray-600">
                   Còn lại: <span className="text-emerald-600">{activePackage.remaining_sessions} buổi</span>
                </p>
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-xl text-center">
                Không có gói tập đang hoạt động
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes Card */}
        <Card className="border-0 shadow-sm rounded-2xl lg:col-span-2">
          <CardContent className="p-6 h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-violet-500" /> Ghi chú từ HLV
            </h3>
            <div className="bg-amber-50 rounded-xl p-4 flex-1 border border-amber-100 text-sm text-amber-900 leading-relaxed font-medium">
              {user.notes ? (
                <p className="whitespace-pre-wrap">{user.notes}</p>
              ) : (
                <p className="italic text-amber-900/50">Chưa có ghi chú nào về học viên này...</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Package History */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">Lịch sử mua gói</h3>
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b font-medium">
                  <tr>
                    <th className="px-6 py-4 font-bold text-gray-700">Ngày mua</th>
                    <th className="px-6 py-4 font-bold text-gray-700">Tên gói</th>
                    <th className="px-6 py-4 font-bold text-center text-gray-700">Thời lượng</th>
                    <th className="px-6 py-4 font-bold text-center text-gray-700">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {packages?.length > 0 ? packages.map((pkg) => (
                    <tr key={pkg.id} className="border-b last:border-0 hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-3 font-semibold text-gray-600">
                        {format(new Date(pkg.created_at), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-3 font-bold text-gray-800">
                        {pkg.package?.name}
                      </td>
                      <td className="px-6 py-3 text-center font-bold text-gray-600">
                        {pkg.total_sessions} buổi
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold w-20
                           ${pkg.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                             pkg.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                           {pkg.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="p-8 text-center text-gray-400">Chưa mua gói nào</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
