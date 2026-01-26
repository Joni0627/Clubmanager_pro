
import React, { useState, useEffect } from 'react';
import { Discipline, ClubConfig, Player } from '../types';
import { 
  BarChart3, Users, CalendarCheck2, Stethoscope, ChevronLeft, 
  ArrowRight, Activity, Trophy, TrendingUp, Search
} from 'lucide-react';
import Dashboard from './Dashboard';
import AttendanceTracker from './AttendanceTracker';
import MedicalDashboard from './MedicalDashboard';
import PlayerCard from './PlayerCard';

interface DisciplineConsoleProps {
  discipline: Discipline;
  clubConfig: ClubConfig;
  players: Player[];
  onBack: () => void;
}

const DisciplineConsole: React.FC<DisciplineConsoleProps> = ({ discipline, clubConfig, players, onBack }) => {
  const [activeSubTab, setActiveSubTab] = useState<'summary' | 'players' | 'attendance' | 'medical'>('summary');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const disciplinePlayers = players.filter(p => p.discipline === discipline.name);

  const subTabs = [
    { id: 'summary', label: 'Resumen', icon: BarChart3 },
    { id: 'players', label: 'Plantel', icon: Users },
    { id: 'attendance', label: 'Asistencia', icon: CalendarCheck2 },
    { id: 'medical', label: 'Médico', icon: Stethoscope },
  ];

  return (
    <div className="animate-fade-in">
      {/* HEADER DE LA CONSOLA */}
      <header className="bg-white dark:bg-[#0f1219] border-b border-slate-200 dark:border-white/5 px-6 md:px-12 py-10">
        <div className="max-w-7xl mx-auto">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary-600 transition-all mb-8 group"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Volver a Disciplinas
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="flex items-center gap-8">
              {/* Marco Circular con Animación de Entrada */}
              <div className={`w-28 h-28 rounded-full bg-slate-950 flex items-center justify-center shadow-2xl border-4 border-primary-600/30 overflow-hidden shrink-0 transition-all duration-700 delay-100 ${isLoaded ? 'scale-100 rotate-0' : 'scale-150 -rotate-12'}`}>
                {discipline.iconUrl ? (
                  <img src={discipline.iconUrl} className="w-full h-full object-cover rounded-full p-1" />
                ) : (
                  <Activity size={32} className="text-primary-600" />
                )}
              </div>
              <div>
                <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter dark:text-white leading-none mb-4 italic transition-all duration-500 translate-y-0 opacity-100">{discipline.name}</h2>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-1.5 rounded-full bg-primary-600/10 text-primary-600 text-[10px] font-black uppercase tracking-widest">Consola Deportiva</div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{disciplinePlayers.length} Atletas Activos</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 bg-slate-100 dark:bg-white/5 p-2 rounded-full border border-slate-200 dark:border-white/5">
              {subTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${activeSubTab === tab.id ? 'bg-white dark:bg-slate-800 text-primary-600 shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <tab.icon size={16} />
                  <span className="hidden lg:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO SEGÚN SUBTAB */}
      <div className="max-w-7xl mx-auto py-12 px-6">
        {activeSubTab === 'summary' && (
          <div className="space-y-12 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white dark:bg-[#0f1219] p-10 rounded-[3rem] shadow-sm border border-slate-200 dark:border-white/5 hover:border-primary-600/20 transition-all">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Eficiencia Promedio</p>
                   <div className="flex items-end gap-4">
                      <span className="text-6xl font-black dark:text-white leading-none">84.2</span>
                      <TrendingUp className="text-emerald-500 mb-2" size={24} />
                   </div>
                </div>
                <div className="bg-white dark:bg-[#0f1219] p-10 rounded-[3rem] shadow-sm border border-slate-200 dark:border-white/5 hover:border-primary-600/20 transition-all">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Partidos Ganados</p>
                   <div className="flex items-end gap-4">
                      <span className="text-6xl font-black dark:text-white leading-none">12</span>
                      <Trophy className="text-yellow-500 mb-2" size={24} />
                   </div>
                </div>
                <div className="bg-white dark:bg-[#0f1219] p-10 rounded-[3rem] shadow-sm border border-slate-200 dark:border-white/5 hover:border-primary-600/20 transition-all">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Presentismo</p>
                   <div className="flex items-end gap-4">
                      <span className="text-6xl font-black dark:text-white leading-none">95%</span>
                      <Activity className="text-primary-600 mb-2" size={24} />
                   </div>
                </div>
             </div>
             <Dashboard />
          </div>
        )}

        {activeSubTab === 'players' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in">
            {disciplinePlayers.map(player => (
              <div 
                key={player.id} 
                onClick={() => setSelectedPlayer(player)}
                className="bg-white dark:bg-[#0f1219] rounded-[3rem] p-8 border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full border-4 border-slate-50 dark:border-slate-800 p-1 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                    <img src={player.photoUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-cover rounded-full" />
                  </div>
                  <h3 className="font-black uppercase tracking-tighter text-xl text-slate-800 dark:text-white text-center leading-none mb-2">{player.name}</h3>
                  <p className="text-[9px] font-black text-primary-600 uppercase tracking-widest mb-4">{player.position}</p>
                  <div className="w-full h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-600" style={{ width: `${player.overallRating}%` }}></div>
                  </div>
                </div>
                <div className="absolute top-6 right-6 font-black italic text-2xl text-slate-100 dark:text-white/5 group-hover:text-primary-600 transition-colors">#{player.number}</div>
              </div>
            ))}
            {disciplinePlayers.length === 0 && (
              <div className="col-span-full py-32 text-center opacity-30 border-4 border-dashed border-slate-200 dark:border-white/5 rounded-[4rem]">
                 <Users size={64} className="mx-auto mb-6" />
                 <p className="font-black uppercase tracking-widest text-xs">Sin atletas asignados</p>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'attendance' && (
          <div className="bg-white dark:bg-[#0f1219] rounded-[4rem] border border-slate-200 dark:border-white/5 shadow-2xl p-4 md:p-12 animate-fade-in">
             <AttendanceTracker players={disciplinePlayers} clubConfig={clubConfig} />
          </div>
        )}

        {activeSubTab === 'medical' && (
          <div className="bg-white dark:bg-[#0f1219] rounded-[4rem] border border-slate-200 dark:border-white/5 shadow-2xl p-4 md:p-12 animate-fade-in">
             <MedicalDashboard players={disciplinePlayers} />
          </div>
        )}
      </div>

      {selectedPlayer && (
        <PlayerCard 
          player={selectedPlayer} 
          onClose={() => setSelectedPlayer(null)} 
          clubConfig={clubConfig}
        />
      )}
    </div>
  );
};

export default DisciplineConsole;
