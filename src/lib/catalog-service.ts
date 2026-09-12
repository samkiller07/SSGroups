import { getSupabaseServer, isSupabaseConfigured } from '@/lib/supabase';
import { mapDbCatalogItemToItem } from '@/lib/supabase-mappers';
import { dataRepository } from '@/lib/data-store';
import { BRANDS } from '@/config/brands';
import { CatalogItem, Category, DailyStatus, BrandConfig } from '@/types';

export interface PersistentCatalogData {
  brand: BrandConfig;
  categories: Category[];
  allItems: CatalogItem[];
  featuredProducts: CatalogItem[];
  heroOfferItems: CatalogItem[];
  specializedServices: CatalogItem[];
  dailyStatuses: DailyStatus[];
}

/**
 * Server-side authoritative catalog loader:
 * Queries Supabase PostgreSQL (Single Source of Truth)
 * Falls back to dataRepository code defaults only if Supabase is offline or unconfigured.
 */
export async function getPersistentBrandCatalog(brandId: string): Promise<PersistentCatalogData> {
  const fallbackBrand = dataRepository.getBrand(brandId) || BRANDS[brandId as keyof typeof BRANDS] || BRANDS.aquarium;

  if (isSupabaseConfigured) {
    const supabase = getSupabaseServer();
    if (supabase) {
      try {
        const [itemsRes, catsRes, statusesRes] = await Promise.all([
          supabase
            .from('catalog_items')
            .select('*, images:product_images(*)')
            .eq('brand_id', brandId)
            .eq('is_active', true)
            .order('created_at', { ascending: false }),
          supabase
            .from('categories')
            .select('*')
            .eq('brand_id', brandId)
            .eq('is_active', true)
            .order('sort_order', { ascending: true }),
          supabase
            .from('daily_statuses')
            .select('*')
            .eq('brand_id', brandId)
            .eq('is_active', true)
            .order('priority', { ascending: false }),
        ]);

        if (!itemsRes.error && itemsRes.data !== null) {
          const allItems: CatalogItem[] = itemsRes.data.map(mapDbCatalogItemToItem);
          
          const categories: Category[] = (!catsRes.error && catsRes.data && catsRes.data.length > 0)
            ? catsRes.data.map((c: any) => ({
                id: c.id,
                brandId: c.brand_id,
                name: c.name,
                slug: c.slug,
                description: c.description || undefined,
                sortOrder: c.sort_order || 0,
                isActive: c.is_active !== false,
              }))
            : dataRepository.getCategoriesByBrand(brandId);

          // Populate categoryName on items from categories lookup
          const catMap = new Map(categories.map((c) => [c.id, c.name]));
          for (const item of allItems) {
            if (item.categoryId && catMap.has(item.categoryId)) {
              item.categoryName = catMap.get(item.categoryId);
            }
          }

          const featuredProducts = allItems.filter((i) => i.itemType === 'PRODUCT' && i.isFeatured);
          const heroOfferItems = allItems.filter((i) => i.isHeroOffer);
          const specializedServices = allItems.filter((i) => i.itemType === 'SERVICE');

          const dailyStatuses: DailyStatus[] = (!statusesRes.error && statusesRes.data && statusesRes.data.length > 0)
            ? statusesRes.data.map((s: any) => ({
                id: s.id,
                brandId: s.brand_id,
                title: s.title,
                shortMessage: s.short_message,
                detailedMessage: s.detailed_message || undefined,
                imageUrl: s.image_url || undefined,
                ctaLabel: s.cta_label || undefined,
                ctaDestination: s.cta_destination || undefined,
                statusType: s.status_type,
                priority: s.priority || 1,
                isActive: s.is_active !== false,
                publishDate: s.publish_date || s.created_at,
                expiryDate: s.expiry_date || undefined,
                createdAt: s.created_at,
                updatedAt: s.updated_at,
              }))
            : dataRepository.getActiveDailyStatusesForBrand(brandId);

          return {
            brand: fallbackBrand,
            categories,
            allItems,
            featuredProducts,
            heroOfferItems,
            specializedServices,
            dailyStatuses,
          };
        }
      } catch (err) {
        console.error('[getPersistentBrandCatalog] Supabase query exception:', err);
      }
    }
  }

  if (isSupabaseConfigured) {
    // If Supabase is configured, it is the authoritative SINGLE SOURCE OF TRUTH.
    // Never fall back to demo/sample products.
    return {
      brand: fallbackBrand,
      categories: dataRepository.getCategoriesByBrand(brandId),
      allItems: [],
      featuredProducts: [],
      heroOfferItems: [],
      specializedServices: [],
      dailyStatuses: dataRepository.getActiveDailyStatusesForBrand(brandId),
    };
  }

  // Fallback ONLY if Supabase is completely unconfigured
  const allItems = dataRepository.getCatalogItems(brandId);
  return {
    brand: fallbackBrand,
    categories: dataRepository.getCategoriesByBrand(brandId),
    allItems,
    featuredProducts: allItems.filter((i) => i.itemType === 'PRODUCT' && i.isFeatured),
    heroOfferItems: allItems.filter((i) => i.isHeroOffer),
    specializedServices: allItems.filter((i) => i.itemType === 'SERVICE'),
    dailyStatuses: dataRepository.getActiveDailyStatusesForBrand(brandId),
  };
}

/**
 * Server-side authoritative product item lookup by slug:
 * Queries Supabase first so that newly added or edited products are immediately displayed.
 * Returns null if deleted/not found in Supabase (does NOT resurrect from memory).
 */
export async function getPersistentProductBySlug(brandId: string, slug: string): Promise<CatalogItem | null> {
  if (isSupabaseConfigured) {
    const supabase = getSupabaseServer();
    if (supabase) {
      try {
        const { data: dbItem, error } = await supabase
          .from('catalog_items')
          .select('*, images:product_images(*)')
          .eq('brand_id', brandId)
          .eq('slug', slug)
          .maybeSingle();

        if (error) {
          console.error('[getPersistentProductBySlug] Query error:', error);
        } else {
          if (!dbItem) {
            return null; // Explicitly deleted or does not exist
          }
          return mapDbCatalogItemToItem(dbItem);
        }
      } catch (err) {
        console.error('[getPersistentProductBySlug] Supabase query exception:', err);
      }
    }
  }

  // Fallback to dataRepository ONLY if Supabase is not configured
  return dataRepository.getItemBySlug(brandId, slug) || null;
}
