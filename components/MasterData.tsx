
import React, { useState } from 'react';
import { ClubConfig, Discipline, Category } from '../types';
import { Save, Plus, Trash2, Trophy, Settings, LayoutGrid, X, CheckCircle, Loader2, Camera, ChevronDown, Layers, Target, Palette } from 'lucide-react';

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
    const newDisc: Discipline = { id, name: 'NUEVA DISCIPLINA', categories: [] };
    setLocalConfig({ ...localConfig, disciplines: [...localConfig.disciplines, newDisc] });
    setExpandedDiscs(prev => ({ ...prev, [id]: true }));
  };

  const addCategory = (e: React.MouseEvent, discId: string) => {
    e.stopPropagation();
    setLocalConfig({
      ...localConfig,
      disciplines: localConfig.disciplines.map(d => 
        d.id === discId ? { 
          ...d, 
          categories: [...d.categories, { id: crypto.randomUUID(), name: 'NUEVA CATEGORÍA', metrics: [] }] 
        } : d
      )
    });
    setExpandedDiscs(prev => ({ ...prev, [discId]: true }));
  };

  const addMetric = (discId: string, catId: string) => {
    setLocalConfig({
      ...localConfig,
      disciplines: localConfig.disciplines.map(d => 
        d.id === discId ? { 
          ...d, 
          categories: d.categories.map(c => 
            c.id === catId ? { 
              ...c, 
              metrics: [...c.metrics, { id: crypto.randomUUID(), name: 'NUEVA MÉTRICA', weight: 1 }] 
            } : c
          )
        } : d
      )
    });
  };

  return (
    <div className="p-4 md:p-12 max-w-5xl mx-auto animate-fade-in pb-32 md:pb-40">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 md:mb-12">
        <div className="w-full">
          <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tighter leading-none text-slate-900 dark:text-white">Configuración</h2>
          <div className="h-1 w-12 bg-primary-600 mt-2 rounded-full md:hidden"></div>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[8px] md:text-[10px] mt-2 hidden md:flex items-center gap-2">
            <span className="w-8 h-px bg-primary-500"></span> Gestión Institucional
          </p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className={`group flex items-center justify-center gap-3 w-full md:w-auto px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${showSaved ? 'bg-emerald-500 text-white' : 'bg-slate-900 dark:bg-primary-600 text-white shadow-lg'}`}
        >
          {isSaving ? <Loader2 className="animate-spin" size={16} /> : (showSaved ? <CheckCircle size={16} /> : <Save size={16} />)}
          <span>{isSaving ? 'Sincronizando' : (showSaved ? 'Guardado' : 'Guardar Todo')}</span>
        </button>
      </header>

      <div className="flex gap-2 p-1.5 bg-slate-200/50 dark:bg-white/5 rounded-2xl w-full md:w-fit mb-8 backdrop-blur-sm">
        <button 
          onClick={() => setTab('hierarchy')} 
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black uppercase text-[9px] tracking-wider transition-all ${tab === 'hierarchy' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md' : 'text-slate-500'}`}
        >
          <LayoutGrid size={14} /> Estructura
        </button>
        <button 
          onClick={() => setTab('identity')} 
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black uppercase text-[9px] tracking-wider transition-all ${tab === 'identity' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md' : 'text-slate-500'}`}
        >
          <Settings size={14} /> Identidad
        </button>
      </div>

      {tab === 'identity' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#0f1219] p-6 md:p-10 rounded-[2rem] border border-slate-200 dark:border-white/5 space-y-6 shadow-sm">
              <div className="space-y-3">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Nombre Club</label>
                <input 
                  value={localConfig.name} 
                  onChange={e => setLocalConfig({...localConfig, name: e.target.value.toUpperCase()})} 
                  className="w-full p-4 md:p-6 bg-slate-50 dark:bg-slate-900 rounded-xl font-black text-lg md:text-2xl outline-none focus:ring-2 focus:ring-primary-500/20 transition-all uppercase" 
                  placeholder="NOMBRE"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">URL Logo</label>
                <input 
                  value={localConfig.logoUrl} 
                  onChange={e => setLocalConfig({...localConfig, logoUrl: e.target.value})} 
                  className="w-full p-4 md:p-6 bg-slate-50 dark:bg-slate-900 rounded-xl font-bold text-[10px] md:text-xs outline-none text-slate-500 truncate" 
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="bg-white dark:bg-[#0f1219] p-6 md:p-10 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm">
                <h3 className="text-sm md:text-base font-black uppercase tracking-tighter mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
                  <Palette size={16} className="text-primary-500" /> Colores ADN
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                        <input type="color" value={localConfig.primaryColor} onChange={e => setLocalConfig({...localConfig, primaryColor: e.target.value})} className="w-8 h-8 rounded cursor-pointer bg-transparent border-none" />
                        <span className="text-[10px] font-black text-slate-500">PRIMARIO</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                        <input type="color" value={localConfig.secondaryColor} onChange={e => setLocalConfig({...localConfig, secondaryColor: e.target.value})} className="w-8 h-8 rounded cursor-pointer bg-transparent border-none" />
                        <span className="text-[10px] font-black text-slate-500">SECUNDARIO</span>
                    </div>
                </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0f1219] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center shadow-sm text-center h-fit">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/10 relative overflow-hidden shadow-xl" style={{ borderColor: `${localConfig.primaryColor}40` }}>
               {localConfig.logoUrl ? <img src={localConfig.logoUrl} className="w-full h-full object-contain p-4" /> : <Camera size={24} className="text-slate-300" />}
            </div>
            <div className="mt-6 w-full flex gap-2">
                <div className="h-8 flex-1 rounded-lg shadow-sm" style={{ backgroundColor: localConfig.primaryColor }}></div>
                <div className="h-8 flex-1 rounded-lg shadow-sm" style={{ backgroundColor: localConfig.secondaryColor }}></div>
            </div>
          </div>
        </div>
      )}

      {tab === 'hierarchy' && (
        <div className="space-y-4 animate-fade-in">
          {localConfig.disciplines.map(disc => {
            const isExpanded = expandedDiscs[disc.id];
            return (
              <div key={disc.id} className={`bg-white dark:bg-[#0f1219] rounded-3xl border transition-all ${isExpanded ? 'border-primary-500/20 shadow-xl' : 'border-slate-200 dark:border-white/5 shadow-sm'}`}>
                <div 
                  onClick={() => toggleDisc(disc.id)}
                  className="p-5 md:p-8 flex flex-col md:flex-row justify-between items-center gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className={`w-12 h-12 rounded-xl text-white transition-all flex items-center justify-center shrink-0 ${isExpanded ? 'bg-primary-600' : 'bg-slate-800'}`} style={isExpanded ? { backgroundColor: localConfig.primaryColor } : {}}>
                      <Trophy size={20}/>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <input 
                        value={disc.name} 
                        onClick={e => e.stopPropagation()}
                        onChange={e => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(d => d.id === disc.id ? {...d, name: e.target.value.toUpperCase()} : d)})} 
                        className="bg-transparent text-lg md:text-2xl font-black uppercase tracking-tighter outline-none w-full dark:text-white truncate"
                        placeholder="DISCIPLINA"
                      />
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mt-0.5">{disc.categories.length} CATEGORÍAS</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <button 
                      onClick={(e) => addCategory(e, disc.id)} 
                      className="flex-1 md:flex-none px-4 py-3 bg-slate-100 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-primary-600 hover:text-white transition-all"
                    >
                      + Categoría
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); if(confirm('¿Eliminar?')) setLocalConfig({...localConfig, disciplines: localConfig.disciplines.filter(d => d.id !== disc.id)}) }} 
                      className="p-3 text-slate-300 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                    <ChevronDown size={20} className={`transition-transform duration-500 text-slate-400 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 md:p-8 pt-0 border-t border-slate-100 dark:border-white/5">
                    <div className="grid grid-cols-1 gap-4 mt-6">
                      {disc.categories.map(cat => (
                        <div key={cat.id} className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-white/5 relative">
                          <div className="flex justify-between items-center mb-4">
                            <input 
                              value={cat.name} 
                              onChange={e => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(d => d.id === disc.id ? {...d, categories: d.categories.map(c => c.id === cat.id ? {...c, name: e.target.value.toUpperCase()} : c)} : d)})} 
                              className="bg-transparent font-black uppercase text-sm md:text-base tracking-tighter outline-none text-slate-800 dark:text-white w-full"
                              placeholder="CATEGORÍA"
                            />
                            <button onClick={() => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(d => d.id === disc.id ? {...d, categories: d.categories.filter(c => c.id !== cat.id)} : d)})} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                          </div>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                            {cat.metrics.map(m => (
                              <div key={m.id} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-white/5 flex justify-between items-center">
                                <input value={m.name} onChange={e => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(d => d.id === disc.id ? {...d, categories: d.categories.map(c => c.id === cat.id ? {...c, metrics: c.metrics.map(met => met.id === m.id ? {...met, name: e.target.value.toUpperCase()} : met)} : c)} : d)})} className="text-[9px] font-black uppercase outline-none bg-transparent dark:text-white w-full" placeholder="MÉTRICA" />
                                <button onClick={() => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(d => d.id === disc.id ? {...d, categories: d.categories.map(c => c.id === cat.id ? {...c, metrics: c.metrics.filter(met => met.id !== m.id)} : c)} : d)})} className="text-slate-300 ml-2"><X size={12} /></button>
                              </div>
                            ))}
                            <button onClick={() => addMetric(disc.id, cat.id)} className="p-3 border border-dashed border-slate-300 dark:border-white/10 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:border-primary-600 transition-all">+ Parámetro</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          <button onClick={addDiscipline} className="w-full py-10 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-3xl text-slate-400 bg-white/50 dark:bg-white/5 font-black uppercase tracking-widest transition-all hover:border-primary-600 hover:text-primary-600 flex flex-col items-center gap-3">
              <Plus size={24} />
              <span className="text-[10px]">Nueva Disciplina Deportiva</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MasterData;
