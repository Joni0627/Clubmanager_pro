import React, { useState } from 'react';
import { SystemUser, InventoryItem } from '../types';
import { Search, Plus, Trash2, Edit2, Shield, Box, Coins, Settings } from 'lucide-react';

const MasterData: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'inventory' | 'settings'>('users');

  const [users] = useState<SystemUser[]>([
    { id: '1', name: 'Admin Usuario', email: 'admin@plegma.com', role: 'Admin', avatar: 'https://ui-avatars.com/api/?name=Admin+Usuario&background=db2777&color=fff' },
    { id: '2', name: 'Marcelo Gallardo', email: 'mgallardo@club.com', role: 'Coach', avatar: 'https://ui-avatars.com/api/?name=Marcelo+Gallardo&background=0f172a&color=fff' },
    { id: '3', name: 'Ayudante Campo', email: 'asistente@club.com', role: 'Assistant', avatar: 'https://ui-avatars.com/api/?name=Ayudante+Campo&background=64748b&color=fff' },
  ]);

  const [inventory] = useState<InventoryItem[]>([
    { id: '1', name: 'Balones Oficiales FIFA', category: 'Entrenamiento', quantity: 50, status: 'Good' },
    { id: '2', name: 'Conos de Agilidad', category: 'Equipamiento', quantity: 100, status: 'Good' },
    { id: '3', name: 'Pechera Titular', category: 'Indumentaria', quantity: 15, status: 'Low' },
  ]);

  const tabs = [
    { id: 'users', label: 'Usuarios y Perfiles', icon: Shield },
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

        {/* Inventory Master Data */}
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

                 <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div>
                       <p className="font-medium text-slate-800 dark:text-slate-200">Nombre del Club</p>
                       <p className="text-sm text-slate-500">Visible en reportes y cabeceras</p>
                    </div>
                    <input type="text" value="PLEGMA FC" className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-3 py-1 text-sm dark:text-white text-right" readOnly />
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default MasterData;