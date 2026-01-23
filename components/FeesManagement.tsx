
import React, { useState, useEffect } from 'react';
import { MemberFee, Player } from '../types';
import { Search, DollarSign, Filter, MoreHorizontal, Check, AlertCircle, Calendar, Plus, X, Trash2, Save, CreditCard, Loader2, User } from 'lucide-react';
import { db } from '../lib/supabase';

const FeesManagement: React.FC = () => {
  const [fees, setFees] = useState<any[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  // Fix: Aligned property names with MemberFee interface (due_date, payment_method)
  const [formData, setFormData] = useState<Partial<MemberFee>>({
    status: 'Pending',
    amount: 0,
    due_date: new Date().toISOString().split('T')[0],
    payment_method: 'Efectivo'
  });

  const loadData = async () => {
    setIsLoading(true);
    const { data: feesData } = await db.fees.getAll();
    const { data: playersData } = await db.players.getAll();
    if (feesData) setFees(feesData);
    if (playersData) setPlayers(playersData);
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
      // Fix: memberId changed to player_id to match MemberFee interface
      if (!formData.player_id) return alert("Selecciona un miembro");
      setIsSaving(true);
      try {
          const payload = {
            player_id: formData.player_id,
            amount: formData.amount,
            status: formData.status,
            due_date: formData.due_date,
            payment_method: formData.payment_method,
            reference: formData.reference,
          };
          await db.fees.upsert(payload);
          await loadData();
          setShowModal(false);
      } catch (e) {
          console.error(e);
      } finally {
          setIsSaving(false);
      }
  };

  const handleDelete = async (id: string) => {
      if (confirm('¿Eliminar registro?')) {
          await db.fees.delete(id);
          await loadData();
      }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UpToDate': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30';
      case 'Pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30';
      case 'Late': return 'bg-red-100 text-red-700 dark:bg-red-900/30';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const filteredFees = fees.filter(f => {
      const matchSearch = f.player?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || f.player?.dni?.includes(searchTerm);
      const matchType = filterType === 'Todos' || f.player?.discipline === filterType;
      return matchSearch && matchType;
  });

  return (
    <div className="p-10 h-full overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Administración de Cobros</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Sincronización Cloud de Pagos Institucionales</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar por nombre o DNI..." className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl text-sm font-bold shadow-sm" />
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 hover:scale-105 transition-all">
              <Plus size={18} /> Registrar Pago
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
        {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-primary-600 mb-4" size={32} />
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Consultando Ledger...</p>
            </div>
        ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-400 font-black uppercase tracking-widest text-[10px] border-b border-slate-100 dark:border-white/5">
                <tr>
                  <th className="p-8">Miembro</th>
                  <th className="p-8">Detalle Deportivo</th>
                  <th className="p-8 text-center">Estado</th>
                  <th className="p-8">Monto</th>
                  <th className="p-8">Vencimiento</th>
                  <th className="p-8 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredFees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-8">
                        <div className="font-black text-slate-800 dark:text-white uppercase text-sm">{fee.player?.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">DNI: {fee.player?.dni || '-'}</div>
                    </td>
                    <td className="p-8">
                        <div className="text-[10px] font-black text-primary-600 uppercase tracking-widest">{fee.player?.discipline}</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">{fee.player?.category}</div>
                    </td>
                    <td className="p-8">
                      <div className={`mx-auto px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-center w-fit ${getStatusColor(fee.status)}`}>
                        {fee.status === 'UpToDate' ? 'Pagado' : fee.status === 'Pending' ? 'Pendiente' : 'Atrasado'}
                      </div>
                    </td>
                    <td className="p-8 text-slate-800 dark:text-white font-black text-lg">${fee.amount}</td>
                    <td className="p-8 text-slate-500 font-bold text-xs">{fee.due_date}</td>
                    <td className="p-8 text-right">
                        <button onClick={() => handleDelete(fee.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                            <Trash2 size={18} />
                        </button>
                    </td>
                  </tr>
                ))}
                {filteredFees.length === 0 && (
                    <tr><td colSpan={6} className="py-20 text-center text-slate-400 font-black uppercase text-[10px] tracking-widest">No se encontraron registros de cobro</td></tr>
                )}
              </tbody>
            </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl w-full max-w-2xl border border-white/5 overflow-hidden">
                <div className="flex justify-between items-center p-10 border-b border-slate-100 dark:border-white/5">
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Registrar Pago</h3>
                    <button onClick={() => setShowModal(false)} className="p-3 bg-slate-100 dark:bg-white/5 rounded-full hover:bg-red-500 hover:text-white transition-all"><X size={20} /></button>
                </div>
                <div className="p-10 space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Seleccionar Jugador</label>
                        <select 
                            className="w-full p-6 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-primary-500/10"
                            // Fix: memberId changed to player_id
                            value={formData.player_id}
                            onChange={e => setFormData({...formData, player_id: e.target.value})}
                        >
                            <option value="">-- Seleccionar de la Base de Datos --</option>
                            {players.map(p => <option key={p.id} value={p.id}>{p.name} ({p.discipline} - {p.category})</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Monto ($)</label>
                             <input type="number" className="w-full p-6 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl text-xl font-black dark:text-white outline-none" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} />
                        </div>
                        <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Fecha Vencimiento</label>
                             {/* Fix: dueDate changed to due_date */}
                             <input type="date" className="w-full p-6 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl text-sm font-bold dark:text-white outline-none" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Método de Pago</label>
                             {/* Fix: paymentMethod changed to payment_method */}
                             <select className="w-full p-6 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl text-sm font-bold dark:text-white" value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})}>
                                 <option>Efectivo</option>
                                 <option>Transferencia</option>
                                 <option>Mercado Pago</option>
                                 <option>Tarjeta Crédito/Débito</option>
                             </select>
                        </div>
                        <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Estado</label>
                             <select className="w-full p-6 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl text-sm font-bold dark:text-white font-black uppercase" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                                 <option value="UpToDate">Pagado</option>
                                 <option value="Pending">Pendiente</option>
                                 <option value="Late">Vencido</option>
                             </select>
                        </div>
                    </div>
                </div>
                <div className="p-10 border-t border-slate-100 dark:border-white/5 flex justify-end">
                    <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-3 bg-primary-600 text-white px-12 py-5 rounded-3xl font-black uppercase tracking-widest shadow-2xl shadow-primary-500/20 hover:scale-105 active:scale-95 transition-all">
                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Confirmar Registro
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default FeesManagement;
