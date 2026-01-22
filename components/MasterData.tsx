
import React, { useState } from 'react';
import { ClubConfig, Discipline, Category } from '../types';
import { 
  Save, Plus, Trash2, Trophy, Settings, LayoutGrid, X, CheckCircle, 
  Loader2, Camera, ChevronDown, Palette, Timer, Shield, Dumbbell, Target, Bike, Waves, Heart, Activity
} from 'lucide-react';

// Componente de Íconos de Alta Fidelidad Deportiva (Siluetas Sólidas)
export const SportIcon = ({ id, size = 24, className = "" }: { id: string, size?: number, className?: string }) => {
  const props = { width: size, height: size, className, viewBox: "0 0 24 24" };
  
  switch (id) {
    case 'soccer':
      return (
        <svg {...props} fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 2c1.02 0 1.98.2 2.87.56L12.5 8.5 8 7.5V4.6c1.19-.38 2.47-.6 3.8-.6h.2zm-5.4 1.34v2.73l-1.95.43c-.76-.98-1.34-2.1-1.68-3.32l3.63.16zm-3.8 4.7l2.25-.5 2.1 4.28L5 17.07c-.96-1.12-1.66-2.45-2-3.88l-.2-1.15zm2.7 8.23l2.43-2.9 4.3 1.25.77 4.15c-1.46.52-3.04.75-4.65.65-1.07-.07-2.1-.32-3.05-.75l.2-.4zm9.35 1.5l-.88-4.7 3.33-2.6 1.95 1.62c-.4 1.35-1.1 2.56-2.02 3.58l-2.38 2.1zm5-6.17l-2.4-1.98 1.1-4.75 3.1-.38c.32 1.2.5 2.47.5 3.8 0 1.14-.14 2.24-.4 3.3l-1.9.01zm-3.63-8.2l-3.35.43-2.25-3.87C11.58 4.13 13.1 4 14.63 4c1.32 0 2.58.18 3.77.52l-2.18 2.28z"/>
        </svg>
      );
    case 'basketball':
      return (
        <svg {...props} fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-1.8 0-3.48-.6-4.83-1.62.94-1.16 2.37-2.1 4.15-2.72-.63-.9-1.06-1.98-1.23-3.16H6.18c.04 1.83.65 3.5 1.65 4.9L5.4 19.83C4 18.23 3.1 16.14 3.01 13.84h6.08c.18 1.57.73 2.97 1.56 4.1-.73.47-1.53.84-2.4 1.1-.15.34-.23.72-.25 1.12zm0-2c-1.37 0-2.6-.5-3.56-1.33.6-.2 1.15-.47 1.65-.8.56.76 1.24 1.38 2.01 1.84-.03.1-.06.2-.1.29zm7.17 1.83l-2.43-2.43c1-1.4 1.6-3.07 1.65-4.9h6.08c-.09 2.3-1 4.4-2.4 6L21.48 19.83c-.02-.4-.1-.78-.31-1.12-.87-.26-1.67-.63-2.4-1.1.83-1.13 1.38-2.53 1.56-4.1zM6.18 10.16h3.91c.17-1.18.6-2.26 1.23-3.16-1.78-.62-3.2-1.56-4.15-2.72 1.35-1.02 3.03-1.62 4.83-1.62.1 0 .2 0 .3.01.12.38.2.78.22 1.2-.77.46-1.45 1.08-2.01 1.84-.5-.33-1.05-.6-1.65-.8.96-.83 2.19-1.33 3.56-1.33.06 0 .1 0 .17.01.01.14.02.28.02.42 0 1.25-.33 2.42-.92 3.42 1.25 1.33 2 3.08 2 5.01s-.75 3.68-2 5.01c.59 1 1.02 2.17.92 3.42 0 .14-.01.28-.02.42-.07.01-.11.01-.17.01-1.37 0-2.6-.5-3.56-1.33.6-.2 1.15-.47 1.65-.8-.56.76-1.24 1.38-2.01 1.84-.02-.42-.1-.82-.22-1.2-.1-.01-.2-.01-.3-.01-1.8 0-3.48.6-4.83 1.62.94-1.16 2.37-2.1 4.15-2.72-.63-.9-1.06-1.98-1.23-3.16H6.18c-.01-.16-.02-.33-.02-.5s.01-.34.02-.5zm11.64-3.16c.63.9 1.06 1.98 1.23 3.16h3.91c-.04-1.83-.65-3.5-1.65-4.9l2.43-2.43c-.09.08-.18.17-.25.26-.01-.14-.02-.28-.02-.42 0-1.25.33-2.42.92-3.42-1.25-1.33-2-3.08-2-5.01s.75-3.68 2-5.01c-.59-1-1.02-2.17-.92-3.42 0-.14.01-.28.02-.42.07-.01.11-.01.17-.01 1.37 0 2.6.5 3.56 1.33-.6.2-1.15.47-1.65.8.56-.76 1.24-1.38 2.01-1.84.02.42.1.82.22 1.2.1.01.2.01.3.01 1.8 0 3.48-.6 4.83-1.62-.94 1.16-2.37 2.1-4.15 2.72.63.9 1.06 1.98 1.23 3.16h3.91z"/>
        </svg>
      );
    case 'rugby':
      return (
        <svg {...props} fill="currentColor">
          <path d="M12 2C7 2 2 7 2 12s5 10 10 10 10-5 10-10S17 2 12 2zm0 18c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" opacity="0.2"/>
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12s4.48 10 10 10 10-4.48 10-10zm-10 8c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          <path d="M12 4v16M9 6v12M15 6v12" opacity="0.1"/>
          <path d="M10 12h4M12 10v4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <path d="M12 7v10M11 9h2M11 12h2M11 15h2" fill="none" stroke="white" strokeWidth="1.5"/>
        </svg>
      );
    case 'tennis':
      return (
        <svg {...props} fill="currentColor">
          <circle cx="12" cy="12" r="10"/>
          <path d="M5.5 18.5a10 10 0 0 0 13-13" fill="none" stroke="black" strokeWidth="2.5" opacity="0.3"/>
          <path d="M18.5 18.5a10 10 0 0 1-13-13" fill="none" stroke="black" strokeWidth="2.5" opacity="0.3"/>
        </svg>
      );
    case 'padel':
      return (
        <svg {...props} fill="currentColor">
          <circle cx="9" cy="14" r="7"/>
          <path d="M14 9l6-6c.5-.5 1.5-.5 2 0s.5 1.5 0 2l-6 6" stroke="currentColor" strokeWidth="2.5"/>
          <circle cx="7" cy="12" r="1" fill="white" opacity="0.8"/>
          <circle cx="9" cy="12" r="1" fill="white" opacity="0.8"/>
          <circle cx="11" cy="12" r="1" fill="white" opacity="0.8"/>
          <circle cx="7" cy="14" r="1" fill="white" opacity="0.8"/>
          <circle cx="9" cy="14" r="1" fill="white" opacity="0.8"/>
          <circle cx="11" cy="14" r="1" fill="white" opacity="0.8"/>
          <circle cx="18" cy="18" r="3" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    case 'motor':
      return (
        <svg {...props} fill="currentColor">
          <path d="M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 12 4c2.12 0 4.07.83 5.53 2.18l1.3-1.3A9.95 9.95 0 0 0 12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-1.24-.22-2.42-.62-3.43zM12 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-4a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
          <path d="M12 14l5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M6 14h1M7.5 10l.5.5M12 8V7M16 10l-.5.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    case 'mma':
      return (
        <svg {...props} fill="currentColor">
          <path d="M18 10H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2z"/>
          <path d="M12 4C9 4 7 6 7 9v1h2V9c0-1.5 1-2.5 3-2.5s3 1 3 2.5v1h2V9c0-3-2-5-5-5zM17 7c-2 0-3 1-3 3v1h2v-1c0-1 1-1.5 2-1.5s2 .5 2 1.5v1h2v-1c0-2-1-3-3-3z" opacity="0.5"/>
        </svg>
      );
    case 'hockey':
      return (
        <svg {...props} fill="currentColor">
          <circle cx="12" cy="12" r="5" opacity="0.3"/>
          <path d="M20 4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2s2-.9 2-2V6c0-1.1-.9-2-2-2zM4 4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2s2-.9 2-2V6c0-1.1-.9-2-2-2zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="none" stroke="currentColor" strokeWidth="1"/>
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
                      <SportIcon id={disc.icon || 'soccer'} size={32} />
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
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-4 block ml-1">Icono de Alta Fidelidad (Estilo ESPN)</label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-3">
                            {SPORT_ICONS.map((item) => (
                                <button key={item.id} onClick={() => updateDiscIcon(disc.id, item.id)} className={`flex flex-col items-center gap-3 p-4 rounded-2xl transition-all ${disc.icon === item.id ? 'bg-primary-600 text-white shadow-xl scale-105' : 'bg-white dark:bg-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                                    {item.lucide ? <item.lucide size={24} /> : <SportIcon id={item.id} size={24} />}
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
