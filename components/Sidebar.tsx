import React from 'react';
import { LayoutDashboard, Users, Calendar, Briefcase, Package, Shield } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Panel General', icon: LayoutDashboard },
    { id: 'players', label: 'Plantilla', icon: Users },
    { id: 'fixtures', label: 'Temporada', icon: Calendar },
    { id: 'staff', label: 'Cuerpo Técnico', icon: Briefcase },
    { id: 'inventory', label: 'Utilería', icon: Package },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col shadow-xl z-50">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <Shield className="w-8 h-8 text-emerald-400" />
        <div>
          <h1 className="font-bold text-xl tracking-tight">ClubManager</h1>
          <p className="text-xs text-slate-400">Pro Edition</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded-lg p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-blue-500 flex items-center justify-center font-bold text-xs">
            AD
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">Admin Usuario</p>
            <p className="text-xs text-slate-400 truncate">admin@club.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
