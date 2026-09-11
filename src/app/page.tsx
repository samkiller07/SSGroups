import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BRANDS } from '@/config/brands';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  Fish, 
  UtensilsCrossed, 
  ShieldCheck, 
  ArrowRight, 
  MessageCircle, 
  Sparkles, 
  Lock,
  CheckCircle2,
  Truck,
  Layers
} from 'lucide-react';

export default function PlatformHomePage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#020b14] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 transition-colors duration-300">
      {/* Top Utility Ribbon */}
      <div className="w-full bg-slate-100 dark:bg-[#010810] border-b border-slate-200 dark:border-slate-900 px-4 py-2 text-xs text-slate-600 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-800 dark:text-slate-300 font-semibold">
              Coimbatore Multi-Brand Commerce & Dedicated Service Network
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="hidden sm:inline text-slate-600 dark:text-slate-400">
              Doorstep Delivery (~2km Free) • Verified WhatsApp Ordering
            </span>
            <ThemeToggle />
            <Link 
              href="/admin" 
              className="flex items-center gap-1.5 text-slate-700 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 font-semibold transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Studio</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Hero Header */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-slate-200 dark:border-slate-900 bg-gradient-to-b from-white to-slate-50 dark:from-[#030e1c] dark:to-[#020b14]">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-750 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-md">
            <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>One Multi-Brand Engine • Three Specialized Coimbatore Ventures</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-950 dark:text-white max-w-5xl mx-auto leading-[1.08]">
            Three Specialized Worlds. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-amber-500 to-blue-600 dark:from-cyan-400 dark:via-amber-300 dark:to-blue-500">
              One Trusted Commerce Hub.
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-700 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Welcome to the SS Multi-Brand Platform. Select a dedicated storefront below to explore live exotic aquatic species, order authentic South Indian culinary specials, or book certified CCTV surveillance installations.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Independent Catalogs & Carts</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Coimbatore Free Delivery (~2km)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Instant WhatsApp Ordering</span>
            </span>
          </div>
        </div>
      </section>

      {/* THREE DOORS INTO THREE WORLDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 flex-1 w-full space-y-12">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
            Step Into a Business World
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Each venture features bespoke art direction, live inventory, tailored unit pricing, daily hero updates, and dedicated customer support.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* =========================================================================
              DOOR 1: SS AQUARIUM (Deep Oceanic World)
             ========================================================================= */}
          <div className="rounded-3xl border border-cyan-200 dark:border-cyan-800/60 bg-gradient-to-b from-white to-cyan-50/50 dark:from-[#06182e] dark:to-[#020b14] p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_20px_50px_rgba(6,182,212,0.15)] dark:hover:shadow-[0_20px_50px_rgba(6,182,212,0.25)] hover:-translate-y-2 group shadow-sm">
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-700/60 shadow-inner">
                  <Fish className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-900 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-600/60">
                  Aquatic Gallery
                </span>
              </div>

              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-950 border border-cyan-200 dark:border-cyan-900/60 shadow-lg">
                <Image
                  src="https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80"
                  alt="SS Aquarium Living Stock"
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <p className="text-[11px] font-bold text-cyan-300">Coimbatore Aquatic Specialist</p>
                  <h3 className="text-xl font-black text-white">SS Aquarium</h3>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-700 dark:text-cyan-100/80 leading-relaxed">
                  Exotic freshwater fish, imported Japanese Koi, Discus pairs, planted aquarium plants, CO2 systems, and custom tank maintenance.
                </p>

                <div className="pt-2 border-t border-cyan-200 dark:border-cyan-900/40 space-y-1.5 text-xs text-slate-700 dark:text-cyan-200/90 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    <span>Live Stock Guarantee & Health Quarantine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Oxygen-Packed Safe Delivery (~2km Free)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span>Custom Aquascaping & Onsite Setup</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-cyan-200 dark:border-cyan-900/40 space-y-2">
              <Link
                href="/aquarium"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white dark:text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20 dark:shadow-cyan-950/60 transition-all transform active:scale-98"
              >
                <span>Enter SS Aquarium World</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* =========================================================================
              DOOR 2: KIRUBAI CLOUD KITCHEN (Warm Culinary World)
             ========================================================================= */}
          <div className="rounded-3xl border border-orange-200 dark:border-orange-800/60 bg-gradient-to-b from-white to-orange-50/50 dark:from-[#241106] dark:to-[#0c0704] p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_20px_50px_rgba(234,88,12,0.15)] dark:hover:shadow-[0_20px_50px_rgba(234,88,12,0.25)] hover:-translate-y-2 group shadow-sm">
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-700/60 shadow-inner">
                  <UtensilsCrossed className="w-7 h-7 text-orange-600 dark:text-amber-400" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-900 dark:text-amber-300 border border-orange-300 dark:border-orange-600/60">
                  Cloud Kitchen
                </span>
              </div>

              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-950 border border-orange-200 dark:border-orange-900/60 shadow-lg">
                <Image
                  src="https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80"
                  alt="Kirubai Cloud Kitchen South Indian Dishes"
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <p className="text-[11px] font-bold text-amber-300">Authentic South Indian Homestyle</p>
                  <h3 className="text-xl font-black text-white">Kirubai Cloud Kitchen</h3>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-700 dark:text-amber-100/80 leading-relaxed">
                  Aromatic Biryanis, crispy Dosas, Chettinad gravies, fresh Parottas, and traditional snacks made fresh daily with homestyle purity.
                </p>

                <div className="pt-2 border-t border-orange-200 dark:border-orange-900/40 space-y-1.5 text-xs text-slate-700 dark:text-amber-200/90 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 dark:text-amber-400" />
                    <span>Pure Ground Spices & Homestyle Hygiene</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Piping Hot Fast Delivery (~2km Free)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                    <span>Party Packs & Corporate Catering</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-orange-200 dark:border-orange-900/40 space-y-2">
              <Link
                href="/kirubai"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white dark:text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-900/20 dark:shadow-orange-950/60 transition-all transform active:scale-98"
              >
                <span>Enter Kirubai Kitchen</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* =========================================================================
              DOOR 3: SS VISION 360 (Precision Security Technology World)
             ========================================================================= */}
          <div className="rounded-3xl border border-blue-200 dark:border-blue-800/60 bg-gradient-to-b from-white to-blue-50/50 dark:from-[#0c162b] dark:to-[#040711] p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_20px_50px_rgba(37,99,235,0.15)] dark:hover:shadow-[0_20px_50px_rgba(37,99,235,0.25)] hover:-translate-y-2 group shadow-sm">
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-700/60 shadow-inner">
                  <ShieldCheck className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-300 dark:border-blue-600/60">
                  Security Technology
                </span>
              </div>

              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-950 border border-blue-200 dark:border-blue-900/60 shadow-lg">
                <Image
                  src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80"
                  alt="SS Vision 360 CCTV Systems"
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <p className="text-[11px] font-bold text-blue-300">Surveillance & Engineering</p>
                  <h3 className="text-xl font-black text-white">SS Vision 360</h3>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  HD & 4K ColorVu IP CCTV cameras, biometric attendance systems, video door phones, and certified onsite installation & AMC maintenance.
                </p>

                <div className="pt-2 border-t border-blue-200 dark:border-blue-900/40 space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>OEM Certified Hardware Warranty</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Free Onsite Survey & Assessment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span>Mobile Live Viewing & Cloud Setup</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-blue-200 dark:border-blue-900/40 space-y-2">
              <Link
                href="/vision-360"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 dark:shadow-blue-950/60 transition-all transform active:scale-98"
              >
                <span>Enter SS Vision 360</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Footer */}
      <footer className="w-full bg-white dark:bg-[#01060e] border-t border-slate-200 dark:border-slate-900 py-10 text-center text-xs text-slate-600 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <p className="font-semibold text-slate-800 dark:text-slate-300">
            SS Multi-Brand Platform • Serving Coimbatore with Dedicated Divisions
          </p>
          <div className="flex items-center justify-center gap-6">
            <Link href="/aquarium" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              SS Aquarium
            </Link>
            <Link href="/kirubai" className="hover:text-orange-600 dark:hover:text-amber-400 transition-colors">
              Kirubai Cloud Kitchen
            </Link>
            <Link href="/vision-360" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              SS Vision 360
            </Link>
            <Link href="/admin" className="hover:text-slate-950 dark:hover:text-white transition-colors flex items-center gap-1 font-semibold">
              <Lock className="w-3 h-3" />
              <span>Admin Management</span>
            </Link>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-600">
            © {new Date().getFullYear()} SS Multi-Brand Platform. Built for Coimbatore commerce and direct WhatsApp workflows.
          </p>
        </div>
      </footer>
    </main>
  );
}
