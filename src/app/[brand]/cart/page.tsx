'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { dataRepository } from '@/lib/data-store';
import { useCartStore } from '@/lib/cart-store';
import { DeliveryMethod } from '@/types';
import { formatPrice } from '@/lib/utils';
import { formatPriceWithUnit } from '@/lib/units';
import { createCustomerOrderAction } from '@/app/actions/admin-actions';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  MessageCircle, 
  Truck, 
  Store, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  User,
  Phone,
  Mail
} from 'lucide-react';

export default function BrandCartPage() {
  const params = useParams();
  const brandId = params.brand as string;
  const brand = dataRepository.getBrand(brandId);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('PICKUP');
  
  // Delivery address fields
  const [houseNo, setHouseNo] = useState('');
  const [streetArea, setStreetArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Coimbatore');
  const [pincode, setPincode] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [customerNote, setCustomerNote] = useState('');

  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedInvoice, setCompletedInvoice] = useState<string | null>(null);

  const items = useCartStore((state) => state.getItems(brandId));
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getOriginalTotal = useCartStore((state) => state.getOriginalTotal);
  const getSavings = useCartStore((state) => state.getSavings);

  if (!brand) return null;

  const payableTotal = getSubtotal(brandId);
  const originalSubtotal = getOriginalTotal(brandId);
  const savings = getSavings(brandId);

  const handleCheckout = async () => {
    if (items.length === 0) return;

    if (!customerName.trim()) {
      setErrorMessage('Please provide your full name before placing the order.');
      return;
    }
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!customerPhone.trim() || cleanPhone.length < 10) {
      setErrorMessage('Please provide a valid 10-digit Indian phone number (e.g. 9791719662).');
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setErrorMessage('Please provide a valid email address for invoice and confirmation.');
      return;
    }

    if (deliveryMethod === 'DELIVERY') {
      if (!houseNo.trim()) {
        setErrorMessage('Please enter your House / Door Number for doorstep delivery.');
        return;
      }
      if (!streetArea.trim()) {
        setErrorMessage('Please enter your Street / Area name for doorstep delivery.');
        return;
      }
      if (!city.trim()) {
        setErrorMessage('Please enter your City for doorstep delivery.');
        return;
      }
      if (!pincode.trim() || !/^[1-9][0-9]{5}$/.test(pincode.trim())) {
        setErrorMessage('Please enter a valid 6-digit postal pincode (e.g. 641012).');
        return;
      }
    }

    setIsVerifying(true);
    setErrorMessage('');

    try {
      const payload = items.map((ci) => ({
        catalogItemId: ci.item.id,
        quantity: ci.quantity,
      }));

      // Server-side authoritative PENDING order creation (stock untouched)
      const result = await createCustomerOrderAction({
        brandId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        deliveryMethod,
        houseNo: deliveryMethod === 'DELIVERY' ? houseNo.trim() : undefined,
        streetArea: deliveryMethod === 'DELIVERY' ? streetArea.trim() : undefined,
        landmark: deliveryMethod === 'DELIVERY' ? landmark.trim() : undefined,
        city: deliveryMethod === 'DELIVERY' ? city.trim() : undefined,
        pincode: deliveryMethod === 'DELIVERY' ? pincode.trim() : undefined,
        deliveryNote: deliveryMethod === 'DELIVERY' ? deliveryNote.trim() : undefined,
        customerNote: customerNote.trim() || undefined,
        items: payload,
      });

      if (result.success && result.invoiceNumber) {
        setCompletedInvoice(result.invoiceNumber);
        clearCart(brandId);

        if (result.whatsAppUrl) {
          window.open(result.whatsAppUrl, '_blank');
        }
      } else {
        setErrorMessage(result.error || 'Failed to place order.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error communicating with server';
      setErrorMessage(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full flex-1">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <ShoppingBag className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>{brand.name} Checkout</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            Review Your Order
          </h1>
        </div>

        <Link
          href={`/${brand.id}/catalog`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Browsing {brand.name}</span>
        </Link>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/80 border border-red-300 dark:border-red-800 text-xs text-red-900 dark:text-red-200 flex items-center gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
          <div>
            <p className="font-bold text-slate-900 dark:text-white">Validation Notice</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">Your {brand.name} cart is empty</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Add genuine items from {brand.name} to generate an itemized WhatsApp order.
            </p>
          </div>
          <Link
            href={`/${brand.id}/catalog`}
            className="inline-block px-6 py-3 rounded-xl bg-cyan-600 dark:bg-cyan-500 hover:bg-cyan-500 text-white dark:text-slate-950 font-bold text-xs shadow-lg transition-all"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Cart Items List + Details Form */}
          <div className="lg:col-span-8 space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <span>Selected Items ({items.length})</span>
                <button
                  onClick={() => clearCart(brand.id)}
                  className="hover:text-red-500 transition-colors font-medium"
                >
                  Clear All
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-850">
                {items.map(({ item, quantity }) => {
                  const price = item.offerPrice ?? item.originalPrice ?? 0;
                  const itemImage =
                    item.images.find((img) => img.isPrimary)?.imageUrl ||
                    item.images[0]?.imageUrl ||
                    'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=400&q=80';

                  return (
                    <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                          <Image
                            src={itemImage}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>

                        <div>
                          <Link
                            href={`/${brand.id}/products/${item.slug}`}
                            className="font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:underline line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {item.categoryName} • Unit: {formatPriceWithUnit(price, item.unitType, item.unitValue)}
                          </p>
                          <p className="text-sm font-extrabold text-cyan-700 dark:text-cyan-400 mt-1">
                            {formatPrice(price * quantity)}
                          </p>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="flex items-center bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-300 dark:border-slate-700 p-1">
                          <button
                            onClick={() => updateQuantity(brand.id, item.id, quantity - 1)}
                            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white rounded"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 text-xs font-bold text-slate-900 dark:text-white min-w-8 text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(brand.id, item.id, quantity + 1)}
                            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white rounded"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(brand.id, item.id)}
                          className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Customer Information (Required) */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-950 dark:text-white uppercase tracking-wider">
                  Customer Information <span className="text-red-500">*</span>
                </h2>
                <span className="text-[11px] text-slate-500">Required for official invoice generation</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Sam"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Phone Number (WhatsApp)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 9791719662"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="e.g. customer@example.com"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Method Selection */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-950 dark:text-white uppercase tracking-wider">
                  Delivery Method <span className="text-red-500">*</span>
                </h2>
                <span className="text-[11px] text-slate-500">Choose how you wish to receive your items</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('PICKUP')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    deliveryMethod === 'PICKUP'
                      ? 'bg-cyan-50/80 dark:bg-slate-800 border-cyan-500 shadow-sm ring-1 ring-cyan-500/40'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Store className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Shop Pickup</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Collect your order directly from the store.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod('DELIVERY')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    deliveryMethod === 'DELIVERY'
                      ? 'bg-emerald-50/80 dark:bg-slate-800 border-emerald-500 shadow-sm ring-1 ring-emerald-500/40'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Doorstep Delivery</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Delivery available. Additional delivery charge applies based on your location.
                  </p>
                </button>
              </div>

              {/* Delivery Charge Notice */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <p>
                  Delivery charges will be calculated by our team based on your delivery location and confirmed before dispatch.
                </p>
              </div>

              {/* Doorstep Delivery Address Form (Only visible for Doorstep Delivery) */}
              {deliveryMethod === 'DELIVERY' && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in-50 duration-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Doorstep Delivery Address <span className="text-red-500">*</span>
                    </h3>
                    <span className="text-[10px] text-slate-500">All address fields required</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        House / Door No <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={houseNo}
                        onChange={(e) => setHouseNo(e.target.value)}
                        placeholder="e.g. 12/4"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        Street / Area <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={streetArea}
                        onChange={(e) => setStreetArea(e.target.value)}
                        placeholder="e.g. Bharathi Nagar"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        Landmark <span className="text-slate-400 text-[10px]">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        placeholder="e.g. Near XYZ School"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Coimbatore"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          Pincode <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                          placeholder="e.g. 641012"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-mono"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Delivery Instructions / Note:
                    </label>
                    <input
                      type="text"
                      value={deliveryNote}
                      onChange={(e) => setDeliveryNote(e.target.value)}
                      placeholder="e.g. Call before delivery / Leave at security desk"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}

              {/* General Order Notes */}
              <div className="pt-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  General Customer Note / Special Instructions:
                </label>
                <textarea
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="e.g. Specific fish variant request / Preferred dispatch time..."
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Summary & WhatsApp CTA */}
          <div className="lg:col-span-4 space-y-4">
            {completedInvoice ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    Order Submitted!
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Your order status is <span className="font-bold text-amber-500">PENDING</span> stock confirmation.
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-emerald-500/20">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Your Invoice Number</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{completedInvoice}</div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  WhatsApp chat was launched to send your request. An admin will review stock and dispatch a confirmation email to <strong className="text-slate-700 dark:text-slate-300">{customerEmail}</strong> upon approval.
                </p>
                <Link
                  href={`/${brand.id}/catalog`}
                  className="block w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5 sticky top-24">
                <h2 className="text-base font-bold text-slate-950 dark:text-white tracking-tight pb-3 border-b border-slate-200 dark:border-slate-800">
                  Order Summary
                </h2>

                <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Subtotal / MRP Value ({items.reduce((s, i) => s + i.quantity, 0)} items):</span>
                    <span className="font-semibold text-slate-950 dark:text-white">{formatPrice(originalSubtotal)}</span>
                  </div>

                  {savings > 0 && (
                    <div className="flex justify-between text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
                      <span className="flex items-center gap-1 font-semibold">
                        <Sparkles className="w-3.5 h-3.5" />
                        Savings:
                      </span>
                      <span className="font-bold">-{formatPrice(savings)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Products Total:</span>
                    <span className="font-semibold text-slate-950 dark:text-white">{formatPrice(payableTotal)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Delivery:</span>
                    {deliveryMethod === 'PICKUP' ? (
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">₹0 (Shop Pickup)</span>
                    ) : (
                      <span className="font-semibold text-amber-600 dark:text-amber-400 text-right">To be confirmed based on location</span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                        {deliveryMethod === 'PICKUP' ? 'Grand Total' : 'Current Products Total'}
                      </span>
                      <span className="text-2xl font-black text-slate-950 dark:text-white">{formatPrice(payableTotal)}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 text-right">
                      {deliveryMethod === 'PICKUP' ? 'Pay on pickup' : 'Pay on delivery'}
                    </span>
                  </div>

                  {deliveryMethod === 'DELIVERY' && (
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-xl text-[11px] text-amber-900 dark:text-amber-300">
                      Your final amount will include the delivery charge confirmed by our team.
                    </div>
                  )}
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Checkout CTA */}
                <button
                  onClick={handleCheckout}
                  disabled={isVerifying}
                  className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/30 transition-all transform active:scale-98 disabled:opacity-50"
                  id="main-cart-whatsapp-checkout"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating Order & Invoice...</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-5 h-5 fill-white text-white" />
                      <span>Create Order & Open WhatsApp</span>
                    </>
                  )}
                </button>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                  <p className="flex items-center gap-1.5 text-slate-900 dark:text-slate-300 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Authoritative Invoice Generated</span>
                  </p>
                  <p>Order is registered server-side with a unique invoice number. Stock is atomically reserved upon admin confirmation.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

