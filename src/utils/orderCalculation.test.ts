import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCartSummary,
  calculateJuxtaFavorQuote,
  calculateCustomerEarnedCoins,
  calculateCourierEarnedCoins,
  calculateMerchantEarnedCoins,
  convertCoinsToCOP,
} from './orderCalculation.ts';
import {
  extractMemoryFromMessage,
  buildJuxtaBotSystemPrompt,
  INITIAL_MEMORIES,
} from './memoryEngine.ts';
import { CartItem } from '../types/index.ts';

const mockCartItem: CartItem = {
  cartItemId: 'item-1',
  menuItemId: 'menu-1',
  storeId: 'store-1',
  storeName: 'JuxtaBurger Artesanal',
  name: 'Doble Bacon Cheddar',
  basePrice: 32000,
  unitPrice: 34000,
  quantity: 2,
  selectedOptions: [{ groupName: 'Bebida', choiceName: 'Cerveza Club Colombia', price: 2000 }],
};

test('calculateCartSummary computes subtotal, fees, and earned JuxtaCoins without discounts', () => {
  const result = calculateCartSummary({
    items: [mockCartItem],
    baseDeliveryFee: 4500,
    isPrimeMember: false,
    tipPercent: 10,
  });

  assert.equal(result.subtotal, 68000);
  assert.equal(result.deliveryFee, 4500);
  assert.equal(result.discount, 0);
  assert.equal(result.serviceFee, 3400);
  assert.equal(result.tip, 6800);
  assert.equal(result.total, 82700);
  assert.equal(result.isFreeDelivery, false);
  assert.equal(result.juxtaCoinsEarned, 34);
});

test('calculateCartSummary applies JuxtaPrime free delivery, halved service fee, and double JuxtaCoins', () => {
  const result = calculateCartSummary({
    items: [mockCartItem],
    baseDeliveryFee: 4500,
    isPrimeMember: true,
    tipPercent: 0,
  });

  assert.equal(result.subtotal, 68000);
  assert.equal(result.deliveryFee, 0);
  assert.equal(result.isFreeDelivery, true);
  assert.equal(result.serviceFee, 1700);
  assert.equal(result.tip, 0);
  assert.equal(result.total, 69700);
  assert.equal(result.juxtaCoinsEarned, 68);
});

test('calculateCartSummary redeems available JuxtaCoins to reduce total payable COP', () => {
  const result = calculateCartSummary({
    items: [mockCartItem],
    baseDeliveryFee: 4500,
    isPrimeMember: false,
    tipPercent: 0,
    availableJuxtaCoins: 150,
    useJuxtaCoins: true,
  });

  assert.equal(result.juxtaCoinsUsed, 150);
  assert.equal(result.juxtaCoinsDiscountCOP, 15000);
  assert.equal(result.total, 75900 - 15000);
});

test('JuxtaCoins calculations for Customer, Courier, and Merchant roles', () => {
  const customerCoins = calculateCustomerEarnedCoins(40000, false, true);
  assert.equal(customerCoins, 35);

  const courierCoins = calculateCourierEarnedCoins(4, true, true);
  assert.equal(courierCoins, 47);

  const merchantCoins = calculateMerchantEarnedCoins(50000, true);
  assert.equal(merchantCoins, 30);

  assert.equal(convertCoinsToCOP(500), 50000);
});

test('calculateJuxtaFavorQuote calculates standard and express errand tariffs and JuxtaCoins', () => {
  const standard = calculateJuxtaFavorQuote('Calle 93 #11-20', 'Carrera 7 #72-41', 5, 'Llaves olvidadas', 'standard');
  assert.equal(standard.estimatedCost, 10700);
  assert.ok(standard.customerCoinsEarned > 0);
  assert.ok(standard.courierCoinsEarned > 0);

  const express = calculateJuxtaFavorQuote('Calle 93 #11-20', 'Carrera 7 #72-41', 5, 'Llaves olvidadas', 'express');
  assert.ok(express.estimatedCost > standard.estimatedCost);
  assert.ok(express.courierCoinsEarned > standard.courierCoinsEarned);
});

test('extractMemoryFromMessage extracts customer, merchant, and courier facts accurately', () => {
  const allergyMem = extractMemoryFromMessage('Recuerda que soy alérgico a los camarones y al maní.', 'customer');
  assert.ok(allergyMem);
  assert.equal(allergyMem.category, 'alergia');
  assert.ok(allergyMem.fact.toLowerCase().includes('camarones'));

  const addressMem = extractMemoryFromMessage('Ten en cuenta que mi dirección es Calle 116 #9-45 apto 802', 'customer');
  assert.ok(addressMem);
  assert.equal(addressMem.category, 'direccion');

  const prompt = buildJuxtaBotSystemPrompt(
    'customer',
    INITIAL_MEMORIES,
    { customer: 315, courier: 540, merchant: 2380 },
    'Calle 93 #11-20'
  );
  assert.ok(prompt.includes('Sin maní ni frutos secos'));
});
