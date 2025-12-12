import React, { useState } from 'react';
import { Player, MedicalRecord } from '../types';
import { HeartPulse, AlertTriangle, CheckCircle, Search, Calendar, FileText, Plus, X, Save, Trash2, Edit2 } from 'lucide-react';

interface MedicalDashboardProps {
  players: Player[];
}

const MedicalDashboard: React.FC<MedicalDashboardProps> = ({ players }) => {
  const [filter, setFilter] = useState<'all' | 'injured' | 'expired'>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedPlayerForEdit, setSelectedPlayerForEdit] = useState<Player | null>(null);
  
  // State for the form
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
    // Aquí iría la lógica real de guardado en base de datos
    console.log("Guardando registro médico para:", selectedPlayerForEdit?.name, formData);
    handleCloseModal();
  };

  const displayPlayers = getFilteredPlayers();

  return (
    <div className="p-6 relative">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
             <HeartPulse className="text-primary-600" /> Central Médica
           </h2>
           <p className="text-slate-500 dark:text-slate-400">Control de aptos físicos y seguimiento de lesiones</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
             <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>Todos</button>
                <button onClick={() => setFilter('injured')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${filter === 'injured' ? 'bg-white dark:bg-slate-700 text-red-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}><AlertTriangle size={14} /> Lesionados</button>
                <button onClick={() => setFilter('expired')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${filter === 'expired' ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}><FileText size={14} /> Vencidos</button>
            </div>
            <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-colors">
                <Plus size={18} /> Nuevo Registro
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
         <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-xl">
            <h3 className="text-red-800 dark:text-red-300 font-bold text-lg mb-1">Enfermería</h3>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{injuredPlayers.length}</p>
         </div>
         <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-6 rounded-xl">
            <h3 className="text-orange-800 dark:text-orange-300 font-bold text-lg mb-1">Aptos Vencidos</h3>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{expiredPlayers.length}</p>
         </div>
         <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-6 rounded-xl">
            <h3 className="text-emerald-800 dark:text-emerald-300 font-bold text-lg mb-1">Plantel Disponible</h3>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{players.length - injuredPlayers.length}</p>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            <tr>
              <th className="p-4">Jugador</th>
              <th className="p-4">Disciplina / Cat</th>
              <th className="p-4">Estado Físico</th>
              <th className="p-4">Vencimiento Apto</th>
              <th className="p-4">Observaciones</th>
              <th className="p-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {displayPlayers.map(player => (
              <tr 
                key={player.id} 
                className="hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer group"
                onClick={() => handleEditClick(player)}
              >
                <td className="p-4 font-medium text-slate-800 dark:text-white flex items-center gap-3">
                   <img src={player.photoUrl} className="w-8 h-8 rounded-full bg-slate-200" alt="" />
                   {player.name}
                </td>
                <td className="p-4 text-slate-500 dark:text-slate-400">
                   <div className="flex flex-col">
                      <span className="font-bold text-xs">{player.discipline}</span>
                      <span className="text-[10px] uppercase">{player.category}</span>
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
                      {player.medical?.expiryDate || 'N/A'}
                   </div>
                </td>
                <td className="p-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                   {player.medical?.notes || '-'}
                </td>
                <td className="p-4 text-right">
                    <button className="text-slate-400 hover:text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit2 size={16} />
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 animate-fade-in">
                <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                        {selectedPlayerForEdit ? `Ficha Médica: ${selectedPlayerForEdit.name}` : 'Nuevo Registro'}
                    </h3>
                    <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Estado Apto</label>
                            <select 
                                value={formData.isFit ? 'true' : 'false'}
                                onChange={(e) => setFormData({...formData, isFit: e.target.value === 'true'})}
                                className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg dark:text-white"
                            >
                                <option value="true">APTO (Fit)</option>
                                <option value="false">NO APTO (Unfit)</option>
                            </select>
                        </div>
                         <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Fecha Control</label>
                            <input 
                                type="date" 
                                value={formData.lastCheckup}
                                onChange={(e) => setFormData({...formData, lastCheckup: e.target.value})}
                                className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Vencimiento Apto</label>
                        <input 
                            type="date" 
                            value={formData.expiryDate}
                            onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                            className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg dark:text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Observaciones / Lesión</label>
                        <textarea 
                            rows={4}
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg dark:text-white resize-none"
                            placeholder="Detalles clínicos..."
                        />
                    </div>
                </div>
                <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                    <button className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium px-4 py-2">
                        <Trash2 size={18} /> Eliminar Ficha
                    </button>
                    <div className="flex gap-3">
                        <button onClick={handleCloseModal} className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium">Cancelar</button>
                        <button onClick={handleSave} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-primary-500/20">
                            <Save size={18} /> Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default MedicalDashboard;