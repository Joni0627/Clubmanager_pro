
import React, { useState, useEffect } from 'react';
import { DisciplineConfig, CategoryConfig, MetricDefinition, ClubConfig } from '../types';
import { Plus, Trash2, Trophy, Save, CheckCircle, Loader2, X, Info } from 'lucide-react';

interface MasterDataProps {
    clubConfig: ClubConfig;
    setClubConfig: (config: ClubConfig) => void;
}

const MasterData: React.FC<MasterDataProps> = ({ clubConfig, setClubConfig }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'hierarchy'>('hierarchy');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Estado local para edición fluida
  const [localDisciplines, setLocalDisciplines] = useState<DisciplineConfig[]>([]);

  // Sincronizar estado local con el clubConfig inicial
  useEffect(() => {
    if (clubConfig.disciplines) {
        setLocalDisciplines(clubConfig.disciplines);
    }
  }, [clubConfig.disciplines]);

  const handleSaveAll = async () => {
      setIsSaving(true);
      try {
          // Aquí actualizamos el estado global que a su vez llama a db.clubConfig.update
          await setClubConfig({ ...clubConfig, disciplines: localDisciplines });
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
      } catch (error) {
          console.error("Error al guardar configuración:", error);
          alert("Error al conectar con la base de datos.");
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
    setLocalDisciplines([...localDisciplines, newDisc]);
  };

  const removeDiscipline = (id: string) => {
    if(confirm('¿Eliminar disciplina y todas sus categorías?')) {
        setLocalDisciplines(localDisciplines.filter(d => d.id !== id));
    }
  };

  const addCategory = (discId: string) => {
    setLocalDisciplines(localDisciplines.map(d => {
      if (d.id === discId) {
        return {
          ...d,
          categories: [...d.categories, { id: crypto.randomUUID(), name: 'Nueva Categoría', metrics: [] }]
        };
      }
      return d;
    }));
  };

  const removeCategory = (discId: string, catId: string) => {
    setLocalDisciplines(localDisciplines.map(d => {
      if (d.id === discId) {
        return { ...d, categories: d.categories.filter(c => c.id !== catId) };
      }
      return d;
    }));
  };

  const addMetric = (discId: string, catId: string) => {
    setLocalDisciplines(localDisciplines.map(d => {
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
    setLocalDisciplines(localDisciplines.map(d => {
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

  const removeMetric = (discId: string, catId: string, metricId: string) => {
    setLocalDisciplines(localDisciplines.map(d => {
      if (d.id === discId) {
        return {
          ...d,
          categories: d.categories.map(c => {
            if (c.id === catId) {
              return { ...c, metrics: c.metrics.filter(m => m.id !== metricId) };
            }
            return c;
          })
        };
      }
      return d;
    }));
  };

  return (
    <div className="p-6 md:p-10 h-full overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none">Configuración Maestra</h2>
            <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]">Estructura Deportiva & Definición de Atletas</p>
            </div>
        </div>
        <button 
            onClick={handleSaveAll}
            disabled={isSaving}
            className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 ${showSuccess ? 'bg-emerald-500 text-white' : 'bg-slate-900 dark:bg-primary-600 text-white hover:bg-black'}`}
        >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : (showSuccess ? <CheckCircle size={20} /> : <Save size={20} />)}
            <span className="text-xs">{isSaving ? 'Sincronizando...' : (showSuccess ? '¡Guardado con Éxito!' : 'Aplicar Cambios')}</span>
        </button>
      </div>

      <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-fit mb-10">
         <button onClick={() => setActiveTab('hierarchy')} className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'hierarchy' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md' : 'text-slate-500'}`}>
            Organigrama Deportivo
         </button>
         <button onClick={() => setActiveTab('settings')} className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'settings' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md' : 'text-slate-500'}`}>
            Identidad del Club
         </button>
      </div>

      {activeTab === 'hierarchy' && (
        <div className="space-y-10 pb-32">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-[2rem] border border-blue-100 dark:border-blue-900/30 flex gap-4 items-start mb-6">
                <Info className="text-blue-600 shrink-0" size={24} />
                <p className="text-blue-800 dark:text-blue-300 text-sm font-medium">
                    Define aquí los deportes (Disciplinas), sus niveles (Categorías) y qué aspectos quieres evaluar de los jugadores (Métricas). 
                    Las métricas con mayor peso (1-10) influirán más en el puntaje global del jugador.
                </p>
            </div>

            {localDisciplines.map((disc) => (
                <div key={disc.id} className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm group">
                    <div className="bg-slate-50 dark:bg-slate-950/50 p-8 flex justify-between items-center border-b border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-primary-600 rounded-2xl text-white shadow-xl shadow-primary-500/20 group-hover:scale-110 transition-transform">
                                <Trophy size={24} />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Nombre de Disciplina</label>
                                <input 
                                    value={disc.name}
                                    onChange={(e) => setLocalDisciplines(localDisciplines.map(d => d.id === disc.id ? {...d, name: e.target.value} : d))}
                                    className="bg-transparent text-2xl font-black text-slate-800 dark:text-white outline-none uppercase tracking-tighter focus:text-primary-600"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => addCategory(disc.id)} className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                                + Añadir Categoría
                            </button>
                            <button onClick={() => removeDiscipline(disc.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {disc.categories.map((cat) => (
                            <div key={cat.id} className="bg-slate-50 dark:bg-slate-950/30 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-inner">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex flex-col">
                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Categoría / Nivel</label>
                                        <input 
                                            value={cat.name}
                                            onChange={(e) => setLocalDisciplines(localDisciplines.map(d => d.id === disc.id ? {...d, categories: d.categories.map(c => c.id === cat.id ? {...c, name: e.target.value} : c)} : d))}
                                            className="bg-transparent font-black text-slate-800 dark:text-white outline-none uppercase tracking-widest text-sm focus:text-primary-500"
                                        />
                                    </div>
                                    <button onClick={() => removeCategory(disc.id, cat.id)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={18} /></button>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">
                                        <span className="flex-1">Nombre de la Métrica de Evaluación</span>
                                        <span className="w-20 text-center">Peso (1-10)</span>
                                    </div>
                                    {cat.metrics.map((metric) => (
                                        <div key={metric.id} className="flex gap-2 items-center bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
                                            <input 
                                                value={metric.name}
                                                onChange={(e) => updateMetric(disc.id, cat.id, metric.id, 'name', e.target.value)}
                                                className="flex-1 px-4 py-2 bg-transparent text-xs font-bold dark:text-white outline-none"
                                                placeholder="Ej: Velocidad, Tiro, Visión..."
                                            />
                                            <input 
                                                type="number" min="1" max="10"
                                                value={metric.weight}
                                                onChange={(e) => updateMetric(disc.id, cat.id, metric.id, 'weight', parseInt(e.target.value) || 1)}
                                                className="w-14 p-2 bg-slate-100 dark:bg-slate-900 rounded-lg text-xs font-black text-primary-500 text-center outline-none border border-transparent focus:border-primary-500"
                                            />
                                            <button onClick={() => removeMetric(disc.id, cat.id, metric.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    <button 
                                        onClick={() => addMetric(disc.id, cat.id)} 
                                        className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black text-slate-400 hover:text-primary-500 hover:border-primary-500 hover:bg-white dark:hover:bg-slate-800 transition-all uppercase tracking-widest"
                                    >
                                        + Nueva Métrica de Puntaje
                                    </button>
                                </div>
                            </div>
                        ))}
                        {disc.categories.length === 0 && (
                            <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 opacity-50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem]">
                                <p className="font-black text-[10px] uppercase tracking-widest">No hay categorías configuradas</p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
            
            <button 
                onClick={addDiscipline} 
                className="w-full py-20 border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[4rem] flex flex-col items-center justify-center text-slate-400 hover:text-primary-600 hover:border-primary-600 hover:bg-white dark:hover:bg-slate-900/50 transition-all group"
            >
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Plus size={32} />
                </div>
                <span className="text-sm font-black uppercase tracking-[0.4em]">Agregar Nueva Disciplina Deportiva</span>
            </button>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 border border-slate-100 dark:border-white/5 shadow-sm max-w-3xl">
             <div className="space-y-10">
                 <div className="flex items-center gap-6 mb-4">
                    <div className="w-24 h-24 rounded-[2rem] bg-primary-600 flex items-center justify-center overflow-hidden shadow-2xl">
                        {clubConfig.logoUrl ? <img src={clubConfig.logoUrl} className="w-full h-full object-cover" /> : <Trophy size={40} className="text-white" />}
                    </div>
                    <div>
                        <h4 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Identidad Visual</h4>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Personaliza la apariencia institucional del sistema</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 gap-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Nombre Oficial del Club</label>
                        <input 
                            value={clubConfig.name}
                            onChange={(e) => setClubConfig({...clubConfig, name: e.target.value})}
                            placeholder="Ej: CLUB ATLÉTICO PLEGMA"
                            className="w-full p-6 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-[1.5rem] text-xl font-black dark:text-white focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">URL del Escudo / Logo</label>
                        <input 
                            value={clubConfig.logoUrl}
                            onChange={(e) => setClubConfig({...clubConfig, logoUrl: e.target.value})}
                            className="w-full p-6 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-[1.5rem] text-sm font-bold dark:text-white focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                            placeholder="https://tuclub.com/escudo.png"
                        />
                        <p className="text-[9px] text-slate-400 font-medium px-4">Proporciona una URL directa a una imagen PNG o JPG con fondo transparente preferiblemente.</p>
                     </div>
                 </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default MasterData;
