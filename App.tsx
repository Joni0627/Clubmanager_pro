import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import PlayerCard from './components/PlayerCard.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import MasterData from './components/MasterData.tsx';
import AttendanceTracker from './components/AttendanceTracker.tsx';
import MedicalDashboard from './components/MedicalDashboard.tsx';
import FeesManagement from './components/FeesManagement.tsx'; // Nuevo
import SplashScreen from './components/SplashScreen.tsx';
import { Player, Position } from './types.ts';
import { Filter, Search, Grid, List as ListIcon } from 'lucide-react';

// Enhanced Mock Players Data with Divisions/Categories
const MOCK_PLAYERS: Player[] = [
  // FÚTBOL
  {
    id: '1',
    name: 'Lionel Andrés',
    number: 10,
    position: Position.FWD,
    age: 36,
    nationality: 'Argentina',
    photoUrl: 'https://picsum.photos/400/400?random=1',
    status: 'Active',
    discipline: 'Fútbol',
    division: 'Masculino',
    category: 'Primera',
    squad: 'Primera',
    marketValue: '€35M',
    medical: { isFit: true, lastCheckup: '2023-10-01', expiryDate: '2024-10-01', notes: 'Óptimo.' },
    stats: { pace: 80, shooting: 92, passing: 94, dribbling: 96, defending: 32, physical: 65 }
  },
  {
    id: '2',
    name: 'Kylian M.',
    number: 7,
    position: Position.FWD,
    age: 24,
    nationality: 'France',
    photoUrl: 'https://picsum.photos/400/400?random=2',
    status: 'Active',
    discipline: 'Fútbol',
    division: 'Masculino',
    category: 'Primera',
    squad: 'Primera',
    marketValue: '€180M',
    medical: { isFit: true, lastCheckup: '2023-09-15', expiryDate: '2024-09-15', notes: 'Control ok.' },
    stats: { pace: 98, shooting: 89, passing: 80, dribbling: 92, defending: 36, physical: 78 }
  },
  {
    id: '3',
    name: 'Virgil V.',
    number: 4,
    position: Position.DEF,
    age: 32,
    nationality: 'Netherlands',
    photoUrl: 'https://picsum.photos/400/400?random=3',
    status: 'Injured',
    discipline: 'Fútbol',
    division: 'Masculino',
    category: 'Primera',
    squad: 'Primera',
    marketValue: '€30M',
    medical: { isFit: false, lastCheckup: '2023-11-01', expiryDate: '2024-01-01', notes: 'Esguince tobillo.' },
    stats: { pace: 76, shooting: 60, passing: 71, dribbling: 68, defending: 91, physical: 86 }
  },
  // BÁSQUET
  {
    id: '4',
    name: 'Facundo C.',
    number: 7,
    position: Position.BASE,
    age: 32,
    nationality: 'Argentina',
    photoUrl: 'https://picsum.photos/400/400?random=8',
    status: 'Active',
    discipline: 'Básquet',
    division: 'Masculino',
    category: 'Primera',
    squad: 'Primera Basket',
    marketValue: '€2M',
    medical: { isFit: true, lastCheckup: '2023-10-01', expiryDate: '2024-10-01', notes: 'Todo ok.' },
    stats: { pace: 85, shooting: 88, passing: 95, dribbling: 90, defending: 70, physical: 75 }
  },
  // ESCUELA
  {
    id: '7',
    name: 'Mateo Messi',
    number: 10,
    position: Position.FWD,
    age: 8,
    nationality: 'Argentina',
    photoUrl: 'https://picsum.photos/400/400?random=7',
    status: 'Active',
    discipline: 'Fútbol',
    division: 'Escuela Infantil',
    category: 'Cat. 2013',
    squad: 'Cat. 2013',
    marketValue: '-',
    medical: { isFit: false, lastCheckup: '2023-01-01', expiryDate: '2023-12-31', notes: 'Apto vencido.' },
    stats: { pace: 60, shooting: 60, passing: 60, dribbling: 60, defending: 60, physical: 60 }
  }
];

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  
  // Player View Filters
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterDiscipline, setFilterDiscipline] = useState('Todas');
  const [filterCategory, setFilterCategory] = useState('Todas');

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
       setIsDarkMode(true);
    }
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const html = document.querySelector('html');
    if (isDarkMode) {
      html?.classList.add('dark');
    } else {
      html?.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Filtering & Grouping Logic
  const getGroupedPlayers = () => {
    const filtered = MOCK_PLAYERS.filter(player => {
        const matchesDiscipline = filterDiscipline === 'Todas' || player.discipline === filterDiscipline;
        const matchesCategory = filterCategory === 'Todas' || player.category === filterCategory;
        return matchesDiscipline && matchesCategory;
    });

    // Grouping by Discipline then Category
    const grouped: Record<string, Record<string, Player[]>> = {};

    filtered.forEach(player => {
        if (!grouped[player.discipline]) {
            grouped[player.discipline] = {};
        }
        if (!grouped[player.discipline][player.category]) {
            grouped[player.discipline][player.category] = [];
        }
        grouped[player.discipline][player.category].push(player);
    });

    return grouped;
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'medical':
        return <MedicalDashboard players={MOCK_PLAYERS} />;
      case 'fees':
        return <FeesManagement />;
      case 'players':
        const groupedPlayers = getGroupedPlayers();
        return (
          <div className="p-6 h-full flex flex-col">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
               <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Gestión de Planteles</h2>
                  <p className="text-slate-500 dark:text-slate-400">Administración y Visualización Agrupada</p>
               </div>
               
               <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
                   {/* Filters */}
                   <select 
                        value={filterDiscipline} 
                        onChange={(e) => setFilterDiscipline(e.target.value)}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none dark:text-white"
                   >
                       <option value="Todas">Todas Disciplinas</option>
                       <option value="Fútbol">Fútbol</option>
                       <option value="Básquet">Básquet</option>
                   </select>

                   <select 
                        value={filterCategory} 
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none dark:text-white"
                   >
                       <option value="Todas">Todas las Categorías</option>
                       <option value="Primera">Primera</option>
                       <option value="Reserva">Reserva</option>
                   </select>
                  
                  {/* View Toggles */}
                  <div className="flex bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
                      <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-400'}`}
                      >
                          <Grid size={18} />
                      </button>
                      <button 
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-400'}`}
                      >
                          <ListIcon size={18} />
                      </button>
                  </div>
               </div>
            </div>

            <div className="overflow-y-auto space-y-8">
                {Object.entries(groupedPlayers).map(([discipline, categories]) => (
                    <div key={discipline} className="animate-fade-in">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 border-b pb-2 border-slate-200 dark:border-slate-700 uppercase tracking-wide">
                            {discipline}
                        </h3>
                        {Object.entries(categories).map(([category, players]) => (
                            <div key={category} className="mb-6">
                                <h4 className="text-sm font-bold text-primary-600 dark:text-primary-400 mb-3 ml-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                                    {category} ({players.length})
                                </h4>
                                {viewMode === 'grid' ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {players.map((player) => (
                                            <div 
                                                key={player.id} 
                                                onClick={() => setSelectedPlayer(player)}
                                                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                                            >
                                                <div className="h-40 overflow-hidden relative">
                                                    <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    <div className="absolute bottom-2 left-2">
                                                        <span className="bg-white/90 dark:bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-bold text-slate-800 dark:text-white">{player.position}</span>
                                                    </div>
                                                </div>
                                                <div className="p-4">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h3 className="font-bold text-slate-800 dark:text-white truncate">{player.name}</h3>
                                                        <span className="text-slate-400 font-mono">#{player.number}</span>
                                                    </div>
                                                    
                                                    {/* Status Bar */}
                                                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex mt-2">
                                                        <div className={`h-full ${player.medical?.isFit ? 'bg-emerald-500' : 'bg-red-500'} w-1/2`} title="Apto Médico"></div>
                                                        <div className={`h-full ${player.status === 'Active' ? 'bg-primary-500' : 'bg-slate-400'} w-1/2`} title="Estado Deportivo"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                                                <tr>
                                                    <th className="p-4 font-medium">Jugador</th>
                                                    <th className="p-4 font-medium">Posición</th>
                                                    <th className="p-4 font-medium">Estado</th>
                                                    <th className="p-4 font-medium text-right">Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                                {players.map(player => (
                                                    <tr key={player.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer" onClick={() => setSelectedPlayer(player)}>
                                                        <td className="p-4 flex items-center gap-3">
                                                            <img src={player.photoUrl} className="w-8 h-8 rounded-full bg-slate-200 object-cover" alt="" />
                                                            <span className="font-bold text-slate-800 dark:text-white">{player.name}</span>
                                                        </td>
                                                        <td className="p-4 text-slate-500 dark:text-slate-400">{player.position}</td>
                                                        <td className="p-4">
                                                             <span className={`px-2 py-0.5 rounded text-xs ${player.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                                {player.status === 'Active' ? 'Activo' : 'Inactivo'}
                                                             </span>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <button className="text-primary-600 font-medium hover:underline">Ver Ficha</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
          </div>
        );
      case 'fixtures':
        return <AdminPanel activeTab="fixtures" />;
      case 'staff':
        return <AdminPanel activeTab="staff" />;
      case 'master-data':
        return <MasterData />;
      case 'attendance':
        return <AttendanceTracker players={MOCK_PLAYERS} />;
      default:
        return <Dashboard />;
    }
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex transition-colors duration-300">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
      
      <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
        
        {/* Copyright Footer */}
        <div className="py-4 text-center border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 mt-auto">
          <p className="text-xs text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} Club Manager <span className="text-primary-500">Plegma</span>. Todos los derechos reservados.
          </p>
        </div>
      </main>

      {selectedPlayer && (
        <PlayerCard 
          player={selectedPlayer} 
          onClose={() => setSelectedPlayer(null)} 
        />
      )}
    </div>
  );
}

export default App;