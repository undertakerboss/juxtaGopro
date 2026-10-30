import React, { useState } from 'react';
import {
  Coins,
  Banknote,
  Users,
  Bike,
  Store as StoreIcon,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
  Plus,
  Building2,
  Smartphone,
  ShieldCheck,
  Award,
} from 'lucide-react';
import {
  JuxtaActorRole,
  JuxtaCoinTransaction,
  AffiliatedMerchant,
} from '../types/index.ts';
import {
  convertCoinsToCOP,
  formatCOP,
  JUXTACOIN_RATE_COP,
} from '../utils/orderCalculation.ts';

interface JuxtaCoinsHubProps {
  balances: Record<JuxtaActorRole, number>;
  transactions: JuxtaCoinTransaction[];
  merchants: AffiliatedMerchant[];
  onRedeemCash: (
    role: JuxtaActorRole,
    coinsAmount: number,
    payoutMethod: string,
    accountDestination: string
  ) => void;
  onEarnBonusCoins: (
    role: JuxtaActorRole,
    coinsAmount: number,
    title: string,
    subtitle: string
  ) => void;
  onRegisterMerchant: (
    businessName: string,
    category: string,
    city: string,
    contactPhone: string
  ) => void;
}

export const JuxtaCoinsHub: React.FC<JuxtaCoinsHubProps> = ({
  balances,
  transactions,
  merchants,
  onRedeemCash,
  onEarnBonusCoins,
  onRegisterMerchant,
}) => {
  const [activeRole, setActiveRole] = useState<JuxtaActorRole>('customer');

  // Cashout form state
  const [coinsToRedeem, setCoinsToRedeem] = useState<string>('200');
  const [payoutMethod, setPayoutMethod] = useState<string>('Nequi Instantáneo');
  const [accountNumber, setAccountNumber] = useState<string>('312 458 9921');
  const [cashoutError, setCashoutError] = useState<string>('');
  const [cashoutSuccess, setCashoutSuccess] = useState<string>('');

  // Claimed interactive missions state
  const [claimedMissions, setClaimedMissions] = useState<Record<string, boolean>>({});

  // Merchant affiliation form state
  const [businessName, setBusinessName] = useState<string>('');
  const [businessCategory, setBusinessCategory] = useState<string>('Restaurante & Gastronomía');
  const [businessCity, setBusinessCity] = useState<string>('Bogotá · Chapinero Alto');
  const [businessPhone, setBusinessPhone] = useState<string>('');
  const [merchantError, setMerchantError] = useState<string>('');
  const [merchantSuccess, setMerchantSuccess] = useState<string>('');

  const currentBalance = balances[activeRole];
  const currentCOPValue = convertCoinsToCOP(currentBalance);
  const roleTransactions = transactions.filter((t) => t.role === activeRole);

  const handleRoleSwitch = (role: JuxtaActorRole) => {
    setActiveRole(role);
    setCashoutError('');
    setCashoutSuccess('');
    if (role === 'customer') {
      setCoinsToRedeem('150');
      setPayoutMethod('Nequi Instantáneo');
    } else if (role === 'courier') {
      setCoinsToRedeem('300');
      setPayoutMethod('Daviplata Rider 0% Comisión');
    } else {
      setCoinsToRedeem('1000');
      setPayoutMethod('Transferencia Empresarial Bancolombia');
    }
  };

  const handleCashoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCashoutError('');
    setCashoutSuccess('');

    const parsedCoins = parseInt(coinsToRedeem, 10);
    if (isNaN(parsedCoins) || parsedCoins < 50) {
      setCashoutError('El monto mínimo de canje es de 50 JuxtaCoins ($5.000 COP).');
      return;
    }
    if (parsedCoins > currentBalance) {
      setCashoutError(`Saldo insuficiente. Tienes ${currentBalance} JuxtaCoins disponibles.`);
      return;
    }
    if (!accountNumber.trim()) {
      setCashoutError('Ingresa el número de cuenta o celular de destino.');
      return;
    }

    onRedeemCash(activeRole, parsedCoins, payoutMethod, accountNumber.trim());
    const copPaid = formatCOP(convertCoinsToCOP(parsedCoins));
    setCashoutSuccess(
      `¡Transferencia exitosa! Canjeaste ${parsedCoins} JXC por ${copPaid} en dinero real hacia ${payoutMethod} (${accountNumber.trim()}).`
    );
  };

  const handleClaimMission = (
    missionId: string,
    role: JuxtaActorRole,
    coins: number,
    title: string,
    subtitle: string
  ) => {
    if (claimedMissions[missionId]) return;
    setClaimedMissions((prev) => ({ ...prev, [missionId]: true }));
    onEarnBonusCoins(role, coins, title, subtitle);
  };

  const handleMerchantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMerchantError('');
    setMerchantSuccess('');

    if (!businessName.trim() || !businessPhone.trim()) {
      setMerchantError('Por favor completa el nombre del comercio y el teléfono de contacto.');
      return;
    }

    onRegisterMerchant(
      businessName.trim(),
      businessCategory,
      businessCity.trim() || 'Bogotá',
      businessPhone.trim()
    );

    setMerchantSuccess(
      `¡${businessName.trim()} vinculado con éxito! Se acreditaron +2.500 JuxtaCoins ($250.000 COP) de bono de bienvenida canjeables por dinero real.`
    );
    setBusinessName('');
    setBusinessPhone('');
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner Ecosystem */}
      <div className="rounded-3xl p-6 sm:p-10 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold tracking-wider uppercase mb-2">
              <Coins className="w-4 h-4" />
              <span>Ecosistema de Recompensas Liquidez Real · 1 JXC = {formatCOP(JUXTACOIN_RATE_COP)}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-balance">
              JuxtaCoins: Tus puntos valen Dinero Real en efectivo
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed max-w-xl">
              A diferencia de otras apps donde los puntos expiran o solo sirven en cupones condicionados, en Juxtago los{' '}
              <strong className="text-white">Clientes Finales</strong>, los{' '}
              <strong className="text-white">Domiciliarios</strong> y los{' '}
              <strong className="text-white">Comerciantes Aliados</strong> convierten sus JuxtaCoins directamente a pesos en su cuenta bancaria o billetera digital.
            </p>
          </div>

          {/* Global Ecosystem Totals */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 shrink-0 min-w-[260px]">
            <span className="text-xs text-amber-300 font-semibold block">
              Tasa Oficial Garantizada
            </span>
            <div className="font-mono text-2xl sm:text-3xl font-black text-white tabular-nums mt-1">
              1 JXC = $100 COP
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 space-y-1 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Clientes:</span>
                <span className="font-mono font-bold text-white tabular-nums">
                  {balances.customer} JXC ({formatCOP(convertCoinsToCOP(balances.customer))})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Domiciliarios:</span>
                <span className="font-mono font-bold text-white tabular-nums">
                  {balances.courier} JXC ({formatCOP(convertCoinsToCOP(balances.courier))})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Comerciantes:</span>
                <span className="font-mono font-bold text-white tabular-nums">
                  {balances.merchant} JXC ({formatCOP(convertCoinsToCOP(balances.merchant))})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Selector Tabs (Clientes Finales | Domiciliarios | Comerciantes Aliados) */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2 shadow-xs">
        <button
          onClick={() => handleRoleSwitch('customer')}
          className={`p-4 rounded-xl text-left transition-all flex items-center justify-between ${
            activeRole === 'customer'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'hover:bg-slate-50 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                activeRole === 'customer'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-50 text-orange-600'
              }`}
            >
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-extrabold block">Clientes Finales</span>
              <span
                className={`text-xs ${
                  activeRole === 'customer' ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                Cashback 5%–10% y retiro en efectivo
              </span>
            </div>
          </div>
          <span className="font-mono text-xs font-bold tabular-nums">
            {balances.customer} JXC
          </span>
        </button>

        <button
          onClick={() => handleRoleSwitch('courier')}
          className={`p-4 rounded-xl text-left transition-all flex items-center justify-between ${
            activeRole === 'courier'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'hover:bg-slate-50 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                activeRole === 'courier'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-extrabold block">Domiciliarios</span>
              <span
                className={`text-xs ${
                  activeRole === 'courier' ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                Bonos por entregas y liquidez 0% costo
              </span>
            </div>
          </div>
          <span className="font-mono text-xs font-bold tabular-nums">
            {balances.courier} JXC
          </span>
        </button>

        <button
          onClick={() => handleRoleSwitch('merchant')}
          className={`p-4 rounded-xl text-left transition-all flex items-center justify-between ${
            activeRole === 'merchant'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'hover:bg-slate-50 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                activeRole === 'merchant'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              <StoreIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-extrabold block">Comerciantes Aliados</span>
              <span
                className={`text-xs ${
                  activeRole === 'merchant' ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                Bono de vinculación y retorno de ventas
              </span>
            </div>
          </div>
          <span className="font-mono text-xs font-bold tabular-nums">
            {balances.merchant} JXC
          </span>
        </button>
      </div>

      {/* Main Two-Column Grid: Left (Role Actions + Missions/Affiliation) & Right (Real-Money Cashout + Ledger) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Role-Specific Earning Center */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Role Balance Summary Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {activeRole === 'customer'
                  ? 'Billetera Cliente Final'
                  : activeRole === 'courier'
                  ? 'Billetera Domiciliario (Carlos Mendoza)'
                  : 'Fondo de Recompensas Comerciantes Vinculados'}
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="font-mono text-3xl sm:text-4xl font-black text-slate-900 tabular-nums">
                  {currentBalance.toLocaleString('es-CO')} JXC
                </span>
                <span className="text-sm font-mono font-bold text-emerald-600 tabular-nums">
                  = {formatCOP(currentCOPValue)} COP disponibles
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {activeRole === 'customer'
                  ? 'Úsalos para pagar tus pedidos en el Carrito o retíralos a tu cuenta en dinero real.'
                  : activeRole === 'courier'
                  ? 'Cada pedido entregado a tiempo suma JuxtaCoins adicionales a tu tarifa base y propina.'
                  : 'Cada comercio nuevo vinculado recibe 2.500 JXC ($250.000 COP) y 4% de retorno por ventas.'}
              </p>
            </div>
          </div>

          {/* ROLE 1: CUSTOMER MISSIONS */}
          {activeRole === 'customer' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Gana más JuxtaCoins como Cliente
                  </h2>
                  <p className="text-xs text-slate-500">
                    Completa acciones instantáneas o haz pedidos en cualquier vertical para acumular JXC
                  </p>
                </div>
                <Award className="w-5 h-5 text-orange-600" />
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'cust-m1',
                    title: 'Califica tu última entrega en Juxtago',
                    subtitle: 'Ayuda a reconocer la puntualidad de los domiciliarios 5 estrellas',
                    coins: 45,
                  },
                  {
                    id: 'cust-m2',
                    title: 'Completa el reto Supermercado + Turbo semanal',
                    subtitle: 'Bonificación por pedir en 2 verticales distintas este mes',
                    coins: 120,
                  },
                  {
                    id: 'cust-m3',
                    title: 'Invita a un amigo con tu código JUXTA-AMIGO',
                    subtitle: 'Ambos reciben JuxtaCoins canjeables por dinero real tras el primer pedido',
                    coins: 200,
                  },
                ].map((mission) => {
                  const isDone = !!claimedMissions[mission.id];
                  return (
                    <div
                      key={mission.id}
                      className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 hover:border-slate-300 transition-colors"
                    >
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{mission.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{mission.subtitle}</p>
                        <span className="text-xs font-mono font-bold text-orange-600 mt-1 inline-block tabular-nums">
                          +{mission.coins} JXC ({formatCOP(convertCoinsToCOP(mission.coins))})
                        </span>
                      </div>
                      <button
                        type="button"
                        disabled={isDone}
                        onClick={() =>
                          handleClaimMission(
                            mission.id,
                            'customer',
                            mission.coins,
                            mission.title,
                            mission.subtitle
                          )
                        }
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                          isDone
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        {isDone ? 'Acreditado ✓' : `Sumar +${mission.coins} JXC`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ROLE 2: COURIER / DOMICILIARIO INCENTIVES */}
          {activeRole === 'courier' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Recompensas e Incentivos para Domiciliarios
                  </h2>
                  <p className="text-xs text-slate-500">
                    Los JuxtaRiders ganan puntos en cada kilómetro recorrido y los retiran sin comisiones
                  </p>
                </div>
                <Bike className="w-5 h-5 text-emerald-600" />
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'cour-m1',
                    title: 'Liquidar Bono de 5 Entregas JuxtaTurbo (< 10 min)',
                    subtitle: 'Entregas ultrarrápidas verificadas por GPS sin contratiempos',
                    coins: 150,
                  },
                  {
                    id: 'cour-m2',
                    title: 'Bono Racha Hora Pico en Flota Eléctrica',
                    subtitle: 'Incentivo ecológico por operar en moto o bici eléctrica cero emisiones',
                    coins: 220,
                  },
                  {
                    id: 'cour-m3',
                    title: 'Reconocimiento 20 Calificaciones 5★ Consecutivas',
                    subtitle: 'Premio directo al domiciliario por excelencia en servicio al cliente',
                    coins: 180,
                  },
                ].map((mission) => {
                  const isDone = !!claimedMissions[mission.id];
                  return (
                    <div
                      key={mission.id}
                      className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 hover:border-slate-300 transition-colors"
                    >
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{mission.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{mission.subtitle}</p>
                        <span className="text-xs font-mono font-bold text-emerald-600 mt-1 inline-block tabular-nums">
                          +{mission.coins} JXC ({formatCOP(convertCoinsToCOP(mission.coins))})
                        </span>
                      </div>
                      <button
                        type="button"
                        disabled={isDone}
                        onClick={() =>
                          handleClaimMission(
                            mission.id,
                            'courier',
                            mission.coins,
                            mission.title,
                            mission.subtitle
                          )
                        }
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                          isDone
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {isDone ? 'Liquidado ✓' : `Acreditar +${mission.coins} JXC`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ROLE 3: MERCHANT ONBOARDING & PARTNER REWARDS */}
          {activeRole === 'merchant' && (
            <div className="space-y-6">
              {/* Formulario para vincular nuevo comerciante */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      Vincular Nuevo Comercio y Recibir +2.500 JuxtaCoins
                    </h2>
                    <p className="text-xs text-slate-500">
                      Cada restaurante, farmacia o tienda que se vincule recibe $250.000 COP en JuxtaCoins canjeables por dinero real
                    </p>
                  </div>
                  <StoreIcon className="w-5 h-5 text-amber-600 shrink-0" />
                </div>

                <form onSubmit={handleMerchantSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nombre del Restaurante o Comercio
                      </label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Ej: Asadero & Parrilla Don Lucho"
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Categoría del Comercio
                      </label>
                      <select
                        value={businessCategory}
                        onChange={(e) => setBusinessCategory(e.target.value)}
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-orange-500 outline-none bg-white"
                      >
                        <option value="Restaurante & Gastronomía">Restaurante & Gastronomía</option>
                        <option value="Supermercado & Minimarket">Supermercado & Minimarket</option>
                        <option value="Farmacia & Droguería">Farmacia & Droguería</option>
                        <option value="Panadería & Pastelería Artesanal">Panadería & Pastelería Artesanal</option>
                        <option value="Licores & Bebidas Express">Licores & Bebidas Express</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Ciudad y Barrio
                      </label>
                      <input
                        type="text"
                        value={businessCity}
                        onChange={(e) => setBusinessCity(e.target.value)}
                        placeholder="Ej: Bogotá · Chapinero"
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        WhatsApp / Teléfono del Aliado
                      </label>
                      <input
                        type="text"
                        value={businessPhone}
                        onChange={(e) => setBusinessPhone(e.target.value)}
                        placeholder="Ej: +57 311 480 9920"
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
                      />
                    </div>
                  </div>

                  {merchantError && (
                    <p className="text-xs font-semibold text-red-600">{merchantError}</p>
                  )}

                  {merchantSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{merchantSuccess}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-amber-400" />
                    <span>Vincular Comercio y Acreditar +2.500 JXC ($250.000 COP)</span>
                  </button>
                </form>
              </div>

              {/* Lista de Comerciantes Vinculados */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-3">
                <h3 className="text-sm font-black text-slate-900">
                  Comercios Vinculados en la Red Juxtago ({merchants.length})
                </h3>
                <div className="divide-y divide-slate-100">
                  {merchants.map((m) => (
                    <div key={m.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block text-sm">
                          {m.businessName}
                        </span>
                        <span className="text-slate-500">
                          {m.category} · {m.city} · {m.contactPhone}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-slate-900 block tabular-nums">
                          {m.coinsBalance.toLocaleString('es-CO')} JXC
                        </span>
                        <span className="font-mono text-emerald-600 font-semibold tabular-nums">
                          {formatCOP(convertCoinsToCOP(m.coinsBalance))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Real-Money Cashout Form + Transaction Ledger */}
        <div className="lg:col-span-5 space-y-6">
          {/* Canje por Dinero Real Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Liquidez Inmediata
                </span>
                <h2 className="text-lg font-black text-slate-900">
                  Canjear JuxtaCoins por Dinero Real
                </h2>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Banknote className="w-5 h-5" />
              </div>
            </div>

            <form onSubmit={handleCashoutSubmit} className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="coins-redeem-input" className="font-bold text-slate-700">
                    Cantidad de JuxtaCoins a retirar
                  </label>
                  <button
                    type="button"
                    onClick={() => setCoinsToRedeem(String(currentBalance))}
                    className="text-orange-600 font-bold hover:underline"
                  >
                    Usar máximo ({currentBalance} JXC)
                  </button>
                </div>
                <input
                  id="coins-redeem-input"
                  type="number"
                  min={50}
                  max={Math.max(50, currentBalance)}
                  value={coinsToRedeem}
                  onChange={(e) => setCoinsToRedeem(e.target.value)}
                  className="w-full font-mono text-base font-bold p-3 rounded-xl border border-slate-200 focus:border-emerald-600 outline-none tabular-nums"
                />
                <div className="flex justify-between items-center mt-1.5 text-xs text-slate-500">
                  <span>Recibirás en dinero real:</span>
                  <span className="font-mono text-sm font-black text-emerald-600 tabular-nums">
                    {formatCOP(convertCoinsToCOP(parseInt(coinsToRedeem, 10) || 0))} COP
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="payout-method-select" className="block text-xs font-bold text-slate-700 mb-1">
                  Medio de desembolso directo
                </label>
                <select
                  id="payout-method-select"
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-emerald-600 outline-none bg-white font-medium"
                >
                  <option value="Nequi Instantáneo">Nequi (Abono inmediato 24/7)</option>
                  <option value="Daviplata Rider 0% Comisión">Daviplata (0% costo de retiro)</option>
                  <option value="Transferencia Empresarial Bancolombia">Cuenta Bancolombia / Ahorros o Corriente</option>
                  <option value="Transferencia PSE / Transfiya">Transfiya / Otros Bancos ACH</option>
                </select>
              </div>

              <div>
                <label htmlFor="account-dest-input" className="block text-xs font-bold text-slate-700 mb-1">
                  Número de Celular o Cuenta Bancaria
                </label>
                <input
                  id="account-dest-input"
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Ej: 312 458 9921 o Cta Ahorros 401-99281-0"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-emerald-600 outline-none font-mono"
                />
              </div>

              {cashoutError && (
                <p className="text-xs font-semibold text-red-600">{cashoutError}</p>
              )}

              {cashoutSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{cashoutSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>
                  Retirar {formatCOP(convertCoinsToCOP(parseInt(coinsToRedeem, 10) || 0))} en Dinero Real
                </span>
              </button>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Sin plazos forzosos ni comisiones ocultas. Respaldado por JuxtaPay Colombia.
                </span>
              </div>
            </form>
          </div>

          {/* Historial de Movimientos del Rol Activo */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">
                Historial de JuxtaCoins y Retiros
              </h3>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {roleTransactions.length} movimientos
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
              {roleTransactions.map((tx) => {
                const isPositive = tx.type === 'earned';
                return (
                  <div key={tx.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{tx.title}</span>
                      <span className="text-slate-500 block mt-0.5">{tx.subtitle}</span>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        {tx.timestamp}
                        {tx.payoutMethod ? ` · Destino: ${tx.payoutMethod}` : ''}
                      </span>
                    </div>
                    <div className="text-right shrink-0 font-mono tabular-nums">
                      <span
                        className={`font-bold text-sm block ${
                          isPositive ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {isPositive ? `+${tx.coins}` : `-${tx.coins}`} JXC
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {formatCOP(tx.copAmount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
