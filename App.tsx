
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [activeDiscipline, setActiveDiscipline] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Carga inicial ultra-segura
  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const { data: configData, error: configError } = await db.clubConfig.get();
      
      let currentConfig = configData;
      if (configError || !configData) {
        currentConfig = {
          name: 'PLEGMA CLUB',
          logoUrl: '',
          disciplines: [{
            id: 'default-disc',
            name: 'Fútbol',
            categories: [{ 
              id: 'default-cat', 
              name: 'Primera', 
              metrics: [
                { id: 'm1', name: 'Ritmo', weight: 1 },
                { id: 'm2', name: 'Tiro', weight: 1 }
              ] 
            }]
          }]
        };
        setClubConfig(currentConfig);
        try { await db.clubConfig.update(currentConfig); } catch (e) { console.warn("Supabase Offline"); }
      } else {
        setClubConfig(currentConfig);
      }

      const { data: playersData } = await db.players.getAll();
      if (playersData) setPlayers(playersData);
      
    } catch (error) {
      console.error("Error crítico de carga:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto de Sincronización de Pestañas Optimizado
  useEffect(() => {
    if (clubConfig.disciplines.length > 0) {
      const currentDisc = clubConfig.disciplines.find(d => d.name === activeDiscipline) || clubConfig.disciplines[0];
      
      if (activeDiscipline !== currentDisc.name) {
        setActiveDiscipline(currentDisc.name);
      }

      if (currentDisc.categories.length > 0) {
        const currentCat = currentDisc.categories.find(c => c.name === activeCategory) || currentDisc.categories[0];
        if (activeCategory !== currentCat.name) {
          setActiveCategory(currentCat.name);
        }
      } else if (activeCategory !== null) {
        setActiveCategory(null);
      }
    }
  }, [clubConfig.disciplines, activeDiscipline, activeCategory]);

  useEffect(() => {
    loadInitialData().finally(() => {
        // Garantizamos que el splash screen desaparezca aunque falle la red
        setTimeout(() => setShowSplash(false), 800);
    });

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
      catch (e) { console.error("Error persistiendo config:", e); }
  };

  const handleNewPlayer = () => {
      if (!activeDiscipline || !activeCategory) {
          alert("Debes configurar al menos una Disciplina y Categoría.");
          setCurrentView('master-data');
          return;
      }

      const newPlayer: Player = {
          id: `new-${Date.now()}`,
          name: '',
          number: 0,
          position: Position.PLAYER,
          age: 0,
          nationality: '',
          photoUrl: '',
          stats: {}, 
          overallRating: 0,
          status: 'Active',
          discipline: activeDiscipline,
          division: 'Masculino',
          category: activeCategory,
          marketValue: '-',
          dni: '',
          email: '',
          phone: '',
          address: '',
          tutor: { name: '', email: '', phone: '' },
          medical: { isFit: true, lastCheckup: '', expiryDate: '', notes: '' }
      };
      setSelectedPlayer(newPlayer);
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
            <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] animate-pulse">Sincronizando Sistema Plegma...</p>
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
          <div className="p-6 h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
               <div>
                  <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Gestión de Planteles</h2>
                  <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{activeDiscipline || 'Cargando...'} • {activeCategory || 'Sin Cat'}</p>
                  </div>
               </div>
               <button 
                onClick={handleNewPlayer} 
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all active:scale-95 disabled:opacity-50"
                disabled={!activeDiscipline || !activeCategory}
               >
                    <Plus size={18} /> Inscribir Jugador
               </button>
            </div>

            {clubConfig.disciplines.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-slate-100 dark:border-white/5 p-12 text-center shadow-inner">
                    <Database size={64} className="text-primary-500/20 mb-6" />
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-2">Estructura Vacía</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8 font-medium text-sm">Debes configurar disciplinas para gestionar los planteles.</p>
                    <button 
                        onClick={() => setCurrentView('master-data')}
                        className="flex items-center gap-3 bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-2xl"
                    >
                        Configurar Ahora <ArrowRight size={16} />
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex gap-4 overflow-x-auto scrollbar-hide mb-6 p-1">
                        {clubConfig.disciplines.map((disc) => (
                            <button 
                                key={disc.id}
                                onClick={() => {
                                    setActiveDiscipline(disc.name);
                                    if (disc.categories.length > 0) setActiveCategory(disc.categories[0].name);
                                    else setActiveCategory(null);
                                }}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeDiscipline === disc.name ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/30 scale-105' : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-600 border border-slate-100 dark:border-white/5'}`}
                            >
                                <Trophy size={16} /> {disc.name}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-8">
                        {clubConfig.disciplines.find(d => d.name === activeDiscipline)?.categories.map((cat) => (
                            <button 
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.name)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat.name ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 hover:bg-slate-300'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 pb-10">
                        {filteredPlayers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-28 text-slate-400 bg-white dark:bg-slate-900/50 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-white/5">
                                <Users className="mb-4 opacity-10" size={100} />
                                <p className="font-black uppercase tracking-widest text-xs mb-6">No hay registros para {activeCategory || 'esta división'}</p>
                                <button onClick={handleNewPlayer} className="px-10 py-3 bg-primary-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-primary-500/20 hover:scale-105 transition-all">
                                    Inscribir Primer Jugador
                                </button>
                            </div>
                        ) : (
                            <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10" : "space-y-4"}>
                                {filteredPlayers.map(player => (
                                    <div 
                                        key={player.id} 
                                        onClick={() => setSelectedPlayer(player)} 
                                        className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all group relative"
                                    >
                                        <div className="h-56 overflow-hidden relative bg-slate-950">
                                            <div className="absolute top-6 right-6 z-10 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                                                <span className="text-[11px] font-black text-primary-400">#{player.number}</span>
                                            </div>
                                            <div className="absolute top-6 left-6 z-10 bg-primary-600 px-4 py-1.5 rounded-full text-[11px] font-black text-white shadow-xl">
                                                {player.overallRating}
                                            </div>
                                            {player.photoUrl ? (
                                                <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-90" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-800 bg-slate-900"><Users size={70} className="opacity-10" /></div>
                                            )}
                                            <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent">
                                                <h3 className="font-black text-white uppercase text-xl leading-none truncate mb-1.5">{player.name || 'SIN NOMBRE'}</h3>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] text-primary-500 font-black uppercase tracking-widest">{player.position}</span>
                                                    <span className="w-1.5 h-1.5 bg-slate-600 rounded-full"></span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{player.division}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-6 bg-white dark:bg-slate-900">
                                            <div className="flex gap-2 mb-4">
                                                <div className={`flex-1 h-1.5 rounded-full ${player.medical?.isFit ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                                <div className={`flex-1 h-1.5 rounded-full ${player.status === 'Active' ? 'bg-primary-500 shadow-[0_0_10px_rgba(236,72,153,0.3)]' : 'bg-slate-700'}`}></div>
                                            </div>
                                            <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                <span>Apto Físico</span>
                                                <span>Estatus</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} isDarkMode={isDarkMode} toggleTheme={toggleTheme} clubConfig={clubConfig} />
      <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="flex-1 overflow-hidden">{renderContent()}</div>
        <div className="py-6 text-center border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.5em]">&copy; {new Date().getFullYear()} {clubConfig.name || 'PLEGMA CLUB'} <span className="text-primary-500">•</span> PlegmaSport Cloud</p>
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
