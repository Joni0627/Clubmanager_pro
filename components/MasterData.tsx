
import React, { useState, useRef, useEffect } from 'react';
import { ClubConfig, Discipline, Branch, Category, Metric } from '../types';
import { 
  Save, Plus, Trash2, LayoutGrid, X, CheckCircle, 
  Loader2, Camera, ChevronDown, Upload, Image as ImageIcon,
  User, Users, Settings2, Activity, Shield, Sparkles, PlusCircle
} from 'lucide-react';

interface MasterDataProps {
  config: ClubConfig;
  onSave: (config: ClubConfig) => Promise<void>;
}

export const SportIcon: React.FC<{ id: string; size: number }> = ({ id, size }) => {
  return <Shield size={size} />;
};

const MasterData: React.FC<MasterDataProps> = ({ config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<ClubConfig>(config);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [expandedSport, setExpandedSport] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentSportForUpload, setCurrentSportForUpload] = useState<string | null>(null);

  // Sincronizar localConfig si config cambia (ej: cuando carga de DB)
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(localConfig);
    setIsSaving(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const addSport = () => {
    const id = crypto.randomUUID();
    const newSport: Discipline = { 
      id, 
      name: 'NUEVO DEPORTE', 
      icon: '', 
      branches: [
        { 
          gender: 'Masculino', 
          categories: [{ id: crypto.randomUUID(), name: 'PRIMERA', metrics: [] }] 
        },
        { 
          gender: 'Femenino', 
          categories: [{ id: crypto.randomUUID(), name: 'PRIMERA', metrics: [] }] 
        }
      ] 
    };
    const updated = { ...localConfig, disciplines: [...localConfig.disciplines, newSport] };
    setLocalConfig(updated);
    setExpandedSport(id);
  };

  const removeSport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de eliminar este deporte y toda su configuración?')) {
      setLocalConfig({
        ...localConfig,
        disciplines: localConfig.disciplines.filter(d => d.id !== id)
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentSportForUpload) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLocalConfig({
          ...localConfig,
          disciplines: localConfig.disciplines.map(d => 
            d.id === currentSportForUpload ? { ...d, icon: base64String } : d
          )
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const addCategory = (sportId: string, gender: string) => {
    setLocalConfig({
      ...localConfig,
      disciplines: localConfig.disciplines.map(s => {
        if (s.id !== sportId) return s;
        return {
          ...s,
          branches: s.branches.map(b => {
            if (b.gender !== gender) return b;
            return {
              ...b,
              categories: [...b.categories, { id: crypto.randomUUID(), name: 'NUEVA CAT', metrics: [] }]
            };
          })
        };
      })
    });
  };

  const removeCategory = (sportId: string, gender: string, catId: string) => {
    setLocalConfig({
      ...localConfig,
      disciplines: localConfig.disciplines.map(s => {
        if (s.id !== sportId) return s;
        return {
          ...s,
          branches: s.branches.map(b => {
            if (b.gender !== gender) return b;
            return {
              ...b,
              categories: b.categories.filter(c => c.id !== catId)
            };
          })
        };
      })
    });
  };

  const addMetric = (sportId: string, gender: string, catId: string) => {
    setLocalConfig({
      ...localConfig,
      disciplines: localConfig.disciplines.map(s => {
        if (s.id !== sportId) return s;
        return {
          ...s,
          branches: s.branches.map(b => {
            if (b.gender !== gender) return b;
            return {
              ...b,
              categories: b.categories.map(c => {
                if (c.id !== catId) return c;
                return {
                  ...c,
                  metrics: [...c.metrics, { id: crypto.randomUUID(), name: 'NUEVA MÉTRICA', weight: 1 }]
                };
              })
            };
          })
        };
      })
    });
  };

  return (
    <div className="p-4 md:p-12 max-w-6xl mx-auto animate-fade-in pb-40">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
        <div>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-slate-900 dark:text-white">Matriz Deportiva</h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-4 flex items-center gap-3">
            <span className="w-12 h-1 bg-primary-600"></span> Configuración de Disciplinas y Ramas
          </p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving || localConfig.disciplines.length === 0} 
          className={`flex items-center gap-3 px-10 py-5 rounded-3xl font-black uppercase text-xs tracking-widest transition-all ${showSaved ? 'bg-emerald-500 text-white' : 'bg-slate-950 dark:bg-primary-600 text-white shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100'}`}
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : (showSaved ? <CheckCircle size={18} /> : <Save size={18} />)}
          <span>{isSaving ? 'Sincronizando' : (showSaved ? 'Guardado' : 'Guardar Matriz')}</span>
        </button>
      </header>

      <div className="space-y-6">
        {localConfig.disciplines.length === 0 ? (
          <div className="bg-white dark:bg-[#0f1219] border-4 border-dashed border-slate-200 dark:border-white/5 rounded-[4rem] p-20 flex flex-col items-center text-center animate-fade-in">
             <div className="w-24 h-24 bg-primary-600/10 rounded-full flex items-center justify-center mb-8">
                <Sparkles size={48} className="text-primary-600 animate-pulse" />
             </div>
             <h3 className="text-3xl font-black uppercase tracking-tighter dark:text-white mb-4">Empieza tu Legado</h3>
             <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] max-w-md leading-relaxed mb-10">
               Tu club está vacío. Define los deportes, géneros y métricas de rendimiento para habilitar el resto de los módulos.
             </p>
             <button onClick={addSport} className="flex items-center gap-3 px-12 py-6 bg-primary-600 text-white rounded-full font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-primary-700 transition-all">
               <PlusCircle size={20} /> Crear Primer Deporte
             </button>
          </div>
        ) : (
          localConfig.disciplines.map(sport => (
            <div key={sport.id} className={`bg-white dark:bg-[#0f1219] rounded-[3rem] border transition-all overflow-hidden ${expandedSport === sport.id ? 'border-primary-500/30 shadow-3xl' : 'border-slate-200 dark:border-white/5 shadow-sm hover:shadow-xl'}`}>
              <div onClick={() => setExpandedSport(expandedSport === sport.id ? null : sport.id)} className="p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6 cursor-pointer group">
                <div className="flex items-center gap-8 w-full md:w-auto">
                  <div className="relative">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-700 shadow-xl">
                      {sport.icon ? <img src={sport.icon} className="w-full h-full object-cover" /> : <ImageIcon size={40} className="text-slate-300" />}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setCurrentSportForUpload(sport.id); fileInputRef.current?.click(); }} className="absolute -bottom-1 -right-1 bg-primary-600 text-white p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform border-4 border-white dark:border-[#0f1219]">
                      <Camera size={14} />
                    </button>
                  </div>
                  <div>
                    <input value={sport.name} onClick={e => e.stopPropagation()} onChange={e => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(s => s.id === sport.id ? {...s, name: e.target.value.toUpperCase()} : s)})} className="bg-transparent text-2xl md:text-4xl font-black uppercase tracking-tighter outline-none w-full dark:text-white" placeholder="NOMBRE DEL DEPORTE" />
                    <div className="flex gap-4 mt-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full">
                        {sport.branches.reduce((acc, b) => acc + b.categories.length, 0)} CATEGORÍAS
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <button onClick={(e) => removeSport(sport.id, e)} className="p-3 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={24} />
                  </button>
                  <ChevronDown size={32} className={`transition-all duration-500 text-slate-400 ${expandedSport === sport.id ? 'rotate-180 text-primary-600' : ''}`} />
                </div>
              </div>

              {expandedSport === sport.id && (
                <div className="p-10 pt-0 border-t border-slate-100 dark:border-white/5 animate-fade-in">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
                    {sport.branches.map(branch => (
                      <div key={branch.gender} className="bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5">
                        <div className="flex justify-between items-center mb-8">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-2xl ${branch.gender === 'Masculino' ? 'bg-blue-500/10 text-blue-500' : 'bg-pink-500/10 text-pink-500'}`}>
                              <User size={20} />
                            </div>
                            <h4 className="text-lg font-black uppercase tracking-tighter dark:text-white">{branch.gender}</h4>
                          </div>
                          <button onClick={() => addCategory(sport.id, branch.gender)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-primary-600 hover:scale-110 transition-all shadow-sm">
                            <Plus size={20} />
                          </button>
                        </div>

                        <div className="space-y-4">
                          {branch.categories.map(cat => (
                            <div key={cat.id} className="bg-white dark:bg-[#0f1219] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-white/5">
                              <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3 flex-1">
                                  <input 
                                    value={cat.name} 
                                    onChange={e => setLocalConfig({
                                      ...localConfig,
                                      disciplines: localConfig.disciplines.map(s => s.id === sport.id ? {
                                        ...s,
                                        branches: s.branches.map(b => b.gender === branch.gender ? {
                                          ...b,
                                          categories: b.categories.map(c => c.id === cat.id ? {...c, name: e.target.value.toUpperCase()} : c)
                                        } : b)
                                      } : s)
                                    })}
                                    className="bg-transparent font-black uppercase text-sm tracking-widest outline-none dark:text-white w-full"
                                  />
                                  <button onClick={() => removeCategory(sport.id, branch.gender, cat.id)} className="text-slate-300 hover:text-red-500 p-1">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                                <button onClick={() => addMetric(sport.id, branch.gender, cat.id)} className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-xl text-[9px] font-black uppercase text-slate-500 hover:text-primary-600 transition-colors">
                                  <Activity size={12} /> + MÉTRICA
                                </button>
                              </div>

                              <div className="grid grid-cols-1 gap-2">
                                {cat.metrics.map(metric => (
                                  <div key={metric.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/80 p-3 rounded-2xl group/metric">
                                    <Settings2 size={14} className="text-slate-300" />
                                    <input 
                                      value={metric.name}
                                      onChange={e => setLocalConfig({
                                        ...localConfig,
                                        disciplines: localConfig.disciplines.map(s => s.id === sport.id ? {
                                          ...s,
                                          branches: s.branches.map(b => b.gender === branch.gender ? {
                                            ...b,
                                            categories: b.categories.map(c => c.id === cat.id ? {
                                              ...c,
                                              metrics: c.metrics.map(m => m.id === metric.id ? {...m, name: e.target.value.toUpperCase()} : m)
                                            } : c)
                                          } : b)
                                        } : s)
                                      })}
                                      className="bg-transparent text-[10px] font-bold uppercase tracking-wider outline-none flex-1 dark:text-slate-300"
                                      placeholder="MÉTRICA..."
                                    />
                                    <div className="flex items-center gap-2">
                                      <span className="text-[8px] font-black text-slate-400">PESO:</span>
                                      <input 
                                        type="number" 
                                        value={metric.weight} 
                                        onChange={e => setLocalConfig({
                                          ...localConfig,
                                          disciplines: localConfig.disciplines.map(s => s.id === sport.id ? {
                                            ...s,
                                            branches: s.branches.map(b => b.gender === branch.gender ? {
                                              ...b,
                                              categories: b.categories.map(c => c.id === cat.id ? {
                                                ...c,
                                                metrics: c.metrics.map(m => m.id === metric.id ? {...m, weight: parseInt(e.target.value) || 1} : m)
                                              } : c)
                                            } : b)
                                          } : s)
                                        })}
                                        className="w-12 bg-white dark:bg-slate-800 rounded-lg text-center font-black text-[10px] py-1 dark:text-white" 
                                      />
                                    </div>
                                  </div>
                                ))}
                                {cat.metrics.length === 0 && <p className="text-[8px] font-black text-slate-400 uppercase text-center py-2 opacity-50 tracking-widest">Añade métricas para evaluar</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {localConfig.disciplines.length > 0 && (
          <button onClick={addSport} className="w-full py-16 border-4 border-dashed border-slate-200 dark:border-white/5 rounded-[4rem] text-slate-400 bg-white/30 dark:bg-white/5 font-black uppercase tracking-[0.4em] text-xs transition-all hover:border-primary-600 hover:text-primary-600 flex flex-col items-center gap-6 group">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all">
              <Plus size={32} />
            </div>
            Añadir Otro Deporte
          </button>
        )}
      </div>
    </div>
  );
};

export default MasterData;
