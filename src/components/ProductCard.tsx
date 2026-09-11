'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CatalogItem, BrandConfig } from '@/types';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { formatPriceWithUnit, formatStockDisplay } from '@/lib/units';
import { generateServiceInquiryWhatsAppUrl } from '@/lib/whatsapp';
import { 
  ShoppingBag, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Fish,
  UtensilsCrossed, 
  MessageCircle, 
  Star,
  Plus,
  Minus
} from 'lucide-react';

interface ProductCardProps {
  item: CatalogItem;
  brand: BrandConfig;
  onOpenCart?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item, brand, onOpenCart }) => {
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const cartItems = useCartStore((state) => state.getItems(brand.id));
  
  const currentCartItem = cartItems.find((ci) => ci.item.id === item.id);
  const currentQuantity = currentCartItem?.quantity || 0;

  const primaryImage =
    item.images.find((img) => img.isPrimary)?.imageUrl ||
    item.images[0]?.imageUrl ||
    'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80';

  const discount = calculateDiscount(item.originalPrice, item.offerPrice);
  const isProduct = item.itemType === 'PRODUCT';
  const effectivePrice = item.offerPrice ?? item.originalPrice ?? 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(brand.id, item, 1);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  const handleUpdateQty = (e: React.MouseEvent, newQty: number) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(brand.id, item.id, newQty);
  };

  const serviceWhatsAppUrl = generateServiceInquiryWhatsAppUrl(brand, item);

  // =========================================================================
  // 1. SS AQUARIUM CARD
  // =========================================================================
  if (brand.id === 'aquarium') {
    return (
      <div className="aquatic-card-glass rounded-2xl flex flex-col justify-between overflow-hidden transition-all duration-300 group border">
        {/* Media Top Container */}
        <div>
          <Link href={`/${brand.id}/products/${item.slug}`} className="relative aspect-[4/3] w-full block overflow-hidden bg-slate-100 dark:bg-slate-950">
            <Image
              src={primaryImage}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

            {/* Badges Overlay */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
              {item.promotionalBadge && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 backdrop-blur-md shadow-md">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  {item.promotionalBadge}
                </span>
              )}
              {discount > 0 && isProduct && (
                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-black bg-cyan-400 text-slate-950 shadow-md">
                  {discount}% OFF
                </span>
              )}
            </div>

            <div className="absolute top-2.5 right-2.5 z-10">
              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-slate-950/80 text-cyan-300 border border-cyan-800/60 backdrop-blur-sm">
                {isProduct ? 'Live Stock' : 'Aqua Service'}
              </span>
            </div>

            {item.categoryName && (
              <div className="absolute bottom-2 left-2.5 z-10 flex items-center gap-1 text-[11px] font-semibold text-cyan-200">
                <Fish className="w-3.5 h-3.5 text-cyan-300" />
                <span>{item.categoryName}</span>
              </div>
            )}
          </Link>

          {/* Content Body */}
          <div className="p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-3 h-3 fill-amber-500" />
                <span>4.9</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">(Coimbatore Verified)</span>
              </span>
              <span className="text-[11px] text-cyan-700 dark:text-cyan-400/80 font-medium">
                {formatStockDisplay(item.stockQuantity, item.unitType, item.unitValue)}
              </span>
            </div>

            <Link href={`/${brand.id}/products/${item.slug}`} className="block">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors line-clamp-1 leading-snug">
                {item.name}
              </h3>
            </Link>

            <p className="text-xs text-slate-600 dark:text-slate-300/80 line-clamp-2 leading-relaxed">
              {item.shortDescription || item.description}
            </p>

            {/* Price & Unit Block */}
            <div className="pt-2 border-t border-cyan-200 dark:border-cyan-900/30 flex items-baseline justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-black text-cyan-700 dark:text-cyan-400">
                    {formatPrice(effectivePrice)}
                  </span>
                  {discount > 0 && item.originalPrice && (
                    <span className="text-xs text-slate-400 line-through">
                      {formatPrice(item.originalPrice)}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-cyan-200/70">
                  Unit: {formatPriceWithUnit(effectivePrice, item.unitType, item.unitValue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="p-4 pt-0">
          {isProduct ? (
            currentQuantity > 0 ? (
              <div className="flex items-center justify-between bg-cyan-100 dark:bg-cyan-950/90 border border-cyan-300 dark:border-cyan-700/80 rounded-xl p-1">
                <button
                  onClick={(e) => handleUpdateQty(e, currentQuantity - 1)}
                  className="p-1.5 text-cyan-800 dark:text-cyan-300 hover:text-cyan-950 dark:hover:text-white rounded hover:bg-cyan-200 dark:hover:bg-cyan-900/50"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xs font-black text-cyan-950 dark:text-white px-2">
                  {currentQuantity} in Cart
                </span>
                <button
                  onClick={(e) => handleUpdateQty(e, currentQuantity + 1)}
                  className="p-1.5 text-cyan-800 dark:text-cyan-300 hover:text-cyan-950 dark:hover:text-white rounded hover:bg-cyan-200 dark:hover:bg-cyan-900/50"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white dark:text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 text-white dark:text-slate-950" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-white dark:text-slate-950" />
                    <span>Add to Aquarium Cart</span>
                  </>
                )}
              </button>
            )
          ) : (
            <a
              href={serviceWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 hover:bg-cyan-200 dark:hover:bg-cyan-900 border border-cyan-300 dark:border-cyan-600/70 text-cyan-950 dark:text-cyan-200 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Inquire Service on WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. KIRUBAI CLOUD KITCHEN CARD
  // =========================================================================
  if (brand.id === 'kirubai') {
    return (
      <div className="culinary-card-glass rounded-2xl flex flex-col justify-between overflow-hidden transition-all duration-300 group border">
        {/* Media Top Container */}
        <div>
          <Link href={`/${brand.id}/products/${item.slug}`} className="relative aspect-[4/3] w-full block overflow-hidden bg-slate-100 dark:bg-slate-950">
            <Image
              src={primaryImage}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

            {/* Badges */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
              {item.promotionalBadge && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-950/90 text-amber-300 border border-orange-500/40 backdrop-blur-md shadow-md">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  {item.promotionalBadge}
                </span>
              )}
              {discount > 0 && (
                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-400 text-slate-950 shadow-md">
                  {discount}% OFF
                </span>
              )}
            </div>

            <div className="absolute top-2.5 right-2.5 z-10">
              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-slate-950/80 text-amber-300 border border-orange-800/60 backdrop-blur-sm">
                Kitchen Fresh
              </span>
            </div>

            {item.categoryName && (
              <div className="absolute bottom-2 left-2.5 z-10 flex items-center gap-1 text-[11px] font-semibold text-amber-200">
                <UtensilsCrossed className="w-3.5 h-3.5 text-amber-300" />
                <span>{item.categoryName}</span>
              </div>
            )}
          </Link>

          {/* Content Body */}
          <div className="p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-3 h-3 fill-amber-500" />
                <span>4.8</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">(Daily Favourite)</span>
              </span>
              <span className="text-[11px] text-amber-700 dark:text-amber-400/80 font-medium">
                {formatStockDisplay(item.stockQuantity, item.unitType, item.unitValue)}
              </span>
            </div>

            <Link href={`/${brand.id}/products/${item.slug}`} className="block">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white hover:text-orange-600 dark:hover:text-amber-300 transition-colors line-clamp-1 leading-snug">
                {item.name}
              </h3>
            </Link>

            <p className="text-xs text-slate-600 dark:text-amber-100/70 line-clamp-2 leading-relaxed">
              {item.shortDescription || item.description}
            </p>

            {/* Price & Unit Block */}
            <div className="pt-2 border-t border-orange-200 dark:border-orange-900/30 flex items-baseline justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-black text-orange-600 dark:text-amber-400">
                    {formatPrice(effectivePrice)}
                  </span>
                  {discount > 0 && item.originalPrice && (
                    <span className="text-xs text-slate-400 line-through">
                      {formatPrice(item.originalPrice)}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-amber-200/70">
                  Portion: {formatPriceWithUnit(effectivePrice, item.unitType, item.unitValue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="p-4 pt-0">
          {currentQuantity > 0 ? (
            <div className="flex items-center justify-between bg-orange-100 dark:bg-orange-950/90 border border-orange-300 dark:border-orange-700/80 rounded-xl p-1">
              <button
                onClick={(e) => handleUpdateQty(e, currentQuantity - 1)}
                className="p-1.5 text-orange-800 dark:text-amber-300 hover:text-orange-950 dark:hover:text-white rounded hover:bg-orange-200 dark:hover:bg-orange-900/50"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xs font-black text-orange-950 dark:text-white px-2">
                {currentQuantity} in Order
              </span>
              <button
                onClick={(e) => handleUpdateQty(e, currentQuantity + 1)}
                className="p-1.5 text-orange-800 dark:text-amber-300 hover:text-orange-950 dark:hover:text-white rounded hover:bg-orange-200 dark:hover:bg-orange-900/50"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white dark:text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4 text-white dark:text-slate-950" />
                  <span>Added to Order!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-white dark:text-slate-950" />
                  <span>Add to Food Cart</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. SS VISION 360 CARD
  // =========================================================================
  return (
    <div className="vision-card-glass rounded-2xl flex flex-col justify-between overflow-hidden transition-all duration-300 group border">
      {/* Media Top Container */}
      <div>
        <Link href={`/${brand.id}/products/${item.slug}`} className="relative aspect-[4/3] w-full block overflow-hidden bg-slate-100 dark:bg-slate-950">
          <Image
            src={primaryImage}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {item.promotionalBadge && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-950/90 text-blue-300 border border-blue-500/40 backdrop-blur-md shadow-md">
                <Sparkles className="w-3 h-3 text-blue-400" />
                {item.promotionalBadge}
              </span>
            )}
            {discount > 0 && isProduct && (
              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-600 text-white shadow-md">
                {discount}% OFF
              </span>
            )}
          </div>

          <div className="absolute top-2.5 right-2.5 z-10">
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm border ${
              isProduct 
                ? 'bg-slate-950/80 text-blue-300 border-blue-800/60' 
                : 'bg-emerald-950/90 text-emerald-300 border-emerald-600/70'
            }`}>
              {isProduct ? 'Security Hardware' : 'Installation & AMC'}
            </span>
          </div>

          {item.categoryName && (
            <div className="absolute bottom-2 left-2.5 z-10 flex items-center gap-1 text-[11px] font-semibold text-blue-200">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
              <span>{item.categoryName}</span>
            </div>
          )}
        </Link>

        {/* Content Body */}
        <div className="p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3 h-3 fill-amber-500" />
              <span>4.9</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">(OEM Certified)</span>
            </span>
            <span className="text-[11px] text-blue-700 dark:text-blue-400/80 font-medium">
              {isProduct ? formatStockDisplay(item.stockQuantity, item.unitType, item.unitValue) : 'Onsite Service'}
            </span>
          </div>

          <Link href={`/${brand.id}/products/${item.slug}`} className="block">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-300 transition-colors line-clamp-1 leading-snug">
              {item.name}
            </h3>
          </Link>

          <p className="text-xs text-slate-600 dark:text-slate-300/80 line-clamp-2 leading-relaxed">
            {item.shortDescription || item.description}
          </p>

          {/* Price & Specs Block */}
          <div className="pt-2 border-t border-blue-200 dark:border-blue-900/30 flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-blue-700 dark:text-blue-400">
                  {formatPrice(effectivePrice)}
                </span>
                {discount > 0 && item.originalPrice && (
                  <span className="text-xs text-slate-400 line-through">
                    {formatPrice(item.originalPrice)}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {isProduct 
                  ? `Spec: ${formatPriceWithUnit(effectivePrice, item.unitType, item.unitValue)}` 
                  : 'Estimate / Fixed Site Rate'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button Footer */}
      <div className="p-4 pt-0">
        {isProduct ? (
          currentQuantity > 0 ? (
            <div className="flex items-center justify-between bg-blue-100 dark:bg-blue-950/90 border border-blue-300 dark:border-blue-700/80 rounded-xl p-1">
              <button
                onClick={(e) => handleUpdateQty(e, currentQuantity - 1)}
                className="p-1.5 text-blue-800 dark:text-blue-300 hover:text-blue-950 dark:hover:text-white rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xs font-black text-blue-950 dark:text-white px-2">
                {currentQuantity} in Cart
              </span>
              <button
                onClick={(e) => handleUpdateQty(e, currentQuantity + 1)}
                className="p-1.5 text-blue-800 dark:text-blue-300 hover:text-blue-950 dark:hover:text-white rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Hardware Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-white" />
                  <span>Add Hardware to Cart</span>
                </>
              )}
            </button>
          )
        ) : (
          <a
            href={serviceWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3 rounded-xl bg-blue-100 dark:bg-blue-950/80 hover:bg-blue-200 dark:hover:bg-blue-900 border border-blue-300 dark:border-blue-600/70 text-blue-950 dark:text-blue-200 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Book Onsite Service Survey</span>
          </a>
        )}
      </div>
    </div>
  );
};
