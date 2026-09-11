'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BrandConfig, CatalogItem, DailyStatus } from '@/types';
import { 
  Sparkles, 
  ArrowRight, 
  Fish, 
  UtensilsCrossed, 
  ShieldCheck, 
  CheckCircle2, 
  ShoppingBag, 
  Phone, 
  MessageCircle,
  Truck,
  Shield,
  Eye,
  Award,
  Zap,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  Wrench,
  Radio,
  Tag
} from 'lucide-react';
import { generateGeneralInquiryWhatsAppUrl } from '@/lib/whatsapp';

interface HeroOfferBannerProps {
  brand: BrandConfig;
  dailyStatuses?: DailyStatus[];
  heroItems?: CatalogItem[];
}

export const HeroOfferBanner: React.FC<HeroOfferBannerProps> = ({ 
  brand, 
  dailyStatuses = [], 
  heroItems = [] 
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const whatsappUrl = generateGeneralInquiryWhatsAppUrl(brand);

  const hasDailyStatus = dailyStatuses.length > 0;

  // Auto-advance if multiple status slides exist
  useEffect(() => {
    if (dailyStatuses.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % dailyStatuses.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [dailyStatuses.length, isPaused]);

  const getStatusTypeBadge = (type: string) => {
    switch (type) {
      case 'NEW_ARRIVAL':
        return { label: 'New Arrival', icon: <Sparkles className="w-3.5 h-3.5" />, color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 dark:bg-cyan-950/80' };
      case 'TODAYS_SPECIAL':
        return { label: "Today's Special", icon: <Flame className="w-3.5 h-3.5" />, color: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 dark:bg-orange-950/80' };
      case 'SPECIAL_OFFER':
        return { label: 'Special Offer', icon: <Tag className="w-3.5 h-3.5" />, color: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 dark:bg-emerald-950/80' };
      case 'SERVICE_UPDATE':
        return { label: 'Service Update', icon: <Wrench className="w-3.5 h-3.5" />, color: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/40 dark:bg-blue-950/80' };
      case 'DELIVERY_UPDATE':
        return { label: 'Delivery Update', icon: <Truck className="w-3.5 h-3.5" />, color: 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/40 dark:bg-teal-950/80' };
      default:
        return { label: 'Daily Update', icon: <Radio className="w-3.5 h-3.5" />, color: 'bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/40 dark:bg-slate-900/80' };
    }
  };

  // =========================================================================
  // BRAND 1: SS AQUARIUM (Oceanic Gallery System)
  // =========================================================================
  if (brand.id === 'aquarium') {
    const activeStatus = hasDailyStatus ? dailyStatuses[currentSlide] : null;
    const badge = activeStatus ? getStatusTypeBadge(activeStatus.statusType) : null;

    return (
      <section 
        className="relative overflow-hidden aquatic-world-bg border-b border-cyan-200/40 dark:border-cyan-950/80 py-12 lg:py-20 transition-colors duration-300"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 z-10 text-left">
              {hasDailyStatus && activeStatus ? (
                /* DAILY STATUS ACTIVE */
                <>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${badge?.color}`}>
                      {badge?.icon}
                      <span>{badge?.label}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-cyan-300/80">
                      <Calendar className="w-3 h-3" />
                      <span>Today • {activeStatus.publishDate}</span>
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.08]">
                    {activeStatus.title}
                  </h1>

                  <p className="text-sm sm:text-base text-slate-700 dark:text-cyan-100/90 max-w-xl leading-relaxed font-normal">
                    {activeStatus.shortMessage}
                  </p>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link
                      href={activeStatus.ctaDestination || `/${brand.id}/catalog`}
                      className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white dark:text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-cyan-900/30 dark:shadow-cyan-950/60 flex items-center gap-2 transition-all transform active:scale-98"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{activeStatus.ctaLabel || 'Explore Selection'}</span>
                    </Link>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-3.5 rounded-xl bg-white/80 dark:bg-cyan-950/70 hover:bg-white dark:hover:bg-cyan-900/80 border border-cyan-300 dark:border-cyan-700/60 text-cyan-900 dark:text-cyan-200 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-500" />
                      <span>WhatsApp Aqua Expert</span>
                    </a>
                  </div>
                </>
              ) : (
                /* STATIC DEFAULT HERO (Intentional Fallback) */
                <>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-100/80 dark:bg-cyan-950/80 border border-cyan-300/80 dark:border-cyan-700/60 text-cyan-900 dark:text-cyan-300 text-xs font-bold shadow-inner">
                    <Fish className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    <span>Premium Aquatic Life & Custom Planted Aquascapes</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.08]">
                    Bring Living Waters Into Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-sky-500 to-teal-500 dark:from-cyan-400 dark:via-sky-300 dark:to-teal-300">Space.</span>
                  </h1>

                  <p className="text-sm sm:text-base text-slate-700 dark:text-cyan-100/80 max-w-xl leading-relaxed">
                    Hand-curated exotic freshwater fish, imported Japanese Koi, precision CO2 planted tank setups, and expert doorstep maintenance across Coimbatore.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link
                      href={`/${brand.id}/catalog`}
                      className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white dark:text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-cyan-900/30 dark:shadow-cyan-950/60 flex items-center gap-2 transition-all transform active:scale-98"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Browse Live Stock</span>
                    </Link>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-3.5 rounded-xl bg-white/80 dark:bg-cyan-950/70 hover:bg-white dark:hover:bg-cyan-900/80 border border-cyan-300 dark:border-cyan-700/60 text-cyan-900 dark:text-cyan-200 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-500" />
                      <span>Consult Aqua Specialist</span>
                    </a>
                  </div>
                </>
              )}

              {/* Perks Strip */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-cyan-200/60 dark:border-cyan-900/40 text-[11px] sm:text-xs text-slate-700 dark:text-cyan-200/90 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <span>Quarantine Verified</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Free ~2km Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                  <span>Custom Glass Builds</span>
                </div>
              </div>

              {/* Status Slide Controls if multiple */}
              {dailyStatuses.length > 1 && (
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev - 1 + dailyStatuses.length) % dailyStatuses.length)}
                    className="p-1.5 rounded-lg border border-cyan-300 dark:border-cyan-800 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-cyan-300 hover:scale-105"
                    aria-label="Previous daily status"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1.5">
                    {dailyStatuses.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-2 rounded-full transition-all ${
                          idx === currentSlide ? 'w-6 bg-cyan-500' : 'w-2 bg-cyan-300/50 dark:bg-cyan-800/50'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % dailyStatuses.length)}
                    className="p-1.5 rounded-lg border border-cyan-300 dark:border-cyan-800 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-cyan-300 hover:scale-105"
                    aria-label="Next daily status"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] text-slate-500 dark:text-cyan-400/70 font-mono">
                    {currentSlide + 1} / {dailyStatuses.length} Updates
                  </span>
                </div>
              )}
            </div>

            {/* Right Framed Imagery */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-cyan-300/80 dark:border-cyan-800/60 shadow-[0_20px_50px_rgba(2,11,20,0.15)] dark:shadow-[0_20px_50px_rgba(2,11,20,0.9)] group">
                <Image
                  src={
                    activeStatus?.imageUrl ||
                    'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=1000&q=80'
                  }
                  alt={activeStatus ? activeStatus.title : 'SS Aquarium Living Stock'}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                {/* Bottom Highlight Overlay Card */}
                <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-white/90 dark:bg-[#031427]/90 backdrop-blur-md border border-cyan-200 dark:border-cyan-700/50 flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-950 border border-cyan-300 dark:border-cyan-600 flex items-center justify-center text-cyan-700 dark:text-cyan-300 shrink-0">
                      <Fish className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {activeStatus ? activeStatus.title : 'Live Species In-Store'}
                      </p>
                      <p className="text-[10px] text-cyan-800 dark:text-cyan-300/80 truncate">
                        Discus, Goldfish, Plants & High-Flow Filters
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/${brand.id}/catalog`}
                    className="p-2 rounded-lg bg-cyan-600 dark:bg-cyan-500 hover:bg-cyan-500 text-white dark:text-slate-950 transition-colors shrink-0 ml-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // =========================================================================
  // BRAND 2: KIRUBAI CLOUD KITCHEN (Warm Culinary Experience)
  // =========================================================================
  if (brand.id === 'kirubai') {
    const activeStatus = hasDailyStatus ? dailyStatuses[currentSlide] : null;
    const badge = activeStatus ? getStatusTypeBadge(activeStatus.statusType) : null;

    return (
      <section 
        className="relative overflow-hidden culinary-world-bg border-b border-orange-200/40 dark:border-orange-950/80 py-12 lg:py-20 transition-colors duration-300"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 z-10 text-left">
              {hasDailyStatus && activeStatus ? (
                /* DAILY STATUS ACTIVE */
                <>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${badge?.color}`}>
                      {badge?.icon}
                      <span>{badge?.label}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-amber-300/80">
                      <Calendar className="w-3 h-3" />
                      <span>Today • {activeStatus.publishDate}</span>
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.08]">
                    {activeStatus.title}
                  </h1>

                  <p className="text-sm sm:text-base text-slate-700 dark:text-amber-100/90 max-w-xl leading-relaxed font-normal">
                    {activeStatus.shortMessage}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link
                      href={activeStatus.ctaDestination || `/${brand.id}/catalog`}
                      className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white dark:text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-orange-900/30 dark:shadow-orange-950/60 flex items-center gap-2 transition-all transform active:scale-98"
                    >
                      <UtensilsCrossed className="w-4 h-4" />
                      <span>{activeStatus.ctaLabel || 'Order Now'}</span>
                    </Link>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-3.5 rounded-xl bg-white/80 dark:bg-orange-950/70 hover:bg-white dark:hover:bg-orange-900/80 border border-orange-300 dark:border-orange-700/60 text-orange-900 dark:text-amber-200 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-500" />
                      <span>WhatsApp Quick Food Order</span>
                    </a>
                  </div>
                </>
              ) : (
                /* STATIC DEFAULT HERO */
                <>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 dark:bg-orange-950/80 border border-orange-300/80 dark:border-orange-700/60 text-orange-900 dark:text-amber-300 text-xs font-bold shadow-inner">
                    <UtensilsCrossed className="w-3.5 h-3.5 text-orange-600 dark:text-amber-400" />
                    <span>Authentic South Indian Homestyle Flavours • Cloud Kitchen</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.08]">
                    Hot, Fresh & Authentic. Cooked with <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-red-500 dark:from-amber-400 dark:via-orange-400 dark:to-red-400">Pure Tradition.</span>
                  </h1>

                  <p className="text-sm sm:text-base text-slate-700 dark:text-amber-100/80 max-w-xl leading-relaxed">
                    Aromatic Seeraga Samba Biryanis, crispy Dosas, Chettinad gravies, and fresh homestyle combos prepared daily for rapid takeaway and doorstep delivery across Coimbatore.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link
                      href={`/${brand.id}/catalog`}
                      className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white dark:text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-orange-900/30 dark:shadow-orange-950/60 flex items-center gap-2 transition-all transform active:scale-98"
                    >
                      <UtensilsCrossed className="w-4 h-4" />
                      <span>Order Now / Menu</span>
                    </Link>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-3.5 rounded-xl bg-white/80 dark:bg-orange-950/70 hover:bg-white dark:hover:bg-orange-900/80 border border-orange-300 dark:border-orange-700/60 text-orange-900 dark:text-amber-200 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-500" />
                      <span>WhatsApp Quick Order</span>
                    </a>
                  </div>
                </>
              )}

              {/* Perks Strip */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-orange-200/60 dark:border-orange-900/40 text-[11px] sm:text-xs text-slate-700 dark:text-amber-200/90 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 dark:text-amber-400 shrink-0" />
                  <span>100% Cold-Pressed Oils</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Fast ~2km Hot Dispatch</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-orange-400 shrink-0" />
                  <span>Party & Bulk Orders</span>
                </div>
              </div>

              {/* Status Slide Controls if multiple */}
              {dailyStatuses.length > 1 && (
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev - 1 + dailyStatuses.length) % dailyStatuses.length)}
                    className="p-1.5 rounded-lg border border-orange-300 dark:border-orange-800 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-amber-300 hover:scale-105"
                    aria-label="Previous food update"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1.5">
                    {dailyStatuses.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-2 rounded-full transition-all ${
                          idx === currentSlide ? 'w-6 bg-orange-500' : 'w-2 bg-orange-300/50 dark:bg-orange-800/50'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % dailyStatuses.length)}
                    className="p-1.5 rounded-lg border border-orange-300 dark:border-orange-800 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-amber-300 hover:scale-105"
                    aria-label="Next food update"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] text-slate-500 dark:text-amber-400/70 font-mono">
                    {currentSlide + 1} / {dailyStatuses.length} Kitchen Updates
                  </span>
                </div>
              )}
            </div>

            {/* Right Framed Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-orange-300/80 dark:border-orange-800/60 shadow-[0_20px_50px_rgba(12,7,4,0.15)] dark:shadow-[0_20px_50px_rgba(12,7,4,0.9)] group">
                <Image
                  src={
                    activeStatus?.imageUrl ||
                    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1000&q=80'
                  }
                  alt={activeStatus ? activeStatus.title : 'Kirubai Fresh Dishes'}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                {/* Bottom Highlight Card */}
                <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-white/90 dark:bg-[#180c05]/90 backdrop-blur-md border border-orange-200 dark:border-orange-700/50 flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950 border border-orange-300 dark:border-amber-600 flex items-center justify-center text-orange-700 dark:text-amber-300 shrink-0">
                      <UtensilsCrossed className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {activeStatus ? activeStatus.title : 'Daily Kitchen Dum Batch'}
                      </p>
                      <p className="text-[10px] text-orange-800 dark:text-amber-300/80 truncate">
                        Aromatic Biryani, Pepper Chicken & Parottas
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/${brand.id}/catalog`}
                    className="p-2 rounded-lg bg-orange-600 dark:bg-amber-500 hover:bg-orange-500 text-white dark:text-slate-950 transition-colors shrink-0 ml-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // =========================================================================
  // BRAND 3: SS VISION 360 (Precision Security Engineering)
  // =========================================================================
  const activeStatus = hasDailyStatus ? dailyStatuses[currentSlide] : null;
  const badge = activeStatus ? getStatusTypeBadge(activeStatus.statusType) : null;

  return (
    <section 
      className="relative overflow-hidden vision-world-bg border-b border-blue-200/40 dark:border-slate-900 py-12 lg:py-20 transition-colors duration-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-6 z-10 text-left">
            {hasDailyStatus && activeStatus ? (
              /* DAILY STATUS ACTIVE */
              <>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${badge?.color}`}>
                    {badge?.icon}
                    <span>{badge?.label}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-blue-300/80">
                    <Calendar className="w-3 h-3" />
                    <span>Today • {activeStatus.publishDate}</span>
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.08]">
                  {activeStatus.title}
                </h1>

                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 max-w-xl leading-relaxed font-normal">
                  {activeStatus.shortMessage}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href={activeStatus.ctaDestination || `/${brand.id}/catalog`}
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-blue-900/30 dark:shadow-blue-950/60 flex items-center gap-2 transition-all transform active:scale-98"
                  >
                    <Shield className="w-4 h-4" />
                    <span>{activeStatus.ctaLabel || 'View Packages'}</span>
                  </Link>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3.5 rounded-xl bg-white/80 dark:bg-blue-950/70 hover:bg-white dark:hover:bg-blue-900/80 border border-blue-300 dark:border-blue-700/60 text-blue-900 dark:text-blue-200 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-500" />
                    <span>Book Onsite Site Survey</span>
                  </a>
                </div>
              </>
            ) : (
              /* STATIC DEFAULT HERO */
              <>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-950/80 border border-blue-300/80 dark:border-blue-700/60 text-blue-900 dark:text-blue-300 text-xs font-bold shadow-inner">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Commercial & Residential CCTV Security Solutions</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.08]">
                  Total Surveillance Precision. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 dark:from-blue-400 dark:via-sky-300 dark:to-indigo-400">Zero Blind Spots.</span>
                </h1>

                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 max-w-xl leading-relaxed">
                  High-definition 4K ColorVu bullet & dome cameras, AI motion detection, NVR storage systems, and certified onsite installation & AMC maintenance across Coimbatore.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href={`/${brand.id}/catalog`}
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-blue-900/30 dark:shadow-blue-950/60 flex items-center gap-2 transition-all transform active:scale-98"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Explore Hardware & Kits</span>
                  </Link>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3.5 rounded-xl bg-white/80 dark:bg-blue-950/70 hover:bg-white dark:hover:bg-blue-900/80 border border-blue-300 dark:border-blue-700/60 text-blue-900 dark:text-blue-200 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-500" />
                    <span>Book Onsite Site Survey</span>
                  </a>
                </div>
              </>
            )}

            {/* Perks Strip */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-blue-200/60 dark:border-blue-900/40 text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 font-medium">
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>2-Yr OEM Warranty</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Free Onsite Survey</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                <span>Mobile Remote App</span>
              </div>
            </div>

            {/* Status Slide Controls if multiple */}
            {dailyStatuses.length > 1 && (
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + dailyStatuses.length) % dailyStatuses.length)}
                  className="p-1.5 rounded-lg border border-blue-300 dark:border-blue-800 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-blue-300 hover:scale-105"
                  aria-label="Previous security update"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5">
                  {dailyStatuses.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentSlide ? 'w-6 bg-blue-500' : 'w-2 bg-blue-300/50 dark:bg-blue-800/50'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % dailyStatuses.length)}
                  className="p-1.5 rounded-lg border border-blue-300 dark:border-blue-800 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-blue-300 hover:scale-105"
                  aria-label="Next security update"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="text-[11px] text-slate-500 dark:text-blue-400/70 font-mono">
                  {currentSlide + 1} / {dailyStatuses.length} Security Updates
                </span>
              </div>
            )}
          </div>

          {/* Right Security Hardware Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-blue-300/80 dark:border-blue-800/60 shadow-[0_20px_50px_rgba(4,7,17,0.15)] dark:shadow-[0_20px_50px_rgba(4,7,17,0.9)] group">
              <Image
                src={
                  activeStatus?.imageUrl ||
                  'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1000&q=80'
                }
                alt={activeStatus ? activeStatus.title : 'SS Vision 360 Security Hardware'}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

              {/* Bottom Highlight Card */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-white/90 dark:bg-[#091020]/90 backdrop-blur-md border border-blue-200 dark:border-blue-700/50 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 border border-blue-300 dark:border-blue-600 flex items-center justify-center text-blue-700 dark:text-blue-300 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {activeStatus ? activeStatus.title : '4K Security Packages'}
                    </p>
                    <p className="text-[10px] text-blue-800 dark:text-blue-300/80 truncate">
                      Cameras, DVR, Hard Disk & Onsite Wiring
                    </p>
                  </div>
                </div>
                <Link
                  href={`/${brand.id}/catalog`}
                  className="p-2 rounded-lg bg-blue-700 dark:bg-blue-600 hover:bg-blue-600 text-white transition-colors shrink-0 ml-2"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
