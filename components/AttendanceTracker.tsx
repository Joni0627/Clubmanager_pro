import React, { useState } from 'react';
import { Player } from '../types';
import { Calendar as CalendarIcon, Save, Check, X, Clock, AlertCircle } from 'lucide-react';

interface AttendanceTrackerProps {
  players: Player[];
}

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ players }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});

  const handleStatusChange = (playerId: string, status: string) => {
    setAttendance(prev => ({
      ...prev,
      [playerId]: status
    }));
  };

  const getStatusButtonClass = (playerId: string, status: string) => {
    const isSelected = attendance[playerId] === status;
    
    let baseClass = "p-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium border ";
    
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Control de Asistencia</h2>
          <p className="text-slate-500 dark:text-slate-400">Registro diario de actividad del plantel</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
           <CalendarIcon className="text-primary-500" size={20} />
           <input 
             type="date" 
             value={date} 
             onChange={(e) => setDate(e.target.value)}
             className="bg-transparent text-slate-800 dark:text-white font-medium focus:outline-none"
           />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-500 dark:text-slate-400">
           <div className="col-span-4 md:col-span-3">JUGADOR</div>
           <div className="col-span-8 md:col-span-9">ESTADO</div>
        </div>
        
        <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[60vh] overflow-y-auto">
          {players.map(player => (
            <div key={player.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
               <div className="col-span-4 md:col-span-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200">
                     <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                     <p className="font-bold text-slate-800 dark:text-white text-sm">{player.name}</p>
                     <p className="text-xs text-slate-500">#{player.number}</p>
                  </div>
               </div>
               
               <div className="col-span-8 md:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button 
                    onClick={() => handleStatusChange(player.id, 'Present')}
                    className={getStatusButtonClass(player.id, 'Present')}
                  >
                    <Check size={16} /> <span className="hidden md:inline">Presente</span>
                  </button>
                  <button 
                    onClick={() => handleStatusChange(player.id, 'Late')}
                    className={getStatusButtonClass(player.id, 'Late')}
                  >
                    <Clock size={16} /> <span className="hidden md:inline">Tarde</span>
                  </button>
                  <button 
                    onClick={() => handleStatusChange(player.id, 'Absent')}
                    className={getStatusButtonClass(player.id, 'Absent')}
                  >
                    <X size={16} /> <span className="hidden md:inline">Ausente</span>
                  </button>
                  <button 
                    onClick={() => handleStatusChange(player.id, 'Excused')}
                    className={getStatusButtonClass(player.id, 'Excused')}
                  >
                    <AlertCircle size={16} /> <span className="hidden md:inline">Justificado</span>
                  </button>
               </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex justify-end">
           <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-primary-500/20 transition-all">
              <Save size={18} /> Guardar Asistencia
           </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracker;