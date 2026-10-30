import React from 'react';
import { Utensils, Zap, ShoppingCart, Cross, PackageCheck, Coins } from 'lucide-react';
import { VerticalCategory } from '../types/index.ts';

interface CategoryNavProps {
  currentCategory: VerticalCategory;
  onSelectCategory: (category: VerticalCategory) => void;
}

const CATEGORIES: Array<{
  id: VerticalCategory;
  name: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}> = [
  {
    id: 'restaurants',
    name: 'Restaurantes',
    tagline: 'Gourmet, smash & artesanal',
    icon: Utensils,
  },
  {
    id: 'turbo',
    name: 'Turbo 10 Min',
    tagline: 'Entrega en < 10 min garantizado',
    icon: Zap,
    badge: '10 min',
  },
  {
    id: 'supermarket',
    name: 'Supermercado',
    tagline: 'Despensa completa y frescos',
    icon: ShoppingCart,
  },
  {
    id: 'pharmacy',
    name: 'Farmacia 24/7',
    tagline: 'Medicamentos y botiquín exprés',
    icon: Cross,
  },
  {
    id: 'juxtafavor',
    name: 'JuxtaFavor',
    tagline: 'Pide lo que sea · Mensajería',
    icon: PackageCheck,
  },
  {
    id: 'juxtacoins',
    name: 'JuxtaCoins',
    tagline: 'Canjea puntos por dinero real',
    icon: Coins,
    badge: '1 JXC = $100',
  },
];

export const CategoryNav: React.FC<CategoryNavProps> = ({
  currentCategory,
  onSelectCategory,
}) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = currentCategory === cat.id;
          const isCoins = cat.id === 'juxtacoins';
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
                isActive
                  ? isCoins
                    ? 'border-emerald-600 bg-white shadow-sm ring-1 ring-emerald-600'
                    : 'border-orange-500 bg-white shadow-sm ring-1 ring-orange-500'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    isActive
                      ? isCoins
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-orange-50 text-orange-600'
                      : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {cat.badge && (
                  <span className="text-[11px] font-mono font-semibold text-slate-600">
                    {cat.badge}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-0.5 whitespace-nowrap truncate">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-500 truncate">{cat.tagline}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
