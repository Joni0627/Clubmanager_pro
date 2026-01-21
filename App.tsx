
import React, { useState, useEffect } from 'react';
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
import { Filter, Search, Grid, List as ListIcon, Plus, Loader2, Users } from 'lucide-react';
import { db } from './lib/supabase.ts';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  const [clubConfig, setClubConfig] = useState<ClubConfig>({
      name: 'PLEGMA FC',
      logoUrl: '' 
  });
  const [players, setPlayers] = useState<Player[]>([]);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterDiscipline, setFilterDiscipline] = useState('Todas');
  const [filterCategory, setFilterCategory] = useState('Todas');

  const loadInitialData = async () => {
    try {
      const { data: configData, error: configError } = await db.clubConfig.get();
      if (!configError && configData) setClubConfig(configData);

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
          stats: { pace: 50, shooting: 50, passing: 50, dribbling: 50, defending: 50, physical: 50 },
          status: 'Active',
          discipline: 'Fútbol',
          division: 'Masculino',
          category: 'Primera',
          marketValue: '-',
          medical: { isFit: true, lastCheckup: '', expiryDate: '', notes: '' }
      };
      setSelectedPlayer(newPlayer);
  };

  const refreshPlayers = async () => {
      const { data, error } = await db.players.getAll();
      if (!error && data) setPlayers(data);
  };

  const getGroupedPlayers = () => {
    if (!players || players.length === 0) return {};
    const filtered = players.filter(player => {
        const matchesDiscipline = filterDiscipline === 'Todas' || player.discipline === filterDiscipline;
        const matchesCategory = filterCategory === 'Todas' || player.category === filterCategory;
        return matchesDiscipline && matchesCategory;
    });
    const grouped: Record<string, Record<string, Player[]>> = {};
    filtered.forEach(player => {
        if (!grouped[player.discipline]) grouped[player.discipline] = {};
        if (!grouped[player.discipline][player.category]) grouped[player.discipline][player.category] = [];
        grouped[player.discipline][player.category].push(player);
    });
    return grouped;
  };

  const renderContent = () => {
    if (isLoading) return (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
            <Loader2 className="animate-spin text-primary-600 mb-4" size={48} />
            <p className="text-slate-500 font-medium animate-pulse">Sincronizando con PlegmaSport...</p>
        </div>
    );

    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'medical': return <MedicalDashboard players={players} />;
      case 'fees': return <FeesManagement />;
      case 'players':
        const groupedPlayers = getGroupedPlayers();
        return (
          <div className="p-6 h-full flex flex-col">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
               <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Gestión de Planteles</h2>
                  <p className="text-slate-500 dark:text-slate-400">Datos en la nube de Supabase</p>
               </div>
               
               <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
                   <select value={filterDiscipline} onChange={(e) => setFilterDiscipline(e.target.value)} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none dark:text-white">
                       <option value="Todas">Todas Disciplinas</option>
                       <option value="Fútbol">Fútbol</option>
                       <option value="Básquet">Básquet</option>
                   </select>
                   <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none dark:text-white">
                       <option value="Todas">Todas Categorías</option>
                       <option value="Primera">Primera</option>
                       <option value="Reserva">Reserva</option>
                   </select>
                   <button onClick={handleNewPlayer} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-colors">
                        <Plus size={18} /> Nuevo Jugador
                   </button>
                  <div className="flex bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
                      <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-400'}`}><Grid size={18} /></button>
                      <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-400'}`}><ListIcon size={18} /></button>
                  </div>
               </div>
            </div>

            <div className="overflow-y-auto space-y-8 pb-10">
                {Object.keys(groupedPlayers).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <Users className="mb-4 opacity-20" size={64} />
                        <p className="font-medium">No se encontraron registros.</p>
                        <button onClick={handleNewPlayer} className="mt-4 text-primary-600 font-bold hover:underline">Crear el primer jugador</button>
                    </div>
                ) : (
                    Object.entries(groupedPlayers).map(([discipline, categories]) => (
                        <div key={discipline} className="animate-fade-in">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 border-b pb-2 border-slate-200 dark:border-slate-700 uppercase tracking-wide">{discipline}</h3>
                            {Object.entries(categories).map(([category, catPlayers]) => (
                                <div key={category} className="mb-6">
                                    <h4 className="text-sm font-bold text-primary-600 dark:text-primary-400 mb-3 ml-2 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                                        {category} ({catPlayers.length})
                                    </h4>
                                    <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : ""}>
                                        {catPlayers.map(player => (
                                            viewMode === 'grid' ? (
                                                <div key={player.id} onClick={() => setSelectedPlayer(player)} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer hover:shadow-lg transition-all group">
                                                    <div className="h-40 overflow-hidden relative bg-slate-100 dark:bg-slate-900">
                                                        {player.photoUrl ? (
                                                            <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-300"><Users size={48}/></div>
                                                        )}
                                                        <div className="absolute bottom-2 left-2"><span className="bg-white/90 dark:bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-bold text-slate-800 dark:text-white">{player.position}</span></div>
                                                    </div>
                                                    <div className="p-4">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h3 className="font-bold text-slate-800 dark:text-white truncate">{player.name || 'Sin nombre'}</h3>
                                                            <span className="text-slate-400 font-mono">#{player.number}</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex mt-2">
                                                            <div className={`h-full ${player.medical?.isFit ? 'bg-emerald-500' : 'bg-red-500'} w-1/2`}></div>
                                                            <div className={`h-full ${player.status === 'Active' ? 'bg-primary-500' : 'bg-slate-400'} w-1/2`}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div key={player.id} onClick={() => setSelectedPlayer(player)} className="p-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                                                    <div className="flex items-center gap-3">
                                                        {player.photoUrl ? <img src={player.photoUrl} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center"><Users size={16}/></div>}
                                                        <div>
                                                            <p className="font-bold dark:text-white">{player.name || 'Sin nombre'}</p>
                                                            <p className="text-xs text-slate-500">{player.position}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-xs ${player.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{player.status}</span>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>
          </div>
        );
      case 'fixtures': return <AdminPanel activeTab="fixtures" />;
      case 'staff': return <AdminPanel activeTab="staff" />;
      case 'master-data': return <MasterData clubConfig={clubConfig} setClubConfig={updateClubConfig} />;
      case 'attendance': return <AttendanceTracker players={players} />;
      default: return <Dashboard />;
    }
  };

  if (showSplash) return <SplashScreen />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex transition-colors duration-300">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} isDarkMode={isDarkMode} toggleTheme={toggleTheme} clubConfig={clubConfig} />
      <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="flex-1 overflow-hidden">{renderContent()}</div>
        <div className="py-4 text-center border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 mt-auto">
          <p className="text-xs text-slate-400 font-medium">&copy; {new Date().getFullYear()} {clubConfig.name} <span className="text-primary-500">PlegmaSport</span>.</p>
        </div>
      </main>
      {selectedPlayer && (
        <PlayerCard 
          player={selectedPlayer} 
          onClose={() => setSelectedPlayer(null)} 
          onSaveSuccess={refreshPlayers}
        />
      )}
    </div>
  );
}

export default App;
