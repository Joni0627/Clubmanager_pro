
import React, { useState } from 'react';
import { LayoutDashboard, Database, Sun, Moon, Shield, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
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
    { id: 'master-data', label: 'Datos Maestros', icon: Database },
  ];

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen bg-white dark:bg-[#0f1219] border-r border-slate-200 dark:border-white/5 flex flex-col z-50 transition-all duration-500 ease-in-out ${isCollapsed ? 'w-24' : 'w-72'}`}
    >
      {/* Header with Toggle */}
      <div className="p-6 flex items-center justify-between border-b border-slate-200 dark:border-white/5 min-h-[100px]">
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shrink-0 shadow-lg shadow-primary-600/20 overflow-hidden">
            {config.logoUrl ? <img src={config.logoUrl} className="w-full h-full object-contain" /> : <Shield size={20} className="text-white" />}
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in whitespace-nowrap">
              <h2 className="font-black text-sm uppercase truncate text-slate-800 dark:text-white">{config.name}</h2>
              <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Sport Admin</p>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Button Inside Sidebar */}
      <button 
        onClick={() => setCollapsed(!isCollapsed)}
        className="absolute -right-3 top-24 bg-primary-600 text-white p-1.5 rounded-full shadow-lg border-4 border-slate-50 dark:border-[#080a0f] hover:scale-110 transition-all z-50"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
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
              
              {isCollapsed && (
                <div className="absolute left-20 bg-slate-900 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100] border border-white/10">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-white/5 space-y-2">
        <button onClick={toggleTheme} className="w-full flex items-center gap-4 p-4 rounded-[1.25rem] text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all group relative">
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          {!isCollapsed && <span className="font-black text-[10px] uppercase tracking-widest animate-fade-in">{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>}
          
          {isCollapsed && (
            <div className="absolute left-20 bg-slate-900 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100] border border-white/10">
              {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
