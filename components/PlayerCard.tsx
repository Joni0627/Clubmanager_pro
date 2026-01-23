
import React, { useState, useRef, useEffect, useMemo } from 'react';
// Fix: Removed non-existent Position and MetricDefinition, using Metric instead
import { Player, ClubConfig, Metric } from '../types.ts';
import { X, Activity, Save, Edit3, User, FileText, AlertTriangle, Sparkles, Loader2, CheckCircle, Smartphone, Mail, Fingerprint, MapPin, Users, Shield, Hash, Camera, Link as LinkIcon, Upload, TrendingUp } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { generatePlayerReport } from '../services/geminiService.ts';
import { db } from '../lib/supabase.ts';

interface PlayerCardProps {
  player: Player;
  onClose: () => void;
  onSaveSuccess?: () => void;
  clubConfig: ClubConfig;
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

  const currentMetrics = useMemo(() => {
    // Fix: Corrected property access. Discipline has branches, which contain categories.
    const discipline = clubConfig.disciplines.find(d => d.name === player.discipline);
    const branch = discipline?.branches.find(b => b.gender === player.gender);
    const category = branch?.categories.find(c => c.name === player.category);
    return category?.metrics || [];
  }, [clubConfig, player.discipline, player.category, player.gender]);

  // Fix: Changed MetricDefinition to Metric
  const calculateOverall = (stats: Record<string, number>, metrics: Metric[]) => {
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
      stats: { ...prev.stats, [metricName]: Math.min(100, Math.max(0, numValue)) }
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
        await db.players.upsert(dataToSave);
        setPlayer(dataToSave);
        setIsEditing(false);
        if (onSaveSuccess) onSaveSuccess();
      } catch (err: any) {
        console.error(err);
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

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-0 md:p-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-full md:h-[90vh] md:rounded-[4rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-white/5 relative">
        <button onClick={onClose} className="absolute top-8 right-8 p-3 bg-slate-100 dark:bg-white/5 hover:bg-red-500 hover:text-white rounded-full z-[110] transition-all">
          <X size={20} />
        </button>

        <div className="w-full md:w-96 shrink-0 bg-slate-950 text-white p-10 flex flex-col items-center border-b md:border-b-0 md:border-r border-white/5 relative">
          <div className="z-10 w-full flex justify-between items-start mb-10">
            <div className="text-8xl font-black text-primary-500 italic drop-shadow-[0_0_30_rgba(236,72,153,0.3)]">{player.overallRating}</div>
            <div className="text-right">
                <div className="text-2xl font-black tracking-tighter uppercase">{player.position}</div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{player.discipline}</div>
            </div>
          </div>
          <div className="z-10 w-48 h-48 md:w-64 md:h-64 rounded-full border-8 border-primary-500/20 overflow-hidden shadow-2xl mb-10 bg-slate-800 relative group transition-all">
             <img src={player.photoUrl || 'https://via.placeholder.com/400'} className="w-full h-full object-cover" />
          </div>
          <div className="z-10 text-center">
            <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-3">{player.name || 'NUEVO TALENTO'}</h2>
            <div className="flex items-center justify-center gap-4">
                <span className="text-primary-500 font-black text-3xl">#{player.number}</span>
                <span className="bg-white/5 px-4 py-1.5 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{player.category}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <div className="bg-white dark:bg-slate-900 px-10 pt-10 pb-4 border-b border-slate-200 dark:border-white/5 z-50">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h3 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Perfil de Atleta</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Advanced Talent Management System</p>
                    </div>
                    <button onClick={handleToggleEdit} disabled={isSaving} className={`flex items-center gap-2 px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-2xl ${isEditing ? 'bg-emerald-600 text-white' : 'bg-primary-600 text-white'}`}>
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : (isEditing ? <Save size={18}/> : <Edit3 size={18}/>)}
                        <span>{isSaving ? 'Guardando' : (isEditing ? 'Confirmar' : 'Editar')}</span>
                    </button>
                </div>
                <div className="flex gap-12 overflow-x-auto scrollbar-hide">
                    {[
                        { id: 'stats', label: 'Rendimiento', icon: Activity },
                        { id: 'profile', label: 'Biografía', icon: User },
                        { id: 'medical', label: 'Médico', icon: Activity }
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 pb-5 border-b-4 transition-all text-xs font-black uppercase tracking-widest ${activeTab === tab.id ? 'border-primary-500 text-primary-500' : 'border-transparent text-slate-400'}`}>
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-1 p-10 overflow-y-auto">
                {activeTab === 'stats' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in pb-20">
                        <div className="aspect-square bg-white dark:bg-slate-900 rounded-[4rem] p-10 shadow-inner border border-slate-100 dark:border-white/5">
                            {radarData.length > 2 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                        <PolarGrid stroke="#334155" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }} />
                                        <Radar name={player.name} dataKey="A" stroke="#ec4899" strokeWidth={5} fill="#ec4899" fillOpacity={0.4} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400 font-black uppercase text-[10px] text-center p-12 tracking-widest">Requiere al menos 3 métricas configuradas</div>
                            )}
                        </div>
                        <div className="space-y-4">
                            {currentMetrics.map((m) => (
                                <div key={m.id} className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{m.name}</span>
                                        <span className="text-xl font-black text-slate-800 dark:text-white">{player.stats[m.name] || 0}</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary-600 rounded-full" style={{ width: `${player.stats[m.name] || 0}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'profile' && (
                    <div className="space-y-12 animate-fade-in pb-20">
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Documento (DNI)</label>
                                <input disabled={!isEditing} value={player.dni} onChange={e => handleInfoChange('dni', e.target.value)} className="w-full p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary-500/10" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email de Contacto</label>
                                <input disabled={!isEditing} value={player.email} onChange={e => handleInfoChange('email', e.target.value)} className="w-full p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary-500/10" />
                            </div>
                        </section>
                    </div>
                )}
                {activeTab === 'medical' && (
                    <div className="animate-fade-in pb-20">
                        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-white/5">
                            <h4 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
                                <Activity size={20} className="text-primary-500" /> Estado Sanitario
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aptitud Competitiva</label>
                                    <div className="flex gap-4">
                                        <button disabled={!isEditing} onClick={() => handleInfoChange('medical', {...player.medical, isFit: true})} className={`flex-1 py-4 rounded-2xl font-black uppercase text-xs tracking-widest border transition-all ${player.medical.isFit ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-transparent text-slate-400 border-slate-100 dark:border-white/5'}`}>Apto</button>
                                        <button disabled={!isEditing} onClick={() => handleInfoChange('medical', {...player.medical, isFit: false})} className={`flex-1 py-4 rounded-2xl font-black uppercase text-xs tracking-widest border transition-all ${!player.medical.isFit ? 'bg-red-500 text-white border-red-500' : 'bg-transparent text-slate-400 border-slate-100 dark:border-white/5'}`}>No Apto</button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vencimiento Apto</label>
                                    <input type="date" disabled={!isEditing} value={player.medical.expiryDate} onChange={e => handleInfoChange('medical', {...player.medical, expiryDate: e.target.value})} className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-bold outline-none" />
                                </div>
                            </div>
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
