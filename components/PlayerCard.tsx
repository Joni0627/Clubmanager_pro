import React, { useState } from 'react';
import { Player, PlayerStats, Position } from '../types.ts';
import { X, Activity, Save, Edit3, User, Stethoscope, FileHeart, AlertTriangle } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface PlayerCardProps {
  player: Player;
  onClose: () => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player: initialPlayer, onClose }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'profile' | 'medical'>('stats');
  const [isEditing, setIsEditing] = useState(false);
  const [player, setPlayer] = useState<Player>(initialPlayer);

  // Stats Data construction
  const statsData = [
    { subject: 'Ritmo', A: player.stats.pace, fullMark: 100 },
    { subject: 'Tiro', A: player.stats.shooting, fullMark: 100 },
    { subject: 'Pase', A: player.stats.passing, fullMark: 100 },
    { subject: 'Regate', A: player.stats.dribbling, fullMark: 100 },
    { subject: 'Defensa', A: player.stats.defending, fullMark: 100 },
    { subject: 'Físico', A: player.stats.physical, fullMark: 100 },
  ];

  const handleStatChange = (key: keyof PlayerStats, value: string) => {
    const numValue = parseInt(value) || 0;
    setPlayer(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [key]: Math.min(100, Math.max(0, numValue))
      }
    }));
  };

  const handleInfoChange = (key: keyof Player, value: any) => {
    setPlayer(prev => ({ ...prev, [key]: value }));
  };

  const handleMedicalChange = (key: string, value: any) => {
    setPlayer(prev => ({
        ...prev,
        medical: {
            ...prev.medical!,
            [key]: value
        }
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
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col md:flex-row relative animate-fade-in border border-slate-200 dark:border-slate-700 overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-full z-20 transition-colors"
        >
          <X size={20} className="text-slate-600 dark:text-slate-200" />
        </button>

        {/* Left Side: Visual Card (Static) */}
        <div className="w-full md:w-1/3 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-black dark:to-slate-900 text-white p-6 flex flex-col items-center relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          
          <div className="z-10 w-full flex justify-between items-start mb-4">
            <div className="text-5xl font-bold text-primary-500 italic">{player.stats.shooting}</div>
            <div className="text-right">
                <div className="text-2xl font-bold">{player.position}</div>
                <div className="text-sm opacity-75">{player.nationality}</div>
            </div>
          </div>

          <div className="z-10 w-40 h-40 rounded-full border-4 border-primary-500/50 overflow-hidden shadow-2xl mb-4 bg-slate-700 relative group">
             <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover" />
          </div>

          <div className="z-10 text-center mb-6">
            <h2 className="text-2xl font-bold uppercase tracking-wide leading-tight">{player.name}</h2>
            <p className="text-slate-400 text-lg">#{player.number}</p>
          </div>

           {/* Quick Stats Grid */}
          <div className="z-10 w-full grid grid-cols-2 gap-3 text-center mt-auto">
             <div className="bg-white/10 rounded-lg p-2">
                <div className="text-xs text-slate-400 uppercase">Estado</div>
                <div className={`font-bold text-sm ${player.status === 'Injured' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {player.status === 'Injured' ? 'Lesionado' : 'Activo'}
                </div>
             </div>
             <div className="bg-white/10 rounded-lg p-2">
                <div className="text-xs text-slate-400 uppercase">Apto Médico</div>
                <div className={`font-bold text-sm ${player.medical?.isFit ? 'text-emerald-400' : 'text-red-400'}`}>
                    {player.medical?.isFit ? 'VIGENTE' : 'NO APTO'}
                </div>
             </div>
          </div>
        </div>

        {/* Right Side: Dynamic Content */}
        <div className="w-full md:w-2/3 flex flex-col h-full bg-slate-50 dark:bg-slate-800">
            {/* Header with Tabs */}
            <div className="px-6 pt-6 pb-2 border-b border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Gestión del Jugador</h3>
                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                            isEditing 
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' 
                            : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                        }`}
                        >
                        {isEditing ? <><Save size={16}/> Guardar Cambios</> : <><Edit3 size={16}/> Editar Ficha</>}
                    </button>
                </div>

                <div className="flex gap-6 overflow-x-auto">
                    <button 
                        onClick={() => setActiveTab('stats')}
                        className={`flex items-center gap-2 pb-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'stats' ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-medium' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                    >
                        <Activity size={18} /> Rendimiento
                    </button>
                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center gap-2 pb-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'profile' ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-medium' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                    >
                        <User size={18} /> Perfil & Datos
                    </button>
                    <button 
                        onClick={() => setActiveTab('medical')}
                        className={`flex items-center gap-2 pb-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'medical' ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-medium' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                    >
                        <Stethoscope size={18} /> Dpto. Médico
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-6 overflow-y-auto">
                
                {/* --- TAB: STATS --- */}
                {activeTab === 'stats' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                        <div className="h-64 relative lg:h-auto">
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
                        <div className="space-y-3 overflow-y-auto">
                            {isEditing ? (
                                <div className="grid grid-cols-1 gap-3 animate-fade-in">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase mb-2">Edición de Métricas</p>
                                    <StatInput label="Ritmo (PAC)" statKey="pace" value={player.stats.pace} />
                                    <StatInput label="Tiro (SHO)" statKey="shooting" value={player.stats.shooting} />
                                    <StatInput label="Pase (PAS)" statKey="passing" value={player.stats.passing} />
                                    <StatInput label="Regate (DRI)" statKey="dribbling" value={player.stats.dribbling} />
                                    <StatInput label="Defensa (DEF)" statKey="defending" value={player.stats.defending} />
                                    <StatInput label="Físico (PHY)" statKey="physical" value={player.stats.physical} />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-slate-700 dark:text-slate-300">Desglose Técnico</h4>
                                    {statsData.map((stat) => (
                                        <div key={stat.subject} className="flex items-center gap-3 animate-fade-in">
                                            <span className="w-16 text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.subject}</span>
                                            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary-500 rounded-full" style={{ width: `${stat.A}%` }}></div>
                                            </div>
                                            <span className="w-8 text-right font-bold text-slate-700 dark:text-white">{stat.A}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- TAB: PROFILE --- */}
                {activeTab === 'profile' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Nombre Completo</label>
                                <input 
                                    type="text" 
                                    disabled={!isEditing}
                                    value={player.name}
                                    onChange={(e) => handleInfoChange('name', e.target.value)}
                                    className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-800 text-slate-800 dark:text-white"
                                />
                            </div>
                             <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Nacionalidad</label>
                                <input 
                                    type="text" 
                                    disabled={!isEditing}
                                    value={player.nationality}
                                    onChange={(e) => handleInfoChange('nationality', e.target.value)}
                                    className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-800 text-slate-800 dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Posición Táctica</label>
                                <select 
                                    disabled={!isEditing}
                                    value={player.position}
                                    onChange={(e) => handleInfoChange('position', e.target.value)}
                                    className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-800 text-slate-800 dark:text-white"
                                >
                                    {Object.values(Position).map(pos => <option key={pos} value={pos}>{pos}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Número Camiseta</label>
                                <input 
                                    type="number" 
                                    disabled={!isEditing}
                                    value={player.number}
                                    onChange={(e) => handleInfoChange('number', parseInt(e.target.value))}
                                    className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-800 text-slate-800 dark:text-white"
                                />
                            </div>
                        </div>
                        
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                            <h4 className="font-semibold text-slate-800 dark:text-white mb-4">Configuración de Plantel</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Estado Actual</label>
                                    <select 
                                        disabled={!isEditing}
                                        value={player.status}
                                        onChange={(e) => handleInfoChange('status', e.target.value)}
                                        className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-800 text-slate-800 dark:text-white"
                                    >
                                        <option value="Active">Activo / Disponible</option>
                                        <option value="Injured">Lesionado</option>
                                        <option value="Suspended">Suspendido</option>
                                        <option value="Reserve">Reserva</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Plantel Asignado</label>
                                    <select 
                                        disabled={!isEditing}
                                        value={player.squad}
                                        onChange={(e) => handleInfoChange('squad', e.target.value)}
                                        className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-800 text-slate-800 dark:text-white"
                                    >
                                        <option value="Primera">Primera División</option>
                                        <option value="Reserva">Reserva</option>
                                        <option value="Sub-20">Sub-20</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB: MEDICAL --- */}
                {activeTab === 'medical' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className={`p-4 rounded-xl border ${player.medical?.isFit ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${player.medical?.isFit ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                    {player.medical?.isFit ? <FileHeart size={24} /> : <AlertTriangle size={24} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-slate-800 dark:text-white">
                                        {player.medical?.isFit ? 'APTO PARA COMPETENCIA' : 'NO APTO MÉDICAMENTE'}
                                    </h4>
                                    <p className="text-sm opacity-80 text-slate-600 dark:text-slate-300">
                                        Certificado vigente hasta: <strong>{player.medical?.expiryDate || 'No definido'}</strong>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Estado Apto Médico</label>
                                <select 
                                    disabled={!isEditing}
                                    value={player.medical?.isFit ? 'true' : 'false'}
                                    onChange={(e) => handleMedicalChange('isFit', e.target.value === 'true')}
                                    className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-800 text-slate-800 dark:text-white"
                                >
                                    <option value="true">APTO (Fit)</option>
                                    <option value="false">NO APTO (Unfit)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Vencimiento Certificado</label>
                                <input 
                                    type="date"
                                    disabled={!isEditing}
                                    value={player.medical?.expiryDate}
                                    onChange={(e) => handleMedicalChange('expiryDate', e.target.value)}
                                    className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-800 text-slate-800 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Observaciones Clínicas / Historial</label>
                            <textarea 
                                disabled={!isEditing}
                                rows={6}
                                value={player.medical?.notes}
                                onChange={(e) => handleMedicalChange('notes', e.target.value)}
                                className="w-full p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-800 text-slate-800 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                placeholder="Ingrese observaciones médicas relevantes, lesiones previas o recomendaciones..."
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;