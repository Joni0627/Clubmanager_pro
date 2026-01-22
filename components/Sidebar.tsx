
import React from 'react';
import { LayoutDashboard, Database, Sun, Moon, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { ClubConfig } from '../types';

interface SidebarProps {
  currentView: string;
  setView: (v: string) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  config: ClubConfig;
  isCollapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setView, 
  isDarkMode, 
  toggleTheme, 
  config,
  isCollapsed,
  setCollapsed
}) => {
  const menu = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'master-data', label: 'Estructura', icon: Database },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR (Hidden on Mobile) */}
      <aside 
        className={`fixed left-0 top-0 h-screen bg-white dark:bg-[#0f1219] border-r border-slate-200 dark:border-white/5 hidden md:flex flex-col z-[100] transition-all duration-500 ease-in-out 
          ${isCollapsed ? 'w-24' : 'w-72'}
        `}
      >
        <div className="p-6 flex items-center justify-between border-b border-slate-200 dark:border-white/5 min-h-[100px]">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shrink-0 shadow-lg shadow-primary-600/20">
              {config.logoUrl ? <img src={config.logoUrl} className="w-full h-full object-contain" /> : <Shield size={20} className="text-white" />}
            </div>
            {!isCollapsed && (
              <div className="animate-fade-in whitespace-nowrap">
                <h2 className="font-black text-sm uppercase truncate text-slate-800 dark:text-white max-w-[140px]">{config.name}</h2>
                <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Sport Admin</p>
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={() => setCollapsed(!isCollapsed)}
          className="absolute -right-3 top-24 bg-primary-600 text-white p-2 rounded-full shadow-lg border-4 border-slate-50 dark:border-[#080a0f] hover:scale-110 transition-all z-[110]"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <nav className="flex-1 p-4 space-y-3 mt-4">
          {menu.map(item => {
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-[1.25rem] transition-all group relative ${active ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
              >
                <Icon size={20} className={active ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
                {!isCollapsed && <span className="font-black text-[10px] uppercase tracking-widest animate-fade-in">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-white/5">
          <button onClick={toggleTheme} className="w-full flex items-center gap-4 p-4 rounded-[1.25rem] text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            {!isCollapsed && <span className="font-black text-[10px] uppercase tracking-widest">{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>}
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION (Hidden on Desktop) */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 dark:bg-[#0f1219]/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 flex items-center justify-around px-4 md:hidden z-[200] pb-safe">
          {menu.map(item => {
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex flex-col items-center gap-1 p-2 transition-all ${active ? 'text-primary-600 scale-110' : 'text-slate-400'}`}
              >
                <Icon size={22} strokeWidth={active ? 3 : 2} />
                <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
              </button>
            );
          })}
          <button onClick={toggleTheme} className="flex flex-col items-center gap-1 p-2 text-slate-400">
            {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
            <span className="text-[9px] font-black uppercase tracking-tighter">Tema</span>
          </button>
      </nav>
    </>
  );
};

export default Sidebar;
