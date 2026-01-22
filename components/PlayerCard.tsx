
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Player, PlayerStats, Position, ClubConfig, MetricDefinition } from '../types.ts';
import { X, Activity, Save, Edit3, User, Stethoscope, FileHeart, AlertTriangle, Sparkles, Loader2, CheckCircle, Smartphone, Mail, Fingerprint, MapPin, Users2, Shield, Hash, Camera, Link as LinkIcon, Upload, TrendingUp } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { generatePlayerReport } from '../services/geminiService.ts';
import { db } from '../lib/supabase.ts';

interface PlayerCardProps {
  player: Player;
  onClose: () => void;
  onSaveSuccess?: () => void;
  clubConfig: ClubConfig; // Nueva prop necesaria para métricas
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player: initialPlayer, onClose, onSaveSuccess, clubConfig }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'profile' | 'medical'>('stats'); 
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [player, setPlayer] = useState<Player>(initialPlayer);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Obtener la configuración de métricas para la categoría del jugador
  const currentMetrics = useMemo(() => {
    const discipline = clubConfig.disciplines.find(d => d.name === player.discipline);
    const category = discipline?.categories.find(c => c.name === player.category);
    return category?.metrics || [];
  }, [clubConfig, player.discipline, player.category]);

  // Cálculo del promedio ponderado (Overall Rating)
  const calculateOverall = (stats: Record<string, number>, metrics: MetricDefinition[]) => {
    if (metrics.length === 0) return 0;
    let totalWeight = 0;
    let weightedSum = 0;
    metrics.forEach(m => {
        const value = stats[m.name] || 0;
        weightedSum += (value * m.weight);
        totalWeight += m.weight;
    });
    return Math.round(weightedSum / totalWeight);
  };

  useEffect(() => {
    const overall = calculateOverall(player.stats, currentMetrics);
    if (overall !== player.overallRating) {
        setPlayer(prev => ({ ...prev, overallRating: overall }));
    }
  }, [player.stats, currentMetrics]);

  const radarData = currentMetrics.map(m => ({
    subject: m.name,
    A: player.stats[m.name] || 0,
    fullMark: 100
  }));

  const handleStatChange = (metricName: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setPlayer(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [metricName]: Math.min(100, Math.max(0, numValue))
      }
    }));
  };

  const handleToggleEdit = async () => {
    if (isEditing) {
      setIsSaving(true);
      try {
        const dataToSave = { ...player };
        if (dataToSave.id.startsWith('new-')) {
          // @ts-ignore
          dataToSave.id = window.crypto.randomUUID();
        }
        const { error } = await db.players.upsert(dataToSave);
        if (error) throw new Error(error.message);
        setPlayer(dataToSave);
        setSaveStatus('success');
        setIsEditing(false);
        if (onSaveSuccess) onSaveSuccess();
        setTimeout(() => setSaveStatus('idle'), 4000);
      } catch (err: any) {
        setSaveStatus('error');
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleGenerateAIReport = async () => {
    setIsAnalyzing(true);
    try {
      const report = await generatePlayerReport(player);
      setAiReport(report);
    } catch (err) {
      setAiReport("Error al generar el reporte técnico.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleInfoChange = (key: keyof Player, value: any) => {
    setPlayer(prev => ({ ...prev, [key]: value }));
  };

  const triggerFileSelect = () => {
    if (isEditing) fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => handleInfoChange('photoUrl', reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-0 md:p-4 animate-fade-in">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-full md:h-[90vh] md:rounded-[3rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-white/10 relative">
        
        <button onClick={onClose} className="absolute top-6 right-6 p-3 bg-slate-100 dark:bg-white/5 hover:bg-red-500 hover:text-white rounded-full z-[110] transition-all">
          <X size={20} />
        </button>

        {/* Sidebar Visual */}
        <div className="w-full md:w-80 lg:w-96 shrink-0 bg-slate-950 text-white p-8 flex flex-col items-center border-b md:border-b-0 md:border-r border-white/5 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary-900/20 to-transparent pointer-events-none"></div>
          
          <div className="z-10 w-full flex justify-between items-start mb-8">
            <div className="text-7xl font-black text-primary-500 italic drop-shadow-[0_0_20px_rgba(236,72,153,0.4)]">
                {player.overallRating}
            </div>
            <div className="text-right">
                <div className="text-2xl font-black tracking-tighter">{player.position}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{player.discipline}</div>
            </div>
          </div>

          <div 
            onClick={triggerFileSelect}
            className={`z-10 w-40 h-40 md:w-56 md:h-56 rounded-full border-4 border-primary-500/30 overflow-hidden shadow-2xl mb-8 bg-slate-800 relative group transition-all ${isEditing ? 'cursor-pointer scale-105 border-primary-500' : ''}`}
          >
             <img src={player.photoUrl || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=400&h=400&auto=format&fit=crop'} className="w-full h-full object-cover" />
             {isEditing && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={32} className="mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Cambiar Avatar</span>
                </div>
             )}
          </div>

          <div className="z-10 text-center mb-8">
            <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">{player.name || 'NUEVO TALENTO'}</h2>
            <div className="flex items-center justify-center gap-3">
                <span className="text-primary-500 font-black text-2xl">#{player.number}</span>
                <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">{player.category}</span>
            </div>
          </div>

          <div className="z-10 w-full grid grid-cols-2 gap-4 mt-auto">
             <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Rendimiento</div>
                <div className="font-black text-lg text-emerald-400 flex items-center justify-center gap-1">
                    <TrendingUp size={16} /> TOP
                </div>
             </div>
             <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Médico</div>
                <div className={`font-black text-sm ${player.medical?.isFit ? 'text-emerald-400' : 'text-red-400'}`}>
                    {player.medical?.isFit ? 'APTO' : 'NO APTO'}
                </div>
             </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <div className="bg-white dark:bg-slate-900 px-8 pt-8 pb-4 border-b border-slate-200 dark:border-white/5 z-50">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Gestión de Talento</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Sistema de Ponderación Dinámica</p>
                    </div>
                    <button 
                        onClick={handleToggleEdit}
                        disabled={isSaving}
                        className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-tighter transition-all shadow-xl ${
                            isEditing 
                            ? 'bg-emerald-600 text-white shadow-emerald-500/20' 
                            : 'bg-primary-600 text-white shadow-primary-500/20'
                        }`}
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : (isEditing ? <Save size={18}/> : <Edit3 size={18}/>)}
                        <span>{isSaving ? 'Guardando' : (isEditing ? 'Confirmar' : 'Editar Ficha')}</span>
                    </button>
                </div>

                <div className="flex gap-10 overflow-x-auto scrollbar-hide">
                    {[
                        { id: 'stats', label: 'Rendimiento', icon: Activity },
                        { id: 'profile', label: 'Perfil Personal', icon: User },
                        { id: 'medical', label: 'Ficha Médica', icon: Stethoscope }
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 pb-4 border-b-4 transition-all text-xs font-black uppercase tracking-widest ${activeTab === tab.id ? 'border-primary-500 text-primary-500' : 'border-transparent text-slate-400'}`}>
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto">
                {activeTab === 'stats' && (
                    <div className="space-y-10 animate-fade-in pb-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                            <div className="aspect-square bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-inner border border-slate-100 dark:border-white/5">
                                {radarData.length > 2 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                            <PolarGrid stroke="#334155" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }} />
                                            <Radar name={player.name} dataKey="A" stroke="#ec4899" strokeWidth={4} fill="#ec4899" fillOpacity={0.4} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400 font-bold uppercase text-xs text-center p-10">
                                        Configure al menos 3 métricas en Datos Maestros para visualizar el radar.
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Scale size={14}/> Métricas de {player.category}
                                </h4>
                                {currentMetrics.map((m) => (
                                    <div key={m.id} className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] font-black text-slate-500 uppercase">{m.name}</span>
                                                <span className="text-[9px] font-bold text-primary-500 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-full">PESO: {m.weight}</span>
                                            </div>
                                            {isEditing ? (
                                                <input 
                                                    type="range" min="0" max="100"
                                                    value={player.stats[m.name] || 0}
                                                    onChange={(e) => handleStatChange(m.name, e.target.value)}
                                                    className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                                                />
                                            ) : (
                                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full" style={{ width: `${player.stats[m.name] || 0}%` }}></div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="w-12 text-center font-black text-lg text-slate-800 dark:text-white">
                                            {player.stats[m.name] || 0}
                                        </div>
                                    </div>
                                ))}
                                {currentMetrics.length === 0 && (
                                    <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-[2rem] border border-amber-200 dark:border-amber-700/30 text-amber-600 dark:text-amber-400 text-xs font-bold text-center">
                                        No hay métricas configuradas para esta categoría en Datos Maestros.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* IA Report */}
                        <div className="bg-indigo-600/5 dark:bg-indigo-500/10 rounded-[3rem] p-8 border border-indigo-500/20">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="flex items-center gap-2 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em]">
                                    <Sparkles size={18} /> Análisis Técnico Gemini IA
                                </h4>
                                {!isEditing && (
                                    <button onClick={handleGenerateAIReport} disabled={isAnalyzing} className="px-6 py-2 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase hover:bg-indigo-700 transition-all disabled:opacity-50">
                                        {isAnalyzing ? 'Generando...' : 'Actualizar Informe'}
                                    </button>
                                )}
                            </div>
                            <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-serif italic bg-white dark:bg-slate-950 p-8 rounded-[2rem] border border-white/10 min-h-[150px] shadow-inner">
                                {isAnalyzing ? <div className="animate-pulse space-y-4"><div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-full"></div><div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div><div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-4/6"></div></div> : aiReport || "Haga clic en 'Actualizar' para que la IA analice las métricas de rendimiento actuales."}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="space-y-10 animate-fade-in pb-16">
                        {/* Secciones de perfil iguales al código anterior, adaptadas para usar handleInfoChange */}
                        <section>
                          <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 border-b border-slate-200 dark:border-white/10 pb-3">
                            <Fingerprint size={16} className="text-primary-500" /> Información Legal y Contacto
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                              {[
                                { label: 'DNI / Documento', key: 'dni' as keyof Player, icon: Fingerprint },
                                { label: 'Teléfono', key: 'phone' as keyof Player, icon: Smartphone },
                                { label: 'Email', key: 'email' as keyof Player, icon: Mail, type: 'email' }
                              ].map(f => (
                                <div key={f.key} className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5"><f.icon size={12} /> {f.label}</label>
                                    <input type={f.type || 'text'} disabled={!isEditing} value={(player as any)[f.key]} onChange={(e) => handleInfoChange(f.key as keyof Player, e.target.value)} className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-primary-500/10 disabled:opacity-50 transition-all" />
                                </div>
                              ))}
                          </div>
                        </section>

                        <section className="bg-slate-100 dark:bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5">
                          <h4 className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-6">
                            <Users2 size={16} /> Responsable / Tutor
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                              <div className="space-y-1.5">
                                  <label className="text-[10px] font-black text-slate-500 uppercase">Nombre Completo</label>
                                  <input type="text" disabled={!isEditing} value={player.tutor?.name} onChange={(e) => setPlayer({...player, tutor: {...player.tutor, name: e.target.value}})} className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold dark:text-white" />
                              </div>
                              <div className="space-y-1.5">
                                  <label className="text-[10px] font-black text-slate-500 uppercase">Teléfono Tutor</label>
                                  <input type="text" disabled={!isEditing} value={player.tutor?.phone} onChange={(e) => setPlayer({...player, tutor: {...player.tutor, phone: e.target.value}})} className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold dark:text-white" />
                              </div>
                          </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

const Scale = ({ size, className }: any) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h18"/></svg>;

export default PlayerCard;
