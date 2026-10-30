import React, { useState } from 'react';
import { X, Star, Clock, Bike, Plus, Minus, Check, ArrowLeft } from 'lucide-react';
import { Store, MenuItem, CartItem, CartItemOption } from '../types/index.ts';
import { formatCOP } from '../utils/orderCalculation.ts';

interface StoreDetailModalProps {
  store: Store;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  isPrime: boolean;
}

export const StoreDetailModal: React.FC<StoreDetailModalProps> = ({
  store,
  onClose,
  onAddToCart,
  isPrime,
}) => {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, { choiceName: string; price: number }>>({});
  const [specialNotes, setSpecialNotes] = useState<string>('');

  // Extract menu categories
  const categories = Array.from(new Set(store.menu.map((i) => i.category)));

  const filteredItems =
    activeCategory === 'all'
      ? store.menu
      : store.menu.filter((i) => i.category === activeCategory);

  const handleOpenItem = (item: MenuItem) => {
    setSelectedItem(item);
    setItemQuantity(1);
    setSpecialNotes('');

    // Pre-select required options default
    const defaults: Record<string, { choiceName: string; price: number }> = {};
    if (item.options) {
      item.options.forEach((group) => {
        if (group.required && group.choices.length > 0) {
          defaults[group.name] = {
            choiceName: group.choices[0].name,
            price: group.choices[0].price,
          };
        }
      });
    }
    setSelectedOptions(defaults);
  };

  const calculateItemTotal = (item: MenuItem) => {
    const optionsTotal = Object.values(selectedOptions).reduce((sum, opt) => sum + opt.price, 0);
    return (item.price + optionsTotal) * itemQuantity;
  };

  const handleConfirmAddToCart = () => {
    if (!selectedItem) return;

    const optionsList: CartItemOption[] = Object.entries(selectedOptions).map(([groupName, opt]) => ({
      groupName,
      choiceName: opt.choiceName,
      price: opt.price,
    }));

    const optionsTotal = Object.values(selectedOptions).reduce((sum, opt) => sum + opt.price, 0);
    const unitPrice = selectedItem.price + optionsTotal;

    const cartItem: CartItem = {
      cartItemId: `${selectedItem.id}-${Date.now()}`,
      menuItemId: selectedItem.id,
      storeId: store.id,
      storeName: store.name,
      name: selectedItem.name,
      basePrice: selectedItem.price,
      unitPrice,
      quantity: itemQuantity,
      selectedOptions: optionsList,
      notes: specialNotes.trim() ? specialNotes.trim() : undefined,
    };

    onAddToCart(cartItem);
    setSelectedItem(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl relative">
        {/* Header Bar */}
        <div className={`p-6 bg-gradient-to-r ${store.heroColor} text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
            aria-label="Cerrar modal de tienda"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                {store.category.toUpperCase()} · {store.accentBadge || 'Verificado'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">{store.name}</h2>
              <p className="text-sm text-white/80 mt-0.5">{store.address}</p>

              {/* Badges / Metrics */}
              <div className="flex items-center gap-3 mt-3 text-xs text-white/90">
                <span className="flex items-center gap-1 font-semibold">
                  <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                  <span className="font-mono tabular-nums">{store.rating.toFixed(1)}</span>
                  <span>({store.reviewsCount} reseñas)</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono tabular-nums">{store.deliveryTimeMin} min</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Bike className="w-4 h-4" />
                  <span>{isPrime ? 'Envío Gratis (Prime)' : formatCOP(store.deliveryFee)}</span>
                </span>
              </div>
            </div>

            {store.promoBadge && (
              <div className="bg-white text-orange-600 font-bold px-3 py-1.5 rounded-xl text-xs shadow-sm self-start sm:self-end">
                {store.promoBadge}
              </div>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar bg-slate-50">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeCategory === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            Todo el Menú ({store.menu.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenItem(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleOpenItem(item);
                }}
                className="p-4 rounded-2xl border border-slate-200 hover:border-orange-300 hover:shadow-sm bg-white transition-all text-left flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors text-base">
                      {item.name}
                    </h4>
                    {item.popular && (
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full shrink-0">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-100">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                      {formatCOP(item.price)}
                    </span>
                    {item.originalPrice && (
                      <span className="text-xs line-through text-slate-400 font-mono tabular-nums">
                        {formatCOP(item.originalPrice)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenItem(item);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Item Customization Modal Sub-View */}
        {selectedItem && (
          <div className="absolute inset-0 z-20 bg-white flex flex-col animate-in slide-in-from-bottom duration-200">
            {/* Sub-view header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <button
                onClick={() => setSelectedItem(null)}
                className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver al menú</span>
              </button>
              <h3 className="font-bold text-slate-900 truncate max-w-xs">{selectedItem.name}</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                aria-label="Cerrar producto"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customizer content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">{selectedItem.name}</h3>
                <p className="text-sm text-slate-600 mt-1">{selectedItem.description}</p>
                <div className="mt-2 font-mono font-bold text-slate-900 text-lg tabular-nums">
                  {formatCOP(selectedItem.price)}
                </div>
              </div>

              {/* Option Groups (e.g. Fries, Drink, Extra Sauces) */}
              {selectedItem.options?.map((group) => (
                <div key={group.id} className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-sm text-slate-900">{group.name}</h4>
                    <span className="text-xs text-slate-500">
                      {group.required ? '(Obligatorio)' : '(Opcional)'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {group.choices.map((choice) => {
                      const isSelected = selectedOptions[group.name]?.choiceName === choice.name;
                      return (
                        <label
                          key={choice.id}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-orange-500 bg-orange-50/50'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={group.id}
                              checked={isSelected}
                              onChange={() => {
                                setSelectedOptions((prev) => ({
                                  ...prev,
                                  [group.name]: { choiceName: choice.name, price: choice.price },
                                }));
                              }}
                              className="text-orange-600 focus:ring-orange-500"
                            />
                            <span className="text-sm font-medium text-slate-800">{choice.name}</span>
                          </div>
                          <span className="font-mono text-xs font-semibold text-slate-600 tabular-nums">
                            {choice.price > 0 ? `+${formatCOP(choice.price)}` : 'Incluido'}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Special Instructions */}
              <div className="border-t border-slate-100 pt-4">
                <label className="block text-sm font-bold text-slate-900 mb-1">
                  Instrucciones especiales para la cocina
                </label>
                <textarea
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="Ej: Sin cebolla, aderezos aparte, término medio..."
                  rows={2}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>

            {/* Customizer Bottom Bar */}
            <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-4">
              {/* Stepper */}
              <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                <button
                  onClick={() => setItemQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-xs"
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-mono font-bold text-sm w-6 text-center tabular-nums">
                  {itemQuantity}
                </span>
                <button
                  onClick={() => setItemQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-xs"
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add CTA */}
              <button
                onClick={handleConfirmAddToCart}
                className="flex-1 py-3 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm flex items-center justify-between shadow-md active:scale-[0.98] transition-all"
              >
                <span>Agregar al carrito</span>
                <span className="font-mono tabular-nums">
                  {formatCOP(calculateItemTotal(selectedItem))}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
