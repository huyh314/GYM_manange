'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ZaloMessageDialogProps {
  client: {
    id: string;
    name: string;
    zalo_id?: string;
  };
}

export default function ZaloMessageDialog({ client }: ZaloMessageDialogProps) {
  const [open, setOpen] = useState(false);
  const [template, setTemplate] = useState('custom');
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const templates = [
    { id: 'custom', label: 'Tin nhắn tùy chỉnh', body: '' },
    { id: 'session_reminder', label: 'Nhắc lịch tập', body: `🏋️ Nhắc lịch tập!\n\nBạn có buổi tập lúc [TIME] hôm nay.\n\nHẹn gặp tại phòng gym nhé! 💪` },
    { id: 'expiring_sessions', label: 'Cảnh báo hết buổi', body: `⚠️ Gói tập sắp hết!\n\nBạn còn [REMAINING] buổi tập.\n\nLiên hệ phòng gym để gia hạn sớm nhé!` }
  ];

  const handleTemplateChange = (val: string | null) => {
    if (!val) return;
    setTemplate(val);
    const selected = templates.find(t => t.id === val);
    if (selected) setMessageText(selected.body);
  };

  const handleSend = async () => {
    if (!client.zalo_id) {
      toast.error('Khách hàng chưa có Zalo ID. Vui lòng cập nhật hồ sơ.');
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-zalo-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          zaloId: client.zalo_id,
          type: template,
          data: {
            text: messageText,
            userId: client.id,
            ptName: 'Admin', // Static for manual send
            time: '18:00', // Placeholder
            remaining: '3' // Placeholder
          }
        })
      });

      const result = await res.json();
      if (result.error === 0) {
        toast.success('Đã gửi tin nhắn Zalo thành công!');
        setOpen(false);
      } else {
        toast.error(`Lỗi Zalo: ${result.message || 'Không xác định'}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi gọi dịch vụ gửi tin.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="outline" size="sm" className="flex items-center gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold">
          <MessageSquare className="w-4 h-4" /> Nhắn Zalo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-black text-xl">
            <MessageSquare className="text-indigo-600" /> Nhắn Zalo cho {client.name}
          </DialogTitle>
        </DialogHeader>

        {!client.zalo_id ? (
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3 items-start">
            <AlertCircle className="text-amber-600 w-5 h-5 shrink-0" />
            <div className="space-y-1">
               <p className="text-amber-800 text-sm font-bold">Thiếu Zalo ID</p>
               <p className="text-amber-700 text-xs font-medium">Bạn cần cập nhật Zalo ID trong hồ sơ học viên trước khi gửi tin nhắn.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Mẫu tin nhắn</label>
              <Select onValueChange={handleTemplateChange} defaultValue="custom">
                <SelectTrigger className="w-full rounded-xl border-gray-200 font-bold">
                  <SelectValue placeholder="Chọn mẫu tin nhắn" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-100">
                  {templates.map(t => (
                    <SelectItem key={t.id} value={t.id} className="font-medium">{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Nội dung</label>
              <Textarea
                className="min-h-[150px] rounded-2xl border-gray-200 font-medium leading-relaxed"
                placeholder="Nhập nội dung tin nhắn..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <p className="text-[10px] text-gray-400 italic">Lưu ý: Bạn có thể thay đổi các giá trị trong [ ] trước khi gửi.</p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold">Hủy</Button>
          <Button 
            disabled={!client.zalo_id || isSending} 
            onClick={handleSend}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95 px-8"
          >
            {isSending ? 'Đang gửi...' : <><Send className="w-4 h-4 mr-2" /> GỬI TIN</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
