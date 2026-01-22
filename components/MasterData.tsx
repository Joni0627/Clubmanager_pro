
import React, { useState, useEffect } from 'react';
import { DisciplineConfig, CategoryConfig, MetricDefinition, ClubConfig } from '../types';
import { Plus, Trash2, Trophy, Save, CheckCircle, Loader2, X, Info, Settings, LayoutGrid } from 'lucide-react';

interface MasterDataProps {
    clubConfig: ClubConfig;
    setClubConfig: (config: ClubConfig) => void;
}

const MasterData: React.FC<MasterDataProps> = ({ clubConfig, setClubConfig }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'hierarchy'>('hierarchy');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Estados para edición
  const [localName, setLocalName] = useState(clubConfig.name || '');
  const [localLogo, setLocalLogo] = useState(clubConfig.logoUrl || '');
  const [localDisciplines, setLocalDisciplines] = useState<DisciplineConfig[]>([]);

  useEffect(() => {
    setLocalName(clubConfig.name);
    setLocalLogo(clubConfig.logoUrl);
    setLocalDisciplines(clubConfig.disciplines || []);
  }, [clubConfig]);

  const handleSaveAll = async () => {
      setIsSaving(true);
      try {
          const newConfig = {
              ...clubConfig,
              name: localName,
              logoUrl: localLogo,
              disciplines: localDisciplines
          };
          await setClubConfig(newConfig);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
      } catch (error) {
          console.error(error);
          alert("Error al guardar en la nube.");
      } finally {
          setIsSaving(false);
      }
  };

  const addDiscipline = () => {
    const newDisc: DisciplineConfig = { id: crypto.randomUUID(), name: 'Nueva Disciplina', categories: [] };
    setLocalDisciplines([...localDisciplines, newDisc]);
  };

  const addCategory = (discId: string) => {
    setLocalDisciplines(localDisciplines.map(d => d.id === discId ? { ...d, categories: [...d.categories, { id: crypto.randomUUID(), name: 'Nueva Categoría', metrics: [] }] } : d));
  };

  const addMetric = (discId: string, catId: string) => {
    setLocalDisciplines(localDisciplines.map(d => d.id === discId ? { ...d, categories: d.categories.map(c => c.id === catId ? { ...c, metrics: [...c.metrics, { id: crypto.randomUUID(), name: 'Nueva Métrica', weight: 1 }] } : c) } : d));
  };

  return (
    <div className="p-10 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
            <h2 className="text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Configuración Maestra</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Gestión de identidad y estructura competitiva</p>
        </div>
        <button onClick={handleSaveAll} disabled={isSaving} className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-2xl transition-all ${showSuccess ? 'bg-emerald-500 text-white' : 'bg-primary-600 text-white hover:scale-105'}`}>
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : (showSuccess ? <CheckCircle size={20} /> : <Save size={20} />)}
            <span className="text-xs">{isSaving ? 'Guardando' : (showSuccess ? 'Sincronizado' : 'Guardar Todo')}</span>
        </button>
      </div>

      <div className="flex gap-4 mb-10">
         <button onClick={() => setActiveTab('hierarchy')} className={`flex items-center gap-2 px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'hierarchy' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
            <LayoutGrid size={14} /> Jerarquía Deportiva
         </button>
         <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-2 px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'settings' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
            <Settings size={14} /> Perfil del Club
         </button>
      </div>

      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-white/5 shadow-sm max-w-2xl">
            <div className="space-y-8">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre de la Institución</label>
                    <input value={localName} onChange={e => setLocalName(e.target.value)} className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xl font-black" placeholder="Ej: PLEGMA CLUB" />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">URL del Escudo / Logo</label>
                    <input value={localLogo} onChange={e => setLocalLogo(e.target.value)} className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold" placeholder="https://..." />
                    <div className="mt-4 w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center border border-dashed border-slate-200">
                        {localLogo ? <img src={localLogo} className="w-full h-full object-contain p-4" /> : <Trophy size={40} className="text-slate-200" />}
                    </div>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'hierarchy' && (
        <div className="space-y-10 pb-20">
            {localDisciplines.map((disc) => (
                <div key={disc.id} className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm">
                    <div className="bg-slate-50 dark:bg-slate-950/50 p-8 flex justify-between items-center">
                        <input value={disc.name} onChange={e => setLocalDisciplines(localDisciplines.map(d => d.id === disc.id ? {...d, name: e.target.value} : d))} className="bg-transparent text-2xl font-black uppercase tracking-tighter" />
                        <div className="flex gap-2">
                            <button onClick={() => addCategory(disc.id)} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-colors">+ Categoría</button>
                            <button onClick={() => setLocalDisciplines(localDisciplines.filter(d => d.id !== disc.id))} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={20}/></button>
                        </div>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {disc.categories.map((cat) => (
                            <div key={cat.id} className="bg-slate-50 dark:bg-slate-950/30 p-6 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
                                <div className="flex justify-between mb-4">
                                    <input value={cat.name} onChange={e => setLocalDisciplines(localDisciplines.map(d => d.id === disc.id ? {...d, categories: d.categories.map(c => c.id === cat.id ? {...c, name: e.target.value} : c)} : d))} className="bg-transparent font-black uppercase text-xs" />
                                    <button onClick={() => setLocalDisciplines(localDisciplines.map(d => d.id === disc.id ? {...d, categories: d.categories.filter(c => c.id !== cat.id)} : d))} className="text-slate-400 hover:text-red-500"><X size={16}/></button>
                                </div>
                                <div className="space-y-2">
                                    {cat.metrics.map(m => (
                                        <div key={m.id} className="flex gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100">
                                            <input value={m.name} onChange={e => setLocalDisciplines(localDisciplines.map(d => d.id === disc.id ? {...d, categories: d.categories.map(c => c.id === cat.id ? {...c, metrics: c.metrics.map(met => met.id === m.id ? {...met, name: e.target.value} : met)} : c)} : d))} className="flex-1 text-[10px] font-bold outline-none" placeholder="Métrica" />
                                            <input type="number" value={m.weight} onChange={e => setLocalDisciplines(localDisciplines.map(d => d.id === disc.id ? {...d, categories: d.categories.map(c => c.id === cat.id ? {...c, metrics: c.metrics.map(met => met.id === m.id ? {...met, weight: parseInt(e.target.value) || 1} : met)} : c)} : d))} className="w-10 text-center text-[10px] font-black text-primary-600" />
                                        </div>
                                    ))}
                                    <button onClick={() => addMetric(disc.id, cat.id)} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:text-primary-600 hover:border-primary-600">+ Métrica</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            <button onClick={addDiscipline} className="w-full py-16 border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[4rem] text-slate-400 font-black uppercase tracking-widest hover:text-primary-600 hover:border-primary-600 transition-all">
                + Agregar Nueva Disciplina
            </button>
        </div>
      )}
    </div>
  );
};

export default MasterData;
