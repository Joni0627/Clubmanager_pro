
import React, { useState, useRef } from 'react';
import { ClubConfig, Discipline, Category } from '../types';
import { 
  Save, Plus, Trash2, Trophy, Settings, LayoutGrid, X, CheckCircle, 
  Loader2, Camera, ChevronDown, Palette, Timer, Shield, Dumbbell, Target, Bike, Waves, Heart, Activity, Upload, Image as ImageIcon
} from 'lucide-react';

export const SportIcon = ({ id, size = 24, className = "" }: { id: string, size?: number, className?: string }) => {
  // Si el id es una URL o base64 (empieza por data: o http), renderizamos imagen
  if (id.startsWith('data:') || id.startsWith('http')) {
    return <img src={id} style={{ width: size, height: size }} className={`object-cover rounded-full ${className}`} />;
  }

  const props = { width: size, height: size, className, viewBox: "0 0 24 24" };
  
  switch (id) {
    case 'soccer':
      return (
        <svg {...props} fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 2c1.02 0 1.98.2 2.87.56L12.5 8.5 8 7.5V4.6c1.19-.38 2.47-.6 3.8-.6h.2zm-5.4 1.34v2.73l-1.95.43c-.76-.98-1.34-2.1-1.68-3.32l3.63.16zm-3.8 4.7l2.25-.5 2.1 4.28L5 17.07c-.96-1.12-1.66-2.45-2-3.88l-.2-1.15zm2.7 8.23l2.43-2.9 4.3 1.25.77 4.15c-1.46.52-3.04.75-4.65.65-1.07-.07-2.1-.32-3.05-.75l.2-.4zm9.35 1.5l-.88-4.7 3.33-2.6 1.95 1.62c-.4 1.35-1.1 2.56-2.02 3.58l-2.38 2.1zm5-6.17l-2.4-1.98 1.1-4.75 3.1-.38c.32 1.2.5 2.47.5 3.8 0 1.14-.14 2.24-.4 3.3l-1.9.01zm-3.63-8.2l-3.35.43-2.25-3.87C11.58 4.13 13.1 4 14.63 4c1.32 0 2.58.18 3.77.52l-2.18 2.28z"/>
        </svg>
      );
    default:
      return <Shield size={size} className={className} />;
  }
};

interface MasterDataProps {
  config: ClubConfig;
  onSave: (config: ClubConfig) => Promise<void>;
}

const MasterData: React.FC<MasterDataProps> = ({ config, onSave }) => {
  const [tab, setTab] = useState<'hierarchy' | 'identity'>('hierarchy');
  const [localConfig, setLocalConfig] = useState<ClubConfig>(config);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [expandedDiscs, setExpandedDiscs] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentDiscForUpload, setCurrentDiscForUpload] = useState<string | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentDiscForUpload) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLocalConfig({
          ...localConfig,
          disciplines: localConfig.disciplines.map(d => 
            d.id === currentDiscForUpload ? { ...d, icon: base64String } : d
          )
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = (e: React.MouseEvent, discId: string) => {
    e.stopPropagation();
    setCurrentDiscForUpload(discId);
    fileInputRef.current?.click();
  };

  return (
    <div className="p-4 md:p-12 max-w-5xl mx-auto animate-fade-in pb-32 md:pb-40">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      
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
            const hasCustomIcon = disc.icon && (disc.icon.startsWith('data:') || disc.icon.startsWith('http'));

            return (
              <div key={disc.id} className={`bg-white dark:bg-[#0f1219] rounded-3xl border transition-all ${isExpanded ? 'border-primary-500/20 shadow-xl' : 'border-slate-200 dark:border-white/5 shadow-sm'}`}>
                <div onClick={() => toggleDisc(disc.id)} className="p-5 md:p-8 flex flex-col md:flex-row justify-between items-center gap-4 cursor-pointer select-none">
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="relative group">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-slate-200 dark:border-white/10 shadow-inner">
                          {hasCustomIcon ? (
                             <img src={disc.icon} className="w-full h-full object-cover" />
                          ) : (
                             <ImageIcon size={32} className="text-slate-300" />
                          )}
                        </div>
                        <button 
                            onClick={(e) => triggerUpload(e, disc.id)}
                            className="absolute -bottom-1 -right-1 bg-primary-600 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                        >
                            <Camera size={14} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <input value={disc.name} onClick={e => e.stopPropagation()} onChange={e => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(d => d.id === disc.id ? {...d, name: e.target.value.toUpperCase()} : d)})} className="bg-transparent text-xl md:text-3xl font-black uppercase tracking-tighter outline-none w-full dark:text-white truncate" placeholder="NOMBRE DE DISCIPLINA" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-1">{disc.categories.length} CATEGORÍAS REGISTRADAS</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); if(confirm('¿Eliminar disciplina?')) setLocalConfig({...localConfig, disciplines: localConfig.disciplines.filter(d => d.id !== disc.id)}) }}
                        className="p-3 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                      <ChevronDown size={24} className={`transition-transform duration-500 text-slate-400 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 md:p-8 pt-0 border-t border-slate-100 dark:border-white/5">
                    <div className="mt-8 flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-full md:w-1/3 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-white/5 flex flex-col items-center text-center">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Identidad Visual</label>
                            <div className="w-32 h-32 rounded-full bg-white dark:bg-slate-800 shadow-2xl mb-6 overflow-hidden flex items-center justify-center border-4 border-white dark:border-slate-700">
                                {hasCustomIcon ? <img src={disc.icon} className="w-full h-full object-cover" /> : <Shield size={48} className="text-slate-200" />}
                            </div>
                            <button onClick={(e) => triggerUpload(e, disc.id)} className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all">
                                <Upload size={14} /> Subir Escudo/Avatar
                            </button>
                            <p className="mt-4 text-[9px] text-slate-400 uppercase leading-relaxed font-bold px-4">Se recomienda una imagen cuadrada de al menos 400x400px</p>
                        </div>
                        
                        <div className="flex-1 w-full space-y-6">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 border-b border-slate-100 dark:border-white/5 pb-2">Gestión de Categorías</h4>
                            {/* Aquí iría el resto del mapeo de categorías existente... */}
                            <button onClick={() => {/* Lógica add cat */}} className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-primary-600 hover:text-primary-600 transition-all">
                                + Añadir Nueva Categoría
                            </button>
                        </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <button onClick={addDiscipline} className="w-full py-12 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2.5rem] text-slate-400 bg-white/50 dark:bg-white/5 font-black uppercase tracking-[0.3em] text-[11px] transition-all hover:border-primary-600 hover:text-primary-600 flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Plus size={24} />
              </div>
              Nueva Disciplina Deportiva
          </button>
        </div>
      )}
    </div>
  );
};

export default MasterData;
