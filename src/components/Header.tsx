import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { VerticalCategory } from '../types/index.ts';

interface HeaderProps {
  currentCategory: VerticalCategory;
  onSelectCategory: (category: VerticalCategory) => void;
  cartCount: number;
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCategory,
  onSelectCategory,
  cartCount,
  onOpenCart,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => onSelectCategory('restaurants')}
            className="text-2xl font-black tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus:outline-none"
            aria-label="Juxtago Inicio"
          >
            Juxta<span className="text-orange-600">go</span>
          </button>

          {/* Zone 2: 5 concise single-line navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => onSelectCategory('restaurants')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                currentCategory === 'restaurants' ? 'text-orange-600 font-semibold border-b-2 border-orange-600' : ''
              }`}
            >
              Restaurantes
            </button>
            <button
              onClick={() => onSelectCategory('turbo')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                currentCategory === 'turbo' ? 'text-amber-600 font-semibold border-b-2 border-amber-600' : ''
              }`}
            >
              Turbo 10m
            </button>
            <button
              onClick={() => onSelectCategory('juxtafavor')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                currentCategory === 'juxtafavor' ? 'text-orange-600 font-semibold border-b-2 border-orange-600' : ''
              }`}
            >
              JuxtaFavor
            </button>
            <button
              onClick={() => onSelectCategory('juxtacoins')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                currentCategory === 'juxtacoins' ? 'text-emerald-600 font-semibold border-b-2 border-emerald-600' : ''
              }`}
            >
              JuxtaCoins
            </button>
            <button
              onClick={() => onSelectCategory('live_ops')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                currentCategory === 'live_ops' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : ''
              }`}
            >
              Operar en Vivo
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              onClick={onOpenCart}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all shadow-sm active:scale-95 whitespace-nowrap shrink-0"
              aria-label={`Ver carrito con ${cartCount} productos`}
            >
              <ShoppingBag className="w-4 h-4 text-orange-400" />
              <span>Carrito ({cartCount})</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
