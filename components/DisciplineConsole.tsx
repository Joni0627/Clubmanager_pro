
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

  // Obtener todas las categorías únicas disponibles para esta disciplina a través de sus ramas
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

  // Filtrado de jugadores por Disciplina Y Categoría Seleccionada
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
      {/* HEADER DE LA CONSOLA */}
      <header className="bg-white dark:bg-[#0f1219] border-b border-slate-200 dark:border-white/5 px-6 md:px-12 pt-10 pb-8 sticky top-24 z-50 backdrop-blur-xl bg-white/90 dark:bg-[#0f1219]/90">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
            <div className="flex items-center gap-6">
              <button 
                onClick={onBack}
                className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-400 hover:text-primary-600 transition-all group"
              >
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              </button>
              <div className="flex items-center gap-6">
                <div className={`w-20 h-20 rounded-full bg-slate-950 flex items-center justify-center shadow-2xl border-4 border-primary-600/30 overflow-hidden shrink-0 transition-all duration-700 ${isLoaded ? 'scale-100' : 'scale-150'}`}>
                  {discipline.iconUrl ? <img src={discipline.iconUrl} className="w-full h-full object-cover p-1 rounded-full" /> : <Activity size={24} className="text-primary-600" />}
                </div>
                <div>
                  <h2 className="text-4xl font-black uppercase tracking-tighter dark:text-white leading-none italic">{discipline.name}</h2>
                  <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mt-2">Consola de Alto Rendimiento</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 bg-slate-100 dark:bg-white/5 p-1.5 rounded-full border border-slate-200 dark:border-white/5">
              {subTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`flex items-center gap-3 px-5 py-3 rounded-full font-black text-[9px] uppercase tracking-widest transition-all ${activeSubTab === tab.id ? 'bg-white dark:bg-slate-800 text-primary-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <tab.icon size={14} />
                  <span className="hidden lg:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SELECTOR DE CATEGORÍA GLOBAL */}
          <div className="flex items-center gap-4 border-t border-slate-100 dark:border-white/5 pt-8 overflow-x-auto no-scrollbar pb-2">
            <div className="flex items-center gap-2 text-slate-400 shrink-0 mr-4">
               <Filter size={14} />
               <span className="text-[9px] font-black uppercase tracking-[0.2em]">Filtrar División:</span>
            </div>
            <button 
              onClick={() => setSelectedCategoryId('all')}
              className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategoryId === 'all' ? 'bg-slate-950 text-white shadow-xl' : 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'}`}
            >
              Toda la Disciplina
            </button>
            {allCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${selectedCategoryId === cat.id ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-600/20' : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-400 hover:border-primary-600/30 hover:text-primary-600'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* CONTENIDO SEGÚN SUBTAB CON DATOS FILTRADOS */}
      <div className="max-w-7xl mx-auto py-12 px-6">
        {activeSubTab === 'summary' && (
          <div className="space-y-12 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white dark:bg-[#0f1219] p-10 rounded-[3rem] shadow-sm border border-slate-200 dark:border-white/5 hover:border-primary-600/20 transition-all group">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 group-hover:text-primary-600 transition-colors">Eficiencia Promedio</p>
                   <div className="flex items-end gap-4">
                      <span className="text-6xl font-black dark:text-white leading-none">84.2</span>
                      <TrendingUp className="text-emerald-500 mb-2" size={24} />
                   </div>
                </div>
                <div className="bg-white dark:bg-[#0f1219] p-10 rounded-[3rem] shadow-sm border border-slate-200 dark:border-white/5 hover:border-primary-600/20 transition-all group">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 group-hover:text-primary-600 transition-colors">Partidos Ganados</p>
                   <div className="flex items-end gap-4">
                      <span className="text-6xl font-black dark:text-white leading-none">12</span>
                      <Trophy className="text-yellow-500 mb-2" size={24} />
                   </div>
                </div>
                <div className="bg-white dark:bg-[#0f1219] p-10 rounded-[3rem] shadow-sm border border-slate-200 dark:border-white/5 hover:border-primary-600/20 transition-all group">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 group-hover:text-primary-600 transition-colors">Atletas en Lista</p>
                   <div className="flex items-end gap-4">
                      <span className="text-6xl font-black dark:text-white leading-none">{filteredPlayers.length}</span>
                      <Users className="text-primary-600 mb-2" size={24} />
                   </div>
                </div>
             </div>
             {/* Dashboard ya no necesita filtro interno, recibe el contexto */}
             <Dashboard showFilter={false} currentCategory={allCategories.find(c => c.id === selectedCategoryId)?.name || 'General'} />
          </div>
        )}

        {activeSubTab === 'players' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in">
            {filteredPlayers.map(player => (
              <div 
                key={player.id} 
                onClick={() => setSelectedPlayer(player)}
                className="bg-white dark:bg-[#0f1219] rounded-[3rem] p-8 border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full border-4 border-slate-50 dark:border-slate-800 p-1 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl relative">
                    <img src={player.photoUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-cover rounded-full" />
                    {player.medical?.isFit && <CheckCircle2 className="absolute bottom-0 right-0 text-emerald-500 bg-white dark:bg-slate-900 rounded-full" size={24} />}
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
            {filteredPlayers.length === 0 && (
              <div className="col-span-full py-32 text-center opacity-30 border-4 border-dashed border-slate-200 dark:border-white/5 rounded-[4rem]">
                 <Users size={64} className="mx-auto mb-6" />
                 <p className="font-black uppercase tracking-widest text-xs">Sin atletas registrados en esta división</p>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'attendance' && (
          <div className="bg-white dark:bg-[#0f1219] rounded-[4rem] border border-slate-200 dark:border-white/5 shadow-2xl p-4 md:p-12 animate-fade-in">
             {/* Pasamos los jugadores ya filtrados por categoría */}
             <AttendanceTracker players={filteredPlayers} clubConfig={clubConfig} forceSelectedDisc={discipline.name} />
          </div>
        )}

        {activeSubTab === 'medical' && (
          <div className="bg-white dark:bg-[#0f1219] rounded-[4rem] border border-slate-200 dark:border-white/5 shadow-2xl p-4 md:p-12 animate-fade-in">
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
