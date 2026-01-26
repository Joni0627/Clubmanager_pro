
import React, { useState, useEffect } from 'react';
import TopNav from './components/TopNav.tsx';
import MasterData from './components/MasterData.tsx';
import Squads from './components/Squads.tsx';
import DisciplineConsole from './components/DisciplineConsole.tsx';
import SplashScreen from './components/SplashScreen.tsx';
import { ClubConfig, Discipline, Player } from './types.ts';
import { db } from './lib/supabase.ts';
import { Settings, Shield } from 'lucide-react';

function App() {
  const [view, setView] = useState('squads');
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState<ClubConfig>({
    name: 'MI CLUB',
    logoUrl: '',
    primaryColor: '#ec4899',
    secondaryColor: '#0f172a',
    disciplines: []
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [isDarkMode]);

  const fetchData = async () => {
    try {
      const { data: configData } = await db.config.get();
      const { data: playersData } = await db.players.getAll();
      
      if (configData) {
        setConfig({
          name: configData.name || 'MI CLUB',
          logoUrl: configData.logo_url || '',
          primaryColor: configData.primary_color || '#ec4899',
          secondaryColor: configData.secondary_color || '#0f172a',
          disciplines: configData.disciplines || []
        });
      }
      
      if (playersData) {
        setPlayers(playersData);
      }
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEnterDiscipline = (disc: Discipline) => {
    setSelectedDiscipline(disc);
    setView('discipline-console');
  };

  const handleSaveConfig = async (newConfig: ClubConfig) => {
    setConfig(newConfig);
    await db.config.update({
      name: newConfig.name,
      logo_url: newConfig.logoUrl,
      primary_color: newConfig.primaryColor,
      secondary_color: newConfig.secondaryColor,
      disciplines: newConfig.disciplines,
      updated_at: new Date().toISOString()
    });
  };

  if (isLoading) return <SplashScreen />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080a0f] text-slate-900 dark:text-slate-100 transition-colors duration-500 font-sans overflow-x-hidden pt-24">
      <TopNav 
        currentView={view} 
        setView={setView} 
        isDarkMode={isDarkMode} 
        toggleTheme={() => setIsDarkMode(!isDarkMode)} 
        config={config}
      />
      
      <main className="flex-1 min-h-[calc(100vh-6rem)]">
        {view === 'master-data' && (
          <MasterData config={config} onSave={handleSaveConfig} />
        )}
        
        {view === 'squads' && (
          <div className="p-12 max-w-7xl mx-auto">
            <header className="mb-20">
              <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none dark:text-white">Planteles</h2>
              <div className="flex items-center gap-4 mt-6">
                  <div className="w-16 h-2 bg-primary-600 rounded-full"></div>
                  <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Selección de Disciplina</p>
              </div>
            </header>

            {config.disciplines.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                {config.disciplines.map(disc => (
                  <div 
                    key={disc.id}
                    onClick={() => handleEnterDiscipline(disc)}
                    className="group bg-white dark:bg-[#0f1219] rounded-[4rem] p-12 border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-3xl hover:-translate-y-2 transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 rounded-bl-[4rem] group-hover:bg-primary-600/10 transition-colors"></div>
                    <div className="w-24 h-24 rounded-[2rem] bg-slate-950 flex items-center justify-center mb-10 shadow-2xl relative z-10">
                      {disc.iconUrl ? <img src={disc.iconUrl} className="w-full h-full object-cover p-1" /> : <Shield size={32} className="text-primary-600" />}
                    </div>
                    <h3 className="text-4xl font-black uppercase tracking-tighter dark:text-white leading-none mb-4 italic">{disc.name}</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mb-8">Gestión de Competición</p>
                    <div className="flex items-center gap-2 text-primary-600 font-black uppercase text-[10px] tracking-widest group-hover:gap-4 transition-all">
                      Ingresar Consola <Shield size={14} className="fill-primary-600" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-40 text-center">
                 <Shield size={64} className="mx-auto text-slate-200 mb-8 animate-pulse" />
                 <h2 className="text-3xl font-black uppercase mb-4">No hay disciplinas configuradas</h2>
                 <button onClick={() => setView('master-data')} className="bg-primary-600 text-white px-10 py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl">Ir a Estructura</button>
              </div>
            )}
          </div>
        )}

        {view === 'discipline-console' && selectedDiscipline && (
          <DisciplineConsole 
            discipline={selectedDiscipline} 
            clubConfig={config} 
            players={players}
            onBack={() => setView('squads')}
          />
        )}
      </main>
      
      {/* Botón flotante para ayuda rápida o IA (opcional) */}
      <div className="fixed bottom-12 right-12 z-[200]">
         <button className="w-16 h-16 bg-slate-900 dark:bg-primary-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all border-4 border-white dark:border-[#080a0f]">
            <Settings size={24} />
         </button>
      </div>
    </div>
  );
}

export default App;
