'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BrandConfig, CatalogItem } from '@/types';
import { useCartStore } from '@/lib/cart-store';
import { generateServiceInquiryWhatsAppUrl } from '@/lib/whatsapp';
import { 
  ShoppingBag, 
  Check, 
  Plus, 
  Minus, 
  MessageCircle, 
  Phone, 
  ArrowRight 
} from 'lucide-react';
import { BrandCartDrawer } from '@/components/BrandCartDrawer';
import { formatPriceWithUnit } from '@/lib/units';

interface ProductDetailActionsProps {
  brand: BrandConfig;
  item: CatalogItem;
  serviceWhatsAppUrl: string;
  theme: {
    priceText: string;
    badgeStyle: string;
    accent: string;
    btnPrimary: string;
    serviceBtn: string;
  };
}

export const ProductDetailActions: React.FC<ProductDetailActionsProps> = ({
  brand,
  item,
  serviceWhatsAppUrl,
  theme,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [serviceNote, setServiceNote] = useState('');

  const addItem = useCartStore((state) => state.addItem);
  const isProduct = item.itemType === 'PRODUCT';

  const handleAddToCart = () => {
    addItem(brand.id, item, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const handleServiceInquiry = () => {
    const url = generateServiceInquiryWhatsAppUrl(brand, item, serviceNote);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      {isProduct ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {/* Quantity Stepper */}
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 text-sm font-black text-white min-w-10 text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!item.isAvailable}
              className={`flex-1 py-3.5 px-6 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-98 disabled:opacity-50 disabled:pointer-events-none ${
                isAdded ? 'bg-emerald-400 text-slate-950 font-black' : theme.btnPrimary
              }`}
              id="detail-add-to-cart"
            >
              {isAdded ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Added to {brand.name} Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>Add to Cart ({quantity})</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Cart Drawer Trigger / View Cart */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-cyan-400" />
              <span>Review Cart & WhatsApp Checkout</span>
            </button>
          </div>

          {/* Mobile Sticky Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 p-3 bg-slate-950/95 border-t border-slate-800 backdrop-blur-lg z-30 flex items-center justify-between gap-3 sm:hidden shadow-[0_-8px_20px_rgba(0,0,0,0.6)]">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Price</span>
              <span className="text-sm font-black text-white">
                {formatPriceWithUnit(
                  item.offerPrice ?? item.originalPrice,
                  item.unitType,
                  item.unitValue
                )}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!item.isAvailable}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                isAdded ? 'bg-emerald-400 text-slate-950' : theme.btnPrimary
              } disabled:opacity-50`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Service Inquiry Form & Trigger */
        <div className="space-y-3 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Service Location / Requirement Note:
            </label>
            <input
              type="text"
              value={serviceNote}
              onChange={(e) => setServiceNote(e.target.value)}
              placeholder="e.g. 4-camera setup for residential villa in Madhukkarai..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={handleServiceInquiry}
            className={`w-full py-3.5 px-6 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-98 ${theme.serviceBtn}`}
            id="detail-service-inquiry-btn"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Send Service Request to WhatsApp</span>
          </button>
        </div>
      )}

      {/* Cart Drawer for slideout review */}
      <BrandCartDrawer
        brand={brand}
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
      />
    </div>
  );
};
