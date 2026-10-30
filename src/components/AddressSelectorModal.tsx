import React, { useState } from 'react';
import { X, MapPin, Check, Plus } from 'lucide-react';
import { POPULAR_LOCATIONS } from '../data/mockData.ts';

interface AddressSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAddress: string;
  onSelectAddress: (addr: string) => void;
}

export const AddressSelectorModal: React.FC<AddressSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedAddress,
  onSelectAddress,
}) => {
  const [customInput, setCustomInput] = useState<string>('');

  if (!isOpen) return null;

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    onSelectAddress(customInput.trim());
    setCustomInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-600" />
            <h3 className="font-extrabold text-slate-900 text-base">¿A dónde enviamos hoy?</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
            aria-label="Cerrar selector de dirección"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <form onSubmit={handleAddCustom} className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Ingresa tu dirección o barrio..."
              className="flex-1 text-xs p-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
            />
            <button
              type="submit"
              className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
            >
              Usar
            </button>
          </form>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Direcciones guardadas y populares
            </h4>
            <div className="space-y-2">
              {POPULAR_LOCATIONS.map((loc) => {
                const isSelected = selectedAddress === loc;
                return (
                  <button
                    key={loc}
                    onClick={() => {
                      onSelectAddress(loc);
                      onClose();
                    }}
                    className={`w-full p-3 rounded-xl border text-left text-xs flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/50 text-slate-900 font-bold ring-1 ring-orange-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate mr-2">
                      <MapPin className={`w-4 h-4 shrink-0 ${isSelected ? 'text-orange-600' : 'text-slate-400'}`} />
                      <span className="truncate">{loc}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-orange-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
