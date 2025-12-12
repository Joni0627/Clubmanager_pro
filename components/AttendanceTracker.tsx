import React, { useState } from 'react';
import { Player, TrainingGroup, Discipline } from '../types';
import { Calendar as CalendarIcon, Save, Check, X, Clock, AlertCircle, Filter, Users, Settings, Plus, ChevronRight } from 'lucide-react';

interface AttendanceTrackerProps {
  players: Player[];
}

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ players }) => {
  const [mode, setMode] = useState<'taking' | 'managing'>('taking');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [selectedGroup, setSelectedGroup] = useState<string>('g1');

  // Mock Groups
  const groups: TrainingGroup[] = [
      { id: 'g1', name: 'Primera Fútbol - Grupo A', coachId: 'c1', discipline: 'Fútbol', playerIds: ['1', '2', '3'], schedule: 'Lun-Mie-Vie' },
      { id: 'g2', name: 'Básquet Sub-20', coachId: 'c2', discipline: 'Básquet', playerIds: [], schedule: 'Mar-Jue' },
      { id: 'g3', name: 'Escuelita Turno Mañana', coachId: 'c3', discipline: 'Fútbol', playerIds: ['7'], schedule: 'Sab' },
  ];

  // Logic for "Taking" mode
  const currentGroup = groups.find(g => g.id === selectedGroup);
  // In a real app, we would filter players by ID. For now, we mock filtering based on Discipline/Category match or simply simulate it.
  // Let's filter players that "belong" to this group logic (mocked by discipline for simplicity in this view)
  const filteredPlayers = players.filter(p => p.discipline === currentGroup?.discipline); 

  const handleStatusChange = (playerId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [playerId]: status }));
  };

  const getStatusButtonClass = (playerId: string, status: string) => {
    const isSelected = attendance[playerId] === status;
    const baseClass = "p-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium border ";
    if (isSelected) {
      switch(status) {
        case 'Present': return baseClass + "bg-emerald-100 text-emerald-700 border-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-400";
        case 'Absent': return baseClass + "bg-red-100 text-red-700 border-red-500 dark:bg-red-900/30 dark:text-red-400";
        case 'Late': return baseClass + "bg-yellow-100 text-yellow-700 border-yellow-500 dark:bg-yellow-900/30 dark:text-yellow-400";
        case 'Excused': return baseClass + "bg-blue-100 text-blue-700 border-blue-500 dark:bg-blue-900/30 dark:text-blue-400";
        default: return baseClass;
      }
    } else {
      return baseClass + "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700";
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              {mode === 'taking' ? 'Toma de Asistencia' : 'Planificación de Grupos'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
              {mode === 'taking' ? 'Registro diario de actividad' : 'Administración de grupos de entrenamiento y asignaciones'}
          </p>
        </div>
        
        <div className="flex gap-3 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
             <button 
                onClick={() => setMode('taking')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'taking' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
             >
                 Tomar Lista
             </button>
             <button 
                onClick={() => setMode('managing')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${mode === 'managing' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
             >
                 <Settings size={16} /> Configurar Grupos
             </button>
        </div>
      </div>

      {mode === 'taking' ? (
        <>
            <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl mb-6 flex flex-col md:flex-row gap-6 items-center border border-slate-200 dark:border-slate-700">
                <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Seleccionar Grupo Asignado</label>
                    <select 
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        className="w-full p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg font-medium text-slate-800 dark:text-white shadow-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                        {groups.map(g => (
                            <option key={g.id} value={g.id}>{g.name} ({g.schedule})</option>
                        ))}
                    </select>
                </div>
                <div className="w-px h-10 bg-slate-300 dark:bg-slate-600 hidden md:block"></div>
                <div className="w-full md:w-auto">
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Fecha de Entrenamiento</label>
                     <div className="flex items-center gap-2 bg-white dark:bg-slate-700 p-2.5 rounded-lg border border-slate-200 dark:border-slate-600">
                        <CalendarIcon className="text-primary-500" size={18} />
                        <input 
                            type="date" 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-transparent text-slate-800 dark:text-white font-medium focus:outline-none text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-500 dark:text-slate-400">
                <div className="col-span-4 md:col-span-3 flex items-center gap-2">
                    <Users size={16}/> JUGADORES ({filteredPlayers.length})
                </div>
                <div className="col-span-8 md:col-span-9 text-center md:text-left">ASISTENCIA</div>
                </div>
                
                <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[60vh] overflow-y-auto">
                    {filteredPlayers.map(player => (
                        <div key={player.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <div className="col-span-4 md:col-span-3 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200">
                                <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 dark:text-white text-sm">{player.name}</p>
                                <p className="text-xs text-slate-500">{player.discipline} • {player.category}</p>
                            </div>
                        </div>
                        
                        <div className="col-span-8 md:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-2">
                            <button onClick={() => handleStatusChange(player.id, 'Present')} className={getStatusButtonClass(player.id, 'Present')}>
                                <Check size={16} /> <span className="hidden md:inline">Presente</span>
                            </button>
                            <button onClick={() => handleStatusChange(player.id, 'Late')} className={getStatusButtonClass(player.id, 'Late')}>
                                <Clock size={16} /> <span className="hidden md:inline">Tarde</span>
                            </button>
                            <button onClick={() => handleStatusChange(player.id, 'Absent')} className={getStatusButtonClass(player.id, 'Absent')}>
                                <X size={16} /> <span className="hidden md:inline">Ausente</span>
                            </button>
                            <button onClick={() => handleStatusChange(player.id, 'Excused')} className={getStatusButtonClass(player.id, 'Excused')}>
                                <AlertCircle size={16} /> <span className="hidden md:inline">Justificado</span>
                            </button>
                        </div>
                        </div>
                    ))}
                </div>
                
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                <button 
                    disabled={filteredPlayers.length === 0}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-primary-500/20 transition-all"
                >
                    <Save size={18} /> Guardar Asistencia
                </button>
                </div>
            </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
             {/* List of Groups */}
             <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                 <div className="flex justify-between items-center mb-6">
                     <h3 className="font-bold text-lg text-slate-800 dark:text-white">Grupos Vigentes</h3>
                     <button className="text-sm bg-slate-900 dark:bg-slate-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-slate-800">
                         <Plus size={14}/> Crear Nuevo
                     </button>
                 </div>
                 <div className="space-y-3">
                     {groups.map(g => (
                         <div key={g.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary-500 cursor-pointer transition-colors group">
                             <div className="flex justify-between items-start">
                                 <div>
                                     <h4 className="font-bold text-slate-800 dark:text-white">{g.name}</h4>
                                     <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{g.discipline} • {g.schedule}</p>
                                 </div>
                                 <ChevronRight className="text-slate-300 group-hover:text-primary-500" />
                             </div>
                             <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide">
                                 <span>{g.playerIds.length} Jugadores</span>
                                 <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                 <span>Coach ID: {g.coachId}</span>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>

             {/* Assignation Panel (Mock) */}
             <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 flex flex-col items-center justify-center text-center">
                 <Settings size={48} className="text-slate-300 mb-4" />
                 <h3 className="font-bold text-lg text-slate-700 dark:text-slate-300">Configuración de Grupo</h3>
                 <p className="text-slate-500 dark:text-slate-400 max-w-xs mt-2">Selecciona un grupo de la izquierda para editar sus miembros y asignar un entrenador responsable.</p>
             </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTracker;