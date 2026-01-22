
import React, { useState } from 'react';
import { Player, MedicalRecord } from '../types';
import { Activity, AlertTriangle, CheckCircle, Search, Calendar, FileText, Plus, X, Save, Trash2, Edit2 } from 'lucide-react';

interface MedicalDashboardProps {
  players: Player[];
}

const MedicalDashboard: React.FC<MedicalDashboardProps> = ({ players }) => {
  const [filter, setFilter] = useState<'all' | 'injured' | 'expired'>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedPlayerForEdit, setSelectedPlayerForEdit] = useState<Player | null>(null);
  
  const [formData, setFormData] = useState<MedicalRecord>({
    isFit: true,
    lastCheckup: '',
    expiryDate: '',
    notes: ''
  });

  const injuredPlayers = players.filter(p => p.status === 'Injured');
  const expiredPlayers = players.filter(p => !p.medical?.isFit);

  const getFilteredPlayers = () => {
    switch(filter) {
      case 'injured': return injuredPlayers;
      case 'expired': return expiredPlayers;
      default: return players;
    }
  };

  const handleEditClick = (player: Player) => {
    setSelectedPlayerForEdit(player);
    if (player.medical) {
        setFormData(player.medical);
    } else {
        setFormData({ isFit: true, lastCheckup: '', expiryDate: '', notes: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPlayerForEdit(null);
  };

  const handleSave = () => {
    console.log("Guardando registro médico para:", selectedPlayerForEdit?.name, formData);
    handleCloseModal();
  };

  const displayPlayers = getFilteredPlayers();

  return (
    <div className="p-6 relative">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2 uppercase tracking-tighter">
             <Activity className="text-primary-600" /> Central Médica
           </h2>
           <p className="text-slate-500 dark:text-slate-400 font-medium">Control de aptos físicos y seguimiento de lesiones</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
             <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500'}`}>Todos</button>
                <button onClick={() => setFilter('injured')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filter === 'injured' ? 'bg-white dark:bg-slate-700 text-red-600 shadow-sm' : 'text-slate-500'}`}><AlertTriangle size={14} /> Lesionados</button>
                <button onClick={() => setFilter('expired')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filter === 'expired' ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-sm' : 'text-slate-500'}`}><FileText size={14} /> Vencidos</button>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
         <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/30 p-8 rounded-[2.5rem] shadow-sm">
            <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">Enfermería</h3>
            <p className="text-4xl font-black text-red-600">{injuredPlayers.length}</p>
         </div>
         <div className="bg-white dark:bg-slate-900 border border-orange-200 dark:border-orange-900/30 p-8 rounded-[2.5rem] shadow-sm">
            <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">Aptos Vencidos</h3>
            <p className="text-4xl font-black text-orange-600">{expiredPlayers.length}</p>
         </div>
         <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/30 p-8 rounded-[2.5rem] shadow-sm">
            <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">Plantel Apto</h3>
            <p className="text-4xl font-black text-emerald-600">{players.length - injuredPlayers.length}</p>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-400 font-black uppercase tracking-widest text-[10px]">
            <tr>
              <th className="p-6">Jugador</th>
              <th className="p-6">Disciplina</th>
              <th className="p-6">Estado</th>
              <th className="p-6">Vencimiento</th>
              <th className="p-6 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
            {displayPlayers.map(player => (
              <tr 
                key={player.id} 
                className="hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                onClick={() => handleEditClick(player)}
              >
                <td className="p-6 text-slate-800 dark:text-white flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img src={player.photoUrl || 'https://via.placeholder.com/40'} className="w-full h-full object-cover" alt="" />
                   </div>
                   <span className="font-bold">{player.name}</span>
                </td>
                <td className="p-6">
                   <div className="flex flex-col">
                      <span className="font-black text-[10px] uppercase text-primary-600">{player.discipline}</span>
                      <span className="text-[9px] text-slate-400 uppercase tracking-tighter">{player.category}</span>
                   </div>
                </td>
                <td className="p-6">
                  {player.status === 'Injured' ? (
                     <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-red-100 text-red-700 dark:bg-red-900/30">Lesionado</span>
                  ) : (
                     <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30">Apto</span>
                  )}
                </td>
                <td className="p-6">
                   <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                      <Calendar size={14} />
                      {player.medical?.expiryDate || 'Sin Registro'}
                   </div>
                </td>
                <td className="p-6 text-right">
                    <button className="p-2 text-slate-300 hover:text-primary-600 transition-colors">
                        <Edit2 size={16} />
                    </button>
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
