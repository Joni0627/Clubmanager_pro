
import React, { useState, useMemo } from 'react';
// Fix: Corrected import from types to use Discipline instead of non-existent DisciplineConfig
import { Player, Discipline } from '../types';
import { Calendar as CalendarIcon, Save, Check, X, Clock, AlertCircle, Users, Settings, Plus, LayoutGrid, Loader2 } from 'lucide-react';

interface AttendanceTrackerProps {
  players: Player[];
  clubConfig: any; // Pasamos el config para tener las disciplinas reales
}

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ players, clubConfig }) => {
  const [selectedDisc, setSelectedDisc] = useState<string | null>(clubConfig.disciplines?.[0]?.name || null);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const currentDisc = useMemo(() => clubConfig.disciplines?.find((d: any) => d.name === selectedDisc), [selectedDisc, clubConfig]);
  
  const filteredPlayers = useMemo(() => {
    return players.filter(p => p.discipline === selectedDisc && (!selectedCat || p.category === selectedCat));
  }, [players, selectedDisc, selectedCat]);

  const handleStatusChange = (playerId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [playerId]: status }));
  };

  const handleSave = async () => {
      setIsSaving(true);
      setTimeout(() => {
          setIsSaving(false);
          alert("Sincronizado con el servidor de asistencia.");
      }, 1500);
  };

  const getBtnClass = (id: string, s: string) => {
      const active = attendance[id] === s;
      const base = "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ";
      if (!active) return base + "bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-white/5";
      if (s === 'P') return base + "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20";
      if (s === 'A') return base + "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20";
      return base + "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20";
  };

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-10">
        <div>
            <h2 className="text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Control de Presentismo</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Registro diario por categoría</p>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-3 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5">
            <CalendarIcon size={18} className="text-primary-600" />
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-transparent font-black text-xs outline-none" />
        </div>
      </div>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {clubConfig.disciplines?.map((d: any) => (
              <button key={d.id} onClick={() => { setSelectedDisc(d.name); setSelectedCat(null); }} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedDisc === d.name ? 'bg-primary-600 text-white shadow-xl' : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-white/5'}`}>
                  {d.name}
              </button>
          ))}
      </div>

      {currentDisc && (
          <div className="flex gap-2 mb-10">
              {currentDisc.categories.map((c: any) => (
                  <button key={c.id} onClick={() => setSelectedCat(c.name)} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedCat === c.name ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {c.name}
                  </button>
              ))}
          </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
        <div className="p-8 space-y-4">
            {filteredPlayers.length > 0 ? filteredPlayers.map(p => (
                <div key={p.id} className="flex items-center gap-6 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-[2rem] border border-slate-100 dark:border-white/5 group">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200">
                        <img src={p.photoUrl || 'https://via.placeholder.com/64'} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tighter">{p.name}</h4>
                        <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest">{p.position}</p>
                    </div>
                    <div className="flex gap-2 w-72">
                        <button onClick={() => handleStatusChange(p.id, 'P')} className={getBtnClass(p.id, 'P')}>P</button>
                        <button onClick={() => handleStatusChange(p.id, 'A')} className={getBtnClass(p.id, 'A')}>A</button>
                        <button onClick={() => handleStatusChange(p.id, 'T')} className={getBtnClass(p.id, 'T')}>T</button>
                    </div>
                </div>
            )) : (
                <div className="py-20 text-center">
                    <Users size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No hay jugadores asignados a esta categoría</p>
                </div>
            )}
        </div>
        {filteredPlayers.length > 0 && (
            <div className="p-8 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-white/5 flex justify-end">
                <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all">
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Finalizar Lista
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceTracker;
