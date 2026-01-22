
import React, { useState } from 'react';
import { ClubConfig, Discipline, Category, Metric } from '../types';
import { Save, Plus, Trash2, Trophy, Settings, LayoutGrid, X, CheckCircle, Loader2, Camera } from 'lucide-react';

interface MasterDataProps {
  config: ClubConfig;
  onSave: (config: ClubConfig) => Promise<void>;
}

const MasterData: React.FC<MasterDataProps> = ({ config, onSave }) => {
  const [tab, setTab] = useState<'hierarchy' | 'identity'>('hierarchy');
  const [localConfig, setLocalConfig] = useState<ClubConfig>(config);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(localConfig);
    setIsSaving(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const addDiscipline = () => {
    const newDisc: Discipline = { 
        id: crypto.randomUUID(), 
        name: 'NUEVA DISCIPLINA', 
        categories: [] 
    };
    setLocalConfig({ ...localConfig, disciplines: [...localConfig.disciplines, newDisc] });
  };

  const addCategory = (discId: string) => {
    setLocalConfig({
      ...localConfig,
      disciplines: localConfig.disciplines.map(d => 
        d.id === discId ? { 
          ...d, 
          categories: [...d.categories, { id: crypto.randomUUID(), name: 'NUEVA CATEGORÍA', metrics: [] }] 
        } : d
      )
    });
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
              metrics: [...c.metrics, { id: crypto.randomUUID(), name: 'MÉTRICA', weight: 1 }] 
            } : c
          )
        } : d
      )
    });
  };

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter leading-none text-slate-900 dark:text-white">Datos Maestros</h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-4 flex items-center gap-2">
            <span className="w-8 h-px bg-primary-500"></span> Definición de ADN Institucional
          </p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className={`group flex items-center gap-3 px-12 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest transition-all ${showSaved ? 'bg-emerald-500 text-white' : 'bg-slate-900 dark:bg-primary-600 text-white hover:scale-105 active:scale-95 shadow-2xl shadow-primary-500/20'}`}
        >
          {isSaving ? <Loader2 className="animate-spin" size={20} /> : (showSaved ? <CheckCircle size={20} /> : <Save size={20} />)}
          <span>{isSaving ? 'Sincronizando' : (showSaved ? 'Sincronizado' : 'Guardar Cambios')}</span>
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
            <p className="mt-2 text-slate-300 dark:text-slate-600 text-[10px] font-medium">Se recomienda PNG transparente 512x512</p>
          </div>
        </div>
      )}

      {tab === 'hierarchy' && (
        <div className="space-y-12 pb-32 animate-fade-in">
          {localConfig.disciplines.map(disc => (
            <div key={disc.id} className="bg-white dark:bg-[#0f1219] rounded-[4rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500">
              <div className="p-10 bg-slate-50 dark:bg-white/5 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="p-5 bg-primary-600 rounded-[1.5rem] text-white shadow-2xl shadow-primary-500/30">
                    <Trophy size={24}/>
                  </div>
                  <input 
                    value={disc.name} 
                    onChange={e => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(d => d.id === disc.id ? {...d, name: e.target.value.toUpperCase()} : d)})} 
                    className="bg-transparent text-3xl font-black uppercase tracking-tighter outline-none focus:text-primary-500 transition-colors w-full"
                  />
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <button 
                    onClick={() => addCategory(disc.id)} 
                    className="flex-1 md:flex-none px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all"
                  >
                    + Añadir Categoría
                  </button>
                  <button 
                    onClick={() => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.filter(d => d.id !== disc.id)})} 
                    className="p-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              </div>

              <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white dark:bg-[#0f1219]">
                {disc.categories.map(cat => (
                  <div key={cat.id} className="bg-slate-50 dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 group">
                    <div className="flex justify-between items-center mb-8">
                      <input 
                        value={cat.name} 
                        onChange={e => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(d => d.id === disc.id ? {...d, categories: d.categories.map(c => c.id === cat.id ? {...c, name: e.target.value.toUpperCase()} : c)} : d)})} 
                        className="bg-transparent font-black uppercase text-sm tracking-[0.2em] outline-none text-slate-700 dark:text-slate-300 focus:text-primary-500 transition-colors"
                      />
                      <button 
                        onClick={() => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(d => d.id === disc.id ? {...d, categories: d.categories.filter(c => c.id !== cat.id)} : d)})} 
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {cat.metrics.map(m => (
                        <div key={m.id} className="flex gap-3 items-center bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-white/5 group/metric shadow-sm">
                          <input 
                            value={m.name} 
                            onChange={e => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(d => d.id === disc.id ? {...d, categories: d.categories.map(c => c.id === cat.id ? {...c, metrics: c.metrics.map(met => met.id === m.id ? {...met, name: e.target.value.toUpperCase()} : met)} : c)} : d)})} 
                            className="flex-1 px-3 text-[11px] font-black uppercase tracking-widest outline-none bg-transparent" 
                            placeholder="MÉTRICA (EJ: VELOCIDAD)" 
                          />
                          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl">
                            <span className="text-[9px] font-black text-slate-400">PESO</span>
                            <input 
                                type="number" 
                                min="1" 
                                max="10" 
                                value={m.weight} 
                                onChange={e => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(d => d.id === disc.id ? {...d, categories: d.categories.map(c => c.id === cat.id ? {...c, metrics: c.metrics.map(met => met.id === m.id ? {...met, weight: parseInt(e.target.value) || 1} : met)} : c)} : d)})} 
                                className="w-10 text-center font-black text-xs text-primary-500 bg-transparent outline-none" 
                            />
                          </div>
                          <button 
                            onClick={() => setLocalConfig({...localConfig, disciplines: localConfig.disciplines.map(d => d.id === disc.id ? {...d, categories: d.categories.map(c => c.id === cat.id ? {...c, metrics: c.metrics.filter(met => met.id !== m.id)} : c)} : d)})} 
                            className="p-2 text-slate-200 hover:text-red-500 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => addMetric(disc.id, cat.id)} 
                        className="w-full py-5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-primary-600 hover:border-primary-600 transition-all active:scale-[0.98]"
                      >
                        + Nueva Métrica de Puntaje
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <button 
            onClick={addDiscipline} 
            className="w-full py-24 border-4 border-dashed border-slate-200 dark:border-white/5 rounded-[4rem] text-slate-400 hover:text-primary-600 hover:border-primary-600 bg-white/30 dark:bg-white/5 font-black uppercase tracking-[0.4em] transition-all hover:scale-[1.01] active:scale-[0.99] group"
          >
            <div className="flex flex-col items-center gap-6">
                <div className="p-8 bg-slate-100 dark:bg-white/10 rounded-[2.5rem] group-hover:bg-primary-600 group-hover:text-white transition-all">
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
