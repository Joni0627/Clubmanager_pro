
import React, { useState } from 'react';
import { SystemUser, InventoryItem, DisciplineConfig, ClubConfig } from '../types';
// Fix: Added Loader2 to the imports from lucide-react
import { Search, Plus, Trash2, Edit2, Shield, Box, Settings, Trophy, ChevronRight, ChevronDown, Link, Save, CheckCircle, Loader2 } from 'lucide-react';

interface MasterDataProps {
    clubConfig: ClubConfig;
    setClubConfig: (config: ClubConfig) => void;
}

const MasterData: React.FC<MasterDataProps> = ({ clubConfig, setClubConfig }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'inventory' | 'disciplines' | 'settings'>('settings');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSaveSettings = async () => {
      setIsSaving(true);
      try {
          // La prop setClubConfig ya maneja el persist en App.tsx (db.clubConfig.update)
          await setClubConfig(clubConfig);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2000);
      } finally {
          setIsSaving(false);
      }
  };

  const tabs = [
    { id: 'users', label: 'Usuarios y Perfiles', icon: Shield },
    { id: 'disciplines', label: 'Disciplinas y Categorías', icon: Trophy },
    { id: 'inventory', label: 'Catálogo de Insumos', icon: Box },
    { id: 'settings', label: 'Configuración General', icon: Settings },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Datos Maestros</h2>
        <p className="text-slate-500 dark:text-slate-400">Configuración sincronizada con PlegmaSport (Supabase)</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Icon size={18} />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[500px]">
        
        {activeTab === 'settings' && (
           <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Identidad del Club</h3>
                <button 
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition-all"
                >
                    {/* Fix: Loader2 is now correctly imported and can be used for the saving state */}
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : (showSuccess ? <CheckCircle size={18} /> : <Save size={18} />)}
                    {isSaving ? 'Guardando...' : (showSuccess ? 'Sincronizado' : 'Guardar en Supabase')}
                </button>
              </div>
              
              <div className="space-y-6 max-w-2xl">
                 <div className="grid grid-cols-1 gap-6">
                     <div className="space-y-2">
                         <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Nombre del Club</label>
                         <div className="flex items-center gap-3">
                            <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                <Shield size={24} className="text-slate-500 dark:text-slate-400" />
                            </div>
                            <input 
                                type="text" 
                                value={clubConfig.name}
                                onChange={(e) => setClubConfig({...clubConfig, name: e.target.value})}
                                className="flex-1 p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none dark:text-white font-bold"
                            />
                         </div>
                         <p className="text-xs text-slate-400 ml-1">Este nombre se almacenará en la tabla `club_config`.</p>
                     </div>

                     <div className="space-y-2">
                         <label className="text-sm font-medium text-slate-600 dark:text-slate-300">URL del Escudo (Logo)</label>
                         <div className="flex items-center gap-3">
                            <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                <Link size={24} className="text-slate-500 dark:text-slate-400" />
                            </div>
                            <input 
                                type="text" 
                                value={clubConfig.logoUrl}
                                onChange={(e) => setClubConfig({...clubConfig, logoUrl: e.target.value})}
                                placeholder="https://..."
                                className="flex-1 p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                            />
                         </div>
                         <div className="mt-2 flex items-center gap-2">
                             <span className="text-xs text-slate-400">Vista previa:</span>
                             {clubConfig.logoUrl && <img src={clubConfig.logoUrl} alt="Preview" className="w-12 h-12 object-contain bg-slate-200 rounded-md" />}
                         </div>
                     </div>
                 </div>
              </div>
           </div>
        )}
        
        {/* Placeholder para otras pestañas */}
        {(activeTab === 'users' || activeTab === 'disciplines' || activeTab === 'inventory') && (
            <div className="flex flex-col items-center justify-center p-20 text-slate-400">
                <Box size={48} className="mb-4 opacity-20" />
                <p>Las tablas para `{activeTab}` se están sincronizando con Supabase.</p>
            </div>
        )}

      </div>
    </div>
  );
};

export default MasterData;
