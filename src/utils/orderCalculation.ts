import { CartItem, CartPricing, JuxtaFavorQuote } from '../types/index.ts';

// 1 JuxtaCoin (JXC) = $100 COP en dinero real
export const JUXTACOIN_RATE_COP = 100;

export const PROMO_CODES: Record<string, { type: 'percent' | 'flat' | 'free_shipping'; value: number; minSubtotal: number; description: string }> = {
  JUXTAGO10: {
    type: 'percent',
    value: 10,
    minSubtotal: 0,
    description: '10% de descuento en tu orden',
  },
  TURBOYA: {
    type: 'flat',
    value: 5,
    minSubtotal: 20,
    description: '$5.000 COP de descuento (min $20.000)',
  },
  ENVIOFREE: {
    type: 'free_shipping',
    value: 0,
    minSubtotal: 0,
    description: 'Envío completamente gratis',
  },
};

export function convertCoinsToCOP(coins: number): number {
  return Math.max(0, Math.floor(coins) * JUXTACOIN_RATE_COP);
}

export function calculateCustomerEarnedCoins(
  subtotal: number,
  isPrimeMember: boolean = false,
  isTurbo: boolean = false
): number {
  if (subtotal <= 0) return 0;
  // Base 5% cashback in value, or 10% for JuxtaPrime members
  const cashbackRate = isPrimeMember ? 0.1 : 0.05;
  const copRewardValue = subtotal * cashbackRate;
  const baseCoins = Math.max(1, Math.round(copRewardValue / JUXTACOIN_RATE_COP));
  const turboBonus = isTurbo ? 15 : 0;
  return baseCoins + turboBonus;
}

export function calculateCourierEarnedCoins(
  distanceKm: number,
  isTurbo: boolean = false,
  fiveStarRating: boolean = true
): number {
  // Base 12 JXC per delivery + 3 JXC per km + 15 JXC if Turbo < 10m + 8 JXC for 5-star service
  const base = 12;
  const distanceBonus = Math.round(Math.max(1, distanceKm) * 3);
  const turboBonus = isTurbo ? 15 : 0;
  const ratingBonus = fiveStarRating ? 8 : 0;
  return base + distanceBonus + turboBonus + ratingBonus;
}

export function calculateMerchantEarnedCoins(
  subtotal: number,
  zeroIncidentsBonus: boolean = true
): number {
  if (subtotal <= 0) return 0;
  // Merchants earn 4% of order subtotal in JuxtaCoins + 10 JXC quality preparation bonus
  const volumeCoins = Math.max(2, Math.round((subtotal * 0.04) / JUXTACOIN_RATE_COP));
  return volumeCoins + (zeroIncidentsBonus ? 10 : 0);
}

export interface CalculateCartParams {
  items: CartItem[];
  baseDeliveryFee: number;
  isPrimeMember?: boolean;
  promoCode?: string;
  tipPercent?: number; // 0, 5, 10, 15
  customTip?: number;
  availableJuxtaCoins?: number;
  useJuxtaCoins?: boolean;
  isTurboOrder?: boolean;
}

export function calculateCartSummary({
  items,
  baseDeliveryFee,
  isPrimeMember = false,
  promoCode,
  tipPercent = 10,
  customTip,
  availableJuxtaCoins = 0,
  useJuxtaCoins = false,
  isTurboOrder = false,
}: CalculateCartParams): CartPricing {
  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  let deliveryFee = baseDeliveryFee;
  let isFreeDelivery = false;

  if (isPrimeMember || subtotal === 0) {
    deliveryFee = 0;
    isFreeDelivery = true;
  }

  // Base service fee is 5% of subtotal, rounded to nearest 100 or min 1200
  let serviceFee = subtotal > 0 ? Math.max(1200, Math.round((subtotal * 0.05) / 100) * 100) : 0;
  if (isPrimeMember) {
    serviceFee = Math.round(serviceFee * 0.5);
  }

  // Promo handling
  let discount = 0;
  let discountDescription: string | undefined;

  if (promoCode && PROMO_CODES[promoCode.trim().toUpperCase()]) {
    const promo = PROMO_CODES[promoCode.trim().toUpperCase()];
    if (subtotal >= promo.minSubtotal) {
      if (promo.type === 'percent') {
        discount = Math.round((subtotal * (promo.value / 100)) / 100) * 100;
        discountDescription = promo.description;
      } else if (promo.type === 'flat') {
        discount = Math.min(subtotal, promo.value * 1000);
        discountDescription = promo.description;
      } else if (promo.type === 'free_shipping') {
        deliveryFee = 0;
        isFreeDelivery = true;
        discountDescription = promo.description;
      }
    }
  }

  // Tip calculation
  let tip = 0;
  if (customTip !== undefined && customTip >= 0) {
    tip = customTip;
  } else if (subtotal > 0 && tipPercent > 0) {
    tip = Math.round((subtotal * (tipPercent / 100)) / 100) * 100;
  }

  const preCoinTotal = Math.max(0, subtotal - discount + deliveryFee + serviceFee + tip);

  // JuxtaCoins redemption in checkout
  let juxtaCoinsUsed = 0;
  let juxtaCoinsDiscountCOP = 0;

  if (useJuxtaCoins && availableJuxtaCoins > 0 && preCoinTotal > 0) {
    const maxCoinsApplicable = Math.floor(preCoinTotal / JUXTACOIN_RATE_COP);
    juxtaCoinsUsed = Math.min(availableJuxtaCoins, maxCoinsApplicable);
    juxtaCoinsDiscountCOP = convertCoinsToCOP(juxtaCoinsUsed);
  }

  const total = Math.max(0, preCoinTotal - juxtaCoinsDiscountCOP);
  const juxtaCoinsEarned = calculateCustomerEarnedCoins(subtotal, isPrimeMember, isTurboOrder);

  return {
    subtotal,
    deliveryFee,
    serviceFee,
    discount,
    juxtaCoinsUsed,
    juxtaCoinsDiscountCOP,
    juxtaCoinsEarned,
    tip,
    total,
    discountDescription,
    isFreeDelivery,
  };
}

export function calculateJuxtaFavorQuote(
  pickupAddress: string,
  dropoffAddress: string,
  distanceKm: number,
  itemDescription: string,
  urgency: 'standard' | 'express' = 'standard'
): JuxtaFavorQuote {
  const basePrice = 6500;
  const perKmRate = 1400;
  const kmToCharge = Math.max(0, distanceKm - 2);
  let estimatedCost = basePrice + Math.round(kmToCharge * perKmRate);

  if (urgency === 'express') {
    estimatedCost = Math.round(estimatedCost * 1.35);
  }

  estimatedCost = Math.round(estimatedCost / 100) * 100;

  const estimatedMinutes = Math.max(
    12,
    Math.round(8 + distanceKm * 3.5 * (urgency === 'express' ? 0.75 : 1))
  );

  const customerCoinsEarned = calculateCustomerEarnedCoins(estimatedCost, false, urgency === 'express');
  const courierCoinsEarned = calculateCourierEarnedCoins(distanceKm, urgency === 'express', true);

  return {
    pickupAddress,
    dropoffAddress,
    distanceKm,
    itemDescription,
    urgency,
    estimatedCost,
    estimatedMinutes,
    customerCoinsEarned,
    courierCoinsEarned,
  };
}

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}
