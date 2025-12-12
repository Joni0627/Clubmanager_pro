import React, { useState } from 'react';
import { MemberFee } from '../types';
import { Search, DollarSign, Filter, MoreHorizontal, Check, AlertCircle, Calendar } from 'lucide-react';

const FeesManagement: React.FC = () => {
  // Mock Data
  const [fees, setFees] = useState<MemberFee[]>([
    { id: '1', memberId: 'm1', memberName: 'Lionel Andrés', type: 'Jugador', lastPaymentDate: '2023-11-01', status: 'UpToDate', amount: 50, dueDate: '2023-12-05' },
    { id: '2', memberId: 'm2', memberName: 'Juan Pérez (Socio)', type: 'Socio', lastPaymentDate: '2023-09-01', status: 'Late', amount: 30, dueDate: '2023-10-05' },
    { id: '3', memberId: 'm3', memberName: 'Carlos DT', type: 'Staff', lastPaymentDate: '2023-11-05', status: 'Pending', amount: 0, dueDate: '2023-12-05' },
  ]);

  const [filterType, setFilterType] = useState('Todos');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UpToDate': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'Pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Late': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700';
    }
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
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar socio..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">Socio / Miembro</th>
              <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">Tipo</th>
              <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">Estado</th>
              <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">Último Pago</th>
              <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">Vencimiento</th>
              <th className="p-4 font-semibold text-slate-600 dark:text-slate-400 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredFees.map((fee) => (
              <tr key={fee.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td className="p-4 font-bold text-slate-800 dark:text-white">{fee.memberName}</td>
                <td className="p-4 text-slate-500 dark:text-slate-400">{fee.type}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${getStatusColor(fee.status)}`}>
                    {fee.status === 'UpToDate' && <Check size={12} />}
                    {fee.status === 'Late' && <AlertCircle size={12} />}
                    {fee.status === 'UpToDate' ? 'Al Día' : fee.status === 'Pending' ? 'Pendiente' : 'Atrasado'}
                  </span>
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300 text-sm">{fee.lastPaymentDate}</td>
                <td className="p-4 text-slate-600 dark:text-slate-300 text-sm flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400"/> {fee.dueDate}
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
    </div>
  );
};

export default FeesManagement;