
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
    <div className="p-4 md:p-12 max-w-7xl mx-auto animate-fade-in pb-40">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-slate-900 dark:text-white">Configuración</h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[9px] md:text-[10px] mt-3 flex items-center gap-2">
            <span className="w-6 md:w-8 h-px bg-primary-500"></span> ADN Institucional
          </p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className={`group flex items-center justify-center gap-3 w-full md:w-auto px-8 md:px-12 py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] font-black uppercase text-[10px] md:text-xs tracking-widest transition-all ${showSaved ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-900 dark:bg-primary-600 text-white shadow-xl shadow-primary-500/20'}`}
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : (showSaved ? <CheckCircle size={18} /> : <Save size={18} />)}
          <span>{isSaving ? 'Guardando...' : (showSaved ? 'Guardado' : 'Guardar Todo')}</span>
        </button>
      </header>

      <div className="flex flex-wrap gap-2 p-1 bg-slate-200/50 dark:bg-white/5 rounded-2xl md:rounded-[2.5rem] w-full md:w-fit mb-12 backdrop-blur-sm">
        <button 
          onClick={() => setTab('hierarchy')} 
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-[2rem] font-black uppercase text-[9px] md:text-[10px] tracking-[0.1em] md:tracking-[0.2em] transition-all ${tab === 'hierarchy' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-lg' : 'text-slate-500'}`}
        >
          <LayoutGrid size={14} /> Estructura
        </button>
        <button 
          onClick={() => setTab('identity')} 
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-[2rem] font-black uppercase text-[9px] md:text-[10px] tracking-[0.1em] md:tracking-[0.2em] transition-all ${tab === 'identity' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-lg' : 'text-slate-500'}`}
        >
          <Settings size={14} /> Identidad
        </button>
      </div>

      {tab === 'identity' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10 animate-fade-in">
          <div className="lg:col-span-2 space-y-6 md:space-y-10">
            <div className="bg-white dark:bg-[#0f1219] p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-200 dark:border-white/5 space-y-8 shadow-sm">
              <div className="space-y-4">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Nombre Institucional</label>
                <input 
                  value={localConfig.name} 
                  onChange={e => setLocalConfig({...localConfig, name: e.target.value.toUpperCase()})} 
                  className="w-full p-6 md:p-8 bg-slate-50 dark:bg-slate-900 rounded-2xl md:rounded-3xl font-black text-xl md:text-3xl outline-none focus:ring-4 focus:ring-primary-500/10 transition-all uppercase tracking-tighter" 
                  placeholder="NOMBRE DEL CLUB"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">URL Escudo (Link)</label>
                <input 
                  value={localConfig.logoUrl} 
                  onChange={e => setLocalConfig({...localConfig, logoUrl: e.target.value})} 
                  className="w-full p-6 md:p-8 bg-slate-50 dark:bg-slate-900 rounded-2xl md:rounded-3xl font-bold text-xs md:text-sm outline-none transition-all text-slate-500 truncate" 
                  placeholder="https://link-a-tu-logo.png"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-[#0f1219] p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-sm">
                <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3 text-slate-800 dark:text-white">
                  <Palette size={20} className="text-primary-500" /> Colores
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                    <div className="space-y-4">
                        <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Primario</label>
                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                            <input 
                                type="color" 
                                value={localConfig.primaryColor} 
                                onChange={e => setLocalConfig({...localConfig, primaryColor: e.target.value})}
                                className="w-10 h-10 md:w-12 md:h-12 rounded-lg cursor-pointer bg-transparent border-none"
                            />
                            <input 
                                value={localConfig.primaryColor} 
                                onChange={e => setLocalConfig({...localConfig, primaryColor: e.target.value})}
                                className="bg-transparent font-black text-xs md:text-sm uppercase outline-none flex-1 dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Secundario</label>
                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                            <input 
                                type="color" 
                                value={localConfig.secondaryColor} 
                                onChange={e => setLocalConfig({...localConfig, secondaryColor: e.target.value})}
                                className="w-10 h-10 md:w-12 md:h-12 rounded-lg cursor-pointer bg-transparent border-none"
                            />
                            <input 
                                value={localConfig.secondaryColor} 
                                onChange={e => setLocalConfig({...localConfig, secondaryColor: e.target.value})}
                                className="bg-transparent font-black text-xs md:text-sm uppercase outline-none flex-1 dark:text-white"
                            />
                        </div>
                    </div>
                </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0f1219] p-8 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center shadow-sm text-center lg:sticky lg:top-12 h-fit">
            <div 
              className="w-32 h-32 md:w-48 md:h-48 rounded-[2rem] md:rounded-[3rem] bg-slate-50 dark:bg-slate-900 flex items-center justify-center border-4 border-dashed border-slate-200 dark:border-white/10 relative overflow-hidden group shadow-2xl"
              style={{ borderColor: `${localConfig.primaryColor}20` }}
            >
               {localConfig.logoUrl ? (
                 <img src={localConfig.logoUrl} className="w-full h-full object-contain p-4 md:p-8" />
               ) : (
                 <Camera size={32} className="text-slate-200 dark:text-white/10" />
               )}
            </div>
            <h4 className="mt-8 text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">Vista Previa</h4>
            
            <div className="mt-8 md:mt-12 w-full space-y-4">
                <div className="w-full h-10 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-[9px] font-black uppercase tracking-[0.2em] text-white" style={{ backgroundColor: localConfig.primaryColor }}>Primario</div>
                <div className="w-full h-10 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-[9px] font-black uppercase tracking-[0.2em] text-white" style={{ backgroundColor: localConfig.secondaryColor }}>Secundario</div>
            </div>
          </div>
        </div>
      )}

      {tab === 'hierarchy' && (
        <div className="space-y-4 md:space-y-6 animate-fade-in">
          {localConfig.disciplines.map(disc => {
            const isExpanded = expandedDiscs[disc.id];
            return (
              <div key={disc.id} className={`bg-white dark:bg-[#0f1219] rounded-[2rem] md:rounded-[3rem] border transition-all duration-500 ${isExpanded ? 'border-primary-500/30 shadow-2xl ring-1 ring-primary-500/10' : 'border-slate-200 dark:border-white/5 shadow-sm'}`}>
                <div 
                  onClick={() => toggleDisc(disc.id)}
                  className="p-6 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                    <div 
                        className={`p-4 md:p-5 rounded-2xl md:rounded-[1.5rem] text-white transition-all shadow-lg ${isExpanded ? 'scale-105 md:scale-110' : 'bg-slate-800'}`}
                        style={isExpanded ? { backgroundColor: localConfig.primaryColor } : {}}
                    >
                      <Trophy size={20}/>
                    </div>
                    <div className="flex-1">
                      <input 
                        value={disc.name} 
                        onClick={e => e.stopPropagation()}
                        onChange={e => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(d => d.id === disc.id ? {...d, name: e.target.value.toUpperCase()} : d)})} 
                        className="bg-transparent text-xl md:text-3xl font-black uppercase tracking-tighter outline-none w-full dark:text-white"
                        placeholder="DISCIPLINA"
                      />
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Layers size={10} className="text-primary-500" /> {disc.categories.length} Categorías
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
                    <button 
                      onClick={(e) => addCategory(e, disc.id)} 
                      className="flex-1 md:flex-none px-4 md:px-8 py-3 md:py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-xl md:rounded-2xl font-black uppercase text-[8px] md:text-[10px] tracking-widest hover:bg-primary-600 hover:text-white transition-all"
                    >
                      + Categoría
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setLocalConfig({...localConfig, disciplines: localConfig.disciplines.filter(d => d.id !== disc.id)}) }} 
                      className="p-3 text-slate-300 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                    <div className={`p-2 transition-transform duration-500 ${isExpanded ? 'rotate-180 text-primary-500' : 'text-slate-400'}`}>
                      <ChevronDown size={24} />
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-6 md:p-10 pt-0 border-t border-slate-100 dark:border-white/5 animate-slide-down">
                    <div className="grid grid-cols-1 gap-6 md:gap-8 mt-8">
                      {disc.categories.map(cat => (
                        <div key={cat.id} className="bg-slate-50 dark:bg-white/5 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 dark:border-white/5 relative">
                          <div className="flex justify-between items-center mb-6 relative z-10">
                            <input 
                              value={cat.name} 
                              onChange={e => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(d => d.id === disc.id ? {...d, categories: d.categories.map(c => c.id === cat.id ? {...c, name: e.target.value.toUpperCase()} : c)} : d)})} 
                              className="bg-transparent font-black uppercase text-lg md:text-xl tracking-tighter outline-none text-slate-800 dark:text-white"
                              placeholder="CATEGORÍA"
                            />
                            <button 
                              onClick={() => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(d => d.id === disc.id ? {...d, categories: d.categories.filter(c => c.id !== cat.id)} : d)})} 
                              className="p-2 text-slate-300 hover:text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 relative z-10">
                            {cat.metrics.map(m => (
                              <div key={m.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-[8px] font-black text-primary-500 uppercase tracking-widest flex items-center gap-1"><Target size={10} /> Métrica</span>
                                  <button onClick={() => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(d => d.id === disc.id ? {...d, categories: d.categories.map(c => c.id === cat.id ? {...c, metrics: c.metrics.filter(met => met.id !== m.id)} : c)} : d)})} className="text-slate-200 hover:text-red-500"><X size={14} /></button>
                                </div>
                                <input value={m.name} onChange={e => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(d => d.id === disc.id ? {...d, categories: d.categories.map(c => c.id === cat.id ? {...c, metrics: c.metrics.map(met => met.id === m.id ? {...met, name: e.target.value.toUpperCase()} : met)} : c)} : d)})} className="w-full text-xs font-black uppercase outline-none bg-transparent dark:text-white" placeholder="NOMBRE" />
                              </div>
                            ))}
                            <button onClick={() => addMetric(disc.id, cat.id)} className="p-4 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-primary-600 transition-all">+ Métrica</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          <button 
            onClick={addDiscipline} 
            className="w-full py-12 md:py-20 border-4 border-dashed border-slate-200 dark:border-white/5 rounded-[2rem] md:rounded-[3.5rem] text-slate-400 hover:text-primary-600 hover:border-primary-600 bg-white/30 dark:bg-white/5 font-black uppercase tracking-[0.3em] md:tracking-[0.4em] transition-all group"
          >
            <div className="flex flex-col items-center gap-4 md:gap-6">
                <div className="p-6 md:p-8 bg-slate-100 dark:bg-white/10 rounded-[1.5rem] md:rounded-[2.5rem] group-hover:bg-primary-600 group-hover:text-white transition-all shadow-xl">
                    <Plus size={32} />
                </div>
                <span className="text-xs md:text-sm">Crear Disciplina</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default MasterData;
