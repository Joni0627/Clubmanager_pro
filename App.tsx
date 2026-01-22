
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import PlayerCard from './components/PlayerCard.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import MasterData from './components/MasterData.tsx';
import AttendanceTracker from './components/AttendanceTracker.tsx';
import MedicalDashboard from './components/MedicalDashboard.tsx';
import FeesManagement from './components/FeesManagement.tsx';
import SplashScreen from './components/SplashScreen.tsx';
import { Player, Position, ClubConfig } from './types.ts';
import { Filter, Search, Grid, List as ListIcon, Plus, Loader2, Users, Trophy, Layers, Settings, ArrowRight, Database } from 'lucide-react';
import { db } from './lib/supabase.ts';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  const [clubConfig, setClubConfig] = useState<ClubConfig>({
      name: 'PLEGMA SPORT CLUB',
      logoUrl: '',
      disciplines: []
  });
  const [players, setPlayers] = useState<Player[]>([]);
  const [activeDiscipline, setActiveDiscipline] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const { data: configData, error: configError } = await db.clubConfig.get();
      
      if (!configError && configData) {
        setClubConfig(configData);
      } else {
        const defaultConfig: ClubConfig = {
          name: 'PLEGMA CLUB',
          logoUrl: '',
          disciplines: [{
            id: 'default-disc',
            name: 'Fútbol',
            categories: [{ 
              id: 'default-cat', 
              name: 'Primera', 
              metrics: [{ id: 'm1', name: 'Ritmo', weight: 1 }] 
            }]
          }]
        };
        setClubConfig(defaultConfig);
        try { await db.clubConfig.update(defaultConfig); } catch (e) {}
      }

      const { data: playersData } = await db.players.getAll();
      if (playersData) setPlayers(playersData);
      
    } catch (error) {
      console.error("Initialization error:", error);
    } finally {
      setIsLoading(false);
      // Forzar que el splash se quite incluso si hay errores
      setTimeout(() => setShowSplash(false), 500);
    }
  };

  useEffect(() => {
    if (clubConfig.disciplines.length > 0) {
      const currentDisc = clubConfig.disciplines.find(d => d.name === activeDiscipline) || clubConfig.disciplines[0];
      if (activeDiscipline !== currentDisc.name) setActiveDiscipline(currentDisc.name);

      if (currentDisc.categories.length > 0) {
        const currentCat = currentDisc.categories.find(c => c.name === activeCategory) || currentDisc.categories[0];
        if (activeCategory !== currentCat.name) setActiveCategory(currentCat.name);
      } else if (activeCategory !== null) {
        setActiveCategory(null);
      }
    }
  }, [clubConfig, activeDiscipline, activeCategory]);

  useEffect(() => {
    loadInitialData();
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
       setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    const html = document.querySelector('html');
    if (isDarkMode) html?.classList.add('dark');
    else html?.classList.remove('dark');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const updateClubConfig = async (newConfig: ClubConfig) => {
      setClubConfig(newConfig);
      try { await db.clubConfig.update(newConfig); } 
      catch (e) { console.error(e); }
  };

  const refreshPlayers = async () => {
      const { data } = await db.players.getAll();
      if (data) setPlayers(data);
  };

  const filteredPlayers = useMemo(() => {
      if (!activeDiscipline || !activeCategory) return [];
      return players.filter(p => p.discipline === activeDiscipline && p.category === activeCategory);
  }, [players, activeDiscipline, activeCategory]);

  const renderContent = () => {
    if (isLoading) return (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
            <Loader2 className="animate-spin text-primary-600 mb-4" size={48} />
            <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Cargando Sistema...</p>
        </div>
    );

    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'medical': return <MedicalDashboard players={players} />;
      case 'fees': return <FeesManagement />;
      case 'master-data': return <MasterData clubConfig={clubConfig} setClubConfig={updateClubConfig} />;
      case 'attendance': return <AttendanceTracker players={players} />;
      case 'players':
        return (
          <div className="p-10 h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <div className="flex justify-between items-center mb-10">
               <div>
                  <h2 className="text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Planteles</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{activeDiscipline} • {activeCategory}</p>
               </div>
               <button onClick={() => {}} className="flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all hover:scale-105">
                    <Plus size={18} /> Nuevo Jugador
               </button>
            </div>

            {clubConfig.disciplines.length > 0 && (
                <>
                    <div className="flex gap-4 overflow-x-auto scrollbar-hide mb-8">
                        {clubConfig.disciplines.map((disc) => (
                            <button key={disc.id} onClick={() => setActiveDiscipline(disc.name)} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeDiscipline === disc.name ? 'bg-primary-600 text-white shadow-xl' : 'bg-white dark:bg-slate-900 text-slate-400'}`}>
                                {disc.name}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 overflow-y-auto pr-2 pb-20">
                        {filteredPlayers.map(player => (
                            <div key={player.id} onClick={() => setSelectedPlayer(player)} className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden cursor-pointer hover:shadow-2xl transition-all group">
                                <div className="h-64 bg-slate-950 relative overflow-hidden">
                                    {player.photoUrl ? <img src={player.photoUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <div className="w-full h-full flex items-center justify-center opacity-10"><Users size={64} /></div>}
                                    <div className="absolute top-6 left-6 bg-primary-600 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-xl">{player.overallRating}</div>
                                    <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-slate-950 to-transparent">
                                        <h3 className="text-xl font-black text-white uppercase truncate">{player.name}</h3>
                                        <p className="text-[10px] text-primary-500 font-black uppercase tracking-widest">{player.position}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
          </div>
        );
      default: return <Dashboard />;
    }
  };

  if (showSplash) return <SplashScreen />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} isDarkMode={isDarkMode} toggleTheme={toggleTheme} clubConfig={clubConfig} />
      <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="flex-1 overflow-hidden">{renderContent()}</div>
        <div className="py-6 text-center border-t border-slate-100 dark:border-white/5 bg-white dark:bg-slate-950">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.5em]">&copy; {new Date().getFullYear()} {clubConfig.name || 'PLEGMA CLUB'} • PlegmaSport Cloud</p>
        </div>
      </main>
      {selectedPlayer && (
        <PlayerCard 
          player={selectedPlayer} 
          onClose={() => setSelectedPlayer(null)} 
          onSaveSuccess={refreshPlayers}
          clubConfig={clubConfig}
        />
      )}
    </div>
  );
}

export default App;
