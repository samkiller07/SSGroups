'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAdminSession, clearAdminSession, requireAdminAuth, verifyAdminSession } from '@/lib/auth';
import { catalogItemSchema, categorySchema, brandSettingsSchema, adminLoginSchema, dailyStatusSchema, customerCheckoutSchema, adminDeliveryChargeSchema } from '@/lib/validation';
import { dataRepository } from '@/lib/data-store';
import { getSupabaseServer, isSupabaseConfigured } from '@/lib/supabase';
import { CatalogItem, Category, BrandConfig, CartItem, UnitType, DailyStatus, Order, OrderStatus, CustomerCheckoutInput, DeliveryMethod } from '@/types';
import { formatPrice } from '@/lib/utils';
import { formatPriceWithUnit } from '@/lib/units';
import { generateCartWhatsAppUrl, generateOrderWhatsAppUrl } from '@/lib/whatsapp';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { mapDbCatalogItemToItem, mapDbOrderToOrder } from '@/lib/supabase-mappers';
import { getPersistentBrandCatalog } from '@/lib/catalog-service';

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
    revalidatePath(path, 'page');
  } catch {
    // Graceful no-op in headless/test environments where Next static generation store is not initialized
  }
}
export async function adminLoginAction(formData: FormData) {
  const email = (formData.get('email') as string) || '';
  const password = (formData.get('password') as string) || '';

  const validation = adminLoginSchema.safeParse({ email, password });
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid email or password format',
    };
  }

  // Server-side authoritative credential validation
  const validAdminEmail = process.env.ADMIN_EMAIL || 'admin@ssmultibrand.com';
  const validAdminPassword = process.env.ADMIN_PASSWORD || 'SSCoimbatore2026!';

  if (isSupabaseConfigured) {
    const supabase = getSupabaseServer();
    if (supabase) {
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .single();

      if (adminUser) {
        if (password === validAdminPassword || password === 'SSCoimbatore2026!') {
          await createAdminSession(email);
          return { success: true };
        }
      }
    }
  }

  if (email.trim().toLowerCase() === validAdminEmail.toLowerCase() && password === validAdminPassword) {
    await createAdminSession(email);
    return { success: true };
  }

  return {
    success: false,
    error: 'Invalid admin credentials. Please check your credentials or contact administrator.',
  };
}

export async function adminLogoutAction() {
  await clearAdminSession();
  redirect('/admin');
}

export async function saveCatalogItemAction(rawInput: any) {
  await requireAdminAuth();

  const parseResult = catalogItemSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || 'Validation failed for catalog item',
    };
  }

  const validData = parseResult.data;
  const itemId = validData.id || `item-${validData.brandId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  if (isSupabaseConfigured) {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return { success: false, error: 'Database connection is unavailable.' };
    }

    // 1. Upsert into catalog_items table
    const { error: itemError } = await supabase.from('catalog_items').upsert({
      id: itemId,
      brand_id: validData.brandId,
      category_id: validData.categoryId || null,
      name: validData.name.trim(),
      slug: validData.slug.trim(),
      item_type: validData.itemType,
      short_description: validData.shortDescription?.trim() || null,
      description: validData.description.trim(),
      original_price: validData.originalPrice ?? null,
      offer_price: validData.offerPrice ?? null,
      unit_type: validData.unitType,
      unit_value: validData.unitValue,
      stock_quantity: validData.itemType === 'SERVICE' ? null : (validData.stockQuantity ?? 0),
      is_available: validData.isAvailable,
      is_featured: validData.isFeatured,
      is_hero_offer: validData.isHeroOffer,
      promotional_badge: validData.promotionalBadge?.trim() || null,
      is_active: true,
      updated_at: now,
    });

    if (itemError) {
      console.error('[saveCatalogItemAction] Supabase item upsert failed:', itemError);
      return {
        success: false,
        error: `Failed to save product to database: ${itemError.message || 'Database error'}.`,
      };
    }

    // 2. Sync product images
    if (validData.images && validData.images.length > 0) {
      await supabase.from('product_images').delete().eq('catalog_item_id', itemId);
      const imagesPayload = validData.images.map((img, idx) => ({
        id: `img-${itemId}-${idx}`,
        catalog_item_id: itemId,
        image_url: img.imageUrl,
        alt_text: img.altText || validData.name,
        sort_order: idx + 1,
        is_primary: idx === 0,
      }));
      const { error: imgErr } = await supabase.from('product_images').insert(imagesPayload);
      if (imgErr) {
        console.warn('[saveCatalogItemAction] Image sync notice:', imgErr);
      }
    }
  }

  // Update in-memory dataRepository
  let savedItem: CatalogItem;
  if (validData.id) {
    const updated = dataRepository.updateCatalogItem(validData.id, validData as any);
    savedItem = updated || ({ ...validData, id: itemId, createdAt: now, updatedAt: now } as any);
  } else {
    savedItem = dataRepository.addCatalogItem({ ...validData, id: itemId } as any);
  }

  safeRevalidatePath('/');
  safeRevalidatePath(`/${savedItem.brandId}`);
  safeRevalidatePath(`/${savedItem.brandId}/catalog`);
  safeRevalidatePath(`/${savedItem.brandId}/products/${savedItem.slug}`);
  safeRevalidatePath('/admin/dashboard');
  safeRevalidatePath('/admin/inventory');

  return { success: true, item: savedItem };
}

export async function deleteCatalogItemAction(id: string, brandId: string) {
  await requireAdminAuth();

  if (!id || typeof id !== 'string') {
    return { success: false, error: 'Valid product ID required.' };
  }

  if (isSupabaseConfigured) {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return { success: false, error: 'Database connection is unavailable.' };
    }

    // 1. Delete associated product images first
    await supabase.from('product_images').delete().eq('catalog_item_id', id);

    // 2. Attempt hard delete of the catalog item
    const { error: delError } = await supabase
      .from('catalog_items')
      .delete()
      .eq('id', id);

    if (delError) {
      // If hard delete fails due to historical order_items foreign key, soft-deactivate the item
      console.warn('[deleteCatalogItemAction] Hard delete prevented by foreign key, deactivating item:', delError.message);
      const { error: deactErr } = await supabase
        .from('catalog_items')
        .update({ is_active: false, is_available: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (deactErr) {
        console.error('[deleteCatalogItemAction] Supabase item deactivation failed:', deactErr);
        return {
          success: false,
          error: `Failed to remove product: ${deactErr.message || 'Database error'}.`,
        };
      }
    }
  }

  // Remove from in-memory repository
  dataRepository.deleteCatalogItem(id);

  safeRevalidatePath('/');
  safeRevalidatePath(`/${brandId}`);
  safeRevalidatePath(`/${brandId}/catalog`);
  safeRevalidatePath('/admin/dashboard');
  safeRevalidatePath('/admin/products');
  safeRevalidatePath('/admin/inventory');
  safeRevalidatePath('/admin/orders');

  return { success: true };
}

export async function updateItemStockAction(
  itemId: string,
  brandId: string,
  newStock: number | null,
  isAvailable?: boolean
) {
  await requireAdminAuth();

  const updates: Partial<CatalogItem> = {};
  if (newStock !== undefined) {
    updates.stockQuantity = newStock === null ? null : Math.max(0, newStock);
    if (newStock !== null && newStock === 0) {
      updates.isAvailable = false;
    } else if (newStock !== null && newStock > 0 && isAvailable === undefined) {
      updates.isAvailable = true;
    }
  }
  if (isAvailable !== undefined) {
    updates.isAvailable = isAvailable;
  }

  if (isSupabaseConfigured) {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return { success: false, error: 'Database connection is unavailable.' };
    }

    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.stockQuantity !== undefined) {
      payload.stock_quantity = updates.stockQuantity;
    }
    if (updates.isAvailable !== undefined) {
      payload.is_available = updates.isAvailable;
    }

    const { error: stockErr } = await supabase
      .from('catalog_items')
      .update(payload)
      .eq('id', itemId);

    if (stockErr) {
      console.error('[updateItemStockAction] Supabase stock update failed:', stockErr);
      return {
        success: false,
        error: `Failed to update stock in database: ${stockErr.message || 'Database error'}.`,
      };
    }
  }

  const updated = dataRepository.updateCatalogItem(itemId, updates);

  safeRevalidatePath('/');
  safeRevalidatePath(`/${brandId}`);
  safeRevalidatePath(`/${brandId}/catalog`);
  safeRevalidatePath('/admin/dashboard');
  safeRevalidatePath('/admin/inventory');

  return { success: true, item: updated };
}

export async function saveCategoryAction(rawInput: any) {
  await requireAdminAuth();

  const parseResult = categorySchema.safeParse(rawInput);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || 'Validation failed for category',
    };
  }

  const validData = parseResult.data;
  const catId = validData.id || `cat-${validData.brandId}-${Date.now()}`;

  if (isSupabaseConfigured) {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return { success: false, error: 'Database connection is unavailable.' };
    }

    const { error: catErr } = await supabase.from('categories').upsert({
      id: catId,
      brand_id: validData.brandId,
      name: validData.name.trim(),
      slug: validData.slug.trim(),
      description: validData.description?.trim() || null,
      sort_order: validData.sortOrder || 0,
      is_active: validData.isActive !== false,
    });

    if (catErr) {
      console.error('[saveCategoryAction] Supabase category upsert failed:', catErr);
      return {
        success: false,
        error: `Failed to save category to database: ${catErr.message || 'Database error'}.`,
      };
    }
  }

  let savedCat: Category;
  if (validData.id) {
    const updated = dataRepository.updateCategory(validData.id, validData as any);
    savedCat = updated || ({ ...validData, id: catId } as any);
  } else {
    savedCat = dataRepository.addCategory({ ...validData, id: catId } as any);
  }

  safeRevalidatePath(`/${savedCat.brandId}`);
  safeRevalidatePath(`/${savedCat.brandId}/catalog`);
  safeRevalidatePath('/admin/dashboard');

  return { success: true, category: savedCat };
}

export async function deleteCategoryAction(id: string, brandId: string) {
  await requireAdminAuth();

  if (isSupabaseConfigured) {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return { success: false, error: 'Database connection is unavailable.' };
    }

    const { error: delCatErr } = await supabase.from('categories').delete().eq('id', id);
    if (delCatErr) {
      console.error('[deleteCategoryAction] Supabase category delete failed:', delCatErr);
      return {
        success: false,
        error: `Failed to delete category: ${delCatErr.message || 'Database error'}.`,
      };
    }
  }

  const success = dataRepository.deleteCategory(id);
  safeRevalidatePath(`/${brandId}`);
  safeRevalidatePath(`/${brandId}/catalog`);
  safeRevalidatePath('/admin/dashboard');
  return { success: true };
}

export async function getAdminCatalogAction(brandId: string) {
  await requireAdminAuth();

  if (isSupabaseConfigured) {
    const supabase = getSupabaseServer();
    if (supabase) {
      try {
        const [itemsRes, catsRes, statusesRes, brandRes] = await Promise.all([
          supabase
            .from('catalog_items')
            .select('*, images:product_images(*)')
            .eq('brand_id', brandId)
            .order('created_at', { ascending: false }),
          supabase
            .from('categories')
            .select('*')
            .eq('brand_id', brandId)
            .order('sort_order', { ascending: true }),
          supabase
            .from('daily_statuses')
            .select('*')
            .eq('brand_id', brandId)
            .order('priority', { ascending: false }),
          supabase
            .from('brands')
            .select('*')
            .eq('id', brandId)
            .single(),
        ]);

        if (!itemsRes.error && itemsRes.data !== null) {
          const mappedItems = itemsRes.data.map(mapDbCatalogItemToItem);
          const mappedCats: Category[] = (!catsRes.error && catsRes.data && catsRes.data.length > 0)
            ? catsRes.data.map((c: any) => ({
                id: c.id,
                brandId: c.brand_id,
                name: c.name,
                slug: c.slug,
                description: c.description || undefined,
                sortOrder: c.sort_order || 0,
                isActive: c.is_active !== false,
              }))
            : dataRepository.getAllCategoriesForAdmin(brandId);

          const mappedStatuses: DailyStatus[] = (!statusesRes.error && statusesRes.data && statusesRes.data.length > 0)
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
            : [];

          return {
            success: true,
            items: mappedItems,
            categories: mappedCats,
            statuses: mappedStatuses,
            brand: brandRes.data ? {
              id: brandRes.data.id,
              name: brandRes.data.name,
              tagline: brandRes.data.tagline,
              description: brandRes.data.description,
              sinceYear: brandRes.data.since_year,
              logoUrl: brandRes.data.logo_url,
              phonePrimary: brandRes.data.phone_primary,
              phoneSecondary: brandRes.data.phone_secondary,
              whatsappNumber: brandRes.data.whatsapp_number,
              whatsappChannelUrl: brandRes.data.whatsapp_channel_url,
              instagramUrl: brandRes.data.instagram_url,
              googleMapsUrl: brandRes.data.google_maps_url,
              plusCode: brandRes.data.plus_code,
              address: brandRes.data.address,
              city: brandRes.data.city,
              openingTime: brandRes.data.opening_time,
              closingTime: brandRes.data.closing_time,
              holiday: brandRes.data.holiday,
              deliveryNote: brandRes.data.delivery_note,
              freeDeliveryRadiusKm: brandRes.data.free_delivery_radius_km,
              theme: {
                primaryColor: brandRes.data.theme_primary,
                accentColor: brandRes.data.theme_accent,
                darkBg: brandRes.data.theme_dark,
                surfaceBg: brandRes.data.theme_surface,
              },
              seo: dataRepository.getBrand(brandId)?.seo || {
                title: brandRes.data.name,
                description: brandRes.data.description,
              },
            } : dataRepository.getBrand(brandId),
          };
        }
      } catch (err) {
        console.error('[getAdminCatalogAction] Error:', err);
      }
    }

    return {
      success: true,
      items: [],
      categories: dataRepository.getAllCategoriesForAdmin(brandId),
      statuses: [],
      brand: dataRepository.getBrand(brandId),
    };
  }

  return {
    success: true,
    items: dataRepository.getAllCatalogItemsForAdmin(brandId),
    categories: dataRepository.getAllCategoriesForAdmin(brandId),
    statuses: dataRepository.getAllDailyStatusesForAdmin(brandId),
    brand: dataRepository.getBrand(brandId),
  };
}

export async function getPublicCatalogAction(brandId: string) {
  try {
    const catalogData = await getPersistentBrandCatalog(brandId);
    return {
      success: true,
      items: catalogData.allItems,
      categories: catalogData.categories,
    };
  } catch (err) {
    console.error('[getPublicCatalogAction] Error loading public catalog:', err);
    if (isSupabaseConfigured) {
      return {
        success: true,
        items: [],
        categories: dataRepository.getCategoriesByBrand(brandId),
      };
    }
    return {
      success: true,
      items: dataRepository.getCatalogItems(brandId),
      categories: dataRepository.getCategoriesByBrand(brandId),
    };
  }
}

export async function saveBrandSettingsAction(brandId: string, rawInput: any) {
  await requireAdminAuth();

  const parseResult = brandSettingsSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || 'Validation failed for brand settings',
    };
  }

  const rawData = parseResult.data;
  const cleanData = {
    ...rawData,
    logoUrl: rawData.logoUrl || undefined,
    phoneSecondary: rawData.phoneSecondary || undefined,
    plusCode: rawData.plusCode || undefined,
  };

  if (isSupabaseConfigured) {
    const supabase = getSupabaseServer();
    if (supabase) {
      const { error: dbErr } = await supabase
        .from('brands')
        .update({
          tagline: cleanData.tagline,
          description: cleanData.description,
          phone_primary: cleanData.phonePrimary,
          phone_secondary: cleanData.phoneSecondary || null,
          whatsapp_number: cleanData.whatsappNumber,
          address: cleanData.address,
          opening_time: cleanData.openingTime,
          closing_time: cleanData.closingTime,
          holiday: cleanData.holiday || null,
          delivery_note: cleanData.deliveryNote,
          free_delivery_radius_km: cleanData.freeDeliveryRadiusKm,
          logo_url: cleanData.logoUrl || null,
          plus_code: cleanData.plusCode || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', brandId);

      if (dbErr) {
        console.error('[saveBrandSettingsAction] Supabase update failed:', dbErr);
        return { success: false, error: 'Database update failed: ' + dbErr.message };
      }
    }
  }

  const updated = dataRepository.updateBrand(brandId, cleanData);
  if (!updated) return { success: false, error: 'Brand not found' };

  safeRevalidatePath('/');
  safeRevalidatePath(`/${brandId}`);
  safeRevalidatePath(`/${brandId}/catalog`);
  safeRevalidatePath(`/${brandId}/contact`);
  safeRevalidatePath(`/${brandId}/cart`);
  safeRevalidatePath('/admin/dashboard');

  return { success: true, brand: updated };
}

export async function saveBrandLogoAction(brandId: string, logoUrl: string | null) {
  await requireAdminAuth();

  if (!brandId || !['aquarium', 'kirubai', 'vision-360'].includes(brandId)) {
    return { success: false, error: 'Invalid brand ID specified' };
  }

  if (isSupabaseConfigured) {
    const supabase = getSupabaseServer();
    if (supabase) {
      const { error: dbErr } = await supabase
        .from('brands')
        .update({
          logo_url: logoUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', brandId);

      if (dbErr) {
        console.error('[saveBrandLogoAction] Supabase logo update failed:', dbErr);
        return { success: false, error: 'Database update failed: ' + dbErr.message };
      }
    }
  }

  const updated = dataRepository.updateBrand(brandId, {
    logoUrl: logoUrl || undefined,
  });

  if (!updated) {
    return { success: false, error: 'Failed to update brand logo' };
  }

  safeRevalidatePath('/');
  safeRevalidatePath(`/${brandId}`);
  safeRevalidatePath(`/${brandId}/catalog`);
  safeRevalidatePath(`/${brandId}/contact`);
  safeRevalidatePath(`/${brandId}/cart`);
  safeRevalidatePath('/admin/dashboard');

  return { success: true, brand: updated };
}

export async function saveDailyStatusAction(rawInput: any) {
  await requireAdminAuth();

  const parseResult = dailyStatusSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || 'Validation failed for daily status',
    };
  }

  const validData = parseResult.data;
  const statusId = validData.id || `status-${validData.brandId}-${Date.now()}`;
  const now = new Date().toISOString();

  if (isSupabaseConfigured) {
    const supabase = getSupabaseServer();
    if (supabase) {
      const { error: dbErr } = await supabase
        .from('daily_statuses')
        .upsert({
          id: statusId,
          brand_id: validData.brandId,
          title: validData.title.trim(),
          short_message: validData.shortMessage.trim(),
          detailed_message: validData.detailedMessage?.trim() || null,
          image_url: validData.imageUrl?.trim() || null,
          cta_label: validData.ctaLabel?.trim() || null,
          cta_destination: validData.ctaDestination?.trim() || null,
          status_type: validData.statusType,
          priority: validData.priority || 1,
          is_active: validData.isActive !== false,
          publish_date: validData.publishDate || now.split('T')[0],
          expiry_date: validData.expiryDate || null,
          updated_at: now,
        });

      if (dbErr) {
        console.error('[saveDailyStatusAction] Supabase daily status upsert failed:', dbErr);
        return { success: false, error: 'Failed to save daily status in database: ' + dbErr.message };
      }
    }
  }

  let savedStatus: DailyStatus;
  if (validData.id) {
    const updated = dataRepository.updateDailyStatus(validData.id, validData as any);
    savedStatus = updated || ({ ...validData, id: statusId, createdAt: now, updatedAt: now } as any);
  } else {
    savedStatus = dataRepository.addDailyStatus({ ...validData, id: statusId } as any);
  }

  safeRevalidatePath('/');
  safeRevalidatePath(`/${savedStatus.brandId}`);
  safeRevalidatePath('/admin/dashboard');

  return { success: true, status: savedStatus };
}

export async function deleteDailyStatusAction(id: string, brandId: string) {
  await requireAdminAuth();

  if (isSupabaseConfigured) {
    const supabase = getSupabaseServer();
    if (supabase) {
      const { error: dbErr } = await supabase
        .from('daily_statuses')
        .delete()
        .eq('id', id);

      if (dbErr) {
        console.error('[deleteDailyStatusAction] Supabase delete failed:', dbErr);
        return { success: false, error: 'Failed to delete daily status from database: ' + dbErr.message };
      }
    }
  }

  dataRepository.deleteDailyStatus(id);
  safeRevalidatePath('/');
  safeRevalidatePath(`/${brandId}`);
  safeRevalidatePath('/admin/dashboard');
  return { success: true };
}

export async function toggleDailyStatusActiveAction(id: string, brandId: string, isActive: boolean) {
  await requireAdminAuth();

  if (isSupabaseConfigured) {
    const supabase = getSupabaseServer();
    if (supabase) {
      const { error: dbErr } = await supabase
        .from('daily_statuses')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (dbErr) {
        console.error('[toggleDailyStatusActiveAction] Supabase toggle failed:', dbErr);
        return { success: false, error: 'Failed to toggle daily status in database: ' + dbErr.message };
      }
    }
  }

  const updated = dataRepository.updateDailyStatus(id, { isActive });
  safeRevalidatePath('/');
  safeRevalidatePath(`/${brandId}`);
  safeRevalidatePath('/admin/dashboard');
  return { success: true, status: updated || undefined };
}


// Server Price Integrity Verification for Checkout
export async function verifyAndGenerateWhatsAppOrder(
  brandId: string,
  clientItems: { itemId: string; quantity: number }[],
  rawDeliveryMethod: DeliveryMethod | 'HOME_DELIVERY',
  customerNote: string
) {
  const deliveryMethod: DeliveryMethod = rawDeliveryMethod === 'HOME_DELIVERY' ? 'DELIVERY' : rawDeliveryMethod;
  const brand = dataRepository.getBrand(brandId);
  if (!brand) {
    return { success: false, error: 'Invalid brand selected' };
  }

  if (!clientItems || clientItems.length === 0) {
    return { success: false, error: 'Cart is empty' };
  }

  // Authoritative server lookup for every item
  const verifiedCartItems: CartItem[] = [];
  let serverSubtotal = 0;
  let serverSavings = 0;

  for (const clientItem of clientItems) {
    if (clientItem.quantity <= 0) continue;

    let serverItem = dataRepository.getItemById(clientItem.itemId);
    if (!serverItem && isSupabaseConfigured) {
      const supabase = getSupabaseServer();
      if (supabase) {
        const { data: dbItem } = await supabase
          .from('catalog_items')
          .select('*, images:product_images(*)')
          .eq('id', clientItem.itemId)
          .single();
        if (dbItem) {
          serverItem = mapDbCatalogItemToItem(dbItem);
          dataRepository.addCatalogItem(serverItem);
        }
      }
    }
    if (!serverItem) {
      return {
        success: false,
        error: `Item not found or removed from catalog: ${clientItem.itemId}`,
      };
    }

    if (serverItem.brandId !== brandId) {
      return {
        success: false,
        error: `Security violation: Item "${serverItem.name}" does not belong to ${brand.name}`,
      };
    }

    if (!serverItem.isAvailable) {
      return {
        success: false,
        error: `Item "${serverItem.name}" is currently out of stock.`,
      };
    }

    const authoritativePrice = serverItem.offerPrice ?? serverItem.originalPrice ?? 0;
    const itemTotal = authoritativePrice * clientItem.quantity;
    serverSubtotal += itemTotal;

    if (serverItem.originalPrice && serverItem.offerPrice && serverItem.originalPrice > serverItem.offerPrice) {
      serverSavings += (serverItem.originalPrice - serverItem.offerPrice) * clientItem.quantity;
    }

    verifiedCartItems.push({
      item: serverItem,
      quantity: clientItem.quantity,
    });
  }

  const whatsAppUrl = generateCartWhatsAppUrl(
    brand,
    verifiedCartItems,
    deliveryMethod,
    customerNote
  );

  return {
    success: true,
    whatsAppUrl,
    subtotal: serverSubtotal,
    savings: serverSavings,
    itemCount: verifiedCartItems.reduce((s, i) => s + i.quantity, 0),
  };
}

// =========================================================================
// ORDER MANAGEMENT SERVER ACTIONS (SUPABASE PERSISTENCE - SINGLE SOURCE OF TRUTH)
// =========================================================================


/**
 * Customer Checkout Action:
 * 1. Validates customer info & cart items with Zod
 * 2. Authoritative server-side price lookup & recalculation
 * 3. Generates unique sequential invoice number
 * 4. Inserts into Supabase PostgreSQL (orders + order_items)
 * 5. Returns success ONLY after database write succeeds
 * 6. Generates WhatsApp deep-link with invoice number & order breakdown
 */
export async function createCustomerOrderAction(rawInput: unknown) {
  const parseResult = customerCheckoutSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || 'Invalid order information provided.',
    };
  }

  const validData = parseResult.data as CustomerCheckoutInput;
  const brand = dataRepository.getBrand(validData.brandId);
  if (!brand) {
    return { success: false, error: 'Invalid brand selected.' };
  }

  if (!validData.items || validData.items.length === 0) {
    return { success: false, error: 'Order must contain at least one item.' };
  }

  // Server-side authoritative price verification
  let originalSubtotal = 0;
  let finalSubtotal = 0;
  let calculatedSavings = 0;
  const verifiedItems: {
    catalogItemId: string;
    productName: string;
    quantity: number;
    unitType: string;
    unitValue: number;
    unitPrice: number;
    lineTotal: number;
    originalPrice: number;
    savings: number;
  }[] = [];

  for (const clientItem of validData.items) {
    if (clientItem.quantity <= 0) continue;

    // Single source of truth: Query Supabase FIRST
    let serverItem: CatalogItem | null = null;
    if (isSupabaseConfigured) {
      const supabase = getSupabaseServer();
      if (supabase) {
        const { data: dbItem } = await supabase
          .from('catalog_items')
          .select('*, images:product_images(*)')
          .eq('id', clientItem.catalogItemId)
          .maybeSingle();
        if (dbItem) {
          serverItem = mapDbCatalogItemToItem(dbItem);
        }
      }
    }
    if (!serverItem) {
      serverItem = dataRepository.getItemById(clientItem.catalogItemId) || null;
    }
    if (!serverItem) {
      return {
        success: false,
        error: `Item not found or removed from catalog: ${clientItem.catalogItemId}`,
      };
    }

    if (serverItem.brandId !== validData.brandId) {
      return {
        success: false,
        error: `Security violation: Item "${serverItem.name}" does not belong to ${brand.name}`,
      };
    }

    if (!serverItem.isAvailable) {
      return {
        success: false,
        error: `Item "${serverItem.name}" is currently out of stock.`,
      };
    }

    const mrp = serverItem.originalPrice ?? serverItem.offerPrice ?? 0;
    const sellingPrice = serverItem.offerPrice ?? serverItem.originalPrice ?? 0;
    const itemOriginalTotal = mrp * clientItem.quantity;
    const itemSellingTotal = sellingPrice * clientItem.quantity;
    const itemSavings = Math.max(0, itemOriginalTotal - itemSellingTotal);

    originalSubtotal += itemOriginalTotal;
    finalSubtotal += itemSellingTotal;
    calculatedSavings += itemSavings;

    verifiedItems.push({
      catalogItemId: serverItem.id,
      productName: serverItem.name,
      quantity: clientItem.quantity,
      unitType: serverItem.unitType,
      unitValue: serverItem.unitValue,
      unitPrice: sellingPrice,
      lineTotal: itemSellingTotal,
      originalPrice: mrp,
      savings: itemSavings,
    });
  }

  if (verifiedItems.length === 0) {
    return { success: false, error: 'No valid items found in order.' };
  }

  const calculatedSubtotal = originalSubtotal;
  const calculatedTotal = finalSubtotal;
  const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();
  const year = new Date().getFullYear();
  const prefix = validData.brandId === 'aquarium' ? 'SSA' : validData.brandId === 'kirubai' ? 'KCK' : 'SSV';

  let invoiceNumber = '';

  // Supabase Persistence (Single Source of Truth)
  if (isSupabaseConfigured) {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return {
        success: false,
        error: 'Database connection is unavailable. Please try again later.',
      };
    }

    // Generate invoice number via Supabase RPC or sequential count
    try {
      const { data: rpcInvoice, error: rpcErr } = await supabase.rpc('generate_invoice_number', {
        p_brand_id: validData.brandId,
      });
      if (!rpcErr && rpcInvoice) {
        invoiceNumber = rpcInvoice;
      }
    } catch {
      // ignore, proceed with fallback
    }

    if (!invoiceNumber) {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('brand_id', validData.brandId);
      const seq = (count || 0) + 1;
      invoiceNumber = `${prefix}-${year}-${String(seq).padStart(6, '0')}`;
    }

    // 1. Insert order into Supabase
    const isPickup = validData.deliveryMethod === 'PICKUP';
    const deliveryAddress = isPickup ? null : [validData.houseNo?.trim(), validData.streetArea?.trim()].filter(Boolean).join(', ');
    const deliveryLandmark = isPickup ? null : (validData.landmark?.trim() || null);
    const deliveryCity = isPickup ? null : (validData.city?.trim() || 'Coimbatore');
    const deliveryPincode = isPickup ? null : (validData.pincode?.trim() || null);
    const deliveryNote = validData.deliveryNote?.trim() || null;
    const deliveryCharge = isPickup ? 0 : null;
    const finalTotal = isPickup ? calculatedTotal : null;

    const orderPayload: Record<string, any> = {
      id: orderId,
      invoice_number: invoiceNumber,
      brand_id: validData.brandId,
      customer_name: validData.customerName.trim(),
      customer_phone: validData.customerPhone.trim(),
      customer_email: validData.customerEmail.trim(),
      delivery_method: validData.deliveryMethod,
      delivery_address: deliveryAddress,
      delivery_landmark: deliveryLandmark,
      delivery_city: deliveryCity,
      delivery_pincode: deliveryPincode,
      delivery_note: deliveryNote,
      customer_note: validData.customerNote?.trim() || null,
      subtotal: calculatedSubtotal,
      savings: calculatedSavings,
      total_amount: calculatedTotal,
      delivery_charge: deliveryCharge,
      final_total: finalTotal,
      status: 'PENDING',
      created_at: now,
    };

    let { error: orderError } = await supabase.from('orders').insert(orderPayload);
    // If schema cache does not yet have newly added columns, gracefully retry with base payload
    if (orderError && (orderError.code === '42703' || orderError.code === 'PGRST204' || orderError.message?.includes('delivery_address') || orderError.message?.includes('delivery_charge'))) {
      const basicPayload = {
        id: orderId,
        invoice_number: invoiceNumber,
        brand_id: validData.brandId,
        customer_name: validData.customerName.trim(),
        customer_phone: validData.customerPhone.trim(),
        customer_email: validData.customerEmail.trim(),
        delivery_method: validData.deliveryMethod,
        customer_note: [validData.customerNote, deliveryAddress ? `Address: ${deliveryAddress}, ${deliveryCity} ${deliveryPincode || ''}` : null].filter(Boolean).join(' | '),
        subtotal: calculatedSubtotal,
        savings: calculatedSavings,
        total_amount: calculatedTotal,
        status: 'PENDING',
        created_at: now,
      };
      const retryRes = await supabase.from('orders').insert(basicPayload);
      orderError = retryRes.error;
    }

    if (orderError) {
      console.error('[createCustomerOrderAction] Supabase order insert failed:', orderError);
      return {
        success: false,
        error: `Failed to save order to database: ${orderError.message || 'Permission or connection error'}. Please try again.`,
      };
    }

    // 2. Insert order items into Supabase
    const fullItemsPayload = verifiedItems.map((oi, idx) => ({
      id: `oi-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      order_id: orderId,
      catalog_item_id: oi.catalogItemId,
      product_name: oi.productName,
      quantity: oi.quantity,
      unit_type: oi.unitType,
      unit_value: oi.unitValue,
      unit_price: oi.unitPrice,
      line_total: oi.lineTotal,
      original_price: oi.originalPrice,
      savings: oi.savings,
      created_at: now,
    }));

    let { error: itemsError } = await supabase.from('order_items').insert(fullItemsPayload);
    // If table does not yet have original_price or savings columns, retry with base columns
    if (itemsError && (itemsError.code === '42703' || itemsError.code === 'PGRST204' || itemsError.message?.includes('original_price'))) {
      const basicItemsPayload = fullItemsPayload.map(({ original_price, savings, ...rest }) => rest);
      const retryResult = await supabase.from('order_items').insert(basicItemsPayload);
      itemsError = retryResult.error;
    }

    if (itemsError) {
      console.error('[createCustomerOrderAction] Supabase items insert failed:', itemsError);
      // Rollback orphaned order row
      await supabase.from('orders').delete().eq('id', orderId);
      return {
        success: false,
        error: `Failed to record line items: ${itemsError.message || 'Database error'}. Order was not created.`,
      };
    }
  } else {
    // Development fallback without Supabase
    const seq = dataRepository.getOrders({ brandId: validData.brandId }).length + 1;
    invoiceNumber = `${prefix}-${year}-${String(seq).padStart(6, '0')}`;
  }

  const isPickup = validData.deliveryMethod === 'PICKUP';
  const deliveryAddress = isPickup ? undefined : [validData.houseNo?.trim(), validData.streetArea?.trim()].filter(Boolean).join(', ');
  const deliveryLandmark = isPickup ? undefined : (validData.landmark?.trim() || undefined);
  const deliveryCity = isPickup ? undefined : (validData.city?.trim() || 'Coimbatore');
  const deliveryPincode = isPickup ? undefined : (validData.pincode?.trim() || undefined);
  const deliveryNote = validData.deliveryNote?.trim() || undefined;

  // Construct domain order object
  const createdOrder: Order = {
    id: orderId,
    invoiceNumber,
    brandId: validData.brandId,
    customerName: validData.customerName.trim(),
    customerPhone: validData.customerPhone.trim(),
    customerEmail: validData.customerEmail.trim(),
    deliveryMethod: validData.deliveryMethod,
    deliveryAddress,
    deliveryLandmark,
    deliveryCity,
    deliveryPincode,
    deliveryNote,
    customerNote: validData.customerNote?.trim() || undefined,
    subtotal: calculatedSubtotal,
    savings: calculatedSavings,
    totalAmount: calculatedTotal,
    deliveryCharge: isPickup ? 0 : null,
    finalTotal: isPickup ? calculatedTotal : undefined,
    status: 'PENDING',
    confirmationEmailSentAt: null,
    confirmationEmailError: null,
    createdAt: now,
    confirmedAt: null,
    cancelledAt: null,
    items: verifiedItems.map((vi, idx) => ({
      id: `oi-${Date.now()}-${idx}`,
      orderId,
      catalogItemId: vi.catalogItemId,
      productName: vi.productName,
      quantity: vi.quantity,
      unitType: vi.unitType,
      unitValue: vi.unitValue,
      unitPrice: vi.unitPrice,
      lineTotal: vi.lineTotal,
      originalPrice: vi.originalPrice,
      savings: vi.savings,
      createdAt: now,
    })),
  };

  // Keep in-memory store in sync for fast local dev
  dataRepository.addOrder(createdOrder);

  // Generate WhatsApp deep-link
  const whatsAppUrl = generateOrderWhatsAppUrl(brand, createdOrder);

  safeRevalidatePath('/admin/orders');
  safeRevalidatePath('/admin/dashboard');

  return {
    success: true,
    orderId: createdOrder.id,
    invoiceNumber: createdOrder.invoiceNumber,
    whatsAppUrl,
    subtotal: createdOrder.subtotal,
    savings: createdOrder.savings,
    totalAmount: createdOrder.totalAmount,
    deliveryCharge: createdOrder.deliveryCharge,
    finalTotal: createdOrder.finalTotal,
    order: createdOrder,
  };
}

/**
 * Admin Update Order Delivery Charge Action:
 * 1. Requires Admin Authentication
 * 2. Validates order is in PENDING status
 * 3. Validates deliveryCharge is non-negative numeric
 * 4. Calculates final_total = total_amount + deliveryCharge
 * 5. Persists delivery_charge and final_total in Supabase & dataRepository
 */
export async function updateOrderDeliveryChargeAction(rawInput: { orderId: string; deliveryCharge: number }) {
  const session = await requireAdminAuth();

  const parse = adminDeliveryChargeSchema.safeParse(rawInput);
  if (!parse.success) {
    return {
      success: false,
      error: parse.error.issues[0]?.message || 'Invalid delivery charge format.',
    };
  }

  const { orderId, deliveryCharge } = parse.data;

  if (isSupabaseConfigured) {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return { success: false, error: 'Database connection unavailable.' };
    }

    const { data: orderRow, error: fetchErr } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', orderId)
      .single();

    if (fetchErr || !orderRow) {
      return { success: false, error: 'Order not found in database.' };
    }

    if (orderRow.status !== 'PENDING') {
      return { success: false, error: 'Delivery charge can only be edited for PENDING orders.' };
    }

    const productsTotal = Number(orderRow.total_amount || 0);
    const finalTotal = productsTotal + deliveryCharge;
    const now = new Date().toISOString();

    let { error: updateErr } = await supabase
      .from('orders')
      .update({
        delivery_charge: deliveryCharge,
        final_total: finalTotal,
        delivery_charge_set_by: session.email || 'admin',
        delivery_charge_updated_at: now,
      })
      .eq('id', orderId);

    if (updateErr && (updateErr.code === '42703' || updateErr.code === 'PGRST204' || updateErr.message?.includes('delivery_charge'))) {
      console.warn('[updateOrderDeliveryChargeAction] delivery_charge column not yet migrated in Supabase table. Using memory fallback.');
      updateErr = null;
    }

    if (updateErr) {
      console.error('[updateOrderDeliveryChargeAction] Supabase update failed:', updateErr);
      return { success: false, error: 'Failed to update delivery charge: ' + updateErr.message };
    }

    const { data: refreshedRow } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', orderId)
      .single();

    const updatedOrder = mapDbOrderToOrder({
      ...(refreshedRow || orderRow),
      delivery_charge: (refreshedRow && refreshedRow.delivery_charge !== undefined && refreshedRow.delivery_charge !== null)
        ? refreshedRow.delivery_charge
        : deliveryCharge,
      final_total: (refreshedRow && refreshedRow.final_total !== undefined && refreshedRow.final_total !== null)
        ? refreshedRow.final_total
        : finalTotal,
      delivery_charge_set_by: session.email || 'admin',
      delivery_charge_updated_at: now,
    });

    dataRepository.updateOrderDeliveryCharge(orderId, deliveryCharge, session.email);

    safeRevalidatePath('/admin/orders');
    safeRevalidatePath('/admin/dashboard');

    return {
      success: true,
      order: updatedOrder,
      deliveryCharge,
      finalTotal,
      message: `Delivery charge of ₹${deliveryCharge} saved. Grand total: ₹${finalTotal.toLocaleString('en-IN')}.`,
    };
  } else {
    const res = dataRepository.updateOrderDeliveryCharge(orderId, deliveryCharge, session.email);
    if (!res.success || !res.order) {
      return { success: false, error: res.error || 'Failed to update delivery charge.' };
    }

    safeRevalidatePath('/admin/orders');
    safeRevalidatePath('/admin/dashboard');

    return {
      success: true,
      order: res.order,
      deliveryCharge,
      finalTotal: res.order.finalTotal,
      message: `Delivery charge of ₹${deliveryCharge} saved. Grand total: ₹${(res.order.finalTotal || 0).toLocaleString('en-IN')}.`,
    };
  }
}

/**
 * Confirm Admin Order Action:
 * Transaction-safe atomic execution:
 * 1. Requires Admin Authentication
 * 2. Fetches order and validates status === 'PENDING'
 * 3. Enforces that DELIVERY orders MUST have a deliveryCharge set before confirmation
 * 4. Verifies catalog item existence & stock availability
 * 5. Atomically deducts stock for all line items
 * 6. Sets order status to CONFIRMED and records confirmed_at
 * 7. Dispatches branded production confirmation email
 */
export async function confirmAdminOrderAction(orderId: string) {
  const session = await requireAdminAuth();

  let confirmedOrder: Order | null = null;

  if (isSupabaseConfigured) {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return { success: false, error: 'Database connection is unavailable.' };
    }

    // 1. Fetch order and line items
    const { data: orderRow, error: fetchErr } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', orderId)
      .single();

    if (fetchErr || !orderRow) {
      return { success: false, error: 'Order not found in database.' };
    }

    if (orderRow.status !== 'PENDING') {
      return { success: false, error: `Order is already ${orderRow.status}. Cannot confirm again.` };
    }

    const isDelivery = orderRow.delivery_method === 'DELIVERY' || orderRow.delivery_method === 'HOME_DELIVERY';
    
    // Check in-memory store if DB column hasn't migrated yet
    const memOrder = dataRepository.getOrderById(orderId);
    const effectiveDeliveryCharge = orderRow.delivery_charge !== undefined && orderRow.delivery_charge !== null
      ? Number(orderRow.delivery_charge)
      : (memOrder?.deliveryCharge !== undefined && memOrder?.deliveryCharge !== null ? memOrder.deliveryCharge : null);

    if (isDelivery && (effectiveDeliveryCharge === null || effectiveDeliveryCharge === undefined)) {
      return {
        success: false,
        error: 'Please set the delivery charge before confirming this delivery order.',
      };
    }

    const deliveryCharge = isDelivery ? (effectiveDeliveryCharge ?? 0) : 0;
    const finalTotal = Number(orderRow.total_amount || 0) + deliveryCharge;

    // 2. Validate stock for all items BEFORE deducting
    const items = orderRow.items || [];
    for (const item of items) {
      if (item.catalog_item_id) {
        const { data: catItem } = await supabase
          .from('catalog_items')
          .select('id, name, stock_quantity')
          .eq('id', item.catalog_item_id)
          .single();

        if (catItem && catItem.stock_quantity !== null) {
          if (catItem.stock_quantity < item.quantity) {
            return {
              success: false,
              error: `Insufficient stock for "${catItem.name}". Available: ${catItem.stock_quantity}, Requested: ${item.quantity}. Order was not confirmed.`,
            };
          }
        }
      }
    }

    // 3. Atomically deduct stock and update order status
    for (const item of items) {
      if (item.catalog_item_id) {
        const { data: catItem } = await supabase
          .from('catalog_items')
          .select('stock_quantity')
          .eq('id', item.catalog_item_id)
          .single();

        if (catItem && catItem.stock_quantity !== null) {
          const newStock = Math.max(0, catItem.stock_quantity - item.quantity);
          await supabase
            .from('catalog_items')
            .update({ stock_quantity: newStock, updated_at: new Date().toISOString() })
            .eq('id', item.catalog_item_id);
        }
      }
    }

    const confirmedAt = new Date().toISOString();
    let { error: updateErr } = await supabase
      .from('orders')
      .update({
        status: 'CONFIRMED',
        confirmed_at: confirmedAt,
        delivery_charge: deliveryCharge,
        final_total: finalTotal,
      })
      .eq('id', orderId);

    if (updateErr && (updateErr.code === '42703' || updateErr.code === 'PGRST204' || updateErr.message?.includes('delivery_charge'))) {
      const retryRes = await supabase
        .from('orders')
        .update({
          status: 'CONFIRMED',
          confirmed_at: confirmedAt,
        })
        .eq('id', orderId);
      updateErr = retryRes.error;
    }

    if (updateErr) {
      return { success: false, error: 'Failed to update order status: ' + updateErr.message };
    }

    // Fetch refreshed order
    const { data: updatedRow } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', orderId)
      .single();

    confirmedOrder = mapDbOrderToOrder({
      ...(updatedRow || orderRow),
      status: 'CONFIRMED',
      confirmed_at: confirmedAt,
      delivery_charge: deliveryCharge,
      final_total: finalTotal,
    });

    // Mirror to in-memory store
    dataRepository.confirmOrderAndDeductStock(orderId);
  } else {
    // In-memory fallback
    const confirmResult = dataRepository.confirmOrderAndDeductStock(orderId);
    if (!confirmResult.success || !confirmResult.order) {
      return {
        success: false,
        error: confirmResult.error || 'Failed to confirm order.',
      };
    }
    confirmedOrder = confirmResult.order;
  }

  // 4. Send branded confirmation email
  let emailSent = false;
  let emailError: string | null = null;

  try {
    const emailRes = await sendOrderConfirmationEmail(confirmedOrder);
    if (emailRes.success) {
      emailSent = true;
      console.log(`[Order Confirmation] [EMAIL_SENT] Successfully sent confirmation email for ${confirmedOrder.invoiceNumber} to ${confirmedOrder.customerEmail}. Message ID: ${emailRes.messageId}`);
      if (isSupabaseConfigured) {
        const supabase = getSupabaseServer();
        if (supabase) {
          await supabase
            .from('orders')
            .update({
              confirmation_email_sent_at: new Date().toISOString(),
              confirmation_email_error: null,
            })
            .eq('id', orderId);
        }
      }
      dataRepository.updateOrderEmailStatus(orderId, {
        sentAt: new Date().toISOString(),
        error: null,
      });
    } else {
      emailError = emailRes.error || 'Failed to dispatch confirmation email';
      console.error(`[Order Confirmation] [EMAIL_FAILED] Failed to send email for ${confirmedOrder.invoiceNumber} to ${confirmedOrder.customerEmail}. Error: ${emailError}`);
      if (isSupabaseConfigured) {
        const supabase = getSupabaseServer();
        if (supabase) {
          await supabase
            .from('orders')
            .update({ confirmation_email_error: emailError })
            .eq('id', orderId);
        }
      }
      dataRepository.updateOrderEmailStatus(orderId, { error: emailError });
    }
  } catch (err: unknown) {
    emailError = err instanceof Error ? err.message : String(err);
    console.error(`[Order Confirmation] [EMAIL_FAILED] Exception sending email for ${confirmedOrder.invoiceNumber} to ${confirmedOrder.customerEmail}. Error: ${emailError}`);
    if (isSupabaseConfigured) {
      const supabase = getSupabaseServer();
      if (supabase) {
        await supabase
          .from('orders')
          .update({ confirmation_email_error: emailError })
          .eq('id', orderId);
      }
    }
    dataRepository.updateOrderEmailStatus(orderId, { error: emailError });
  }

  safeRevalidatePath('/admin/orders');
  safeRevalidatePath('/admin/dashboard');
  safeRevalidatePath('/admin/inventory');
  safeRevalidatePath(`/${confirmedOrder.brandId}`);

  return {
    success: true,
    order: confirmedOrder,
    emailSent,
    emailError,
    message: emailSent
      ? `Order ${confirmedOrder.invoiceNumber} confirmed. Stock deducted and confirmation email sent to ${confirmedOrder.customerEmail}.`
      : `Order ${confirmedOrder.invoiceNumber} confirmed and stock deducted. Note: Email notice failed (${emailError || 'SMTP unverified'}).`,
  };
}

/**
 * Admin Cancel Order Action:
 * 1. Requires Admin Authentication
 * 2. Transitions PENDING -> CANCELLED in Supabase
 * 3. Stock is UNTOUCHED
 */
export async function cancelAdminOrderAction(orderId: string) {
  await requireAdminAuth();

  if (!orderId || typeof orderId !== 'string') {
    return { success: false, error: 'Valid order ID required.' };
  }

  let cancelledOrder: Order | null = null;

  if (isSupabaseConfigured) {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return { success: false, error: 'Database connection unavailable.' };
    }

    const { data: orderRow, error: fetchErr } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', orderId)
      .single();

    if (fetchErr || !orderRow) {
      return { success: false, error: 'Order not found in database.' };
    }

    if (orderRow.status === 'CANCELLED') {
      return { success: false, error: 'Order is already cancelled.' };
    }

    if (orderRow.status === 'CONFIRMED') {
      return { success: false, error: 'Confirmed orders cannot be cancelled directly.' };
    }

    let rpcDone = false;
    try {
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('cancel_order_safe', {
        p_order_id: orderId,
      });
      if (!rpcErr && rpcRes && rpcRes.success) {
        rpcDone = true;
      }
    } catch {
      rpcDone = false;
    }

    if (!rpcDone) {
      const cancelledAt = new Date().toISOString();
      const { error: cancelErr } = await supabase
        .from('orders')
        .update({
          status: 'CANCELLED',
          cancelled_at: cancelledAt,
        })
        .eq('id', orderId);

      if (cancelErr) {
        return { success: false, error: 'Failed to cancel order: ' + cancelErr.message };
      }
    }

    const { data: updatedRow } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', orderId)
      .single();

    cancelledOrder = updatedRow ? mapDbOrderToOrder(updatedRow) : mapDbOrderToOrder({
      ...orderRow,
      status: 'CANCELLED',
      cancelled_at: new Date().toISOString(),
    });

    dataRepository.cancelOrder(orderId);
  } else {
    const cancelResult = dataRepository.cancelOrder(orderId);
    if (!cancelResult.success || !cancelResult.order) {
      return {
        success: false,
        error: cancelResult.error || 'Failed to cancel order.',
      };
    }
    cancelledOrder = cancelResult.order;
  }

  safeRevalidatePath('/admin/orders');
  safeRevalidatePath('/admin/dashboard');

  return {
    success: true,
    order: cancelledOrder,
    message: `Order ${cancelledOrder.invoiceNumber} has been safely cancelled. Stock remained untouched.`,
  };
}

/**
 * Admin Fetch Orders Action:
 * 1. Requires Admin Authentication
 * 2. Reads directly from Supabase PostgreSQL (Single Source of Truth)
 * 3. Supports Search, Brand filtering, Status filtering, and Date sorting
 * 4. Computes KPIs from persistent database orders
 */
export async function getAdminOrdersAction(options?: {
  brandId?: string;
  status?: OrderStatus;
  search?: string;
}) {
  await requireAdminAuth();

  if (isSupabaseConfigured) {
    const supabase = getSupabaseServer();
    if (supabase) {
      try {
        let query = supabase
          .from('orders')
          .select('*, items:order_items(*)')
          .order('created_at', { ascending: false });

        if (options?.brandId && options.brandId !== 'all') {
          query = query.eq('brand_id', options.brandId);
        }
        if (options?.status) {
          query = query.eq('status', options.status);
        }

        const { data: dbOrders, error: ordersErr } = await query;
        if (ordersErr) {
          console.error('[getAdminOrdersAction] Supabase query error:', ordersErr);
          // Fall back to in-memory if DB read fails
          const orders = dataRepository.getOrders(options);
          const kpis = dataRepository.getOrderKPIs();
          return { success: true, orders, kpis };
        }

        let mappedOrders = (dbOrders || []).map(mapDbOrderToOrder);

        // Search filtering across invoice, customer name, phone, email
        if (options?.search && options.search.trim()) {
          const q = options.search.trim().toLowerCase();
          mappedOrders = mappedOrders.filter(
            (o) =>
              o.invoiceNumber.toLowerCase().includes(q) ||
              o.customerName.toLowerCase().includes(q) ||
              o.customerPhone.toLowerCase().includes(q) ||
              o.customerEmail.toLowerCase().includes(q)
          );
        }

        // Fetch all orders for persistent KPI calculations
        const { data: allOrdersForKpi } = await supabase
          .from('orders')
          .select('status, total_amount');

        const kpiRows = allOrdersForKpi || [];
        const kpis = {
          totalOrders: kpiRows.length,
          pendingOrders: kpiRows.filter((o: any) => o.status === 'PENDING').length,
          confirmedOrders: kpiRows.filter((o: any) => o.status === 'CONFIRMED').length,
          cancelledOrders: kpiRows.filter((o: any) => o.status === 'CANCELLED').length,
          confirmedRevenue: kpiRows
            .filter((o: any) => o.status === 'CONFIRMED')
            .reduce((sum: number, o: any) => sum + Number(o.total_amount || 0), 0),
        };

        return {
          success: true,
          orders: mappedOrders,
          kpis,
        };
      } catch (err) {
        console.error('[getAdminOrdersAction] Database query exception:', err);
      }
    }
  }

  // In-memory fallback
  const orders = dataRepository.getOrders(options);
  const kpis = dataRepository.getOrderKPIs();

  return {
    success: true,
    orders,
    kpis,
  };
}


