import { DailyStatus } from '@/types';

// Helper to get today's date in YYYY-MM-DD format
export const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const todayStr = getTodayDateString();

export const INITIAL_DAILY_STATUSES: DailyStatus[] = [
  // 1. SS Aquarium Daily Status
  {
    id: 'status-aq-1',
    brandId: 'aquarium',
    title: 'Fresh Exotic Discus & Red Cap Pairs Arrived',
    shortMessage: 'Fully quarantined and actively feeding. Oxygen-packed delivery available today across Coimbatore.',
    detailedMessage: 'New shipment of high-grade Blue Diamond Discus, Red Cap Orandas, and vibrant Live Aquatic Plants are now available in our Madhukkarai store. All specimens have completed strict 7-day health quarantine.',
    imageUrl: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=1000&q=80',
    ctaLabel: 'Browse New Arrivals',
    ctaDestination: '/aquarium/catalog?type=PRODUCT',
    publishDate: todayStr,
    expiryDate: undefined,
    isActive: true,
    priority: 1,
    statusType: 'NEW_ARRIVAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // 2. Kirubai Cloud Kitchen Daily Status
  {
    id: 'status-kb-1',
    brandId: 'kirubai',
    title: 'Today’s Lunch Special: Seeraga Samba Dum Biryani Batch',
    shortMessage: 'Freshly prepared with pure wood-fired dum & cold-pressed oils. Piping hot doorstep dispatch within ~2km free delivery.',
    detailedMessage: 'Slow-cooked in authentic wood-fired handi with freshly ground masala and farm-fresh ingredients. Comes with cool onion raita and brinjal dalcha. Limited batches made daily for maximum hygiene.',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1000&q=80',
    ctaLabel: 'Order Lunch Combo Now',
    ctaDestination: '/kirubai/catalog?type=PRODUCT',
    publishDate: todayStr,
    expiryDate: undefined,
    isActive: true,
    priority: 1,
    statusType: 'TODAYS_SPECIAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // 3. SS Vision 360 Daily Status
  {
    id: 'status-v3-1',
    brandId: 'vision-360',
    title: 'Free Onsite Security Survey & 4K Camera Demo Today',
    shortMessage: 'Technicians available for doorstep site assessment in Coimbatore. 2-Year direct OEM warranty on all packages.',
    detailedMessage: 'Get a professional camera angle assessment for your home, commercial shop, or warehouse with zero obligation. Includes live demonstration of 24/7 ColorVu night vision on your mobile phone.',
    imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1000&q=80',
    ctaLabel: 'Book Onsite Technician Visit',
    ctaDestination: '/vision-360/catalog?type=SERVICE',
    publishDate: todayStr,
    expiryDate: undefined,
    isActive: true,
    priority: 1,
    statusType: 'SERVICE_UPDATE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
