
import React, { useState } from 'react';
import { Player, PlayerStats, Position } from '../types.ts';
import { X, Activity, Save, Edit3, User, Stethoscope, FileHeart, AlertTriangle, Sparkles, Loader2, ClipboardType, CheckCircle, Smartphone, Mail, Fingerprint, MapPin, Users2, Shield, Hash } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { generatePlayerReport } from '../services/geminiService.ts';
import { db } from '../lib/supabase.ts';

interface PlayerCardProps {
  player: Player;
  onClose: () => void;
  onSaveSuccess?: () => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player: initialPlayer, onClose, onSaveSuccess }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'profile' | 'medical'>('stats');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [player, setPlayer] = useState<Player>(initialPlayer);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

  const handleToggleEdit = async () => {
    if (isEditing) {
      setIsSaving(true);
      setSaveStatus('idle');
      setErrorMessage('');
      
      try {
        const dataToSave = { ...player };
        
        if (dataToSave.id.startsWith('new-')) {
            try {
                // @ts-ignore
                dataToSave.id = window.crypto.randomUUID();
            } catch (e) {
                dataToSave.id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            }
        }

        const { error } = await db.players.upsert(dataToSave);
        
        if (error) {
            console.error("Error Supabase:", error);
            throw new Error(error.message);
        }
        
        setPlayer(dataToSave);
        setSaveStatus('success');
        setIsEditing(false);
        if (onSaveSuccess) onSaveSuccess();
        setTimeout(() => setSaveStatus('idle'), 4000);
      } catch (err: any) {
        console.error("Fallo al guardar:", err);
        setSaveStatus('error');
        setErrorMessage(err.message || 'Error de base de datos');
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsEditing(true);
      setSaveStatus('idle');
    }
  };

  const handleGenerateAIReport = async () => {
    setIsAnalyzing(true);
    setAiReport(null);
    try {
      const report = await generatePlayerReport(player);
      setAiReport(report);
    } catch (err) {
      setAiReport("Error al generar el reporte. Verifica tu API Key.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleInfoChange = (key: keyof Player, value: any) => {
    setPlayer(prev => ({ ...prev, [key]: value }));
  };

  const handleTutorChange = (key: string, value: string) => {
    setPlayer(prev => ({
      ...prev,
      tutor: {
        ...prev.tutor,
        [key]: value
      }
    }));
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

        {/* Left Side: Visual Card */}
        <div className="w-full md:w-1/3 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-black dark:to-slate-900 text-white p-6 flex flex-col items-center relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          
          <div className="z-10 w-full flex justify-between items-start mb-4">
            <div className="text-5xl font-black text-primary-500 italic drop-shadow-lg">{player.stats.shooting}</div>
            <div className="text-right">
                <div className="text-2xl font-bold">{player.position}</div>
                <div className="text-sm opacity-75">{player.nationality}</div>
            </div>
          </div>

          <div className="z-10 w-40 h-40 rounded-full border-4 border-primary-500/50 overflow-hidden shadow-2xl mb-4 bg-slate-700 relative group">
             <img src={player.photoUrl || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=400&h=400&auto=format&fit=crop'} alt={player.name} className="w-full h-full object-cover" />
          </div>

          <div className="z-10 text-center mb-6">
            <h2 className="text-2xl font-bold uppercase tracking-wide leading-tight">{player.name || 'NUEVO JUGADOR'}</h2>
            <p className="text-slate-400 text-lg font-mono tracking-tighter">#{player.number}</p>
          </div>

          <div className="z-10 w-full grid grid-cols-2 gap-3 text-center mt-auto">
             <div className="bg-white/10 rounded-lg p-2 border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Estado</div>
                <div className={`font-bold text-sm ${player.status === 'Injured' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {player.status === 'Injured' ? 'LESIONADO' : 'ACTIVO'}
                </div>
             </div>
             <div className="bg-white/10 rounded-lg p-2 border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Apto Médico</div>
                <div className={`font-bold text-sm ${player.medical?.isFit ? 'text-emerald-400' : 'text-red-400'}`}>
                    {player.medical?.isFit ? 'VIGENTE' : 'CADUCADO'}
                </div>
             </div>
          </div>
        </div>

        {/* Right Side: Dynamic Content */}
        <div className="w-full md:w-2/3 flex flex-col h-full bg-slate-50 dark:bg-slate-800">
            <div className="px-6 pt-6 pb-2 border-b border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Ficha de Gestión</h3>
                    <div className="flex gap-2 items-center">
                        {saveStatus === 'success' && (
                            <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold animate-fade-in bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                                <CheckCircle size={14} /> ¡Sincronizado!
                            </div>
                        )}
                        {saveStatus === 'error' && (
                            <div className="flex flex-col items-end max-w-[200px]">
                                <div className="flex items-center gap-1 text-red-600 text-xs font-bold animate-shake">
                                    <AlertTriangle size={14} /> Error al guardar
                                </div>
                                <span className="text-[9px] text-red-500 leading-tight text-right truncate w-full">
                                    {errorMessage}
                                </span>
                            </div>
                        )}
                        {!isEditing && (
                            <button 
                                onClick={handleGenerateAIReport}
                                disabled={isAnalyzing}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-primary-600 text-white rounded-lg text-sm font-bold shadow-md hover:scale-105 transition-all disabled:opacity-50"
                            >
                                {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16}/>}
                                {isAnalyzing ? 'Procesando...' : 'Análisis IA'}
                            </button>
                        )}
                        <button 
                            onClick={handleToggleEdit}
                            disabled={isSaving}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                isEditing 
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-700' 
                                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                            }`}
                            >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : (isEditing ? <Save size={16}/> : <Edit3 size={16}/>)}
                            {isSaving ? 'Guardando...' : (isEditing ? 'Confirmar' : 'Editar')}
                        </button>
                    </div>
                </div>

                <div className="flex gap-6 overflow-x-auto scrollbar-hide">
                    <button onClick={() => setActiveTab('stats')} className={`flex items-center gap-2 pb-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'stats' ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 font-medium'}`}>
                        <Activity size={18} /> Rendimiento
                    </button>
                    <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-2 pb-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'profile' ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 font-medium'}`}>
                        <User size={18} /> Perfil & Datos
                    </button>
                    <button onClick={() => setActiveTab('medical')} className={`flex items-center gap-2 pb-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'medical' ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 font-medium'}`}>
                        <Stethoscope size={18} /> Médico
                    </button>
                </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
                {activeTab === 'stats' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="h-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 relative shadow-sm">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={statsData}>
                                    <PolarGrid stroke="#94a3b8" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name={player.name} dataKey="A" stroke="#db2777" strokeWidth={3} fill="#db2777" fillOpacity={0.4} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-3">
                                <h4 className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Atributos Técnicos</h4>
                                {isEditing ? (
                                    <div className="grid grid-cols-1 gap-2">
                                        <StatInput label="Ritmo (PAC)" statKey="pace" value={player.stats.pace} />
                                        <StatInput label="Tiro (SHO)" statKey="shooting" value={player.stats.shooting} />
                                        <StatInput label="Pase (PAS)" statKey="passing" value={player.stats.passing} />
                                        <StatInput label="Regate (DRI)" statKey="dribbling" value={player.stats.dribbling} />
                                        <StatInput label="Defensa (DEF)" statKey="defending" value={player.stats.defending} />
                                        <StatInput label="Físico (PHY)" statKey="physical" value={player.stats.physical} />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {statsData.map((stat) => (
                                            <div key={stat.subject} className="flex items-center gap-3">
                                                <span className="w-16 text-[10px] text-slate-400 font-bold uppercase">{stat.subject}</span>
                                                <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${stat.A}%` }}></div>
                                                </div>
                                                <span className="w-8 text-right font-black text-slate-700 dark:text-white text-xs">{stat.A}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {(aiReport || isAnalyzing) && (
                            <div className="animate-fade-in">
                                <div className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl overflow-hidden shadow-sm">
                                    <div className="bg-indigo-50/50 dark:bg-indigo-900/10 px-4 py-2 flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/50">
                                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                                            <ClipboardType size={12} /> REPORTE TÉCNICO IA
                                        </span>
                                        <Sparkles size={12} className="text-indigo-400 animate-pulse" />
                                    </div>
                                    <div className="p-5">
                                        {isAnalyzing ? (
                                            <div className="flex flex-col items-center py-6 gap-3">
                                                <div className="w-full max-w-[200px] h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500 animate-shine w-full"></div>
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-400 animate-pulse uppercase tracking-widest">Generando Informe Profesional...</p>
                                            </div>
                                        ) : (
                                            <div className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-serif italic text-sm">
                                                {aiReport}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* SECCIÓN 1: DATOS PERSONALES */}
                        <div>
                          <h4 className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
                            <Fingerprint size={14} className="text-primary-500" /> Información Personal y de Contacto
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Fingerprint size={10} /> DNI / Documento</label>
                                  <input type="text" disabled={!isEditing} value={player.dni} onChange={(e) => handleInfoChange('dni', e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all disabled:opacity-60" placeholder="Ej: 42.123.456" />
                              </div>
                              <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Smartphone size={10} /> Tel. Celular</label>
                                  <input type="text" disabled={!isEditing} value={player.phone} onChange={(e) => handleInfoChange('phone', e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all disabled:opacity-60" placeholder="Ej: +54 9 11..." />
                              </div>
                              <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Mail size={10} /> Email Jugador</label>
                                  <input type="email" disabled={!isEditing} value={player.email} onChange={(e) => handleInfoChange('email', e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all disabled:opacity-60" placeholder="jugador@ejemplo.com" />
                              </div>
                              <div className="md:col-span-2 lg:col-span-3 space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><MapPin size={10} /> Dirección de Residencia</label>
                                  <input type="text" disabled={!isEditing} value={player.address} onChange={(e) => handleInfoChange('address', e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all disabled:opacity-60" placeholder="Calle, Nro, Piso, Localidad..." />
                              </div>
                          </div>
                        </div>

                        {/* SECCIÓN 2: DATOS DEL TUTOR */}
                        <div className="bg-slate-100/50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                          <h4 className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                            <Users2 size={14} className="text-indigo-500" /> Datos de Tutor / Responsable
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Nombre Padre/Madre/Tutor</label>
                                  <input type="text" disabled={!isEditing} value={player.tutor?.name || ''} onChange={(e) => handleTutorChange('name', e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm dark:text-white outline-none disabled:opacity-60" placeholder="Nombre completo" />
                              </div>
                              <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Smartphone size={10} /> Tel. Celular Tutor</label>
                                  <input type="text" disabled={!isEditing} value={player.tutor?.phone || ''} onChange={(e) => handleTutorChange('phone', e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm dark:text-white outline-none disabled:opacity-60" placeholder="Contacto urgente" />
                              </div>
                              <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Mail size={10} /> Email Tutor</label>
                                  <input type="email" disabled={!isEditing} value={player.tutor?.email || ''} onChange={(e) => handleTutorChange('email', e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm dark:text-white outline-none disabled:opacity-60" placeholder="tutor@ejemplo.com" />
                              </div>
                          </div>
                        </div>

                        {/* SECCIÓN 3: DATOS DEPORTIVOS */}
                        <div>
                          <h4 className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
                            <Shield size={14} className="text-emerald-500" /> Jerarquía y Plantel
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Nombre y Apellido</label>
                                  <input type="text" disabled={!isEditing} value={player.name} onChange={(e) => handleInfoChange('name', e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm dark:text-white outline-none disabled:opacity-60" />
                              </div>
                              <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Posición Táctica</label>
                                  <select disabled={!isEditing} value={player.position} onChange={(e) => handleInfoChange('position', e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm dark:text-white outline-none disabled:opacity-60">
                                      {Object.values(Position).map(pos => <option key={pos} value={pos}>{pos}</option>)}
                                  </select>
                              </div>
                              <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Hash size={10}/> Número Camiseta</label>
                                  <input type="number" disabled={!isEditing} value={player.number} onChange={(e) => handleInfoChange('number', parseInt(e.target.value))} className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm dark:text-white font-mono outline-none disabled:opacity-60" />
                              </div>
                              <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Plantel / Categoría</label>
                                  <select disabled={!isEditing} value={player.category} onChange={(e) => handleInfoChange('category', e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm dark:text-white outline-none disabled:opacity-60">
                                      <option value="Primera">Primera División</option>
                                      <option value="Reserva">Reserva</option>
                                      <option value="Sub-20">Sub-20</option>
                                      <option value="Sub-17">Sub-17</option>
                                      <option value="Escuela">Escuela Infantil</option>
                                  </select>
                              </div>
                              <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Género / División</label>
                                  <select disabled={!isEditing} value={player.division} onChange={(e) => handleInfoChange('division', e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm dark:text-white outline-none disabled:opacity-60">
                                      <option value="Masculino">Masculino</option>
                                      <option value="Femenino">Femenino</option>
                                      <option value="Mixto">Mixto</option>
                                  </select>
                              </div>
                              <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Estado Deportivo</label>
                                  <select disabled={!isEditing} value={player.status} onChange={(e) => handleInfoChange('status', e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm dark:text-white outline-none disabled:opacity-60">
                                      <option value="Active">Disponible</option>
                                      <option value="Injured">Lesionado</option>
                                      <option value="Suspended">Suspendido</option>
                                      <option value="Reserve">En Reserva</option>
                                  </select>
                              </div>
                          </div>
                        </div>
                    </div>
                )}

                {activeTab === 'medical' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className={`p-5 rounded-2xl border ${player.medical?.isFit ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800/50' : 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800/50'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${player.medical?.isFit ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                    {player.medical?.isFit ? <FileHeart size={24} /> : <AlertTriangle size={24} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-slate-800 dark:text-white uppercase tracking-tight">{player.medical?.isFit ? 'Apto para Competencia' : 'Inhabilitado para Jugar'}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Vencimiento del certificado: <span className="font-bold">{player.medical?.expiryDate || 'NO REGISTRADO'}</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Dictamen Médico</label>
                                <select disabled={!isEditing} value={player.medical?.isFit ? 'true' : 'false'} onChange={(e) => handleMedicalChange('isFit', e.target.value === 'true')} className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm dark:text-white outline-none disabled:opacity-60">
                                    <option value="true">APTO FÍSICO</option>
                                    <option value="false">NO APTO / PENDIENTE</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Fecha de Caducidad</label>
                                <input type="date" disabled={!isEditing} value={player.medical?.expiryDate} onChange={(e) => handleMedicalChange('expiryDate', e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm dark:text-white outline-none disabled:opacity-60" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Antecedentes y Observaciones Clínicas</label>
                            <textarea disabled={!isEditing} rows={6} value={player.medical?.notes} onChange={(e) => handleMedicalChange('notes', e.target.value)} className="w-full p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm dark:text-white outline-none resize-none focus:ring-2 focus:ring-primary-500 transition-all disabled:opacity-60" placeholder="Escriba aquí alergias, lesiones previas o recomendaciones médicas..." />
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
