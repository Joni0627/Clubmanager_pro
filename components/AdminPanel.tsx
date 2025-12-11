import React, { useState } from 'react';
import { Staff, Fixture, InventoryItem } from '../types.ts';
import { Plus, Trash2, Edit2, AlertCircle, CheckCircle } from 'lucide-react';

interface AdminPanelProps {
  activeTab: 'fixtures' | 'staff' | 'inventory';
}

const AdminPanel: React.FC<AdminPanelProps> = ({ activeTab }) => {
  // Mock Data
  const [fixtures] = useState<Fixture[]>([
    { id: '1', opponent: 'Real Madrid CF', date: '2023-11-15', venue: 'Home', competition: 'La Liga', result: 'Pending' },
    { id: '2', opponent: 'FC Barcelona', date: '2023-11-22', venue: 'Away', competition: 'La Liga', result: 'Pending' },
    { id: '3', opponent: 'Atlético Madrid', date: '2023-11-08', venue: 'Home', competition: 'Copa del Rey', result: '2-1' },
  ]);

  const [staff] = useState<Staff[]>([
    { id: '1', name: 'Carlo Ancelotti', role: 'Entrenador Principal', phone: '+34 600 000 000' },
    { id: '2', name: 'Antonio Pintus', role: 'Preparador Físico', phone: '+34 600 000 001' },
    { id: '3', name: 'Dr. House', role: 'Jefe Médico', phone: '+34 600 000 002' },
  ]);

  const [inventory] = useState<InventoryItem[]>([
    { id: '1', name: 'Balones Oficiales', category: 'Entrenamiento', quantity: 50, status: 'Good' },
    { id: '2', name: 'Petos Entrenamiento', category: 'Ropa', quantity: 12, status: 'Low' },
    { id: '3', name: 'Conos Tácticos', category: 'Entrenamiento', quantity: 100, status: 'Good' },
    { id: '4', name: 'Vendas Kinésicas', category: 'Médico', quantity: 5, status: 'Critical' },
  ]);

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Good': return 'bg-emerald-100 text-emerald-800';
          case 'Low': return 'bg-yellow-100 text-yellow-800';
          case 'Critical': return 'bg-red-100 text-red-800';
          default: return 'bg-slate-100 text-slate-800';
      }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 capitalize">
            {activeTab === 'fixtures' ? 'Calendario de Temporada' : 
             activeTab === 'staff' ? 'Gestión de Personal' : 'Control de Inventario'}
        </h2>
        <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            <Plus size={18} />
            <span>Nuevo Registro</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {activeTab === 'fixtures' && (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold text-slate-600">Fecha</th>
                <th className="p-4 font-semibold text-slate-600">Oponente</th>
                <th className="p-4 font-semibold text-slate-600">Competición</th>
                <th className="p-4 font-semibold text-slate-600">Estadio</th>
                <th className="p-4 font-semibold text-slate-600">Resultado</th>
                <th className="p-4 font-semibold text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fixtures.map((match) => (
                <tr key={match.id} className="hover:bg-slate-50">
                  <td className="p-4 text-slate-700">{match.date}</td>
                  <td className="p-4 font-medium text-slate-900">{match.opponent}</td>
                  <td className="p-4 text-slate-500">{match.competition}</td>
                  <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${match.venue === 'Home' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                          {match.venue === 'Home' ? 'Local' : 'Visitante'}
                      </span>
                  </td>
                  <td className="p-4 font-mono font-bold">{match.result}</td>
                  <td className="p-4 flex gap-2">
                    <button className="p-1 text-slate-400 hover:text-blue-600"><Edit2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'staff' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {staff.map(member => (
                    <div key={member.id} className="border border-slate-200 rounded-lg p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-lg">
                            {member.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">{member.name}</h3>
                            <p className="text-sm text-slate-500">{member.role}</p>
                            <p className="text-xs text-slate-400 mt-1">{member.phone}</p>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {activeTab === 'inventory' && (
            <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold text-slate-600">Ítem</th>
                <th className="p-4 font-semibold text-slate-600">Categoría</th>
                <th className="p-4 font-semibold text-slate-600">Cantidad</th>
                <th className="p-4 font-semibold text-slate-600">Estado</th>
                <th className="p-4 font-semibold text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-900">{item.name}</td>
                  <td className="p-4 text-slate-500">{item.category}</td>
                  <td className="p-4 font-mono">{item.quantity}</td>
                  <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex w-fit items-center gap-1 ${getStatusColor(item.status)}`}>
                          {item.status === 'Critical' && <AlertCircle size={12}/>}
                          {item.status === 'Good' && <CheckCircle size={12}/>}
                          {item.status === 'Low' ? 'Bajo Stock' : item.status === 'Critical' ? 'Crítico' : 'Óptimo'}
                      </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    <button className="p-1 text-slate-400 hover:text-blue-600"><Edit2 size={16}/></button>
                    <button className="p-1 text-slate-400 hover:text-red-600"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;