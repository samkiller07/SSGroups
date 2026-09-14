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
  message += `*Fulfillment Preference:* ${deliveryMethod === 'DELIVERY' || (deliveryMethod as string) === 'HOME_DELIVERY' ? 'Doorstep Delivery' : 'Shop Pickup'}\n`;
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

  const isDelivery = order.deliveryMethod === 'DELIVERY' || (order.deliveryMethod as string) === 'HOME_DELIVERY';
  const isConfirmed = order.status === 'CONFIRMED';

  let message = `*Order Request — ${order.invoiceNumber}*\n\n`;
  if (isConfirmed) {
    message = `*Order Confirmed — ${order.invoiceNumber}*\n\n`;
  }
  message += `*Brand:* ${brand.name}\n\n`;
  message += `--------------------------------\n\n`;
  message += `*Customer:* ${order.customerName}\n`;
  message += `*Phone:* ${order.customerPhone}\n`;
  message += `*Email:* ${order.customerEmail}\n`;
  message += `*Delivery:* ${isDelivery ? 'Doorstep Delivery' : 'Shop Pickup'}\n`;

  if (isDelivery && order.deliveryAddress) {
    message += `\n*Delivery Address:*\n`;
    message += `${order.deliveryAddress}\n`;
    if (order.deliveryLandmark) {
      message += `${order.deliveryLandmark}\n`;
    }
    if (order.deliveryCity) {
      message += `${order.deliveryCity}\n`;
    }
    if (order.deliveryPincode) {
      message += `${order.deliveryPincode}\n`;
    }
  }

  const note = order.deliveryNote || order.customerNote;
  if (note && note.trim().length > 0) {
    message += `\n*Delivery Note:* ${note.trim()}\n`;
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
  message += `*Products Total:* ₹${Number(order.totalAmount).toLocaleString('en-IN')}\n`;

  if (isDelivery) {
    if (isConfirmed || (order.deliveryCharge !== null && order.deliveryCharge !== undefined)) {
      message += `*Delivery Charge:* ₹${Number(order.deliveryCharge || 0).toLocaleString('en-IN')}\n`;
      message += `*Grand Total:* ₹${Number(order.finalTotal || order.totalAmount + (order.deliveryCharge || 0)).toLocaleString('en-IN')}\n\n`;
    } else {
      message += `*Delivery Charge:* PENDING VERIFICATION\n`;
      message += `*Final Amount:* TO BE CONFIRMED\n\n`;
    }
  } else {
    message += `*Delivery Charge:* ₹0\n`;
    message += `*Total Amount:* ₹${Number(order.totalAmount).toLocaleString('en-IN')}\n\n`;
  }

  if (isConfirmed) {
    message += `*Status:* CONFIRMED\n\n`;
    message += `--------------------------------\n\n`;
    message += `Thank you for ordering with ${brand.name}!`;
  } else {
    message += `*Status:* PENDING VERIFICATION\n\n`;
    message += `--------------------------------\n\n`;
    if (isDelivery) {
      message += `Please confirm order availability and delivery charges.\nThank you!`;
    } else {
      message += `Please confirm order availability and dispatch schedule.\nThank you!`;
    }
  }

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
