import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import PlayerCard from './components/PlayerCard.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import MasterData from './components/MasterData.tsx';
import AttendanceTracker from './components/AttendanceTracker.tsx';
import SplashScreen from './components/SplashScreen.tsx';
import { Player, Position } from './types.ts';
import { Filter, Search } from 'lucide-react';

// Mock Players Data
const MOCK_PLAYERS: Player[] = [
  {
    id: '1',
    name: 'Lionel Andrés',
    number: 10,
    position: Position.FWD,
    age: 36,
    nationality: 'Argentina',
    photoUrl: 'https://picsum.photos/400/400?random=1',
    status: 'Active',
    squad: 'Primera',
    marketValue: '€35M',
    medical: {
        isFit: true,
        lastCheckup: '2023-10-01',
        expiryDate: '2024-10-01',
        notes: 'Sin lesiones recientes. Estado físico óptimo.'
    },
    stats: {
      pace: 80,
      shooting: 92,
      passing: 94,
      dribbling: 96,
      defending: 32,
      physical: 65
    }
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
    squad: 'Primera',
    marketValue: '€180M',
    medical: {
        isFit: true,
        lastCheckup: '2023-09-15',
        expiryDate: '2024-09-15',
        notes: 'Control rutinario aprobado.'
    },
    stats: {
      pace: 98,
      shooting: 89,
      passing: 80,
      dribbling: 92,
      defending: 36,
      physical: 78
    }
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
    squad: 'Primera',
    marketValue: '€30M',
    medical: {
        isFit: false,
        lastCheckup: '2023-11-01',
        expiryDate: '2024-01-01',
        notes: 'Esguince de tobillo grado 2. Rehabilitación estimada: 3 semanas.'
    },
    stats: {
      pace: 76,
      shooting: 60,
      passing: 71,
      dribbling: 68,
      defending: 91,
      physical: 86
    }
  },
    {
    id: '4',
    name: 'Kevin D.B.',
    number: 17,
    position: Position.MID,
    age: 32,
    nationality: 'Belgium',
    photoUrl: 'https://picsum.photos/400/400?random=4',
    status: 'Active',
    squad: 'Primera',
    marketValue: '€70M',
    medical: {
        isFit: true,
        lastCheckup: '2023-08-20',
        expiryDate: '2024-08-20',
        notes: 'Fatiga muscular leve, seguimiento preventivo.'
    },
    stats: {
      pace: 74,
      shooting: 86,
      passing: 96,
      dribbling: 87,
      defending: 64,
      physical: 74
    }
  },
  {
    id: '5',
    name: 'Joven Promesa',
    number: 22,
    position: Position.MID,
    age: 18,
    nationality: 'Spain',
    photoUrl: 'https://picsum.photos/400/400?random=5',
    status: 'Active',
    squad: 'Reserva',
    marketValue: '€5M',
    medical: {
        isFit: true,
        lastCheckup: '2023-11-10',
        expiryDate: '2024-11-10',
        notes: 'Todo en orden.'
    },
    stats: {
      pace: 82,
      shooting: 70,
      passing: 75,
      dribbling: 78,
      defending: 50,
      physical: 60
    }
  }
];

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Check system preference on load
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
       setIsDarkMode(true);
    }
    
    // Simulate loading time for splash screen
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

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'players':
        return (
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
               <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Plantilla del Primer Equipo</h2>
                  <p className="text-slate-500 dark:text-slate-400">Gestión de fichas técnicas y rendimiento</p>
               </div>
               
               <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Buscar jugador..." 
                      className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                    />
                  </div>
                  <button className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                    <Filter size={20} />
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {MOCK_PLAYERS.map((player) => (
                <div 
                  key={player.id} 
                  onClick={() => setSelectedPlayer(player)}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold shadow-sm dark:text-white">
                      {player.position}
                    </div>
                    {player.status === 'Injured' && (
                       <div className="absolute bottom-0 w-full bg-red-500/90 text-white text-center text-xs py-1 font-bold">
                         LESIONADO
                       </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-white truncate">{player.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{player.nationality}</p>
                      </div>
                      <div className="text-2xl font-bold text-slate-200 dark:text-slate-700 group-hover:text-primary-500 transition-colors">
                        #{player.number}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mt-4">
                       <div className="text-center bg-slate-50 dark:bg-slate-700/50 rounded p-1">
                          <div className="text-[10px] text-slate-400 font-bold">PAC</div>
                          <div className={`text-sm font-bold ${player.stats.pace > 85 ? 'text-primary-500' : 'text-slate-700 dark:text-slate-300'}`}>{player.stats.pace}</div>
                       </div>
                       <div className="text-center bg-slate-50 dark:bg-slate-700/50 rounded p-1">
                          <div className="text-[10px] text-slate-400 font-bold">SHO</div>
                          <div className={`text-sm font-bold ${player.stats.shooting > 85 ? 'text-primary-500' : 'text-slate-700 dark:text-slate-300'}`}>{player.stats.shooting}</div>
                       </div>
                       <div className="text-center bg-slate-50 dark:bg-slate-700/50 rounded p-1">
                          <div className="text-[10px] text-slate-400 font-bold">PAS</div>
                          <div className={`text-sm font-bold ${player.stats.passing > 85 ? 'text-primary-500' : 'text-slate-700 dark:text-slate-300'}`}>{player.stats.passing}</div>
                       </div>
                    </div>
                  </div>
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
        <div className="flex-1">
          {renderContent()}
        </div>
        
        {/* Copyright Footer */}
        <div className="py-6 text-center border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 mt-auto">
          <p className="text-sm text-slate-400 font-medium">
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