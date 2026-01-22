
import React, { useState } from 'react';
import { DisciplineConfig, CategoryConfig, MetricDefinition, ClubConfig } from '../types';
import { Search, Plus, Trash2, Edit2, Shield, Box, Settings, Trophy, ChevronRight, Save, CheckCircle, Loader2, Scale, Layers } from 'lucide-react';

interface MasterDataProps {
    clubConfig: ClubConfig;
    setClubConfig: (config: ClubConfig) => void;
}

const MasterData: React.FC<MasterDataProps> = ({ clubConfig, setClubConfig }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'hierarchy'>('hierarchy');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Estado local para edición de jerarquía
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Configuración Estructural</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Define disciplinas, categorías y pesas de rendimiento</p>
        </div>
        <button 
            onClick={handleSaveAll}
            disabled={isSaving}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-tighter shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
        >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : (showSuccess ? <CheckCircle size={20} /> : <Save size={20} />)}
            {isSaving ? 'Sincronizando...' : (showSuccess ? 'Configuración Guardada' : 'Confirmar Cambios')}
        </button>
      </div>

      <div className="flex gap-4 mb-8">
         <button onClick={() => setActiveTab('hierarchy')} className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'hierarchy' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'bg-white dark:bg-slate-800 text-slate-500'}`}>
            Jerarquía y Métricas
         </button>
         <button onClick={() => setActiveTab('settings')} className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'settings' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'bg-white dark:bg-slate-800 text-slate-500'}`}>
            Identidad del Club
         </button>
      </div>

      {activeTab === 'hierarchy' && (
        <div className="space-y-6">
            {disciplines.map((disc) => (
                <div key={disc.id} className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 flex justify-between items-center border-b border-slate-200 dark:border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary-600 rounded-2xl text-white shadow-lg shadow-primary-500/20">
                                <Trophy size={20} />
                            </div>
                            <input 
                                value={disc.name}
                                onChange={(e) => setDisciplines(disciplines.map(d => d.id === disc.id ? {...d, name: e.target.value} : d))}
                                className="bg-transparent text-xl font-black text-slate-800 dark:text-white outline-none border-b-2 border-transparent focus:border-primary-500 transition-all uppercase"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => addCategory(disc.id)} className="flex items-center gap-2 bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary-600 transition-colors">
                                <Plus size={14}/> Añadir Categoría
                            </button>
                            <button 
                                onClick={() => setDisciplines(disciplines.filter(d => d.id !== disc.id))}
                                className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {disc.categories.map((cat) => (
                            <div key={cat.id} className="bg-slate-50 dark:bg-slate-900/30 p-6 rounded-3xl border border-slate-200 dark:border-white/5">
                                <div className="flex justify-between items-center mb-4">
                                    <input 
                                        value={cat.name}
                                        onChange={(e) => setDisciplines(disciplines.map(d => d.id === disc.id ? {...d, categories: d.categories.map(c => c.id === cat.id ? {...c, name: e.target.value} : c)} : d))}
                                        className="bg-transparent font-black text-slate-700 dark:text-white outline-none border-b border-transparent focus:border-primary-500 text-sm uppercase tracking-tight"
                                    />
                                    <button 
                                        onClick={() => setDisciplines(disciplines.map(d => d.id === disc.id ? {...d, categories: d.categories.filter(c => c.id !== cat.id)} : d))}
                                        className="text-slate-400 hover:text-red-500"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                        <span>Métrica de Evaluación</span>
                                        <span>Peso (1-10)</span>
                                    </div>
                                    {cat.metrics.map((metric) => (
                                        <div key={metric.id} className="flex gap-2 items-center">
                                            <input 
                                                value={metric.name}
                                                onChange={(e) => updateMetric(disc.id, cat.id, metric.id, 'name', e.target.value)}
                                                placeholder="Ej: Pase Corto"
                                                className="flex-1 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold dark:text-white"
                                            />
                                            <input 
                                                type="number"
                                                min="1" max="10"
                                                value={metric.weight}
                                                onChange={(e) => updateMetric(disc.id, cat.id, metric.id, 'weight', parseInt(e.target.value) || 1)}
                                                className="w-16 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-black text-primary-500 text-center"
                                            />
                                            <button 
                                                onClick={() => setDisciplines(disciplines.map(d => d.id === disc.id ? {...d, categories: d.categories.map(c => c.id === cat.id ? {...c, metrics: c.metrics.filter(m => m.id !== metric.id)} : c)} : d))}
                                                className="p-2 text-slate-300 hover:text-red-400"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    <button 
                                        onClick={() => addMetric(disc.id, cat.id)}
                                        className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black text-slate-400 hover:text-primary-500 hover:border-primary-500 transition-all uppercase"
                                    >
                                        + Añadir Métrica
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <button 
                onClick={addDiscipline}
                className="w-full py-10 border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] flex flex-col items-center justify-center text-slate-400 hover:text-primary-600 hover:border-primary-500 transition-all bg-white/50 dark:bg-slate-900/50"
            >
                <Plus size={48} className="mb-2" />
                <span className="text-lg font-black uppercase tracking-widest">Crear Nueva Disciplina</span>
            </button>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 border border-slate-200 dark:border-white/5">
             {/* Configuración de Identidad (Logo, Nombre) */}
             <div className="space-y-6 max-w-2xl">
                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Nombre Institucional</label>
                    <input 
                        value={clubConfig.name}
                        onChange={(e) => setClubConfig({...clubConfig, name: e.target.value})}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-lg font-black dark:text-white focus:ring-4 focus:ring-primary-500/10 outline-none"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">URL Logo del Club</label>
                    <input 
                        value={clubConfig.logoUrl}
                        onChange={(e) => setClubConfig({...clubConfig, logoUrl: e.target.value})}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold dark:text-white"
                        placeholder="https://..."
                    />
                 </div>
             </div>
        </div>
      )}
    </div>
  );
};

const X = ({ size, className }: any) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;

export default MasterData;
