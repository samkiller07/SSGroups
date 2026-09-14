export type BrandId = 'aquarium' | 'kirubai' | 'vision-360' | string;

export type ItemType = 'PRODUCT' | 'SERVICE';

export type UnitType =
  | 'piece'
  | 'pair'
  | 'set'
  | 'box'
  | 'pack'
  | 'kg'
  | 'g'
  | 'litre'
  | 'ml'
  | 'metre'
  | 'roll'
  | 'bottle'
  | 'packet'
  | 'plate'
  | 'portion'
  | 'service';

export interface BrandConfig {
  id: BrandId;
  name: string;
  tagline: string;
  description: string;
  sinceYear?: number;
  logoUrl?: string;
  phonePrimary: string;
  phoneSecondary?: string;
  whatsappNumber: string;
  whatsappChannelUrl?: string;
  instagramUrl?: string;
  googleMapsUrl?: string;
  plusCode?: string;
  address: string;
  city: string;
  openingTime: string;
  closingTime: string;
  holiday: string;
  deliveryNote: string;
  freeDeliveryRadiusKm: number;
  theme: {
    primaryColor: string;
    accentColor: string;
    darkBg: string;
    surfaceBg: string;
    borderColor: string;
    textColor: string;
    subtleBadge: string;
    buttonGradient: string;
    navStyle: 'aquatic' | 'culinary' | 'security';
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
  };
}

export interface Category {
  id: string;
  brandId: BrandId;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  itemCount?: number;
}

export interface ProductImage {
  id: string;
  catalogItemId: string;
  imageUrl: string;
  altText: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface CatalogItem {
  id: string;
  brandId: BrandId;
  categoryId?: string;
  categoryName?: string;
  name: string;
  slug: string;
  itemType: ItemType;
  shortDescription?: string;
  description: string;
  originalPrice?: number;
  offerPrice?: number;
  unitType: UnitType;
  unitValue: number;
  stockQuantity: number | null; // null for services or untracked
  isAvailable: boolean;
  isFeatured: boolean;
  isHeroOffer: boolean;
  promotionalBadge?: string;
  specifications?: Record<string, string>;
  images: ProductImage[];
  isActive: boolean;
  isClientVerified: boolean; // Flag to indicate if real-world data is client confirmed
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  item: CatalogItem;
  quantity: number;
}

export interface BrandCartState {
  items: CartItem[];
  addItem: (item: CatalogItem, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getOriginalTotal: () => number;
  getSavings: () => number;
  getItemCount: () => number;
}

export type DeliveryMethod = 'PICKUP' | 'DELIVERY';

export interface CheckoutPayload {
  brand: BrandConfig;
  items: CartItem[];
  deliveryMethod: DeliveryMethod;
  customerNote?: string;
}

export type StatusType =
  | 'DAILY_UPDATE'
  | 'SPECIAL_OFFER'
  | 'NEW_ARRIVAL'
  | 'TODAYS_SPECIAL'
  | 'ANNOUNCEMENT'
  | 'SERVICE_UPDATE'
  | 'HOLIDAY'
  | 'DELIVERY_UPDATE';

export interface DailyStatus {
  id: string;
  brandId: BrandId;
  title: string;
  shortMessage: string;
  detailedMessage?: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaDestination?: string;
  publishDate: string; // YYYY-MM-DD
  expiryDate?: string; // YYYY-MM-DD
  isActive: boolean;
  priority: number;
  statusType: StatusType;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  email: string;
  role: 'admin';
  iat: number;
  exp: number;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  orderId: string;
  catalogItemId: string;
  productName: string;
  quantity: number;
  unitType: UnitType | string;
  unitValue: number;
  unitPrice: number;
  lineTotal: number;
  originalPrice?: number;
  savings?: number;
  createdAt?: string;
}

export interface Order {
  id: string;
  invoiceNumber: string;
  brandId: BrandId;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  deliveryLandmark?: string;
  deliveryCity?: string;
  deliveryPincode?: string;
  deliveryNote?: string;
  customerNote?: string;
  subtotal: number; // MRP / Original subtotal
  savings: number;  // Savings from MRP (subtotal - totalAmount)
  totalAmount: number; // Products total before delivery
  deliveryCharge?: number | null; // Admin-defined delivery fee (0 for PICKUP, null for pending DELIVERY)
  finalTotal?: number; // Confirmed final payable total (totalAmount + deliveryCharge)
  deliveryChargeSetBy?: string;
  deliveryChargeUpdatedAt?: string;
  status: OrderStatus;
  confirmationEmailSentAt?: string | null;
  confirmationEmailError?: string | null;
  createdAt: string;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
  items?: OrderItem[];
}

export interface CustomerCheckoutInput {
  brandId: BrandId;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryMethod: DeliveryMethod;
  houseNo?: string;
  streetArea?: string;
  landmark?: string;
  city?: string;
  pincode?: string;
  deliveryNote?: string;
  customerNote?: string;
  items: {
    catalogItemId: string;
    quantity: number;
  }[];
}


