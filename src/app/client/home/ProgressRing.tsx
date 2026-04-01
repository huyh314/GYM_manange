'use client';

import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

export function ProgressRing({ remaining, total }: { remaining: number; total: number }) {
  const used = total - remaining;
  const percentage = Math.round((remaining / total) * 100);
  
  // Decide color based on percentage remaining
  let fill = '#d4af37'; // gold primary
  if (percentage <= 50 && percentage > 20) fill = '#e5c56c'; // lighter gold
  if (percentage <= 20) fill = '#8c7442'; // dark gold

  const data = [
    {
      name: 'used',
      value: total,
      fill: '#2a2b2e', // dark background
    },
    {
      name: 'remaining',
      value: remaining,
      fill: fill,
    }
  ];

  return (
    <div className="relative w-48 h-48 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
          cx="50%" 
          cy="50%" 
          innerRadius="70%" 
          outerRadius="100%" 
          barSize={16} 
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar
            background
            dataKey="value"
            cornerRadius={10}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-zinc-100">{used} <span className="text-xl text-zinc-500 font-normal">/ {total}</span></span>
        <span className="text-xs text-zinc-500 font-medium tracking-wide mt-1 uppercase">ĐÃ DÙNG</span>
      </div>
    </div>
  );
}
