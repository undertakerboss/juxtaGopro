import React from 'react';
import { X, Sparkles, Check, ShieldCheck, Zap, Bike } from 'lucide-react';
import { formatCOP } from '../utils/orderCalculation.ts';

interface JuxtaPrimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPrime: boolean;
  onTogglePrime: () => void;
}

export const JuxtaPrimeModal: React.FC<JuxtaPrimeModalProps> = ({
  isOpen,
  onClose,
  isPrime,
  onTogglePrime,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative text-left">
        {/* Banner */}
        <div className="p-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            aria-label="Cerrar modal de Prime"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 bg-black/20 text-white font-bold text-xs px-3 py-1 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Membresía Premium Juxtago</span>
          </div>

          <h3 className="text-3xl font-black tracking-tight text-white">JuxtaPrime</h3>
          <p className="text-sm text-white/90 font-medium mt-1">
            Envíos sin límite, tarifa de servicio al 50% y atención VIP 24/7.
          </p>
        </div>

        {/* Perks list */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <Bike className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Envíos Gratis Ilimitados</h4>
                <p className="text-xs text-slate-500">
                  En todos tus pedidos de restaurantes y supermercados superiores a {formatCOP(25000)}.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">50% Menos en Tarifa de Servicio</h4>
                <p className="text-xs text-slate-500">
                  Ahorro directo en cada checkout con prioridad en asignación de repartidores diamante.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Garantía Turbo & Devolución Express</h4>
                <p className="text-xs text-slate-500">
                  Si tu entrega Turbo tarda más de 10 minutos, tu siguiente pedido recibe $10.000 COP en créditos.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">Suscripción mensual</span>
              <span className="font-mono text-xl font-extrabold text-slate-900 tabular-nums">
                {formatCOP(19900)}
                <span className="text-xs font-normal text-slate-500"> / mes</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                Ahorra ~{formatCOP(68000)} al mes
              </span>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => {
              onTogglePrime();
              onClose();
            }}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
              isPrime
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                : 'bg-orange-600 hover:bg-orange-700 text-white active:scale-[0.98]'
            }`}
          >
            {isPrime ? (
              <span>Desactivar modo Prime de prueba</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Activar JuxtaPrime (Modo Demostración)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
