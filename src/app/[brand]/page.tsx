import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { dataRepository } from '@/lib/data-store';
import { HeroOfferBanner } from '@/components/HeroOfferBanner';
import { ProductCard } from '@/components/ProductCard';
import { 
  ArrowRight, 
  Sparkles, 
  Layers, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Phone, 
  MessageCircle, 
  Wrench, 
  ShoppingBag,
  Truck,
  ShieldCheck,
  ChevronRight,
  Fish,
  Flame,
  UtensilsCrossed,
  Eye,
  HeartHandshake,
  Award,
  Shield
} from 'lucide-react';
import { generateGeneralInquiryWhatsAppUrl } from '@/lib/whatsapp';
import { getPersistentBrandCatalog } from '@/lib/catalog-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface BrandHomePageProps {
  params: Promise<{ brand: string }>;
}

export default async function BrandHomePage({ params }: BrandHomePageProps) {
  const { brand: brandId } = await params;
  const catalogData = await getPersistentBrandCatalog(brandId);
  const { brand, categories, heroOfferItems, dailyStatuses, featuredProducts, specializedServices, allItems } = catalogData;

  if (!brand) {
    notFound();
  }

  const generalWhatsApp = generateGeneralInquiryWhatsAppUrl(brand);

  const getThemeHighlight = () => {
    switch (brand.id) {
      case 'aquarium':
        return {
          pillActive: 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 font-black shadow-md shadow-cyan-500/20',
          pillInactive: 'bg-white/80 dark:bg-[#041224] text-slate-700 dark:text-cyan-200/80 border-cyan-200 dark:border-cyan-900/60 hover:border-cyan-400 hover:text-cyan-950 dark:hover:text-white',
          sectionAccent: 'text-cyan-600 dark:text-cyan-400',
          cardBorder: 'border-cyan-200 dark:border-cyan-900/40',
          containerBg: 'bg-slate-50/50 dark:bg-[#020b14]',
          surfaceBg: 'bg-white/90 dark:bg-[#041224]/80 border-cyan-200 dark:border-cyan-900/50 shadow-sm',
          whyTitle: 'Why Choose SS Aquarium?',
          whySubtitle: 'Dedicated to ethical ornamental fish care and aquatic craftsmanship in Coimbatore',
          whyPoints: [
            { icon: <Fish className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />, title: 'Quarantined & Disease-Free', desc: 'Every specimen goes through rigorous observation before release.' },
            { icon: <Sparkles className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />, title: 'Custom Aquascaping', desc: 'Handcrafted hardscapes, driftwood, and tailored biological filtration designs.' },
            { icon: <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />, title: 'Safe Oxygen Packing', desc: 'Live fish packed with high-grade dissolved oxygen for zero transit stress.' },
          ]
        };
      case 'kirubai':
        return {
          pillActive: 'bg-gradient-to-r from-orange-600 to-amber-500 text-white dark:text-slate-950 font-black shadow-md shadow-orange-500/20',
          pillInactive: 'bg-white/80 dark:bg-[#180e08] text-slate-700 dark:text-amber-200/80 border-orange-200 dark:border-orange-900/60 hover:border-amber-400 hover:text-orange-950 dark:hover:text-white',
          sectionAccent: 'text-orange-600 dark:text-amber-400',
          cardBorder: 'border-orange-200 dark:border-orange-900/40',
          containerBg: 'bg-orange-50/30 dark:bg-[#100703]',
          surfaceBg: 'bg-white/90 dark:bg-[#1a0f09]/80 border-orange-200 dark:border-orange-900/50 shadow-sm',
          whyTitle: 'The Kirubai Food Promise',
          whySubtitle: 'Pure homestyle cooking with traditional South Indian recipes & natural ingredients',
          whyPoints: [
            { icon: <UtensilsCrossed className="w-5 h-5 text-orange-600 dark:text-amber-400" />, title: 'Cold-Pressed Oils Only', desc: 'Cooked with groundnut and sesame cold-pressed oils without artificial additives.' },
            { icon: <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />, title: 'Daily Small Batch Dum', desc: 'Seeraga Samba rice infused with freshly pounded spices on gentle wood dum.' },
            { icon: <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />, title: 'Hot & Hygienic Dispatch', desc: 'Food grade containers sealed immediately upon cooking to retain aroma.' },
          ]
        };
      case 'vision-360':
      default:
        return {
          pillActive: 'bg-blue-700 dark:bg-blue-600 text-white font-black shadow-md shadow-blue-500/20 font-mono',
          pillInactive: 'bg-white/80 dark:bg-[#081022] text-slate-700 dark:text-blue-200/80 border-blue-200 dark:border-blue-900/60 hover:border-blue-400 hover:text-blue-950 dark:hover:text-white',
          sectionAccent: 'text-blue-600 dark:text-blue-400',
          cardBorder: 'border-blue-200 dark:border-blue-900/40',
          containerBg: 'bg-slate-50/50 dark:bg-[#030610]',
          surfaceBg: 'bg-white/90 dark:bg-[#081226]/80 border-blue-200 dark:border-blue-900/50 shadow-sm',
          whyTitle: 'Why SS Vision 360 Security?',
          whySubtitle: 'Industrial-grade surveillance engineering and trusted Coimbatore technician coverage',
          whyPoints: [
            { icon: <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />, title: '2-Year Direct Warranty', desc: 'Hassle-free replacement guarantee on authorized CCTV hardware and DVR units.' },
            { icon: <Wrench className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />, title: 'Concealed Wiring & Setup', desc: 'Clean, tamper-resistant installation by trained on-site surveillance engineers.' },
            { icon: <Eye className="w-5 h-5 text-sky-600 dark:text-sky-400" />, title: 'Remote Mobile Live View', desc: 'Zero-lag mobile app streaming configured directly on your Android and iOS devices.' },
          ]
        };
    }
  };

  const theme = getThemeHighlight();

  return (
    <div className={`flex flex-col flex-1 ${theme.containerBg}`}>
      {/* 1. Dynamic Brand Hero Showcase with Daily Status & Fallback */}
      <HeroOfferBanner 
        brand={brand} 
        dailyStatuses={dailyStatuses}
        heroItems={heroOfferItems.length > 0 ? heroOfferItems : allItems.slice(0, 1)} 
      />


      {/* 2. Interactive Category Navigation Strip */}
      <section className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-100/80 dark:bg-slate-950/70 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <Layers className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
            <span>Browse Categories</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-thin">
            <Link
              href={`/${brand.id}/catalog`}
              className={`px-4 py-2 rounded-xl text-xs transition-all whitespace-nowrap ${theme.pillActive}`}
            >
              All Items ({allItems.length})
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/${brand.id}/catalog?category=${cat.id}`}
                className={`px-4 py-2 rounded-xl text-xs border transition-all whitespace-nowrap ${theme.pillInactive}`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. All Products & Storefront Catalog */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 w-full" id="all-products">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
              <span>Complete Catalog</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              All Products in <span className={theme.sectionAccent}>{brand.name}</span>
            </h2>
          </div>

          <Link
            href={`/${brand.id}/catalog`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-white group"
          >
            <span>Filter & Search Catalog</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {allItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {allItems.map((item) => (
              <ProductCard key={item.id} item={item} brand={brand} />
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
            <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto stroke-1" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">No products available right now</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Our inventory for {brand.name} is currently being refreshed. Please check back shortly or chat with us directly on WhatsApp!
            </p>
          </div>
        )}
      </section>

      {/* 4. Specialized Services Section (Setup, Maintenance, Fixing) */}
      {specializedServices.length > 0 && (
        <section className="bg-slate-100/90 dark:bg-slate-950/80 border-y border-slate-200 dark:border-slate-800/80 py-14 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  <Wrench className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>On-Site Expertise</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Technician & Setup <span className={theme.sectionAccent}>Services</span>
                </h2>
              </div>

              <a
                href={generalWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <span>Request Custom Service Consultation</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {specializedServices.map((service) => (
                <ProductCard key={service.id} item={service} brand={brand} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Why Choose Us Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {theme.whyTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {theme.whySubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {theme.whyPoints.map((pt, idx) => (
            <div key={idx} className={`p-6 rounded-3xl border ${theme.surfaceBg} space-y-3`}>
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 w-fit shadow-md">
                {pt.icon}
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{pt.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{pt.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Coimbatore Delivery & Location Strip */}
      <section className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/90 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-sm">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800/60">
              <Truck className="w-3.5 h-3.5" />
              <span>Doorstep Delivery & Fast Shop Pickup in Coimbatore</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Serving Coimbatore with Speed & Authenticity
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {brand.deliveryNote} Free delivery within ~{brand.freeDeliveryRadiusKm} km around our store. For orders outside the radius or special inquiries, chat directly with us on WhatsApp!
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-500 dark:text-red-400" />
                <span>{brand.address}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>{brand.openingTime} - {brand.closingTime}</span>
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3">
            <a
              href={`tel:${brand.phonePrimary}`}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 shadow-md transition-colors"
            >
              <Phone className="w-4 h-4 text-cyan-400" />
              <span>Call {brand.phonePrimary}</span>
            </a>
            <a
              href={generalWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>WhatsApp Direct Inquiry</span>
            </a>
            {brand.googleMapsUrl && (
              <a
                href={brand.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 transition-colors"
              >
                <MapPin className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                <span>Open in Google Maps</span>
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
