'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAdminSession, clearAdminSession, requireAdminAuth, verifyAdminSession } from '@/lib/auth';
import { catalogItemSchema, categorySchema, brandSettingsSchema, adminLoginSchema, dailyStatusSchema, customerCheckoutSchema } from '@/lib/validation';
import { dataRepository } from '@/lib/data-store';
import { getSupabaseServer, isSupabaseConfigured } from '@/lib/supabase';
import { CatalogItem, Category, BrandConfig, CartItem, UnitType, DailyStatus, Order, OrderStatus, CustomerCheckoutInput } from '@/types';
import { formatPrice } from '@/lib/utils';
import { formatPriceWithUnit } from '@/lib/units';
import { generateCartWhatsAppUrl, generateOrderWhatsAppUrl } from '@/lib/whatsapp';
import { sendOrderConfirmationEmail } from '@/lib/email';


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

  // Also support Supabase Auth if configured
  if (isSupabaseConfigured) {
    const supabase = getSupabaseServer();
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.user) {
        await createAdminSession(email);
        return { success: true };
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

  // Persist to Supabase if configured, otherwise persistent repository
  let savedItem: CatalogItem;
  if (validData.id) {
    const updated = dataRepository.updateCatalogItem(validData.id, validData as any);
    if (!updated) {
      return { success: false, error: 'Item not found for update' };
    }
    savedItem = updated;
  } else {
    savedItem = dataRepository.addCatalogItem(validData as any);
  }

  // If Supabase is active, mirror write to PostgreSQL
  if (isSupabaseConfigured) {
    const supabase = getSupabaseServer();
    if (supabase) {
      try {
        await supabase.from('catalog_items').upsert({
          id: savedItem.id,
          brand_id: savedItem.brandId,
          category_id: savedItem.categoryId,
          name: savedItem.name,
          slug: savedItem.slug,
          item_type: savedItem.itemType,
          short_description: savedItem.shortDescription,
          description: savedItem.description,
          original_price: savedItem.originalPrice,
          offer_price: savedItem.offerPrice,
          unit_type: savedItem.unitType,
          unit_value: savedItem.unitValue,
          stock_quantity: savedItem.stockQuantity,
          promotional_badge: savedItem.promotionalBadge,
          is_available: savedItem.isAvailable,
          is_featured: savedItem.isFeatured,
          is_hero_offer: savedItem.isHeroOffer,
          is_active: savedItem.isActive,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Supabase write notice:', err);
      }
    }
  }

  revalidatePath('/');
  revalidatePath(`/${savedItem.brandId}`);
  revalidatePath(`/${savedItem.brandId}/catalog`);
  revalidatePath(`/${savedItem.brandId}/products/${savedItem.slug}`);

  return { success: true, item: savedItem };
}

export async function deleteCatalogItemAction(id: string, brandId: string) {
  await requireAdminAuth();

  const success = dataRepository.deleteCatalogItem(id);

  if (isSupabaseConfigured) {
    const supabase = getSupabaseServer();
    if (supabase) {
      await supabase.from('catalog_items').delete().eq('id', id);
    }
  }

  revalidatePath('/');
  revalidatePath(`/${brandId}`);
  revalidatePath(`/${brandId}/catalog`);

  return { success };
}

export async function updateItemStockAction(
  itemId: string,
  brandId: string,
  newStock: number | null,
  isAvailable?: boolean
) {
  await requireAdminAuth();

  const existing = dataRepository.getItemById(itemId);
  if (!existing || existing.brandId !== brandId) {
    return { success: false, error: 'Item not found in specified brand catalog' };
  }

  const updates: Partial<CatalogItem> = {};
  if (newStock !== undefined) {
    updates.stockQuantity = newStock === null ? null : Math.max(0, newStock);
    if (newStock !== null && newStock === 0) {
      updates.isAvailable = false;
    } else if (newStock !== null && newStock > 0 && isAvailable === undefined && !existing.isAvailable) {
      updates.isAvailable = true;
    }
  }
  if (isAvailable !== undefined) {
    updates.isAvailable = isAvailable;
  }

  const updated = dataRepository.updateCatalogItem(itemId, updates);
  if (!updated) {
    return { success: false, error: 'Failed to update item stock' };
  }

  if (isSupabaseConfigured) {
    const supabase = getSupabaseServer();
    if (supabase) {
      try {
        await supabase
          .from('catalog_items')
          .update({
            stock_quantity: updated.stockQuantity,
            is_available: updated.isAvailable,
            updated_at: new Date().toISOString(),
          })
          .eq('id', itemId);
      } catch (err) {
        console.error('Supabase stock update sync notice:', err);
      }
    }
  }

  revalidatePath('/');
  revalidatePath(`/${brandId}`);
  revalidatePath(`/${brandId}/catalog`);
  revalidatePath(`/${brandId}/products/${updated.slug}`);
  revalidatePath('/admin/dashboard');

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

  let savedCat: Category;
  if (validData.id) {
    const updated = dataRepository.updateCategory(validData.id, validData as any);
    if (!updated) return { success: false, error: 'Category not found' };
    savedCat = updated;
  } else {
    savedCat = dataRepository.addCategory(validData as any);
  }

  revalidatePath(`/${savedCat.brandId}`);
  revalidatePath(`/${savedCat.brandId}/catalog`);

  return { success: true, category: savedCat };
}

export async function deleteCategoryAction(id: string, brandId: string) {
  await requireAdminAuth();
  const success = dataRepository.deleteCategory(id);
  revalidatePath(`/${brandId}`);
  revalidatePath(`/${brandId}/catalog`);
  return { success };
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

  const updated = dataRepository.updateBrand(brandId, cleanData);
  if (!updated) return { success: false, error: 'Brand not found' };

  revalidatePath('/');
  revalidatePath(`/${brandId}`);
  revalidatePath(`/${brandId}/catalog`);
  revalidatePath(`/${brandId}/contact`);
  revalidatePath(`/${brandId}/cart`);

  return { success: true, brand: updated };
}

export async function saveBrandLogoAction(brandId: string, logoUrl: string | null) {
  await requireAdminAuth();

  if (!brandId || !['aquarium', 'kirubai', 'vision-360'].includes(brandId)) {
    return { success: false, error: 'Invalid brand ID specified' };
  }

  const updated = dataRepository.updateBrand(brandId, {
    logoUrl: logoUrl || undefined,
  });

  if (!updated) {
    return { success: false, error: 'Failed to update brand logo' };
  }

  revalidatePath('/');
  revalidatePath(`/${brandId}`);
  revalidatePath(`/${brandId}/catalog`);
  revalidatePath(`/${brandId}/contact`);
  revalidatePath(`/${brandId}/cart`);

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
  let savedStatus: DailyStatus;

  if (validData.id) {
    const updated = dataRepository.updateDailyStatus(validData.id, validData as any);
    if (!updated) return { success: false, error: 'Daily status not found' };
    savedStatus = updated;
  } else {
    savedStatus = dataRepository.addDailyStatus(validData as any);
  }

  revalidatePath('/');
  revalidatePath(`/${savedStatus.brandId}`);
  revalidatePath('/admin/dashboard');

  return { success: true, status: savedStatus };
}

export async function deleteDailyStatusAction(id: string, brandId: string) {
  await requireAdminAuth();
  const success = dataRepository.deleteDailyStatus(id);
  revalidatePath('/');
  revalidatePath(`/${brandId}`);
  revalidatePath('/admin/dashboard');
  return { success };
}

export async function toggleDailyStatusActiveAction(id: string, brandId: string, isActive: boolean) {
  await requireAdminAuth();
  const updated = dataRepository.updateDailyStatus(id, { isActive });
  revalidatePath('/');
  revalidatePath(`/${brandId}`);
  revalidatePath('/admin/dashboard');
  return { success: !!updated, status: updated };
}


// Server Price Integrity Verification for Checkout
export async function verifyAndGenerateWhatsAppOrder(
  brandId: string,
  clientItems: { itemId: string; quantity: number }[],
  deliveryMethod: 'PICKUP' | 'HOME_DELIVERY',
  customerNote: string
) {
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

    const serverItem = dataRepository.getItemById(clientItem.itemId);
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
// ORDER MANAGEMENT SERVER ACTIONS (V2 PRODUCTION WORKFLOW)
// =========================================================================

/**
 * Customer Checkout Action:
 * 1. Validates customer info & cart items with Zod
 * 2. Recalculates authoritative server-side pricing
 * 3. Generates unique, sequential invoice number
 * 4. Creates PENDING order with items (STOCK REMAINS UNTOUCHED)
 * 5. Generates WhatsApp deep-link with invoice number & order breakdown
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

  // Create PENDING order via authoritative repository (Stock is NOT reduced)
  const result = dataRepository.createOrder(validData);
  if (!result.success || !result.order) {
    return {
      success: false,
      error: result.error || 'Failed to create order.',
    };
  }

  const order = result.order;

  // Supabase sync if configured
  if (isSupabaseConfigured) {
    const supabase = getSupabaseServer();
    if (supabase) {
      try {
        await supabase.from('orders').insert({
          id: order.id,
          invoice_number: order.invoiceNumber,
          brand_id: order.brandId,
          customer_name: order.customerName,
          customer_phone: order.customerPhone,
          customer_email: order.customerEmail,
          delivery_method: order.deliveryMethod,
          customer_note: order.customerNote || null,
          subtotal: order.subtotal,
          savings: order.savings,
          total_amount: order.totalAmount,
          status: 'PENDING',
          created_at: order.createdAt,
        });

        if (order.items && order.items.length > 0) {
          const itemsPayload = order.items.map((oi) => ({
            id: oi.id,
            order_id: order.id,
            catalog_item_id: oi.catalogItemId,
            product_name: oi.productName,
            quantity: oi.quantity,
            unit_type: oi.unitType,
            unit_value: oi.unitValue,
            unit_price: oi.unitPrice,
            line_total: oi.lineTotal,
            created_at: oi.createdAt,
          }));
          await supabase.from('order_items').insert(itemsPayload);
        }
      } catch (dbErr) {
        console.warn('[Supabase Orders Sync] In-memory active, PostgreSQL sync warning:', dbErr);
      }
    }
  }

  // Generate WhatsApp message with invoice number and customer details
  const whatsAppUrl = generateOrderWhatsAppUrl(brand, order);

  return {
    success: true,
    orderId: order.id,
    invoiceNumber: order.invoiceNumber,
    whatsAppUrl,
    subtotal: order.subtotal,
    savings: order.savings,
    totalAmount: order.totalAmount,
  };
}

/**
 * Admin Confirm Order Action:
 * 1. Requires Admin Authentication
 * 2. Atomically validates stock for ALL items (fails if any item lacks stock)
 * 3. Atomically deducts stock and sets status = 'CONFIRMED'
 * 4. Dispatches branded HTML confirmation email via SMTP
 * 5. CRITICAL: Email failure does NOT rollback the confirmation or stock deduction
 */
export async function confirmAdminOrderAction(orderId: string) {
  await requireAdminAuth();

  if (!orderId || typeof orderId !== 'string') {
    return { success: false, error: 'Valid order ID required.' };
  }

  // 1. Atomic stock confirmation pre-check & deduction
  const confirmResult = dataRepository.confirmOrderAndDeductStock(orderId);
  if (!confirmResult.success || !confirmResult.order) {
    return {
      success: false,
      error: confirmResult.error || 'Failed to confirm order.',
    };
  }

  const confirmedOrder = confirmResult.order;

  // Mirror update to Supabase if configured
  if (isSupabaseConfigured) {
    const supabase = getSupabaseServer();
    if (supabase) {
      try {
        await supabase
          .from('orders')
          .update({
            status: 'CONFIRMED',
            confirmed_at: confirmedOrder.confirmedAt,
          })
          .eq('id', orderId);

        // Update stocks in Supabase
        for (const item of confirmedOrder.items || []) {
          const catalogItem = dataRepository.getItemById(item.catalogItemId);
          if (catalogItem && catalogItem.stockQuantity !== null) {
            await supabase
              .from('catalog_items')
              .update({ stock_quantity: catalogItem.stockQuantity })
              .eq('id', item.catalogItemId);
          }
        }
      } catch (dbErr) {
        console.warn('[Supabase Sync Warning]', dbErr);
      }
    }
  }

  // 2. Send branded confirmation email
  let emailSent = false;
  let emailError: string | null = null;

  try {
    const emailRes = await sendOrderConfirmationEmail(confirmedOrder);
    if (emailRes.success) {
      emailSent = true;
      dataRepository.updateOrderEmailStatus(orderId, {
        sentAt: new Date().toISOString(),
        error: null,
      });
    } else {
      emailError = emailRes.error || 'Failed to dispatch email';
      dataRepository.updateOrderEmailStatus(orderId, {
        error: emailError,
      });
    }
  } catch (err: unknown) {
    emailError = err instanceof Error ? err.message : String(err);
    dataRepository.updateOrderEmailStatus(orderId, {
      error: emailError,
    });
  }

  // Revalidate admin views
  revalidatePath('/admin/orders');
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/inventory');
  revalidatePath(`/${confirmedOrder.brandId}`);

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
 * 2. Transitions PENDING -> CANCELLED
 * 3. Stock is UNTOUCHED
 */
export async function cancelAdminOrderAction(orderId: string) {
  await requireAdminAuth();

  if (!orderId || typeof orderId !== 'string') {
    return { success: false, error: 'Valid order ID required.' };
  }

  const cancelResult = dataRepository.cancelOrder(orderId);
  if (!cancelResult.success || !cancelResult.order) {
    return {
      success: false,
      error: cancelResult.error || 'Failed to cancel order.',
    };
  }

  const cancelledOrder = cancelResult.order;

  // Supabase sync if configured
  if (isSupabaseConfigured) {
    const supabase = getSupabaseServer();
    if (supabase) {
      try {
        await supabase
          .from('orders')
          .update({
            status: 'CANCELLED',
            cancelled_at: cancelledOrder.cancelledAt,
          })
          .eq('id', orderId);
      } catch (dbErr) {
        console.warn('[Supabase Sync Warning]', dbErr);
      }
    }
  }

  revalidatePath('/admin/orders');
  revalidatePath('/admin/dashboard');

  return {
    success: true,
    order: cancelledOrder,
    message: `Order ${cancelledOrder.invoiceNumber} has been safely cancelled. Stock remained untouched.`,
  };
}

/**
 * Admin Fetch Orders Action:
 * 1. Requires Admin Authentication
 * 2. Supports Brand, Status, and Search filtering
 * 3. Returns Order KPIs (total, pending, confirmed, cancelled, confirmed revenue)
 */
export async function getAdminOrdersAction(options?: {
  brandId?: string;
  status?: OrderStatus;
  search?: string;
}) {
  await requireAdminAuth();

  const orders = dataRepository.getOrders(options);
  const kpis = dataRepository.getOrderKPIs();

  return {
    success: true,
    orders,
    kpis,
  };
}

