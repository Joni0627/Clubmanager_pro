import React from 'react';
import { LayoutDashboard, Users, Calendar, Briefcase, Settings, Database, ChevronLeft, ChevronRight, Moon, Sun, ClipboardCheck, Shield } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setCurrentView, 
  isCollapsed, 
  setIsCollapsed,
  isDarkMode,
  toggleTheme
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Panel General', icon: LayoutDashboard },
    { id: 'players', label: 'Plantilla', icon: Users },
    { id: 'attendance', label: 'Asistencia', icon: ClipboardCheck },
    { id: 'fixtures', label: 'Temporada', icon: Calendar },
    { id: 'staff', label: 'Cuerpo Técnico', icon: Briefcase },
    { id: 'master-data', label: 'Datos Maestros', icon: Database },
  ];

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-slate-900 h-screen fixed left-0 top-0 flex flex-col shadow-xl z-50 transition-all duration-300 border-r border-slate-200 dark:border-slate-800`}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 h-16">
        {!isCollapsed && (
          <div className="flex items-center gap-2 animate-fade-in overflow-hidden">
             <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
                <Shield size={18} className="text-white" />
             </div>
             <div className="leading-tight whitespace-nowrap">
                <h1 className="font-bold text-sm tracking-tight text-slate-800 dark:text-white">Club Manager</h1>
                <h2 className="font-bold text-xs text-primary-600">PLEGMA</h2>
             </div>
          </div>
        )}
        {isCollapsed && (
           <div className="w-full flex justify-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                 <Shield size={18} className="text-white" />
              </div>
           </div>
        )}
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors ${isCollapsed ? 'absolute -right-3 top-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm' : ''}`}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon size={22} className={isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'} />
              {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
              
              {/* Tooltip for collapsed mode */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* User & Theme Toggle */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        
        <div className={`flex items-center justify-between mb-4 ${isCollapsed ? 'flex-col gap-4' : ''}`}>
           {!isCollapsed && <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Modo</span>}
           <button 
             onClick={toggleTheme}
             className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-slate-700 transition-colors focus:outline-none"
           >
              <span className="sr-only">Toggle Theme</span>
              <span
                className={`${
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 flex items-center justify-center`}
              >
                 {isDarkMode ? <Moon size={10} className="text-slate-800"/> : <Sun size={10} className="text-yellow-500"/>}
              </span>
           </button>
        </div>

        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-400 to-primary-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
            AD
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">Admin</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">admin@plegma.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;