import React from 'react';
import { Search, Zap, Clock, ShieldCheck } from 'lucide-react';
import { VerticalCategory } from '../types/index.ts';

interface HeroBannerProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeFilter: string;
  onFilterChange: (f: string) => void;
  currentCategory: VerticalCategory;
  onSelectCategory: (cat: VerticalCategory) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  currentCategory,
}) => {
  const getBannerConfig = () => {
    switch (currentCategory) {
      case 'turbo':
        return {
          title: 'JuxtaTurbo ⚡ Entrega en 10 Minutos',
          desc: 'Nuestra red de micro-almacenes hiperlocales lleva bebidas frías, snacks, hielo y despensa a tu puerta en minutos récord.',
          accent: 'from-amber-600 via-orange-600 to-amber-700',
          badge: 'Garantía < 10 mins',
        };
      case 'supermarket':
        return {
          title: 'Supermercado Fresco & Completo',
          desc: 'Carnes prémium maduradas, verduras del campo seleccionadas a mano y despensa con sustitutos inteligentes.',
          accent: 'from-emerald-700 via-teal-700 to-slate-900',
          badge: 'Frescura Certificada',
        };
      case 'pharmacy':
        return {
          title: 'Farmacia 24/7 & Cuidado Personal',
          desc: 'Medicamentos de venta libre, botiquín de emergencia, dermocosmética y cuidado del bebé entregados con máxima discreción.',
          accent: 'from-cyan-700 via-blue-800 to-slate-900',
          badge: 'Atención 24 Horas',
        };
      case 'juxtafavor':
        return {
          title: 'JuxtaFavor: Pide lo que sea',
          desc: 'Repartidores dedicados en moto eléctrica para recoger tus llaves, llevar paquetes urgentes o hacer tus mandados.',
          accent: 'from-indigo-800 via-purple-900 to-slate-950',
          badge: 'Mensajería Express',
        };
      default:
        return {
          title: 'Lo mejor de tu ciudad, a minutos de tu puerta',
          desc: 'Descubre los mejores restaurantes de autor, smash burgers, sushi fresco y comida italiana sin esperas.',
          accent: 'from-slate-900 via-slate-800 to-orange-950',
          badge: 'Juxtago Delivery',
        };
    }
  };

  const config = getBannerConfig();

  return (
    <div className="w-full mb-8">
      {/* Visual Hero Container */}
      <div className={`rounded-3xl p-6 sm:p-10 bg-gradient-to-r ${config.accent} text-white shadow-lg relative overflow-hidden`}>
        {/* Abstract background grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-pattern)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold mb-3 border border-white/20">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>{config.badge}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            {config.title}
          </h1>

          <p className="text-xs sm:text-sm text-white/80 mt-2 sm:mt-3 leading-relaxed max-w-xl">
            {config.desc}
          </p>

          {/* Interactive Search Bar */}
          <div className="mt-6 flex items-center bg-white rounded-2xl p-1.5 shadow-xl border border-white/40 max-w-lg">
            <div className="pl-3 text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por restaurante, hamburguesas, sushi, cerveza fría..."
              className="w-full px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Claim-to-proof proof strip */}
        <div className="relative z-10 mt-8 pt-6 border-t border-white/15 grid grid-cols-3 gap-4 text-xs text-white/90">
          <div>
            <span className="font-mono font-bold text-base block text-amber-300 tabular-nums">10 min</span>
            <span className="text-[11px] text-white/70">Promedio Turbo Express</span>
          </div>
          <div>
            <span className="font-mono font-bold text-base block text-white tabular-nums">4.9 ★</span>
            <span className="text-[11px] text-white/70">Satisfacción en entregas</span>
          </div>
          <div>
            <span className="font-mono font-bold text-base block text-emerald-300 tabular-nums">100%</span>
            <span className="text-[11px] text-white/70">Flota eléctrica & rápida</span>
          </div>
        </div>
      </div>

      {/* Filter Segmented Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-3 mt-2">
        {[
          { id: 'all', label: 'Todos los locales' },
          { id: 'free_delivery', label: 'Envío Gratis' },
          { id: 'turbo_speed', label: '⚡ Menos de 20 min' },
          { id: 'top_rated', label: '★ Top 4.8+' },
          { id: 'promos', label: 'Con Promoción' },
        ].map((f) => {
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
