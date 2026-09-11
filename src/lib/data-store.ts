import { BrandConfig, Category, CatalogItem, BrandId, DailyStatus, Order, OrderItem, OrderStatus, CustomerCheckoutInput } from '@/types';
import { BRANDS } from '@/config/brands';
import { INITIAL_CATEGORIES, INITIAL_CATALOG_ITEMS } from '@/config/brands';
import { INITIAL_DAILY_STATUSES, getTodayDateString } from '@/config/daily-statuses';

// Production Data Repository
class DataRepository {
  private brands: Map<string, BrandConfig>;
  private categories: Category[];
  private catalogItems: CatalogItem[];
  private dailyStatuses: DailyStatus[];
  private orders: Order[];
  private invoiceSequences: Map<string, number>;

  constructor() {
    this.brands = new Map(Object.entries(BRANDS));
    this.categories = [...INITIAL_CATEGORIES];
    this.catalogItems = [...INITIAL_CATALOG_ITEMS];
    this.dailyStatuses = [...INITIAL_DAILY_STATUSES];
    this.orders = [];
    this.invoiceSequences = new Map();
  }


  // Brands
  public getAllBrands(): BrandConfig[] {
    return Array.from(this.brands.values());
  }

  public getBrand(id: string): BrandConfig | undefined {
    return this.brands.get(id);
  }

  public updateBrand(id: string, updates: Partial<BrandConfig>): BrandConfig | null {
    const existing = this.brands.get(id);
    if (!existing) return null;
    const updated: BrandConfig = {
      ...existing,
      ...updates,
      theme: {
        ...existing.theme,
        ...(updates.theme || {}),
      },
      seo: {
        ...existing.seo,
        ...(updates.seo || {}),
      },
    };
    this.brands.set(id, updated);
    return updated;
  }

  // Categories
  public getCategoriesByBrand(brandId: string): Category[] {
    return this.categories
      .filter((cat) => cat.brandId === brandId && cat.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public getAllCategoriesForAdmin(brandId?: string): Category[] {
    if (!brandId) return [...this.categories].sort((a, b) => a.sortOrder - b.sortOrder);
    return this.categories
      .filter((cat) => cat.brandId === brandId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public addCategory(cat: Omit<Category, 'id'>): Category {
    const newCategory: Category = {
      ...cat,
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    this.categories.push(newCategory);
    return newCategory;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const index = this.categories.findIndex((c) => c.id === id);
    if (index === -1) return null;
    this.categories[index] = { ...this.categories[index], ...updates };
    return this.categories[index];
  }

  public deleteCategory(id: string): boolean {
    const initialLen = this.categories.length;
    this.categories = this.categories.filter((c) => c.id !== id);
    return this.categories.length < initialLen;
  }

  // Catalog Items
  public getCatalogItems(
    brandId: string,
    options?: {
      categoryId?: string;
      itemType?: 'PRODUCT' | 'SERVICE';
      isFeatured?: boolean;
      isHeroOffer?: boolean;
      searchQuery?: string;
    }
  ): CatalogItem[] {
    let items = this.catalogItems.filter((i) => i.brandId === brandId && i.isActive);

    if (options?.categoryId) {
      items = items.filter((i) => i.categoryId === options.categoryId);
    }
    if (options?.itemType) {
      items = items.filter((i) => i.itemType === options.itemType);
    }
    if (options?.isFeatured !== undefined) {
      items = items.filter((i) => i.isFeatured === options.isFeatured);
    }
    if (options?.isHeroOffer !== undefined) {
      items = items.filter((i) => i.isHeroOffer === options.isHeroOffer);
    }
    if (options?.searchQuery && options.searchQuery.trim()) {
      const q = options.searchQuery.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          (i.categoryName && i.categoryName.toLowerCase().includes(q))
      );
    }

    return items;
  }

  public getAllCatalogItemsForAdmin(brandId?: string): CatalogItem[] {
    if (!brandId) return [...this.catalogItems];
    return this.catalogItems.filter((i) => i.brandId === brandId);
  }

  public getItemBySlug(brandId: string, slug: string): CatalogItem | undefined {
    return this.catalogItems.find(
      (item) => item.brandId === brandId && item.slug === slug && item.isActive
    );
  }

  public getItemById(id: string): CatalogItem | undefined {
    return this.catalogItems.find((item) => item.id === id);
  }

  public addCatalogItem(item: Omit<CatalogItem, 'id' | 'createdAt' | 'updatedAt'>): CatalogItem {
    const category = this.categories.find((c) => c.id === item.categoryId);
    const now = new Date().toISOString();
    const newItem: CatalogItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      categoryName: category?.name,
      unitType: item.unitType || (item.itemType === 'SERVICE' ? 'service' : 'piece'),
      unitValue: item.unitValue || 1,
      stockQuantity: item.itemType === 'SERVICE' ? null : (item.stockQuantity ?? 10),
      isClientVerified: item.isClientVerified ?? false,
      createdAt: now,
      updatedAt: now,
    };
    this.catalogItems.unshift(newItem);
    return newItem;
  }

  public updateCatalogItem(id: string, updates: Partial<CatalogItem>): CatalogItem | null {
    const index = this.catalogItems.findIndex((i) => i.id === id);
    if (index === -1) return null;
    const category = updates.categoryId
      ? this.categories.find((c) => c.id === updates.categoryId)
      : undefined;

    this.catalogItems[index] = {
      ...this.catalogItems[index],
      ...updates,
      categoryName: category ? category.name : this.catalogItems[index].categoryName,
      unitType: updates.unitType || this.catalogItems[index].unitType,
      unitValue: updates.unitValue || this.catalogItems[index].unitValue,
      stockQuantity:
        updates.itemType === 'SERVICE'
          ? null
          : (updates.stockQuantity !== undefined ? updates.stockQuantity : this.catalogItems[index].stockQuantity),
      updatedAt: new Date().toISOString(),
    };
    return this.catalogItems[index];
  }

  public deleteCatalogItem(id: string): boolean {
    const initialLen = this.catalogItems.length;
    this.catalogItems = this.catalogItems.filter((i) => i.id !== id);
    return this.catalogItems.length < initialLen;
  }

  // Daily Statuses
  public getActiveDailyStatusesForBrand(brandId: string): DailyStatus[] {
    const today = getTodayDateString();
    return this.dailyStatuses
      .filter((s) => {
        if (s.brandId !== brandId || !s.isActive) return false;
        if (s.publishDate > today) return false; // not published yet
        if (s.expiryDate && s.expiryDate < today) return false; // expired
        return true;
      })
      .sort((a, b) => (b.priority ?? 1) - (a.priority ?? 1) || b.publishDate.localeCompare(a.publishDate));
  }

  public getAllDailyStatusesForAdmin(brandId?: string): DailyStatus[] {
    let list = [...this.dailyStatuses];
    if (brandId) {
      list = list.filter((s) => s.brandId === brandId);
    }
    return list.sort((a, b) => b.publishDate.localeCompare(a.publishDate));
  }

  public getDailyStatusById(id: string): DailyStatus | undefined {
    return this.dailyStatuses.find((s) => s.id === id);
  }

  public addDailyStatus(status: Omit<DailyStatus, 'id' | 'createdAt' | 'updatedAt'>): DailyStatus {
    const now = new Date().toISOString();
    const newStatus: DailyStatus = {
      ...status,
      id: `status-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    this.dailyStatuses.unshift(newStatus);
    return newStatus;
  }

  public updateDailyStatus(id: string, updates: Partial<DailyStatus>): DailyStatus | null {
    const index = this.dailyStatuses.findIndex((s) => s.id === id);
    if (index === -1) return null;
    this.dailyStatuses[index] = {
      ...this.dailyStatuses[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.dailyStatuses[index];
  }

  public deleteDailyStatus(id: string): boolean {
    const initialLen = this.dailyStatuses.length;
    this.dailyStatuses = this.dailyStatuses.filter((s) => s.id !== id);
    return this.dailyStatuses.length < initialLen;
  }

  // =========================================================================
  // ORDERS & INVENTORY ATOMIC CONFIRMATION (PRODUCTION WORKFLOW)
  // =========================================================================

  public getNextInvoiceNumber(brandId: string): string {
    const year = new Date().getFullYear();
    let prefix = 'SSG';
    if (brandId === 'aquarium') prefix = 'SSA';
    else if (brandId === 'kirubai') prefix = 'KCK';
    else if (brandId === 'vision-360') prefix = 'SSV';

    const key = `${brandId}-${year}`;
    const currentSeq = this.invoiceSequences.get(key) || 0;
    const nextSeq = currentSeq + 1;
    this.invoiceSequences.set(key, nextSeq);

    return `${prefix}-${year}-${String(nextSeq).padStart(6, '0')}`;
  }

  public createOrder(input: CustomerCheckoutInput): { success: boolean; order?: Order; error?: string } {
    const brand = this.brands.get(input.brandId);
    if (!brand) {
      return { success: false, error: 'Invalid brand ID provided.' };
    }

    if (!input.items || input.items.length === 0) {
      return { success: false, error: 'Order must contain at least one item.' };
    }

    // Authoritative Server-Side Price & Item Verification
    const orderItems: OrderItem[] = [];
    let calculatedSubtotal = 0;
    let calculatedTotal = 0;

    for (const reqItem of input.items) {
      const catalogItem = this.catalogItems.find((ci) => ci.id === reqItem.catalogItemId);
      if (!catalogItem) {
        return { success: false, error: `Product ID "${reqItem.catalogItemId}" was not found in catalog.` };
      }
      if (catalogItem.brandId !== input.brandId) {
        return { success: false, error: `Product "${catalogItem.name}" does not belong to brand "${brand.name}".` };
      }
      if (!catalogItem.isActive || !catalogItem.isAvailable) {
        return { success: false, error: `Product "${catalogItem.name}" is currently unavailable.` };
      }
      if (reqItem.quantity <= 0) {
        return { success: false, error: `Invalid quantity for "${catalogItem.name}". Must be at least 1.` };
      }

      // Authoritative unit price: offerPrice takes precedence, fallback to originalPrice
      const unitPrice = catalogItem.offerPrice ?? catalogItem.originalPrice ?? 0;
      const originalPrice = catalogItem.originalPrice ?? unitPrice;
      const lineTotal = unitPrice * reqItem.quantity;
      const lineSubtotal = originalPrice * reqItem.quantity;

      calculatedSubtotal += lineSubtotal;
      calculatedTotal += lineTotal;

      orderItems.push({
        id: `oi-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        orderId: '', // Will link below
        catalogItemId: catalogItem.id,
        productName: catalogItem.name,
        quantity: reqItem.quantity,
        unitType: catalogItem.unitType,
        unitValue: catalogItem.unitValue,
        unitPrice,
        lineTotal,
        createdAt: new Date().toISOString(),
      });
    }

    const calculatedSavings = Math.max(0, calculatedSubtotal - calculatedTotal);
    const invoiceNumber = this.getNextInvoiceNumber(input.brandId);
    const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    // Link items to order ID
    orderItems.forEach((oi) => {
      oi.orderId = orderId;
    });

    // PENDING order created. STOCK IS UNTOUCHED.
    const newOrder: Order = {
      id: orderId,
      invoiceNumber,
      brandId: input.brandId,
      customerName: input.customerName.trim(),
      customerPhone: input.customerPhone.trim(),
      customerEmail: input.customerEmail.trim(),
      deliveryMethod: input.deliveryMethod,
      customerNote: input.customerNote?.trim() || undefined,
      subtotal: calculatedSubtotal,
      savings: calculatedSavings,
      totalAmount: calculatedTotal,
      status: 'PENDING',
      confirmationEmailSentAt: null,
      confirmationEmailError: null,
      createdAt: now,
      confirmedAt: null,
      cancelledAt: null,
      items: orderItems,
    };

    this.orders.unshift(newOrder);

    return {
      success: true,
      order: newOrder,
    };
  }

  public addOrder(order: Order): void {
    const idx = this.orders.findIndex((o) => o.id === order.id);
    if (idx >= 0) {
      this.orders[idx] = order;
    } else {
      this.orders.unshift(order);
    }
  }

  public confirmOrderAndDeductStock(orderId: string): { success: boolean; order?: Order; error?: string } {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) {
      return { success: false, error: 'Order not found.' };
    }

    // Duplicate confirmation check
    if (order.status === 'CONFIRMED') {
      return { success: false, error: 'Order has already been confirmed.' };
    }

    // Cancellation check
    if (order.status === 'CANCELLED') {
      return { success: false, error: 'Cancelled orders cannot be confirmed.' };
    }

    const items = order.items || [];

    // STEP 1: Verify stock availability for ALL order items (Atomic Pre-Check)
    for (const item of items) {
      const catalogItem = this.catalogItems.find((ci) => ci.id === item.catalogItemId);
      if (!catalogItem) {
        return {
          success: false,
          error: `Product "${item.productName}" not found in current catalog.`,
        };
      }

      if (catalogItem.stockQuantity !== null) {
        if (catalogItem.stockQuantity < item.quantity) {
          // Insufficient stock: abort transaction immediately. NO deduction. Order stays PENDING.
          return {
            success: false,
            error: `Insufficient stock for "${catalogItem.name}". Required: ${item.quantity}, Available: ${catalogItem.stockQuantity}. Confirmation aborted.`,
          };
        }
      }
    }

    // STEP 2: All items passed stock check -> Deduct stock atomically
    for (const item of items) {
      const catalogItem = this.catalogItems.find((ci) => ci.id === item.catalogItemId);
      if (catalogItem && catalogItem.stockQuantity !== null) {
        catalogItem.stockQuantity = Math.max(0, catalogItem.stockQuantity - item.quantity);
        catalogItem.updatedAt = new Date().toISOString();
      }
    }

    // STEP 3: Mark order CONFIRMED
    order.status = 'CONFIRMED';
    order.confirmedAt = new Date().toISOString();

    return {
      success: true,
      order,
    };
  }

  public cancelOrder(orderId: string): { success: boolean; order?: Order; error?: string } {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) {
      return { success: false, error: 'Order not found.' };
    }

    if (order.status === 'CANCELLED') {
      return { success: false, error: 'Order is already cancelled.' };
    }

    if (order.status === 'CONFIRMED') {
      return { success: false, error: 'Confirmed orders cannot be cancelled directly.' };
    }

    // Mark CANCELLED. STOCK IS UNTOUCHED.
    order.status = 'CANCELLED';
    order.cancelledAt = new Date().toISOString();

    return {
      success: true,
      order,
    };
  }

  public updateOrderEmailStatus(
    orderId: string,
    updates: { sentAt?: string | null; error?: string | null }
  ): void {
    const order = this.orders.find((o) => o.id === orderId);
    if (order) {
      if (updates.sentAt !== undefined) order.confirmationEmailSentAt = updates.sentAt;
      if (updates.error !== undefined) order.confirmationEmailError = updates.error;
    }
  }

  public getOrders(options?: {
    brandId?: string;
    status?: OrderStatus;
    search?: string;
  }): Order[] {
    let list = [...this.orders];

    if (options?.brandId && options.brandId !== 'all') {
      list = list.filter((o) => o.brandId === options.brandId);
    }

    if (options?.status) {
      list = list.filter((o) => o.status === options.status);
    }

    if (options?.search && options.search.trim()) {
      const q = options.search.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.invoiceNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  public getOrderById(orderId: string): Order | undefined {
    return this.orders.find((o) => o.id === orderId);
  }

  public getOrderKPIs(): {
    totalOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    cancelledOrders: number;
    confirmedRevenue: number;
  } {
    const totalOrders = this.orders.length;
    const pendingOrders = this.orders.filter((o) => o.status === 'PENDING').length;
    const confirmedOrders = this.orders.filter((o) => o.status === 'CONFIRMED').length;
    const cancelledOrders = this.orders.filter((o) => o.status === 'CANCELLED').length;
    // CRITICAL: Confirmed revenue MUST exclude PENDING and CANCELLED
    const confirmedRevenue = this.orders
      .filter((o) => o.status === 'CONFIRMED')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return {
      totalOrders,
      pendingOrders,
      confirmedOrders,
      cancelledOrders,
      confirmedRevenue,
    };
  }
}


// Global Singleton for server-side persistence
declare global {
  var __DATA_REPO__: DataRepository | undefined;
}

export const dataRepository = global.__DATA_REPO__ || new DataRepository();
if (process.env.NODE_ENV !== 'production') {
  global.__DATA_REPO__ = dataRepository;
}

