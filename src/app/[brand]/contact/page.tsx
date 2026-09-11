import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { dataRepository } from '@/lib/data-store';
import { generateGeneralInquiryWhatsAppUrl } from '@/lib/whatsapp';
import { BRANDS } from '@/config/brands';
import { 
  Phone, 
  MessageCircle, 
  MapPin, 
  Clock, 
  Radio, 
  ExternalLink, 
  Truck, 
  ArrowRight
} from 'lucide-react';
import { InstagramIcon } from '@/components/InstagramIcon';

interface BrandContactPageProps {
  params: Promise<{ brand: string }>;
}

export async function generateMetadata({ params }: BrandContactPageProps): Promise<Metadata> {
  const { brand: brandId } = await params;
  const brand = dataRepository.getBrand(brandId);
  if (!brand) return {};

  return {
    title: `Contact & Location | ${brand.name} Coimbatore`,
    description: `Get in touch with ${brand.name} in Coimbatore. Store timings, WhatsApp order assistance, phone numbers, and location map.`,
  };
}

export default async function BrandContactPage({ params }: BrandContactPageProps) {
  const { brand: brandId } = await params;
  const brand = dataRepository.getBrand(brandId);

  if (!brand) {
    notFound();
  }

  const generalWhatsApp = generateGeneralInquiryWhatsAppUrl(brand);
  const sisterBrands = Object.values(BRANDS).filter((b) => b.id !== brand.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full flex-1">
      {/* Header */}
      <div className="max-w-3xl mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-red-500" />
          <span>Coimbatore Store & Service Desk</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight">
          Connect with {brand.name}
        </h1>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          {brand.tagline}. Visit our physical shop in Coimbatore or reach out instantly via WhatsApp or phone call for rapid service and delivery inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Direct Contact & Timing Cards */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick Actions Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm">
            <h2 className="font-bold text-lg text-slate-950 dark:text-white">Direct Communication</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href={`tel:${brand.phonePrimary}`}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 flex items-center gap-3.5 transition-all group"
              >
                <div className="p-3 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/60 group-hover:scale-105 transition-transform">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold block">
                    Primary Phone
                  </span>
                  <span className="font-bold text-sm text-slate-950 dark:text-white">{brand.phonePrimary}</span>
                </div>
              </a>

              {brand.phoneSecondary && (
                <a
                  href={`tel:${brand.phoneSecondary}`}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 flex items-center gap-3.5 transition-all group"
                >
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 group-hover:scale-105 transition-transform">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold block">
                      Secondary Phone
                    </span>
                    <span className="font-bold text-sm text-slate-950 dark:text-white">{brand.phoneSecondary}</span>
                  </div>
                </a>
              )}

              <a
                href={generalWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 flex items-center gap-3.5 transition-all group sm:col-span-2"
              >
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="text-[11px] uppercase tracking-wider text-emerald-800 dark:text-emerald-400 font-bold block">
                    Official WhatsApp
                  </span>
                  <span className="font-bold text-sm text-slate-950 dark:text-white">{brand.whatsappNumber}</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Click to start an instant WhatsApp conversation</p>
                </div>
              </a>
            </div>
          </div>

          {/* Hours & Delivery Radius */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <h2 className="font-bold text-lg text-slate-950 dark:text-white">Store Timings & Fulfillment</h2>
            <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-950 dark:text-white">Daily Operational Hours</p>
                  <p className="text-slate-600 dark:text-slate-400">{brand.openingTime} to {brand.closingTime}</p>
                  <p className="text-amber-700 dark:text-amber-400 font-medium text-xs mt-0.5">Scheduled Holiday: {brand.holiday}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-slate-200 dark:border-slate-850">
                <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-950 dark:text-white">Free Local Delivery Coverage</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Free doorstep delivery for customers within ~{brand.freeDeliveryRadiusKm} km around our store in {brand.city}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Address, Google Maps & Social */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm">
            <h2 className="font-bold text-lg text-slate-950 dark:text-white">Store Address</h2>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-slate-950 dark:text-white">{brand.name}</p>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5">{brand.address}</p>
                  {brand.plusCode && (
                    <p className="text-cyan-700 dark:text-cyan-400 font-mono text-xs mt-1">Plus Code: {brand.plusCode}</p>
                  )}
                </div>
              </div>
            </div>

            {brand.googleMapsUrl && (
              <a
                href={brand.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Open in Google Maps / Navigation</span>
              </a>
            )}

            {/* Social Channels */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Official Channels
              </span>
              <div className="flex flex-col gap-2">
                {brand.instagramUrl && (
                  <a
                    href={brand.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-pink-500/50 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <InstagramIcon className="w-4 h-4 text-pink-500" />
                      <span>Instagram Profile</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}

                {brand.whatsappChannelUrl && (
                  <a
                    href={brand.whatsappChannelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>WhatsApp Updates Channel</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Sister Businesses Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Our Other Coimbatore Businesses
            </h3>
            <div className="space-y-2">
              {sisterBrands.map((sb) => (
                <Link
                  key={sb.id}
                  href={`/${sb.id}`}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 flex items-center justify-between text-xs transition-colors group"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400">{sb.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{sb.tagline}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-950 dark:group-hover:text-white group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
