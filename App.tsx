
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import MasterData from './components/MasterData.tsx';
import Squads from './components/Squads.tsx';
import SplashScreen from './components/SplashScreen.tsx';
import { ClubConfig } from './types.ts';
import { db } from './lib/supabase.ts';

function App() {
  const [view, setView] = useState('squads');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [config, setConfig] = useState<ClubConfig>({
    name: 'CARGANDO...',
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

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error } = await db.config.get();
        if (data && !error) {
          setConfig({
            name: data.name,
            logoUrl: data.logo_url || '',
            primaryColor: data.primary_color || '#ec4899',
            secondaryColor: data.secondary_color || '#0f172a',
            disciplines: data.disciplines || []
          });
        }
      } catch (err) {
        console.error("Error inicializando config:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSaveConfig = async (newConfig: ClubConfig) => {
    setConfig(newConfig);
    const { error } = await db.config.update({
      name: newConfig.name,
      logo_url: newConfig.logoUrl,
      primary_color: newConfig.primaryColor,
      secondary_color: newConfig.secondaryColor,
      disciplines: newConfig.disciplines,
      updated_at: new Date().toISOString()
    });

    if (error) {
      console.error('Error de Supabase:', error.message);
    }
  };

  if (isLoading) return <SplashScreen />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080a0f] text-slate-900 dark:text-slate-100 flex transition-colors duration-500 font-sans overflow-hidden">
      <Sidebar 
        currentView={view} 
        setView={setView} 
        isDarkMode={isDarkMode} 
        toggleTheme={() => setIsDarkMode(!isDarkMode)} 
        config={config}
        isCollapsed={isSidebarCollapsed}
        setCollapsed={setIsSidebarCollapsed}
      />
      
      <main 
        className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-500 ease-in-out 
          ${isSidebarCollapsed ? 'md:pl-24' : 'md:pl-72'} pl-0
        `}
      >
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 md:pb-0">
          {view === 'master-data' && <MasterData config={config} onSave={handleSaveConfig} />}
          {view === 'squads' && <Squads clubConfig={config} />}
          
          {view !== 'master-data' && view !== 'squads' && (
            <div className="p-10 flex flex-col items-center justify-center h-full opacity-20 select-none">
               <h1 className="text-3xl md:text-6xl font-black uppercase tracking-tighter italic text-center">En Desarrollo</h1>
               <p className="text-[10px] font-black uppercase tracking-[0.5em] mt-4 text-center">Módulo administrativo</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
