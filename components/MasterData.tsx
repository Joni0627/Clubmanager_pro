
import React, { useState, useRef } from 'react';
import { ClubConfig, Discipline, Branch, Category, Metric } from '../types';
import { 
  Save, Plus, Trash2, LayoutGrid, X, CheckCircle, 
  Loader2, Camera, ChevronDown, Upload, Image as ImageIcon,
  User, Users, Settings2, Activity, Shield
} from 'lucide-react';

interface MasterDataProps {
  config: ClubConfig;
  onSave: (config: ClubConfig) => Promise<void>;
}

// Fix: Defined and exported SportIcon to be used as a fallback in Squads.tsx
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
        { gender: 'Masculino', categories: [] },
        { gender: 'Femenino', categories: [] }
      ] 
    };
    setLocalConfig({ ...localConfig, disciplines: [...localConfig.disciplines, newSport] });
    setExpandedSport(id);
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
            <span className="w-12 h-1 bg-primary-600"></span> Configuración de Alto Rendimiento
          </p>
        </div>
        <button onClick={handleSave} disabled={isSaving} className={`flex items-center gap-3 px-10 py-5 rounded-3xl font-black uppercase text-xs tracking-widest transition-all ${showSaved ? 'bg-emerald-500 text-white' : 'bg-slate-950 dark:bg-primary-600 text-white shadow-2xl'}`}>
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : (showSaved ? <CheckCircle size={18} /> : <Save size={18} />)}
          <span>{isSaving ? 'Sincronizando' : (showSaved ? 'Guardado' : 'Guardar Matriz')}</span>
        </button>
      </header>

      <div className="space-y-6">
        {localConfig.disciplines.map(sport => (
          <div key={sport.id} className={`bg-white dark:bg-[#0f1219] rounded-[3rem] border transition-all overflow-hidden ${expandedSport === sport.id ? 'border-primary-500/30 shadow-3xl' : 'border-slate-200 dark:border-white/5 shadow-sm'}`}>
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
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full">{sport.branches[0].categories.length + sport.branches[1].categories.length} CATEGORÍAS</span>
                  </div>
                </div>
              </div>
              <ChevronDown size={32} className={`transition-all duration-500 text-slate-400 ${expandedSport === sport.id ? 'rotate-180 text-primary-600' : ''}`} />
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
                                className="bg-transparent font-black uppercase text-sm tracking-widest outline-none dark:text-white w-full mr-4"
                              />
                              <button onClick={() => addMetric(sport.id, branch.gender, cat.id)} className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-xl text-[9px] font-black uppercase text-slate-500 hover:text-primary-600">
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
                                  />
                                  <div className="flex items-center gap-2">
                                    <span className="text-[8px] font-black text-slate-400">PESO:</span>
                                    <input type="number" value={metric.weight} className="w-12 bg-white dark:bg-slate-800 rounded-lg text-center font-black text-[10px] py-1 dark:text-white" />
                                  </div>
                                </div>
                              ))}
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
        ))}

        <button onClick={addSport} className="w-full py-16 border-4 border-dashed border-slate-200 dark:border-white/5 rounded-[4rem] text-slate-400 bg-white/30 dark:bg-white/5 font-black uppercase tracking-[0.4em] text-xs transition-all hover:border-primary-600 hover:text-primary-600 flex flex-col items-center gap-6 group">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all">
            <Plus size={32} />
          </div>
          Añadir Nuevo Deporte a la Matriz
        </button>
      </div>
    </div>
  );
};

export default MasterData;
