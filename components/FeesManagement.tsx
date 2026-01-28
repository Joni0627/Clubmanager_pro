
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MemberFee, Member } from '../types';
import { 
  Search, DollarSign, Filter, Check, AlertCircle, Calendar, Plus, X, 
  Trash2, Save, CreditCard, Loader2, User, History, TrendingUp, 
  ArrowUpRight, AlertTriangle, Clock, Receipt, Wallet, FileText, 
  Camera, Link as LinkIcon, ExternalLink, Image as ImageIcon
} from 'lucide-react';
import { db } from '../lib/supabase';

const FeesManagement: React.FC = () => {
  const [fees, setFees] = useState<MemberFee[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedMemberHistory, setSelectedMemberHistory] = useState<Member | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State para nueva cuota
  const [formData, setFormData] = useState<Partial<MemberFee>>({
    status: 'Pending',
    amount: 5000,
    due_date: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString().split('T')[0],
    period: new Date().toISOString().slice(0, 7),
    payment_method: 'Efectivo',
    receipt_url: '',
    reference: ''
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data: feesData } = await db.fees.getAll();
      const { data: membersData } = await db.members.getAll();
      
      if (feesData && membersData) {
        const enrichedFees = feesData.map(f => ({
          ...f,
          member: membersData.find(m => m.id === f.member_id)
        }));
        setFees(enrichedFees);
      } else if (feesData) {
        setFees(feesData);
      }
      
      if (membersData) setMembers(membersData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const stats = useMemo(() => {
    const total = fees.reduce((acc, f) => acc + f.amount, 0);
    const paid = fees.filter(f => f.status === 'Paid').reduce((acc, f) => acc + f.amount, 0);
    const pending = total - paid;
    const lateCount = fees.filter(f => f.status === 'Late' || (new Date(f.due_date) < new Date() && f.status !== 'Paid')).length;
    return { total, paid, pending, lateCount };
  }, [fees]);

  // BUSCADOR INTELIGENTE: Filtra por nombre, apellido o DNI (tokenizado)
  const filteredFees = useMemo(() => {
    if (!searchTerm.trim()) return fees.sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime());

    const tokens = searchTerm.toLowerCase().split(/\s+/).filter(t => t.length > 0);

    return fees.filter(f => {
      const memberName = (f.member?.name || '').toLowerCase();
      const memberDni = (f.member?.dni || '').toLowerCase();
      const reference = (f.reference || '').toLowerCase();
      
      // Debe coincidir cada token de búsqueda en alguno de los campos
      return tokens.every(token => 
        memberName.includes(token) || 
        memberDni.includes(token) ||
        reference.includes(token)
      );
    }).sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime());
  }, [fees, searchTerm]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, receipt_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!formData.member_id) return alert("Selecciona un miembro");
    setIsSaving(true);
    try {
      const finalStatus = formData.receipt_url || formData.payment_date ? 'Paid' : (formData.status || 'Pending');
      
      const payload = { 
        ...formData, 
        status: finalStatus,
        payment_date: finalStatus === 'Paid' ? (formData.payment_date || new Date().toISOString().split('T')[0]) : null
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

  const markAsPaid = async (fee: MemberFee) => {
    const updated = { 
      ...fee, 
      status: 'Paid' as const, 
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: fee.payment_method || 'Efectivo' 
    };
    delete updated.member;
    await db.fees.upsert(updated);
    await loadData();
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status !== 'Paid';
    if (status === 'Paid') return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-[8px] font-black uppercase rounded-full border border-emerald-500/20">Pagado</span>;
    if (isOverdue) return <span className="px-3 py-1 bg-red-500/10 text-red-600 text-[8px] font-black uppercase rounded-full border border-red-500/20 animate-pulse">Vencido</span>;
    return <span className="px-3 py-1 bg-amber-500/10 text-amber-600 text-[8px] font-black uppercase rounded-full border border-amber-500/20">Pendiente</span>;
  };

  const paymentMethods = [
    'Efectivo', 
    'Transferencia Bancaria', 
    'Tarjeta Débito', 
    'Tarjeta Crédito', 
    'QR / Billetera Digital', 
    'Débito Automático',
    'Otro'
  ];

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto animate-fade-in pb-40">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none italic">
            Control de <span className="text-primary-600">Cuotas</span>
          </h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[9px] mt-4 ml-1">Administración Financiera Plegma</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
            <input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="NOMBRE, APELLIDO O DNI..." 
              className="w-full pl-14 pr-4 py-5 bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-white/5 outline-none font-black text-[11px] uppercase tracking-widest shadow-xl focus:border-primary-600/50 transition-all placeholder:text-slate-300"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-400 transition-all"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button onClick={() => setShowModal(true)} className="bg-primary-600 text-white px-8 py-5 rounded-3xl shadow-xl shadow-primary-600/20 hover:scale-105 active:scale-95 transition-all shrink-0 flex items-center gap-3">
            <Plus size={18} strokeWidth={3} /> <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">Nueva Cuota</span>
          </button>
        </div>
      </header>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Recaudado', value: `$${stats.paid.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Pendiente Cobro', value: `$${stats.pending.toLocaleString()}`, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Socios Morosos', value: stats.lateCount, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'Proyección Mes', value: `$${stats.total.toLocaleString()}`, icon: Receipt, color: 'text-primary-600', bg: 'bg-primary-600/10' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm group hover:shadow-lg transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color} group-hover:scale-110 transition-transform`}>
                <kpi.icon size={20} />
              </div>
              <ArrowUpRight size={14} className="text-slate-300" />
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
            <h4 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{kpi.value}</h4>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800/40 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">
                <th className="px-8 py-6">Socio / Miembro</th>
                <th className="px-8 py-6">Periodo</th>
                <th className="px-8 py-6">Monto</th>
                <th className="px-8 py-6 text-center">Estado</th>
                <th className="px-8 py-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredFees.map(fee => (
                <tr key={fee.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 overflow-hidden shrink-0 border border-slate-200 dark:border-white/5">
                        <img src={fee.member?.photoUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 dark:text-white uppercase italic tracking-tight">{fee.member?.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">DNI: {fee.member?.dni}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-primary-600 uppercase tracking-widest">{fee.period}</span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase">{fee.payment_method || 'Sin definir'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-slate-800 dark:text-white italic">${fee.amount.toLocaleString()}</span>
                      {fee.receipt_url && (
                        <div className="p-1.5 bg-primary-600/10 text-primary-600 rounded-lg animate-bounce" title="Comprobante adjunto">
                           <ImageIcon size={12} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    {getStatusBadge(fee.status, fee.due_date)}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      {fee.status !== 'Paid' && (
                        <button 
                          onClick={() => markAsPaid(fee)}
                          className="p-2.5 bg-emerald-500 text-white rounded-xl hover:scale-110 transition-all shadow-lg shadow-emerald-500/20"
                          title="Marcar como pagado"
                        >
                          <Check size={16} strokeWidth={3} />
                        </button>
                      )}
                      <button 
                        onClick={() => setSelectedMemberHistory(fee.member || null)}
                        className="p-2.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-xl hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                        title="Ver Historial"
                      >
                        <History size={16} />
                      </button>
                      <button 
                        onClick={async () => { if(confirm('¿Eliminar registro?')) { await db.fees.delete(fee.id); loadData(); } }}
                        className="p-2.5 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredFees.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                     <div className="flex flex-col items-center opacity-30">
                        <Search size={48} className="mb-4 text-slate-300" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">No se encontraron socios</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">Prueba buscando por DNI o Nombre parcial</p>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Nueva Cuota */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-3xl z-[500] flex items-center justify-center p-0 md:p-10 animate-fade-in">
          <div className="bg-white dark:bg-[#0f121a] w-full max-w-4xl h-full md:h-auto md:max-h-[90vh] md:rounded-[3rem] shadow-2xl border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-lg">
                    <DollarSign size={20} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase italic tracking-tighter">Gestión de Cobro</h3>
                    <p className="text-[9px] font-black text-primary-600 uppercase tracking-widest">Emisión de Comprobante</p>
                 </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-red-500 hover:text-white transition-all"><X size={20} /></button>
            </div>

            <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Seleccionar Miembro / Socio</label>
                     <div className="relative">
                       <User className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-600" size={18} />
                       <select 
                         value={formData.member_id}
                         onChange={e => setFormData({...formData, member_id: e.target.value})}
                         className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-sm dark:text-white outline-none border border-transparent dark:border-white/5 appearance-none"
                       >
                         <option value="">-- BUSCAR EN PADRÓN --</option>
                         {members.map(m => <option key={m.id} value={m.id}>{m.name} (DNI: {m.dni})</option>)}
                       </select>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Importe ($)</label>
                       <input 
                         type="number" 
                         value={formData.amount}
                         onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
                         className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-black text-xl dark:text-white outline-none border border-transparent dark:border-white/5 shadow-inner"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Periodo</label>
                       <input 
                         type="month" 
                         value={formData.period}
                         onChange={e => setFormData({...formData, period: e.target.value})}
                         className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-sm dark:text-white outline-none border border-transparent dark:border-white/5"
                       />
                    </div>
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Método de Pago</label>
                     <div className="relative">
                       <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                       <select 
                         value={formData.payment_method}
                         onChange={e => setFormData({...formData, payment_method: e.target.value})}
                         className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-sm dark:text-white outline-none border border-transparent dark:border-white/5 appearance-none"
                       >
                         {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                       </select>
                     </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Adjuntar Comprobante</label>
                     <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf" />
                     <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full h-40 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all cursor-pointer overflow-hidden ${formData.receipt_url ? 'bg-primary-600/5 border-primary-600' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-white/5 hover:border-primary-600'}`}
                     >
                        {formData.receipt_url ? (
                           <div className="flex flex-col items-center gap-2">
                              {formData.receipt_url.startsWith('data:image') ? (
                                 <img src={formData.receipt_url} className="w-20 h-20 object-cover rounded-xl shadow-lg" />
                              ) : (
                                 <FileText size={40} className="text-primary-600" />
                              )}
                              <span className="text-[9px] font-black uppercase text-primary-600">Comprobante Cargado</span>
                           </div>
                        ) : (
                           <>
                              <Camera size={32} className="text-slate-300" />
                              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Subir Imagen / PDF</span>
                           </>
                        )}
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Vencimiento</label>
                       <input 
                         type="date" 
                         value={formData.due_date}
                         onChange={e => setFormData({...formData, due_date: e.target.value})}
                         className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-xs dark:text-white outline-none border border-transparent dark:border-white/5"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Ref. Operación</label>
                       <input 
                         value={formData.reference}
                         onChange={e => setFormData({...formData, reference: e.target.value})}
                         placeholder="NRO TRANSF"
                         className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-xs dark:text-white outline-none border border-transparent dark:border-white/5"
                       />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-end gap-4">
               <button onClick={() => setShowModal(false)} className="px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400">Cancelar</button>
               <button 
                 onClick={handleSave}
                 disabled={isSaving}
                 className="flex items-center justify-center gap-4 bg-primary-600 text-white px-16 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-primary-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
               >
                 {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                 Registrar Pago
               </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Historial Individual */}
      {selectedMemberHistory && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-3xl z-[501] flex items-center justify-center p-4 animate-fade-in">
           <div className="bg-white dark:bg-[#0f121a] w-full max-w-3xl rounded-[3rem] shadow-2xl border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col h-[80vh]">
              <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-lg">
                      <img src={selectedMemberHistory.photoUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase italic tracking-tighter">{selectedMemberHistory.name}</h3>
                      <p className="text-[9px] font-black text-primary-600 uppercase tracking-widest">Resumen Histórico de Pagos</p>
                   </div>
                </div>
                <button onClick={() => setSelectedMemberHistory(null)} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-red-500 hover:text-white transition-all"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
                {fees.filter(f => f.member_id === selectedMemberHistory.id).map(f => (
                  <div key={f.id} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5">
                     <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${f.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                           {f.status === 'Paid' ? <Check size={20} /> : <Clock size={20} />}
                        </div>
                        <div>
                           <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{f.period} - {f.payment_method}</p>
                           <p className="text-lg font-black text-slate-800 dark:text-white italic">${f.amount.toLocaleString()}</p>
                        </div>
                     </div>
                     <div className="text-right flex flex-col items-end gap-2">
                        {f.receipt_url && (
                          <a href={f.receipt_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[8px] font-black uppercase text-primary-600 bg-primary-600/10 px-3 py-1.5 rounded-full hover:bg-primary-600 hover:text-white transition-all">
                             <ExternalLink size={10} /> Ver Comprobante
                          </a>
                        )}
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Vto: {f.due_date}</p>
                     </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default FeesManagement;
