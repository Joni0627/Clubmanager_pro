
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
import { Filter, Search, Grid, List as ListIcon, Plus, Loader2, Users, Trophy, Layers } from 'lucide-react';
import { db } from './lib/supabase.ts';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  const [clubConfig, setClubConfig] = useState<ClubConfig>({
      name: 'PLEGMA CLUB',
      logoUrl: '',
      disciplines: []
  });
  const [players, setPlayers] = useState<Player[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Control de Tabs anidadas
  const [activeDiscipline, setActiveDiscipline] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const loadInitialData = async () => {
    try {
      const { data: configData, error: configError } = await db.clubConfig.get();
      if (!configError && configData) {
        setClubConfig(configData);
        // Set default tabs if available
        if (configData.disciplines?.length > 0) {
          setActiveDiscipline(configData.disciplines[0].name);
          if (configData.disciplines[0].categories?.length > 0) {
            setActiveCategory(configData.disciplines[0].categories[0].name);
          }
        }
      }

      const { data: playersData, error: playersError } = await db.players.getAll();
      if (!playersError && playersData) setPlayers(playersData);
      
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData().then(() => {
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
          discipline: activeDiscipline || 'Fútbol',
          division: 'Masculino',
          category: activeCategory || 'Primera',
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
      const { data, error } = await db.players.getAll();
      if (!error && data) setPlayers(data);
  };

  // Filtrado reactivo basado en las tabs activas
  const filteredPlayers = useMemo(() => {
      return players.filter(p => p.discipline === activeDiscipline && p.category === activeCategory);
  }, [players, activeDiscipline, activeCategory]);

  const renderContent = () => {
    if (isLoading) return (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
            <Loader2 className="animate-spin text-primary-600 mb-4" size={48} />
            <p className="text-slate-500 font-medium animate-pulse uppercase tracking-widest text-xs">Conectando con PlegmaSport...</p>
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
            {/* Header Gestión de Planteles */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
               <div>
                  <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Gestión de Planteles</h2>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Control Centralizado por Disciplina</p>
               </div>
               <button onClick={handleNewPlayer} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all active:scale-95">
                    <Plus size={18} /> Inscribir Jugador
               </button>
            </div>

            {/* TABS NIVEL 1: DISCIPLINAS (MADRE) */}
            <div className="flex gap-4 overflow-x-auto scrollbar-hide mb-6 p-1">
                {clubConfig.disciplines.map((disc) => (
                    <button 
                        key={disc.id}
                        onClick={() => {
                            setActiveDiscipline(disc.name);
                            if (disc.categories.length > 0) setActiveCategory(disc.categories[0].name);
                            else setActiveCategory(null);
                        }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeDiscipline === disc.name ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20' : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-600'}`}
                    >
                        <Trophy size={16} /> {disc.name}
                    </button>
                ))}
                {clubConfig.disciplines.length === 0 && (
                    <div className="text-xs font-bold text-slate-400 uppercase">Sin disciplinas configuradas. Vaya a Datos Maestros.</div>
                )}
            </div>

            {/* TABS NIVEL 2: CATEGORÍAS (HIJA) */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-8">
                {clubConfig.disciplines.find(d => d.name === activeDiscipline)?.categories.map((cat) => (
                    <button 
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.name)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat.name ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 hover:bg-slate-300'}`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* CONTENIDO JUGADORES */}
            <div className="flex-1 overflow-y-auto pr-2 pb-10">
                {filteredPlayers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white dark:bg-slate-900/50 rounded-[3rem] border-4 border-dashed border-slate-200 dark:border-white/5">
                        <Users className="mb-4 opacity-10" size={80} />
                        <p className="font-black uppercase tracking-widest text-xs">No hay jugadores en {activeCategory}</p>
                        <button onClick={handleNewPlayer} className="mt-4 text-primary-500 font-black hover:underline uppercase text-[10px]">Añadir el primero</button>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" : "space-y-3"}>
                        {filteredPlayers.map(player => (
                            <div 
                                key={player.id} 
                                onClick={() => setSelectedPlayer(player)} 
                                className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all group relative"
                            >
                                <div className="h-48 overflow-hidden relative bg-slate-950">
                                    <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                        <span className="text-[10px] font-black text-primary-400">#{player.number}</span>
                                    </div>
                                    <div className="absolute top-4 left-4 z-10 bg-primary-600 px-3 py-1 rounded-full text-[10px] font-black text-white shadow-lg">
                                        {player.overallRating}
                                    </div>
                                    {player.photoUrl ? (
                                        <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-800"><Users size={64}/></div>
                                    )}
                                    <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-slate-950 to-transparent">
                                        <h3 className="font-black text-white uppercase text-lg leading-none truncate">{player.name}</h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{player.position}</p>
                                    </div>
                                </div>
                                <div className="p-6 bg-white dark:bg-slate-900">
                                    <div className="flex gap-2">
                                        <div className={`flex-1 h-1.5 rounded-full ${player.medical?.isFit ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                        <div className={`flex-1 h-1.5 rounded-full ${player.status === 'Active' ? 'bg-primary-500' : 'bg-slate-700'}`}></div>
                                    </div>
                                    <div className="flex justify-between mt-3 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                                        <span>Médico</span>
                                        <span>Estado</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
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
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">&copy; {new Date().getFullYear()} {clubConfig.name} <span className="text-primary-500">PlegmaSport Cloud</span>.</p>
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
