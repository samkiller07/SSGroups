import { z } from 'zod';

export const unitTypeSchema = z.enum([
  'piece',
  'pair',
  'set',
  'box',
  'pack',
  'kg',
  'g',
  'litre',
  'ml',
  'metre',
  'roll',
  'bottle',
  'packet',
  'plate',
  'portion',
  'service',
]);

export const catalogItemSchema = z
  .object({
    id: z.string().optional(),
    brandId: z.enum(['aquarium', 'kirubai', 'vision-360']),
    categoryId: z.string().optional(),
    name: z.string().min(2, 'Name must be at least 2 characters').max(120),
    slug: z
      .string()
      .min(2)
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
    itemType: z.enum(['PRODUCT', 'SERVICE']),
    shortDescription: z.string().max(300).optional(),
    description: z.string().min(10, 'Full description must be at least 10 characters'),
    originalPrice: z.number().min(0, 'Price cannot be negative').max(1000000).optional().nullable(),
    offerPrice: z.number().min(0, 'Offer price cannot be negative').max(1000000).optional().nullable(),
    unitType: unitTypeSchema.default('piece'),
    unitValue: z.number().min(1, 'Unit value must be at least 1').default(1),
    stockQuantity: z.number().min(0, 'Stock cannot be negative').nullable().optional(),
    promotionalBadge: z.string().max(50).optional().nullable(),
    isAvailable: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    isHeroOffer: z.boolean().default(false),
    images: z
      .array(
        z.object({
          id: z.string().optional(),
          imageUrl: z.string().url('Image URL must be a valid URL or path'),
          altText: z.string().max(200).optional().default(''),
          sortOrder: z.number().default(1),
          isPrimary: z.boolean().default(false),
        })
      )
      .min(1, 'At least one image is required'),
  })
  .refine(
    (data) => {
      if (
        data.originalPrice !== undefined &&
        data.originalPrice !== null &&
        data.offerPrice !== undefined &&
        data.offerPrice !== null
      ) {
        return data.offerPrice <= data.originalPrice;
      }
      return true;
    },
    {
      message: 'Offer price cannot be greater than original price',
      path: ['offerPrice'],
    }
  );

export const categorySchema = z.object({
  id: z.string().optional(),
  brandId: z.enum(['aquarium', 'kirubai', 'vision-360']),
  name: z.string().min(2, 'Category name must be at least 2 characters').max(80),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().max(300).optional(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const brandSettingsSchema = z.object({
  logoUrl: z.string().optional().nullable(),
  tagline: z.string().min(5).max(200),
  description: z.string().min(10),
  phonePrimary: z.string().regex(/^[0-9]{10,12}$/, 'Valid phone number required'),
  phoneSecondary: z.string().optional().nullable(),
  whatsappNumber: z.string().regex(/^[0-9]{10,12}$/, 'Valid WhatsApp number required'),
  openingTime: z.string().min(2),
  closingTime: z.string().min(2),
  holiday: z.string().min(2),
  address: z.string().min(5),
  plusCode: z.string().optional().nullable(),
  freeDeliveryRadiusKm: z.number().min(0).max(100),
  deliveryNote: z.string().min(5),
});

export const statusTypeSchema = z.enum([
  'DAILY_UPDATE',
  'SPECIAL_OFFER',
  'NEW_ARRIVAL',
  'TODAYS_SPECIAL',
  'ANNOUNCEMENT',
  'SERVICE_UPDATE',
  'HOLIDAY',
  'DELIVERY_UPDATE',
]);

export const dailyStatusSchema = z.object({
  id: z.string().optional(),
  brandId: z.enum(['aquarium', 'kirubai', 'vision-360']),
  title: z.string().min(2, 'Title must be at least 2 characters').max(100),
  shortMessage: z.string().min(5, 'Short message must be at least 5 characters').max(300),
  detailedMessage: z.string().max(1000).optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  ctaLabel: z.string().max(40).optional().nullable(),
  ctaDestination: z.string().max(200).optional().nullable(),
  publishDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid YYYY-MM-DD date required'),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid YYYY-MM-DD date required').optional().nullable(),
  isActive: z.boolean().default(true),
  priority: z.number().int().min(0).max(100).default(1),
  statusType: statusTypeSchema.default('DAILY_UPDATE'),
});

export const adminLoginSchema = z.object({
  email: z.string().email('Valid admin email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const customerCheckoutSchema = z.object({
  brandId: z.enum(['aquarium', 'kirubai', 'vision-360']),
  customerName: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Name is too long'),
  customerPhone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(16, 'Phone number is too long')
    .regex(/^\+?[0-9\s-]{10,16}$/, 'Enter a valid phone number (e.g. +91 97917 19662)'),
  customerEmail: z.string().email('Enter a valid email address for confirmation and invoice delivery'),
  deliveryMethod: z.enum(['PICKUP', 'HOME_DELIVERY']),
  customerNote: z.string().max(500, 'Customer note must be under 500 characters').optional().nullable(),
  items: z
    .array(
      z.object({
        catalogItemId: z.string().min(1, 'Item ID required'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
      })
    )
    .min(1, 'Your cart is empty. Please add items before checkout.'),
});


