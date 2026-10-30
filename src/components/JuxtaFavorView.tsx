import React, { useState } from 'react';
import { Package, MapPin, Zap, Clock, ShieldCheck, ArrowRight, CheckCircle2, Coins } from 'lucide-react';
import { calculateJuxtaFavorQuote, formatCOP } from '../utils/orderCalculation.ts';
import { Order, CartPricing } from '../types/index.ts';
import { MOCK_COURIER } from '../data/mockData.ts';

interface JuxtaFavorViewProps {
  onOrderPlaced: (order: Order) => void;
  defaultPickupAddress: string;
}

export const JuxtaFavorView: React.FC<JuxtaFavorViewProps> = ({
  onOrderPlaced,
  defaultPickupAddress,
}) => {
  const [pickup, setPickup] = useState<string>('Cra 15 #85-30, Antiguo Country');
  const [dropoff, setDropoff] = useState<string>(defaultPickupAddress);
  const [description, setDescription] = useState<string>('Llaves de casa y cargador de laptop en sobre manila sellado');
  const [urgency, setUrgency] = useState<'standard' | 'express'>('standard');
  const [distanceKm, setDistanceKm] = useState<number>(4.2);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const quote = calculateJuxtaFavorQuote(pickup, dropoff, distanceKm, description, urgency);

  const handleDispatchJuxtaFavor = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const pricing: CartPricing = {
      subtotal: quote.estimatedCost,
      deliveryFee: 0,
      serviceFee: 0,
      discount: 0,
      juxtaCoinsUsed: 0,
      juxtaCoinsDiscountCOP: 0,
      juxtaCoinsEarned: quote.customerCoinsEarned,
      tip: 2000,
      total: quote.estimatedCost + 2000,
      isFreeDelivery: true,
    };

    const newOrder: Order = {
      id: `FAVOR-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: Date.now(),
      items: [
        {
          cartItemId: `favor-${Date.now()}`,
          menuItemId: 'favor-errand',
          storeId: 'juxtafavor-core',
          storeName: 'JuxtaFavor Exprés',
          name: `Mensajería: ${description.slice(0, 35)}...`,
          basePrice: quote.estimatedCost,
          unitPrice: quote.estimatedCost,
          quantity: 1,
          selectedOptions: [
            { groupName: 'Modalidad', choiceName: urgency === 'express' ? 'Ultra Prioritario' : 'Estándar', price: 0 },
            { groupName: 'Trayecto', choiceName: `${distanceKm} km estimados`, price: 0 },
          ],
          notes: `Recoger: ${pickup} | Entregar: ${dropoff}`,
        },
      ],
      pricing,
      status: 'confirmed',
      etaMinutes: quote.estimatedMinutes,
      storeName: 'JuxtaFavor Mensajería',
      deliveryAddress: dropoff,
      paymentMethod: 'card',
      courier: {
        ...MOCK_COURIER,
        vehicle: 'Moto Eléctrica Express',
      },
      progressPercent: 20,
      notes: description,
      customerCoinsEarned: quote.customerCoinsEarned,
      courierCoinsEarned: quote.courierCoinsEarned,
      merchantCoinsEarned: 0,
    };

    setTimeout(() => {
      onOrderPlaced(newOrder);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto py-4">
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 text-indigo-200 text-xs font-semibold mb-2">
            <Package className="w-3.5 h-3.5" />
            <span>El servicio definitivo "Pide lo que sea" · Suma JuxtaCoins</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            JuxtaFavor Mensajería
          </h2>
          <p className="text-sm sm:text-base text-indigo-100 mt-2 leading-relaxed">
            ¿Olvidaste las llaves? ¿Necesitas llevar documentos firmados, recoger medicinas o hacer una compra donde no hay app? Un domiciliario dedicado va por ti y ambos ganan JuxtaCoins.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-4">
            Configura tu encargo
          </h3>

          <form onSubmit={handleDispatchJuxtaFavor} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-600" />
                <span>Punto A: ¿Dónde recogemos?</span>
              </label>
              <input
                type="text"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="Dirección exacta, nombre del lugar o local..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                <span>Punto B: ¿Dónde entregamos?</span>
              </label>
              <input
                type="text"
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                placeholder="Dirección de destino..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-bold text-slate-700">Distancia aproximada calculada</span>
                <span className="font-mono font-bold text-indigo-600 tabular-nums">{distanceKm.toFixed(1)} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="0.5"
                value={distanceKm}
                onChange={(e) => setDistanceKm(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ¿Qué debemos hacer o transportar?
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe el objeto, indicaciones de seguridad, o encargo detallado..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Velocidad de despacho
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUrgency('standard')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    urgency === 'standard'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                    <span>Estándar (~25 min)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Tarifa regular económica</p>
                </button>

                <button
                  type="button"
                  onClick={() => setUrgency('express')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    urgency === 'express'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-700">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Express Prioritario</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Domiciliario asignado de inmediato</p>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitted}
              className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all"
            >
              {submitted ? (
                <span>Asignando mensajero JuxtaFavor...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Solicitar Mensajero ({formatCOP(quote.estimatedCost + 2000)})</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Quote Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-lg">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 mb-3">
              Cotización Transparente + JuxtaCoins
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Tarifa base (hasta 2 km)</span>
                <span className="font-mono tabular-nums">{formatCOP(6500)}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Distancia adicional ({Math.max(0, distanceKm - 2).toFixed(1)} km)</span>
                <span className="font-mono tabular-nums">
                  {formatCOP(Math.max(0, distanceKm - 2) * 1400)}
                </span>
              </div>
              {urgency === 'express' && (
                <div className="flex justify-between pb-2 border-b border-slate-800 text-amber-400">
                  <span>Suplemento Express</span>
                  <span className="font-mono tabular-nums">+35%</span>
                </div>
              )}
              <div className="flex justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Recompensa Cliente:</span>
                <span className="font-mono font-bold text-amber-300 tabular-nums">
                  +{quote.customerCoinsEarned} JXC
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Bono para Domiciliario:</span>
                <span className="font-mono font-bold text-emerald-400 tabular-nums">
                  +{quote.courierCoinsEarned} JXC
                </span>
              </div>
              <div className="pt-2 flex justify-between items-baseline font-extrabold text-base">
                <span>Total Estimado</span>
                <span className="font-mono text-xl text-orange-400 tabular-nums">
                  {formatCOP(quote.estimatedCost + 2000)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
