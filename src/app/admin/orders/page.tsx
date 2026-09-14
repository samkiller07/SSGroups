'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Order, OrderStatus, OrderItem, BrandId } from '@/types';
import { BRANDS } from '@/config/brands';
import { formatPrice } from '@/lib/utils';
import { 
  getAdminOrdersAction, 
  confirmAdminOrderAction, 
  cancelAdminOrderAction,
  updateOrderDeliveryChargeAction,
  adminLogoutAction 
} from '@/app/actions/admin-actions';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  User, 
  Phone, 
  Mail, 
  Truck, 
  Store, 
  ArrowLeft, 
  RotateCcw, 
  AlertTriangle, 
  Check, 
  X, 
  ExternalLink, 
  Layers, 
  Boxes, 
  Megaphone, 
  Lock, 
  LogOut, 
  ChevronRight, 
  ShieldCheck, 
  Send, 
  AlertCircle, 
  Loader2,
  DollarSign,
  Calendar,
  Eye,
  HelpCircle,
  Menu,
  Save,
  MapPin
} from 'lucide-react';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [kpis, setKpis] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    cancelledOrders: 0,
    confirmedRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isPendingTransition, startTransition] = useTransition();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Selected Order for Details Drawer
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deliveryChargeInput, setDeliveryChargeInput] = useState<string>('');
  const [isSavingDeliveryCharge, setIsSavingDeliveryCharge] = useState(false);

  // Dialog states for Confirm & Cancel
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [actionProcessing, setActionProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Sync delivery charge input when selected order changes
  useEffect(() => {
    if (selectedOrder) {
      if (selectedOrder.deliveryCharge !== null && selectedOrder.deliveryCharge !== undefined) {
        setDeliveryChargeInput(String(selectedOrder.deliveryCharge));
      } else {
        setDeliveryChargeInput('');
      }
    }
  }, [selectedOrder?.id, selectedOrder?.deliveryCharge]);

  // Load orders from authoritative server action
  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const filters: { brandId?: string; status?: OrderStatus; search?: string } = {};
      if (selectedBrand !== 'all') filters.brandId = selectedBrand;
      if (selectedStatus !== 'all') filters.status = selectedStatus as OrderStatus;
      if (searchQuery.trim()) filters.search = searchQuery.trim();

      const result = await getAdminOrdersAction(filters);
      if (result.success && result.orders) {
        setOrders(result.orders);
        if (result.kpis) setKpis(result.kpis);

        // If drawer is open, keep selected order up to date
        if (selectedOrder) {
          const updated = result.orders.find((o) => o.id === selectedOrder.id);
          if (updated) setSelectedOrder(updated);
        }
      }
    } catch (err: unknown) {
      console.error('Failed to load orders:', err);
      showToast('Failed to retrieve orders from database', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [selectedBrand, selectedStatus, searchQuery]);

  // Save manual delivery charge
  const handleSaveDeliveryCharge = async () => {
    if (!selectedOrder) return;
    const num = parseFloat(deliveryChargeInput.trim());
    if (isNaN(num) || num < 0) {
      showToast('Please enter a valid non-negative delivery charge (e.g. 80).', 'error');
      return;
    }

    setIsSavingDeliveryCharge(true);
    try {
      const res = await updateOrderDeliveryChargeAction({
        orderId: selectedOrder.id,
        deliveryCharge: num,
      });

      if (res.success && res.order) {
        showToast(res.message || `Delivery charge of ₹${num} saved.`, 'success');
        setSelectedOrder(res.order);
        await loadOrders();
      } else {
        showToast(res.error || 'Failed to update delivery charge.', 'error');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating delivery charge';
      showToast(msg, 'error');
    } finally {
      setIsSavingDeliveryCharge(false);
    }
  };

  // Open Confirm Modal with validation
  const handleOpenConfirmModal = () => {
    if (!selectedOrder) return;
    setActionError(null);

    const isDelivery = selectedOrder.deliveryMethod === 'DELIVERY' || (selectedOrder.deliveryMethod as string) === 'HOME_DELIVERY';
    if (isDelivery && (selectedOrder.deliveryCharge === null || selectedOrder.deliveryCharge === undefined)) {
      showToast('Please set the delivery charge before confirming this delivery order.', 'error');
      return;
    }

    setIsConfirmModalOpen(true);
  };

  // Execute Atomic Confirmation
  const handleConfirmOrder = async () => {
    if (!selectedOrder) return;
    setActionProcessing(true);
    setActionError(null);

    try {
      const res = await confirmAdminOrderAction(selectedOrder.id);
      if (res.success && res.order) {
        showToast(res.message, res.emailSent ? 'success' : 'info');
        setIsConfirmModalOpen(false);
        setSelectedOrder(res.order);
        await loadOrders();
      } else {
        setActionError(res.error || 'Failed to confirm order.');
        showToast(res.error || 'Failed to confirm order', 'error');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error confirming order';
      setActionError(msg);
      showToast(msg, 'error');
    } finally {
      setActionProcessing(false);
    }
  };

  // Execute Order Cancellation
  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    setActionProcessing(true);
    setActionError(null);

    try {
      const res = await cancelAdminOrderAction(selectedOrder.id);
      if (res.success && res.order) {
        showToast(res.message, 'success');
        setIsCancelModalOpen(false);
        setSelectedOrder(res.order);
        await loadOrders();
      } else {
        setActionError(res.error || 'Failed to cancel order.');
        showToast(res.error || 'Failed to cancel order', 'error');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error cancelling order';
      setActionError(msg);
      showToast(msg, 'error');
    } finally {
      setActionProcessing(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3 animate-pulse" />
            PENDING
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            CONFIRMED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            CANCELLED
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-xl border shadow-xl text-xs font-semibold flex items-center justify-between gap-3 pointer-events-auto transition-all transform animate-in slide-in-from-bottom-2 ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-700/60'
                : toast.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-700/60'
                : 'bg-cyan-950/90 text-cyan-200 border-cyan-700/60'
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 sticky top-0 z-30 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-black text-sm">
              SS
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-white">SS Admin Suite</div>
              <div className="text-[10px] text-cyan-400 font-mono">Orders Management</div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Boxes className="w-3.5 h-3.5 text-cyan-400" />
            <span>Manage Catalog</span>
          </Link>

          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/80 hover:text-rose-300 text-slate-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </header>

      {/* Main Content Body */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 gap-8">
        <main className="flex-1 space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
              <div className="text-2xl font-black text-white">{kpis.totalOrders}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Pending Review</span>
              <div className="text-2xl font-black text-amber-400">{kpis.pendingOrders}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Confirmed Orders</span>
              <div className="text-2xl font-black text-emerald-400">{kpis.confirmedOrders}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Confirmed Revenue</span>
              <div className="text-2xl font-black text-cyan-400">{formatPrice(kpis.confirmedRevenue)}</div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search invoice, customer, phone..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">All Brands</option>
                <option value="aquarium">SS Aquarium</option>
                <option value="kirubai">Kirubai Cloud Kitchen</option>
                <option value="vision-360">SS Vision 360</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <button
                onClick={loadOrders}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Refresh Orders"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            {isLoading ? (
              <div className="p-16 text-center text-slate-500 text-xs flex flex-col items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
                <span>Loading persistent orders from Supabase...</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-base font-bold text-slate-200">No Orders Found</div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {searchQuery || selectedBrand !== 'all' || selectedStatus !== 'all'
                    ? 'No orders match your current filter and search criteria.'
                    : 'Customer checkout orders will appear here once submitted from storefronts.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Invoice No</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Brand</th>
                      <th className="py-3 px-4">Fulfillment</th>
                      <th className="py-3 px-4">Products</th>
                      <th className="py-3 px-4">Delivery Fee</th>
                      <th className="py-3 px-4">Grand Total</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {orders.map((order) => {
                      const brand = BRANDS[order.brandId];
                      const isDelivery = order.deliveryMethod === 'DELIVERY' || (order.deliveryMethod as string) === 'HOME_DELIVERY';
                      const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      const productsTotal = Number(order.totalAmount || 0);
                      const deliveryFee = order.deliveryCharge !== null && order.deliveryCharge !== undefined
                        ? formatPrice(order.deliveryCharge)
                        : (isDelivery ? 'Pending' : '₹0');
                      const grandTotal = isDelivery && (order.deliveryCharge === null || order.deliveryCharge === undefined)
                        ? `${formatPrice(productsTotal)} + Fee`
                        : formatPrice(order.finalTotal || productsTotal + Number(order.deliveryCharge || 0));

                      return (
                        <tr
                          key={order.id}
                          className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                            {order.invoiceNumber}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{order.customerName}</div>
                            <div className="text-[11px] text-slate-400">{order.customerPhone}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300">
                              {brand?.name || order.brandId}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-1 w-fit ${
                              isDelivery ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50' : 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/50'
                            }`}>
                              {isDelivery ? <Truck className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                              <span>{isDelivery ? 'Delivery' : 'Pickup'}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-200">
                            {formatPrice(productsTotal)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`font-semibold ${isDelivery && order.deliveryCharge === null ? 'text-amber-400 font-mono text-[11px]' : 'text-slate-300'}`}>
                              {deliveryFee}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-white">
                            {grandTotal}
                          </td>
                          <td className="py-3.5 px-4">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                            {formattedDate}
                          </td>
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Order Details Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="relative w-full max-w-xl bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col h-full text-slate-100 overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black text-cyan-400">
                    {selectedOrder.invoiceNumber}
                  </span>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {BRANDS[selectedOrder.brandId]?.name || selectedOrder.brandId}
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-6 flex-1 text-xs">
              {/* Customer Information Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Customer & Delivery Details
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Customer Name</span>
                    <span className="font-bold text-white text-sm">{selectedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Fulfillment Mode</span>
                    <span className="font-semibold text-cyan-300 flex items-center gap-1.5 mt-0.5">
                      {selectedOrder.deliveryMethod === 'DELIVERY' || (selectedOrder.deliveryMethod as string) === 'HOME_DELIVERY' ? (
                        <>
                          <Truck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Doorstep Delivery</span>
                        </>
                      ) : (
                        <>
                          <Store className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Shop Pickup</span>
                        </>
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Phone (WhatsApp)</span>
                    <a href={`tel:${selectedOrder.customerPhone}`} className="text-slate-200 hover:underline">
                      {selectedOrder.customerPhone}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Email Address</span>
                    <a href={`mailto:${selectedOrder.customerEmail}`} className="text-slate-200 hover:underline truncate block">
                      {selectedOrder.customerEmail}
                    </a>
                  </div>
                </div>

                {/* Structured Delivery Address Box (if Delivery) */}
                {(selectedOrder.deliveryMethod === 'DELIVERY' || (selectedOrder.deliveryMethod as string) === 'HOME_DELIVERY') && (
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5 mt-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Doorstep Delivery Address</span>
                    </div>
                    <div className="text-slate-200 font-medium leading-relaxed">
                      {selectedOrder.deliveryAddress || 'Address on file'}
                    </div>
                    {selectedOrder.deliveryLandmark && (
                      <div className="text-slate-400 text-[11px]">
                        <span className="text-slate-500">Landmark:</span> {selectedOrder.deliveryLandmark}
                      </div>
                    )}
                    <div className="text-slate-400 text-[11px]">
                      <span className="text-slate-500">City / Pincode:</span> {selectedOrder.deliveryCity || 'Coimbatore'} {selectedOrder.deliveryPincode ? `— ${selectedOrder.deliveryPincode}` : ''}
                    </div>
                    {selectedOrder.deliveryNote && (
                      <div className="text-amber-300/90 text-[11px] pt-1 border-t border-slate-800 mt-1">
                        <span className="text-slate-500">Delivery Instructions:</span> {selectedOrder.deliveryNote}
                      </div>
                    )}
                  </div>
                )}

                {selectedOrder.customerNote && (
                  <div className="pt-2 border-t border-slate-850 mt-2">
                    <span className="text-slate-500 block text-[10px]">General Customer Note</span>
                    <p className="text-slate-300 italic">{selectedOrder.customerNote}</p>
                  </div>
                )}
              </div>

              {/* Order Items List */}
              <div className="space-y-3">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Ordered Products & Services
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden divide-y divide-slate-850">
                  {(selectedOrder.items || []).map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">{item.productName}</div>
                        <div className="text-[11px] text-slate-400">
                          Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                        </div>
                        {item.originalPrice && item.originalPrice > item.unitPrice && (
                          <div className="text-[10px] text-emerald-400">
                            MRP: {formatPrice(item.originalPrice)} each · Savings: {formatPrice((item.originalPrice - item.unitPrice) * item.quantity)}
                          </div>
                        )}
                      </div>
                      <div className="font-extrabold text-white text-sm">
                        {formatPrice(item.lineTotal)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown & Delivery Charge Form */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal / MRP Value:</span>
                    <span className="text-white font-semibold">{formatPrice(selectedOrder.subtotal)}</span>
                  </div>

                  {selectedOrder.savings > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Total Savings:</span>
                      <span>-{formatPrice(selectedOrder.savings)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-850">
                    <span className="font-semibold">Products Total:</span>
                    <span className="text-white font-bold">{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>

                  {/* Manual Delivery Charge Configuration for Delivery Orders */}
                  {(selectedOrder.deliveryMethod === 'DELIVERY' || (selectedOrder.deliveryMethod as string) === 'HOME_DELIVERY') ? (
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Delivery Charge (₹)</span>
                        </label>
                        {selectedOrder.status !== 'PENDING' && (
                          <span className="text-[10px] text-slate-500 font-mono">Locked (Confirmed)</span>
                        )}
                      </div>

                      {selectedOrder.status === 'PENDING' ? (
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={deliveryChargeInput}
                              onChange={(e) => setDeliveryChargeInput(e.target.value)}
                              placeholder="e.g. 80"
                              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                            />
                          </div>

                          <button
                            onClick={handleSaveDeliveryCharge}
                            disabled={isSavingDeliveryCharge}
                            className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 text-xs font-black rounded-xl transition-colors flex items-center gap-1 shrink-0"
                          >
                            {isSavingDeliveryCharge ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Save className="w-3.5 h-3.5" />
                            )}
                            <span>Save Charge</span>
                          </button>
                        </div>
                      ) : (
                        <div className="text-sm font-extrabold text-emerald-400 font-mono">
                          {formatPrice(selectedOrder.deliveryCharge || 0)}
                        </div>
                      )}

                      {selectedOrder.status === 'PENDING' && (selectedOrder.deliveryCharge === null || selectedOrder.deliveryCharge === undefined) && (
                        <p className="text-[11px] text-amber-400 font-medium">
                          ⚠️ Delivery charge is pending. You must save a delivery charge before confirming this order.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex justify-between text-slate-400">
                      <span>Delivery Charge:</span>
                      <span className="text-emerald-400 font-semibold">₹0 (Shop Pickup)</span>
                    </div>
                  )}

                  {/* Grand Total */}
                  <div className="flex justify-between text-sm font-black pt-3 border-t border-slate-800">
                    <span className="text-white">Grand Total:</span>
                    <span className="text-cyan-400 text-base font-mono">
                      {(selectedOrder.deliveryMethod === 'DELIVERY' || (selectedOrder.deliveryMethod as string) === 'HOME_DELIVERY') && (selectedOrder.deliveryCharge === null || selectedOrder.deliveryCharge === undefined)
                        ? `${formatPrice(selectedOrder.totalAmount)} (Pending Charge)`
                        : formatPrice(selectedOrder.finalTotal || (selectedOrder.totalAmount + (selectedOrder.deliveryCharge || 0)))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lifecycle & Email Status */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Order Audit & Notifications
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-400">
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span className="text-slate-300 font-mono">
                      {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                  {selectedOrder.confirmedAt && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Confirmed At:</span>
                      <span className="font-mono">{new Date(selectedOrder.confirmedAt).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {selectedOrder.cancelledAt && (
                    <div className="flex justify-between text-rose-400">
                      <span>Cancelled At:</span>
                      <span className="font-mono">{new Date(selectedOrder.cancelledAt).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 border-t border-slate-850">
                    <span>Confirmation Email:</span>
                    {selectedOrder.confirmationEmailSentAt ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Sent ({new Date(selectedOrder.confirmationEmailSentAt).toLocaleTimeString('en-IN')})
                      </span>
                    ) : selectedOrder.confirmationEmailError ? (
                      <span className="text-rose-400 font-semibold flex items-center gap-1" title={selectedOrder.confirmationEmailError}>
                        <AlertCircle className="w-3 h-3" /> Failed
                      </span>
                    ) : (
                      <span className="text-slate-500">Not Dispatched</span>
                    )}
                  </div>
                  {selectedOrder.confirmationEmailError && (
                    <div className="p-2 bg-rose-950/40 border border-rose-900/60 rounded text-[10px] text-rose-300 mt-1">
                      Email Error: {selectedOrder.confirmationEmailError}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Drawer Actions for PENDING orders */}
            <div className="p-5 border-t border-slate-800 bg-slate-950 sticky bottom-0">
              {selectedOrder.status === 'PENDING' ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setActionError(null);
                      setIsCancelModalOpen(true);
                    }}
                    className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-rose-950/80 hover:text-rose-300 hover:border-rose-800 border border-slate-800 text-xs font-bold text-slate-300 transition-colors"
                  >
                    Cancel Order
                  </button>

                  <button
                    onClick={handleOpenConfirmModal}
                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-950/40 transition-all active:scale-98"
                  >
                    Confirm & Deduct Stock
                  </button>
                </div>
              ) : selectedOrder.status === 'CONFIRMED' ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-xs font-bold text-emerald-400">
                  ✓ Order has been confirmed and stock deducted.
                </div>
              ) : (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-center text-xs font-bold text-rose-400">
                  ✗ Order has been cancelled. Stock remained untouched.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-black text-white">Confirm Order {selectedOrder.invoiceNumber}?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                This action executes an <strong>atomic stock deduction</strong> for all items and dispatches an official branded confirmation email to <strong>{selectedOrder.customerEmail}</strong>.
              </p>
              <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-left space-y-1 font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Products Total:</span>
                  <span className="text-white">{formatPrice(selectedOrder.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Delivery Charge:</span>
                  <span className="text-emerald-400">
                    {selectedOrder.deliveryMethod === 'PICKUP' ? '₹0' : formatPrice(selectedOrder.deliveryCharge || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-white font-bold pt-1 border-t border-slate-800">
                  <span>Grand Total:</span>
                  <span className="text-cyan-400">
                    {formatPrice(selectedOrder.finalTotal || (selectedOrder.totalAmount + (selectedOrder.deliveryCharge || 0)))}
                  </span>
                </div>
              </div>
            </div>

            {actionError && (
              <div className="p-3 bg-rose-950/50 border border-rose-700/60 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={actionProcessing}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOrder}
                disabled={actionProcessing}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {actionProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deducting Stock...</span>
                  </>
                ) : (
                  <span>Yes, Confirm Order</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {isCancelModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-black text-white">Cancel Order {selectedOrder.invoiceNumber}?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                The order will be transitioned to <strong>CANCELLED</strong>. Inventory stock will remain <strong>completely untouched</strong>. This action cannot be reversed.
              </p>
            </div>

            {actionError && (
              <div className="p-3 bg-rose-950/50 border border-rose-700/60 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                disabled={actionProcessing}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={actionProcessing}
                className="py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-900/40 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {actionProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Yes, Cancel Order</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
