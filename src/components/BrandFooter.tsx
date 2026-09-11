import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BrandConfig } from '@/types';
import { BRANDS } from '@/config/brands';
import { DEFAULT_BRAND_LOGOS } from '@/config/brand-logos';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  Phone, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Fish, 
  UtensilsCrossed, 
  Lock,
  Truck,
  Layers,
  ArrowRight
} from 'lucide-react';
import { InstagramIcon } from '@/components/InstagramIcon';

interface BrandFooterProps {
  brand: BrandConfig;
}

export const BrandFooter: React.FC<BrandFooterProps> = ({ brand }) => {
  const getSisterIcon = (id: string) => {
    switch (id) {
      case 'aquarium':
        return <Fish className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
      case 'kirubai':
        return <UtensilsCrossed className="w-4 h-4 text-orange-600 dark:text-amber-400" />;
      case 'vision-360':
        return <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <Layers className="w-4 h-4 text-slate-500 dark:text-slate-400" />;
    }
  };

  return (
    <footer className="w-full bg-slate-50 dark:bg-[#01060e] border-t border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Identity & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 flex items-center justify-center overflow-hidden shadow-sm">
                <Image
                  src={brand.logoUrl || DEFAULT_BRAND_LOGOS[brand.id] || ''}
                  alt={`${brand.name} Logo`}
                  fill
                  sizes="40px"
                  className="object-contain p-0.5"
                />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-950 dark:text-white tracking-tight leading-tight">
                  {brand.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Coimbatore Business Division</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {brand.tagline}. Dedicated to customer satisfaction, authentic quality products, and trusted service across Coimbatore.
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
              <Truck className="w-4 h-4 shrink-0" />
              <span>Free delivery within ~{brand.freeDeliveryRadiusKm}km of store</span>
            </div>
          </div>

          {/* Location & Working Hours */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Store & Operations
            </h4>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{brand.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Hours: {brand.openingTime} - {brand.closingTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Direct Line: {brand.whatsappNumber}</span>
              </div>
            </div>

            {brand.instagramUrl && (
              <a
                href={brand.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors pt-1"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>Follow on Instagram</span>
              </a>
            )}
          </div>

          {/* Fast Navigation */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Quick Catalog Links
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link href={`/${brand.id}`} className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  Storefront Home
                </Link>
              </li>
              <li>
                <Link href={`/${brand.id}/catalog`} className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  Full Catalog & Inventory
                </Link>
              </li>
              <li>
                <Link href={`/${brand.id}/catalog?type=PRODUCT`} className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  Products / Live Items
                </Link>
              </li>
              <li>
                <Link href={`/${brand.id}/catalog?type=SERVICE`} className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  Specialized Services
                </Link>
              </li>
              <li>
                <Link href={`/${brand.id}/cart`} className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  Review Cart & WhatsApp Checkout
                </Link>
              </li>
            </ul>
          </div>

          {/* Sister Ventures in Group */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              SS Venture Group
            </h4>
            <div className="space-y-2">
              {Object.values(BRANDS).map((b) => (
                <Link
                  key={b.id}
                  href={`/${b.id}`}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs border transition-all ${
                    b.id === brand.id
                      ? 'bg-slate-200 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-950 dark:text-white font-bold'
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {getSisterIcon(b.id)}
                    <span>{b.name}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Platform Credit & Admin Link */}
        <div className="pt-8 mt-8 border-t border-slate-200 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SS Multi-Brand Platform. All rights reserved across Coimbatore.</p>
          <div className="flex items-center gap-4">
            <ThemeToggle brandId={brand.id} />
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Platform Switcher
            </Link>
            <Link href="/admin" className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Admin Studio</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
