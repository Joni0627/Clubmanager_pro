import React, { useState } from 'react';
import { Staff, Fixture } from '../types.ts';
import { Plus, Trash2, Edit2, AlertCircle, CheckCircle } from 'lucide-react';

interface AdminPanelProps {
  activeTab: 'fixtures' | 'staff';
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white capitalize">
            {activeTab === 'fixtures' ? 'Calendario de Temporada' : 'Gestión de Personal'}
        </h2>
        <button className="flex items-center gap-2 bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            <Plus size={18} />
            <span>Nuevo Registro</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {activeTab === 'fixtures' && (
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">Fecha</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">Oponente</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">Competición</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">Estadio</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">Resultado</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {fixtures.map((match) => (
                <tr key={match.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="p-4 text-slate-700 dark:text-slate-300">{match.date}</td>
                  <td className="p-4 font-medium text-slate-900 dark:text-white">{match.opponent}</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">{match.competition}</td>
                  <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${match.venue === 'Home' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'}`}>
                          {match.venue === 'Home' ? 'Local' : 'Visitante'}
                      </span>
                  </td>
                  <td className="p-4 font-mono font-bold dark:text-white">{match.result}</td>
                  <td className="p-4 flex gap-2">
                    <button className="p-1 text-slate-400 hover:text-primary-600"><Edit2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'staff' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {staff.map(member => (
                    <div key={member.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex items-center gap-4 hover:shadow-md transition-shadow bg-slate-50 dark:bg-slate-700/30">
                        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-300 font-bold text-lg">
                            {member.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">{member.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{member.role}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{member.phone}</p>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;