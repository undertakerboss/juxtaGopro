import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, Tag, ArrowRight, ShieldCheck, ShoppingBag, Coins } from 'lucide-react';
import { CartItem, CartPricing } from '../types/index.ts';
import {
  calculateCartSummary,
  formatCOP,
  PROMO_CODES,
  convertCoinsToCOP,
} from '../utils/orderCalculation.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: (pricing: CartPricing, promoCode?: string, tipPercent?: number) => void;
  isPrime: boolean;
  baseDeliveryFee: number;
  deliveryAddress: string;
  availableCustomerCoins: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  isPrime,
  baseDeliveryFee,
  deliveryAddress,
  availableCustomerCoins,
}) => {
  const [promoInput, setPromoInput] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<string | undefined>('JUXTAGO10');
  const [promoError, setPromoError] = useState<string>('');
  const [tipPercent, setTipPercent] = useState<number>(10);
  const [customTip, setCustomTip] = useState<number | undefined>(undefined);
  const [useJuxtaCoins, setUseJuxtaCoins] = useState<boolean>(false);

  if (!isOpen) return null;

  const isTurboOrder = items.some((i) => i.storeId.includes('turbo'));

  const pricing = calculateCartSummary({
    items,
    baseDeliveryFee,
    isPrimeMember: isPrime,
    promoCode: appliedPromo,
    tipPercent,
    customTip,
    availableJuxtaCoins: availableCustomerCoins,
    useJuxtaCoins,
    isTurboOrder,
  });

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    if (PROMO_CODES[code]) {
      setAppliedPromo(code);
      setPromoError('');
      setPromoInput('');
    } else {
      setPromoError('Cupón no válido. Prueba "JUXTAGO10" o "ENVIOFREE"');
    }
  };

  const storeName = items[0]?.storeName || 'Juxtago Store';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Tu Canasta</h3>
                <p className="text-xs text-slate-500 truncate max-w-[240px]">{storeName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
              aria-label="Cerrar canasta"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Tu carrito está vacío</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1 mb-6">
                Descubre platillos gourmet, snacks en 10 min y gana JuxtaCoins canjeables por dinero real en cada compra.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                Explorar Restaurantes y Tiendas
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
              {/* Delivery Address */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 block">Entrega en:</span>
                  <span className="text-slate-600 truncate block max-w-[260px]">{deliveryAddress}</span>
                </div>
                <span className="font-mono text-orange-600 font-bold text-[11px] shrink-0">~25 min</span>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Productos ({items.reduce((s, i) => s + i.quantity, 0)})
                </h4>

                {items.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="p-3 rounded-xl border border-slate-200 bg-white flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className="font-bold text-slate-900 text-sm">{item.name}</h5>
                        {item.selectedOptions.length > 0 && (
                          <div className="text-[11px] text-slate-500 mt-0.5 space-y-0.5">
                            {item.selectedOptions.map((opt, i) => (
                              <div key={i}>
                                {opt.groupName}: <span className="text-slate-700">{opt.choiceName}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.cartItemId)}
                        className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-lg">
                        <button
                          onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                          className="text-slate-600 hover:text-slate-900"
                          aria-label="Restar una unidad"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-xs font-bold w-4 text-center tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                          className="text-slate-600 hover:text-slate-900"
                          aria-label="Sumar una unidad"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                        {formatCOP(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* JuxtaCoins Redemption Toggle */}
              <div className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 block">
                        Pagar con mis JuxtaCoins
                      </span>
                      <span className="text-[11px] text-slate-600 font-mono tabular-nums">
                        Disponibles: {availableCustomerCoins} JXC ({formatCOP(convertCoinsToCOP(availableCustomerCoins))})
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUseJuxtaCoins(!useJuxtaCoins)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      useJuxtaCoins
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {useJuxtaCoins ? 'Aplicados ✓' : 'Usar JXC'}
                  </button>
                </div>
                <div className="text-[11px] text-emerald-800 font-semibold border-t border-amber-200/70 pt-1.5 flex justify-between">
                  <span>Ganarás en este pedido:</span>
                  <span className="font-mono tabular-nums">
                    +{pricing.juxtaCoinsEarned} JXC ({formatCOP(convertCoinsToCOP(pricing.juxtaCoinsEarned))})
                  </span>
                </div>
              </div>

              {/* Promo Code Section */}
              <div className="border-t border-slate-200 pt-4">
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-orange-600" />
                  <span>Código de Promoción o Cupón</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Ej: JUXTAGO10, ENVIOFREE"
                    className="flex-1 uppercase text-xs p-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
                  >
                    Aplicar
                  </button>
                </div>

                {appliedPromo && (
                  <div className="mt-2 text-xs flex items-center justify-between bg-emerald-50 text-emerald-800 p-2 rounded-lg border border-emerald-200">
                    <span className="font-semibold">{appliedPromo}: {pricing.discountDescription}</span>
                    <button
                      onClick={() => setAppliedPromo(undefined)}
                      className="text-emerald-700 hover:text-emerald-900 underline text-[11px]"
                    >
                      Quitar
                    </button>
                  </div>
                )}
                {promoError && <p className="text-xs text-red-500 mt-1">{promoError}</p>}
              </div>

              {/* Courier Tip Selection */}
              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800">Propina para el domiciliario</label>
                  <span className="text-[11px] text-slate-500">100% para el Rider</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 5, 10, 15].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => {
                        setTipPercent(pct);
                        setCustomTip(undefined);
                      }}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        tipPercent === pct && customTip === undefined
                          ? 'bg-orange-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {pct === 0 ? 'Sin propina' : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Breakdown Summary */}
              <div className="border-t border-slate-200 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums">{formatCOP(pricing.subtotal)}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Costo de envío</span>
                  <span className="font-mono tabular-nums">
                    {pricing.isFreeDelivery ? (
                      <span className="text-emerald-600 font-bold">GRATIS</span>
                    ) : (
                      formatCOP(pricing.deliveryFee)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Tarifa de servicio Juxtago</span>
                  <span className="font-mono tabular-nums">{formatCOP(pricing.serviceFee)}</span>
                </div>

                {pricing.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Descuento cupón</span>
                    <span className="font-mono tabular-nums">-{formatCOP(pricing.discount)}</span>
                  </div>
                )}

                {pricing.juxtaCoinsDiscountCOP > 0 && (
                  <div className="flex justify-between text-amber-700 font-bold">
                    <span>Canje JuxtaCoins ({pricing.juxtaCoinsUsed} JXC)</span>
                    <span className="font-mono tabular-nums">
                      -{formatCOP(pricing.juxtaCoinsDiscountCOP)}
                    </span>
                  </div>
                )}

                {pricing.tip > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Propina</span>
                    <span className="font-mono tabular-nums">{formatCOP(pricing.tip)}</span>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-3 flex justify-between text-slate-900 font-extrabold text-base">
                  <span>Total a Pagar</span>
                  <span className="font-mono tabular-nums text-lg text-orange-600">
                    {formatCOP(pricing.total)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Footer CTA */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => onProceedToCheckout(pricing, appliedPromo, tipPercent)}
                className="w-full py-3.5 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm flex items-center justify-between shadow-md active:scale-[0.98] transition-all"
              >
                <span>Proceder al Pago</span>
                <div className="flex items-center gap-1.5 font-mono tabular-nums">
                  <span>{formatCOP(pricing.total)}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
