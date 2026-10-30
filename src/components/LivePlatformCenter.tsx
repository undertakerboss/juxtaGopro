import React, { useState } from 'react';
import {
  Store as StoreIcon,
  Bike,
  Rocket,
  Plus,
  CheckCircle2,
  Copy,
  Smartphone,
  CreditCard,
  Database,
  Globe,
  Clock,
  ArrowRight,
  Coins,
} from 'lucide-react';
import { Store, MenuItem, Order, OrderStatus } from '../types/index.ts';
import { formatCOP, convertCoinsToCOP } from '../utils/orderCalculation.ts';

interface LivePlatformCenterProps {
  stores: Store[];
  onAddMenuItem: (storeId: string, newItem: MenuItem) => void;
  activeOrder: Order | null;
  onUpdateOrderStatus: (status: OrderStatus) => void;
  onCreateSimulatedOrder: () => void;
  onNavigateToCustomerApp: () => void;
}

export const LivePlatformCenter: React.FC<LivePlatformCenterProps> = ({
  stores,
  onAddMenuItem,
  activeOrder,
  onUpdateOrderStatus,
  onCreateSimulatedOrder,
  onNavigateToCustomerApp,
}) => {
  const [activeConsole, setActiveConsole] = useState<'merchant_pos' | 'rider_app' | 'launch_guide'>('launch_guide');
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  // Merchant POS New Dish state
  const [selectedStoreId, setSelectedStoreId] = useState<string>(stores[0]?.id || 'rest-burger');
  const [dishName, setDishName] = useState<string>('');
  const [dishDesc, setDishDesc] = useState<string>('');
  const [dishPrice, setDishPrice] = useState<string>('28900');
  const [dishCategory, setDishCategory] = useState<string>('Especiales del Día');
  const [dishSuccess, setDishSuccess] = useState<string>('');

  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://juxtago.app';

  const handleCopyUrl = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
    }
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handlePublishDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) return;

    const numericPrice = Math.max(2000, parseInt(dishPrice, 10) || 25000);
    const newItem: MenuItem = {
      id: `item-live-${Date.now()}`,
      storeId: selectedStoreId,
      name: dishName.trim(),
      description:
        dishDesc.trim() || 'Preparado al instante con ingredientes frescos seleccionados.',
      price: numericPrice,
      category: dishCategory.trim() || 'Especiales',
      popular: true,
      accentColor: '#EA580C',
      prepTimeMin: 15,
    };

    onAddMenuItem(selectedStoreId, newItem);
    const targetStore = stores.find((s) => s.id === selectedStoreId);
    setDishSuccess(
      `¡"${newItem.name}" (${formatCOP(numericPrice)}) publicado en vivo en ${targetStore?.name}! Ya está disponible para que los clientes lo pidan.`
    );
    setDishName('');
    setDishDesc('');
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="rounded-3xl p-6 sm:p-10 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400 block mb-2">
              Plataforma Multi-Actor en Tiempo Real
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-balance">
              Cómo operar Juxtago en la vida real con Clientes, Negocios y Domiciliarios
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
              Juxtago funciona con <strong className="text-white">3 portales sincronizados</strong> sobre la misma plataforma: la <strong className="text-white">App Cliente</strong> para pedir, el <strong className="text-white">POS Comercio Aliado</strong> para subir productos y despachar en cocina, y la <strong className="text-white">App JuxtaRider</strong> para que el domiciliario tome el pedido y cobre en efectivo o JuxtaCoins.
            </p>
          </div>

          {/* Shareable Live URL Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 shrink-0 min-w-[280px]">
            <span className="text-xs font-bold text-emerald-300 block">
              Enlace Web / PWA Instalable Activo
            </span>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Comparte este link con clientes, negocios y domiciliarios para abrir Juxtago en su celular:
            </p>
            <div className="mt-3 flex items-center gap-2 bg-black/40 p-2 rounded-xl border border-white/10">
              <span className="font-mono text-xs text-white truncate max-w-[180px]">
                {shareUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="ml-auto px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1 shrink-0 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedUrl ? '¡Copiado!' : 'Copiar Link'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Console Switcher Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setActiveConsole('launch_guide')}
          className={`p-4 rounded-xl text-left transition-all flex items-center gap-3 ${
            activeConsole === 'launch_guide'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'hover:bg-slate-50 text-slate-700'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              activeConsole === 'launch_guide'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-50 text-orange-600'
            }`}
          >
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-extrabold block">1. Guía de Lanzamiento Real</span>
            <span
              className={`text-xs ${
                activeConsole === 'launch_guide' ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              Pagos reales, PWA móvil y operación comercial
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveConsole('merchant_pos')}
          className={`p-4 rounded-xl text-left transition-all flex items-center gap-3 ${
            activeConsole === 'merchant_pos'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'hover:bg-slate-50 text-slate-700'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              activeConsole === 'merchant_pos'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-amber-50 text-amber-700'
            }`}
          >
            <StoreIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-extrabold block">2. Consola POS Negocios</span>
            <span
              className={`text-xs ${
                activeConsole === 'merchant_pos' ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              Publicar platos en vivo y despachar cocina
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveConsole('rider_app')}
          className={`p-4 rounded-xl text-left transition-all flex items-center gap-3 ${
            activeConsole === 'rider_app'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'hover:bg-slate-50 text-slate-700'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              activeConsole === 'rider_app'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            <Bike className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-extrabold block">3. App Domiciliarios (Rider)</span>
            <span
              className={`text-xs ${
                activeConsole === 'rider_app' ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              Aceptar rutas, entregar y cobrar JuxtaCoins
            </span>
          </div>
        </button>
      </div>

      {/* CONSOLE 1: REAL-WORLD LAUNCH BLUEPRINT */}
      {activeConsole === 'launch_guide' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Paso 1: Distribución Móvil sin fricción */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-orange-600">
                  01. DISTRIBUCIÓN EN CELULARES (ANDROID & IPHONE)
                </span>
                <Smartphone className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Instalación inmediata como Web-App (PWA) + Tiendas
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                No necesitas esperar meses en App Store o Google Play para salir al mercado en tu ciudad:
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li>
                  • <strong>Clientes:</strong> Entran al link desde su celular o código QR en mesas de restaurantes y tocan <em>"Agregar a pantalla de inicio"</em>.
                </li>
                <li>
                  • <strong>Comerciantes:</strong> Abren la <strong>Consola POS Negocios</strong> en una tablet o computador en caja para recibir pedidos con alerta sonora y subir su menú.
                </li>
                <li>
                  • <strong>Domiciliarios:</strong> Usan la vista <strong>App Domiciliarios</strong> en su smartphone para aceptar encargos y liquidar sus JuxtaCoins por Nequi/Daviplata.
                </li>
              </ul>
            </div>

            {/* Paso 2: Pagos Reales y Dispersión de JuxtaCoins */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-600">
                  02. PASARELA DE PAGOS Y DISPERSIÓN DE DINERO REAL
                </span>
                <CreditCard className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Cobro a Clientes y Retiro de JuxtaCoins (Nequi / PSE / Wompi)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Para mover dinero real en Colombia o Latinoamérica de forma legal y automatizada:
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li>
                  • <strong>Recaudo de Pedidos:</strong> Conecta una cuenta comercio de <strong>Wompi (Bancolombia)</strong>, <strong>MercadoPago</strong> o <strong>ePayco</strong> para recibir PSE, Nequi, Tarjetas y Efectivo.
                </li>
                <li>
                  • <strong>Fondo de Liquidez JuxtaCoins:</strong> Del 18%–22% de comisión que cobra la plataforma al restaurante aliado, destinas un 4%–5% a respaldar los <strong>JuxtaCoins (1 JXC = $100 COP)</strong>.
                </li>
                <li>
                  • <strong>Desembolsos:</strong> Usa dispersiones masivas ACH / Transfiya para pagar cada semana o al instante los canjes de JuxtaCoins.
                </li>
              </ul>
            </div>

            {/* Paso 3: Base de Datos y Tiempo Real */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-600">
                  03. BASE DE DATOS EN LA NUBE & MEMORIA JUXTABOT
                </span>
                <Database className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Persistencia Multi-Usuario (Firebase / PostgreSQL)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Para que miles de usuarios, restaurantes y domiciliarios vean los pedidos sincronizados en distintos dispositivos:
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li>
                  • <strong>Autenticación por Rol:</strong> Registro con número de celular (OTP WhatsApp/SMS) asignando perfil <code>customer</code>, <code>merchant</code> o <code>courier</code>.
                </li>
                <li>
                  • <strong>Memoria JuxtaBot con Gemini API:</strong> Ya está conectada en <code>/api/juxtabot/chat</code> guardando preferencias, alergias y direcciones por usuario.
                </li>
              </ul>
            </div>

            {/* Paso 4: Estrategia de Lanzamiento Hiperlocal */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-600">
                  04. ESTRATEGIA DE LANZAMIENTO EN TU CIUDAD
                </span>
                <Globe className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Cómo ganarle a Rappi empezando por un barrio clave
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                El secreto para escalar Juxtago sin quemar capital es concentrar la densidad en una zona gastronómica (ej. 3 km a la redonda):
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li>
                  • <strong>Vincula 15 restaurantes ancla</strong> ofreciéndoles el bono de <strong>+2.500 JuxtaCoins</strong> y menor comisión que la competencia.
                </li>
                <li>
                  • <strong>Activa 10 domiciliarios base</strong> garantizándoles el 100% de sus propinas + JuxtaCoins canjeables por dinero real sin costo de retiro.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* CONSOLE 2: MERCHANT POS CONSOLE */}
      {activeConsole === 'merchant_pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Live Menu Publisher (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Autogestión de Comerciantes
              </span>
              <h2 className="text-lg font-black text-slate-900">
                Publicar Nuevo Producto en el Catálogo en Vivo
              </h2>
              <p className="text-xs text-slate-500">
                Cualquier plato o producto que agregues aquí aparece de inmediato en la tienda para que los clientes lo compren.
              </p>
            </div>

            <form onSubmit={handlePublishDish} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Seleccionar Comercio Aliado
                  </label>
                  <select
                    value={selectedStoreId}
                    onChange={(e) => setSelectedStoreId(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-orange-500"
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Categoría en el Menú
                  </label>
                  <input
                    type="text"
                    value={dishCategory}
                    onChange={(e) => setDishCategory(e.target.value)}
                    placeholder="Ej: Hamburguesas, Bebidas, Promos"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre del Plato o Producto
                  </label>
                  <input
                    type="text"
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    placeholder="Ej: Combo Hamburguesa JuxtaGold + Papas"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Precio ($ COP)
                  </label>
                  <input
                    type="number"
                    value={dishPrice}
                    onChange={(e) => setDishPrice(e.target.value)}
                    className="w-full font-mono text-xs p-3 rounded-xl border border-slate-200 outline-none focus:border-orange-500 tabular-nums"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descripción e Ingredientes
                </label>
                <textarea
                  value={dishDesc}
                  onChange={(e) => setDishDesc(e.target.value)}
                  rows={2}
                  placeholder="Describe los ingredientes para que JuxtaBot también pueda recomendarlo..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 outline-none focus:border-orange-500"
                />
              </div>

              {dishSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center justify-between gap-2">
                  <span>{dishSuccess}</span>
                  <button
                    type="button"
                    onClick={onNavigateToCustomerApp}
                    className="text-emerald-900 underline font-bold shrink-0"
                  >
                    Ver en tienda →
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Publicar Producto en el Catálogo en Vivo</span>
              </button>
            </form>
          </div>

          {/* Right: Incoming Kitchen Orders (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">
                Comandas de Cocina en Vivo
              </h3>
              <Clock className="w-4 h-4 text-orange-600" />
            </div>

            {!activeOrder ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <p className="text-xs font-bold text-slate-700">
                  No hay comandas en preparación en este instante
                </p>
                <p className="text-[11px] text-slate-500">
                  Puedes hacer un pedido desde la vista de Cliente o generar una comanda de prueba aquí mismo:
                </p>
                <button
                  type="button"
                  onClick={onCreateSimulatedOrder}
                  className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Simular Pedido Entrante de Cliente
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-orange-200 bg-orange-50/40 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-orange-700">
                    ORDEN #{activeOrder.id}
                  </span>
                  <span className="font-bold uppercase text-slate-800">
                    Estado: {activeOrder.status}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">{activeOrder.storeName}</span>
                  <span className="text-slate-600 block mt-0.5">
                    Destino: {activeOrder.deliveryAddress}
                  </span>
                </div>
                <div className="border-t border-orange-200/70 pt-2 space-y-1">
                  {activeOrder.items.map((it) => (
                    <div key={it.cartItemId} className="flex justify-between font-medium">
                      <span>
                        {it.quantity}x {it.name}
                      </span>
                      <span className="font-mono tabular-nums">
                        {formatCOP(it.unitPrice * it.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateOrderStatus('preparing')}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                  >
                    Pasar a Cocina
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateOrderStatus('on_the_way')}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
                  >
                    Entregar a Rider →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONSOLE 3: RIDER / DOMICILIARIO APP */}
      {activeConsole === 'rider_app' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Terminal JuxtaRider · Carlos Mendoza (Moto Eléctrica JXT-88E)
              </span>
              <h2 className="text-lg font-black text-slate-900">
                Despacho de Rutas y Liquidación de Domicilios
              </h2>
            </div>
            {!activeOrder && (
              <button
                type="button"
                onClick={onCreateSimulatedOrder}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors self-start"
              >
                Recibir Nuevo Pedido en Ruta
              </button>
            )}
          </div>

          {!activeOrder ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-sm font-bold text-slate-800">
                Radar GPS activo buscando pedidos cercanos en Zona T y Chicó Norte
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Haz clic en "Recibir Nuevo Pedido en Ruta" o realiza una compra desde Restaurantes para ver cómo llega al domiciliario.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-slate-900">
                    Ruta Activa: {activeOrder.id}
                  </span>
                  <span className="font-mono font-bold text-emerald-700 tabular-nums">
                    Ganancia Rider: +{activeOrder.courierCoinsEarned} JXC ({formatCOP(convertCoinsToCOP(activeOrder.courierCoinsEarned))}) + Propina {formatCOP(activeOrder.pricing.tip)}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div>
                    <span className="text-slate-400 block">1. Recoger en comercio:</span>
                    <span className="font-bold text-slate-900 text-sm">{activeOrder.storeName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">2. Entregar a cliente en:</span>
                    <span className="font-bold text-slate-900 text-sm">{activeOrder.deliveryAddress}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 block">
                  Actualizar estado GPS del domiciliario:
                </span>
                <div className="grid grid-cols-2 gap-2.5 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => onUpdateOrderStatus('preparing')}
                    className={`p-3 rounded-xl border ${
                      activeOrder.status === 'preparing'
                        ? 'border-orange-600 bg-orange-50 text-orange-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    Llegué al Restaurante
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateOrderStatus('on_the_way')}
                    className={`p-3 rounded-xl border ${
                      activeOrder.status === 'on_the_way'
                        ? 'border-orange-600 bg-orange-50 text-orange-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    En Camino al Cliente
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateOrderStatus('delivered')}
                    className={`col-span-2 p-3.5 rounded-xl flex items-center justify-center gap-2 ${
                      activeOrder.status === 'delivered'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {activeOrder.status === 'delivered'
                        ? '¡Pedido Entregado y Liquidado!'
                        : 'Confirmar Entrega en Puerta / Portería'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
