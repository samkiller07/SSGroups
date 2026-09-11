'use client';

import React from 'react';
import { BrandConfig } from '@/types';
import { generateGeneralInquiryWhatsAppUrl } from '@/lib/whatsapp';
import { MessageCircle } from 'lucide-react';

interface FloatingWhatsAppProps {
  brand: BrandConfig;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ brand }) => {
  const whatsappUrl = generateGeneralInquiryWhatsAppUrl(brand);

  return (
    <aside aria-label="WhatsApp quick chat" className="fixed bottom-5 right-5 z-40 flex items-center group">
      <div className="hidden sm:block mr-2 px-3 py-1.5 rounded-xl bg-slate-900/95 border border-emerald-500/40 text-emerald-300 text-xs font-medium shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        Chat with {brand.name} ({brand.whatsappNumber})
      </div>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-2xl shadow-emerald-950/60 transition-transform transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
        aria-label={`Chat directly with ${brand.name} on WhatsApp`}
        id="floating-brand-whatsapp"
      >
        <div className="relative">
          <MessageCircle className="w-7 h-7 text-slate-950" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-emerald-500 status-pulse-dot" />
        </div>
      </a>
    </aside>
  );
};
