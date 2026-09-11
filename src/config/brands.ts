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

export const INITIAL_CATALOG_ITEMS: CatalogItem[] = [
  // SS AQUARIUM ITEMS (Client Verified Core)
  {
    id: 'item-aq-1',
    brandId: 'aquarium',
    categoryId: 'cat-aq-1',
    categoryName: 'Live Ornamental Fish',
    name: 'Red Cap Oranda Goldfish (Pair)',
    slug: 'red-cap-oranda-goldfish-pair',
    itemType: 'PRODUCT',
    shortDescription: 'Active, high-grade pair with vibrant white body and prominent red wen crown.',
    description: 'Our Red Cap Oranda Goldfish are conditioned in filtered sweet water tanks, actively swimming and accustomed to standard pellet diets. Ideal for community tanks and serene desktop aquariums.',
    originalPrice: 380,
    offerPrice: 299,
    unitType: 'pair',
    unitValue: 1,
    stockQuantity: 8,
    isAvailable: true,
    isFeatured: true,
    isHeroOffer: true,
    promotionalBadge: 'Best Seller',
    isClientVerified: true,
    specifications: {
      'Species': 'Carassius auratus',
      'Water Temp': '20°C - 26°C',
      'Diet': 'Floating pellets / flakes',
      'Tank Size': 'Minimum 1.5 ft tank recommended'
    },
    images: [
      {
        id: 'img-aq-1-1',
        catalogItemId: 'item-aq-1',
        imageUrl: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=900&q=80',
        altText: 'Vibrant Red Cap Oranda Goldfish swimming gracefully',
        sortOrder: 1,
        isPrimary: true
      },
      {
        id: 'img-aq-1-2',
        catalogItemId: 'item-aq-1',
        imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80',
        altText: 'Aquarium Goldfish tank environment',
        sortOrder: 2,
        isPrimary: false
      }
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'item-aq-2',
    brandId: 'aquarium',
    categoryId: 'cat-aq-1',
    categoryName: 'Live Ornamental Fish',
    name: 'Royal Blue Halfmoon Betta (Fighter)',
    slug: 'royal-blue-halfmoon-betta',
    itemType: 'PRODUCT',
    shortDescription: 'Stunning 180-degree spread caudal fin with metallic electric blue shimmer.',
    description: 'Show-grade Halfmoon Male Betta with lush iridescent fins. Individually cared for with live brine shrimp and vitamin-fortified flakes. Easy to keep in bowls and nano planted cubes.',
    originalPrice: 450,
    offerPrice: 350,
    unitType: 'piece',
    unitValue: 1,
    stockQuantity: 12,
    isAvailable: true,
    isFeatured: true,
    isHeroOffer: false,
    promotionalBadge: 'Show Grade',
    isClientVerified: true,
    specifications: {
      'Species': 'Betta splendens',
      'Temperament': 'Solitary male',
      'Fin Type': '180° Halfmoon',
      'Care Level': 'Beginner Friendly'
    },
    images: [
      {
        id: 'img-aq-2-1',
        catalogItemId: 'item-aq-2',
        imageUrl: 'https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=900&q=80',
        altText: 'Royal Blue Halfmoon Betta showing spread fins',
        sortOrder: 1,
        isPrimary: true
      }
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'item-aq-3',
    brandId: 'aquarium',
    categoryId: 'cat-aq-2',
    categoryName: 'Planted Aquarium Plants',
    name: 'Anubias Nana on Driftwood Mount',
    slug: 'anubias-nana-driftwood-mount',
    itemType: 'PRODUCT',
    shortDescription: 'Hardy, slow-growing dark green foliage securely tied to natural cured root wood.',
    description: 'Requires low to medium light with zero CO2 supplementation needed. Ready to place instantly in your aquarium without burying the rhizome in gravel.',
    originalPrice: 320,
    offerPrice: 250,
    unitType: 'piece',
    unitValue: 1,
    stockQuantity: 15,
    isAvailable: true,
    isFeatured: false,
    isHeroOffer: false,
    promotionalBadge: 'Low Light Easy',
    isClientVerified: true,
    specifications: {
      'Plant Type': 'Rhizome plant',
      'Light Demand': 'Low - Medium',
      'Growth Rate': 'Slow',
      'CO2': 'Not required'
    },
    images: [
      {
        id: 'img-aq-3-1',
        catalogItemId: 'item-aq-3',
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
        altText: 'Lush live aquarium plants and aquascape',
        sortOrder: 1,
        isPrimary: true
      }
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'item-aq-4',
    brandId: 'aquarium',
    categoryId: 'cat-aq-3',
    categoryName: 'Filters & Aeration',
    name: 'Ultra-Quiet 3-in-1 Top Filter 15W',
    slug: 'ultra-quiet-3-in-1-top-filter-15w',
    itemType: 'PRODUCT',
    shortDescription: 'High-flow mechanical, chemical, and biological filtration box with rain pipe.',
    description: 'Keeps water crystal clear with oxygen spray aerator bar and quick-rinse biological filter wool compartment. Energy efficient 15W motor designed for 2 to 3 ft aquariums.',
    originalPrice: 850,
    offerPrice: 699,
    unitType: 'piece',
    unitValue: 1,
    stockQuantity: 6,
    isAvailable: true,
    isFeatured: true,
    isHeroOffer: true,
    promotionalBadge: 'Special Offer',
    isClientVerified: true,
    specifications: {
      'Power': '15 Watts',
      'Flow Rate': '880 L/H',
      'Suitable Tank': '2 to 3 Feet',
      'Features': 'Aeration + Water circulation + Filtration'
    },
    images: [
      {
        id: 'img-aq-4-1',
        catalogItemId: 'item-aq-4',
        imageUrl: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=900&q=80',
        altText: 'Clean aquarium water filtration equipment',
        sortOrder: 1,
        isPrimary: true
      }
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'item-aq-5',
    brandId: 'aquarium',
    categoryId: 'cat-aq-5',
    categoryName: 'Aquarium Services',
    name: 'Custom Glass Aquarium Fabrication & Setup',
    slug: 'custom-glass-aquarium-setup-service',
    itemType: 'SERVICE',
    shortDescription: 'Complete custom sized tank building, cabinet stand, aquascaping & plumbing.',
    description: 'Our experienced aquarium technicians measure, build, deliver, and complete the biological cycling of custom glass tanks from 2 ft up to 8 ft luxury living room installations.',
    originalPrice: 2500,
    offerPrice: 1999,
    unitType: 'service',
    unitValue: 1,
    stockQuantity: null,
    isAvailable: true,
    isFeatured: true,
    isHeroOffer: false,
    promotionalBadge: 'Popular Service',
    isClientVerified: true,
    specifications: {
      'Service Coverage': 'Coimbatore District & Suburbs',
      'Includes': 'On-site measurement, tank fabrication, soil layout, hardscape setup & initial water conditioning',
      'Warranty': 'Silicone leak warranty included'
    },
    images: [
      {
        id: 'img-aq-5-1',
        catalogItemId: 'item-aq-5',
        imageUrl: 'https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?auto=format&fit=crop&w=900&q=80',
        altText: 'Beautiful custom aquascape setup in living room',
        sortOrder: 1,
        isPrimary: true
      }
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'item-aq-6',
    brandId: 'aquarium',
    categoryId: 'cat-aq-5',
    categoryName: 'Aquarium Services',
    name: 'Monthly Tank Cleaning & Water Health Care Visit',
    slug: 'monthly-tank-cleaning-health-check',
    itemType: 'SERVICE',
    shortDescription: 'Deep gravel vacuuming, glass algae scraping, filter media wash, water testing.',
    description: 'Regular monthly doorstep technician visit to keep your fish healthy and tank spotless. Includes TDS, pH checks, 40% water refresh, anti-chlorine treatment, and plant trimming.',
    originalPrice: 800,
    offerPrice: 599,
    unitType: 'service',
    unitValue: 1,
    stockQuantity: null,
    isAvailable: true,
    isFeatured: false,
    isHeroOffer: false,
    promotionalBadge: 'Doorstep Service',
    isClientVerified: true,
    specifications: {
      'Duration': '45 - 60 Minutes',
      'Includes': 'Gravel siphon, filter overhaul, glass cleaning, water conditioner',
      'Technician': 'Trained SS Aquarium Specialist'
    },
    images: [
      {
        id: 'img-aq-6-1',
        catalogItemId: 'item-aq-6',
        imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80',
        altText: 'Aquarium maintenance and water clarity service',
        sortOrder: 1,
        isPrimary: true
      }
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // KIRUBAI CLOUD KITCHEN ITEMS (Client Verification Required for exact menu prices)
  {
    id: 'item-kb-1',
    brandId: 'kirubai',
    categoryId: 'cat-kb-1',
    categoryName: 'Chef Special Biryanis',
    name: 'Royal Seeraga Samba Chicken Dum Biryani Combo',
    slug: 'royal-seeraga-samba-chicken-biryani-combo',
    itemType: 'PRODUCT',
    shortDescription: 'Fragrant traditional Seeraga Samba rice with tender spiced chicken, boiled egg & raita.',
    description: 'Slow-cooked in authentic wood-fired handi with cold-pressed gingelly oil, fresh mint, coriander, and freshly roasted masala. Served with cooling onion raita and rich brinjal gravy (Dalcha).',
    originalPrice: 260,
    offerPrice: 219,
    unitType: 'plate',
    unitValue: 1,
    stockQuantity: 25,
    isAvailable: true,
    isFeatured: true,
    isHeroOffer: true,
    promotionalBadge: 'Chef Signature',
    isClientVerified: false, // Internal marker: Client verification required
    specifications: {
      'Portion': 'Single Heavy Serves 1-2',
      'Rice': 'Premium Seeraga Samba',
      'Accompaniments': 'Brinjal Dalcha + Onion Raita + Egg',
      'Prep Time': 'Freshly packed within 15 mins'
    },
    images: [
      {
        id: 'img-kb-1-1',
        catalogItemId: 'item-kb-1',
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=900&q=80',
        altText: 'Hot aromatic chicken biryani served with garnish',
        sortOrder: 1,
        isPrimary: true
      },
      {
        id: 'img-kb-1-2',
        catalogItemId: 'item-kb-1',
        imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=900&q=80',
        altText: 'Fragrant Indian spiced rice dish',
        sortOrder: 2,
        isPrimary: false
      }
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'item-kb-2',
    brandId: 'kirubai',
    categoryId: 'cat-kb-2',
    categoryName: 'Starters & Crispy Bites',
    name: 'Chettinad Spicy Pepper Chicken Fry (Dry)',
    slug: 'chettinad-spicy-pepper-chicken-fry',
    itemType: 'PRODUCT',
    shortDescription: 'Boneless chicken cubes tossed with crushed black pepper, curry leaves, and shallots.',
    description: 'A fiery, flavor-packed South Indian dry roast cooked with fresh crushed black pepper and crispy curry leaves. Perfect side for biryani or parottas.',
    originalPrice: 220,
    offerPrice: 180,
    unitType: 'portion',
    unitValue: 1,
    stockQuantity: 20,
    isAvailable: true,
    isFeatured: true,
    isHeroOffer: false,
    promotionalBadge: 'Crispy & Spicy',
    isClientVerified: false,
    specifications: {
      'Portion': '250g Boneless / Semi-boneless',
      'Spice Level': 'Medium - Hot',
      'Key Spices': 'Black pepper, shallots, curry leaves'
    },
    images: [
      {
        id: 'img-kb-2-1',
        catalogItemId: 'item-kb-2',
        imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=900&q=80',
        altText: 'Spicy pepper fried chicken starter',
        sortOrder: 1,
        isPrimary: true
      }
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'item-kb-3',
    brandId: 'kirubai',
    categoryId: 'cat-kb-3',
    categoryName: 'Authentic Gravies & Curries',
    name: 'Ghee Rice & Butter Paneer Curry Meal',
    slug: 'ghee-rice-butter-paneer-curry-meal',
    itemType: 'PRODUCT',
    shortDescription: 'Aromatic cashew ghee rice paired with creamy tomato butter paneer gravy.',
    description: 'Mildly spiced, fragrant Basmati rice sautéed in pure dairy ghee and whole spices, served with rich, velvety cottage cheese curry and fried papad.',
    originalPrice: 240,
    offerPrice: 199,
    unitType: 'plate',
    unitValue: 1,
    stockQuantity: 15,
    isAvailable: true,
    isFeatured: false,
    isHeroOffer: false,
    promotionalBadge: 'Vegetarian Favorite',
    isClientVerified: false,
    specifications: {
      'Diet': 'Pure Vegetarian',
      'Ghee': '100% Pure Cow Ghee',
      'Serves': '1 Person'
    },
    images: [
      {
        id: 'img-kb-3-1',
        catalogItemId: 'item-kb-3',
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=80',
        altText: 'Creamy paneer curry and rice meal combo',
        sortOrder: 1,
        isPrimary: true
      }
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'item-kb-4',
    brandId: 'kirubai',
    categoryId: 'cat-kb-4',
    categoryName: 'Coolers & Desserts',
    name: 'Fresh Mint Lime Cooler (500ml)',
    slug: 'fresh-mint-lime-cooler',
    itemType: 'PRODUCT',
    shortDescription: 'Refreshing crushed garden mint, freshly squeezed lime, and natural mineral rock salt.',
    description: 'Chilled, revitalizing beverage made with organic lemons and mint leaves. Instantly refreshes after a spicy meal.',
    originalPrice: 60,
    offerPrice: 45,
    unitType: 'bottle',
    unitValue: 1,
    stockQuantity: 30,
    isAvailable: true,
    isFeatured: false,
    isHeroOffer: false,
    promotionalBadge: 'Cooler',
    isClientVerified: false,
    specifications: {
      'Quantity': '500ml Chilled Bottle',
      'Sugar': 'Customizable upon WhatsApp note'
    },
    images: [
      {
        id: 'img-kb-4-1',
        catalogItemId: 'item-kb-4',
        imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80',
        altText: 'Chilled iced mint and lime refresher drink',
        sortOrder: 1,
        isPrimary: true
      }
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // SS VISION 360 ITEMS (Client Verification Required for exact inventory prices)
  {
    id: 'item-v3-1',
    brandId: 'vision-360',
    categoryId: 'cat-v3-1',
    categoryName: 'Smart CCTV Cameras',
    name: '5MP Smart Full-Color Night Vision Outdoor Bullet CCTV',
    slug: '5mp-smart-full-color-night-vision-bullet-cctv',
    itemType: 'PRODUCT',
    shortDescription: '24/7 crystal-clear color night vision with built-in mic and IP67 weatherproof housing.',
    description: 'Equipped with dual warm white LED illuminators and advanced CMOS sensor, producing clear daylight-like colored footage even in pitch darkness. Supports human motion detection alarm and two-way audio pickup.',
    originalPrice: 2650,
    offerPrice: 1999,
    unitType: 'piece',
    unitValue: 1,
    stockQuantity: 10,
    isAvailable: true,
    isFeatured: true,
    isHeroOffer: true,
    promotionalBadge: 'Top Security Pick',
    isClientVerified: false,
    specifications: {
      'Resolution': '5 Megapixel (2560 × 1920)',
      'Night Vision': 'ColorVu 30m White Light Range',
      'Protection': 'IP67 Metal Waterproof & Dustproof',
      'Audio': 'Built-in High Sensitivity Microphone',
      'Warranty': '2 Years Replacement Warranty'
    },
    images: [
      {
        id: 'img-v3-1-1',
        catalogItemId: 'item-v3-1',
        imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=900&q=80',
        altText: 'High resolution outdoor security bullet camera',
        sortOrder: 1,
        isPrimary: true
      },
      {
        id: 'img-v3-1-2',
        catalogItemId: 'item-v3-1',
        imageUrl: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=900&q=80',
        altText: 'Security surveillance monitoring installation',
        sortOrder: 2,
        isPrimary: false
      }
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'item-v3-2',
    brandId: 'vision-360',
    categoryId: 'cat-v3-2',
    categoryName: 'DVR / NVR & Hard Drives',
    name: '4-Channel 4K H.265+ Ultra HD Smart DVR',
    slug: '4-channel-4k-h265-smart-dvr',
    itemType: 'PRODUCT',
    shortDescription: 'AI motion search, mobile live streaming app, and multi-camera synchronous playback.',
    description: 'High efficiency H.265+ video encoding reduces storage bandwidth by up to 75%. Allows real-time viewing on your Android and iOS mobile phones anywhere across the world.',
    originalPrice: 3800,
    offerPrice: 2899,
    unitType: 'piece',
    unitValue: 1,
    stockQuantity: 5,
    isAvailable: true,
    isFeatured: true,
    isHeroOffer: false,
    promotionalBadge: 'Mobile Remote View',
    isClientVerified: false,
    specifications: {
      'Channels': '4 Video Inputs + 1 Audio Channel',
      'Compression': 'H.265+ / H.265 / H.264',
      'Mobile App': 'Free Live Remote Mobile App (Android/iOS)',
      'Storage': 'Supports up to 8TB Surveillance HDD'
    },
    images: [
      {
        id: 'img-v3-2-1',
        catalogItemId: 'item-v3-2',
        imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80',
        altText: 'DVR video recorder hardware unit',
        sortOrder: 1,
        isPrimary: true
      }
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'item-v3-3',
    brandId: 'vision-360',
    categoryId: 'cat-v3-3',
    categoryName: 'Cables, PoE & Power',
    name: 'Pure Copper Cat6 CCTV Cable Coil (90 Meters)',
    slug: 'pure-copper-cat6-cctv-cable-90m',
    itemType: 'PRODUCT',
    shortDescription: 'Heavy-gauge solid copper conductor for lossless video feed and long-distance PoE transmission.',
    description: 'Shielded twisted pair construction prevents electrical interference from high-voltage lines. Weather-resistant PVC jacket suitable for both indoor conduit and outdoor piping.',
    originalPrice: 1900,
    offerPrice: 1450,
    unitType: 'roll',
    unitValue: 1,
    stockQuantity: 7,
    isAvailable: true,
    isFeatured: false,
    isHeroOffer: false,
    promotionalBadge: 'High Gauge Copper',
    isClientVerified: false,
    specifications: {
      'Length': '90 Meters Box Coil',
      'Conductor': '100% Solid Pure Annealed Copper',
      'Application': 'IP CCTV, NVR PoE, Gigabit Networking'
    },
    images: [
      {
        id: 'img-v3-3-1',
        catalogItemId: 'item-v3-3',
        imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&q=80',
        altText: 'High quality copper ethernet communication cables',
        sortOrder: 1,
        isPrimary: true
      }
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'item-v3-4',
    brandId: 'vision-360',
    categoryId: 'cat-v3-4',
    categoryName: 'Installation & Repair Services',
    name: 'Complete 4-Camera Home/Store CCTV Installation & Setup',
    slug: 'complete-4-camera-cctv-installation-service',
    itemType: 'SERVICE',
    shortDescription: 'Neat conduit casing, precision camera angle alignment, DVR setup & mobile app pairing.',
    description: 'Our senior technicians conduct site assessment, lay neat wiring with safety conduit, secure camera mounting, configure recording resolution, and train you on mobile phone live playback.',
    originalPrice: 2200,
    offerPrice: 1699,
    unitType: 'service',
    unitValue: 1,
    stockQuantity: null,
    isAvailable: true,
    isFeatured: true,
    isHeroOffer: true,
    promotionalBadge: 'Popular Package',
    isClientVerified: false,
    specifications: {
      'Scope': 'Up to 4 CCTV Camera points setup',
      'Includes': 'Cable laying, drilling, mounting, DVR config, mobile app pairing',
      'Turnaround': 'Completed within 1 working day in Coimbatore'
    },
    images: [
      {
        id: 'img-v3-4-1',
        catalogItemId: 'item-v3-4',
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80',
        altText: 'Technician installing security surveillance equipment',
        sortOrder: 1,
        isPrimary: true
      }
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'item-v3-5',
    brandId: 'vision-360',
    categoryId: 'cat-v3-4',
    categoryName: 'Installation & Repair Services',
    name: 'CCTV Fault Diagnosis, Rewiring & Repair Visit',
    slug: 'cctv-fault-repair-rewiring-service',
    itemType: 'SERVICE',
    shortDescription: 'Fix black screen, video loss, recording failure, power issues, or mobile streaming glitches.',
    description: 'Doorstep technician inspection to diagnose camera power supplies, damaged BNC/Cat6 cables, hard disk errors, or DVR firmware lockouts.',
    originalPrice: 650,
    offerPrice: 450,
    unitType: 'service',
    unitValue: 1,
    stockQuantity: null,
    isAvailable: true,
    isFeatured: false,
    isHeroOffer: false,
    promotionalBadge: 'Quick Technician Visit',
    isClientVerified: false,
    specifications: {
      'Service Coverage': 'Any location across Coimbatore',
      'Inspection Time': 'Within 2-4 hours of inquiry'
    },
    images: [
      {
        id: 'img-v3-5-1',
        catalogItemId: 'item-v3-5',
        imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=900&q=80',
        altText: 'Technician testing security system wiring',
        sortOrder: 1,
        isPrimary: true
      }
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
