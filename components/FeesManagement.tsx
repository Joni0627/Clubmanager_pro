import React, { useState } from 'react';
import { MemberFee } from '../types';
import { Search, DollarSign, Filter, MoreHorizontal, Check, AlertCircle, Calendar, Plus, X, Trash2, Save, CreditCard } from 'lucide-react';

const FeesManagement: React.FC = () => {
  // Mock Data
  const [fees, setFees] = useState<MemberFee[]>([
    { id: '1', memberId: 'm1', memberName: 'Lionel Andrés', type: 'Jugador', lastPaymentDate: '2023-11-01', status: 'UpToDate', amount: 50, dueDate: '2023-12-05', paymentMethod: 'Transferencia', reference: 'TRF-123456' },
    { id: '2', memberId: 'm2', memberName: 'Juan Pérez (Socio)', type: 'Socio', lastPaymentDate: '2023-09-01', status: 'Late', amount: 30, dueDate: '2023-10-05', paymentMethod: 'Efectivo', reference: '-' },
    { id: '3', memberId: 'm3', memberName: 'Carlos DT', type: 'Staff', lastPaymentDate: '2023-11-05', status: 'Pending', amount: 0, dueDate: '2023-12-05' },
  ]);

  const [filterType, setFilterType] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [editingFee, setEditingFee] = useState<MemberFee | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<MemberFee>>({});

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UpToDate': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'Pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Late': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleEdit = (fee: MemberFee) => {
      setEditingFee(fee);
      setFormData(fee);
      setShowModal(true);
  };

  const handleCreate = () => {
      setEditingFee(null);
      setFormData({ status: 'Pending', type: 'Socio', paymentMethod: 'Efectivo' });
      setShowModal(true);
  };

  const handleDelete = () => {
      if(confirm('¿Eliminar registro de pago?')) {
          setFees(prev => prev.filter(f => f.id !== editingFee?.id));
          setShowModal(false);
      }
  };

  const handleSave = () => {
      // Mock save
      console.log('Saving fee:', formData);
      setShowModal(false);
  };

  const filteredFees = fees.filter(f => filterType === 'Todos' || f.type === filterType);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <DollarSign className="text-primary-600" /> Gestión de Cuotas
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Control de pagos de socios, jugadores y staff</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
            <Filter size={18} className="text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent font-medium text-slate-800 dark:text-white text-sm outline-none"
            >
              <option value="Todos">Todos</option>
              <option value="Jugador">Jugadores</option>
              <option value="Socio">Socios</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-colors"
          >
              <Plus size={18} /> Registrar Pago
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">Socio / Miembro</th>
              <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">Tipo</th>
              <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">Estado</th>
              <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">Monto</th>
              <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">Método</th>
              <th className="p-4 font-semibold text-slate-600 dark:text-slate-400 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredFees.map((fee) => (
              <tr 
                key={fee.id} 
                className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
                onClick={() => handleEdit(fee)}
              >
                <td className="p-4 font-bold text-slate-800 dark:text-white">
                    {fee.memberName}
                    <div className="text-xs text-slate-400 font-normal mt-0.5">ID: {fee.memberId}</div>
                </td>
                <td className="p-4 text-slate-500 dark:text-slate-400">{fee.type}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${getStatusColor(fee.status)}`}>
                    {fee.status === 'UpToDate' && <Check size={12} />}
                    {fee.status === 'Late' && <AlertCircle size={12} />}
                    {fee.status === 'UpToDate' ? 'Al Día' : fee.status === 'Pending' ? 'Pendiente' : 'Atrasado'}
                  </span>
                </td>
                <td className="p-4 text-slate-800 dark:text-white font-mono font-bold">${fee.amount}</td>
                <td className="p-4 text-slate-600 dark:text-slate-300 text-sm">
                   {fee.paymentMethod || '-'}
                   {fee.reference && <div className="text-[10px] text-slate-400 truncate max-w-[100px]" title={fee.reference}>Ref: {fee.reference}</div>}
                </td>
                <td className="p-4 text-right">
                  <button className="text-slate-400 hover:text-primary-600 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal ABM Pagos */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 animate-fade-in">
                <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                        {editingFee ? 'Editar Pago' : 'Registrar Nuevo Pago'}
                    </h3>
                    <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    {/* Header Socio */}
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">ID Socio / Jugador</label>
                                <input 
                                    type="text" 
                                    className="w-full p-2 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded text-sm dark:text-white"
                                    value={formData.memberId || ''}
                                    onChange={e => setFormData({...formData, memberId: e.target.value})}
                                    placeholder="Ej: SOC-001"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Tipo Miembro</label>
                                <select 
                                    className="w-full p-2 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded text-sm dark:text-white"
                                    value={formData.type}
                                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                                >
                                    <option value="Socio">Socio</option>
                                    <option value="Jugador">Jugador</option>
                                    <option value="Staff">Staff</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-3 space-y-1">
                             <label className="text-xs font-bold text-slate-500 uppercase">Nombre Completo</label>
                             <input 
                                type="text" 
                                className="w-full p-2 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded text-sm dark:text-white"
                                value={formData.memberName || ''}
                                onChange={e => setFormData({...formData, memberName: e.target.value})}
                                placeholder="Apellido, Nombre"
                             />
                        </div>
                    </div>

                    {/* Detalle Pago */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                             <label className="text-xs font-bold text-slate-500 uppercase">Monto Cuota ($)</label>
                             <input 
                                type="number" 
                                className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded dark:text-white font-bold"
                                value={formData.amount || 0}
                                onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
                             />
                        </div>
                        <div className="space-y-1">
                             <label className="text-xs font-bold text-slate-500 uppercase">Fecha Pago</label>
                             <input 
                                type="date" 
                                className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded dark:text-white"
                                value={formData.lastPaymentDate || ''}
                                onChange={e => setFormData({...formData, lastPaymentDate: e.target.value})}
                             />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                             <label className="text-xs font-bold text-slate-500 uppercase">Método Pago</label>
                             <select 
                                className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded dark:text-white"
                                value={formData.paymentMethod || 'Efectivo'}
                                onChange={e => setFormData({...formData, paymentMethod: e.target.value as any})}
                             >
                                 <option value="Efectivo">Efectivo</option>
                                 <option value="Transferencia">Transferencia</option>
                                 <option value="Tarjeta">Tarjeta Débito/Crédito</option>
                             </select>
                        </div>
                        <div className="space-y-1">
                             <label className="text-xs font-bold text-slate-500 uppercase">Referencia / Comprobante</label>
                             <input 
                                type="text" 
                                className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded dark:text-white"
                                value={formData.reference || ''}
                                onChange={e => setFormData({...formData, reference: e.target.value})}
                                placeholder="Nro Operación"
                             />
                        </div>
                    </div>

                     <div className="space-y-1">
                             <label className="text-xs font-bold text-slate-500 uppercase">Estado Cuenta</label>
                             <select 
                                className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded dark:text-white"
                                value={formData.status || 'Pending'}
                                onChange={e => setFormData({...formData, status: e.target.value as any})}
                             >
                                 <option value="UpToDate">Al Día (Pagado)</option>
                                 <option value="Pending">Pendiente</option>
                                 <option value="Late">Atrasado (Deuda)</option>
                             </select>
                        </div>

                </div>
                <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                    {editingFee ? (
                        <button onClick={handleDelete} className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium px-4 py-2">
                            <Trash2 size={18} /> Eliminar
                        </button>
                    ) : <div></div>}
                    <div className="flex gap-3">
                        <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium">Cancelar</button>
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

export default FeesManagement;