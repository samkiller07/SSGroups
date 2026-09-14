'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { dataRepository } from '@/lib/data-store';
import { BRANDS } from '@/config/brands';
import { BrandConfig, Category, CatalogItem, ItemType, ProductImage, UnitType } from '@/types';
import { formatPrice, slugify } from '@/lib/utils';
import { formatPriceWithUnit, formatStockDisplay, SUPPORTED_UNITS } from '@/lib/units';
import { 
  saveCatalogItemAction, 
  deleteCatalogItemAction, 
  updateItemStockAction,
  saveCategoryAction, 
  deleteCategoryAction, 
  saveBrandSettingsAction,
  saveBrandLogoAction,
  saveDailyStatusAction,
  deleteDailyStatusAction,
  toggleDailyStatusActiveAction,
  adminLogoutAction,
  getAdminCatalogAction
} from '@/app/actions/admin-actions';
import { DEFAULT_BRAND_LOGOS } from '@/config/brand-logos';
import { isSupabaseConfigured } from '@/lib/supabase';
import { 
  Lock, 
  LogOut, 
  Layers, 
  ShoppingBag, 
  FileText,
  Wrench, 
  Tag, 
  Sparkles, 

  Plus, 
  Minus,
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Search, 
  Image as ImageIcon, 
  Settings, 
  Database, 
  ArrowLeft, 
  Phone, 
  Clock, 
  MapPin, 
  Truck, 
  Copy, 
  ExternalLink,
  ShieldCheck,
  Fish,
  UtensilsCrossed,
  UploadCloud,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Package,
  RotateCcw,
  Eye,
  Sliders,
  Calendar,
  Megaphone,
  Smartphone,
  Monitor,
  Radio,
  CheckCircle2,
  XCircle,
  Flame,
  Bell,
  Zap,
  ChevronRight,
  Menu,
  Activity,
  Boxes,
  TrendingDown,
  Info
} from 'lucide-react';
import { DailyStatus, StatusType } from '@/types';

type AdminTab = 'ITEMS' | 'INVENTORY' | 'DAILY_STATUS' | 'CATEGORIES' | 'BRAND_IDENTITY' | 'BRAND_SETTINGS';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeBrandId, setActiveBrandId] = useState<string>('aquarium');
  const [activeTab, setActiveTab] = useState<AdminTab>('ITEMS');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Search & Filter state for Items
  const [itemSearch, setItemSearch] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState<'ALL' | 'PRODUCT' | 'SERVICE'>('ALL');

  // Search & Filter state for Inventory
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('ALL');
  const [inventoryStockFilter, setInventoryStockFilter] = useState<'ALL' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'IN_STOCK'>('ALL');
  const [stockEditingId, setStockEditingId] = useState<string | null>(null);
  const [stockEditValue, setStockEditValue] = useState<string>('');
  const [stockUpdatingId, setStockUpdatingId] = useState<string | null>(null);

  // Trigger state for data reload
  const [dataVersion, setDataVersion] = useState(0);

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Brand Logo Management State
  const [logoInputUrl, setLogoInputUrl] = useState('');
  const [logoPreviewBg, setLogoPreviewBg] = useState<'dark' | 'light' | 'checkerboard'>('dark');
  const [logoUploadLoading, setLogoUploadLoading] = useState(false);
  const [logoSaveSuccess, setLogoSaveSuccess] = useState(false);
  const [logoError, setLogoError] = useState('');

  // Item Form State
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formItemType, setFormItemType] = useState<ItemType>('PRODUCT');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formOriginalPrice, setFormOriginalPrice] = useState<string>('');
  const [formOfferPrice, setFormOfferPrice] = useState<string>('');
  const [formUnitType, setFormUnitType] = useState<UnitType>('piece');
  const [formUnitValue, setFormUnitValue] = useState<string>('1');
  const [formStockQuantity, setFormStockQuantity] = useState<string>('10');
  const [formBadge, setFormBadge] = useState('');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsHeroOffer, setFormIsHeroOffer] = useState(false);
  const [formIsAvailable, setFormIsAvailable] = useState(true);
  const [formIsClientVerified, setFormIsClientVerified] = useState(false);
  const [formImages, setFormImages] = useState<{ url: string; alt: string; isPrimary: boolean }[]>([
    { url: '', alt: '', isPrimary: true }
  ]);

  // Category Form State
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catSortOrder, setCatSortOrder] = useState('1');
  const [catIsActive, setCatIsActive] = useState(true);

  // Daily Status State (Hero Status System)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<DailyStatus | null>(null);
  const [selectedPreviewStatusId, setSelectedPreviewStatusId] = useState<string | null>(null);
  const [statusPreviewMode, setStatusPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [statusTitle, setStatusTitle] = useState('');
  const [statusShortMsg, setStatusShortMsg] = useState('');
  const [statusDetailedMsg, setStatusDetailedMsg] = useState('');
  const [statusImageUrl, setStatusImageUrl] = useState('');
  const [statusCtaLabel, setStatusCtaLabel] = useState('');
  const [statusCtaDest, setStatusCtaDest] = useState('');
  const [statusPublishDate, setStatusPublishDate] = useState('');
  const [statusExpiryDate, setStatusExpiryDate] = useState('');
  const [statusType, setStatusType] = useState<StatusType>('DAILY_UPDATE');
  const [statusPriority, setStatusPriority] = useState('1');
  const [statusIsActive, setStatusIsActive] = useState(true);
  const [statusUploadLoading, setStatusUploadLoading] = useState(false);

  // Brand Settings State
  const [brandTagline, setBrandTagline] = useState('');
  const [brandDesc, setBrandDesc] = useState('');
  const [brandPhone1, setBrandPhone1] = useState('');
  const [brandPhone2, setBrandPhone2] = useState('');
  const [brandWhatsApp, setBrandWhatsApp] = useState('');
  const [brandOpenTime, setBrandOpenTime] = useState('');
  const [brandCloseTime, setBrandCloseTime] = useState('');
  const [brandHoliday, setBrandHoliday] = useState('');
  const [brandAddress, setBrandAddress] = useState('');
  const [brandPlusCode, setBrandPlusCode] = useState('');
  const [brandDeliveryRadius, setBrandDeliveryRadius] = useState('2');
  const [brandDeliveryNote, setBrandDeliveryNote] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [activeBrand, setActiveBrand] = useState<BrandConfig>(() => dataRepository.getBrand(activeBrandId) || BRANDS.aquarium);
  const [categories, setCategories] = useState<Category[]>(() => dataRepository.getAllCategoriesForAdmin(activeBrandId));
  const [allItems, setAllItems] = useState<CatalogItem[]>(() => dataRepository.getAllCatalogItemsForAdmin(activeBrandId));
  const [allDailyStatuses, setAllDailyStatuses] = useState<DailyStatus[]>(() => dataRepository.getAllDailyStatusesForAdmin(activeBrandId));
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);

  const activeDailyStatuses = allDailyStatuses.filter((s) => s.isActive);

  const loadCatalogData = async (brandId: string) => {
    setIsCatalogLoading(true);
    try {
      const res = await getAdminCatalogAction(brandId);
      if (res && res.success) {
        if (res.items) setAllItems(res.items);
        if (res.categories) setCategories(res.categories);
        if (res.statuses) setAllDailyStatuses(res.statuses as any);
        if (res.brand) setActiveBrand(res.brand as any);
      }
    } catch (err) {
      console.error('[AdminDashboard] Failed to load catalog from Supabase:', err);
    } finally {
      setIsCatalogLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogData(activeBrandId);
  }, [activeBrandId, dataVersion]);

  // Inventory-specific calculations
  const productItems = allItems.filter((i) => i.itemType === 'PRODUCT');
  const inStockCount = productItems.filter((i) => (i.stockQuantity ?? 0) > 5 && i.isAvailable).length;
  const lowStockCount = productItems.filter((i) => (i.stockQuantity ?? 0) > 0 && (i.stockQuantity ?? 0) <= 5 && i.isAvailable).length;
  const outOfStockCount = productItems.filter((i) => (i.stockQuantity ?? 0) === 0 || !i.isAvailable).length;

  // Filtered inventory list
  const filteredInventoryItems = productItems.filter((i) => {
    const matchesSearch =
      i.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      (i.categoryName && i.categoryName.toLowerCase().includes(inventorySearch.toLowerCase()));
    
    const matchesCategory = inventoryCategoryFilter === 'ALL' || i.categoryId === inventoryCategoryFilter;
    
    let matchesStock = true;
    if (inventoryStockFilter === 'LOW_STOCK') {
      matchesStock = (i.stockQuantity ?? 0) > 0 && (i.stockQuantity ?? 0) <= 5 && i.isAvailable;
    } else if (inventoryStockFilter === 'OUT_OF_STOCK') {
      matchesStock = (i.stockQuantity ?? 0) === 0 || !i.isAvailable;
    } else if (inventoryStockFilter === 'IN_STOCK') {
      matchesStock = (i.stockQuantity ?? 0) > 5 && i.isAvailable;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Load Brand Settings & Logo when active brand changes
  useEffect(() => {
    const brand = dataRepository.getBrand(activeBrandId);
    if (brand) {
      setLogoInputUrl(brand.logoUrl || DEFAULT_BRAND_LOGOS[activeBrandId] || '');
      setBrandTagline(brand.tagline);
      setBrandDesc(brand.description);
      setBrandPhone1(brand.phonePrimary);
      setBrandPhone2(brand.phoneSecondary || '');
      setBrandWhatsApp(brand.whatsappNumber);
      setBrandOpenTime(brand.openingTime);
      setBrandCloseTime(brand.closingTime);
      setBrandHoliday(brand.holiday);
      setBrandAddress(brand.address);
      setBrandPlusCode(brand.plusCode || '');
      setBrandDeliveryRadius(brand.freeDeliveryRadiusKm.toString());
      setBrandDeliveryNote(brand.deliveryNote);
      setLogoError('');
    }
  }, [activeBrandId, dataVersion]);

  // Filtered items
  const filteredItems = allItems.filter((i) => {
    const matchesSearch =
      i.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
      i.description.toLowerCase().includes(itemSearch.toLowerCase());
    const matchesType = itemTypeFilter === 'ALL' || i.itemType === itemTypeFilter;
    return matchesSearch && matchesType;
  });

  const handleLogout = async () => {
    await adminLogoutAction();
  };

  // Open Item Modal for New Item
  const handleOpenNewItem = () => {
    setEditingItem(null);
    setFormName('');
    setFormSlug('');
    setFormItemType('PRODUCT');
    setFormCategoryId(categories[0]?.id || '');
    setFormShortDesc('');
    setFormDesc('');
    setFormOriginalPrice('');
    setFormOfferPrice('');
    setFormUnitType('piece');
    setFormUnitValue('1');
    setFormStockQuantity('10');
    setFormBadge('');
    setFormIsFeatured(false);
    setFormIsHeroOffer(false);
    setFormIsAvailable(true);
    setFormIsClientVerified(activeBrandId === 'aquarium');
    setFormImages([{ url: '', alt: '', isPrimary: true }]);
    setFormError('');
    setIsItemModalOpen(true);
  };

  // Open Item Modal for Edit
  const handleOpenEditItem = (item: CatalogItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormSlug(item.slug);
    setFormItemType(item.itemType);
    setFormCategoryId(item.categoryId || categories[0]?.id || '');
    setFormShortDesc(item.shortDescription || '');
    setFormDesc(item.description);
    setFormOriginalPrice(item.originalPrice !== undefined ? item.originalPrice.toString() : '');
    setFormOfferPrice(item.offerPrice !== undefined ? item.offerPrice.toString() : '');
    setFormUnitType(item.unitType || (item.itemType === 'SERVICE' ? 'service' : 'piece'));
    setFormUnitValue((item.unitValue || 1).toString());
    setFormStockQuantity(item.stockQuantity !== null && item.stockQuantity !== undefined ? item.stockQuantity.toString() : '');
    setFormBadge(item.promotionalBadge || '');
    setFormIsFeatured(item.isFeatured);
    setFormIsHeroOffer(item.isHeroOffer);
    setFormIsAvailable(item.isAvailable);
    setFormIsClientVerified(item.isClientVerified ?? false);
    setFormImages(
      item.images.length > 0
        ? item.images.map((img) => ({ url: img.imageUrl, alt: img.altText, isPrimary: img.isPrimary }))
        : [{ url: '', alt: '', isPrimary: true }]
    );
    setFormError('');
    setIsItemModalOpen(true);
  };

  // Handle direct image file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFormError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.imageUrl) {
        const emptyIndex = formImages.findIndex((img) => !img.url.trim());
        if (emptyIndex >= 0) {
          const updated = [...formImages];
          updated[emptyIndex] = { url: data.imageUrl, alt: formName, isPrimary: emptyIndex === 0 };
          setFormImages(updated);
        } else {
          setFormImages([...formImages, { url: data.imageUrl, alt: formName, isPrimary: formImages.length === 0 }]);
        }
        showToast('Image uploaded successfully!', 'success');
      } else {
        setFormError(data.error || 'Failed to upload image');
        showToast(data.error || 'Upload failed', 'error');
      }
    } catch (err: any) {
      setFormError(err.message || 'Image upload failed');
      showToast('Image upload failed', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Save Item with Server Action & Zod
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    const validImages = formImages.filter((img) => img.url.trim().length > 0);
    if (validImages.length === 0) {
      validImages.push({
        url: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80',
        alt: formName,
        isPrimary: true,
      });
    }

    const payload = {
      id: editingItem?.id,
      brandId: activeBrandId,
      categoryId: formCategoryId || undefined,
      name: formName.trim(),
      slug: formSlug.trim() || slugify(formName),
      itemType: formItemType,
      shortDescription: formShortDesc.trim() || undefined,
      description: formDesc.trim(),
      originalPrice: formOriginalPrice ? parseFloat(formOriginalPrice) : undefined,
      offerPrice: formOfferPrice ? parseFloat(formOfferPrice) : undefined,
      unitType: formUnitType,
      unitValue: parseFloat(formUnitValue) || 1,
      stockQuantity: formItemType === 'SERVICE' ? null : (formStockQuantity ? parseInt(formStockQuantity) : 0),
      promotionalBadge: formBadge.trim() || undefined,
      isAvailable: formIsAvailable,
      isFeatured: formIsFeatured,
      isHeroOffer: formIsHeroOffer,
      isClientVerified: formIsClientVerified,
      isActive: true,
      images: validImages.map((img, idx) => ({
        imageUrl: img.url,
        altText: img.alt || formName,
        isPrimary: idx === 0,
      })),
    };

    try {
      const result = await saveCatalogItemAction(payload);
      if (result.success) {
        setIsItemModalOpen(false);
        setDataVersion((v) => v + 1);
        await loadCatalogData(activeBrandId);
        showToast(editingItem ? `Updated "${formName}" successfully!` : `Created "${formName}" successfully!`, 'success');
      } else {
        setFormError(result.error || 'Failed to save item');
        showToast(result.error || 'Save failed', 'error');
      }
    } catch (err: any) {
      setFormError(err.message || 'Error occurred while saving');
      showToast('Error saving item', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Item Action
  const handleDeleteItem = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete "${name}" from ${activeBrand.name}?`)) {
      try {
        const res = await deleteCatalogItemAction(id, activeBrandId);
        if (res.success) {
          setDataVersion((v) => v + 1);
          await loadCatalogData(activeBrandId);
          showToast(`Deleted "${name}"`, 'info');
        } else {
          showToast(res.error || 'Failed to delete item from database', 'error');
        }
      } catch (err: any) {
        showToast(err.message || 'Error deleting item', 'error');
      }
    }
  };

  // Quick Inline Stock Update Handler
  const handleInlineStockUpdate = async (itemId: string, newStock: number | null, isAvailable?: boolean) => {
    setStockUpdatingId(itemId);
    try {
      const result = await updateItemStockAction(itemId, activeBrandId, newStock, isAvailable);
      if (result.success && result.item) {
        setDataVersion((v) => v + 1);
        await loadCatalogData(activeBrandId);
        showToast(`Stock updated: ${result.item.name} (${formatStockDisplay(result.item.stockQuantity, result.item.unitType, result.item.unitValue)})`, 'success');
      } else {
        showToast(result.error || 'Failed to update stock in database', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Stock update failed', 'error');
    } finally {
      setStockUpdatingId(null);
      setStockEditingId(null);
    }
  };

  // Toggle Availability Quick Action
  const handleToggleAvailability = async (item: CatalogItem) => {
    const newAvailability = !item.isAvailable;
    await handleInlineStockUpdate(item.id, item.stockQuantity, newAvailability);
  };

  // Category Actions
  const handleOpenNewCategory = () => {
    setEditingCategory(null);
    setCatName('');
    setCatSlug('');
    setCatDesc('');
    setCatSortOrder((categories.length + 1).toString());
    setCatIsActive(true);
    setFormError('');
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatDesc(cat.description || '');
    setCatSortOrder(cat.sortOrder.toString());
    setCatIsActive(cat.isActive);
    setFormError('');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    const payload = {
      id: editingCategory?.id,
      brandId: activeBrandId,
      name: catName.trim(),
      slug: catSlug.trim() || slugify(catName),
      description: catDesc.trim() || undefined,
      sortOrder: parseInt(catSortOrder) || 1,
      isActive: catIsActive,
    };

    try {
      const result = await saveCategoryAction(payload);
      if (result.success) {
        setIsCategoryModalOpen(false);
        setDataVersion((v) => v + 1);
        await loadCatalogData(activeBrandId);
        showToast(`Category "${catName}" saved!`, 'success');
      } else {
        setFormError(result.error || 'Failed to save category');
        showToast(result.error || 'Failed to save category', 'error');
      }
    } catch (err: any) {
      setFormError(err.message || 'Error occurred while saving category');
      showToast('Error saving category', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (confirm(`Delete category "${name}"? Items linked to this category will need re-assignment.`)) {
      try {
        const res = await deleteCategoryAction(id, activeBrandId);
        if (res.success) {
          setDataVersion((v) => v + 1);
          await loadCatalogData(activeBrandId);
          showToast(`Deleted category "${name}"`, 'info');
        } else {
          showToast(res.error || 'Failed to delete category', 'error');
        }
      } catch (err: any) {
        showToast(err.message || 'Error deleting category', 'error');
      }
    }
  };

  // Brand Logo Management Handlers
  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploadLoading(true);
    setLogoError('');
    setLogoSaveSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.imageUrl) {
        setLogoInputUrl(data.imageUrl);
        const result = await saveBrandLogoAction(activeBrandId, data.imageUrl);
        if (result.success) {
          setLogoSaveSuccess(true);
          setDataVersion((v) => v + 1);
          showToast(`Uploaded and updated logo for ${activeBrand.name}!`, 'success');
        } else {
          setLogoError(result.error || 'Failed to save logo to brand profile');
        }
      } else {
        setLogoError(data.error || 'Logo upload failed');
      }
    } catch (err: any) {
      setLogoError(err.message || 'Image upload error');
    } finally {
      setLogoUploadLoading(false);
    }
  };

  const handleSaveLogoUrl = async () => {
    setLogoUploadLoading(true);
    setLogoError('');
    setLogoSaveSuccess(false);

    try {
      const result = await saveBrandLogoAction(activeBrandId, logoInputUrl.trim() || null);
      if (result.success) {
        setLogoSaveSuccess(true);
        setDataVersion((v) => v + 1);
        showToast(`Logo updated for ${activeBrand.name}!`, 'success');
      } else {
        setLogoError(result.error || 'Failed to update logo');
      }
    } catch (err: any) {
      setLogoError(err.message || 'Error occurred while saving logo');
    } finally {
      setLogoUploadLoading(false);
    }
  };

  const handleResetToDefaultLogo = async () => {
    if (confirm(`Reset ${activeBrand.name} logo to default vector SVG?`)) {
      const defaultLogo = DEFAULT_BRAND_LOGOS[activeBrandId] || '';
      setLogoInputUrl(defaultLogo);
      const result = await saveBrandLogoAction(activeBrandId, defaultLogo);
      if (result.success) {
        setLogoSaveSuccess(true);
        setDataVersion((v) => v + 1);
        showToast(`Reset ${activeBrand.name} logo to default vector`, 'info');
      }
    }
  };

  // Daily Hero Status Handlers
  const handleOpenNewDailyStatus = () => {
    setEditingStatus(null);
    setStatusTitle('');
    setStatusShortMsg('');
    setStatusDetailedMsg('');
    setStatusImageUrl('');
    setStatusCtaLabel('');
    setStatusCtaDest('');
    const today = new Date().toISOString().split('T')[0];
    setStatusPublishDate(today);
    setStatusExpiryDate('');
    setStatusType('DAILY_UPDATE');
    setStatusPriority('1');
    setStatusIsActive(true);
    setFormError('');
    setIsStatusModalOpen(true);
  };

  const handleOpenEditDailyStatus = (status: DailyStatus) => {
    setEditingStatus(status);
    setStatusTitle(status.title);
    setStatusShortMsg(status.shortMessage);
    setStatusDetailedMsg(status.detailedMessage || '');
    setStatusImageUrl(status.imageUrl || '');
    setStatusCtaLabel(status.ctaLabel || '');
    setStatusCtaDest(status.ctaDestination || '');
    setStatusPublishDate(status.publishDate);
    setStatusExpiryDate(status.expiryDate || '');
    setStatusType(status.statusType);
    setStatusPriority((status.priority ?? 1).toString());
    setStatusIsActive(status.isActive);
    setFormError('');
    setIsStatusModalOpen(true);
  };

  const handleStatusFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatusUploadLoading(true);
    setFormError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success && data.imageUrl) {
        setStatusImageUrl(data.imageUrl);
        showToast('Hero image uploaded!', 'success');
      } else {
        setFormError(data.error || 'Failed to upload status image');
      }
    } catch (err: any) {
      setFormError(err.message || 'Image upload error');
    } finally {
      setStatusUploadLoading(false);
    }
  };

  const handleSaveDailyStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    const payload = {
      id: editingStatus?.id,
      brandId: activeBrandId,
      title: statusTitle.trim(),
      shortMessage: statusShortMsg.trim(),
      detailedMessage: statusDetailedMsg.trim() || undefined,
      imageUrl: statusImageUrl.trim() || undefined,
      ctaLabel: statusCtaLabel.trim() || undefined,
      ctaDestination: statusCtaDest.trim() || undefined,
      publishDate: statusPublishDate.trim(),
      expiryDate: statusExpiryDate.trim() || undefined,
      statusType,
      priority: parseInt(statusPriority) || 1,
      isActive: statusIsActive,
    };

    try {
      const result = await saveDailyStatusAction(payload);
      if (result.success) {
        setIsStatusModalOpen(false);
        setDataVersion((v) => v + 1);
        showToast(`Daily Hero Status "${statusTitle}" saved!`, 'success');
      } else {
        setFormError(result.error || 'Failed to save daily status');
      }
    } catch (err: any) {
      setFormError(err.message || 'Error occurred while saving status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDailyStatus = async (id: string, title: string) => {
    if (confirm(`Permanently delete daily status "${title}" from ${activeBrand.name}?`)) {
      await deleteDailyStatusAction(id, activeBrandId);
      setDataVersion((v) => v + 1);
      showToast(`Deleted status "${title}"`, 'info');
    }
  };

  const handleToggleStatusActive = async (id: string, currentActive: boolean) => {
    await toggleDailyStatusActiveAction(id, activeBrandId, !currentActive);
    setDataVersion((v) => v + 1);
    showToast(`Status is now ${!currentActive ? 'Active' : 'Inactive'}`, 'info');
  };

  // Save Brand Settings
  const handleSaveBrandSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSaveSuccess(false);

    const payload = {
      tagline: brandTagline,
      description: brandDesc,
      phonePrimary: brandPhone1,
      phoneSecondary: brandPhone2 || undefined,
      whatsappNumber: brandWhatsApp,
      openingTime: brandOpenTime,
      closingTime: brandCloseTime,
      holiday: brandHoliday,
      address: brandAddress,
      plusCode: brandPlusCode || undefined,
      freeDeliveryRadiusKm: parseFloat(brandDeliveryRadius) || 2,
      deliveryNote: brandDeliveryNote,
    };

    try {
      const result = await saveBrandSettingsAction(activeBrandId, payload);
      if (result.success) {
        setSaveSuccess(true);
        setDataVersion((v) => v + 1);
        showToast(`Settings for ${activeBrand.name} saved!`, 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to save store settings', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusTypeBadge = (type: StatusType) => {
    switch (type) {
      case 'TODAYS_SPECIAL':
        return { label: "Today's Special", color: 'bg-amber-950 text-amber-300 border-amber-800' };
      case 'SPECIAL_OFFER':
        return { label: 'Limited Offer', color: 'bg-rose-950 text-rose-300 border-rose-800' };
      case 'NEW_ARRIVAL':
        return { label: 'New Arrival', color: 'bg-emerald-950 text-emerald-300 border-emerald-800' };
      case 'ANNOUNCEMENT':
        return { label: 'Announcement', color: 'bg-blue-950 text-blue-300 border-blue-800' };
      case 'SERVICE_UPDATE':
        return { label: 'Service Update', color: 'bg-purple-950 text-purple-300 border-purple-800' };
      case 'HOLIDAY':
        return { label: 'Holiday Notice', color: 'bg-amber-950 text-amber-300 border-amber-800' };
      case 'DELIVERY_UPDATE':
        return { label: 'Delivery Update', color: 'bg-cyan-950 text-cyan-300 border-cyan-800' };
      case 'DAILY_UPDATE':
      default:
        return { label: 'Daily Update', color: 'bg-teal-950 text-teal-300 border-teal-800' };
    }
  };

  const getBrandIcon = (id: string) => {
    switch (id) {
      case 'aquarium':
        return <Fish className="w-4 h-4 text-cyan-400" />;
      case 'kirubai':
        return <UtensilsCrossed className="w-4 h-4 text-orange-400" />;
      case 'vision-360':
      default:
        return <ShieldCheck className="w-4 h-4 text-blue-400" />;
    }
  };

  const getTabBreadcrumb = () => {
    switch (activeTab) {
      case 'INVENTORY':
        return { section: 'INVENTORY', title: 'Inventory & Stock Management', desc: 'Real-time stock monitoring, unit pricing, threshold tracking, and rapid quantity adjustments.' };
      case 'DAILY_STATUS':
        return { section: 'HERO STATUS', title: 'Daily Hero & Offer Announcements', desc: 'Publish high-impact daily banners, seasonal promotions, and WhatsApp-linked announcements.' };
      case 'CATEGORIES':
        return { section: 'CATEGORIES', title: 'Category Architecture', desc: 'Configure brand catalog taxonomy, display sorting, and customer navigation menus.' };
      case 'BRAND_IDENTITY':
        return { section: 'IDENTITY', title: 'Brand Logos & Visual Assets', desc: 'Upload, replace, and preview high-resolution logos across light and dark storefront surfaces.' };
      case 'BRAND_SETTINGS':
        return { section: 'SETTINGS', title: 'Business Profile & Platform Status', desc: 'Operating hours, Coimbatore contact phone numbers, delivery zones, and database sync status.' };
      case 'ITEMS':
      default:
        return { section: 'PRODUCTS', title: 'Product & Service Catalog', desc: 'Manage full catalog specifications, offer pricing, units, media gallery, and verified badges.' };
    }
  };

  const breadcrumb = getTabBreadcrumb();

  return (
    <div className="min-h-screen bg-[#030812] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-2xl shadow-2xl border text-xs font-semibold flex items-center gap-3 pointer-events-auto animate-in fade-in slide-in-from-bottom-3 duration-300 ${
              toast.type === 'success'
                ? 'bg-emerald-950/95 text-emerald-200 border-emerald-800 shadow-emerald-950/50'
                : toast.type === 'error'
                ? 'bg-red-950/95 text-red-200 border-red-800 shadow-red-950/50'
                : 'bg-slate-900/95 text-cyan-300 border-slate-700 shadow-black/50'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-cyan-400 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Top Header Bar */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 sm:px-6 py-3 sticky top-0 z-30 shadow-md">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/80">
                <Lock className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                    SS Multi-Brand Admin Suite
                  </h1>
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Authenticated Server Session
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Managing <span className="text-cyan-400 font-bold">{activeBrand.name}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick External Actions */}
          <div className="flex items-center gap-2.5">
            <Link
              href={`/${activeBrandId}`}
              target="_blank"
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-750 flex items-center gap-1.5 transition-colors shadow-sm"
              id="admin-preview-storefront-btn"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">View Store</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-xs font-semibold text-red-300 border border-red-800/50 flex items-center gap-1.5 transition-colors"
              id="admin-logout-btn"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Layout with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR NAVIGATION (Desktop & Mobile Drawer) */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950/95 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0 ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 space-y-6 overflow-y-auto">
            {/* Brand Switcher in Sidebar */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 pl-1 block">
                Active Business Unit
              </label>
              <div className="space-y-1.5">
                {Object.values(BRANDS).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setActiveBrandId(b.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      activeBrandId === b.id
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-black'
                        : 'bg-slate-900/60 text-slate-300 border border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                    id={`sidebar-brand-${b.id}`}
                  >
                    {getBrandIcon(b.id)}
                    <span className="truncate">{b.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Menu Links */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 pl-1 block mb-2">
                Operations Menu
              </label>

              {/* NAV: Orders & Confirmations */}
              <Link
                href="/admin/orders"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900 transition-all group"
                id="sidebar-nav-orders"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-200 group-hover:text-white">Orders & Confirmations</span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/80 uppercase">
                  NEW
                </span>
              </Link>

              {/* TAB 1: Products */}
              <button
                onClick={() => {
                  setActiveTab('ITEMS');
                  setIsMobileSidebarOpen(false);
                }}

                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'ITEMS'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                }`}
                id="sidebar-nav-items"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Products & Services</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                  {allItems.length}
                </span>
              </button>

              {/* TAB 2: INVENTORY (CLIENT FEEDBACK MANDATORY SECTION) */}
              <button
                onClick={() => {
                  setActiveTab('INVENTORY');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'INVENTORY'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                }`}
                id="sidebar-nav-inventory"
              >
                <div className="flex items-center gap-2.5">
                  <Boxes className="w-4 h-4 text-emerald-400" />
                  <span>Inventory Control</span>
                </div>
                {lowStockCount + outOfStockCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-800">
                    {lowStockCount + outOfStockCount} alert
                  </span>
                )}
              </button>

              {/* TAB 3: Daily Hero Status */}
              <button
                onClick={() => {
                  setActiveTab('DAILY_STATUS');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'DAILY_STATUS'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                }`}
                id="sidebar-nav-daily-status"
              >
                <div className="flex items-center gap-2.5">
                  <Megaphone className="w-4 h-4 text-rose-400" />
                  <span>Daily Hero Status</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                  {activeDailyStatuses.length} live
                </span>
              </button>

              {/* TAB 4: Categories */}
              <button
                onClick={() => {
                  setActiveTab('CATEGORIES');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'CATEGORIES'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                }`}
                id="sidebar-nav-categories"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>Categories</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                  {categories.length}
                </span>
              </button>

              {/* TAB 5: Brand Identity */}
              <button
                onClick={() => {
                  setActiveTab('BRAND_IDENTITY');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'BRAND_IDENTITY'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                }`}
                id="sidebar-nav-brand-identity"
              >
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>Brand Identity & Logos</span>
              </button>

              {/* TAB 6: Settings & Profile */}
              <button
                onClick={() => {
                  setActiveTab('BRAND_SETTINGS');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'BRAND_SETTINGS'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                }`}
                id="sidebar-nav-settings"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Store Profile & Sync</span>
              </button>
            </div>
          </div>

          {/* Sidebar Footer Info */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 text-[11px] text-slate-400 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Database Persistence:</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {isSupabaseConfigured ? 'Supabase Sync' : 'Live Repository'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Coimbatore Multi-Brand Engine v1.0
            </p>
          </div>
        </aside>

        {/* Mobile Sidebar Backdrop */}
        {isMobileSidebarOpen && (
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-30 lg:hidden"
          />
        )}

        {/* MAIN WORKSPACE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Breadcrumb & Section Header (CLIENT REQUIREMENT C: "Where am I?") */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-400 font-bold">
                <span className="text-slate-400">ADMIN</span>
                <span>/</span>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                  {breadcrumb.section}
                </span>
                <span>/</span>
                <span className="text-slate-300 font-sans font-semibold">{activeBrand.name}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {breadcrumb.title}
              </h2>
              <p className="text-xs text-slate-400 max-w-2xl">
                {breadcrumb.desc}
              </p>
            </div>

            {/* Quick action button based on active tab */}
            {activeTab === 'ITEMS' && (
              <button
                onClick={handleOpenNewItem}
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all shrink-0 active:scale-98"
                id="admin-add-item-btn"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product / Service</span>
              </button>
            )}

            {activeTab === 'INVENTORY' && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleOpenNewItem}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-98"
                  id="admin-inventory-add-item-btn"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Stock Item</span>
                </button>
              </div>
            )}

            {activeTab === 'DAILY_STATUS' && (
              <button
                onClick={handleOpenNewDailyStatus}
                className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 transition-all shrink-0 active:scale-98"
                id="admin-add-status-btn"
              >
                <Plus className="w-4 h-4" />
                <span>Post Hero Status</span>
              </button>
            )}

            {activeTab === 'CATEGORIES' && (
              <button
                onClick={handleOpenNewCategory}
                className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition-all shrink-0 active:scale-98"
                id="admin-add-category-btn"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            )}
          </div>

          {/* ========================================================================= */}
          {/* TAB: INVENTORY (CLIENT REQUIREMENT B: DEDICATED ADMIN -> INVENTORY SECTION) */}
          {/* ========================================================================= */}
          {activeTab === 'INVENTORY' && (
            <div className="space-y-6">
              {/* 1. Inventory Stock KPI Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1 shadow-md">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                    <span>Tracked Products</span>
                    <Boxes className="w-4 h-4 text-cyan-400" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-white">{productItems.length}</p>
                  <p className="text-[11px] text-slate-400">Total catalog products</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1 shadow-md">
                  <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
                    <span>Healthy Stock</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-400">{inStockCount}</p>
                  <p className="text-[11px] text-slate-400">&gt; 5 units available</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1 shadow-md">
                  <div className="flex items-center justify-between text-amber-400 text-xs font-semibold">
                    <span>Low Stock Alert</span>
                    <TrendingDown className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-amber-400">{lowStockCount}</p>
                  <p className="text-[11px] text-slate-400">1 to 5 units remaining</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1 shadow-md">
                  <div className="flex items-center justify-between text-red-400 text-xs font-semibold">
                    <span>Out of Stock</span>
                    <XCircle className="w-4 h-4 text-red-400" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-red-400">{outOfStockCount}</p>
                  <p className="text-[11px] text-slate-400">0 units or hidden</p>
                </div>
              </div>

              {/* 2. Inventory Filter Strip */}
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
                  {/* Search */}
                  <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                      placeholder="Search inventory items..."
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      id="inventory-search-input"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={inventoryCategoryFilter}
                    onChange={(e) => setInventoryCategoryFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    id="inventory-category-filter"
                  >
                    <option value="ALL">All Categories ({categories.length})</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  {/* Stock Status Pills */}
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    <button
                      onClick={() => setInventoryStockFilter('ALL')}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                        inventoryStockFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All ({productItems.length})
                    </button>
                    <button
                      onClick={() => setInventoryStockFilter('LOW_STOCK')}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                        inventoryStockFilter === 'LOW_STOCK' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Low Stock ({lowStockCount})
                    </button>
                    <button
                      onClick={() => setInventoryStockFilter('OUT_OF_STOCK')}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                        inventoryStockFilter === 'OUT_OF_STOCK' ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Out of Stock ({outOfStockCount})
                    </button>
                    <button
                      onClick={() => setInventoryStockFilter('IN_STOCK')}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                        inventoryStockFilter === 'IN_STOCK' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      In Stock ({inStockCount})
                    </button>
                  </div>
                </div>

                <span className="text-xs text-slate-400 self-end md:self-center font-mono">
                  Showing {filteredInventoryItems.length} of {productItems.length} items
                </span>
              </div>

              {/* 3. Inventory Stock Table */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-3.5 px-4 font-bold">Product Item</th>
                        <th className="py-3.5 px-4 font-bold">Category</th>
                        <th className="py-3.5 px-4 font-bold">Unit Price</th>
                        <th className="py-3.5 px-4 font-bold">Stock Quantity & Unit</th>
                        <th className="py-3.5 px-4 font-bold">Quick Stock Adjust</th>
                        <th className="py-3.5 px-4 font-bold">Status</th>
                        <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredInventoryItems.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            <Boxes className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                            <p className="font-bold text-white text-sm">No items found matching inventory filter.</p>
                            <p className="text-xs text-slate-400 mt-1">Try clearing filters or search queries.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredInventoryItems.map((item) => {
                          const effectivePrice = item.offerPrice ?? item.originalPrice ?? 0;
                          const isLow = (item.stockQuantity ?? 0) > 0 && (item.stockQuantity ?? 0) <= 5;
                          const isOut = (item.stockQuantity ?? 0) === 0 || !item.isAvailable;
                          const primaryImg = item.images[0]?.imageUrl || 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=400&q=80';

                          return (
                            <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                              {/* Product Info */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-950 border border-slate-700 shrink-0">
                                    <Image
                                      src={primaryImg}
                                      alt={item.name}
                                      fill
                                      sizes="48px"
                                      className="object-cover"
                                    />
                                  </div>
                                  <div>
                                    <p className="font-bold text-white text-xs">{item.name}</p>
                                    <p className="text-[10px] text-slate-400 font-mono">{item.slug}</p>
                                    {item.promotionalBadge && (
                                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                                        {item.promotionalBadge}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Category */}
                              <td className="py-3.5 px-4 font-medium text-slate-300">
                                {item.categoryName || 'General'}
                              </td>

                              {/* Unit Price (e.g. ₹299 / pair) */}
                              <td className="py-3.5 px-4">
                                <p className="font-extrabold text-white text-xs">
                                  {formatPrice(effectivePrice)}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  / {item.unitType}{item.unitValue && item.unitValue > 1 ? ` (${item.unitValue})` : ''}
                                </p>
                              </td>

                              {/* Stock Quantity & Unit Display (CLIENT REQUIREMENT: "Red Cap Oranda ₹299 / pair Stock: 8 pairs") */}
                              <td className="py-3.5 px-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-black text-sm text-white">
                                      {item.stockQuantity ?? 0}
                                    </span>
                                    <span className="text-xs text-slate-400 font-medium">
                                      {item.unitType === 'pair' 
                                        ? (item.stockQuantity === 1 ? 'pair' : 'pairs')
                                        : item.unitType === 'piece'
                                        ? (item.stockQuantity === 1 ? 'piece' : 'pieces')
                                        : item.unitType}
                                    </span>
                                  </div>

                                  <div>
                                    {isOut ? (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800">
                                        Out of Stock
                                      </span>
                                    ) : isLow ? (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                                        Low Stock (≤ 5)
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                                        In Stock
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Quick Inline Stock Adjust (+ / - and direct edit) */}
                              <td className="py-3.5 px-4">
                                {stockEditingId === item.id ? (
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="number"
                                      min="0"
                                      value={stockEditValue}
                                      onChange={(e) => setStockEditValue(e.target.value)}
                                      className="w-16 bg-slate-950 border border-cyan-500 rounded-lg px-2 py-1 text-xs text-white font-bold text-center focus:outline-none"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleInlineStockUpdate(item.id, parseInt(stockEditValue) || 0)}
                                      disabled={stockUpdatingId === item.id}
                                      className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                                      title="Save stock value"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setStockEditingId(null)}
                                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                                      title="Cancel"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleInlineStockUpdate(item.id, Math.max(0, (item.stockQuantity ?? 0) - 1))}
                                      disabled={stockUpdatingId === item.id || (item.stockQuantity ?? 0) <= 0}
                                      className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-30 transition-all"
                                      title="Decrease stock by 1"
                                      id={`stock-dec-${item.id}`}
                                    >
                                      <Minus className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      onClick={() => {
                                        setStockEditingId(item.id);
                                        setStockEditValue((item.stockQuantity ?? 0).toString());
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-cyan-300 hover:border-cyan-500 transition-colors"
                                      title="Click to directly enter exact stock quantity"
                                      id={`stock-val-${item.id}`}
                                    >
                                      {stockUpdatingId === item.id ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        item.stockQuantity ?? 0
                                      )}
                                    </button>

                                    <button
                                      onClick={() => handleInlineStockUpdate(item.id, (item.stockQuantity ?? 0) + 1)}
                                      disabled={stockUpdatingId === item.id}
                                      className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all"
                                      title="Increase stock by 1"
                                      id={`stock-inc-${item.id}`}
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </td>

                              {/* Availability Toggle */}
                              <td className="py-3.5 px-4">
                                <button
                                  onClick={() => handleToggleAvailability(item)}
                                  disabled={stockUpdatingId === item.id}
                                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1.5 ${
                                    item.isAvailable
                                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                                      : 'bg-red-950 text-red-300 border border-red-800 hover:bg-red-900'
                                  }`}
                                  id={`availability-toggle-${item.id}`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${item.isAvailable ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                  <span>{item.isAvailable ? 'Available' : 'Hidden'}</span>
                                </button>
                              </td>

                              {/* Actions */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleOpenEditItem(item)}
                                    className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                                    title="Full Edit Details"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: PRODUCTS & SERVICES MANAGER */}
          {/* ========================================================================= */}
          {activeTab === 'ITEMS' && (
            <div className="space-y-4">
              {/* Control Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                      placeholder="Search items by name, description..."
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800">
                    <button
                      onClick={() => setItemTypeFilter('ALL')}
                      className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${
                        itemTypeFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400'
                      }`}
                    >
                      All ({allItems.length})
                    </button>
                    <button
                      onClick={() => setItemTypeFilter('PRODUCT')}
                      className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${
                        itemTypeFilter === 'PRODUCT' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                      }`}
                    >
                      Products ({allItems.filter((i) => i.itemType === 'PRODUCT').length})
                    </button>
                    <button
                      onClick={() => setItemTypeFilter('SERVICE')}
                      className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${
                        itemTypeFilter === 'SERVICE' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                      }`}
                    >
                      Services ({allItems.filter((i) => i.itemType === 'SERVICE').length})
                    </button>
                  </div>
                </div>

                <span className="text-xs text-slate-400 font-mono">
                  Showing {filteredItems.length} items
                </span>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-400 bg-slate-900/40 rounded-3xl border border-slate-800">
                    <ShoppingBag className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                    <p className="font-bold text-white">No catalog items found.</p>
                    <p className="text-xs text-slate-400 mt-1">Click "Add Product / Service" above to add new entries.</p>
                  </div>
                ) : (
                  filteredItems.map((item) => {
                    const primaryImg = item.images[0]?.imageUrl || 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=600&q=80';
                    const effectivePrice = item.offerPrice ?? item.originalPrice ?? 0;

                    return (
                      <div
                        key={item.id}
                        className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 group"
                      >
                        <div>
                          {/* Image & Badges */}
                          <div className="relative aspect-[16/10] w-full bg-slate-950">
                            <Image
                              src={primaryImg}
                              alt={item.name}
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              className="object-cover group-hover:scale-103 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                            <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  item.itemType === 'PRODUCT'
                                    ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-700'
                                    : 'bg-emerald-950/90 text-emerald-300 border border-emerald-700'
                                }`}
                              >
                                {item.itemType}
                              </span>

                              {item.isHeroOffer && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/90 text-amber-300 border border-amber-700 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  Hero Offer
                                </span>
                              )}

                              {item.isFeatured && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950/90 text-purple-300 border border-purple-700">
                                  Featured
                                </span>
                              )}
                            </div>

                            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs">
                              <span className="text-cyan-300 font-semibold truncate">{item.categoryName || 'General'}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.isAvailable ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'}`}>
                                {item.isAvailable ? 'Available' : 'Out of Stock'}
                              </span>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="p-4 space-y-2">
                            <h4 className="font-extrabold text-sm text-white line-clamp-1">{item.name}</h4>
                            <p className="text-xs text-slate-400 line-clamp-2">{item.shortDescription || item.description}</p>

                            {/* Price & Unit Details */}
                            <div className="pt-2 border-t border-slate-800 flex items-baseline justify-between text-xs">
                              <div>
                                <span className="text-base font-black text-cyan-400">
                                  {formatPrice(effectivePrice)}
                                </span>
                                {item.offerPrice && item.originalPrice && (
                                  <span className="text-[11px] text-slate-500 line-through ml-2">
                                    {formatPrice(item.originalPrice)}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 font-mono">
                                Unit: {item.unitType}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between gap-2">
                          <Link
                            href={`/${activeBrandId}/products/${item.slug}`}
                            target="_blank"
                            className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1"
                          >
                            <span>Live Page</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditItem(item)}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-750 flex items-center gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleDeleteItem(item.id, item.name)}
                              className="p-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-800/50"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: DAILY HERO STATUS (CLIENT REQUIREMENT) */}
          {/* ========================================================================= */}
          {activeTab === 'DAILY_STATUS' && (
            <div className="space-y-6">
              {/* Daily Status List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {allDailyStatuses.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-400 bg-slate-900/40 rounded-3xl border border-slate-800">
                    <Megaphone className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                    <p className="font-bold text-white">No Daily Hero Statuses defined.</p>
                    <p className="text-xs text-slate-400 mt-1">When no daily status is active, the storefront automatically displays the curated default brand hero.</p>
                  </div>
                ) : (
                  allDailyStatuses.map((status) => {
                    const badge = getStatusTypeBadge(status.statusType);
                    const isPublished = new Date(status.publishDate) <= new Date();
                    const isExpired = status.expiryDate ? new Date(status.expiryDate) < new Date() : false;
                    const isCurrentlyLive = status.isActive && isPublished && !isExpired;

                    return (
                      <div
                        key={status.id}
                        className={`p-5 rounded-2xl border transition-all ${
                          isCurrentlyLive
                            ? 'bg-slate-900/90 border-cyan-500/50 shadow-lg shadow-cyan-950/30'
                            : 'bg-slate-900/40 border-slate-800 opacity-80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${badge.color}`}>
                              {badge.label}
                            </span>

                            {isCurrentlyLive ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Live on Storefront
                              </span>
                            ) : isExpired ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-400 border border-slate-800">
                                Expired
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                                Inactive / Draft
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleToggleStatusActive(status.id, status.isActive)}
                              className={`p-1.5 rounded-lg text-xs font-bold border transition-colors ${
                                status.isActive
                                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                                  : 'bg-slate-900 text-slate-400 border-slate-800'
                              }`}
                              title="Toggle Active"
                            >
                              {status.isActive ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            </button>

                            <button
                              onClick={() => handleOpenEditDailyStatus(status)}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-750"
                              title="Edit Status"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteDailyStatus(status.id, status.title)}
                              className="p-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-800/50"
                              title="Delete Status"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <h4 className="text-base font-black text-white">{status.title}</h4>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{status.shortMessage}</p>

                        <div className="pt-3 mt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                          <div className="flex items-center gap-2">
                            <span>Publish: <strong className="text-slate-200">{status.publishDate}</strong></span>
                            {status.expiryDate && (
                              <span>• Exp: <strong className="text-slate-200">{status.expiryDate}</strong></span>
                            )}
                          </div>
                          <span>Priority: <strong className="text-cyan-300">{status.priority ?? 1}</strong></span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: CATEGORIES */}
          {/* ========================================================================= */}
          {activeTab === 'CATEGORIES' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => {
                  const itemsCount = allItems.filter((i) => i.categoryId === cat.id).length;

                  return (
                    <div
                      key={cat.id}
                      className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-755 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                            Order: #{cat.sortOrder}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cat.isActive ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-950 text-slate-500 border border-slate-800'}`}>
                            {cat.isActive ? 'Active' : 'Hidden'}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-base text-white">{cat.name}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2">{cat.description || 'No description provided'}</p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-medium">
                          {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditCategory(cat)}
                            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="p-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-800/50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: BRAND IDENTITY & LOGO MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === 'BRAND_IDENTITY' && (
            <div className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                      {activeBrand.name} Logo Management
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Upload, preview, replace, or reset the public logo for {activeBrand.name}. Updates propagate across Navbar, Footer, Hero, and metadata.
                    </p>
                  </div>
                </div>

                {logoSaveSuccess && (
                  <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-800 text-xs text-emerald-300 font-semibold flex items-center gap-2 shadow-lg">
                    <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-bold">Logo Successfully Updated for {activeBrand.name}!</p>
                      <p className="text-emerald-400/80 text-[11px]">Changes have been persistently saved and applied to live public storefronts.</p>
                    </div>
                  </div>
                )}

                {logoError && (
                  <div className="p-4 rounded-2xl bg-red-950/90 border border-red-800 text-xs text-red-200 font-semibold flex items-center gap-2 shadow-lg">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                    <span>{logoError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left: Studio Live Preview Canvas */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Live Logo Preview</span>
                      </label>

                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-semibold text-slate-400">
                        <span>Preview BG:</span>
                        <button
                          type="button"
                          onClick={() => setLogoPreviewBg('dark')}
                          className={`px-2 py-0.5 rounded-lg transition-colors ${
                            logoPreviewBg === 'dark' ? 'bg-slate-800 text-white font-bold' : 'hover:text-slate-200'
                          }`}
                        >
                          Dark
                        </button>
                        <button
                          type="button"
                          onClick={() => setLogoPreviewBg('light')}
                          className={`px-2 py-0.5 rounded-lg transition-colors ${
                            logoPreviewBg === 'light' ? 'bg-slate-200 text-slate-950 font-bold' : 'hover:text-slate-200'
                          }`}
                        >
                          Light
                        </button>
                      </div>
                    </div>

                    <div
                      className={`relative w-full h-56 sm:h-64 rounded-2xl border border-slate-700/80 flex items-center justify-center p-6 shadow-inner transition-colors duration-300 overflow-hidden ${
                        logoPreviewBg === 'dark' ? 'bg-[#030b17]' : 'bg-white'
                      }`}
                    >
                      {logoInputUrl ? (
                        <div className="relative w-full h-full max-w-xs max-h-44 flex items-center justify-center">
                          <Image
                            src={logoInputUrl}
                            alt={`${activeBrand.name} Logo Preview`}
                            fill
                            sizes="(max-width: 640px) 280px, 320px"
                            className="object-contain"
                            unoptimized={logoInputUrl.startsWith('data:')}
                          />
                        </div>
                      ) : (
                        <div className="text-center space-y-2 text-slate-500">
                          <ImageIcon className="w-12 h-12 mx-auto stroke-1" />
                          <p className="text-xs">No Logo Uploaded (Icon Fallback Active)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Upload & Actions */}
                  <div className="lg:col-span-6 space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                        Upload Logo from Device
                      </label>
                      <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-950/40 hover:bg-slate-950/80 group">
                        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-cyan-400 group-hover:scale-110 transition-transform mb-3">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-white mb-1">
                          {logoUploadLoading ? 'Uploading image securely...' : 'Click to select logo file'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Supports PNG (with transparency), WebP, JPEG. Max file size ~5MB.
                        </p>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          onChange={handleLogoFileUpload}
                          disabled={logoUploadLoading || isSubmitting}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                        Or Enter Direct Image URL
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={logoInputUrl}
                          onChange={(e) => setLogoInputUrl(e.target.value)}
                          placeholder="https://..."
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                        />
                        <button
                          onClick={handleSaveLogoUrl}
                          disabled={logoUploadLoading}
                          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shrink-0"
                        >
                          Save
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleResetToDefaultLogo}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset to default vector SVG logo</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: BRAND SETTINGS & PLATFORM HEALTH STATUS */}
          {/* ========================================================================= */}
          {activeTab === 'BRAND_SETTINGS' && (
            <div className="space-y-6">
              {saveSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Profile settings for {activeBrand.name} successfully updated!</span>
                </div>
              )}

              {/* Operating Profile Form */}
              <form onSubmit={handleSaveBrandSettings} className="bg-slate-900/80 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
                <h3 className="text-lg font-bold text-white">Store Operating Profile: {activeBrand.name}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">Brand Tagline</label>
                    <input
                      type="text"
                      required
                      value={brandTagline}
                      onChange={(e) => setBrandTagline(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">Primary Phone</label>
                    <input
                      type="text"
                      required
                      value={brandPhone1}
                      onChange={(e) => setBrandPhone1(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">WhatsApp Order Number</label>
                    <input
                      type="text"
                      required
                      value={brandWhatsApp}
                      onChange={(e) => setBrandWhatsApp(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">Secondary Contact</label>
                    <input
                      type="text"
                      value={brandPhone2}
                      onChange={(e) => setBrandPhone2(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">Opening Time</label>
                    <input
                      type="text"
                      required
                      value={brandOpenTime}
                      onChange={(e) => setBrandOpenTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">Closing Time</label>
                    <input
                      type="text"
                      required
                      value={brandCloseTime}
                      onChange={(e) => setBrandCloseTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">Holiday Day</label>
                    <input
                      type="text"
                      required
                      value={brandHoliday}
                      onChange={(e) => setBrandHoliday(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">Free Delivery Radius (km)</label>
                    <input
                      type="number"
                      required
                      value={brandDeliveryRadius}
                      onChange={(e) => setBrandDeliveryRadius(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">Store Address</label>
                    <input
                      type="text"
                      required
                      value={brandAddress}
                      onChange={(e) => setBrandAddress(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">Delivery Notice Message</label>
                    <textarea
                      rows={2}
                      required
                      value={brandDeliveryNote}
                      onChange={(e) => setBrandDeliveryNote(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : `Save ${activeBrand.name} Profile Settings`}
                  </button>
                </div>
              </form>

              {/* CLEAN BUSINESS-FRIENDLY PLATFORM STATUS PANEL (CLIENT REQUIREMENT D: No raw SQL dumps for business users) */}
              <div className="bg-slate-900/80 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <span>Platform & Storage Architecture Status</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Operational health across data persistence, image storage, and session authentication.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <p className="text-[11px] font-bold uppercase text-slate-400">Data Persistence Layer</p>
                    <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      {isSupabaseConfigured ? 'Connected to Supabase PostgreSQL' : 'Active Server Repository'}
                    </p>
                    <p className="text-[10px] text-slate-500">Zero data loss with cached revalidation</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <p className="text-[11px] font-bold uppercase text-slate-400">Asset & Media Storage</p>
                    <p className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      MIME & Size Verified (5MB Limit)
                    </p>
                    <p className="text-[10px] text-slate-500">PNG, WebP, JPEG with unique filenames</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <p className="text-[11px] font-bold uppercase text-slate-400">Admin Security Layer</p>
                    <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      HTTP-Only JWT Session
                    </p>
                    <p className="text-[10px] text-slate-500">HS256 server-validated authorization</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* ITEM CREATE / EDIT MODAL */}
      {/* ========================================================================= */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingItem ? 'Edit Catalog Item' : `Add Item to ${activeBrand.name}`}
              </h3>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold uppercase text-slate-300 block mb-1">Item Type</label>
                  <select
                    value={formItemType}
                    onChange={(e) => {
                      const newType = e.target.value as ItemType;
                      setFormItemType(newType);
                      if (newType === 'SERVICE') {
                        setFormUnitType('service');
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="PRODUCT">PRODUCT (Purchasable with Cart)</option>
                    <option value="SERVICE">SERVICE (Technician / Setup Inquiry)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold uppercase text-slate-300 block mb-1">Category</label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold uppercase text-slate-300 block mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (!editingItem) setFormSlug(slugify(e.target.value));
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-slate-300 block mb-1">URL Slug</label>
                <input
                  type="text"
                  required
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-300 font-mono"
                />
              </div>

              {/* Pricing & Unit System */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div>
                  <label className="font-bold uppercase text-slate-300 block mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase text-slate-300 block mb-1">Offer Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formOfferPrice}
                    onChange={(e) => setFormOfferPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-cyan-400 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase text-slate-300 block mb-1">Unit Type</label>
                  <select
                    value={formUnitType}
                    onChange={(e) => setFormUnitType(e.target.value as UnitType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white capitalize"
                  >
                    {SUPPORTED_UNITS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label} ({u.value})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold uppercase text-slate-300 block mb-1">Unit Value</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={formUnitValue}
                    onChange={(e) => setFormUnitValue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>

                {formItemType === 'PRODUCT' && (
                  <div>
                    <label className="font-bold uppercase text-slate-300 block mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      value={formStockQuantity}
                      onChange={(e) => setFormStockQuantity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="font-bold uppercase text-slate-300 block mb-1">Promotional Badge</label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="e.g. Best Seller, Pure Breed, Chef Special"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              {/* Short & Long Description */}
              <div>
                <label className="font-bold uppercase text-slate-300 block mb-1">Short Description (1 line summary)</label>
                <input
                  type="text"
                  value={formShortDesc}
                  onChange={(e) => setFormShortDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-slate-300 block mb-1">Detailed Description & Care</label>
                <textarea
                  rows={3}
                  required
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              {/* Image Management */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold uppercase text-slate-300 block">Item Gallery Images</label>
                    <p className="text-[11px] text-amber-300/90 font-medium mt-0.5">
                      Use a direct public image URL or upload the image. Google search-result URLs may not work.
                    </p>
                  </div>
                  <label className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs cursor-pointer flex items-center gap-1.5 transition-colors shrink-0">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Uploading...' : 'Upload Image File'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>

                {formImages.map((img, idx) => {
                  const sanitizeUrl = (raw: string) => {
                    const trimmed = raw.trim();
                    try {
                      if (trimmed.includes('google.') && (trimmed.includes('/imgres') || trimmed.includes('imgurl='))) {
                        const parsed = new URL(trimmed);
                        const direct = parsed.searchParams.get('imgurl');
                        if (direct) return decodeURIComponent(direct);
                      }
                    } catch {}
                    return trimmed;
                  };

                  return (
                    <div key={idx} className="flex items-center gap-2">
                      {img.url.trim() ? (
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-900 shrink-0 relative border border-slate-700 flex items-center justify-center">
                          <img
                            src={img.url}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).classList.add('hidden');
                            }}
                          />
                          <ImageIcon className="w-4 h-4 text-slate-500 absolute pointer-events-none -z-0" />
                        </div>
                      ) : null}
                      <input
                        type="text"
                        value={img.url}
                        onChange={(e) => {
                          const updated = [...formImages];
                          updated[idx].url = sanitizeUrl(e.target.value);
                          setFormImages(updated);
                        }}
                        placeholder="Image URL https://..."
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-xs"
                      />
                      {formImages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setFormImages(formImages.filter((_, i) => i !== idx))}
                          className="p-2.5 text-red-400 hover:text-red-300 rounded-xl bg-slate-950 border border-slate-800 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Feature Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsAvailable}
                    onChange={(e) => setFormIsAvailable(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500"
                  />
                  <span className="font-bold text-slate-300">Available / In Stock</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500"
                  />
                  <span className="font-bold text-slate-300">Featured on Home</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsHeroOffer}
                    onChange={(e) => setFormIsHeroOffer(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500"
                  />
                  <span className="font-bold text-slate-300">Hero Carousel Offer</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsClientVerified}
                    onChange={(e) => setFormIsClientVerified(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500"
                  />
                  <span className="font-bold text-slate-300">Verified Stock Badge</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold shadow-lg disabled:opacity-50"
                  id="admin-item-save-btn"
                >
                  {isSubmitting ? 'Saving Item...' : editingItem ? 'Update Item' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CATEGORY CREATE / EDIT MODAL */}
      {/* ========================================================================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingCategory ? 'Edit Category' : `Add Category to ${activeBrand.name}`}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="font-bold uppercase text-slate-300 block mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => {
                    setCatName(e.target.value);
                    if (!editingCategory) setCatSlug(slugify(e.target.value));
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-slate-300 block mb-1">Category Slug</label>
                <input
                  type="text"
                  required
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-slate-300 block mb-1">Sort Order Position</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={catSortOrder}
                  onChange={(e) => setCatSortOrder(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-slate-300 block mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={catIsActive}
                  onChange={(e) => setCatIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500"
                />
                <span className="font-bold text-slate-300">Active / Visible in Navigation</span>
              </label>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold"
                >
                  {isSubmitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DAILY STATUS CREATE / EDIT MODAL */}
      {/* ========================================================================= */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingStatus ? 'Edit Daily Hero Status' : `Post Daily Status on ${activeBrand.name}`}
              </h3>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDailyStatus} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold uppercase text-slate-300 block mb-1">Status Type</label>
                  <select
                    value={statusType}
                    onChange={(e) => setStatusType(e.target.value as StatusType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="DAILY_UPDATE">Daily Update</option>
                    <option value="TODAYS_SPECIAL">Today's Special</option>
                    <option value="SPECIAL_OFFER">Special Offer</option>
                    <option value="NEW_ARRIVAL">New Arrival</option>
                    <option value="ANNOUNCEMENT">Announcement</option>
                    <option value="SERVICE_UPDATE">Service Update</option>
                    <option value="HOLIDAY">Holiday Notice</option>
                    <option value="DELIVERY_UPDATE">Delivery Update</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold uppercase text-slate-300 block mb-1">Priority Order</label>
                  <input
                    type="number"
                    min="1"
                    value={statusPriority}
                    onChange={(e) => setStatusPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold uppercase text-slate-300 block mb-1">Hero Headline Title</label>
                <input
                  type="text"
                  required
                  value={statusTitle}
                  onChange={(e) => setStatusTitle(e.target.value)}
                  placeholder="e.g. Fresh Seeraga Samba Dum Biryani Available Today!"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-slate-300 block mb-1">Short Message Summary (Hero text)</label>
                <textarea
                  rows={2}
                  required
                  value={statusShortMsg}
                  onChange={(e) => setStatusShortMsg(e.target.value)}
                  placeholder="Appears prominently in the storefront hero section..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold uppercase text-slate-300 block mb-1">Publish Date</label>
                  <input
                    type="date"
                    required
                    value={statusPublishDate}
                    onChange={(e) => setStatusPublishDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase text-slate-300 block mb-1">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={statusExpiryDate}
                    onChange={(e) => setStatusExpiryDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold uppercase text-slate-300 block mb-1">Call to Action Label</label>
                  <input
                    type="text"
                    value={statusCtaLabel}
                    onChange={(e) => setStatusCtaLabel(e.target.value)}
                    placeholder="e.g. Order Special Dum Combo"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase text-slate-300 block mb-1">CTA URL Destination</label>
                  <input
                    type="text"
                    value={statusCtaDest}
                    onChange={(e) => setStatusCtaDest(e.target.value)}
                    placeholder={`/${activeBrandId}/catalog`}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              {/* Status Image Upload */}
              <div className="space-y-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="font-bold uppercase text-slate-300">Hero Background / Feature Image</label>
                  <label className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer flex items-center gap-1">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{statusUploadLoading ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleStatusFileUpload}
                      disabled={statusUploadLoading}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={statusImageUrl}
                  onChange={(e) => setStatusImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={statusIsActive}
                  onChange={(e) => setStatusIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-500"
                />
                <span className="font-bold text-slate-300">Status is Active and Publishable</span>
              </label>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold"
                >
                  {isSubmitting ? 'Saving Status...' : 'Save Daily Hero Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
