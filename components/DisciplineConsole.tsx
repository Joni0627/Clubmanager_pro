
import React, { useState, useEffect, useMemo } from 'react';
import { Discipline, ClubConfig, Player } from '../types';
import { 
  BarChart3, Users, CalendarCheck2, Stethoscope, ChevronLeft, 
  Activity, Trophy, TrendingUp, Filter, CheckCircle2
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
      {/* HEADER COMPACTO Y STICKY */}
      <header className="bg-white/80 dark:bg-[#080a0f]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 px-6 md:px-12 pt-6 pb-4 sticky top-24 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
            <div className="flex items-center gap-6 w-full md:w-auto">
              <button 
                onClick={onBack}
                className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-400 hover:text-primary-600 transition-all group shrink-0"
              >
                <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              </button>
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-14 h-14 rounded-full bg-slate-950 flex items-center justify-center shadow-xl border-2 border-primary-600/30 overflow-hidden shrink-0 transition-all duration-500 ${isLoaded ? 'scale-100' : 'scale-75'}`}>
                  {discipline.iconUrl ? <img src={discipline.iconUrl} className="w-full h-full object-cover p-1 rounded-full" /> : <Activity size={18} className="text-primary-600" />}
                </div>
                <div className="truncate">
                  <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter dark:text-white leading-none italic truncate">{discipline.name}</h2>
                  <p className="text-[8px] font-black text-primary-600 uppercase tracking-widest mt-1">Console v2.5</p>
                </div>
              </div>
            </div>

            <div className="flex gap-1.5 bg-slate-100 dark:bg-white/5 p-1 rounded-full border border-slate-200 dark:border-white/5 w-full md:w-auto overflow-x-auto no-scrollbar">
              {subTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full font-black text-[8px] uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === tab.id ? 'bg-white dark:bg-slate-800 text-primary-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <tab.icon size={12} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SELECTOR DE CATEGORÍA MÁS DELGADO */}
          <div className="flex items-center gap-3 border-t border-slate-100 dark:border-white/5 pt-4 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 text-slate-400 shrink-0 mr-2">
               <Filter size={12} />
               <span className="text-[8px] font-black uppercase tracking-widest">División:</span>
            </div>
            <button 
              onClick={() => setSelectedCategoryId('all')}
              className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategoryId === 'all' ? 'bg-slate-950 text-white shadow-lg' : 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'}`}
            >
              General
            </button>
            {allCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${selectedCategoryId === cat.id ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-600/20' : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-400 hover:border-primary-600/30 hover:text-primary-600'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
        {/* Degradado inferior para evitar corte brusco */}
        <div className="absolute bottom-[-20px] left-0 right-0 h-[20px] bg-gradient-to-b from-white dark:from-[#080a0f] to-transparent pointer-events-none"></div>
      </header>

      {/* CONTENIDO CON ESPACIADO CORREGIDO */}
      <div className="max-w-7xl mx-auto py-8 px-6">
        {activeSubTab === 'summary' && (
          <div className="space-y-8 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#0f1219] p-8 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-white/5 hover:border-primary-600/20 transition-all group">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3 group-hover:text-primary-600 transition-colors">Eficiencia Promedio</p>
                   <div className="flex items-end gap-3">
                      <span className="text-5xl font-black dark:text-white leading-none">84.2</span>
                      <TrendingUp className="text-emerald-500 mb-1" size={18} />
                   </div>
                </div>
                <div className="bg-white dark:bg-[#0f1219] p-8 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-white/5 hover:border-primary-600/20 transition-all group">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3 group-hover:text-primary-600 transition-colors">Partidos Ganados</p>
                   <div className="flex items-end gap-3">
                      <span className="text-5xl font-black dark:text-white leading-none">12</span>
                      <Trophy className="text-yellow-500 mb-1" size={18} />
                   </div>
                </div>
                <div className="bg-white dark:bg-[#0f1219] p-8 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-white/5 hover:border-primary-600/20 transition-all group">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3 group-hover:text-primary-600 transition-colors">Atletas en Lista</p>
                   <div className="flex items-end gap-3">
                      <span className="text-5xl font-black dark:text-white leading-none">{filteredPlayers.length}</span>
                      <Users className="text-primary-600 mb-1" size={18} />
                   </div>
                </div>
             </div>
             <Dashboard showFilter={false} currentCategory={allCategories.find(c => c.id === selectedCategoryId)?.name || 'General'} />
          </div>
        )}

        {activeSubTab === 'players' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
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
          <div className="bg-white dark:bg-[#0f1219] rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-xl p-4 md:p-10 animate-fade-in">
             <AttendanceTracker players={filteredPlayers} clubConfig={clubConfig} forceSelectedDisc={discipline.name} />
          </div>
        )}

        {activeSubTab === 'medical' && (
          <div className="bg-white dark:bg-[#0f1219] rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-xl p-4 md:p-10 animate-fade-in">
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
