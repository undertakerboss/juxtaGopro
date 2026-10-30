import React from 'react';
import { Star, Clock, Bike, Zap, Coins } from 'lucide-react';
import { Store } from '../types/index.ts';
import { formatCOP, calculateCustomerEarnedCoins } from '../utils/orderCalculation.ts';

interface StoreCardProps {
  store: Store;
  onSelect: (store: Store) => void;
  isPrime: boolean;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store, onSelect, isPrime }) => {
  const sampleItemPrice = store.menu[0]?.price || 25000;
  const estimatedCoins = calculateCustomerEarnedCoins(sampleItemPrice, isPrime, !!store.isTurbo);

  return (
    <div
      onClick={() => onSelect(store)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(store);
        }
      }}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-md transition-all cursor-pointer flex flex-col group text-left"
    >
      {/* Visual Header / Banner Showcase */}
      <div className={`h-40 relative bg-gradient-to-br ${store.heroColor} p-4 flex flex-col justify-between overflow-hidden`}>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`pat-${store.id}`} width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="15" cy="15" r="1.5" fill="#ffffff" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#pat-${store.id})`} />
          </svg>
        </div>

        {/* Top single subtle tag */}
        <div className="relative z-10 flex items-center justify-between">
          {store.isTurbo ? (
            <span className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-1 rounded shadow-sm">
              <Zap className="w-3.5 h-3.5 fill-current" />
              TURBO 10 MIN
            </span>
          ) : (
            <span className="text-xs font-semibold text-white/90 bg-black/25 backdrop-blur-sm px-2.5 py-1 rounded">
              {store.accentBadge || 'Comercio Vinculado'}
            </span>
          )}

          <span className="text-xs font-mono font-bold text-amber-200 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded tabular-nums">
            +{estimatedCoins} JXC
          </span>
        </div>

        {/* Bottom Store Title Overlay */}
        <div className="relative z-10 text-white">
          <h3 className="text-xl font-bold tracking-tight drop-shadow-sm group-hover:translate-x-0.5 transition-transform">
            {store.name}
          </h3>
          <p className="text-xs text-white/80 truncate mt-0.5">{store.address}</p>
        </div>
      </div>

      {/* Store Body & Metadata (Clean inline unboxed metadata) */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
            <span className="flex items-center gap-1 font-bold text-slate-900">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-mono tabular-nums">{store.rating.toFixed(1)}</span>
              <span className="text-slate-400 font-normal">({store.reviewsCount})</span>
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono tabular-nums">{store.deliveryTimeMin} min</span>
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="flex items-center gap-1">
              <Bike className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono tabular-nums font-semibold">
                {isPrime ? (
                  <span className="text-emerald-600 font-bold">Envío Gratis</span>
                ) : (
                  formatCOP(store.deliveryFee)
                )}
              </span>
            </span>
          </div>

          {/* Tags separated by middot */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mb-3">
            {store.tags.map((tag, idx) => (
              <React.Fragment key={tag}>
                <span>{tag}</span>
                {idx < store.tags.length - 1 && <span aria-hidden="true" className="text-slate-300">·</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Featured dish & JuxtaCoins reward teaser */}
        <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
          <span className="text-slate-600 truncate max-w-[165px]">
            {store.menu[0]?.name}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono text-[11px] font-bold text-emerald-700 tabular-nums">
              +{estimatedCoins} JXC
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="font-mono font-bold text-slate-900 tabular-nums">
              {formatCOP(store.menu[0]?.price || 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
