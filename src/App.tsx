import React, { useState } from 'react';
import { Header } from './components/Header.tsx';
import { CategoryNav } from './components/CategoryNav.tsx';
import { HeroBanner } from './components/HeroBanner.tsx';
import { StoreCard } from './components/StoreCard.tsx';
import { StoreDetailModal } from './components/StoreDetailModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { LiveOrderTracker } from './components/LiveOrderTracker.tsx';
import { JuxtaFavorView } from './components/JuxtaFavorView.tsx';
import { JuxtaCoinsHub } from './components/JuxtaCoinsHub.tsx';
import { LivePlatformCenter } from './components/LivePlatformCenter.tsx';
import { JuxtaBotWidget } from './components/JuxtaBotWidget.tsx';
import { JuxtaPrimeModal } from './components/JuxtaPrimeModal.tsx';
import { AddressSelectorModal } from './components/AddressSelectorModal.tsx';
import {
  INITIAL_STORES,
  POPULAR_LOCATIONS,
  INITIAL_TRANSACTIONS,
  INITIAL_MERCHANTS,
  MOCK_COURIER,
} from './data/mockData.ts';
import {
  Store,
  MenuItem,
  CartItem,
  CartPricing,
  Order,
  OrderStatus,
  VerticalCategory,
  JuxtaActorRole,
  JuxtaCoinTransaction,
  AffiliatedMerchant,
} from './types/index.ts';
import { INITIAL_MEMORIES, UserMemoryItem } from './utils/memoryEngine.ts';
import { MapPin, Sparkles, Coins, ArrowUpRight, Bot, Rocket } from 'lucide-react';
import { formatCOP, convertCoinsToCOP } from './utils/orderCalculation.ts';

export default function App() {
  const [stores, setStores] = useState<Store[]>(INITIAL_STORES);
  const [currentCategory, setCurrentCategory] = useState<VerticalCategory>('restaurants');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedAddress, setSelectedAddress] = useState<string>(POPULAR_LOCATIONS[0]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);

  // JuxtaBot AI Assistant & User Memory State
  const [memories, setMemories] = useState<UserMemoryItem[]>(INITIAL_MEMORIES);
  const [isBotOpen, setIsBotOpen] = useState<boolean>(false);

  // JuxtaCoins Ecosystem State (Customers, Couriers, Merchants)
  const [coinBalances, setCoinBalances] = useState<Record<JuxtaActorRole, number>>({
    customer: 315,
    courier: 540,
    merchant: 2380,
  });
  const [coinTransactions, setCoinTransactions] = useState<JuxtaCoinTransaction[]>(INITIAL_TRANSACTIONS);
  const [affiliatedMerchants, setAffiliatedMerchants] = useState<AffiliatedMerchant[]>(INITIAL_MERCHANTS);

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Store modal
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  // JuxtaPrime
  const [isPrime, setIsPrime] = useState<boolean>(false);
  const [isPrimeModalOpen, setIsPrimeModalOpen] = useState<boolean>(false);

  // Checkout & Active Order
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [checkoutPricing, setCheckoutPricing] = useState<CartPricing | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState<boolean>(false);

  // JuxtaBot Memory Handlers
  const handleAddMemory = (newItem: UserMemoryItem) => {
    setMemories((prev) => [newItem, ...prev]);
  };

  const handleDeleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  // Live Merchant Menu Addition Handler
  const handleAddMenuItem = (storeId: string, newItem: MenuItem) => {
    setStores((prevStores) =>
      prevStores.map((st) =>
        st.id === storeId ? { ...st, menu: [newItem, ...st.menu] } : st
      )
    );
  };

  // Live Order Status Update from Merchant POS / Rider App
  const handleUpdateOrderStatus = (status: OrderStatus) => {
    if (!activeOrder) return;
    const progressMap: Record<OrderStatus, number> = {
      confirmed: 20,
      preparing: 50,
      on_the_way: 80,
      delivered: 100,
    };
    setActiveOrder({
      ...activeOrder,
      status,
      progressPercent: progressMap[status],
      etaMinutes: status === 'delivered' ? 0 : activeOrder.etaMinutes,
    });
  };

  const handleCreateSimulatedOrder = () => {
    const sampleStore = stores[1] || stores[0];
    const sampleDish = sampleStore.menu[0];
    const simOrder: Order = {
      id: `JXT-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: Date.now(),
      items: [
        {
          cartItemId: `sim-${Date.now()}`,
          menuItemId: sampleDish.id,
          storeId: sampleStore.id,
          storeName: sampleStore.name,
          name: sampleDish.name,
          basePrice: sampleDish.price,
          unitPrice: sampleDish.price,
          quantity: 1,
          selectedOptions: [],
        },
      ],
      pricing: {
        subtotal: sampleDish.price,
        deliveryFee: 4200,
        serviceFee: 1800,
        discount: 0,
        juxtaCoinsUsed: 0,
        juxtaCoinsDiscountCOP: 0,
        juxtaCoinsEarned: 17,
        tip: 3000,
        total: sampleDish.price + 9000,
        isFreeDelivery: false,
      },
      status: 'confirmed',
      etaMinutes: 22,
      storeName: sampleStore.name,
      deliveryAddress: selectedAddress,
      paymentMethod: 'card',
      courier: MOCK_COURIER,
      progressPercent: 20,
      customerCoinsEarned: 17,
      courierCoinsEarned: 38,
      merchantCoinsEarned: 24,
    };
    handleOrderPlaced(simOrder, false);
  };

  // JuxtaCoins Handlers
  const handleRedeemCash = (
    role: JuxtaActorRole,
    coinsAmount: number,
    payoutMethod: string,
    accountDestination: string
  ) => {
    const copAmount = convertCoinsToCOP(coinsAmount);
    setCoinBalances((prev) => ({
      ...prev,
      [role]: Math.max(0, prev[role] - coinsAmount),
    }));

    const newTx: JuxtaCoinTransaction = {
      id: `tx-cash-${Date.now()}`,
      role,
      title: `Canje por Dinero Real (${payoutMethod})`,
      subtitle: `Transferido a ${accountDestination}`,
      type: 'redeemed_cash',
      coins: coinsAmount,
      copAmount,
      timestamp: 'Justo ahora',
      payoutMethod,
    };

    setCoinTransactions((prev) => [newTx, ...prev]);
  };

  const handleEarnBonusCoins = (
    role: JuxtaActorRole,
    coinsAmount: number,
    title: string,
    subtitle: string
  ) => {
    const copAmount = convertCoinsToCOP(coinsAmount);
    setCoinBalances((prev) => ({
      ...prev,
      [role]: prev[role] + coinsAmount,
    }));

    const newTx: JuxtaCoinTransaction = {
      id: `tx-earn-${Date.now()}`,
      role,
      title,
      subtitle,
      type: 'earned',
      coins: coinsAmount,
      copAmount,
      timestamp: 'Justo ahora',
    };

    setCoinTransactions((prev) => [newTx, ...prev]);
  };

  const handleRegisterMerchant = (
    businessName: string,
    category: string,
    city: string,
    contactPhone: string
  ) => {
    const welcomeCoins = 2500;
    const newMerchant: AffiliatedMerchant = {
      id: `merch-${Date.now()}`,
      businessName,
      category,
      city,
      contactPhone,
      coinsBalance: welcomeCoins,
      welcomeBonusClaimed: true,
      joinedAt: 'Hoy · Recién vinculado',
    };

    setAffiliatedMerchants((prev) => [newMerchant, ...prev]);
    handleEarnBonusCoins(
      'merchant',
      welcomeCoins,
      `Bono Vinculación: ${businessName}`,
      `Nuevo comercio aliado en ${city} (${category})`
    );
  };

  // Add item to cart
  const handleAddToCart = (item: CartItem) => {
    setCartItems((prev) => {
      if (prev.length > 0 && prev[0].storeId !== item.storeId) {
        return [item];
      }
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
    } else {
      setCartItems((prev) =>
        prev.map((i) => (i.cartItemId === cartItemId ? { ...i, quantity: newQuantity } : i))
      );
    }
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleProceedToCheckout = (pricing: CartPricing) => {
    setCheckoutPricing(pricing);
    setSelectedStore(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderPlaced = (order: Order, openTrackerModal: boolean = true) => {
    setActiveOrder(order);
    setSelectedStore(null);
    setIsCheckoutOpen(false);
    setCartItems([]);
    if (openTrackerModal) {
      setIsTrackerOpen(true);
    }

    const usedCoins = order.pricing.juxtaCoinsUsed || 0;
    const custEarned = order.customerCoinsEarned || 0;
    const courEarned = order.courierCoinsEarned || 0;
    const merchEarned = order.merchantCoinsEarned || 0;

    setCoinBalances((prev) => ({
      customer: Math.max(0, prev.customer - usedCoins + custEarned),
      courier: prev.courier + courEarned,
      merchant: prev.merchant + merchEarned,
    }));

    const newTxs: JuxtaCoinTransaction[] = [];
    if (usedCoins > 0) {
      newTxs.push({
        id: `tx-use-${Date.now()}`,
        role: 'customer',
        title: `Pago con JuxtaCoins en ${order.storeName}`,
        subtitle: `Pedido ${order.id}`,
        type: 'used_in_order',
        coins: usedCoins,
        copAmount: convertCoinsToCOP(usedCoins),
        timestamp: 'Justo ahora',
      });
    }
    if (custEarned > 0) {
      newTxs.push({
        id: `tx-cearn-${Date.now() + 1}`,
        role: 'customer',
        title: `Cashback Pedido ${order.storeName}`,
        subtitle: `Pedido ${order.id} acreditado`,
        type: 'earned',
        coins: custEarned,
        copAmount: convertCoinsToCOP(custEarned),
        timestamp: 'Justo ahora',
      });
    }
    if (courEarned > 0) {
      newTxs.push({
        id: `tx-rearn-${Date.now() + 2}`,
        role: 'courier',
        title: `Comisión JuxtaCoins Domicilio ${order.id}`,
        subtitle: `Ruta hacia ${order.deliveryAddress}`,
        type: 'earned',
        coins: courEarned,
        copAmount: convertCoinsToCOP(courEarned),
        timestamp: 'Justo ahora',
      });
    }
    if (merchEarned > 0) {
      newTxs.push({
        id: `tx-mearn-${Date.now() + 3}`,
        role: 'merchant',
        title: `Retorno Comercio Aliado: ${order.storeName}`,
        subtitle: `Orden ${order.id} despachada a tiempo`,
        type: 'earned',
        coins: merchEarned,
        copAmount: convertCoinsToCOP(merchEarned),
        timestamp: 'Justo ahora',
      });
    }

    if (newTxs.length > 0) {
      setCoinTransactions((prev) => [...newTxs, ...prev]);
    }
  };

  // Filter stores
  const filteredStores = stores.filter((store) => {
    const categoryMatch =
      currentCategory === 'turbo'
        ? store.isTurbo
        : currentCategory === 'restaurants'
        ? store.category === 'restaurants'
        : store.category === currentCategory;

    if (!categoryMatch) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inName = store.name.toLowerCase().includes(q);
      const inTags = store.tags.some((t) => t.toLowerCase().includes(q));
      const inMenu = store.menu.some(
        (m) => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)
      );
      if (!inName && !inTags && !inMenu) return false;
    }

    if (activeFilter === 'free_delivery' && !isPrime && store.deliveryFee > 0) return false;
    if (activeFilter === 'turbo_speed' && store.deliveryTimeMin > 20) return false;
    if (activeFilter === 'top_rated' && store.rating < 4.8) return false;
    if (activeFilter === 'promos' && !store.promoBadge) return false;

    return true;
  });

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-orange-500 selection:text-white">
      {/* Top Bar Contract Compliant Header */}
      <Header
        currentCategory={currentCategory}
        onSelectCategory={setCurrentCategory}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Workspace Utility Bar */}
      <div className="bg-white border-b border-slate-200 py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsAddressModalOpen(true)}
              className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <span className="truncate max-w-[220px] sm:max-w-[280px]">{selectedAddress}</span>
            </button>

            <button
              onClick={() => setIsPrimeModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                isPrime
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{isPrime ? 'JuxtaPrime Activo (10% JXC)' : 'Activar JuxtaPrime'}</span>
            </button>

            <button
              onClick={() => setIsBotOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 font-semibold rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 transition-colors whitespace-nowrap shrink-0"
            >
              <Bot className="w-3.5 h-3.5 text-orange-600" />
              <span>JuxtaBot Memoria ({memories.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentCategory('live_ops')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-semibold whitespace-nowrap shrink-0 transition-colors"
            >
              <Rocket className="w-3.5 h-3.5 text-indigo-600" />
              <span>Consolas Cliente · Negocio · Rider</span>
            </button>

            <button
              onClick={() => setCurrentCategory('juxtacoins')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition-colors font-semibold whitespace-nowrap shrink-0"
            >
              <Coins className="w-4 h-4 text-emerald-600" />
              <span className="font-mono font-bold tabular-nums">
                {coinBalances.customer} JuxtaCoins ({formatCOP(convertCoinsToCOP(coinBalances.customer))})
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Active Order Strip */}
      {activeOrder && (
        <div className="bg-slate-900 text-white px-4 py-2.5 border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Pedido activo en camino:</span>
              <span className="text-orange-400 font-bold">{activeOrder.storeName}</span>
              <span className="hidden sm:inline text-slate-300">
                · Estado: {activeOrder.status} · +{activeOrder.customerCoinsEarned} JXC Cliente · +{activeOrder.courierCoinsEarned} JXC Domiciliario
              </span>
            </div>
            <button
              onClick={() => setIsTrackerOpen(true)}
              className="text-orange-400 hover:text-orange-300 font-bold underline cursor-pointer"
            >
              Ver mapa en vivo →
            </button>
          </div>
        </div>
      )}

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Category Selector Grid */}
        <div className="mb-6">
          <CategoryNav
            currentCategory={currentCategory}
            onSelectCategory={setCurrentCategory}
          />
        </div>

        {/* View Switch */}
        {currentCategory === 'live_ops' ? (
          <LivePlatformCenter
            stores={stores}
            onAddMenuItem={handleAddMenuItem}
            activeOrder={activeOrder}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onCreateSimulatedOrder={handleCreateSimulatedOrder}
            onNavigateToCustomerApp={() => setCurrentCategory('restaurants')}
          />
        ) : currentCategory === 'juxtacoins' ? (
          <JuxtaCoinsHub
            balances={coinBalances}
            transactions={coinTransactions}
            merchants={affiliatedMerchants}
            onRedeemCash={handleRedeemCash}
            onEarnBonusCoins={handleEarnBonusCoins}
            onRegisterMerchant={handleRegisterMerchant}
          />
        ) : currentCategory === 'juxtafavor' ? (
          <JuxtaFavorView
            defaultPickupAddress={selectedAddress}
            onOrderPlaced={(ord) => handleOrderPlaced(ord, true)}
          />
        ) : (
          <>
            <HeroBanner
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              currentCategory={currentCategory}
              onSelectCategory={setCurrentCategory}
            />

            <section className="mt-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {currentCategory === 'turbo'
                      ? 'Micro-Almacenes Turbo (Menos de 10 min)'
                      : currentCategory === 'supermarket'
                      ? 'Supermercados y Despensa Fresca'
                      : currentCategory === 'pharmacy'
                      ? 'Farmacias y Salud 24 Horas'
                      : 'Restaurantes Destacados'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {filteredStores.length}{' '}
                    {filteredStores.length === 1 ? 'establecimiento disponible' : 'establecimientos disponibles'} · Todos otorgan JuxtaCoins canjeables por dinero real
                  </p>
                </div>
              </div>

              {filteredStores.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                  <p className="text-sm font-bold text-slate-700">No encontramos resultados para tu búsqueda</p>
                  <p className="text-xs text-slate-500 mt-1">Intenta con otros términos o cambia el filtro de búsqueda.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveFilter('all');
                    }}
                    className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
                  >
                    Restablecer filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredStores.map((store) => (
                    <StoreCard
                      key={store.id}
                      store={store}
                      onSelect={setSelectedStore}
                      isPrime={isPrime}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-16 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-sm">Juxtago</span>
            <span>—</span>
            <span>Super-App con JuxtaBot AI y JuxtaCoins canjeables por dinero real</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <button onClick={() => setCurrentCategory('juxtacoins')} className="hover:text-slate-900">
              Billetera JuxtaCoins
            </button>
            <span>·</span>
            <button onClick={() => setCurrentCategory('live_ops')} className="hover:text-slate-900">
              POS Negocios & App Rider
            </button>
            <span>·</span>
            <button onClick={() => setIsBotOpen(true)} className="hover:text-slate-900">
              JuxtaBot Memoria
            </button>
          </div>
        </div>
      </footer>

      {/* JuxtaBot AI Assistant Widget with Memory Vault */}
      <JuxtaBotWidget
        isOpen={isBotOpen}
        onToggle={() => setIsBotOpen(!isBotOpen)}
        memories={memories}
        onAddMemory={handleAddMemory}
        onDeleteMemory={handleDeleteMemory}
        coinBalances={coinBalances}
        selectedAddress={selectedAddress}
      />

      {/* Modals & Drawers */}
      {selectedStore && (
        <StoreDetailModal
          store={selectedStore}
          onClose={() => setSelectedStore(null)}
          onAddToCart={handleAddToCart}
          isPrime={isPrime}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={handleProceedToCheckout}
        isPrime={isPrime}
        baseDeliveryFee={cartItems.length > 0 ? 3800 : 0}
        deliveryAddress={selectedAddress}
        availableCustomerCoins={coinBalances.customer}
      />

      {checkoutPricing && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          items={cartItems}
          pricing={checkoutPricing}
          deliveryAddress={selectedAddress}
          onOrderPlaced={(ord) => handleOrderPlaced(ord, true)}
        />
      )}

      {activeOrder && isTrackerOpen && (
        <LiveOrderTracker
          order={activeOrder}
          onClose={() => setIsTrackerOpen(false)}
          onUpdateOrder={setActiveOrder}
          onOpenCoinsHub={() => {
            setIsTrackerOpen(false);
            setCurrentCategory('juxtacoins');
          }}
        />
      )}

      <JuxtaPrimeModal
        isOpen={isPrimeModalOpen}
        onClose={() => setIsPrimeModalOpen(false)}
        isPrime={isPrime}
        onTogglePrime={() => setIsPrime(!isPrime)}
      />

      <AddressSelectorModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        selectedAddress={selectedAddress}
        onSelectAddress={setSelectedAddress}
      />
    </div>
  );
}
