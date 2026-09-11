'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { BrandConfig } from '@/types';
import { useCartStore } from '@/lib/cart-store';
import { generateGeneralInquiryWhatsAppUrl } from '@/lib/whatsapp';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  ShoppingBag, 
  Menu, 
  X, 
  MessageCircle, 
  Clock, 
  MapPin, 
  Layers, 
  ChevronDown,
  ShieldCheck,
  UtensilsCrossed,
  Fish,
  Search,
  ArrowRight
} from 'lucide-react';
import { BRANDS } from '@/config/brands';
import { DEFAULT_BRAND_LOGOS } from '@/config/brand-logos';

interface BrandNavbarProps {
  brand: BrandConfig;
  onOpenCart?: () => void;
}

export const BrandNavbar: React.FC<BrandNavbarProps> = ({ brand, onOpenCart }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const itemCount = useCartStore((state) => state.getItemCount(brand.id));

  const navLinks = [
    { label: 'Storefront', href: `/${brand.id}` },
    { label: 'All Catalog', href: `/${brand.id}/catalog` },
    { label: 'Products', href: `/${brand.id}/catalog?type=PRODUCT` },
    { label: 'Services', href: `/${brand.id}/catalog?type=SERVICE` },
    { label: 'Location & Info', href: `/${brand.id}/contact` },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${brand.id}/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getBrandIcon = (id: string) => {
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

  const getThemeStyles = () => {
    switch (brand.id) {
      case 'aquarium':
        return {
          topBar: 'bg-cyan-950 text-cyan-200 border-cyan-900/60 dark:bg-[#010810] dark:border-cyan-950 dark:text-cyan-200/80',
          navBg: 'bg-white/90 border-cyan-200/80 text-slate-900 shadow-sm dark:bg-[#031427]/95 dark:border-cyan-900/50 dark:text-slate-100 dark:shadow-[0_10px_30px_rgba(2,11,20,0.8)]',
          activeLink: 'text-cyan-900 bg-cyan-100/90 border-cyan-300 font-bold dark:text-cyan-300 dark:bg-cyan-950/80 dark:border-cyan-700/60',
          badgeBg: 'bg-cyan-500 text-slate-950 font-black',
          cartBtn: 'bg-cyan-50 border-cyan-300 text-cyan-950 hover:bg-cyan-100 dark:bg-cyan-500/10 dark:border-cyan-500/40 dark:text-cyan-300 dark:hover:bg-cyan-500/20',
          searchBg: 'bg-slate-50 border-cyan-200 text-slate-900 focus-within:border-cyan-500 dark:bg-[#020b14] dark:border-cyan-900/60 dark:focus-within:border-cyan-400 dark:text-cyan-100',
          brandPill: 'bg-cyan-900/90 border-cyan-700 text-cyan-100 dark:bg-cyan-950/70 dark:border-cyan-800 dark:text-cyan-300',
        };
      case 'kirubai':
        return {
          topBar: 'bg-orange-950 text-amber-200 border-orange-900/60 dark:bg-[#080402] dark:border-orange-950 dark:text-amber-200/80',
          navBg: 'bg-white/90 border-orange-200/80 text-slate-900 shadow-sm dark:bg-[#180c05]/95 dark:border-orange-900/50 dark:text-slate-100 dark:shadow-[0_10px_30px_rgba(12,7,4,0.8)]',
          activeLink: 'text-orange-950 bg-orange-100/90 border-orange-300 font-bold dark:text-amber-300 dark:bg-orange-950/80 dark:border-orange-700/60',
          badgeBg: 'bg-amber-500 text-slate-950 font-black',
          cartBtn: 'bg-orange-50 border-orange-300 text-orange-950 hover:bg-orange-100 dark:bg-amber-500/10 dark:border-amber-500/40 dark:text-amber-300 dark:hover:bg-amber-500/20',
          searchBg: 'bg-slate-50 border-orange-200 text-slate-900 focus-within:border-orange-500 dark:bg-[#0c0704] dark:border-orange-900/60 dark:focus-within:border-amber-400 dark:text-amber-100',
          brandPill: 'bg-orange-900/90 border-orange-700 text-orange-100 dark:bg-orange-950/70 dark:border-orange-800 dark:text-amber-300',
        };
      case 'vision-360':
      default:
        return {
          topBar: 'bg-slate-950 text-slate-200 border-slate-900 dark:bg-[#020409] dark:border-slate-900 dark:text-slate-300',
          navBg: 'bg-white/90 border-slate-200/80 text-slate-900 shadow-sm dark:bg-[#091020]/95 dark:border-blue-900/50 dark:text-slate-100 dark:shadow-[0_10px_30px_rgba(4,7,17,0.8)]',
          activeLink: 'text-blue-950 bg-blue-100/90 border-blue-300 font-bold dark:text-blue-300 dark:bg-blue-950/80 dark:border-blue-700/60',
          badgeBg: 'bg-blue-600 text-white font-black',
          cartBtn: 'bg-blue-50 border-blue-300 text-blue-950 hover:bg-blue-100 dark:bg-blue-500/10 dark:border-blue-500/40 dark:text-blue-300 dark:hover:bg-blue-500/20',
          searchBg: 'bg-slate-50 border-slate-200 text-slate-900 focus-within:border-blue-500 dark:bg-[#040711] dark:border-blue-900/60 dark:focus-within:border-blue-400 dark:text-blue-100',
          brandPill: 'bg-blue-900/90 border-blue-700 text-blue-100 dark:bg-blue-950/70 dark:border-blue-800 dark:text-blue-300',
        };
    }
  };

  const theme = getThemeStyles();
  const whatsappUrl = generateGeneralInquiryWhatsAppUrl(brand);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md">
      {/* 1. Global Announcement / Multi-Brand Switcher Ribbon */}
      <div className={`w-full border-b text-[11px] sm:text-xs py-1.5 px-4 transition-colors ${theme.topBar}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
          {/* Brand Switcher Pill Dropdown */}
          <div className="relative">
            <button
              onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-all hover:opacity-90 ${theme.brandPill}`}
              aria-label="Switch between SS ventures"
            >
              {getBrandIcon(brand.id)}
              <span className="font-bold">{brand.name}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${brandDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {brandDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setBrandDropdownOpen(false)} 
                />
                <div className="absolute top-full left-0 mt-1.5 w-64 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    SS Multi-Brand Network
                  </div>
                  {Object.values(BRANDS).map((b) => (
                    <Link
                      key={b.id}
                      href={`/${b.id}`}
                      onClick={() => setBrandDropdownOpen(false)}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                        b.id === brand.id
                          ? 'bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white font-bold'
                          : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {getBrandIcon(b.id)}
                        <span>{b.name}</span>
                      </div>
                      {b.id === brand.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                    </Link>
                  ))}
                  <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      href="/"
                      onClick={() => setBrandDropdownOpen(false)}
                      className="flex items-center gap-1.5 p-2 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Platform Home (3 Doors)</span>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Perks / Delivery Info */}
          <div className="hidden md:flex items-center gap-4 text-xs opacity-90">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Coimbatore Free Delivery ~{brand.freeDeliveryRadiusKm}km</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>{brand.openingTime} - {brand.closingTime}</span>
            </span>
          </div>

          {/* Direct WhatsApp Quick Connect */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 font-bold transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-emerald-300" />
            <span className="hidden sm:inline">WhatsApp Help</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <nav className={`w-full border-b transition-colors ${theme.navBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* Brand Logo & Title */}
            <Link href={`/${brand.id}`} className="flex items-center gap-3 shrink-0 group">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-1 flex items-center justify-center overflow-hidden shadow-sm group-hover:border-slate-400 transition-colors">
                <Image
                  src={brand.logoUrl || DEFAULT_BRAND_LOGOS[brand.id] || ''}
                  alt={brand.name}
                  fill
                  sizes="48px"
                  className="object-contain p-1"
                />
              </div>
              <div>
                <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight block leading-tight">
                  {brand.name}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                  {brand.tagline}
                </span>
              </div>
            </Link>

            {/* Middle: Search Input (Desktop) */}
            <form onSubmit={handleSearchSubmit} className="hidden lg:flex flex-1 max-w-md mx-4">
              <div className={`flex items-center w-full rounded-xl border px-3 py-2 text-xs transition-all shadow-inner ${theme.searchBg}`}>
                <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${brand.name} items, specs, deals...`}
                  className="w-full bg-transparent border-none focus:outline-none placeholder-slate-400 text-xs"
                />
                {searchQuery && (
                  <button type="submit" className="text-slate-400 hover:text-slate-900 dark:hover:text-white ml-1">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? theme.activeLink
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-900/60'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Right Actions: Theme Toggle, Cart & Mobile Menu Toggle */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle Button */}
              <ThemeToggle brandId={brand.id} />

              {/* Cart Button */}
              <button
                onClick={onOpenCart ? onOpenCart : undefined}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all text-xs font-bold ${theme.cartBtn}`}
                aria-label={`View ${brand.name} Cart`}
                id="brand-navbar-cart-btn"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
                {itemCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${theme.badgeBg}`}>
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl p-4 space-y-4 shadow-xl">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className={`flex items-center w-full rounded-xl border px-3 py-2.5 text-xs ${theme.searchBg}`}>
                <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${brand.name}...`}
                  className="w-full bg-transparent border-none focus:outline-none placeholder-slate-400 text-xs"
                />
              </div>
            </form>

            <div className="grid grid-cols-1 gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${
                      isActive
                        ? theme.activeLink
                        : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-50" />
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2 text-xs">
              <Link
                href={`/${brand.id}/cart`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Review {brand.name} Cart</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-extrabold text-[10px]">
                  {itemCount} Items
                </span>
              </Link>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-600/20 border border-emerald-500/30 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-bold"
              >
                <MessageCircle className="w-4 h-4 fill-emerald-600 dark:fill-emerald-300 text-emerald-600 dark:text-emerald-300" />
                <span>Chat with {brand.name} on WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
