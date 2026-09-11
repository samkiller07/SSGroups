import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { dataRepository } from '@/lib/data-store';
import { MultiImageGallery } from '@/components/MultiImageGallery';
import { ProductCard } from '@/components/ProductCard';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { formatPriceWithUnit, formatStockDisplay } from '@/lib/units';
import { generateServiceInquiryWhatsAppUrl, generateGeneralInquiryWhatsAppUrl } from '@/lib/whatsapp';
import { getSupabaseServer, isSupabaseConfigured } from '@/lib/supabase';
import { mapDbCatalogItemToItem } from '@/lib/supabase-mappers';
import { 
  ChevronRight, 
  Sparkles, 
  Truck, 
  Store, 
  Package,
  AlertCircle
} from 'lucide-react';
import { ProductDetailActions } from './ProductDetailActions';

interface ProductDetailPageProps {
  params: Promise<{ brand: string; slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { brand: brandId, slug } = await params;
  const brand = dataRepository.getBrand(brandId);
  let item = dataRepository.getItemBySlug(brandId, slug);

  if (!item && isSupabaseConfigured) {
    const supabase = getSupabaseServer();
    if (supabase) {
      const { data: dbItem } = await supabase
        .from('catalog_items')
        .select('*, images:product_images(*)')
        .eq('brand_id', brandId)
        .eq('slug', slug)
        .single();
      if (dbItem) {
        item = mapDbCatalogItemToItem(dbItem);
        dataRepository.addCatalogItem(item);
      }
    }
  }

  if (!brand || !item) return {};

  return {
    title: `${item.name} | ${brand.name} Coimbatore`,
    description: item.shortDescription || item.description.slice(0, 160),
    openGraph: {
      title: `${item.name} - ${brand.name}`,
      description: item.shortDescription || item.description.slice(0, 160),
      images: item.images[0]?.imageUrl ? [{ url: item.images[0].imageUrl }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { brand: brandId, slug } = await params;
  const brand = dataRepository.getBrand(brandId);
  let item = dataRepository.getItemBySlug(brandId, slug);

  if (!item && isSupabaseConfigured) {
    const supabase = getSupabaseServer();
    if (supabase) {
      const { data: dbItem } = await supabase
        .from('catalog_items')
        .select('*, images:product_images(*)')
        .eq('brand_id', brandId)
        .eq('slug', slug)
        .single();
      if (dbItem) {
        item = mapDbCatalogItemToItem(dbItem);
        dataRepository.addCatalogItem(item);
      }
    }
  }

  if (!brand || !item) {
    notFound();
  }

  const relatedItems = dataRepository
    .getCatalogItems(brand.id, { categoryId: item.categoryId })
    .filter((i) => i.id !== item.id)
    .slice(0, 4);

  const discount = calculateDiscount(item.originalPrice, item.offerPrice);
  const isProduct = item.itemType === 'PRODUCT';

  const serviceWhatsAppUrl = generateServiceInquiryWhatsAppUrl(brand, item);

  const getBrandThemeColors = () => {
    switch (brand.id) {
      case 'aquarium':
        return {
          priceText: 'text-cyan-700 dark:text-cyan-400',
          badgeStyle: 'bg-cyan-100 text-cyan-950 border-cyan-300 dark:bg-cyan-950/80 dark:text-cyan-300 dark:border-cyan-700/60',
          accent: 'text-cyan-600 dark:text-cyan-400',
          btnPrimary: 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white dark:text-slate-950',
          serviceBtn: 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white dark:text-slate-950',
        };
      case 'kirubai':
        return {
          priceText: 'text-orange-600 dark:text-orange-400',
          badgeStyle: 'bg-orange-100 text-orange-950 border-orange-300 dark:bg-orange-950/80 dark:text-orange-300 dark:border-orange-700/60',
          accent: 'text-orange-600 dark:text-orange-400',
          btnPrimary: 'bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white dark:text-slate-950',
          serviceBtn: 'bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white dark:text-slate-950',
        };
      case 'vision-360':
      default:
        return {
          priceText: 'text-blue-700 dark:text-blue-400',
          badgeStyle: 'bg-blue-100 text-blue-950 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-700/60',
          accent: 'text-blue-600 dark:text-blue-400',
          btnPrimary: 'bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white',
          serviceBtn: 'bg-gradient-to-r from-blue-700 to-sky-600 hover:from-blue-600 hover:to-sky-500 text-white',
        };
    }
  };

  const theme = getBrandThemeColors();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full flex-1">
      {/* Breadcrumb Bar */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-8 overflow-x-auto whitespace-nowrap">
        <Link href={`/${brand.id}`} className="hover:text-slate-950 dark:hover:text-white transition-colors">
          {brand.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
        <Link href={`/${brand.id}/catalog`} className="hover:text-slate-950 dark:hover:text-white transition-colors">
          Catalog
        </Link>
        {item.categoryName && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
            <Link href={`/${brand.id}/catalog?category=${item.categoryId}`} className="hover:text-slate-950 dark:hover:text-white transition-colors">
              {item.categoryName}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
        <span className="text-slate-900 dark:text-slate-200 font-semibold truncate">{item.name}</span>
      </nav>

      {/* Main Grid: Gallery & Product Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left Column: Interactive Multi-Image Gallery */}
        <div className="lg:col-span-6">
          <MultiImageGallery
            images={item.images}
            title={item.name}
            brandThemeColor={brand.theme.primaryColor}
          />
        </div>

        {/* Right Column: Information & Actions */}
        <div className="lg:col-span-6 space-y-6">
          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-300">
              {item.itemType}
            </span>
            {item.categoryName && (
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {item.categoryName}
              </span>
            )}
            {item.promotionalBadge && (
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${theme.badgeStyle}`}>
                <Sparkles className="w-3.5 h-3.5" />
                {item.promotionalBadge}
              </span>
            )}
            {discount > 0 && isProduct && (
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-600 text-white">
                {discount}% OFF
              </span>
            )}
            {!item.isClientVerified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                <AlertCircle className="w-3 h-3" />
                Store Spec
              </span>
            )}
          </div>

          {/* Title & Short Description */}
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-tight">
            {item.name}
          </h1>

          {item.shortDescription && (
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              {item.shortDescription}
            </p>
          )}

          {/* Pricing & Unit Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-inner flex flex-col gap-1">
            {isProduct ? (
              <div className="space-y-1">
                <div className="flex items-baseline gap-3">
                  <span className={`text-3xl sm:text-4xl font-black ${theme.priceText}`}>
                    {formatPriceWithUnit(
                      item.offerPrice ?? item.originalPrice,
                      item.unitType,
                      item.unitValue
                    )}
                  </span>
                  {item.originalPrice && item.offerPrice && item.originalPrice > item.offerPrice && (
                    <span className="text-base text-slate-400 line-through">
                      {formatPrice(item.originalPrice)}
                    </span>
                  )}
                </div>
                {item.stockQuantity !== null && item.stockQuantity !== undefined && (
                  <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 pt-1">
                    <Package className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    <span>{formatStockDisplay(item.stockQuantity, item.unitType, item.unitValue)}</span>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <span className="text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold block">
                  Service Estimate / Base Consultation
                </span>
                <span className={`text-2xl sm:text-3xl font-black ${theme.priceText}`}>
                  {item.offerPrice || item.originalPrice
                    ? formatPriceWithUnit(item.offerPrice ?? item.originalPrice, item.unitType, item.unitValue)
                    : 'Inspection Based'}
                </span>
              </div>
            )}

            <div className="mt-2 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{item.isAvailable ? 'In Stock / Active in Coimbatore Store' : 'Currently Unavailable'}</span>
            </div>
          </div>

          {/* Client Action Area (Add to Cart / WhatsApp Service Inquiry) */}
          <ProductDetailActions
            brand={brand}
            item={item}
            serviceWhatsAppUrl={serviceWhatsAppUrl}
            theme={theme}
          />

          {/* Value Props & Local Coverage */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-slate-900 dark:text-white">Free Local Delivery</p>
                <p className="text-slate-500 dark:text-slate-400">Within ~{brand.freeDeliveryRadiusKm}km</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
              <Store className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-slate-900 dark:text-white">Shop Pickup</p>
                <p className="text-slate-500 dark:text-slate-400">{brand.city}</p>
              </div>
            </div>
          </div>

          {/* Detailed Description */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-300">
              Full Details & Description
            </h2>
            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-3 whitespace-pre-line">
              {item.description}
            </div>
          </div>

          {/* Specifications Table */}
          {item.specifications && Object.keys(item.specifications).length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-300">
                Key Specifications
              </h2>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950/60">
                <table className="w-full text-xs text-left">
                  <tbody>
                    {Object.entries(item.specifications).map(([key, value], idx) => (
                      <tr
                        key={key}
                        className={idx % 2 === 0 ? 'bg-slate-50 dark:bg-slate-900/40' : 'bg-white dark:bg-slate-950/40'}
                      >
                        <td className="py-2.5 px-4 font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 w-1/3">
                          {key}
                        </td>
                        <td className="py-2.5 px-4 text-slate-900 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 font-medium">
                          {value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedItems.length > 0 && (
        <div className="mt-20 pt-12 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white">
              Related from {brand.name}
            </h2>
            <Link
              href={`/${brand.id}/catalog`}
              className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              View Full Catalog
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedItems.map((relItem) => (
              <ProductCard key={relItem.id} item={relItem} brand={brand} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
