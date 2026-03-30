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
          <Button variant="outline" className="flex items-center gap-2 font-bold rounded-2xl border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50">
            <QrCode size={20} />
            Check-in
          </Button>
        )}
      />
      <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl rounded-[2rem] p-0 overflow-hidden outline-none">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white text-center relative">
          <div className="absolute top-4 right-4">
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-inner">
            <ShieldCheck size={40} className="text-white" />
          </div>
          
          <DialogTitle className="text-2xl font-black tracking-tight mb-2 uppercase">Check-in Thẻ Hội Viên</DialogTitle>
          <DialogDescription className="text-indigo-100 font-medium">
            Quét mã tại quầy lễ tân để ghi nhận buổi tập
          </DialogDescription>
        </div>

        <div className="p-4 flex flex-col items-center bg-black/5">
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
            className="w-[80%] mt-4 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-lg shadow-indigo-100 mb-6"
          >
            ĐÃ HIỂU
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
