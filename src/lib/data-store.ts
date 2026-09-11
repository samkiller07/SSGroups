import { BrandConfig, Category, CatalogItem, BrandId, DailyStatus } from '@/types';
import { BRANDS, INITIAL_CATEGORIES, INITIAL_CATALOG_ITEMS } from '@/config/brands';
import { INITIAL_DAILY_STATUSES, getTodayDateString } from '@/config/daily-statuses';

// Production Data Repository
class DataRepository {
  private brands: Map<string, BrandConfig>;
  private categories: Category[];
  private catalogItems: CatalogItem[];
  private dailyStatuses: DailyStatus[];

  constructor() {
    this.brands = new Map(Object.entries(BRANDS));
    this.categories = [...INITIAL_CATEGORIES];
    this.catalogItems = [...INITIAL_CATALOG_ITEMS];
    this.dailyStatuses = [...INITIAL_DAILY_STATUSES];
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
}

// Global Singleton for server-side persistence
declare global {
  var __DATA_REPO__: DataRepository | undefined;
}

export const dataRepository = global.__DATA_REPO__ || new DataRepository();
if (process.env.NODE_ENV !== 'production') {
  global.__DATA_REPO__ = dataRepository;
}

