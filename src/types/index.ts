export type VerticalCategory = 
  | 'restaurants' 
  | 'turbo' 
  | 'supermarket' 
  | 'pharmacy' 
  | 'juxtafavor'
  | 'juxtacoins'
  | 'live_ops';

export type JuxtaActorRole = 'customer' | 'courier' | 'merchant';

export interface JuxtaCoinTransaction {
  id: string;
  role: JuxtaActorRole;
  title: string;
  subtitle: string;
  type: 'earned' | 'redeemed_cash' | 'used_in_order';
  coins: number;
  copAmount: number;
  timestamp: string;
  payoutMethod?: string;
}

export interface AffiliatedMerchant {
  id: string;
  businessName: string;
  category: string;
  city: string;
  contactPhone: string;
  coinsBalance: number;
  welcomeBonusClaimed: boolean;
  joinedAt: string;
}

export interface StoreOptionChoice {
  id: string;
  name: string;
  price: number;
}

export interface StoreOptionGroup {
  id: string;
  name: string;
  required: boolean;
  choices: StoreOptionChoice[];
}

export interface MenuItem {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  popular?: boolean;
  dietary?: 'vegetarian' | 'vegan' | 'gluten_free';
  accentColor: string;
  prepTimeMin: number;
  options?: StoreOptionGroup[];
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  category: VerticalCategory;
  rating: number;
  reviewsCount: number;
  deliveryTimeMin: number;
  deliveryFee: number;
  minOrder: number;
  tags: string[];
  featured?: boolean;
  isTurbo?: boolean;
  promoBadge?: string;
  heroColor: string;
  accentBadge?: string;
  address: string;
  menu: MenuItem[];
}

export interface CartItemOption {
  groupName: string;
  choiceName: string;
  price: number;
}

export interface CartItem {
  cartItemId: string;
  menuItemId: string;
  storeId: string;
  storeName: string;
  name: string;
  basePrice: number;
  unitPrice: number;
  quantity: number;
  selectedOptions: CartItemOption[];
  notes?: string;
}

export interface CartPricing {
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discount: number;
  juxtaCoinsUsed: number;
  juxtaCoinsDiscountCOP: number;
  juxtaCoinsEarned: number;
  tip: number;
  total: number;
  discountDescription?: string;
  isFreeDelivery: boolean;
}

export type OrderStatus = 'confirmed' | 'preparing' | 'on_the_way' | 'delivered';

export interface CourierInfo {
  name: string;
  vehicle: string;
  plate: string;
  phone: string;
  rating: number;
  deliveriesCount: number;
  badge: string;
}

export interface Order {
  id: string;
  createdAt: number;
  items: CartItem[];
  pricing: CartPricing;
  status: OrderStatus;
  etaMinutes: number;
  storeName: string;
  deliveryAddress: string;
  paymentMethod: 'card' | 'pse' | 'cash' | 'apple_pay';
  courier: CourierInfo;
  progressPercent: number; // 0 to 100
  notes?: string;
  customerCoinsEarned: number;
  courierCoinsEarned: number;
  merchantCoinsEarned: number;
}

export interface JuxtaFavorQuote {
  pickupAddress: string;
  dropoffAddress: string;
  distanceKm: number;
  itemDescription: string;
  urgency: 'standard' | 'express';
  estimatedCost: number;
  estimatedMinutes: number;
  customerCoinsEarned: number;
  courierCoinsEarned: number;
}
