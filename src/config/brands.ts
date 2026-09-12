import { BrandConfig, Category, CatalogItem } from '@/types';
import { DEFAULT_BRAND_LOGOS } from './brand-logos';

export const BRANDS: Record<string, BrandConfig> = {
  aquarium: {
    id: 'aquarium',
    name: 'SS Aquarium',
    tagline: 'Coimbatore’s Trusted Aquatic Haven Since 2018',
    description: 'Specializing in healthy exotic ornamental fishes, live aquatic plants, custom tank fabrication, advanced filtration systems, and professional door-step aquarium maintenance.',
    sinceYear: 2018,
    logoUrl: DEFAULT_BRAND_LOGOS.aquarium,
    phonePrimary: '9976473565',
    phoneSecondary: '9791719662',
    whatsappNumber: '9791719662',
    whatsappChannelUrl: 'https://whatsapp.com/channel/0029VbEI0Iv4CrfpWYx3TL2L',
    instagramUrl: 'https://www.instagram.com/ss_aquarium_madhukkarai/',
    googleMapsUrl: 'https://g.co/kgs/eaJQeZ',
    plusCode: 'WXFM+RCG Coimbatore, Tamil Nadu',
    address: 'Madhukkarai Main Road, WXFM+RCG, Coimbatore, Tamil Nadu 641105',
    city: 'Coimbatore',
    openingTime: '10:00 AM',
    closingTime: '10:00 PM',
    holiday: 'Sunday',
    deliveryNote: 'Doorstep live fish & accessories delivery available across Coimbatore. Free delivery within ~2 km radius.',
    freeDeliveryRadiusKm: 2,
    theme: {
      primaryColor: '#06B6D4',
      accentColor: '#14B8A6',
      darkBg: '#030B17',
      surfaceBg: '#081C33',
      borderColor: '#153E6B',
      textColor: '#F1F5F9',
      subtleBadge: 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60',
      buttonGradient: 'bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-semibold shadow-lg shadow-cyan-950/40',
      navStyle: 'aquatic'
    },
    seo: {
      title: 'SS Aquarium Coimbatore | Exotic Fishes, Tanks & Maintenance Since 2018',
      description: 'Visit SS Aquarium Madhukkarai Coimbatore for live ornamental fishes, aquascaping plants, filters, and professional tank setup and maintenance services.',
      keywords: ['SS Aquarium Coimbatore', 'Aquarium shop Madhukkarai', 'Fish delivery Coimbatore', 'Aquarium maintenance', 'Live ornamental fishes']
    }
  },
  kirubai: {
    id: 'kirubai',
    name: 'Kirubai Cloud Kitchen',
    tagline: 'Freshly Prepared Homestyle Culinary Delights',
    description: 'Delicious, hygienic, and authentic meals prepared fresh to order using hand-ground spices and premium ingredients. Fast doorstep dispatch for your family and celebrations.',
    sinceYear: 2022,
    logoUrl: DEFAULT_BRAND_LOGOS.kirubai,
    phonePrimary: '9791719662',
    phoneSecondary: '9976473565',
    whatsappNumber: '9791719662',
    instagramUrl: 'https://instagram.com',
    googleMapsUrl: 'https://maps.google.com/?q=Coimbatore',
    address: 'Madhukkarai Road, Coimbatore, Tamil Nadu 641105',
    city: 'Coimbatore',
    openingTime: '11:30 AM',
    closingTime: '10:30 PM',
    holiday: 'Open Daily (Fresh Batches)',
    deliveryNote: 'Hot & fresh meal delivery across Coimbatore. Free doorstep delivery within ~2 km radius for orders above ₹200.',
    freeDeliveryRadiusKm: 2,
    theme: {
      primaryColor: '#F97316',
      accentColor: '#F59E0B',
      darkBg: '#0F172A',
      surfaceBg: '#1E293B',
      borderColor: '#334155',
      textColor: '#F8FAFC',
      subtleBadge: 'bg-orange-950/80 text-orange-300 border border-orange-800/60',
      buttonGradient: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-semibold shadow-lg shadow-orange-950/40',
      navStyle: 'culinary'
    },
    seo: {
      title: 'Kirubai Cloud Kitchen Coimbatore | Fresh Biryani, Meals & Fast Delivery',
      description: 'Order authentic and freshly prepared meals, biryanis, and traditional gravies from Kirubai Cloud Kitchen in Coimbatore with quick WhatsApp checkout.',
      keywords: ['Kirubai Cloud Kitchen', 'Food delivery Coimbatore', 'Authentic Biryani Coimbatore', 'Cloud Kitchen Madhukkarai', 'Home style meals']
    }
  },
  'vision-360': {
    id: 'vision-360',
    name: 'SS Vision 360',
    tagline: 'Precision Security, Smart Surveillance & Technician Services',
    description: 'Expert CCTV installation, 4K night vision surveillance cameras, fault troubleshooting, rewiring, and annual maintenance contracts for homes, commercial stores, and factories in Coimbatore.',
    sinceYear: 2020,
    logoUrl: DEFAULT_BRAND_LOGOS['vision-360'],
    phonePrimary: '9791719662',
    phoneSecondary: '9976473565',
    whatsappNumber: '9791719662',
    googleMapsUrl: 'https://maps.google.com/?q=Coimbatore',
    address: 'Coimbatore South & Madhukkarai Zone, Coimbatore, Tamil Nadu 641105',
    city: 'Coimbatore',
    openingTime: '09:00 AM',
    closingTime: '08:30 PM',
    holiday: 'Sunday On-Call',
    deliveryNote: 'Technician site visits & security hardware delivery available across Coimbatore.',
    freeDeliveryRadiusKm: 2,
    theme: {
      primaryColor: '#2563EB',
      accentColor: '#38BDF8',
      darkBg: '#090D16',
      surfaceBg: '#111827',
      borderColor: '#1F2937',
      textColor: '#F3F4F6',
      subtleBadge: 'bg-blue-950/80 text-blue-300 border border-blue-800/60',
      buttonGradient: 'bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-semibold shadow-lg shadow-blue-950/40',
      navStyle: 'security'
    },
    seo: {
      title: 'SS Vision 360 | CCTV Camera Installation & Technician Repair Coimbatore',
      description: 'Professional CCTV security camera sales, DVR configuration, technician repairs, and doorstep installation services in Coimbatore by SS Vision 360.',
      keywords: ['SS Vision 360', 'CCTV installation Coimbatore', 'CCTV technician Coimbatore', 'Security camera service Madhukkarai', 'DVR repair']
    }
  }
};

export const INITIAL_CATEGORIES: Category[] = [
  // SS Aquarium
  { id: 'cat-aq-1', brandId: 'aquarium', name: 'Live Ornamental Fish', slug: 'live-fish', description: 'Healthy, active freshwater and planted tank varieties', sortOrder: 1, isActive: true },
  { id: 'cat-aq-2', brandId: 'aquarium', name: 'Planted Aquarium Plants', slug: 'aquatic-plants', description: 'Nutrient-rich oxygenating live aquarium plants', sortOrder: 2, isActive: true },
  { id: 'cat-aq-3', brandId: 'aquarium', name: 'Filters & Aeration', slug: 'filters-accessories', description: 'Submersible, top, and hang-on biological filters', sortOrder: 3, isActive: true },
  { id: 'cat-aq-4', brandId: 'aquarium', name: 'Fish Food & Nutrition', slug: 'fish-food', description: 'Growth, color enhancing and immune booster formulas', sortOrder: 4, isActive: true },
  { id: 'cat-aq-5', brandId: 'aquarium', name: 'Aquarium Services', slug: 'aquarium-services', description: 'Professional custom setup and monthly maintenance visits', sortOrder: 5, isActive: true },

  // Kirubai Kitchen
  { id: 'cat-kb-1', brandId: 'kirubai', name: 'Chef Special Biryanis', slug: 'biryani-combos', description: 'Seeraga samba & basmati aromatic dum biryani specials', sortOrder: 1, isActive: true },
  { id: 'cat-kb-2', brandId: 'kirubai', name: 'Starters & Crispy Bites', slug: 'starters-bites', description: 'Hot pepper chicken, crispy nuggets & spicy paneer 65', sortOrder: 2, isActive: true },
  { id: 'cat-kb-3', brandId: 'kirubai', name: 'Authentic Gravies & Curries', slug: 'gravies-curries', description: 'Rich village style curries paired with parottas & chapatis', sortOrder: 3, isActive: true },
  { id: 'cat-kb-4', brandId: 'kirubai', name: 'Coolers & Desserts', slug: 'coolers-desserts', description: 'Chilled mint coolers and homemade sweet treats', sortOrder: 4, isActive: true },

  // SS Vision 360
  { id: 'cat-v3-1', brandId: 'vision-360', name: 'Smart CCTV Cameras', slug: 'smart-cameras', description: '5MP HD, Full Color Night Vision, Audio Bullet & Dome cameras', sortOrder: 1, isActive: true },
  { id: 'cat-v3-2', brandId: 'vision-360', name: 'DVR / NVR & Hard Drives', slug: 'dvr-storage', description: 'High compression surveillance storage & multi-channel recorders', sortOrder: 2, isActive: true },
  { id: 'cat-v3-3', brandId: 'vision-360', name: 'Cables, PoE & Power', slug: 'cables-accessories', description: 'Pure copper Cat6 cables, power supplies and connectors', sortOrder: 3, isActive: true },
  { id: 'cat-v3-4', brandId: 'vision-360', name: 'Installation & Repair Services', slug: 'technician-services', description: 'On-site technician wiring, camera fixing and annual maintenance', sortOrder: 4, isActive: true },
];

// Production catalog items are managed exclusively in Supabase PostgreSQL
export const INITIAL_CATALOG_ITEMS: CatalogItem[] = [];
