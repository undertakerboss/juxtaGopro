import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Phone, MessageSquare, Send, Bike, X, RefreshCw, Coins } from 'lucide-react';
import { Order, OrderStatus } from '../types/index.ts';
import { formatCOP, convertCoinsToCOP } from '../utils/orderCalculation.ts';

interface LiveOrderTrackerProps {
  order: Order;
  onClose: () => void;
  onUpdateOrder: (updated: Order) => void;
  onOpenCoinsHub?: () => void;
}

export const LiveOrderTracker: React.FC<LiveOrderTrackerProps> = ({
  order,
  onClose,
  onUpdateOrder,
  onOpenCoinsHub,
}) => {
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'rider'; text: string; time: string }>>([
    {
      sender: 'rider',
      text: '¡Hola! Ya estoy en el restaurante esperando que empaquen tu pedido bien calientito. 🛵💨',
      time: 'Justo ahora',
    },
  ]);
  const [newMessage, setNewMessage] = useState<string>('');

  const statuses: OrderStatus[] = ['confirmed', 'preparing', 'on_the_way', 'delivered'];
  const currentIndex = statuses.indexOf(order.status);

  const [timeLeftMinutes, setTimeLeftMinutes] = useState<number>(order.etaMinutes);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftMinutes((prev) => (prev > 1 ? prev - 1 : 1));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const advanceStage = () => {
    const nextIdx = (currentIndex + 1) % statuses.length;
    const nextStatus = statuses[nextIdx];
    const progressMap: Record<OrderStatus, number> = {
      confirmed: 20,
      preparing: 50,
      on_the_way: 80,
      delivered: 100,
    };

    const updated: Order = {
      ...order,
      status: nextStatus,
      progressPercent: progressMap[nextStatus],
      etaMinutes: nextStatus === 'delivered' ? 0 : Math.max(5, timeLeftMinutes - 7),
    };

    if (nextStatus === 'on_the_way') {
      setChatMessages((msgs) => [
        ...msgs,
        {
          sender: 'rider',
          text: '¡Pedido en mano! Voy en camino hacia tu dirección. Llegando en moto en unos minutos.',
          time: '18:32',
        },
      ]);
    } else if (nextStatus === 'delivered') {
      setChatMessages((msgs) => [
        ...msgs,
        {
          sender: 'rider',
          text: '¡He llegado a tu puerta/portería! Tus JuxtaCoins y mi bono de domiciliario ya fueron acreditados.',
          time: '18:38',
        },
      ]);
    }

    onUpdateOrder(updated);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userText = newMessage.trim();
    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: userText, time: 'Ahora' },
    ]);
    setNewMessage('');

    setTimeout(() => {
      let reply = '¡Copiado! Todo claro, ya voy en camino.';
      if (userText.toLowerCase().includes('portería') || userText.toLowerCase().includes('vigilante')) {
        reply = 'Perfecto, se lo dejaré al vigilante con tu nombre y número de pedido.';
      }
      setChatMessages((prev) => [
        ...prev,
        { sender: 'rider', text: reply, time: 'Ahora' },
      ]);
    }, 1000);
  };

  const riderProgress = order.status === 'confirmed' ? 0.15 : order.status === 'preparing' ? 0.35 : order.status === 'on_the_way' ? 0.72 : 1;
  const riderX = 80 + riderProgress * (420 - 80);
  const riderY = 220 - Math.sin(riderProgress * Math.PI) * 90;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-bold">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-orange-400">PEDIDO {order.id}</span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-300 font-semibold">{order.storeName}</span>
              </div>
              <h3 className="text-base font-extrabold text-white">
                {order.status === 'delivered' ? '¡Pedido Entregado y JuxtaCoins Acreditados!' : `Llegada estimada en ${timeLeftMinutes} minutos`}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={advanceStage}
              className="hidden sm:flex items-center gap-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
              <span>Simular avance</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
              aria-label="Cerrar seguimiento"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Simulated Live GPS Vector Map */}
        <div className="relative h-48 sm:h-56 bg-slate-100 overflow-hidden border-b border-slate-200">
          <svg className="w-full h-full" viewBox="0 0 500 280" preserveAspectRatio="xMidYMid slice">
            <rect width="500" height="280" fill="#f8fafc" />
            <rect x="20" y="20" width="100" height="60" rx="8" fill="#e2e8f0" />
            <rect x="140" y="20" width="160" height="60" rx="8" fill="#e2e8f0" />
            <rect x="320" y="20" width="160" height="60" rx="8" fill="#e2e8f0" />
            <rect x="20" y="100" width="100" height="90" rx="8" fill="#e2e8f0" />
            <rect x="140" y="100" width="160" height="90" rx="8" fill="#e2e8f0" />
            <rect x="320" y="100" width="160" height="90" rx="8" fill="#e2e8f0" />
            <rect x="20" y="210" width="100" height="50" rx="8" fill="#e2e8f0" />
            <rect x="140" y="210" width="160" height="50" rx="8" fill="#e2e8f0" />
            <rect x="320" y="210" width="160" height="50" rx="8" fill="#e2e8f0" />
            <path d="M 280 20 Q 300 120 310 260" stroke="#a7f3d0" strokeWidth="18" fill="none" opacity="0.6" />
            <path
              d="M 80 220 Q 200 90 420 140"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M 80 220 Q 200 90 420 140"
              fill="none"
              stroke="#f97316"
              strokeWidth="6"
              strokeDasharray="500"
              strokeDashoffset={500 * (1 - riderProgress)}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
            <g transform="translate(80, 220)">
              <circle r="12" fill="#ea580c" />
              <circle r="4" fill="#ffffff" />
              <text x="0" y="24" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#334155">
                Comercio
              </text>
            </g>
            <g transform="translate(420, 140)">
              <circle r="14" fill="#0f172a" />
              <circle r="5" fill="#ffffff" />
              <text x="0" y="26" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#334155">
                Tu Dirección
              </text>
            </g>
            <g transform={`translate(${riderX}, ${riderY})`} className="transition-all duration-700 ease-out">
              <circle r="14" fill="#ea580c" stroke="#ffffff" strokeWidth="2.5" />
              <circle r="3" cx="-3" cy="2" fill="#ffffff" />
              <circle r="3" cx="3" cy="2" fill="#ffffff" />
              <path d="M -3 2 L 0 -3 L 3 2" stroke="#ffffff" strokeWidth="1.5" fill="none" />
            </g>
          </svg>

          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 flex items-center gap-2 text-xs font-bold text-slate-800">
            <span>GPS Domiciliario en vivo</span>
            <span className="text-slate-400 font-normal">· {order.courier.vehicle}</span>
          </div>
        </div>

        {/* Status Milestones Bar */}
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className={`flex flex-col items-center ${currentIndex >= 0 ? 'text-orange-600 font-bold' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${
                currentIndex >= 0 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'
              }`}>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-[11px]">Confirmado</span>
            </div>

            <div className={`flex flex-col items-center ${currentIndex >= 1 ? 'text-orange-600 font-bold' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${
                currentIndex >= 1 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'
              }`}>
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-[11px]">En Cocina</span>
            </div>

            <div className={`flex flex-col items-center ${currentIndex >= 2 ? 'text-orange-600 font-bold' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${
                currentIndex >= 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'
              }`}>
                <Bike className="w-4 h-4" />
              </div>
              <span className="text-[11px]">En Camino</span>
            </div>

            <div className={`flex flex-col items-center ${currentIndex >= 3 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${
                currentIndex >= 3 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
              }`}>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-[11px]">Entregado</span>
            </div>
          </div>
        </div>

        {/* Courier & JuxtaCoins Info */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* JuxtaCoins Earned Banner */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Coins className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <span className="font-bold text-emerald-950 block">
                  JuxtaCoins acreditados en esta orden:
                </span>
                <span className="text-emerald-800 font-mono tabular-nums">
                  Cliente: +{order.customerCoinsEarned} JXC ({formatCOP(convertCoinsToCOP(order.customerCoinsEarned))}) · Domiciliario: +{order.courierCoinsEarned} JXC
                  {order.merchantCoinsEarned > 0 ? ` · Comercio: +${order.merchantCoinsEarned} JXC` : ''}
                </span>
              </div>
            </div>
            {onOpenCoinsHub && (
              <button
                onClick={onOpenCoinsHub}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl whitespace-nowrap shrink-0 transition-colors"
              >
                Canjear por Dinero Real →
              </button>
            )}
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-extrabold flex items-center justify-center text-lg shrink-0">
                CM
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-slate-900 text-sm">{order.courier.name}</h4>
                  <span className="text-xs font-bold text-amber-700">
                    ★ {order.courier.rating}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {order.courier.vehicle} · Placa: <span className="font-mono font-bold text-slate-700">{order.courier.plate}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${order.courier.phone}`}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Llamar</span>
              </a>
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className="flex items-center gap-1.5 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{chatOpen ? 'Ocultar Chat' : 'Chat Repartidor'}</span>
              </button>
            </div>
          </div>

          {chatOpen && (
            <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
              <div className="p-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-700 flex justify-between items-center">
                <span>Chat en directo con {order.courier.name}</span>
                <span className="text-[11px] text-emerald-600 font-semibold">En línea</span>
              </div>
              <div className="p-3 max-h-40 overflow-y-auto space-y-2 text-xs">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`p-2.5 rounded-xl max-w-[80%] ${
                        msg.sender === 'user'
                          ? 'bg-orange-600 text-white rounded-tr-none'
                          : 'bg-slate-100 text-slate-800 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 px-1">{msg.time}</span>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-200 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje al repartidor..."
                  className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-orange-500"
                />
                <button
                  type="submit"
                  className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  aria-label="Enviar mensaje"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={advanceStage}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 sm:hidden"
          >
            Avanzar estado simulación →
          </button>
          <button
            onClick={onClose}
            className="ml-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Cerrar seguimiento
          </button>
        </div>
      </div>
    </div>
  );
};
