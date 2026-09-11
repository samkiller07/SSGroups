'use client';

import React, { useState } from 'react';
import { BrandConfig } from '@/types';
import { BrandNavbar } from './BrandNavbar';
import { BrandFooter } from './BrandFooter';
import { FloatingWhatsApp } from './FloatingWhatsApp';
import { BrandCartDrawer } from './BrandCartDrawer';

interface BrandLayoutClientProps {
  brand: BrandConfig;
  children: React.ReactNode;
}

export const BrandLayoutClient: React.FC<BrandLayoutClientProps> = ({ brand, children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const getBrandBackground = () => {
    switch (brand.id) {
      case 'aquarium':
        return 'aquatic-world-bg';
      case 'kirubai':
        return 'culinary-world-bg';
      case 'vision-360':
      default:
        return 'vision-world-bg';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${getBrandBackground()} text-slate-100`}>
      {/* Brand Navbar with Instant Cart Drawer Trigger */}
      <BrandNavbar brand={brand} onOpenCart={() => setIsCartOpen(true)} />

      {/* Main Brand Content */}
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>

      {/* Brand Isolated Slide-over Cart Drawer */}
      <BrandCartDrawer
        brand={brand}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      {/* Floating WhatsApp Action tailored to this brand */}
      <FloatingWhatsApp brand={brand} />

      {/* Brand Specific Footer */}
      <BrandFooter brand={brand} />
    </div>
  );
};
