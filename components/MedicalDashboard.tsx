
import React, { useState } from 'react';
import { Player, MedicalRecord } from '../types';
import { Activity, AlertTriangle, CheckCircle, Search, Calendar, FileText, Plus, X, Save, Trash2, Edit2, Loader2 } from 'lucide-react';
import { db } from '../lib/supabase';

interface MedicalDashboardProps {
  players: Player[];
  onRefresh?: () => void;
}

const MedicalDashboard: React.FC<MedicalDashboardProps> = ({ players, onRefresh }) => {
  const [filter, setFilter] = useState<'all' | 'injured' | 'expired'>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<MedicalRecord>({
    isFit: true,
    lastCheckup: '',
    expiryDate: '',
    notes: ''
  });

  const handleEditClick = (player: Player) => {
    setSelectedPlayer(player);
    setFormData(player.medical || { isFit: true, lastCheckup: '', expiryDate: '', notes: '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!selectedPlayer) return;
    setIsSaving(true);
    try {
      const updatedPlayer = { ...selectedPlayer, medical: formData };
      if (formData.isFit) updatedPlayer.status = 'Active';
      else updatedPlayer.status = 'Injured';
      
      await db.players.upsert(updatedPlayer);
      if (onRefresh) onRefresh();
      setShowModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const injuredPlayers = players.filter(p => !p.medical?.isFit || p.status === 'Injured');
  const expiredPlayers = players.filter(p => {
      if (!p.medical?.expiryDate) return false;
      return new Date(p.medical.expiryDate) < new Date();
  });

  const getFilteredPlayers = () => {
    switch(filter) {
      case 'injured': return injuredPlayers;
      case 'expired': return expiredPlayers;
      default: return players;
    }
  };

  const displayPlayers = getFilteredPlayers();

  return (
    <div className="p-10 h-full overflow-y-auto">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h2 className="text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Central Médica</h2>
           <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Gestión de Sanidad & Aptitud Competitiva</p>
        </div>
        
        <div className="flex gap-2 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl">
            <button onClick={() => setFilter('all')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 shadow-md' : 'text-slate-500'}`}>General</button>
            <button onClick={() => setFilter('injured')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'injured' ? 'bg-white dark:bg-slate-700 text-red-600 shadow-md' : 'text-slate-500'}`}>No Aptos</button>
            <button onClick={() => setFilter('expired')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'expired' ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-md' : 'text-slate-500'}`}>Vencidos</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
         <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 p-10 rounded-[3rem] shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Enfermería</span>
                <AlertTriangle className="text-red-500" size={24} />
            </div>
            <p className="text-6xl font-black text-red-600">{injuredPlayers.length}</p>
         </div>
         <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 p-10 rounded-[3rem] shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Doc. Vencida</span>
                <Calendar className="text-orange-500" size={24} />
            </div>
            <p className="text-6xl font-black text-orange-600">{expiredPlayers.length}</p>
         </div>
         <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 p-10 rounded-[3rem] shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Plantel Apto</span>
                <CheckCircle className="text-emerald-500" size={24} />
            </div>
            <p className="text-6xl font-black text-emerald-600">{players.length - injuredPlayers.length}</p>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-400 font-black uppercase tracking-widest text-[10px] border-b border-slate-100 dark:border-white/5">
            <tr>
              <th className="p-8">Atleta</th>
              <th className="p-8">Disciplina</th>
              <th className="p-8">Apto Físico</th>
              <th className="p-8">Vencimiento</th>
              <th className="p-8 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {displayPlayers.map(player => (
              <tr key={player.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                <td className="p-8 flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-inner">
                      <img src={player.photoUrl || 'https://via.placeholder.com/40'} className="w-full h-full object-cover" />
                   </div>
                   <span className="font-black text-slate-800 dark:text-white uppercase text-sm tracking-tighter">{player.name}</span>
                </td>
                <td className="p-8">
                   <div className="flex flex-col">
                      <span className="font-black text-[9px] uppercase text-primary-600 tracking-widest">{player.discipline}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">{player.category}</span>
                   </div>
                </td>
                <td className="p-8">
                  {player.medical?.isFit ? (
                     <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30">APTO COMPETENCIA</span>
                  ) : (
                     <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-red-100 text-red-700 dark:bg-red-900/30">BAJA MÉDICA</span>
                  )}
                </td>
                <td className="p-8">
                   <div className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase">
                      <Calendar size={14} className="text-primary-600" />
                      {player.medical?.expiryDate || 'NO REGISTRADO'}
                   </div>
                </td>
                <td className="p-8 text-right">
                    <button onClick={() => handleEditClick(player)} className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-400 hover:text-primary-600 transition-all">
                        <Edit2 size={16} />
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedPlayer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-[4rem] shadow-2xl w-full max-w-2xl border border-white/5 overflow-hidden">
                <div className="p-10 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shadow-xl">
                            <img src={selectedPlayer.photoUrl} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none">{selectedPlayer.name}</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Ficha Sanitaria</p>
                        </div>
                    </div>
                    <button onClick={() => setShowModal(false)} className="p-3 bg-slate-100 dark:bg-white/5 rounded-full hover:bg-red-500 hover:text-white transition-all"><X size={20} /></button>
                </div>
                <div className="p-12 space-y-8">
                    <div className="flex gap-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-white/5">
                        <button onClick={() => setFormData({...formData, isFit: true})} className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${formData.isFit ? 'bg-emerald-500 text-white shadow-xl' : 'text-slate-400'}`}>Apto</button>
                        <button onClick={() => setFormData({...formData, isFit: false})} className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${!formData.isFit ? 'bg-red-500 text-white shadow-xl' : 'text-slate-400'}`}>No Apto</button>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Último Examen</label>
                            <input type="date" value={formData.lastCheckup} onChange={e => setFormData({...formData, lastCheckup: e.target.value})} className="w-full p-6 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl text-sm font-bold dark:text-white outline-none" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Vencimiento Apto</label>
                            <input type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className="w-full p-6 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl text-sm font-bold dark:text-white outline-none" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Notas Médicas / Diagnóstico</label>
                        <textarea rows={4} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-6 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl text-sm font-bold dark:text-white outline-none resize-none" placeholder="Especificar lesión o condiciones especiales..." />
                    </div>
                </div>
                <div className="p-10 border-t border-slate-100 dark:border-white/5 flex justify-end">
                    <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-3 bg-slate-900 dark:bg-primary-600 text-white px-12 py-5 rounded-3xl font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">
                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Actualizar Registro
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default MedicalDashboard;
