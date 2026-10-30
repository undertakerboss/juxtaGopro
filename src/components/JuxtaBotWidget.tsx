import React, { useState } from 'react';
import {
  Bot,
  X,
  Send,
  Brain,
  Trash2,
  Plus,
  Sparkles,
  User,
  Store as StoreIcon,
  Bike,
} from 'lucide-react';
import { JuxtaActorRole } from '../types/index.ts';
import { UserMemoryItem, detectMemoryCategory } from '../utils/memoryEngine.ts';

interface JuxtaBotWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  memories: UserMemoryItem[];
  onAddMemory: (item: UserMemoryItem) => void;
  onDeleteMemory: (id: string) => void;
  coinBalances: Record<JuxtaActorRole, number>;
  selectedAddress: string;
}

interface ChatBubble {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  savedMemory?: string;
}

export const JuxtaBotWidget: React.FC<JuxtaBotWidgetProps> = ({
  isOpen,
  onToggle,
  memories,
  onAddMemory,
  onDeleteMemory,
  coinBalances,
  selectedAddress,
}) => {
  const [activeRole, setActiveRole] = useState<JuxtaActorRole>('customer');
  const [activeTab, setActiveTab] = useState<'chat' | 'memory'>('chat');
  const [input, setInput] = useState<string>('');
  const [newMemoryManual, setNewMemoryManual] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [messages, setMessages] = useState<ChatBubble[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: '¡Hola! Soy JuxtaBot 🧠. Recuerdo los gustos, alergias, direcciones de Clientes, horarios de Negocios y rutas de Domiciliarios. Escríbeme por ejemplo: "Recuerda que pido siempre sin cebolla y en portería Torre 2" o pregúntame qué sé de ti.',
      timestamp: 'En línea',
    },
  ]);

  const roleMemories = memories.filter((m) => m.role === activeRole);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatBubble = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: 'Ahora',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/juxtabot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          role: activeRole,
          memories,
          coinBalances,
          selectedAddress,
        }),
      });

      const data = await response.json();
      let savedFactText: string | undefined;

      if (data.extractedMemory && data.extractedMemory.fact) {
        const memItem: UserMemoryItem = {
          id: `mem-${Date.now()}`,
          role: activeRole,
          category: data.extractedMemory.category || detectMemoryCategory(data.extractedMemory.fact, activeRole),
          fact: data.extractedMemory.fact,
          createdAt: 'Guardado hoy por JuxtaBot',
        };
        onAddMemory(memItem);
        savedFactText = memItem.fact;
      }

      const botMsg: ChatBubble = {
        id: `b-${Date.now() + 1}`,
        sender: 'bot',
        text: data.reply || '¡Entendido! He procesado tu solicitud.',
        timestamp: 'Ahora',
        savedMemory: savedFactText,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const fallbackMsg: ChatBubble = {
        id: `b-${Date.now() + 1}`,
        sender: 'bot',
        text: 'He registrado tu mensaje en la memoria local de JuxtaBot.',
        timestamp: 'Ahora',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualMemorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryManual.trim()) return;
    const fact = newMemoryManual.trim();
    onAddMemory({
      id: `mem-man-${Date.now()}`,
      role: activeRole,
      category: detectMemoryCategory(fact, activeRole),
      fact,
      createdAt: 'Añadido manualmente',
    });
    setNewMemoryManual('');
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl border border-slate-700 transition-all active:scale-95"
          aria-label="Abrir JuxtaBot con Memoria"
        >
          <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="text-xs font-extrabold block leading-none">
              JuxtaBot AI · Memoria
            </span>
            <span className="text-[10px] text-slate-300 font-mono tabular-nums">
              {memories.length} recuerdos activos
            </span>
          </div>
        </button>
      )}

      {/* Drawer / Modal Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-[94vw] sm:w-[420px] max-h-[84vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in duration-150">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tight">
                  JuxtaBot · Memoria Inteligente
                </h3>
                <p className="text-[11px] text-slate-300">
                  Recuerda preferencias de Clientes, Negocios y Riders
                </p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
              aria-label="Cerrar JuxtaBot"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role & Tab Switcher */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-200 space-y-2">
            {/* Role selector */}
            <div className="grid grid-cols-3 gap-1 bg-slate-200/70 p-1 rounded-xl text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setActiveRole('customer')}
                className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-colors ${
                  activeRole === 'customer'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3 h-3 text-orange-600" />
                <span>Cliente</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveRole('merchant')}
                className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-colors ${
                  activeRole === 'merchant'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <StoreIcon className="w-3 h-3 text-amber-600" />
                <span>Negocio</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveRole('courier')}
                className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-colors ${
                  activeRole === 'courier'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bike className="w-3 h-3 text-emerald-600" />
                <span>Rider</span>
              </button>
            </div>

            {/* Mode tabs: Chat vs Memory Vault */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                Conversar con JuxtaBot
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('memory')}
                className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  activeTab === 'memory'
                    ? 'bg-orange-600 text-white'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Memoria ({roleMemories.length})</span>
              </button>
            </div>
          </div>

          {/* TAB 1: CHAT */}
          {activeTab === 'chat' ? (
            <>
              {/* Active Memory Preview Bar */}
              <div className="px-3.5 py-2 bg-amber-50/80 border-b border-amber-200/70 text-[11px] text-amber-950 flex items-center justify-between gap-2">
                <span className="truncate">
                  <strong>Recordando:</strong>{' '}
                  {roleMemories[0]?.fact || 'Dime qué quieres que recuerde de ti'}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('memory')}
                  className="font-bold text-orange-700 underline shrink-0"
                >
                  Ver todo
                </button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[340px] bg-white">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] whitespace-pre-line ${
                        m.sender === 'user'
                          ? 'bg-slate-900 text-white rounded-tr-none'
                          : 'bg-slate-100 text-slate-800 rounded-tl-none'
                      }`}
                    >
                      {m.text}
                    </div>
                    {m.savedMemory && (
                      <div className="mt-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                        <Brain className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Guardado en memoria: "{m.savedMemory}"</span>
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="text-xs text-slate-400 italic">
                    JuxtaBot está consultando tu memoria...
                  </div>
                )}
              </div>

              {/* Quick suggestion chips */}
              <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  'Recuerda que pido sin cebolla y salsas aparte',
                  '¿Qué cosas recuerdas de mí?',
                  'Recuerda que mi apto es el 804 Torre 2',
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setInput(chip)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-orange-400 text-[11px] text-slate-700 whitespace-nowrap shrink-0 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder='Ej: "Recuerda que soy alérgico al maní..."'
                  className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="p-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white transition-colors shrink-0"
                  aria-label="Enviar a JuxtaBot"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            /* TAB 2: MEMORY VAULT */
            <div className="p-4 flex-1 overflow-y-auto space-y-4 max-h-[420px]">
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Bóveda de Recuerdos ({activeRole === 'customer' ? 'Cliente' : activeRole === 'merchant' ? 'Negocio' : 'Domiciliario'})
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  JuxtaBot aplica automáticamente estos datos en tus pedidos, despachos y rutas.
                </p>
              </div>

              <form onSubmit={handleManualMemorySubmit} className="flex gap-2">
                <input
                  type="text"
                  value={newMemoryManual}
                  onChange={(e) => setNewMemoryManual(e.target.value)}
                  placeholder="Añadir preferencia, alergia, nota o dirección..."
                  className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Guardar</span>
                </button>
              </form>

              <div className="space-y-2">
                {roleMemories.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-2 text-xs"
                  >
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-orange-600 block">
                        {item.category} · {item.createdAt}
                      </span>
                      <p className="font-semibold text-slate-900 mt-0.5">{item.fact}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteMemory(item.id)}
                      className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                      aria-label={`Olvidar ${item.fact}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
