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
