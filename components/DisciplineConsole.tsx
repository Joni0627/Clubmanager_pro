
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
    <div className="animate-fade-in pb-24 -mt-10">
      {/* HEADER ULTRA COMPACTO STICKY */}
      <header className="bg-white/80 dark:bg-[#080a0f]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 sticky top-24 z-[60] transition-all">
        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-6 pb-2">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button 
                onClick={onBack}
                className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-400 hover:text-primary-600 transition-all shrink-0"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center shadow-lg border border-primary-600/30 shrink-0">
                  {discipline.iconUrl ? <img src={discipline.iconUrl} className="w-full h-full object-cover p-1 rounded-full" /> : <Activity size={16} className="text-primary-600" />}
                </div>
                <div className="truncate">
                  <h2 className="text-2xl font-black uppercase tracking-tighter dark:text-white leading-none italic truncate">{discipline.name}</h2>
                  <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Console v2.5</p>
                </div>
              </div>
            </div>

            <div className="flex gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/5 w-full md:w-auto overflow-x-auto no-scrollbar">
              {subTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-black text-[8px] uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === tab.id ? 'bg-white dark:bg-slate-800 text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <tab.icon size={12} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CARRUSEL DE CATEGORÍAS - RELLENA EL ESPACIO EN BLANCO */}
          <div className="mt-4 flex items-center gap-2 border-t border-slate-100 dark:border-white/5 pt-3 overflow-x-auto no-scrollbar pb-2">
             <div className="flex items-center gap-2 text-slate-400 shrink-0 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-white/5">
               <Filter size={10} className="text-primary-600" />
               <span className="text-[7px] font-black uppercase tracking-widest">Divisiones</span>
             </div>
             
             <div className="flex items-center gap-2 shrink-0 pr-12">
                <button 
                  onClick={() => setSelectedCategoryId('all')}
                  className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${selectedCategoryId === 'all' ? 'bg-slate-950 text-white border-slate-950 shadow-md' : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-400'}`}
                >
                  Toda la Disciplina
                </button>
                {allCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${selectedCategoryId === cat.id ? 'bg-primary-600 text-white border-primary-600 shadow-md' : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-400'}`}
                  >
                    {cat.name}
                  </button>
                ))}
             </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL - pt-20 PARA EVITAR SOLAPAMIENTO */}
      <div className="max-w-7xl mx-auto pt-20 px-6 md:px-12 relative z-10">
        {activeSubTab === 'summary' && (
          <div className="space-y-12 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white dark:bg-[#0f1219] p-10 rounded-[3.5rem] shadow-sm border border-slate-200 dark:border-white/5 hover:border-primary-600/20 transition-all group relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 rounded-bl-full group-hover:bg-primary-600/10 transition-all"></div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Eficiencia Promedio</p>
                   <div className="flex items-end gap-5">
                      <span className="text-7xl font-black dark:text-white leading-none tracking-tighter">84.2</span>
                      <TrendingUp className="text-emerald-500 mb-2" size={28} />
                   </div>
                </div>
                <div className="bg-white dark:bg-[#0f1219] p-10 rounded-[3.5rem] shadow-sm border border-slate-200 dark:border-white/5 hover:border-primary-600/20 transition-all group relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-600/5 rounded-bl-full group-hover:bg-yellow-600/10 transition-all"></div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Partidos Ganados</p>
                   <div className="flex items-end gap-5">
                      <span className="text-7xl font-black dark:text-white leading-none tracking-tighter">12</span>
                      <Trophy className="text-yellow-500 mb-2" size={28} />
                   </div>
                </div>
                <div className="bg-white dark:bg-[#0f1219] p-10 rounded-[3.5rem] shadow-sm border border-slate-200 dark:border-white/5 hover:border-primary-600/20 transition-all group relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 rounded-bl-full group-hover:bg-emerald-600/10 transition-all"></div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Atletas en Lista</p>
                   <div className="flex items-end gap-5">
                      <span className="text-7xl font-black dark:text-white leading-none tracking-tighter">{filteredPlayers.length}</span>
                      <Users className="text-primary-600 mb-2" size={28} />
                   </div>
                </div>
             </div>
             
             <div className="bg-white dark:bg-[#0f1219] p-12 rounded-[4rem] border border-slate-200 dark:border-white/5 shadow-2xl">
                <Dashboard showFilter={false} currentCategory={allCategories.find(c => c.id === selectedCategoryId)?.name || 'General'} />
             </div>
          </div>
        )}

        {activeSubTab === 'players' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in">
            {filteredPlayers.map(player => (
              <div 
                key={player.id} 
                onClick={() => setSelectedPlayer(player)}
                className="bg-white dark:bg-[#0f1219] rounded-[3.5rem] p-8 border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full border-4 border-slate-50 dark:border-slate-800 p-1.5 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl relative">
                    <img src={player.photoUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-cover rounded-full" />
                    {player.medical?.isFit && <CheckCircle2 className="absolute bottom-0 right-0 text-emerald-500 bg-white dark:bg-slate-900 rounded-full" size={22} />}
                  </div>
                  <h3 className="font-black uppercase tracking-tighter text-2xl text-slate-800 dark:text-white text-center leading-none mb-2">{player.name}</h3>
                  <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-4">{player.position}</p>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-600" style={{ width: `${player.overallRating}%` }}></div>
                  </div>
                </div>
                <div className="absolute top-6 right-6 font-black italic text-2xl text-slate-100 dark:text-white/5 group-hover:text-primary-600 transition-colors">#{player.number}</div>
              </div>
            ))}
          </div>
        )}

        {activeSubTab === 'attendance' && (
          <div className="bg-white dark:bg-[#0f1219] rounded-[4rem] border border-slate-200 dark:border-white/5 shadow-2xl p-6 md:p-12 animate-fade-in">
             <AttendanceTracker players={filteredPlayers} clubConfig={clubConfig} forceSelectedDisc={discipline.name} />
          </div>
        )}

        {activeSubTab === 'medical' && (
          <div className="bg-white dark:bg-[#0f1219] rounded-[4rem] border border-slate-200 dark:border-white/5 shadow-2xl p-6 md:p-12 animate-fade-in">
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
