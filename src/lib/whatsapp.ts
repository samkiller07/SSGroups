import { BrandConfig, CartItem, CatalogItem, DeliveryMethod } from '@/types';
import { formatPrice } from './utils';
import { formatPriceWithUnit } from './units';

export function generateCartWhatsAppUrl(
  brand: BrandConfig,
  items: CartItem[],
  deliveryMethod: DeliveryMethod = 'PICKUP',
  customerNote: string = ''
): string {
  const cleanPhone = brand.whatsappNumber.replace(/\D/g, '');
  const targetPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

  let message = `*Hello ${brand.name},*\n`;
  message += `I would like to place an order from your website catalog:\n\n`;

  let subtotal = 0;
  let totalSavings = 0;

  items.forEach((ci, idx) => {
    const itemPrice = ci.item.offerPrice ?? ci.item.originalPrice ?? 0;
    const itemTotal = itemPrice * ci.quantity;
    subtotal += itemTotal;

    if (ci.item.originalPrice && ci.item.offerPrice && ci.item.originalPrice > ci.item.offerPrice) {
      totalSavings += (ci.item.originalPrice - ci.item.offerPrice) * ci.quantity;
    }

    const priceUnitStr = formatPriceWithUnit(itemPrice, ci.item.unitType, ci.item.unitValue);

    message += `${idx + 1}. *${ci.item.name}*\n`;
    message += `   Quantity: ${ci.quantity} × ${priceUnitStr} = *${formatPrice(itemTotal)}*\n`;
  });

  message += `\n--------------------------------\n`;
  message += `*Total Order Value: ${formatPrice(subtotal)}*\n`;
  if (totalSavings > 0) {
    message += `*Total Savings: ${formatPrice(totalSavings)}*\n`;
  }
  message += `--------------------------------\n`;
  message += `*Fulfillment Preference:* ${deliveryMethod === 'HOME_DELIVERY' ? 'Doorstep Delivery' : 'Shop Pickup'}\n`;
  message += `*Location:* Coimbatore (~${brand.freeDeliveryRadiusKm}km coverage)\n`;

  if (customerNote && customerNote.trim().length > 0) {
    message += `*Special Instructions:* ${customerNote.trim()}\n`;
  }

  message += `\nPlease confirm order acceptance, stock readiness, and dispatch timing. Thank you!`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

export function generateOrderWhatsAppUrl(brand: BrandConfig, order: import('@/types').Order): string {
  const cleanPhone = brand.whatsappNumber.replace(/\D/g, '');
  const targetPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

  let message = `*Order Request — ${order.invoiceNumber}*\n\n`;
  message += `*Brand:* ${brand.name}\n\n`;
  message += `--------------------------------\n\n`;
  message += `*Customer:* ${order.customerName}\n`;
  message += `*Phone:* ${order.customerPhone}\n`;
  message += `*Email:* ${order.customerEmail}\n`;
  message += `*Delivery:* ${order.deliveryMethod === 'HOME_DELIVERY' ? 'Doorstep Delivery' : 'Shop Pickup'}\n`;

  if (order.customerNote) {
    message += `*Note:* ${order.customerNote}\n`;
  }

  message += `\n--------------------------------\n\n`;
  message += `*Order Items:*\n\n`;

  (order.items || []).forEach((item, idx) => {
    message += `${idx + 1}. *${item.productName}*\n`;
    message += `   Qty: ${item.quantity} × ₹${Number(item.unitPrice).toLocaleString('en-IN')} = *₹${Number(item.lineTotal).toLocaleString('en-IN')}*\n`;
    if (item.originalPrice && item.originalPrice > item.unitPrice) {
      message += `   MRP: ₹${Number(item.originalPrice).toLocaleString('en-IN')} each\n`;
      const itemSavings = (item.originalPrice - item.unitPrice) * item.quantity;
      message += `   Savings: ₹${Number(itemSavings).toLocaleString('en-IN')}\n`;
    }
    message += `\n`;
  });

  message += `--------------------------------\n\n`;
  message += `*Subtotal / MRP:* ₹${Number(order.subtotal).toLocaleString('en-IN')}\n`;
  if (order.savings > 0) {
    message += `*Savings:* -₹${Number(order.savings).toLocaleString('en-IN')}\n`;
  }
  message += `*Total Amount:* ₹${Number(order.totalAmount).toLocaleString('en-IN')}\n\n`;
  message += `*Status:* PENDING VERIFICATION\n\n`;
  message += `--------------------------------\n\n`;
  message += `Please confirm order availability and dispatch schedule.\nThank you!`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}


export function generateServiceInquiryWhatsAppUrl(
  brand: BrandConfig,
  service: CatalogItem,
  customNote: string = ''
): string {
  const cleanPhone = brand.whatsappNumber.replace(/\D/g, '');
  const targetPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

  let message = `*Hello ${brand.name},*\n`;
  message += `I am interested in scheduling a service inquiry:\n\n`;
  message += `*Service:* ${service.name}\n`;
  if (service.offerPrice || service.originalPrice) {
    const priceUnitStr = formatPriceWithUnit(
      service.offerPrice ?? service.originalPrice,
      service.unitType,
      service.unitValue
    );
    message += `*Service Estimate:* ${priceUnitStr}\n`;
  }
  message += `*Category:* ${service.categoryName || 'Professional Technician Service'}\n\n`;

  if (customNote && customNote.trim().length > 0) {
    message += `*My Requirement / Location:* ${customNote.trim()}\n\n`;
  }

  message += `Could you please share technician availability and inspection timing in Coimbatore?`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

export function generateGeneralInquiryWhatsAppUrl(brand: BrandConfig, contextMessage?: string): string {
  const cleanPhone = brand.whatsappNumber.replace(/\D/g, '');
  const targetPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

  let message = `*Hello ${brand.name},*\n`;
  if (contextMessage) {
    message += `${contextMessage}\n\n`;
  } else {
    message += `I am browsing your catalog and would like to ask a few questions regarding your products and services.\n\n`;
  }
  message += `Location: Coimbatore`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}
