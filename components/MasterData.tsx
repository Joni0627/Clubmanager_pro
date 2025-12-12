import React, { useState } from 'react';
import { SystemUser, InventoryItem, DisciplineConfig } from '../types';
import { Search, Plus, Trash2, Edit2, Shield, Box, Coins, Settings, Trophy, ChevronRight, ChevronDown } from 'lucide-react';

const MasterData: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'inventory' | 'disciplines' | 'settings'>('users');

  const [users] = useState<SystemUser[]>([
    { id: '1', name: 'Admin Usuario', email: 'admin@plegma.com', role: 'Admin', avatar: 'https://ui-avatars.com/api/?name=Admin+Usuario&background=db2777&color=fff' },
    { id: '2', name: 'Marcelo Gallardo', email: 'mgallardo@club.com', role: 'Coach', avatar: 'https://ui-avatars.com/api/?name=Marcelo+Gallardo&background=0f172a&color=fff' },
  ]);

  const [inventory] = useState<InventoryItem[]>([
    { id: '1', name: 'Balones Oficiales FIFA', category: 'Entrenamiento', quantity: 50, status: 'Good' },
    { id: '2', name: 'Conos de Agilidad', category: 'Equipamiento', quantity: 100, status: 'Good' },
  ]);

  // Mock Disciplines Data
  const [disciplines, setDisciplines] = useState<DisciplineConfig[]>([
      { id: 'd1', name: 'Fútbol', categories: ['Primera', 'Reserva', 'Sub-20', 'Infantil'] },
      { id: 'd2', name: 'Básquet', categories: ['Primera', 'Sub-23', 'Sub-19', 'Mini'] },
      { id: 'd3', name: 'Vóley', categories: ['Primera Fem', 'Primera Masc', 'Sub-18'] },
  ]);

  const [expandedDiscipline, setExpandedDiscipline] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
      setExpandedDiscipline(expandedDiscipline === id ? null : id);
  }

  const tabs = [
    { id: 'users', label: 'Usuarios y Perfiles', icon: Shield },
    { id: 'disciplines', label: 'Disciplinas y Categorías', icon: Trophy }, // Nuevo
    { id: 'inventory', label: 'Catálogo de Insumos', icon: Box },
    { id: 'settings', label: 'Configuración General', icon: Settings },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Datos Maestros</h2>
        <p className="text-slate-500 dark:text-slate-400">Configuración centralizada de la plataforma</p>
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
        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar usuario..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
              </div>
              <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Plus size={16} /> Agregar Usuario
              </button>
            </div>

            <div className="grid gap-4">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-4">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white">{user.name}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'Admin' 
                        ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300' 
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-600 dark:text-slate-200'
                    }`}>
                      {user.role}
                    </span>
                    <div className="flex gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-primary-600 transition-colors"><Edit2 size={16} /></button>
                      <button className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disciplines Tab */}
        {activeTab === 'disciplines' && (
            <div className="p-6">
                 <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Estructura Deportiva</h3>
                        <p className="text-sm text-slate-500">Define las disciplinas y sus categorías inferiores</p>
                    </div>
                    <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        <Plus size={16} /> Nueva Disciplina
                    </button>
                </div>
                
                <div className="space-y-4">
                    {disciplines.map(d => (
                        <div key={d.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                            <div 
                                className="bg-slate-50 dark:bg-slate-700/50 p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                onClick={() => toggleExpand(d.id)}
                            >
                                <div className="flex items-center gap-3">
                                    {expandedDiscipline === d.id ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
                                    <span className="font-bold text-slate-800 dark:text-white">{d.name}</span>
                                    <span className="text-xs bg-slate-200 dark:bg-slate-600 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 font-medium">
                                        {d.categories.length} Categorías
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                     <button className="p-1.5 text-slate-400 hover:text-primary-600"><Edit2 size={16}/></button>
                                </div>
                            </div>
                            
                            {expandedDiscipline === d.id && (
                                <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 animate-fade-in">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {d.categories.map((cat, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 text-sm">
                                                <span className="text-slate-700 dark:text-slate-300">{cat}</span>
                                                <button className="text-slate-400 hover:text-red-500"><Trash2 size={14}/></button>
                                            </div>
                                        ))}
                                        <button className="flex items-center justify-center gap-1 p-2 rounded border border-dashed border-slate-300 dark:border-slate-600 text-slate-400 hover:text-primary-600 hover:border-primary-500 text-sm">
                                            <Plus size={14} /> Agregar Categoría
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="p-6">
             <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Definición de Insumos</h3>
              <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Plus size={16} /> Nuevo Artículo
              </button>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="pb-3 text-slate-500 dark:text-slate-400 font-medium">Nombre Artículo</th>
                  <th className="pb-3 text-slate-500 dark:text-slate-400 font-medium">Categoría</th>
                  <th className="pb-3 text-slate-500 dark:text-slate-400 font-medium">Stock Mínimo</th>
                  <th className="pb-3 text-right text-slate-500 dark:text-slate-400 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {inventory.map(item => (
                  <tr key={item.id} className="group">
                    <td className="py-4 text-slate-800 dark:text-slate-200 font-medium">{item.name}</td>
                    <td className="py-4 text-slate-500 dark:text-slate-400">{item.category}</td>
                    <td className="py-4 text-slate-500 dark:text-slate-400">10</td>
                    <td className="py-4 text-right">
                       <button className="text-slate-400 hover:text-primary-600 p-1"><Edit2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
           <div className="p-6">
              <h3 className="font-semibold text-lg text-slate-800 dark:text-white mb-6">Preferencias del Club</h3>
              
              <div className="space-y-6 max-w-2xl">
                 <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                       <Coins className="text-slate-500" />
                       <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200">Moneda Principal</p>
                          <p className="text-sm text-slate-500">Moneda utilizada para valoraciones y finanzas</p>
                       </div>
                    </div>
                    <select className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-3 py-1 text-sm dark:text-white">
                       <option>EUR (€)</option>
                       <option>USD ($)</option>
                       <option>ARS ($)</option>
                    </select>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default MasterData;