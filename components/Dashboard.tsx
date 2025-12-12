import React, { useState } from 'react';
import { TrendingUp, Users, Trophy, Activity, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Dashboard: React.FC = () => {
  const [selectedDiscipline, setSelectedDiscipline] = useState('Fútbol');

  // Simulated data based on discipline
  const getPerformanceData = () => {
    if (selectedDiscipline === 'Básquet') {
        return [
            { match: 'J1', goals: 88, conceded: 82 },
            { match: 'J2', goals: 95, conceded: 90 },
            { match: 'J3', goals: 78, conceded: 85 },
            { match: 'J4', goals: 102, conceded: 98 },
            { match: 'J5', goals: 91, conceded: 75 },
        ];
    }
    // Default Fútbol
    return [
      { match: 'J1', goals: 2, conceded: 1 },
      { match: 'J2', goals: 3, conceded: 0 },
      { match: 'J3', goals: 1, conceded: 1 },
      { match: 'J4', goals: 4, conceded: 2 },
      { match: 'J5', goals: 2, conceded: 0 },
    ];
  };

  const performanceData = getPerformanceData();

  const stats = [
    { label: 'Ranking Liga', value: selectedDiscipline === 'Fútbol' ? '2º' : '5º', icon: Trophy, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/20' },
    // KPI "Podio" o Racha
    { label: 'Racha Actual', value: '3G - 1E', icon: TrendingUp, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-100 dark:bg-primary-900/20' },
    // KPI Estado Físico General
    { label: 'Plantel Disponible', value: '92%', icon: Activity, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/20' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Panel General</h2>
           <p className="text-slate-500 dark:text-slate-400">Resumen deportivo por disciplina</p>
        </div>
        
        {/* Discipline Filter */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <Filter size={18} className="text-slate-400" />
            <select 
                value={selectedDiscipline}
                onChange={(e) => setSelectedDiscipline(e.target.value)}
                className="bg-transparent font-bold text-slate-800 dark:text-white text-sm outline-none"
            >
                <option value="Fútbol">Fútbol</option>
                <option value="Básquet">Básquet</option>
                <option value="Vóley">Vóley</option>
                <option value="Hockey">Hockey</option>
            </select>
        </div>
      </div>

      {/* KPI Cards (Simplified) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{stat.value}</h3>
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
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">
              {selectedDiscipline === 'Básquet' ? 'Puntos Anotados vs Recibidos' : 'Goles Marcados vs Recibidos'}
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="match" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#fff' }}
                  cursor={{fill: '#f1f5f9'}}
                />
                <Bar dataKey="goals" name={selectedDiscipline === 'Básquet' ? "Puntos Favor" : "Goles Favor"} fill="#db2777" radius={[4, 4, 0, 0]} />
                <Bar dataKey="conceded" name={selectedDiscipline === 'Básquet' ? "Puntos Contra" : "Goles Contra"} fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Match Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-black dark:to-slate-900 p-6 rounded-xl shadow-lg text-white flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-200">Próximo Partido</h3>
              <span className="px-3 py-1 bg-primary-600 text-xs font-bold rounded-full">EN 3 DÍAS</span>
            </div>
            
            <div className="flex items-center justify-between text-center mb-8">
              <div>
                 <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-2">L</div>
                 <p className="font-bold">Local</p>
              </div>
              <div className="text-3xl font-bold text-slate-500">VS</div>
              <div>
                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-slate-900 mx-auto mb-2">V</div>
                 <p className="font-bold">Rival</p>
              </div>
            </div>
            
            <div className="text-center space-y-1">
                <p className="text-xl font-medium">Estadio {selectedDiscipline}</p>
                <p className="text-slate-400">20:45 PM • Liga Oficial</p>
            </div>
          </div>
          
          <button className="w-full mt-6 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg transition-colors">
            Ver Ficha del Partido
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;