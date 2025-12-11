import React from 'react';
import { Player } from '../types.ts';
import { X, Activity } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface PlayerCardProps {
  player: Player;
  onClose: () => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, onClose }) => {
  const statsData = [
    { subject: 'Ritmo', A: player.stats.pace, fullMark: 100 },
    { subject: 'Tiro', A: player.stats.shooting, fullMark: 100 },
    { subject: 'Pase', A: player.stats.passing, fullMark: 100 },
    { subject: 'Regate', A: player.stats.dribbling, fullMark: 100 },
    { subject: 'Defensa', A: player.stats.defending, fullMark: 100 },
    { subject: 'Físico', A: player.stats.physical, fullMark: 100 },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row relative animate-fade-in">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full z-10 transition-colors"
        >
          <X size={20} className="text-slate-600" />
        </button>

        {/* Left Side: Visual Card */}
        <div className="w-full md:w-1/3 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          
          <div className="z-10 w-full flex justify-between items-start mb-6">
            <div className="text-5xl font-bold text-emerald-400 italic">{player.stats.shooting}</div>
            <div className="text-right">
                <div className="text-2xl font-bold">{player.position}</div>
                <div className="text-sm opacity-75">{player.nationality}</div>
            </div>
          </div>

          <div className="z-10 w-48 h-48 rounded-full border-4 border-emerald-500/50 overflow-hidden shadow-2xl mb-6 bg-slate-700">
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
                <div className="font-bold text-xl text-emerald-400">{player.marketValue}</div>
             </div>
          </div>
        </div>

        {/* Right Side: Analytics */}
        <div className="w-full md:w-2/3 p-8 bg-slate-50">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="text-emerald-600" />
            <h3 className="text-xl font-bold text-slate-800">Análisis de Rendimiento</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="h-64 relative -ml-6">
               <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={statsData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name={player.name}
                    dataKey="A"
                    stroke="#10b981"
                    strokeWidth={3}
                    fill="#10b981"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4">
               <h4 className="font-semibold text-slate-700">Desglose Técnico</h4>
               {statsData.map((stat) => (
                 <div key={stat.subject} className="flex items-center gap-3">
                    <span className="w-16 text-sm text-slate-500 font-medium">{stat.subject}</span>
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${stat.A}%` }}
                        ></div>
                    </div>
                    <span className="w-8 text-right font-bold text-slate-700">{stat.A}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;