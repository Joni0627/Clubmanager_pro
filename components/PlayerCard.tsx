import React, { useState } from 'react';
import { Player, PlayerStats } from '../types.ts';
import { X, Activity, Save, Edit3 } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface PlayerCardProps {
  player: Player;
  onClose: () => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState<PlayerStats>(player.stats);

  const statsData = [
    { subject: 'Ritmo', A: stats.pace, fullMark: 100 },
    { subject: 'Tiro', A: stats.shooting, fullMark: 100 },
    { subject: 'Pase', A: stats.passing, fullMark: 100 },
    { subject: 'Regate', A: stats.dribbling, fullMark: 100 },
    { subject: 'Defensa', A: stats.defending, fullMark: 100 },
    { subject: 'Físico', A: stats.physical, fullMark: 100 },
  ];

  const handleStatChange = (key: keyof PlayerStats, value: string) => {
    const numValue = parseInt(value) || 0;
    setStats(prev => ({
      ...prev,
      [key]: Math.min(100, Math.max(0, numValue))
    }));
  };

  const StatInput = ({ label, statKey, value }: { label: string, statKey: keyof PlayerStats, value: number }) => (
    <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-700 p-2 rounded-lg">
       <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</label>
       <input 
         type="number" 
         value={value}
         onChange={(e) => handleStatChange(statKey, e.target.value)}
         className="w-16 p-1 text-center font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-600 rounded border border-slate-300 dark:border-slate-500 focus:ring-2 focus:ring-primary-500 focus:outline-none"
       />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row relative animate-fade-in border border-slate-200 dark:border-slate-700">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-full z-10 transition-colors"
        >
          <X size={20} className="text-slate-600 dark:text-slate-200" />
        </button>

        {/* Left Side: Visual Card */}
        <div className="w-full md:w-1/3 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-black dark:to-slate-900 text-white p-6 flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          
          <div className="z-10 w-full flex justify-between items-start mb-6">
            <div className="text-5xl font-bold text-primary-500 italic">{stats.shooting}</div>
            <div className="text-right">
                <div className="text-2xl font-bold">{player.position}</div>
                <div className="text-sm opacity-75">{player.nationality}</div>
            </div>
          </div>

          <div className="z-10 w-48 h-48 rounded-full border-4 border-primary-500/50 overflow-hidden shadow-2xl mb-6 bg-slate-700 relative group">
             <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover" />
          </div>

          <div className="z-10 text-center mb-6">
            <h2 className="text-3xl font-bold uppercase tracking-wide">{player.name}</h2>
            <p className="text-slate-400 text-lg">#{player.number}</p>
          </div>

          <div className="z-10 w-full grid grid-cols-2 gap-4 text-center mt-auto">
             <div className="bg-white/10 rounded-lg p-2">
                <div className="text-xs text-slate-400 uppercase">Edad</div>
                <div className="font-bold text-xl">{player.age}</div>
             </div>
             <div className="bg-white/10 rounded-lg p-2">
                <div className="text-xs text-slate-400 uppercase">Valor</div>
                <div className="font-bold text-xl text-primary-400">{player.marketValue}</div>
             </div>
          </div>
        </div>

        {/* Right Side: Analytics & Input */}
        <div className="w-full md:w-2/3 p-8 bg-slate-50 dark:bg-slate-800">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Activity className="text-primary-600" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Análisis de Rendimiento</h3>
            </div>
            
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                isEditing 
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' 
                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
              }`}
            >
               {isEditing ? <><Save size={16}/> Guardar</> : <><Edit3 size={16}/> Editar Stats</>}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Chart Area */}
            <div className="h-64 relative -ml-6">
               <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={statsData}>
                  <PolarGrid stroke="#94a3b8" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name={player.name}
                    dataKey="A"
                    stroke="#db2777"
                    strokeWidth={3}
                    fill="#db2777"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Stats List or Inputs */}
            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2">
               {isEditing ? (
                 <div className="grid grid-cols-1 gap-3 animate-fade-in">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">INGRESO MANUAL DE DATOS</p>
                    <StatInput label="Ritmo (PAC)" statKey="pace" value={stats.pace} />
                    <StatInput label="Tiro (SHO)" statKey="shooting" value={stats.shooting} />
                    <StatInput label="Pase (PAS)" statKey="passing" value={stats.passing} />
                    <StatInput label="Regate (DRI)" statKey="dribbling" value={stats.dribbling} />
                    <StatInput label="Defensa (DEF)" statKey="defending" value={stats.defending} />
                    <StatInput label="Físico (PHY)" statKey="physical" value={stats.physical} />
                 </div>
               ) : (
                 <>
                   <h4 className="font-semibold text-slate-700 dark:text-slate-300">Desglose Técnico</h4>
                   {statsData.map((stat) => (
                     <div key={stat.subject} className="flex items-center gap-3 animate-fade-in">
                        <span className="w-16 text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.subject}</span>
                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-primary-500 rounded-full transition-all duration-500"
                                style={{ width: `${stat.A}%` }}
                            ></div>
                        </div>
                        <span className="w-8 text-right font-bold text-slate-700 dark:text-white">{stat.A}</span>
                     </div>
                   ))}
                 </>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;