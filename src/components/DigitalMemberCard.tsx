'use client';

import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Crown, Star, Sparkles, Gem } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { Button } from './ui/button';
import { QNLogo } from './QNLogo';
import { cn } from '@/lib/utils';

export type MembershipTier = 'normal' | 'vip' | 'premium';

interface DigitalMemberCardProps {
  user: {
    id: string;
    name: string;
    phone: string;
    role: string;
  };
  tier?: MembershipTier;
  // Legacy prop support
  isVip?: boolean;
}

// =============================================
// NORMAL CARD - Slate Blue with geometric lines
// =============================================
const NormalCard: React.FC<{ user: DigitalMemberCardProps['user'] }> = ({ user }) => {
  return (
    <div
      className="relative w-[340px] h-[210px] rounded-2xl overflow-hidden text-white flex flex-col justify-between p-6 border border-[#6b705c]/30 transition-all hover:scale-[1.02] duration-500 group"
      style={{
        background: 'linear-gradient(135deg, #6b705c 0%, #4a4e3e 40%, #2f3228 100%)',
      }}
    >
      {/* Geometric line pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage: `
            linear-gradient(30deg, transparent 40%, rgba(255,255,255,0.08) 41%, rgba(255,255,255,0.08) 42%, transparent 43%),
            linear-gradient(150deg, transparent 40%, rgba(255,255,255,0.05) 41%, rgba(255,255,255,0.05) 42%, transparent 43%),
            linear-gradient(-30deg, transparent 55%, rgba(255,255,255,0.04) 56%, rgba(255,255,255,0.04) 57%, transparent 58%),
            linear-gradient(60deg, transparent 65%, rgba(255,255,255,0.06) 66%, rgba(255,255,255,0.06) 67%, transparent 68%)
          `,
          backgroundSize: '100% 100%',
        }}
      />

      {/* Shimmer on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 55%, transparent 60%)',
          transform: 'translateX(-100%)',
          animation: 'shimmerSlide 2s ease-in-out forwards',
        }}
      />

      {/* Top row: Logo + Badge */}
      <div className="flex justify-between items-start z-10">
        <div className="flex items-center gap-2">
          <QNLogo className="w-9 h-9" color="silver" />
          <div className="flex flex-col">
            <span className="text-xs font-black tracking-[0.15em] leading-none text-slate-100">QN PRIVATE</span>
            <span className="text-[8px] font-bold text-slate-300 tracking-[0.25em] leading-none mt-0.5">FITNESS</span>
          </div>
        </div>
        <div className="px-2.5 py-1 text-[8px] font-black tracking-widest rounded-full border border-slate-300/30 bg-white/10 backdrop-blur-md text-slate-200 flex items-center gap-1.5">
          <Star size={10} className="text-slate-300" />
          NORMAL TIER
        </div>
      </div>

      {/* Bottom row: User info + QR */}
      <div className="flex justify-between items-end z-10">
        <div className="flex flex-col gap-1">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Member:</p>
          <h2 className="text-lg font-black tracking-tight uppercase leading-none truncate max-w-[180px]">{user.name}</h2>
          <p className="text-[10px] font-mono text-slate-300 mt-1">
            {user.phone}
          </p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="p-1.5 bg-white rounded-lg shadow-lg">
            <QRCodeCanvas
              id={`qr-canvas-${user.id}`}
              value={user.id}
              size={64}
              level="H"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#2f3228"
              imageSettings={{
                src: "/favicon.ico",
                height: 16,
                width: 16,
                excavate: true,
              }}
            />
          </div>
          <span className="text-[7px] font-bold tracking-widest text-slate-400 uppercase">Scan for access</span>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-slate-300/30 to-transparent" />
    </div>
  );
};

// =============================================
// VIP CARD - Classic Matte Black with Gold
// =============================================
const VipCard: React.FC<{ user: DigitalMemberCardProps['user'] }> = ({ user }) => {
  return (
    <div
      className="relative w-[340px] h-[540px] rounded-[2rem] overflow-hidden text-white flex flex-col items-center justify-between p-8 border-2 border-yellow-600/20 transition-all hover:scale-[1.02] duration-500 group"
      style={{
        background: 'linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 50%, #1a1a1a 100%)',
        boxShadow: '0 0 40px rgba(234,179,8,0.08), 0 20px 60px rgba(0,0,0,0.5)',
      }}
    >
      {/* Subtle matte texture */}
      <div className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 80%)',
        }}
      />

      {/* Gold shimmer on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1500 pointer-events-none"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(234,179,8,0.05) 45%, rgba(234,179,8,0.12) 50%, rgba(234,179,8,0.05) 55%, transparent 60%)',
          transform: 'translateX(-150%)',
          animation: 'shimmerSlide 2.5s ease-in-out forwards',
        }}
      />

      {/* Ornate gold corner decorations */}
      <div className="absolute top-4 left-4 w-12 h-12 pointer-events-none opacity-40"
        style={{
          borderTop: '2px solid #d4a843',
          borderLeft: '2px solid #d4a843',
          borderTopLeftRadius: '8px',
        }}
      />
      <div className="absolute top-4 right-4 w-12 h-12 pointer-events-none opacity-40"
        style={{
          borderTop: '2px solid #d4a843',
          borderRight: '2px solid #d4a843',
          borderTopRightRadius: '8px',
        }}
      />
      <div className="absolute bottom-4 left-4 w-12 h-12 pointer-events-none opacity-40"
        style={{
          borderBottom: '2px solid #d4a843',
          borderLeft: '2px solid #d4a843',
          borderBottomLeftRadius: '8px',
        }}
      />
      <div className="absolute bottom-4 right-4 w-12 h-12 pointer-events-none opacity-40"
        style={{
          borderBottom: '2px solid #d4a843',
          borderRight: '2px solid #d4a843',
          borderBottomRightRadius: '8px',
        }}
      />

      {/* Large QN Logo */}
      <div className="flex flex-col items-center z-10 mt-4">
        <QNLogo className="w-24 h-24" color="gold" />
        <span className="text-[10px] font-bold tracking-[0.4em] mt-2"
          style={{ color: '#d4a843' }}
        >
          QN PRIVATE FITNESS
        </span>
      </div>

      {/* VIP Badge */}
      <div className="flex flex-col items-center z-10 -mt-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-yellow-600/60" />
          <span className="text-4xl font-black tracking-[0.15em]"
            style={{
              background: 'linear-gradient(180deg, #fde68a 0%, #d4a843 50%, #b8860b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 4px rgba(184,134,11,0.3))',
            }}
          >
            VIP
          </span>
          <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-yellow-600/60" />
        </div>
      </div>

      {/* Member Info */}
      <div className="flex flex-col items-center z-10 space-y-3 w-full">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: '#d4a843' }}>
          Member Name:
        </p>
        <h2 className="text-xl font-black tracking-wide uppercase text-center leading-tight truncate w-full px-4"
          style={{ color: '#f5e6c8' }}
        >
          {user.name}
        </h2>
        <p className="text-[10px] font-mono tracking-widest text-gray-500">
          Valid: {new Date().getFullYear()}/{(new Date().getMonth() + 1).toString().padStart(2, '0')}
        </p>
      </div>

      {/* Gold QR Code */}
      <div className="flex flex-col items-center z-10 mb-2">
        <div className="p-1 rounded-xl"
          style={{ 
            background: 'linear-gradient(135deg, #d4a843 0%, #b8860b 50%, #d4a843 100%)',
            boxShadow: '0 0 20px rgba(234,179,8,0.15)',
          }}
        >
          <div className="p-3 rounded-[10px]" style={{ background: '#0d0d0d' }}>
            <QRCodeCanvas
              id={`qr-canvas-${user.id}`}
              value={user.id}
              size={80}
              level="H"
              includeMargin={false}
              bgColor="#0d0d0d"
              fgColor="#d4a843"
              imageSettings={{
                src: "/favicon.ico",
                height: 20,
                width: 20,
                excavate: true,
              }}
            />
          </div>
        </div>
      </div>

      {/* Gold accent line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-600/30 to-transparent" />
    </div>
  );
};

// =============================================
// PREMIUM CARD - Platinum/Silver Brushed Metal with Diamond + QR
// =============================================
const PremiumCard: React.FC<{ user: DigitalMemberCardProps['user'] }> = ({ user }) => {
  return (
    <div
      className="relative w-[340px] h-[540px] rounded-[2rem] overflow-hidden flex flex-col items-center justify-between p-8 border-2 border-gray-300/40 transition-all hover:scale-[1.02] duration-500 group"
      style={{
        background: 'linear-gradient(160deg, #e8e8e8 0%, #d1d1d1 25%, #bfbfbf 50%, #d1d1d1 75%, #e0e0e0 100%)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.1)',
      }}
    >
      {/* Brushed metal texture */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 1px,
            rgba(255,255,255,0.3) 1px,
            rgba(255,255,255,0.3) 2px
          )`,
          backgroundSize: '3px 100%',
        }}
      />

      {/* Subtle light reflection */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.5) 0%, transparent 60%)',
        }}
      />

      {/* Silver shimmer on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"
        style={{
          background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.4) 55%, transparent 65%)',
          transform: 'translateX(-150%)',
          animation: 'shimmerSlide 2s ease-in-out forwards',
        }}
      />

      {/* "PREMIUM MEMBER" top label */}
      <div className="z-10 mt-2">
        <span className="text-[10px] font-bold tracking-[0.35em] uppercase"
          style={{ color: '#555' }}
        >
          PREMIUM MEMBER
        </span>
      </div>

      {/* Large QN Logo */}
      <div className="flex flex-col items-center z-10 -mt-2">
        <QNLogo className="w-28 h-28" color="#333" />
        <div className="flex flex-col items-center mt-1">
          <span className="text-[11px] font-bold tracking-[0.3em] text-gray-600">PRIVATE FITNESS</span>
        </div>
      </div>

      {/* Diamond Icon */}
      <div className="z-10 -mt-4 flex flex-col items-center">
        <div className="w-16 h-16 flex items-center justify-center rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(200,200,210,0.6) 0%, transparent 70%)',
          }}
        >
          <Gem size={32} style={{ color: '#666', strokeWidth: 1.5 }} />
        </div>
      </div>

      {/* PREMIUM MEMBER text */}
      <div className="flex flex-col items-center z-10 -mt-2 space-y-1">
        <h2 className="text-3xl font-black tracking-[0.08em] uppercase"
          style={{ color: '#333' }}
        >
          PREMIUM
        </h2>
        <p className="text-sm font-bold tracking-[0.25em] uppercase"
          style={{ color: '#666' }}
        >
          MEMBER
        </p>
      </div>

      {/* User Info + QR */}
      <div className="flex flex-col items-center z-10 space-y-3 w-full">
        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gray-400 to-transparent" />
        
        <p className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: '#888' }}>
          Valid Thru: 12/{new Date().getFullYear().toString().slice(-2)}
        </p>

        <h2 className="text-lg font-black tracking-wide uppercase text-center leading-tight truncate w-full px-4"
          style={{ color: '#333' }}
        >
          {user.name}
        </h2>

        <p className="text-[10px] font-mono tracking-widest" style={{ color: '#888' }}>
          ID: {user.phone}
        </p>

        {/* QR Code for Premium */}
        <div className="p-1 rounded-xl mt-1"
          style={{
            background: 'linear-gradient(135deg, #999 0%, #bbb 50%, #999 100%)',
          }}
        >
          <div className="p-2.5 rounded-[10px] bg-white">
            <QRCodeCanvas
              id={`qr-canvas-${user.id}`}
              value={user.id}
              size={72}
              level="H"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#333333"
              imageSettings={{
                src: "/favicon.ico",
                height: 18,
                width: 18,
                excavate: true,
              }}
            />
          </div>
        </div>
        <span className="text-[7px] font-bold tracking-[0.2em] uppercase" style={{ color: '#999' }}>
          QUÉT ĐỂ ĐIỂM DANH
        </span>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gray-400/40 to-transparent" />
    </div>
  );
};

// =============================================
// MAIN EXPORTED COMPONENT
// =============================================
export const DigitalMemberCard: React.FC<DigitalMemberCardProps> = ({ user, tier: tierProp, isVip }) => {
  // Support legacy isVip prop
  const tier: MembershipTier = tierProp || (isVip ? 'vip' : 'normal');
  const cardRef = useRef<HTMLDivElement>(null);

  const downloadCard = async () => {
    if (!cardRef.current) return;
    
    try {
      // Small delay to ensure QR and images are ready if needed
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff', // Clean background for the image
        style: {
          borderRadius: '0', // Ensure card shape is clean
        }
      });
      
      const link = document.createElement('a');
      link.download = `TheGymQN_${tier.toUpperCase()}_${user.name.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Lỗi khi tải ảnh thẻ:', err);
    }
  };

  return (
    <div className="flex flex-col items-center overflow-visible">
      <div ref={cardRef} className="rounded-[2rem] overflow-hidden shadow-2xl">
        {/* Render the specific tier card */}
        {tier === 'normal' && <NormalCard user={user} />}
        {tier === 'vip' && <VipCard user={user} />}
        {tier === 'premium' && <PremiumCard user={user} />}
      </div>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes shimmerSlide {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(150%); }
        }
      `}</style>

      <div className="flex gap-3 mt-8 no-export">
        <Button 
          onClick={downloadCard} 
          className="px-8 py-5 h-auto rounded-2xl font-bold text-zinc-700 bg-white hover:bg-zinc-50 border-2 border-zinc-200 shadow-sm transition-all hover:scale-105" 
          variant="outline"
        >
          <Download className="w-5 h-5 mr-3 text-[#8c7442]" />
          Tải Thẻ Học Viên (PNG)
        </Button>
      </div>
    </div>
  );
};
