
import React, { useState, useRef, useEffect } from 'react';
import { ClubConfig, Discipline, Branch, Category, Metric } from '../types';
import { 
  Save, Plus, Trash2, CheckCircle, Loader2, Camera, ChevronDown, 
  Image as ImageIcon, User, Users, Settings2, Activity, Shield, 
  Palette, Database, Globe, ChevronRight
} from 'lucide-react';

interface MasterDataProps {
  config: ClubConfig;
  onSave: (config: ClubConfig) => Promise<void>;
}

// Added SportIcon component for export as required by Squads.tsx
export const SportIcon: React.FC<{ id: string; size: number }> = ({ id, size }) => {
  return <Shield size={size} />;
};

const PREDEFINED_SPORTS = ['Fútbol', 'Básquet', 'Rugby', 'Vóley', 'Hockey', 'Otro'];

const MasterData: React.FC<MasterDataProps> = ({ config, onSave }) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'identity'>('matrix');
  const [localConfig, setLocalConfig] = useState<ClubConfig>(config);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [expandedSport, setExpandedSport] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

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
      name: 'NUEVA DISCIPLINA', 
      type: 'Otro',
      branches: [
        { gender: 'Masculino', categories: [] },
        { gender: 'Femenino', categories: [] }
      ] 
    };
    setLocalConfig({ ...localConfig, disciplines: [...localConfig.disciplines, newSport] });
    setExpandedSport(id);
  };

  const addCategory = (sportId: string, gender: string) => {
    setLocalConfig({
      ...localConfig,
      disciplines: localConfig.disciplines.map(s => {
        if (s.id !== sportId) return s;
        return {
          ...s,
          branches: s.branches.map(b => b.gender === gender ? {
            ...b,
            categories: [...b.categories, { id: crypto.randomUUID(), name: 'NUEVA CAT', metrics: [] }]
          } : b)
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
          branches: s.branches.map(b => b.gender === gender ? {
            ...b,
            categories: b.categories.map(c => c.id === catId ? {
              ...c,
              metrics: [...c.metrics, { id: crypto.randomUUID(), name: 'MÉTRICA', weight: 1 }]
            } : c)
          } : b)
        };
      })
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalConfig({ ...localConfig, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 md:p-12 max-w-6xl mx-auto animate-fade-in pb-40">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Configuración</h2>
          <div className="flex gap-6 mt-6">
            <button 
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'matrix' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Database size={14} /> Matriz Deportiva
            </button>
            <button 
              onClick={() => setActiveTab('identity')}
              className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'identity' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Palette size={14} /> Identidad Club
            </button>
          </div>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving} 
          className={`flex items-center gap-3 px-10 py-5 rounded-3xl font-black uppercase text-xs tracking-widest transition-all ${showSaved ? 'bg-emerald-500 text-white' : 'bg-primary-600 text-white shadow-2xl hover:scale-105 active:scale-95'}`}
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : (showSaved ? <CheckCircle size={18} /> : <Save size={18} />)}
          <span>{isSaving ? 'Guardando' : (showSaved ? 'Sincronizar' : 'Guardar Todo')}</span>
        </button>
      </header>

      {activeTab === 'matrix' && (
        <div className="space-y-6 animate-fade-in">
          {localConfig.disciplines.map(sport => (
            <div key={sport.id} className="bg-white dark:bg-[#0f1219] rounded-[2.5rem] border border-slate-200 dark:border-white/5 overflow-hidden transition-all">
              <div 
                onClick={() => setExpandedSport(expandedSport === sport.id ? null : sport.id)}
                className="p-8 flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-primary-500">
                    <Shield size={28} />
                  </div>
                  <div>
                    <input 
                      value={sport.name} 
                      onClick={e => e.stopPropagation()}
                      onChange={e => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(s => s.id === sport.id ? {...s, name: e.target.value.toUpperCase()} : s)})}
                      className="bg-transparent font-black text-2xl uppercase tracking-tighter dark:text-white outline-none"
                    />
                    <select 
                      value={sport.type}
                      onClick={e => e.stopPropagation()}
                      onChange={e => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(s => s.id === sport.id ? {...s, type: e.target.value as any} : s)})}
                      className="block mt-1 bg-transparent text-[9px] font-black uppercase text-slate-400 tracking-widest outline-none"
                    >
                      {PREDEFINED_SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setLocalConfig({...localConfig, disciplines: localConfig.disciplines.filter(d => d.id !== sport.id)}); }}
                    className="p-3 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                  <ChevronDown className={`transition-transform duration-500 ${expandedSport === sport.id ? 'rotate-180 text-primary-500' : 'text-slate-600'}`} />
                </div>
              </div>

              {expandedSport === sport.id && (
                <div className="p-10 pt-0 grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                  {sport.branches.map(branch => (
                    <div key={branch.gender} className="bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] p-8 border border-slate-100 dark:border-white/5">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="flex items-center gap-3 font-black uppercase text-sm tracking-widest dark:text-white">
                          <User size={18} className={branch.gender === 'Masculino' ? 'text-blue-500' : 'text-pink-500'} />
                          {branch.gender}
                        </h4>
                        <button onClick={() => addCategory(sport.id, branch.gender)} className="p-2 bg-primary-600/10 text-primary-600 rounded-xl hover:scale-110 transition-all">
                          <Plus size={18} />
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        {branch.categories.map(cat => (
                          <div key={cat.id} className="bg-white dark:bg-[#0f1219] p-6 rounded-2xl shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                              <input 
                                value={cat.name} 
                                onChange={e => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(s => s.id === sport.id ? {...s, branches: s.branches.map(b => b.gender === branch.gender ? {...b, categories: b.categories.map(c => c.id === cat.id ? {...c, name: e.target.value.toUpperCase()} : c)} : b)} : s)})}
                                className="bg-transparent font-black uppercase text-xs tracking-widest dark:text-white outline-none flex-1"
                              />
                              <button onClick={() => addMetric(sport.id, branch.gender, cat.id)} className="ml-4 flex items-center gap-1 text-[8px] font-black uppercase text-primary-500 hover:underline">
                                <Plus size={10} /> MÉTRICA
                              </button>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              {cat.metrics.map(m => (
                                <div key={m.id} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                                  <input 
                                    value={m.name}
                                    onChange={e => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(s => s.id === sport.id ? {...s, branches: s.branches.map(b => b.gender === branch.gender ? {...b, categories: b.categories.map(c => c.id === cat.id ? {...c, metrics: c.metrics.map(met => met.id === m.id ? {...met, name: e.target.value.toUpperCase()} : met)} : c)} : b)} : s)})}
                                    className="bg-transparent text-[10px] font-bold uppercase tracking-wider dark:text-slate-400 outline-none flex-1"
                                    placeholder="Nombre"
                                  />
                                  <input 
                                    type="number" 
                                    value={m.weight} 
                                    onChange={e => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(s => s.id === sport.id ? {...s, branches: s.branches.map(b => b.gender === branch.gender ? {...b, categories: b.categories.map(c => c.id === cat.id ? {...c, metrics: c.metrics.map(met => met.id === m.id ? {...met, weight: parseInt(e.target.value) || 1} : met)} : c)} : b)} : s)})}
                                    className="w-10 bg-white dark:bg-slate-700 text-center text-[10px] font-black rounded" 
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <button onClick={addSport} className="w-full py-10 border-4 border-dashed border-slate-100 dark:border-white/5 rounded-[2.5rem] flex flex-col items-center gap-4 text-slate-400 hover:text-primary-600 hover:border-primary-600 transition-all">
            <Plus size={32} />
            <span className="font-black uppercase tracking-[0.3em] text-[10px]">Añadir Disciplina Deportiva</span>
          </button>
        </div>
      )}

      {activeTab === 'identity' && (
        <div className="bg-white dark:bg-[#0f1219] rounded-[3rem] p-12 border border-slate-200 dark:border-white/5 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Nombre Institucional</label>
                <input 
                  value={localConfig.name}
                  onChange={e => setLocalConfig({...localConfig, name: e.target.value.toUpperCase()})}
                  className="w-full bg-slate-50 dark:bg-white/5 p-6 rounded-3xl font-black text-2xl uppercase tracking-tighter dark:text-white outline-none border border-transparent focus:border-primary-600/30 transition-all"
                  placeholder="EJ: CLUB ATLÉTICO EJEMPLO"
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Color Primario</label>
                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-3xl">
                    <input type="color" value={localConfig.primaryColor} onChange={e => setLocalConfig({...localConfig, primaryColor: e.target.value})} className="w-12 h-12 rounded-full border-none cursor-pointer" />
                    <span className="font-mono text-sm dark:text-slate-400">{localConfig.primaryColor}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Color Secundario</label>
                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-3xl">
                    <input type="color" value={localConfig.secondaryColor} onChange={e => setLocalConfig({...localConfig, secondaryColor: e.target.value})} className="w-12 h-12 rounded-full border-none cursor-pointer" />
                    <span className="font-mono text-sm dark:text-slate-400">{localConfig.secondaryColor}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-12 bg-slate-50 dark:bg-white/5 rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10 relative group">
              <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
              <div className="w-48 h-48 rounded-full bg-white dark:bg-slate-900 shadow-2xl flex items-center justify-center overflow-hidden mb-8 border-4 border-white dark:border-slate-800">
                {localConfig.logoUrl ? <img src={localConfig.logoUrl} className="w-full h-full object-contain" /> : <Shield size={64} className="text-slate-200" />}
              </div>
              <button 
                onClick={() => logoInputRef.current?.click()}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-primary-600 text-white rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-110 transition-all"
              >
                <Camera size={14} /> Cambiar Logo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterData;
