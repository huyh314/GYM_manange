'use client';

import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QrCode, X, ShieldCheck, User } from 'lucide-react';
import { DigitalMemberCard } from './DigitalMemberCard';

interface QRCheckInModalProps {
  user: {
    id: string;
    name: string;
    phone: string;
  };
  trigger?: React.ReactElement;
  tier?: 'normal' | 'vip' | 'premium';
}

export const QRCheckInModal: React.FC<QRCheckInModalProps> = ({ user, trigger, tier = 'vip' }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={trigger || (
          <Button variant="outline" className="flex items-center gap-2 font-bold rounded-2xl border-2 border-[#8c7442] text-[#8c7442] hover:bg-[#f0ece1]">
            <QrCode size={20} />
            Check-in
          </Button>
        )}
      />
      <DialogContent className="sm:max-w-md bg-[#1a1c1e] border border-[#2a2b2e] shadow-2xl rounded-[2rem] p-0 overflow-hidden outline-none">
        <div className="bg-gradient-to-br from-[#2a2b2e] to-[#121212] p-8 text-[#d4af37] text-center relative border-b border-[#d4af37]/10">
          <div className="absolute top-4 right-4">
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors text-zinc-500 hover:text-zinc-300"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="w-20 h-20 bg-[#1e1e1e] rounded-3xl flex items-center justify-center mx-auto mb-4 border border-[#d4af37]/30 shadow-inner">
            <ShieldCheck size={40} className="text-[#d4af37]" />
          </div>
          
          <DialogTitle className="text-2xl font-black tracking-tight mb-2 uppercase text-[#d4af37]">Check-in Thẻ Hội Viên</DialogTitle>
          <DialogDescription className="text-zinc-500 font-medium">
            Quét mã tại quầy lễ tân để ghi nhận buổi tập
          </DialogDescription>
        </div>

        <div className="p-4 flex flex-col items-center bg-black/20">
          <div className="scale-[0.85] -my-12">
            <DigitalMemberCard 
              user={{
                id: user.id,
                name: user.name,
                phone: user.phone,
                role: 'client'
              }}
              tier={tier}
            />
          </div>
          
          <Button 
            onClick={() => setIsOpen(false)}
            className="w-[80%] mt-4 h-12 rounded-2xl bg-[#d4af37] hover:bg-[#e5c56c] text-zinc-900 font-black text-lg shadow-lg shadow-[#d4af37]/10 mb-6"
          >
            ĐÃ HIỂU
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
