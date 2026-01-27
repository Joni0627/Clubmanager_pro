
import React, { useState, useEffect, useMemo } from 'react';
import { Discipline, ClubConfig, Member, Player } from '../types';
import { 
  BarChart3, Users, CalendarCheck2, Stethoscope, ChevronLeft, 
  Activity, Trophy, TrendingUp, Filter, Loader2
} from 'lucide-react';
import Dashboard from './Dashboard';
import AttendanceTracker from './AttendanceTracker';
import MedicalDashboard from './MedicalDashboard';
import PlayerCard from './PlayerCard';
import { db } from '../lib/supabase';

interface DisciplineConsoleProps {
  discipline: Discipline;
  clubConfig: ClubConfig;
  onBack: () => void;
}

const DisciplineConsole: React.FC<DisciplineConsoleProps> = ({ discipline, clubConfig, onBack }) => {
  const [activeSubTab, setActiveSubTab] = useState<'summary' | 'players' | 'attendance' | 'medical'>('summary');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlayers = async () => {
    setIsLoading(true);
    try {
      const { data } = await db.players.getAll();
      if (data) {
        // Filtrar solo los que pertenecen a esta disciplina
        const disciplinePlayers = data.filter((p: Player) => 
          p.discipline.toLowerCase() === discipline.name.toLowerCase()
        );
        setPlayers(disciplinePlayers);
      }
    } catch (error) {
      console.error("Error fetching players:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, [discipline.id]);

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

  const filteredAthletes = useMemo(() => {
    let base = players;
    if (selectedCategoryId !== 'all') {
      const catName = allCategories.find(c => c.id === selectedCategoryId)?.name;
      if (catName) {
        base = base.filter(p => p.category.toLowerCase() === catName.toLowerCase());
      }
    }
    return base;
  }, [players, selectedCategoryId, allCategories]);

  const subTabs = [
    { id: 'summary', label: 'Resumen', icon: BarChart3 },
    { id: 'players', label: 'Plantel', icon: Users },
    { id: 'attendance', label: 'Asistencia', icon: CalendarCheck2 },
    { id: 'medical', label: 'Médico', icon: Stethoscope },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] mt-24 animate-fade-in overflow-hidden bg-slate-50 dark:bg-[#080a0f] border-t border-slate-200 dark:border-white/5">
      <header className="flex-none bg-white dark:bg-[#080a0f] border-b border-slate-200 dark:border-white/10 z-[140] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-6 pb-2">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-4">
            <div className="flex items-center gap-5 w-full md:w-auto">
              <button 
                onClick={onBack}
                className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-400 hover:text-primary-600 hover:bg-white transition-all shrink-0 shadow-sm border border-slate-200"
              >
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>
              <div className="flex items-center gap-5 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center shadow-2xl border-2 border-primary-600/40 overflow-hidden shrink-0">
                  {discipline.iconUrl ? (
                    <img src={discipline.iconUrl} className="w-full h-full object-cover p-1.5 rounded-2xl" />
                  ) : (
                    <Activity size={24} className="text-primary-600" />
                  )}
                </div>
                <div className="truncate">
                  <h2 className="text-4xl font-black uppercase tracking-tighter dark:text-white leading-none italic truncate">{discipline.name}</h2>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1.5">Consola de Control • Activa</p>
                </div>
              </div>
            </div>

            <div className="flex gap-1.5 bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl border border-slate-200 w-full md:w-auto overflow-x-auto no-scrollbar shadow-inner">
              {subTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === tab.id ? 'bg-white dark:bg-slate-800 text-primary-600 shadow-md transform scale-105' : 'text-slate-400'}`}
                >
                  <tab.icon size={14} strokeWidth={activeSubTab === tab.id ? 3 : 2} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 border-t border-slate-100 dark:border-white/5 pt-4 pb-4">
             <div className="flex items-center gap-2.5 text-slate-400 shrink-0 bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-100">
               <Filter size={14} className="text-primary-600" />
               <span className="text-[9px] font-black uppercase tracking-widest">Divisiones</span>
             </div>
             
             <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 flex-1">
                <button 
                  onClick={() => setSelectedCategoryId('all')}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${selectedCategoryId === 'all' ? 'bg-slate-950 text-white border-slate-950 shadow-xl' : 'bg-transparent border-slate-100 text-slate-400'}`}
                >
                  Toda la Disciplina
                </button>
                {allCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${selectedCategoryId === cat.id ? 'bg-primary-600 text-white border-primary-600 shadow-xl' : 'bg-transparent border-slate-100 text-slate-400'}`}
                  >
                    {cat.name}
                  </button>
                ))}
             </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar bg-slate-50 dark:bg-[#080a0f]">
        <div className="max-w-7xl mx-auto py-12 px-6 md:px-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40">
              <Loader2 className="animate-spin text-primary-600 mb-4" size={48} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando Atletas...</p>
            </div>
          ) : (
            <>
              {activeSubTab === 'summary' && (
                <div className="space-y-12 animate-fade-in pb-20">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="bg-white dark:bg-[#0f1219] p-10 rounded-[3.5rem] shadow-sm border border-slate-200 hover:shadow-2xl transition-all group relative overflow-hidden">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 group-hover:text-primary-600 transition-colors">Eficiencia Promedio</p>
                         <div className="flex items-end gap-5">
                            <span className="text-7xl font-black dark:text-white leading-none tracking-tighter">84.2</span>
                            <TrendingUp className="text-emerald-500 mb-2" size={28} />
                         </div>
                      </div>
                      <div className="bg-white dark:bg-[#0f1219] p-10 rounded-[3.5rem] shadow-sm border border-slate-200 hover:shadow-2xl transition-all group relative overflow-hidden">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 group-hover:text-yellow-600 transition-colors">Partidos Ganados</p>
                         <div className="flex items-end gap-5">
                            <span className="text-7xl font-black dark:text-white leading-none tracking-tighter">12</span>
                            <Trophy className="text-yellow-500 mb-2" size={28} />
                         </div>
                      </div>
                      <div className="bg-white dark:bg-[#0f1219] p-10 rounded-[3.5rem] shadow-sm border border-slate-200 hover:shadow-2xl transition-all group relative overflow-hidden">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 group-hover:text-emerald-600 transition-colors">Atletas en Lista</p>
                         <div className="flex items-end gap-5">
                            <span className="text-7xl font-black dark:text-white leading-none tracking-tighter">{players.length}</span>
                            <Users className="text-primary-600 mb-2" size={28} />
                         </div>
                      </div>
                   </div>
                   
                   <div className="bg-white dark:bg-[#0f1219] p-12 rounded-[4rem] border border-slate-200 shadow-2xl overflow-hidden">
                      <Dashboard showFilter={false} currentCategory={allCategories.find(c => c.id === selectedCategoryId)?.name || 'General'} />
                   </div>
                </div>
              )}

              {activeSubTab === 'players' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in pb-20">
                  {filteredAthletes.map(athlete => (
                    <div 
                      key={athlete.id} 
                      onClick={() => setSelectedPlayer(athlete)}
                      className="bg-white dark:bg-[#0f1219] rounded-[4rem] p-10 border border-slate-200 shadow-sm hover:shadow-3xl transition-all cursor-pointer group relative overflow-hidden"
                    >
                      <div className="flex flex-col items-center relative z-10">
                        <div className="w-28 h-28 rounded-full border-4 border-slate-50 dark:border-slate-800 p-1.5 mb-6 group-hover:scale-110 transition-transform duration-700 shadow-xl relative">
                          <img src={athlete.photoUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-cover rounded-full" />
                          <div className="absolute -bottom-1 -right-1 bg-primary-600 text-white w-9 h-9 rounded-full flex items-center justify-center font-black italic text-xs shadow-lg">
                            {athlete.overallRating || 0}
                          </div>
                        </div>
                        <h3 className="font-black uppercase tracking-tighter text-2xl text-slate-800 dark:text-white text-center leading-none mb-3">{athlete.name}</h3>
                        <div className="flex items-center gap-3 mb-6">
                          <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest bg-primary-500/10 px-4 py-1.5 rounded-full">ATLETA</span>
                          <span className="text-slate-300 font-black italic">#{athlete.number}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                          <div className="h-full bg-primary-600 rounded-full" style={{ width: `${athlete.overallRating || 0}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeSubTab === 'attendance' && (
                <div className="bg-white dark:bg-[#0f1219] rounded-[4rem] border border-slate-200 shadow-2xl p-6 md:p-12 animate-fade-in pb-20 overflow-hidden">
                   <AttendanceTracker players={filteredAthletes} clubConfig={clubConfig} forceSelectedDisc={discipline.name} />
                </div>
              )}

              {activeSubTab === 'medical' && (
                <div className="bg-white dark:bg-[#0f1219] rounded-[4rem] border border-slate-200 shadow-2xl p-6 md:p-12 animate-fade-in pb-20 overflow-hidden">
                   <MedicalDashboard players={filteredAthletes} onRefresh={fetchPlayers} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedPlayer && (
        <PlayerCard 
          player={selectedPlayer} 
          onClose={() => setSelectedPlayer(null)} 
          onSaveSuccess={fetchPlayers}
          clubConfig={clubConfig}
        />
      )}
    </div>
  );
};

export default DisciplineConsole;
