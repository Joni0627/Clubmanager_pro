
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Discipline, ClubConfig, Player } from '../types';
import { 
  BarChart3, Users, CalendarCheck2, Stethoscope, ChevronLeft, 
  Activity, Trophy, TrendingUp, Filter, CheckCircle2, ChevronRight
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const allCategories = useMemo(() => {
    const cats: { id: string, name: string }[] = [];
    discipline.branches.forEach(branch => {
      if (branch.enabled) {
        branch.categories.forEach(cat => {
          if (!cats.find(c => c.name === cat.name)) {
            cats.push({ id: cat.id, name: cat.name });
          }
        });
      }
    });
    return cats;
  }, [discipline]);

  const filteredPlayers = useMemo(() => {
    let base = players.filter(p => p.discipline === discipline.name);
    if (selectedCategoryId !== 'all') {
      const catName = allCategories.find(c => c.id === selectedCategoryId)?.name;
      base = base.filter(p => p.category === catName);
    }
    return base;
  }, [players, discipline.name, selectedCategoryId, allCategories]);

  const subTabs = [
    { id: 'summary', label: 'Resumen', icon: BarChart3 },
    { id: 'players', label: 'Plantel', icon: Users },
    { id: 'attendance', label: 'Asistencia', icon: CalendarCheck2 },
    { id: 'medical', label: 'Médico', icon: Stethoscope },
  ];

  return (
    <div className="animate-fade-in pb-24">
      {/* HEADER INTEGRADO Y STICKY - COMPACTO */}
      <header className="bg-white/95 dark:bg-[#080a0f]/95 backdrop-blur-3xl border-b border-slate-200 dark:border-white/5 sticky top-24 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button 
                onClick={onBack}
                className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-400 hover:text-primary-600 transition-all group shrink-0"
              >
                <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              </button>
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center shadow-xl border-2 border-primary-600/30 overflow-hidden shrink-0 transition-all duration-700 ${isLoaded ? 'rotate-0 scale-100' : 'rotate-180 scale-50'}`}>
                  {discipline.iconUrl ? <img src={discipline.iconUrl} className="w-full h-full object-cover p-1 rounded-full" /> : <Activity size={18} className="text-primary-600" />}
                </div>
                <div className="truncate">
                  <h2 className="text-3xl font-black uppercase tracking-tighter dark:text-white leading-none italic truncate">{discipline.name}</h2>
                  <p className="text-[8px] font-black text-primary-600 uppercase tracking-widest mt-1">Consola V2.5</p>
                </div>
              </div>
            </div>

            <div className="flex gap-1.5 bg-slate-100 dark:bg-white/5 p-1 rounded-[1.2rem] border border-slate-200 dark:border-white/5 w-full md:w-auto overflow-x-auto no-scrollbar">
              {subTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-[8px] uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === tab.id ? 'bg-white dark:bg-slate-800 text-primary-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <tab.icon size={12} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* DIVISIONES - RE-UBICADO PARA RELLENAR EL ESPACIO */}
          <div className="relative border-t border-slate-100 dark:border-white/5 pt-4">
             <div className="flex items-center gap-3">
               <div className="flex items-center gap-2 text-slate-400 shrink-0 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-white/5">
                 <Filter size={12} className="text-primary-600" />
                 <span className="text-[8px] font-black uppercase tracking-widest">Divisiones</span>
               </div>
               
               <div 
                ref={categoryScrollRef}
                className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 px-1 snap-x"
               >
                  <button 
                    onClick={() => setSelectedCategoryId('all')}
                    className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap snap-center ${selectedCategoryId === 'all' ? 'bg-slate-950 text-white shadow-lg' : 'bg-transparent border border-slate-200 dark:border-white/10 text-slate-400 hover:border-primary-600/30'}`}
                  >
                    General
                  </button>
                  {allCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap snap-center border ${selectedCategoryId === cat.id ? 'bg-primary-600 text-white border-primary-600 shadow-lg' : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-400 hover:border-primary-600/30 hover:text-primary-600'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
               </div>
             </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL CON MARGEN DE SEGURIDAD AUMENTADO PARA EVITAR SOLAPAMIENTO */}
      <div className="max-w-7xl mx-auto pt-8 px-6 md:px-12">
        {activeSubTab === 'summary' && (
          <div className="space-y-8 animate-fade-in">
             {/* INDICADORES - AHORA CON MÁS AIRE SUPERIOR */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="bg-white dark:bg-[#0f1219] p-8 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-white/5 hover:border-primary-600/20 transition-all group relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-primary-600/5 rounded-bl-full group-hover:bg-primary-600/10 transition-all"></div>
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-4 group-hover:text-primary-600 transition-colors">Eficiencia Promedio</p>
                   <div className="flex items-end gap-3">
                      <span className="text-5xl font-black dark:text-white leading-none">84.2</span>
                      <TrendingUp className="text-emerald-500 mb-1" size={20} />
                   </div>
                </div>
                <div className="bg-white dark:bg-[#0f1219] p-8 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-white/5 hover:border-primary-600/20 transition-all group relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-600/5 rounded-bl-full group-hover:bg-yellow-600/10 transition-all"></div>
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-4 group-hover:text-yellow-600 transition-colors">Partidos Ganados</p>
                   <div className="flex items-end gap-3">
                      <span className="text-5xl font-black dark:text-white leading-none">12</span>
                      <Trophy className="text-yellow-500 mb-1" size={20} />
                   </div>
                </div>
                <div className="bg-white dark:bg-[#0f1219] p-8 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-white/5 hover:border-primary-600/20 transition-all group relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/5 rounded-bl-full group-hover:bg-emerald-600/10 transition-all"></div>
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-4 group-hover:text-emerald-600 transition-colors">Atletas en Lista</p>
                   <div className="flex items-end gap-3">
                      <span className="text-5xl font-black dark:text-white leading-none">{filteredPlayers.length}</span>
                      <Users className="text-primary-600 mb-1" size={20} />
                   </div>
                </div>
             </div>
             
             <div className="bg-white dark:bg-[#0f1219] p-8 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-2xl">
                <Dashboard showFilter={false} currentCategory={allCategories.find(c => c.id === selectedCategoryId)?.name || 'General'} />
             </div>
          </div>
        )}

        {activeSubTab === 'players' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in pt-4">
            {filteredPlayers.map(player => (
              <div 
                key={player.id} 
                onClick={() => setSelectedPlayer(player)}
                className="bg-white dark:bg-[#0f1219] rounded-[2.5rem] p-6 border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full border-4 border-slate-50 dark:border-slate-800 p-1 mb-4 group-hover:scale-110 transition-transform duration-500 shadow-lg relative">
                    <img src={player.photoUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-cover rounded-full" />
                    {player.medical?.isFit && <CheckCircle2 className="absolute bottom-0 right-0 text-emerald-500 bg-white dark:bg-slate-900 rounded-full" size={18} />}
                  </div>
                  <h3 className="font-black uppercase tracking-tighter text-lg text-slate-800 dark:text-white text-center leading-none mb-1">{player.name}</h3>
                  <p className="text-[8px] font-black text-primary-600 uppercase tracking-widest mb-3">{player.position}</p>
                  <div className="w-full h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-600" style={{ width: `${player.overallRating}%` }}></div>
                  </div>
                </div>
                <div className="absolute top-4 right-4 font-black italic text-xl text-slate-100 dark:text-white/5 group-hover:text-primary-600 transition-colors">#{player.number}</div>
              </div>
            ))}
          </div>
        )}

        {activeSubTab === 'attendance' && (
          <div className="bg-white dark:bg-[#0f1219] rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-xl p-4 md:p-8 animate-fade-in pt-4">
             <AttendanceTracker players={filteredPlayers} clubConfig={clubConfig} forceSelectedDisc={discipline.name} />
          </div>
        )}

        {activeSubTab === 'medical' && (
          <div className="bg-white dark:bg-[#0f1219] rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-xl p-4 md:p-8 animate-fade-in pt-4">
             <MedicalDashboard players={filteredPlayers} />
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
