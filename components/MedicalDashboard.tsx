import React, { useState } from 'react';
import { Player } from '../types';
import { HeartPulse, AlertTriangle, CheckCircle, Search, Calendar, FileText } from 'lucide-react';

interface MedicalDashboardProps {
  players: Player[];
}

const MedicalDashboard: React.FC<MedicalDashboardProps> = ({ players }) => {
  const [filter, setFilter] = useState<'all' | 'injured' | 'expired'>('all');
  
  // Logic to determine status based on mock data
  const injuredPlayers = players.filter(p => p.status === 'Injured');
  const expiredPlayers = players.filter(p => !p.medical?.isFit); // Mocking logic for expiration

  const getFilteredPlayers = () => {
    switch(filter) {
      case 'injured': return injuredPlayers;
      case 'expired': return expiredPlayers;
      default: return players;
    }
  };

  const displayPlayers = getFilteredPlayers();

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
             <HeartPulse className="text-primary-600" /> Central Médica
           </h2>
           <p className="text-slate-500 dark:text-slate-400">Control de aptos físicos y seguimiento de lesiones</p>
        </div>
        
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
           <button 
             onClick={() => setFilter('all')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
           >
             Todos
           </button>
           <button 
             onClick={() => setFilter('injured')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${filter === 'injured' ? 'bg-white dark:bg-slate-700 text-red-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
           >
             <AlertTriangle size={14} /> Lesionados ({injuredPlayers.length})
           </button>
           <button 
             onClick={() => setFilter('expired')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${filter === 'expired' ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
           >
             <FileText size={14} /> Vencidos ({expiredPlayers.length})
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
         <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-xl">
            <h3 className="text-red-800 dark:text-red-300 font-bold text-lg mb-1">Enfermería</h3>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{injuredPlayers.length}</p>
            <p className="text-sm text-red-600/70 dark:text-red-400/70 mt-2">Jugadores no disponibles por lesión</p>
         </div>
         <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-6 rounded-xl">
            <h3 className="text-orange-800 dark:text-orange-300 font-bold text-lg mb-1">Aptos Vencidos</h3>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{expiredPlayers.length}</p>
            <p className="text-sm text-orange-600/70 dark:text-orange-400/70 mt-2">Requieren renovación urgente</p>
         </div>
         <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-6 rounded-xl">
            <h3 className="text-emerald-800 dark:text-emerald-300 font-bold text-lg mb-1">Plantel Disponible</h3>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{players.length - injuredPlayers.length}</p>
            <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70 mt-2">Habilitados para competir</p>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
           <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Buscar jugador..." className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-sm focus:outline-none dark:text-white" />
           </div>
           <button className="text-primary-600 text-sm font-bold hover:underline">Descargar Informe PDF</button>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            <tr>
              <th className="p-4">Jugador</th>
              <th className="p-4">Categoría</th>
              <th className="p-4">Estado Físico</th>
              <th className="p-4">Vencimiento Apto</th>
              <th className="p-4">Observaciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {displayPlayers.map(player => (
              <tr key={player.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                <td className="p-4 font-medium text-slate-800 dark:text-white flex items-center gap-3">
                   <img src={player.photoUrl} className="w-8 h-8 rounded-full bg-slate-200" alt="" />
                   {player.name}
                </td>
                <td className="p-4 text-slate-500 dark:text-slate-400">
                   <div className="flex flex-col">
                      <span className="font-bold text-xs">{player.category}</span>
                      <span className="text-[10px] uppercase">{player.division}</span>
                   </div>
                </td>
                <td className="p-4">
                  {player.status === 'Injured' ? (
                     <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        <AlertTriangle size={12} /> Lesionado
                     </span>
                  ) : (
                     <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <CheckCircle size={12} /> Óptimo
                     </span>
                  )}
                </td>
                <td className="p-4">
                   <div className={`flex items-center gap-2 ${!player.medical?.isFit ? 'text-red-600 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                      <Calendar size={14} />
                      {player.medical?.expiryDate}
                   </div>
                </td>
                <td className="p-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                   {player.medical?.notes || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MedicalDashboard;