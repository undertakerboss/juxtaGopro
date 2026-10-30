import React, { useState } from 'react';
import { X, CreditCard, Banknote, Smartphone, ShieldCheck, MapPin, CheckCircle2, Coins } from 'lucide-react';
import { CartItem, CartPricing, Order } from '../types/index.ts';
import {
  formatCOP,
  calculateCourierEarnedCoins,
  calculateMerchantEarnedCoins,
} from '../utils/orderCalculation.ts';
import { MOCK_COURIER } from '../data/mockData.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  pricing: CartPricing;
  deliveryAddress: string;
  onOrderPlaced: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  pricing,
  deliveryAddress,
  onOrderPlaced,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pse' | 'apple_pay' | 'cash'>('card');
  const [aptNotes, setAptNotes] = useState<string>('Apto 402, Torre 1 (Dejar en portería si no contesto)');
  const [cashChange, setCashChange] = useState<string>('100000');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const storeName = items[0]?.storeName || 'Juxtago Store';
  const isTurbo = items.some((i) => i.storeId.includes('turbo'));
  const courierCoinsEarned = calculateCourierEarnedCoins(3.5, isTurbo, true);
  const merchantCoinsEarned = calculateMerchantEarnedCoins(pricing.subtotal, true);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newOrder: Order = {
        id: `JXT-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: Date.now(),
        items,
        pricing,
        status: 'confirmed',
        etaMinutes: isTurbo ? 10 : 24,
        storeName,
        deliveryAddress: `${deliveryAddress} (${aptNotes})`,
        paymentMethod,
        courier: MOCK_COURIER,
        progressPercent: 15,
        notes: aptNotes,
        customerCoinsEarned: pricing.juxtaCoinsEarned,
        courierCoinsEarned,
        merchantCoinsEarned,
      };

      setIsSubmitting(false);
      onOrderPlaced(newOrder);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-black text-slate-900">Confirmación y Pago</h3>
            <p className="text-xs text-slate-500 mt-0.5">Pedido seguro con recompensa en JuxtaCoins</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Cerrar modal de pago"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmitOrder} className="p-6 space-y-5">
          {/* Address details */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-600" />
              <span>Dirección de Entrega</span>
            </label>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <p className="font-semibold text-slate-900">{deliveryAddress}</p>
              <input
                type="text"
                value={aptNotes}
                onChange={(e) => setAptNotes(e.target.value)}
                placeholder="Apto, interior, notas para el portero..."
                className="mt-2 w-full p-2 bg-white rounded-lg border border-slate-200 text-xs focus:border-orange-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Método de Pago
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500 text-slate-900'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <CreditCard className="w-5 h-5 text-orange-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold">Tarjeta Crédito</p>
                  <p className="text-[10px] text-slate-500 font-mono">•••• 4242</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('pse')}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                  paymentMethod === 'pse'
                    ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500 text-slate-900'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Smartphone className="w-5 h-5 text-indigo-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold">PSE / Nequi</p>
                  <p className="text-[10px] text-slate-500">Transferencia móvil</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('apple_pay')}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                  paymentMethod === 'apple_pay'
                    ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500 text-slate-900'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  
                </div>
                <div>
                  <p className="text-xs font-bold">Apple / Google Pay</p>
                  <p className="text-[10px] text-slate-500">1-Touch Pay</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500 text-slate-900'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold">Efectivo</p>
                  <p className="text-[10px] text-slate-500">Contra entrega</p>
                </div>
              </button>
            </div>

            {paymentMethod === 'cash' && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                <label className="block text-emerald-900 font-semibold mb-1">
                  ¿Con cuánto efectivo vas a pagar? (Para cambio)
                </label>
                <input
                  type="number"
                  value={cashChange}
                  onChange={(e) => setCashChange(e.target.value)}
                  className="w-full p-2 bg-white rounded-lg border border-emerald-300 font-mono text-xs outline-none"
                  min={pricing.total}
                />
              </div>
            )}
          </div>

          {/* Ecosystem JuxtaCoins Distribution Preview */}
          <div className="p-3.5 rounded-2xl bg-slate-900 text-white text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Coins className="w-4 h-4" />
              <span>Recompensas JuxtaCoins que genera tu orden:</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="bg-white/10 rounded-xl p-2">
                <span className="text-slate-300 block">Para Ti (Cliente)</span>
                <span className="font-mono font-bold text-amber-300 text-xs tabular-nums">
                  +{pricing.juxtaCoinsEarned} JXC
                </span>
              </div>
              <div className="bg-white/10 rounded-xl p-2">
                <span className="text-slate-300 block">Domiciliario</span>
                <span className="font-mono font-bold text-emerald-300 text-xs tabular-nums">
                  +{courierCoinsEarned} JXC
                </span>
              </div>
              <div className="bg-white/10 rounded-xl p-2">
                <span className="text-slate-300 block">Comerciante</span>
                <span className="font-mono font-bold text-orange-300 text-xs tabular-nums">
                  +{merchantCoinsEarned} JXC
                </span>
              </div>
            </div>
          </div>

          {/* Quick Itemized Recap */}
          <div className="border-t border-slate-200 pt-3 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>{storeName} ({items.length} productos)</span>
              <span className="font-mono tabular-nums">{formatCOP(pricing.subtotal)}</span>
            </div>
            {pricing.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Descuento cupón</span>
                <span className="font-mono tabular-nums">-{formatCOP(pricing.discount)}</span>
              </div>
            )}
            {pricing.juxtaCoinsDiscountCOP > 0 && (
              <div className="flex justify-between text-amber-700 font-bold">
                <span>Pago con JuxtaCoins ({pricing.juxtaCoinsUsed} JXC)</span>
                <span className="font-mono tabular-nums">-{formatCOP(pricing.juxtaCoinsDiscountCOP)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Envío + Servicio + Propina</span>
              <span className="font-mono tabular-nums">
                {formatCOP(pricing.deliveryFee + pricing.serviceFee + pricing.tip)}
              </span>
            </div>
            <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t border-slate-100">
              <span>Total a Pagar</span>
              <span className="font-mono text-orange-600 text-base tabular-nums">
                {formatCOP(pricing.total)}
              </span>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all"
            >
              {isSubmitting ? (
                <span>Procesando pedido...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar y Ordenar ({formatCOP(pricing.total)})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
