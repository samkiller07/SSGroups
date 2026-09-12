import { CatalogItem, ProductImage, Order, OrderItem, BrandId, ItemType, UnitType, OrderStatus } from '@/types';

export function mapDbCatalogItemToItem(row: any): CatalogItem {
  const rawImages = Array.isArray(row.images) ? row.images : [];
  const images: ProductImage[] = rawImages.map((img: any, idx: number) => ({
    id: img.id || `img-${row.id}-${idx}`,
    catalogItemId: row.id,
    imageUrl: img.image_url,
    altText: img.alt_text || row.name,
    sortOrder: Number(img.sort_order || idx + 1),
    isPrimary: Boolean(img.is_primary),
  }));

  return {
    id: row.id,
    brandId: row.brand_id as BrandId,
    categoryId: row.category_id || undefined,
    categoryName: row.category?.name || undefined,
    name: row.name,
    slug: row.slug,
    itemType: row.item_type as ItemType,
    shortDescription: row.short_description || undefined,
    description: row.description,
    originalPrice: row.original_price !== null && row.original_price !== undefined ? Number(row.original_price) : undefined,
    offerPrice: row.offer_price !== null && row.offer_price !== undefined ? Number(row.offer_price) : undefined,
    unitType: row.unit_type as UnitType,
    unitValue: Number(row.unit_value || 1),
    stockQuantity: row.stock_quantity !== null && row.stock_quantity !== undefined ? Number(row.stock_quantity) : null,
    isAvailable: Boolean(row.is_available),
    isFeatured: Boolean(row.is_featured),
    isHeroOffer: Boolean(row.is_hero_offer),
    isClientVerified: Boolean(row.is_client_verified),
    promotionalBadge: row.promotional_badge || undefined,
    specifications: row.specifications || {},
    images: images.length > 0 ? images : [
      {
        id: `img-${row.id}-0`,
        catalogItemId: row.id,
        imageUrl: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=400&q=80',
        altText: row.name,
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    isActive: Boolean(row.is_active !== false),
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export function mapDbOrderToOrder(row: any): Order {
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
    items: items.map((it: any) => {
      const unitPrice = Number(it.unit_price);
      const lineTotal = Number(it.line_total);
      const qty = Number(it.quantity || 1);
      let origPrice = it.original_price !== null && it.original_price !== undefined ? Number(it.original_price) : undefined;
      let itemSavings = it.savings !== null && it.savings !== undefined ? Number(it.savings) : undefined;
      if (!origPrice && items.length === 1 && Number(row.savings) > 0) {
        origPrice = unitPrice + (Number(row.savings) / qty);
        itemSavings = Number(row.savings);
      }
      return {
        id: it.id,
        catalogItemId: it.catalog_item_id,
        productName: it.product_name,
        quantity: qty,
        unitType: it.unit_type || 'piece',
        unitValue: Number(it.unit_value || 1),
        unitPrice,
        lineTotal,
        originalPrice: origPrice,
        savings: itemSavings,
      };
    }),
  };
}
