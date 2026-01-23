
import React, { useState, useEffect, useRef } from 'react';
import { ClubConfig, Discipline, Branch, Category, Metric } from '../types';
import { 
  Save, Plus, Trash2, Shield, Palette, Database, ChevronDown, 
  User, Users, Activity, CheckCircle, Loader2, Camera, Sparkles, 
  X, Image as ImageIcon, LayoutGrid, Settings2, Search, Lock, Unlock, Edit3
} from 'lucide-react';

interface MasterDataProps {
  config: ClubConfig;
  onSave: (config: ClubConfig) => Promise<void>;
}

const MasterData: React.FC<MasterDataProps> = ({ config, onSave }) => {
  const [activeTab, setActiveTab] = useState<'disciplines' | 'matrix' | 'identity'>('disciplines');
  const [localConfig, setLocalConfig] = useState<ClubConfig>(config);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [isEditingEnabled, setIsEditingEnabled] = useState(false);
  
  // States for Matrix View
  const [selectedDiscId, setSelectedDiscId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const discIconRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    setLocalConfig(config);
    if (config.disciplines.length > 0 && !selectedDiscId) {
      setSelectedDiscId(config.disciplines[0].id);
    }
  }, [config]);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(localConfig);
    setIsSaving(false);
    setShowSaved(true);
    setIsEditingEnabled(false); // Bloquear después de guardar
    setTimeout(() => setShowSaved(false), 3000);
  };

  // --- DISCIPLINE ACTIONS ---
  const addDiscipline = () => {
    const id = crypto.randomUUID();
    const newDisc: Discipline = {
      id,
      name: 'NUEVA DISCIPLINA',
      sportType: 'Otro',
      iconUrl: '',
      branches: [
        { gender: 'Masculino', enabled: true, categories: [] },
        { gender: 'Femenino', enabled: false, categories: [] }
      ]
    };
    setLocalConfig({ ...localConfig, disciplines: [...localConfig.disciplines, newDisc] });
    setSelectedDiscId(id);
  };

  const updateDiscIcon = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalConfig({
          ...localConfig,
          disciplines: localConfig.disciplines.map(d => d.id === id ? { ...d, iconUrl: reader.result as string } : d)
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- MATRIX ACTIONS ---
  const addCategory = (discId: string, gender: string) => {
    setLocalConfig({
      ...localConfig,
      disciplines: localConfig.disciplines.map(d => d.id === discId ? {
        ...d,
        branches: d.branches.map(b => b.gender === gender ? {
          ...b,
          categories: [...b.categories, { id: crypto.randomUUID(), name: 'NUEVA CAT', metrics: [] }]
        } : b)
      } : d)
    });
  };

  const addMetric = (discId: string, gender: string, catId: string) => {
    setLocalConfig({
      ...localConfig,
      disciplines: localConfig.disciplines.map(d => d.id === discId ? {
        ...d,
        branches: d.branches.map(b => b.gender === gender ? {
          ...b,
          categories: b.categories.map(c => c.id === catId ? {
            ...c,
            metrics: [...c.metrics, { id: crypto.randomUUID(), name: 'MÉTRICA', weight: 1 }]
          } : c)
        } : b)
      } : d)
    });
  };

  const selectedDiscipline = localConfig.disciplines.find(d => d.id === selectedDiscId);

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto animate-fade-in pb-40">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16">
        <div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none italic">
            Configuración <span className="text-primary-600">Pro</span>
          </h2>
          <div className="flex gap-6 mt-10 overflow-x-auto no-scrollbar pb-2">
            {[
              { id: 'disciplines', label: '1. Disciplinas', icon: Shield },
              { id: 'matrix', label: '2. Matriz Deportiva', icon: Database },
              { id: 'identity', label: '3. Identidad Club', icon: Palette }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all pb-3 border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'text-primary-600 border-primary-600' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <button 
            onClick={() => setIsEditingEnabled(!isEditingEnabled)}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all ${isEditingEnabled ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-200 dark:bg-white/5 text-slate-500'}`}
          >
            {isEditingEnabled ? <Unlock size={16} /> : <Lock size={16} />}
            <span>{isEditingEnabled ? 'Edición Habilitada' : 'Modo Lectura'}</span>
          </button>
          
          <button 
            onClick={handleSave} 
            disabled={isSaving || !isEditingEnabled}
            className={`flex-1 lg:flex-none flex items-center justify-center gap-4 px-10 py-4 rounded-[1.5rem] font-bold uppercase text-[10px] tracking-widest transition-all shadow-2xl ${showSaved ? 'bg-emerald-500 text-white' : 'bg-primary-600 text-white hover:scale-105 active:scale-95 disabled:opacity-30 disabled:grayscale disabled:hover:scale-100'}`}
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : (showSaved ? <CheckCircle size={18} /> : <Save size={18} />)}
            <span>{isSaving ? 'Guardando' : (showSaved ? 'Guardado' : 'Guardar Cambios')}</span>
          </button>
        </div>
      </header>

      {/* --- TAB 1: DISCIPLINAS --- */}
      {activeTab === 'disciplines' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
          {localConfig.disciplines.map(disc => (
            <div key={disc.id} className="bg-white dark:bg-[#0f1219] rounded-[3rem] border border-slate-200 dark:border-white/5 p-10 shadow-sm relative group hover:border-primary-500/30 transition-all flex flex-col items-center">
              {isEditingEnabled && (
                <button 
                  onClick={() => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.filter(d => d.id !== disc.id)})}
                  className="absolute top-8 right-8 text-slate-300 hover:text-red-500 transition-colors animate-fade-in z-10"
                >
                  <Trash2 size={18} />
                </button>
              )}
              
              <div className="flex flex-col items-center mb-8 w-full">
                <input 
                  type="file" 
                  ref={(el) => { discIconRefs.current[disc.id] = el; }}
                  onChange={(e) => updateDiscIcon(disc.id, e)}
                  className="hidden" 
                  accept="image/*"
                />
                <div 
                  onClick={() => isEditingEnabled && discIconRefs.current[disc.id]?.click()}
                  className={`w-32 h-32 rounded-3xl bg-slate-100 dark:bg-white/5 flex items-center justify-center overflow-hidden border-2 border-slate-200 dark:border-white/10 transition-all shadow-inner relative ${isEditingEnabled ? 'cursor-pointer border-dashed hover:border-primary-600' : 'cursor-default border-solid opacity-80'}`}
                >
                  {disc.iconUrl ? (
                    <img src={disc.iconUrl} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={40} className="text-slate-300" />
                  )}
                  {isEditingEnabled && (
                    <div className="absolute inset-0 bg-primary-600/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Camera size={24} className="text-primary-600" />
                    </div>
                  )}
                </div>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-4">Identidad Visual</p>
              </div>

              <div className="w-full relative z-10">
                {isEditingEnabled ? (
                  <input 
                    value={disc.name}
                    onChange={e => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(d => d.id === disc.id ? {...d, name: e.target.value.toUpperCase()} : d)})}
                    placeholder="NOMBRE"
                    className="w-full bg-slate-50 dark:bg-white/5 p-4 rounded-2xl font-black text-2xl uppercase tracking-tighter text-center dark:text-white outline-none border-2 border-transparent focus:border-primary-600/30 transition-all"
                  />
                ) : (
                  <h3 className="w-full font-black text-2xl uppercase tracking-tighter text-center dark:text-white py-4">{disc.name}</h3>
                )}
              </div>
            </div>
          ))}
          
          {isEditingEnabled && (
            <button onClick={addDiscipline} className="border-4 border-dashed border-slate-200 dark:border-white/5 rounded-[3rem] p-16 flex flex-col items-center justify-center gap-6 text-slate-400 hover:text-primary-600 hover:border-primary-600 transition-all bg-white/5 group animate-fade-in">
               <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus size={40} />
               </div>
               <span className="font-bold uppercase text-[10px] tracking-[0.2em]">Nueva Disciplina</span>
            </button>
          )}
        </div>
      )}

      {/* --- TAB 2: MATRIZ DEPORTIVA --- */}
      {activeTab === 'matrix' && (
        <div className="space-y-12 animate-fade-in">
          <div className="bg-white dark:bg-[#0f1219] p-8 rounded-[3rem] border border-slate-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
              <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-primary-600/10 rounded-2xl flex items-center justify-center text-primary-600">
                    <LayoutGrid size={24} />
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Disciplina Activa</h4>
                    <div className="relative group">
                      <select 
                        value={selectedDiscId || ''}
                        onChange={e => setSelectedDiscId(e.target.value)}
                        className="bg-transparent font-black text-2xl uppercase tracking-tighter dark:text-white outline-none mt-1 cursor-pointer pr-8 appearance-none"
                      >
                        {localConfig.disciplines.length === 0 && (
                          <option value="" className="bg-white dark:bg-slate-900 dark:text-white font-sans text-sm p-4">
                            No hay disciplinas
                          </option>
                        )}
                        {localConfig.disciplines.map(d => (
                          <option 
                            key={d.id} 
                            value={d.id} 
                            className="bg-white dark:bg-[#1a1f2b] dark:text-white font-sans text-sm p-4 uppercase tracking-widest font-bold"
                          >
                            {d.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-primary-600 transition-colors">
                        <ChevronDown size={20} />
                      </div>
                    </div>
                  </div>
              </div>
              {selectedDiscipline && (
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-3xl border border-slate-100 dark:border-white/5">
                   <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shadow-sm">
                      <img src={selectedDiscipline.iconUrl || ''} className="w-full h-full object-contain" />
                   </div>
                   <span className="font-bold text-[10px] uppercase tracking-widest text-primary-600">Configuración Técnica</span>
                </div>
              )}
          </div>

          {selectedDiscipline ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               {selectedDiscipline.branches.map(branch => (
                 <div key={branch.gender} className={`rounded-[3.5rem] p-12 border transition-all ${branch.enabled ? 'bg-white dark:bg-[#0f1219] border-slate-200 dark:border-white/5' : 'bg-slate-100/30 dark:bg-white/5 border-transparent opacity-40 grayscale'}`}>
                    <div className="flex justify-between items-center mb-10">
                        <label className={`flex items-center gap-4 ${isEditingEnabled ? 'cursor-pointer' : 'cursor-default'}`}>
                          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${branch.enabled ? 'bg-primary-600 border-primary-600' : 'border-slate-300'}`}>
                              <input 
                                type="checkbox" 
                                checked={branch.enabled} 
                                disabled={!isEditingEnabled}
                                onChange={() => setLocalConfig({
                                  ...localConfig,
                                  disciplines: localConfig.disciplines.map(d => d.id === selectedDiscId ? {
                                    ...d,
                                    branches: d.branches.map(b => b.gender === branch.gender ? {...b, enabled: !b.enabled} : b)
                                  } : d)
                                })}
                                className="hidden"
                              />
                              {branch.enabled && <CheckCircle size={14} className="text-white" />}
                          </div>
                          <h4 className="font-black uppercase text-xl tracking-tighter dark:text-white flex items-center gap-3">
                             <User size={20} className={branch.gender === 'Masculino' ? 'text-blue-500' : 'text-pink-500'} />
                             Rama {branch.gender}
                          </h4>
                        </label>
                        {branch.enabled && isEditingEnabled && (
                          <button onClick={() => addCategory(selectedDiscipline.id, branch.gender)} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full text-[9px] font-bold uppercase tracking-widest hover:scale-105 transition-all">
                             <Plus size={14} /> Nueva Categoría
                          </button>
                        )}
                    </div>

                    {branch.enabled && (
                      <div className="space-y-8">
                        {branch.categories.map(cat => (
                          <div key={cat.id} className="bg-slate-50 dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
                             <div className="flex justify-between items-center mb-6">
                                {isEditingEnabled ? (
                                  <input 
                                    value={cat.name}
                                    onChange={e => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(d => d.id === selectedDiscipline.id ? {...d, branches: d.branches.map(b => b.gender === branch.gender ? {...b, categories: b.categories.map(c => c.id === cat.id ? {...c, name: e.target.value.toUpperCase()} : c)} : b)} : d)})}
                                    placeholder="NOMBRE CATEGORÍA"
                                    className="bg-white dark:bg-slate-800 p-3 rounded-xl font-bold uppercase text-xs tracking-widest text-primary-600 outline-none flex-1 shadow-sm"
                                  />
                                ) : (
                                  <span className="font-black uppercase text-sm tracking-widest text-primary-600">{cat.name}</span>
                                )}
                                
                                {isEditingEnabled && (
                                  <div className="flex items-center gap-4 ml-4">
                                    <button 
                                      onClick={() => addMetric(selectedDiscipline.id, branch.gender, cat.id)} 
                                      className="flex items-center gap-2 px-5 py-2.5 bg-primary-600/10 hover:bg-primary-600 text-primary-600 hover:text-white rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-sm border border-primary-600/20 active:scale-95 group/kpi"
                                    >
                                      <Activity size={14} className="group-hover/kpi:animate-pulse" /> + KPI
                                    </button>
                                    <button 
                                      onClick={() => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(d => d.id === selectedDiscipline.id ? {...d, branches: d.branches.map(b => b.gender === branch.gender ? {...b, categories: b.categories.filter(c => c.id !== cat.id)} : b)} : d)})}
                                      className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                                    >
                                      <X size={18} />
                                    </button>
                                  </div>
                                )}
                             </div>

                             <div className="grid grid-cols-1 gap-3">
                                {cat.metrics.map(metric => (
                                  <div key={metric.id} className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-transparent">
                                     {isEditingEnabled ? (
                                       <input 
                                          value={metric.name}
                                          onChange={e => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(d => d.id === selectedDiscipline.id ? {...d, branches: d.branches.map(b => b.gender === branch.gender ? {...b, categories: b.categories.map(c => c.id === cat.id ? {...c, metrics: c.metrics.map(m => m.id === metric.id ? {...m, name: e.target.value.toUpperCase()} : m)} : c)} : b)} : d)})}
                                          className="bg-transparent text-[10px] font-bold uppercase tracking-widest dark:text-slate-200 outline-none flex-1 border-b border-slate-100 dark:border-white/5"
                                          placeholder="EJ: VELOCIDAD"
                                       />
                                     ) : (
                                       <span className="text-[10px] font-bold uppercase tracking-widest dark:text-slate-400 flex-1">{metric.name}</span>
                                     )}
                                     
                                     <div className="flex items-center gap-3">
                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Peso</span>
                                        <input 
                                          type="number" 
                                          disabled={!isEditingEnabled}
                                          value={metric.weight}
                                          onChange={e => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(d => d.id === selectedDiscipline.id ? {...d, branches: d.branches.map(b => b.gender === branch.gender ? {...b, categories: b.categories.map(c => c.id === cat.id ? {...c, metrics: c.metrics.map(m => m.id === metric.id ? {...m, weight: parseInt(e.target.value) || 1} : m)} : c)} : b)} : d)})}
                                          className={`w-12 text-center font-black text-[10px] py-2 rounded-xl outline-none transition-colors ${isEditingEnabled ? 'bg-slate-100 dark:bg-slate-800' : 'bg-transparent'}`} 
                                        />
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
            </div>
          ) : (
            <div className="py-32 text-center opacity-20">
               <Shield size={64} className="mx-auto mb-6" />
               <p className="text-[10px] font-black uppercase tracking-[0.4em]">Sin estructura técnica definida</p>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 3: IDENTIDAD --- */}
      {activeTab === 'identity' && (
        <div className="bg-white dark:bg-[#0f1219] rounded-[4rem] border border-slate-200 dark:border-white/5 p-16 animate-fade-in shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
            <div className="space-y-12">
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 ml-4">Nombre de la Institución</label>
                {isEditingEnabled ? (
                  <input 
                    value={localConfig.name}
                    onChange={e => setLocalConfig({...localConfig, name: e.target.value.toUpperCase()})}
                    className="w-full bg-slate-50 dark:bg-white/5 p-8 rounded-[2.5rem] font-black text-4xl uppercase tracking-tighter dark:text-white outline-none border-2 border-transparent focus:border-primary-600/30 transition-all shadow-inner"
                    placeholder="NOMBRE DEL CLUB"
                  />
                ) : (
                  <div className="p-8 rounded-[2.5rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                    <h3 className="font-black text-4xl uppercase tracking-tighter dark:text-white leading-none">{localConfig.name}</h3>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 ml-4">Color Principal</label>
                  <div className={`flex items-center gap-6 p-6 rounded-3xl shadow-inner border transition-all ${isEditingEnabled ? 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5' : 'bg-transparent border-transparent'}`}>
                    <input 
                      type="color" 
                      disabled={!isEditingEnabled}
                      value={localConfig.primaryColor} 
                      onChange={e => setLocalConfig({...localConfig, primaryColor: e.target.value})} 
                      className={`w-16 h-16 rounded-2xl border-none p-0 bg-transparent ${isEditingEnabled ? 'cursor-pointer' : 'cursor-default opacity-80'}`} 
                    />
                    <span className="font-mono text-sm font-bold text-slate-500 uppercase">{localConfig.primaryColor}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 ml-4">Color Fondo</label>
                  <div className={`flex items-center gap-6 p-6 rounded-3xl shadow-inner border transition-all ${isEditingEnabled ? 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5' : 'bg-transparent border-transparent'}`}>
                    <input 
                      type="color" 
                      disabled={!isEditingEnabled}
                      value={localConfig.secondaryColor} 
                      onChange={e => setLocalConfig({...localConfig, secondaryColor: e.target.value})} 
                      className={`w-16 h-16 rounded-2xl border-none p-0 bg-transparent ${isEditingEnabled ? 'cursor-pointer' : 'cursor-default opacity-80'}`} 
                    />
                    <span className="font-mono text-sm font-bold text-slate-500 uppercase">{localConfig.secondaryColor}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`flex flex-col items-center justify-center p-16 rounded-[4rem] border-4 border-dashed relative group transition-all ${isEditingEnabled ? 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10' : 'bg-transparent border-transparent'}`}>
              <input type="file" ref={fileInputRef} onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setLocalConfig({...localConfig, logoUrl: reader.result as string});
                  reader.readAsDataURL(file);
                }
              }} accept="image/*" className="hidden" />
              
              <div className="w-64 h-64 rounded-full bg-white dark:bg-slate-900 shadow-3xl flex items-center justify-center overflow-hidden mb-12 border-8 border-white dark:border-slate-800 relative group">
                {localConfig.logoUrl ? (
                  <img src={localConfig.logoUrl} className="w-full h-full object-contain p-8" />
                ) : (
                  <Shield size={80} className="text-slate-100 dark:text-slate-800" />
                )}
                {isEditingEnabled && (
                  <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-primary-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera size={48} className="text-white" />
                  </div>
                )}
              </div>
              
              {isEditingEnabled && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-12 py-5 bg-slate-900 dark:bg-primary-600 text-white rounded-full font-bold uppercase text-[10px] tracking-widest shadow-2xl hover:scale-105 transition-all"
                >
                  Actualizar Escudo Club
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterData;
