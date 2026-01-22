
import React, { useState } from 'react';
import { ClubConfig, Discipline, Category, Metric } from '../types';
import { Save, Plus, Trash2, Trophy, Settings, LayoutGrid, X, CheckCircle, Loader2, Camera, ChevronDown, ChevronUp, Layers, Target } from 'lucide-react';

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
    const newDisc: Discipline = { 
        id, 
        name: 'NUEVA DISCIPLINA', 
        categories: [] 
    };
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
    <div className="p-6 md:p-12 max-w-7xl mx-auto animate-fade-in pb-40">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
        <div>
          <h2 className="text-6xl font-black uppercase tracking-tighter leading-none text-slate-900 dark:text-white">Configuración</h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-4 flex items-center gap-2">
            <span className="w-8 h-px bg-primary-500"></span> ADN Institucional & Estructura
          </p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className={`group flex items-center gap-3 px-12 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest transition-all ${showSaved ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-900 dark:bg-primary-600 text-white hover:scale-105 active:scale-95 shadow-2xl shadow-primary-500/20'}`}
        >
          {isSaving ? <Loader2 className="animate-spin" size={20} /> : (showSaved ? <CheckCircle size={20} /> : <Save size={20} />)}
          <span>{isSaving ? 'Sincronizando' : (showSaved ? 'Sincronizado' : 'Guardar Todo')}</span>
        </button>
      </header>

      <div className="flex gap-4 p-2 bg-slate-200/50 dark:bg-white/5 rounded-[2.5rem] w-fit mb-12 backdrop-blur-sm">
        <button 
          onClick={() => setTab('hierarchy')} 
          className={`flex items-center gap-2 px-10 py-4 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] transition-all ${tab === 'hierarchy' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xl' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <LayoutGrid size={16} /> Estructura Deportiva
        </button>
        <button 
          onClick={() => setTab('identity')} 
          className={`flex items-center gap-2 px-10 py-4 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] transition-all ${tab === 'identity' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xl' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <Settings size={16} /> Identidad del Club
        </button>
      </div>

      {tab === 'identity' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-fade-in">
          <div className="lg:col-span-2 bg-white dark:bg-[#0f1219] p-12 rounded-[3.5rem] border border-slate-200 dark:border-white/5 space-y-10 shadow-sm">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Nombre Institucional</label>
              <input 
                value={localConfig.name} 
                onChange={e => setLocalConfig({...localConfig, name: e.target.value.toUpperCase()})} 
                className="w-full p-8 bg-slate-50 dark:bg-slate-900 rounded-3xl font-black text-3xl outline-none focus:ring-4 focus:ring-primary-500/10 transition-all uppercase tracking-tighter" 
                placeholder="EJ: PLEGMA FOOTBALL CLUB"
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">URL del Escudo (Logo)</label>
              <input 
                value={localConfig.logoUrl} 
                onChange={e => setLocalConfig({...localConfig, logoUrl: e.target.value})} 
                className="w-full p-8 bg-slate-50 dark:bg-slate-900 rounded-3xl font-bold text-sm outline-none focus:ring-4 focus:ring-primary-500/10 transition-all text-slate-500" 
                placeholder="https://tu-sitio.com/logo.png"
              />
            </div>
          </div>
          <div className="bg-white dark:bg-[#0f1219] p-12 rounded-[3.5rem] border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center shadow-sm text-center">
            <div className="w-48 h-48 rounded-[3rem] bg-slate-50 dark:bg-slate-900 flex items-center justify-center border-4 border-dashed border-slate-200 dark:border-white/10 relative overflow-hidden group">
               {localConfig.logoUrl ? (
                 <img src={localConfig.logoUrl} className="w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-500" />
               ) : (
                 <Camera size={48} className="text-slate-200 dark:text-white/10" />
               )}
            </div>
            <h4 className="mt-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">Vista Previa Escudo</h4>
          </div>
        </div>
      )}

      {tab === 'hierarchy' && (
        <div className="space-y-6 animate-fade-in">
          {localConfig.disciplines.map(disc => {
            const isExpanded = expandedDiscs[disc.id];
            return (
              <div key={disc.id} className={`bg-white dark:bg-[#0f1219] rounded-[3rem] border transition-all duration-500 ${isExpanded ? 'border-primary-500/30 shadow-2xl ring-1 ring-primary-500/10' : 'border-slate-200 dark:border-white/5 shadow-sm'}`}>
                {/* Discipline Header / Accordion Toggle */}
                <div 
                  onClick={() => toggleDisc(disc.id)}
                  className="p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className={`p-5 rounded-[1.5rem] text-white transition-all shadow-xl ${isExpanded ? 'bg-primary-600 scale-110' : 'bg-slate-800 dark:bg-slate-700'}`}>
                      <Trophy size={24}/>
                    </div>
                    <div className="flex-1">
                      <input 
                        value={disc.name} 
                        onClick={e => e.stopPropagation()}
                        onChange={e => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(d => d.id === disc.id ? {...d, name: e.target.value.toUpperCase()} : d)})} 
                        className="bg-transparent text-3xl font-black uppercase tracking-tighter outline-none focus:text-primary-500 transition-colors w-full"
                        placeholder="NOMBRE DISCIPLINA"
                      />
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Layers size={10} className="text-primary-500" /> {disc.categories.length} Categorías
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <button 
                      onClick={(e) => addCategory(e, disc.id)} 
                      className="flex-1 md:flex-none px-8 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary-600 hover:text-white transition-all"
                    >
                      + Nueva Categoría
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setLocalConfig({...localConfig, disciplines: localConfig.disciplines.filter(d => d.id !== disc.id)}) }} 
                      className="p-4 text-slate-300 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={24} />
                    </button>
                    <div className={`p-2 transition-transform duration-500 ${isExpanded ? 'rotate-180 text-primary-500' : 'text-slate-400'}`}>
                      <ChevronDown size={28} />
                    </div>
                  </div>
                </div>

                {/* Collapsible Content */}
                {isExpanded && (
                  <div className="p-8 md:p-10 pt-0 border-t border-slate-100 dark:border-white/5 animate-slide-down">
                    <div className="grid grid-cols-1 gap-8 mt-10">
                      {disc.categories.map(cat => (
                        <div key={cat.id} className="bg-slate-50 dark:bg-white/5 p-10 rounded-[3rem] border border-slate-100 dark:border-white/5 group relative overflow-hidden">
                          {/* Background Accent */}
                          <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Layers size={80} />
                          </div>

                          <div className="flex justify-between items-center mb-10 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white/10 flex items-center justify-center text-white">
                                  <span className="font-black text-xs">{cat.name.charAt(0)}</span>
                                </div>
                                <input 
                                  value={cat.name} 
                                  onChange={e => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(d => d.id === disc.id ? {...d, categories: d.categories.map(c => c.id === cat.id ? {...c, name: e.target.value.toUpperCase()} : c)} : d)})} 
                                  className="bg-transparent font-black uppercase text-xl tracking-tighter outline-none text-slate-800 dark:text-white focus:text-primary-500 transition-colors"
                                  placeholder="NOMBRE CATEGORÍA"
                                />
                            </div>
                            <button 
                              onClick={() => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(d => d.id === disc.id ? {...d, categories: d.categories.filter(c => c.id !== cat.id)} : d)})} 
                              className="p-3 text-slate-300 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                            {cat.metrics.map(m => (
                              <div key={m.id} className="flex flex-col gap-4 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all group/metric">
                                <div className="flex justify-between items-center">
                                  <span className="text-[9px] font-black text-primary-500 uppercase tracking-widest flex items-center gap-1">
                                    <Target size={12} /> Parámetro
                                  </span>
                                  <button 
                                    onClick={() => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(d => d.id === disc.id ? {...d, categories: d.categories.map(c => c.id === cat.id ? {...c, metrics: c.metrics.filter(met => met.id !== m.id)} : c)} : d)})} 
                                    className="text-slate-200 hover:text-red-500 transition-colors"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                                
                                <input 
                                  value={m.name} 
                                  onChange={e => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(d => d.id === disc.id ? {...d, categories: d.categories.map(c => c.id === cat.id ? {...c, metrics: c.metrics.map(met => met.id === m.id ? {...met, name: e.target.value.toUpperCase()} : met)} : c)} : d)})} 
                                  className="w-full text-sm font-black uppercase tracking-tight outline-none bg-transparent dark:text-white" 
                                  placeholder="EJ: VELOCIDAD" 
                                />
                                
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-white/5">
                                  <span className="text-[9px] font-black text-slate-400 uppercase">Impacto / Peso</span>
                                  <div className="flex items-center gap-3">
                                    <button 
                                      onClick={() => {
                                        const newWeight = Math.max(1, m.weight - 1);
                                        setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(d => d.id === disc.id ? {...d, categories: d.categories.map(c => c.id === cat.id ? {...c, metrics: c.metrics.map(met => met.id === m.id ? {...met, weight: newWeight} : met)} : c)} : d)});
                                      }}
                                      className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400 hover:text-primary-500 transition-all"
                                    >-</button>
                                    <span className="text-xl font-black text-primary-500 min-w-[20px] text-center">{m.weight}</span>
                                    <button 
                                      onClick={() => {
                                        const newWeight = Math.min(10, m.weight + 1);
                                        setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(d => d.id === disc.id ? {...d, categories: d.categories.map(c => c.id === cat.id ? {...c, metrics: c.metrics.map(met => met.id === m.id ? {...met, weight: newWeight} : met)} : c)} : d)});
                                      }}
                                      className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400 hover:text-primary-500 transition-all"
                                    >+</button>
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            <button 
                              onClick={() => addMetric(disc.id, cat.id)} 
                              className="h-full min-h-[140px] border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-primary-600 hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/20 transition-all flex flex-col items-center justify-center gap-2 group/add"
                            >
                              <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-full group-hover/add:bg-primary-600 group-hover/add:text-white transition-all">
                                <Plus size={20} />
                              </div>
                              + Agregar Métrica
                            </button>
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
            className="w-full py-20 border-4 border-dashed border-slate-200 dark:border-white/5 rounded-[3.5rem] text-slate-400 hover:text-primary-600 hover:border-primary-600 bg-white/30 dark:bg-white/5 font-black uppercase tracking-[0.4em] transition-all hover:scale-[1.01] active:scale-[0.99] group"
          >
            <div className="flex flex-col items-center gap-6">
                <div className="p-8 bg-slate-100 dark:bg-white/10 rounded-[2.5rem] group-hover:bg-primary-600 group-hover:text-white transition-all shadow-xl">
                    <Plus size={48} />
                </div>
                <span>Crear Nueva Disciplina Deportiva</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default MasterData;
