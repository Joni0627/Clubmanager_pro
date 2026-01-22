
import React from 'react';
import { LayoutDashboard, Database, Sun, Moon, Shield } from 'lucide-react';
import { ClubConfig } from '../types';

interface SidebarProps {
  currentView: string;
  setView: (v: string) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  config: ClubConfig;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isDarkMode, toggleTheme, config }) => {
  const menu = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'master-data', label: 'Datos Maestros', icon: Database },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 md:w-64 bg-white dark:bg-[#0f1219] border-r border-slate-200 dark:border-white/5 flex flex-col z-50 transition-all duration-300">
      <div className="p-6 flex items-center gap-4 border-b border-slate-200 dark:border-white/5">
        <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shrink-0 shadow-lg shadow-primary-600/20 overflow-hidden">
          {config.logoUrl ? <img src={config.logoUrl} className="w-full h-full object-contain" /> : <Shield size={20} className="text-white" />}
        </div>
        <div className="hidden md:block overflow-hidden">
          <h2 className="font-black text-sm uppercase truncate text-slate-800 dark:text-white">{config.name}</h2>
          <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Sport Admin</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menu.map(item => {
          const Icon = item.icon;
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${active ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
            >
              <Icon size={20} className={active ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
              <span className="hidden md:block font-black text-[10px] uppercase tracking-widest">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-white/5">
        <button onClick={toggleTheme} className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          <span className="hidden md:block font-black text-[10px] uppercase tracking-widest">{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
