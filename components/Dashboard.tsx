import React from 'react';
import { TrendingUp, Users, DollarSign, Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Dashboard: React.FC = () => {
  const performanceData = [
    { match: 'J1', goals: 2, conceded: 1 },
    { match: 'J2', goals: 3, conceded: 0 },
    { match: 'J3', goals: 1, conceded: 1 },
    { match: 'J4', goals: 4, conceded: 2 },
    { match: 'J5', goals: 2, conceded: 0 },
  ];

  const stats = [
    { label: 'Ranking Liga', value: '2º', icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { label: 'Plantilla Activa', value: '24', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Valor Plantilla', value: '€145M', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Rendimiento', value: '+12%', icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-100' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-slate-800">Panel General</h2>
        <p className="text-slate-500">Resumen de actividad del club</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Goles Marcados vs Recibidos</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="match" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{fill: '#f1f5f9'}}
                />
                <Bar dataKey="goals" name="Goles a Favor" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="conceded" name="Goles en Contra" fill="#f87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Match Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl shadow-lg text-white flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-200">Próximo Partido</h3>
              <span className="px-3 py-1 bg-emerald-500 text-xs font-bold rounded-full">EN 3 DÍAS</span>
            </div>
            
            <div className="flex items-center justify-between text-center mb-8">
              <div>
                 <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-2">L</div>
                 <p className="font-bold">Local</p>
              </div>
              <div className="text-3xl font-bold text-slate-500">VS</div>
              <div>
                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-slate-900 mx-auto mb-2">V</div>
                 <p className="font-bold">Visitante</p>
              </div>
            </div>
            
            <div className="text-center space-y-1">
                <p className="text-xl font-medium">Estadio Municipal</p>
                <p className="text-slate-400">20:45 PM • La Liga</p>
            </div>
          </div>
          
          <button className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-colors">
            Gestionar Convocatoria
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
