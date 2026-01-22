
import React, { useState } from 'react';
import { ClubConfig, Discipline, Category } from '../types';
import { 
  Save, Plus, Trash2, Trophy, Settings, LayoutGrid, X, CheckCircle, 
  Loader2, Camera, ChevronDown, Palette, Timer, Shield, Dumbbell, Target, Bike, Waves, Heart, Activity
} from 'lucide-react';

// Componente de Ícono de Ultra-Precisión Deportiva (Custom High-End SVGs)
export const SportIcon = ({ id, size = 20, className = "" }: { id: string, size?: number, className?: string }) => {
  const props = { width: size, height: size, className, viewBox: "0 0 24 24", fill: "currentColor" };
  
  switch (id) {
    case 'soccer':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="1"/>
          <path d="M12 12l-3.5 2.5.5 4h6l.5-4L12 12z M12 12l3.5-2.5-.5-4h-6l-.5 4L12 12z M2.5 12h5l2.5 3.5M14 15.5l2.5-3.5h5M12 2v4.5l3.5 2.5M8.5 9l-3.5-2.5V2M15.5 15l3.5 2.5v4.5M5 22v-4.5l3.5-2.5"/>
        </svg>
      );
    case 'basketball':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M5 5c3 3 3 11 0 14M19 5c-3 3-3 11 0 14" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      );
    case 'rugby':
      return (
        <svg {...props}>
          <path d="M2.5 12c0-6 6-10 9.5-10s9.5 4 9.5 10-6 10-9.5 10-9.5-4-9.5-10z" />
          <path d="M12 4v16M9 6v12M15 6v12" fill="none" stroke="black" strokeWidth="0.5" opacity="0.3"/>
          <path d="M10 12h4M12 10v4" fill="none" stroke="white" strokeWidth="1.5"/>
        </svg>
      );
    case 'tennis':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10"/>
          <path d="M6 18c3-3 3-9 0-12" fill="none" stroke="black" strokeWidth="2" opacity="0.2"/>
          <path d="M18 18c-3-3-3-9 0-12" fill="none" stroke="black" strokeWidth="2" opacity="0.2"/>
        </svg>
      );
    case 'padel':
      return (
        <svg {...props}>
          <circle cx="9" cy="13" r="7" />
          <path d="M14 8l6-6M13 9l4-4" stroke="currentColor" strokeWidth="2"/>
          <circle cx="18" cy="18" r="3" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="7" cy="11" r="0.8" fill="white"/><circle cx="9" cy="11" r="0.8" fill="white"/><circle cx="11" cy="11" r="0.8" fill="white"/>
          <circle cx="7" cy="13" r="0.8" fill="white"/><circle cx="9" cy="13" r="0.8" fill="white"/><circle cx="11" cy="13" r="0.8" fill="white"/>
        </svg>
      );
    case 'motor':
      return (
        <svg {...props}>
          <path d="M3 17a9 9 0 1 1 18 0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M12 17l4-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="12" cy="17" r="2"/>
        </svg>
      );
    case 'mma':
      return (
        <svg {...props}>
          <path d="M6 10h12v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V10z"/>
          <path d="M5 8c0-3 2-4 4-4s3 1 3 3v2M12 7c0-2 2-3 4-3s4 1 4 3v2" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    case 'hockey':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v6M12 16v6M2 12h6M16 12h6" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    default:
      return <Trophy size={size} className={className} />;
  }
};

interface MasterDataProps {
  config: ClubConfig;
  onSave: (config: ClubConfig) => Promise<void>;
}

const SPORT_ICONS = [
  { id: 'soccer', label: 'Fútbol' },
  { id: 'basketball', label: 'Básquet' },
  { id: 'rugby', label: 'Rugby' },
  { id: 'tennis', label: 'Tenis' },
  { id: 'padel', label: 'Pádel' },
  { id: 'motor', label: 'Motor' },
  { id: 'mma', label: 'Combate' },
  { id: 'hockey', label: 'Hockey' },
  { id: 'timer', label: 'Atletismo', lucide: Timer },
  { id: 'waves', label: 'Natación', lucide: Waves },
];

const MasterData: React.FC<MasterDataProps> = ({ config, onSave }) => {
  const [tab, setTab] = useState<'hierarchy' | 'identity'>('hierarchy');
  const [localConfig, setLocalConfig] = useState<ClubConfig>(config);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [expandedDiscs, setExpandedDiscs] = useState<Record<string, boolean>>({});

  const toggleDisc = (id: string) => {
    setExpandedDiscs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(localConfig);
    setIsSaving(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const addDiscipline = () => {
    const id = crypto.randomUUID();
    const newDisc: Discipline = { id, name: 'NUEVA DISCIPLINA', categories: [], icon: 'soccer' };
    setLocalConfig({ ...localConfig, disciplines: [...localConfig.disciplines, newDisc] });
    setExpandedDiscs(prev => ({ ...prev, [id]: true }));
  };

  const updateDiscIcon = (discId: string, iconName: string) => {
    setLocalConfig({
      ...localConfig,
      disciplines: localConfig.disciplines.map(d => d.id === discId ? { ...d, icon: iconName } : d)
    });
  };

  return (
    <div className="p-4 md:p-12 max-w-5xl mx-auto animate-fade-in pb-32 md:pb-40">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 md:mb-12">
        <div className="w-full">
          <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tighter leading-none text-slate-900 dark:text-white">Configuración</h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[8px] md:text-[10px] mt-2 flex items-center gap-2">
            <span className="w-8 h-px bg-primary-500"></span> Gestión Institucional
          </p>
        </div>
        <button onClick={handleSave} disabled={isSaving} className={`group flex items-center justify-center gap-3 w-full md:w-auto px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${showSaved ? 'bg-emerald-500 text-white' : 'bg-slate-900 dark:bg-primary-600 text-white shadow-lg'}`}>
          {isSaving ? <Loader2 className="animate-spin" size={16} /> : (showSaved ? <CheckCircle size={16} /> : <Save size={16} />)}
          <span>{isSaving ? 'Sincronizando' : (showSaved ? 'Guardado' : 'Guardar Todo')}</span>
        </button>
      </header>

      <div className="flex gap-2 p-1.5 bg-slate-200/50 dark:bg-white/5 rounded-2xl w-full md:w-fit mb-8 backdrop-blur-sm">
        <button onClick={() => setTab('hierarchy')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black uppercase text-[9px] tracking-wider transition-all ${tab === 'hierarchy' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md' : 'text-slate-500'}`}>
          <LayoutGrid size={14} /> Estructura
        </button>
        <button onClick={() => setTab('identity')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black uppercase text-[9px] tracking-wider transition-all ${tab === 'identity' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md' : 'text-slate-500'}`}>
          <Settings size={14} /> Identidad
        </button>
      </div>

      {tab === 'hierarchy' && (
        <div className="space-y-4 animate-fade-in">
          {localConfig.disciplines.map(disc => {
            const isExpanded = expandedDiscs[disc.id];
            return (
              <div key={disc.id} className={`bg-white dark:bg-[#0f1219] rounded-3xl border transition-all ${isExpanded ? 'border-primary-500/20 shadow-xl' : 'border-slate-200 dark:border-white/5 shadow-sm'}`}>
                <div onClick={() => toggleDisc(disc.id)} className="p-5 md:p-8 flex flex-col md:flex-row justify-between items-center gap-4 cursor-pointer select-none">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-lg border border-white/10">
                      <SportIcon id={disc.icon || 'soccer'} size={24} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <input value={disc.name} onClick={e => e.stopPropagation()} onChange={e => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(d => d.id === disc.id ? {...d, name: e.target.value.toUpperCase()} : d)})} className="bg-transparent text-lg md:text-2xl font-black uppercase tracking-tighter outline-none w-full dark:text-white truncate" />
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mt-0.5">{disc.categories.length} CATEGORÍAS</span>
                    </div>
                  </div>
                  <ChevronDown size={20} className={`transition-transform duration-500 text-slate-400 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>

                {isExpanded && (
                  <div className="p-5 md:p-8 pt-0 border-t border-slate-100 dark:border-white/5">
                    <div className="mt-4 p-5 bg-slate-100/50 dark:bg-slate-900/40 rounded-3xl">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-4 block ml-1">Icono de Alta Fidelidad</label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-3">
                            {SPORT_ICONS.map((item) => (
                                <button key={item.id} onClick={() => updateDiscIcon(disc.id, item.id)} className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${disc.icon === item.id ? 'bg-slate-900 dark:bg-primary-600 text-white shadow-xl scale-105' : 'bg-white dark:bg-slate-800 text-slate-400'}`}>
                                    {item.lucide ? <item.lucide size={18} /> : <SportIcon id={item.id} size={18} />}
                                    <span className="text-[7px] font-black uppercase truncate w-full text-center">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <button onClick={addDiscipline} className="w-full py-10 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-3xl text-slate-400 bg-white/50 dark:bg-white/5 font-black uppercase tracking-widest transition-all hover:border-primary-600 hover:text-primary-600 flex flex-col items-center gap-3">
              <Plus size={24} /> Nueva Disciplina
          </button>
        </div>
      )}
    </div>
  );
};

export default MasterData;
