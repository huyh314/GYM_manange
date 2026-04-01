import React from 'react';

export default function MockupLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="dark">
      <body className="bg-[#121212] text-zinc-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
