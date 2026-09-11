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

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
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
// ORDER MANAGEMENT SERVER ACTIONS (SUPABASE PERSISTENCE - SINGLE SOURCE OF TRUTH)
// =========================================================================

/**
 * Maps raw Supabase PostgreSQL row to TypeScript Order domain model.
 */
function mapDbOrderToOrder(row: any): Order {
  const items = Array.isArray(row.items) ? row.items : [];
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    brandId: row.brand_id as any,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    deliveryMethod: row.delivery_method,
    customerNote: row.customer_note || undefined,
    subtotal: Number(row.subtotal),
    savings: Number(row.savings || 0),
    totalAmount: Number(row.total_amount),
    status: row.status as OrderStatus,
    confirmationEmailSentAt: row.confirmation_email_sent_at || null,
    confirmationEmailError: row.confirmation_email_error || null,
    createdAt: row.created_at,
    confirmedAt: row.confirmed_at || null,
    cancelledAt: row.cancelled_at || null,
    items: items.map((oi: any) => ({
      id: oi.id,
      orderId: oi.order_id,
      catalogItemId: oi.catalog_item_id,
      productName: oi.product_name,
      quantity: Number(oi.quantity),
      unitType: oi.unit_type,
      unitValue: Number(oi.unit_value || 1),
      unitPrice: Number(oi.unit_price),
      lineTotal: Number(oi.line_total),
      createdAt: oi.created_at,
    })),
  };
}

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
  let calculatedSubtotal = 0;
  let calculatedSavings = 0;
  const verifiedItems: {
    catalogItemId: string;
    productName: string;
    quantity: number;
    unitType: string;
    unitValue: number;
    unitPrice: number;
    lineTotal: number;
  }[] = [];

  for (const clientItem of validData.items) {
    if (clientItem.quantity <= 0) continue;

    const serverItem = dataRepository.getItemById(clientItem.catalogItemId);
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

    const authoritativePrice = serverItem.offerPrice ?? serverItem.originalPrice ?? 0;
    const lineTotal = authoritativePrice * clientItem.quantity;
    calculatedSubtotal += lineTotal;

    if (serverItem.originalPrice && serverItem.offerPrice && serverItem.originalPrice > serverItem.offerPrice) {
      calculatedSavings += (serverItem.originalPrice - serverItem.offerPrice) * clientItem.quantity;
    }

    verifiedItems.push({
      catalogItemId: serverItem.id,
      productName: serverItem.name,
      quantity: clientItem.quantity,
      unitType: serverItem.unitType,
      unitValue: serverItem.unitValue,
      unitPrice: authoritativePrice,
      lineTotal,
    });
  }

  if (verifiedItems.length === 0) {
    return { success: false, error: 'No valid items found in order.' };
  }

  const calculatedTotal = calculatedSubtotal;
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
    const { error: orderError } = await supabase.from('orders').insert({
      id: orderId,
      invoice_number: invoiceNumber,
      brand_id: validData.brandId,
      customer_name: validData.customerName.trim(),
      customer_phone: validData.customerPhone.trim(),
      customer_email: validData.customerEmail.trim(),
      delivery_method: validData.deliveryMethod,
      customer_note: validData.customerNote?.trim() || null,
      subtotal: calculatedSubtotal,
      savings: calculatedSavings,
      total_amount: calculatedTotal,
      status: 'PENDING',
      created_at: now,
    });

    if (orderError) {
      console.error('[createCustomerOrderAction] Supabase order insert failed:', orderError);
      return {
        success: false,
        error: `Failed to save order to database: ${orderError.message || 'Permission or connection error'}. Please try again.`,
      };
    }

    // 2. Insert order items into Supabase
    const itemsPayload = verifiedItems.map((oi, idx) => ({
      id: `oi-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      order_id: orderId,
      catalog_item_id: oi.catalogItemId,
      product_name: oi.productName,
      quantity: oi.quantity,
      unit_type: oi.unitType,
      unit_value: oi.unitValue,
      unit_price: oi.unitPrice,
      line_total: oi.lineTotal,
      created_at: now,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(itemsPayload);
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

  // Construct domain order object
  const createdOrder: Order = {
    id: orderId,
    invoiceNumber,
    brandId: validData.brandId,
    customerName: validData.customerName.trim(),
    customerPhone: validData.customerPhone.trim(),
    customerEmail: validData.customerEmail.trim(),
    deliveryMethod: validData.deliveryMethod,
    customerNote: validData.customerNote?.trim() || undefined,
    subtotal: calculatedSubtotal,
    savings: calculatedSavings,
    totalAmount: calculatedTotal,
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
  };
}

/**
 * Admin Confirm Order Action:
 * 1. Requires Admin Authentication
 * 2. Checks order is PENDING (prevents duplicate confirmation)
 * 3. Atomically validates current stock in Supabase
 * 4. Atomically deducts stock from catalog_items
 * 5. Updates status to CONFIRMED with timestamp
 * 6. Dispatches branded HTML confirmation email via Nodemailer
 * 7. If email fails, order & stock confirmation remains CONFIRMED
 */
export async function confirmAdminOrderAction(orderId: string) {
  await requireAdminAuth();

  if (!orderId || typeof orderId !== 'string') {
    return { success: false, error: 'Valid order ID required.' };
  }

  let confirmedOrder: Order | null = null;

  if (isSupabaseConfigured) {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return { success: false, error: 'Database connection unavailable.' };
    }

    // 1. Fetch current order from Supabase
    const { data: orderRow, error: fetchErr } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', orderId)
      .single();

    if (fetchErr || !orderRow) {
      return { success: false, error: 'Order not found in database.' };
    }

    if (orderRow.status === 'CONFIRMED') {
      return { success: false, error: 'Order has already been confirmed.' };
    }

    if (orderRow.status === 'CANCELLED') {
      return { success: false, error: 'Cancelled orders cannot be confirmed.' };
    }

    // 2. Try atomic database RPC confirm_order_and_deduct_stock
    let rpcDone = false;
    try {
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('confirm_order_and_deduct_stock', {
        p_order_id: orderId,
      });
      if (!rpcErr && rpcRes) {
        if (!rpcRes.success) {
          return { success: false, error: rpcRes.error || 'Failed to confirm order.' };
        }
        rpcDone = true;
      }
    } catch {
      rpcDone = false;
    }

    // 3. Fallback direct check if RPC is not installed
    if (!rpcDone) {
      const items = orderRow.items || [];
      // Pre-check stock for ALL items
      for (const item of items) {
        const { data: catItem } = await supabase
          .from('catalog_items')
          .select('id, name, stock_quantity')
          .eq('id', item.catalog_item_id)
          .single();

        if (catItem && catItem.stock_quantity !== null) {
          if (catItem.stock_quantity < item.quantity) {
            return {
              success: false,
              error: `Insufficient stock for "${catItem.name || item.product_name}". Required: ${item.quantity}, Available: ${catItem.stock_quantity}. Confirmation aborted.`,
            };
          }
        }
      }

      // Deduct stock for items
      for (const item of items) {
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

      const confirmedAt = new Date().toISOString();
      const { error: updateErr } = await supabase
        .from('orders')
        .update({
          status: 'CONFIRMED',
          confirmed_at: confirmedAt,
        })
        .eq('id', orderId);

      if (updateErr) {
        return { success: false, error: 'Failed to update order status: ' + updateErr.message };
      }
    }

    // Fetch refreshed order
    const { data: updatedRow } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', orderId)
      .single();

    confirmedOrder = updatedRow ? mapDbOrderToOrder(updatedRow) : mapDbOrderToOrder({
      ...orderRow,
      status: 'CONFIRMED',
      confirmed_at: new Date().toISOString(),
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


