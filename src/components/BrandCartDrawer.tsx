'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BrandConfig, DeliveryMethod } from '@/types';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/utils';
import { formatPriceWithUnit } from '@/lib/units';
import { createCustomerOrderAction } from '@/app/actions/admin-actions';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  MessageCircle, 
  Sparkles, 
  Truck, 
  Store, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  User,
  Phone,
  Mail,
  FileText
} from 'lucide-react';

interface BrandCartDrawerProps {
  brand: BrandConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const BrandCartDrawer: React.FC<BrandCartDrawerProps> = ({ brand, isOpen, onClose }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('PICKUP');
  const [customerNote, setCustomerNote] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedInvoice, setCompletedInvoice] = useState<string | null>(null);

  const items = useCartStore((state) => state.getItems(brand.id));
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getSavings = useCartStore((state) => state.getSavings);

  const subtotal = getSubtotal(brand.id);
  const savings = getSavings(brand.id);

  if (!isOpen) return null;

  const handleWhatsAppCheckout = async () => {
    if (items.length === 0) return;

    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit contact number.');
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address for invoice & confirmation.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    try {
      const payload = items.map((ci) => ({
        catalogItemId: ci.item.id,
        quantity: ci.quantity,
      }));

      // Server-side authoritative order creation (PENDING status, Stock UNCHANGED)
      const result = await createCustomerOrderAction({
        brandId: brand.id,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        deliveryMethod,
        customerNote: customerNote.trim() || undefined,
        items: payload,
      });

      if (result.success && result.invoiceNumber) {
        setCompletedInvoice(result.invoiceNumber);
        clearCart(brand.id);

        if (result.whatsAppUrl) {
          window.open(result.whatsAppUrl, '_blank');
        }
      } else {
        setErrorMessage(result.error || 'Failed to create order. Please try again.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error communicating with server';
      setErrorMessage(msg);
    } finally {
      setIsVerifying(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between text-slate-900 dark:text-slate-100 transition-colors">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-950 dark:text-white tracking-tight leading-tight">
                  {brand.name} Cart
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {items.length} {items.length === 1 ? 'item' : 'items'} selected
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content Scroll Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-xs text-red-900 dark:text-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {items.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-950 dark:text-white">Your {brand.name} cart is empty</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    Explore our catalog to add items for direct WhatsApp ordering.
                  </p>
                </div>
                <Link
                  href={`/${brand.id}/catalog`}
                  onClick={onClose}
                  className="inline-block px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-950 dark:text-white font-bold text-xs transition-colors"
                >
                  Explore Catalog
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-1">
                  <span>Selected Items</span>
                  <button
                    onClick={() => clearCart(brand.id)}
                    className="hover:text-red-500 transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-850 space-y-3">
                  {items.map(({ item, quantity }) => {
                    const price = item.offerPrice ?? item.originalPrice ?? 0;
                    const itemImage =
                      item.images.find((img) => img.isPrimary)?.imageUrl ||
                      item.images[0]?.imageUrl ||
                      'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=400&q=80';

                    return (
                      <div key={item.id} className="pt-3 flex gap-3 items-center justify-between">
                        <div className="flex gap-3 items-center flex-1 min-w-0">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0">
                            <Image
                              src={itemImage}
                              alt={item.name}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-slate-950 dark:text-white truncate">
                              {item.name}
                            </h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              {formatPriceWithUnit(price, item.unitType, item.unitValue)}
                            </p>
                            <p className="text-xs font-black text-cyan-700 dark:text-cyan-400 mt-0.5">
                              {formatPrice(price * quantity)}
                            </p>
                          </div>
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg p-0.5">
                            <button
                              onClick={() => updateQuantity(brand.id, item.id, quantity - 1)}
                              className="p-1 text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white rounded"
                              aria-label="Decrease"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2 text-xs font-bold text-slate-900 dark:text-white min-w-5 text-center">
                              {quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(brand.id, item.id, quantity + 1)}
                              className="p-1 text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white rounded"
                              aria-label="Increase"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(brand.id, item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500"
                            aria-label="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Customer Contact Details Required for Order & Invoice */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-850 space-y-2.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                    Customer Information <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="space-y-2">
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Full Name *"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>

                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Contact Number (WhatsApp) *"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>

                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="Email Address (for Invoice & Updates) *"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Fulfillment Selection */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-850 space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                    Fulfillment Preference
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('PICKUP')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        deliveryMethod === 'PICKUP'
                          ? 'bg-cyan-50 dark:bg-slate-800 border-cyan-500 text-slate-950 dark:text-white'
                          : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold mb-0.5">
                        <Store className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                        <span>Store Pickup</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">At store location</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('HOME_DELIVERY')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        deliveryMethod === 'HOME_DELIVERY'
                          ? 'bg-emerald-50 dark:bg-slate-800 border-emerald-500 text-slate-950 dark:text-white'
                          : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold mb-0.5">
                        <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Doorstep Delivery</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Free within ~2km</p>
                    </button>
                  </div>
                </div>

                {/* Optional Note */}
                <div className="pt-2">
                  <input
                    type="text"
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    placeholder="Optional delivery instructions or notes..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            )}

            {/* Completed Invoice Banner */}
            {completedInvoice && (
              <div className="m-5 p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    Order Submitted!
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Your order is currently <strong className="text-amber-500">PENDING</strong> verification.
                  </p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-500/20">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Invoice Number</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{completedInvoice}</div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  WhatsApp chat was opened to transmit your request. An admin will verify stock readiness and confirm your order shortly.
                </p>
                <button
                  onClick={() => {
                    setCompletedInvoice(null);
                    onClose();
                  }}
                  className="w-full py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>

          {/* Footer with Price Summary & WhatsApp Checkout */}
          {items.length > 0 && !completedInvoice && (
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-950 dark:text-white">{formatPrice(subtotal)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Savings
                    </span>
                    <span>-{formatPrice(savings)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-950 dark:text-white pt-1.5 border-t border-slate-200 dark:border-slate-800">
                  <span>Total Amount</span>
                  <span className="text-base text-cyan-700 dark:text-cyan-400">{formatPrice(subtotal)}</span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                onClick={handleWhatsAppCheckout}
                disabled={isVerifying}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all active:scale-98 disabled:opacity-50"
                id="drawer-whatsapp-checkout"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Order & Invoice...</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 fill-white text-white" />
                    <span>Create Order & Send via WhatsApp</span>
                  </>
                )}
              </button>


              <div className="flex items-center justify-between text-[11px] pt-1">
                <Link
                  href={`/${brand.id}/cart`}
                  onClick={onClose}
                  className="text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>Open Full Cart Page</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Price Protected</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
