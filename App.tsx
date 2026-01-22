
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import MasterData from './components/MasterData.tsx';
import SplashScreen from './components/SplashScreen.tsx';
import { ClubConfig } from './types.ts';
import { db } from './lib/supabase.ts';

function App() {
  const [view, setView] = useState('master-data');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
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
      const { data, error } = await db.config.get();
      if (data && !error) {
        setConfig({
          name: data.name,
          logoUrl: data.logo_url,
          primaryColor: data.primary_color,
          secondaryColor: data.secondary_color,
          disciplines: data.disciplines || []
        });
      }
      setIsLoading(false);
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
    if (error) alert('Error al guardar en la nube.');
  };

  if (isLoading) return <SplashScreen />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080a0f] text-slate-900 dark:text-slate-100 flex transition-colors duration-500 font-sans">
      <Sidebar 
        currentView={view} 
        setView={setView} 
        isDarkMode={isDarkMode} 
        toggleTheme={() => setIsDarkMode(!isDarkMode)} 
        config={config}
      />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden pl-20 md:pl-64">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {view === 'master-data' ? (
            <MasterData config={config} onSave={handleSaveConfig} />
          ) : (
            <div className="p-10 flex flex-col items-center justify-center h-full opacity-20 select-none">
               <h1 className="text-6xl font-black uppercase tracking-tighter italic">Próximamente</h1>
               <p className="text-xs font-black uppercase tracking-[1em] mt-4">Configura los Datos Maestros primero</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
