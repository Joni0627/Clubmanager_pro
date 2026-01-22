
import React, { useState } from 'react';
import { DisciplineConfig, CategoryConfig, MetricDefinition, ClubConfig } from '../types';
import { Search, Plus, Trash2, Edit2, Shield, Box, Settings, Trophy, ChevronRight, Save, CheckCircle, Loader2, Layers, X } from 'lucide-react';

interface MasterDataProps {
    clubConfig: ClubConfig;
    setClubConfig: (config: ClubConfig) => void;
}

const MasterData: React.FC<MasterDataProps> = ({ clubConfig, setClubConfig }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'hierarchy'>('hierarchy');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [disciplines, setDisciplines] = useState<DisciplineConfig[]>(clubConfig.disciplines || []);

  const handleSaveAll = async () => {
      setIsSaving(true);
      try {
          await setClubConfig({ ...clubConfig, disciplines });
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2000);
      } finally {
          setIsSaving(false);
      }
  };

  const addDiscipline = () => {
    const newDisc: DisciplineConfig = {
      id: crypto.randomUUID(),
      name: 'Nueva Disciplina',
      categories: []
    };
    setDisciplines([...disciplines, newDisc]);
  };

  const addCategory = (discId: string) => {
    setDisciplines(disciplines.map(d => {
      if (d.id === discId) {
        return {
          ...d,
          categories: [...d.categories, { id: crypto.randomUUID(), name: 'Nueva Categoría', metrics: [] }]
        };
      }
      return d;
    }));
  };

  const addMetric = (discId: string, catId: string) => {
    setDisciplines(disciplines.map(d => {
      if (d.id === discId) {
        return {
          ...d,
          categories: d.categories.map(c => {
            if (c.id === catId) {
              return {
                ...c,
                metrics: [...c.metrics, { id: crypto.randomUUID(), name: 'Nueva Métrica', weight: 1 }]
              };
            }
            return c;
          })
        };
      }
      return d;
    }));
  };

  const updateMetric = (discId: string, catId: string, metricId: string, field: keyof MetricDefinition, value: any) => {
    setDisciplines(disciplines.map(d => {
      if (d.id === discId) {
        return {
          ...d,
          categories: d.categories.map(c => {
            if (c.id === catId) {
              return {
                ...c,
                metrics: c.metrics.map(m => m.id === metricId ? { ...m, [field]: value } : m)
              };
            }
            return c;
          })
        };
      }
      return d;
    }));
  };

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-12">
        <div>
            <h2 className="text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Parámetros Maestros</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Estructura deportiva y métricas de evaluación</p>
        </div>
        <button 
            onClick={handleSaveAll}
            disabled={isSaving}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95"
        >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : (showSuccess ? <CheckCircle size={20} /> : <Save size={20} />)}
            {isSaving ? 'Sincronizando' : (showSuccess ? 'Completado' : 'Guardar Cambios')}
        </button>
      </div>

      <div className="flex gap-4 mb-10">
         <button onClick={() => setActiveTab('hierarchy')} className={`px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'hierarchy' ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20' : 'bg-white dark:bg-slate-800 text-slate-500'}`}>
            Estructura y Pesas
         </button>
         <button onClick={() => setActiveTab('settings')} className={`px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'settings' ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20' : 'bg-white dark:bg-slate-800 text-slate-500'}`}>
            Identidad Visual
         </button>
      </div>

      {activeTab === 'hierarchy' && (
        <div className="space-y-8 pb-20">
            {disciplines.map((disc) => (
                <div key={disc.id} className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm">
                    <div className="bg-slate-50 dark:bg-slate-950/50 p-8 flex justify-between items-center border-b border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-primary-600 rounded-[1.5rem] text-white shadow-xl shadow-primary-500/20">
                                <Trophy size={24} />
                            </div>
                            <input 
                                value={disc.name}
                                onChange={(e) => setDisciplines(disciplines.map(d => d.id === disc.id ? {...d, name: e.target.value} : d))}
                                className="bg-transparent text-2xl font-black text-slate-800 dark:text-white outline-none uppercase tracking-tighter"
                            />
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => addCategory(disc.id)} className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                                <Plus size={16}/> Nueva Categoría
                            </button>
                        </div>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {disc.categories.map((cat) => (
                            <div key={cat.id} className="bg-slate-50 dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-inner">
                                <div className="flex justify-between items-center mb-6">
                                    <input 
                                        value={cat.name}
                                        onChange={(e) => setDisciplines(disciplines.map(d => d.id === disc.id ? {...d, categories: d.categories.map(c => c.id === cat.id ? {...c, name: e.target.value} : c)} : d))}
                                        className="bg-transparent font-black text-slate-800 dark:text-white outline-none uppercase tracking-widest text-[12px]"
                                    />
                                    <button onClick={() => setDisciplines(disciplines.map(d => d.id === disc.id ? {...d, categories: d.categories.filter(c => c.id !== cat.id)} : d))} className="text-slate-400 hover:text-red-500 transition-colors"><X size={16} /></button>
                                </div>
                                <div className="space-y-3">
                                    {cat.metrics.map((metric) => (
                                        <div key={metric.id} className="flex gap-3 items-center">
                                            <input 
                                                value={metric.name}
                                                onChange={(e) => updateMetric(disc.id, cat.id, metric.id, 'name', e.target.value)}
                                                className="flex-1 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold dark:text-white"
                                            />
                                            <input 
                                                type="number" min="1" max="10"
                                                value={metric.weight}
                                                onChange={(e) => updateMetric(disc.id, cat.id, metric.id, 'weight', parseInt(e.target.value) || 1)}
                                                className="w-16 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-black text-primary-500 text-center"
                                            />
                                        </div>
                                    ))}
                                    <button onClick={() => addMetric(disc.id, cat.id)} className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black text-slate-400 hover:text-primary-500 hover:border-primary-500 transition-all uppercase tracking-widest">+ Añadir Métrica</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            <button onClick={addDiscipline} className="w-full py-16 border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[4rem] flex flex-col items-center justify-center text-slate-400 hover:text-primary-500 hover:border-primary-500 transition-all bg-white dark:bg-slate-950/50 group">
                <Plus size={64} className="mb-4 group-hover:scale-125 transition-transform" />
                <span className="text-xl font-black uppercase tracking-[0.3em]">Nueva Disciplina</span>
            </button>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 border border-slate-100 dark:border-white/5 shadow-sm">
             <div className="space-y-8 max-w-2xl">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre del Club</label>
                    <input 
                        value={clubConfig.name}
                        onChange={(e) => setClubConfig({...clubConfig, name: e.target.value})}
                        className="w-full p-5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl text-xl font-black dark:text-white"
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logo Institucional (URL)</label>
                    <input 
                        value={clubConfig.logoUrl}
                        onChange={(e) => setClubConfig({...clubConfig, logoUrl: e.target.value})}
                        className="w-full p-5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold dark:text-white"
                        placeholder="https://images.com/logo.png"
                    />
                 </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default MasterData;
