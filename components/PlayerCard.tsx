
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
  const [activeTab, setActiveTab] = useState<'stats' | 'profile' | 'medical'>('profile'); // Iniciamos en perfil por pedido del usuario
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
      setAiReport("Error al generar el reporte técnico.");
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
        medical: { ...prev.medical!, [key]: value }
    }));
  };

  const StatInput = ({ label, statKey, value }: { label: string, statKey: keyof PlayerStats, value: number }) => (
    <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-700/50 p-2.5 rounded-xl">
       <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{label}</label>
       <input 
         type="number" 
         value={value}
         onChange={(e) => handleStatChange(statKey, e.target.value)}
         className="w-14 p-1.5 text-center font-black text-primary-600 dark:text-primary-400 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-primary-500 outline-none"
       />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-0 md:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-full md:h-[90vh] md:rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative animate-fade-in border border-white/10">
        
        {/* Close Button - Visible only on Desktop or handled via click outside */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 bg-slate-100/10 hover:bg-slate-200/20 dark:bg-white/5 dark:hover:bg-white/10 rounded-full z-[110] transition-all backdrop-blur-md"
        >
          <X size={20} className="text-slate-400" />
        </button>

        {/* Left Side: Visual Identity Card (Compact on mobile) */}
        <div className="w-full md:w-80 lg:w-96 shrink-0 bg-slate-950 text-white p-6 md:p-8 flex flex-col items-center relative overflow-hidden border-b md:border-b-0 md:border-r border-white/5">
          <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] from-primary-900/40 via-transparent to-transparent"></div>
          </div>
          
          <div className="z-10 w-full flex justify-between items-start mb-6 md:mb-10">
            <div className="text-6xl font-black text-primary-500 italic drop-shadow-[0_0_15px_rgba(236,72,153,0.3)]">{player.stats.shooting}</div>
            <div className="text-right">
                <div className="text-2xl font-black tracking-tighter text-white">{player.position}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{player.nationality || 'ARGENTINO'}</div>
            </div>
          </div>

          {/* Player Photo */}
          <div className="z-10 w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-primary-500/30 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] mb-6 bg-slate-800 relative group">
             <img 
               src={player.photoUrl || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=400&h=400&auto=format&fit=crop'} 
               alt={player.name} 
               className="w-full h-full object-cover transition-transform group-hover:scale-110" 
             />
          </div>

          <div className="z-10 text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-none mb-2">{player.name || 'JUGADOR NUEVO'}</h2>
            <div className="flex items-center justify-center gap-2">
                <span className="text-primary-500 font-mono text-xl">#{player.number}</span>
            </div>
          </div>

          <div className="z-10 w-full grid grid-cols-2 gap-3 text-center mt-auto">
             <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Estado</div>
                <div className={`font-black text-xs ${player.status === 'Injured' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {player.status === 'Injured' ? 'LESIONADO' : 'ACTIVO'}
                </div>
             </div>
             <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Apto Médico</div>
                <div className={`font-black text-xs ${player.medical?.isFit ? 'text-emerald-400' : 'text-red-400'}`}>
                    {player.medical?.isFit ? 'VIGENTE' : 'CADUCADO'}
                </div>
             </div>
          </div>
        </div>

        {/* Right Side: Forms and Content */}
        <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
            {/* Header: Actions & Tabs (STIKY) */}
            <div className="bg-white dark:bg-slate-900 px-6 pt-6 pb-2 border-b border-slate-200 dark:border-white/5 z-50">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Ficha de Gestión</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PlegmaSport • Cloud Sync</p>
                    </div>
                    <div className="flex gap-2 items-center">
                        {saveStatus === 'success' && <CheckCircle size={20} className="text-emerald-500 animate-bounce" />}
                        <button 
                            onClick={handleToggleEdit}
                            disabled={isSaving}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-tighter transition-all shadow-xl ${
                                isEditing 
                                ? 'bg-emerald-600 text-white shadow-emerald-500/20 hover:bg-emerald-700' 
                                : 'bg-primary-600 text-white shadow-primary-500/20 hover:bg-primary-700'
                            }`}
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : (isEditing ? <Save size={18}/> : <Edit3 size={18}/>)}
                            <span>{isSaving ? 'Guardando' : (isEditing ? 'Confirmar' : 'Editar Ficha')}</span>
                        </button>
                    </div>
                </div>

                <div className="flex gap-8 overflow-x-auto scrollbar-hide">
                    {[
                        { id: 'stats', label: 'Rendimiento', icon: Activity },
                        { id: 'profile', label: 'Perfil & Datos', icon: User },
                        { id: 'medical', label: 'Médico', icon: Stethoscope }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)} 
                            className={`flex items-center gap-2 pb-4 border-b-4 transition-all whitespace-nowrap text-xs font-black uppercase tracking-widest ${
                                activeTab === tab.id 
                                ? 'border-primary-500 text-primary-500' 
                                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                            }`}
                        >
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto scroll-smooth">
                {activeTab === 'stats' && (
                    <div className="space-y-8 animate-fade-in pb-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                            <div className="aspect-square max-h-[300px] mx-auto w-full bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-inner border border-slate-100 dark:border-white/5">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={statsData}>
                                        <PolarGrid stroke="#334155" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }} />
                                        <Radar name={player.name} dataKey="A" stroke="#ec4899" strokeWidth={4} fill="#ec4899" fillOpacity={0.4} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                                {isEditing ? (
                                    <>
                                        <StatInput label="Ritmo" statKey="pace" value={player.stats.pace} />
                                        <StatInput label="Tiro" statKey="shooting" value={player.stats.shooting} />
                                        <StatInput label="Pase" statKey="passing" value={player.stats.passing} />
                                        <StatInput label="Regate" statKey="dribbling" value={player.stats.dribbling} />
                                        <StatInput label="Defensa" statKey="defending" value={player.stats.defending} />
                                        <StatInput label="Físico" statKey="physical" value={player.stats.physical} />
                                    </>
                                ) : (
                                    statsData.map((stat) => (
                                        <div key={stat.subject} className="flex items-center gap-4 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                                            <span className="w-16 text-[10px] font-black text-slate-400 uppercase">{stat.subject}</span>
                                            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full" style={{ width: `${stat.A}%` }}></div>
                                            </div>
                                            <span className="w-8 text-right font-black text-slate-800 dark:text-white text-sm">{stat.A}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="bg-indigo-600/5 dark:bg-indigo-500/10 rounded-3xl p-6 border border-indigo-500/20">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="flex items-center gap-2 text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                                    <Sparkles size={16} /> Informe Técnico Inteligente
                                </h4>
                                {!isEditing && (
                                    <button onClick={handleGenerateAIReport} disabled={isAnalyzing} className="text-[10px] font-black bg-indigo-600 text-white px-3 py-1.5 rounded-full hover:bg-indigo-700 transition-all uppercase">
                                        {isAnalyzing ? 'Analizando...' : 'Actualizar'}
                                    </button>
                                )}
                            </div>
                            <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-serif italic bg-white dark:bg-slate-950 p-6 rounded-2xl border border-white/10 min-h-[100px] shadow-inner">
                                {isAnalyzing ? <div className="animate-pulse space-y-2"><div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div><div className="h-2 bg-slate-200 dark:bg-slate-800 rounded"></div></div> : aiReport || "Haga clic en 'Actualizar' para generar un análisis técnico con IA."}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="space-y-10 animate-fade-in pb-16">
                        {/* SECCIÓN 1: CONTACTO */}
                        <section>
                          <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 border-b border-slate-200 dark:border-white/10 pb-3">
                            <Fingerprint size={16} className="text-primary-500" /> Información de Contacto
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                              {[
                                { label: 'DNI / Documento', key: 'dni' as keyof Player, icon: Fingerprint, placeholder: '42.000.000' },
                                { label: 'Tel. Celular', key: 'phone' as keyof Player, icon: Smartphone, placeholder: '+54 9 11...' },
                                { label: 'Email Personal', key: 'email' as keyof Player, icon: Mail, type: 'email', placeholder: 'correo@ejemplo.com' }
                              ].map(f => (
                                <div key={f.key} className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5"><f.icon size={12} /> {f.label}</label>
                                    {/* Fix: Added explicit type casting for f.key to keyof Player to resolve TS error */}
                                    <input type={f.type || 'text'} disabled={!isEditing} value={(player as any)[f.key]} onChange={(e) => handleInfoChange(f.key as keyof Player, e.target.value)} className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50" placeholder={f.placeholder} />
                                </div>
                              ))}
                              <div className="sm:col-span-2 lg:col-span-3 space-y-1.5">
                                  <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5"><MapPin size={12} /> Dirección Residencial</label>
                                  <input type="text" disabled={!isEditing} value={player.address} onChange={(e) => handleInfoChange('address', e.target.value)} className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50" placeholder="Calle, Nro, Piso, Ciudad..." />
                              </div>
                          </div>
                        </section>

                        {/* SECCIÓN 2: TUTOR */}
                        <section className="bg-slate-100 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-inner">
                          <h4 className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-6">
                            <Users2 size={16} /> Datos de Tutor / Responsable
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                              <div className="space-y-1.5">
                                  <label className="text-[10px] font-black text-slate-500 uppercase">Nombre Completo</label>
                                  <input type="text" disabled={!isEditing} value={player.tutor?.name} onChange={(e) => handleTutorChange('name', e.target.value)} className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold dark:text-white" />
                              </div>
                              <div className="space-y-1.5">
                                  <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5"><Smartphone size={12} /> Celular Tutor</label>
                                  <input type="text" disabled={!isEditing} value={player.tutor?.phone} onChange={(e) => handleTutorChange('phone', e.target.value)} className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold dark:text-white" />
                              </div>
                              <div className="space-y-1.5">
                                  <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5"><Mail size={12} /> Email Tutor</label>
                                  <input type="email" disabled={!isEditing} value={player.tutor?.email} onChange={(e) => handleTutorChange('email', e.target.value)} className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold dark:text-white" />
                              </div>
                          </div>
                        </section>

                        {/* SECCIÓN 3: JERARQUÍA */}
                        <section>
                          <h4 className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-6 border-b border-slate-200 dark:border-white/10 pb-3">
                            <Shield size={16} /> Jerarquía y Plantel
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                              <div className="space-y-1.5">
                                  <label className="text-[10px] font-black text-slate-500 uppercase">Nombre Deportivo</label>
                                  <input type="text" disabled={!isEditing} value={player.name} onChange={(e) => handleInfoChange('name', e.target.value)} className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold dark:text-white" />
                              </div>
                              <div className="space-y-1.5">
                                  <label className="text-[10px] font-black text-slate-500 uppercase">Posición en Campo</label>
                                  <select disabled={!isEditing} value={player.position} onChange={(e) => handleInfoChange('position', e.target.value)} className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-black dark:text-white outline-none">
                                      {Object.values(Position).map(pos => <option key={pos} value={pos}>{pos}</option>)}
                                  </select>
                              </div>
                              <div className="space-y-1.5">
                                  <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5"><Hash size={12}/> Camiseta #</label>
                                  <input type="number" disabled={!isEditing} value={player.number} onChange={(e) => handleInfoChange('number', parseInt(e.target.value))} className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-black dark:text-white font-mono" />
                              </div>
                              <div className="space-y-1.5">
                                  <label className="text-[10px] font-black text-slate-500 uppercase">Categoría</label>
                                  <select disabled={!isEditing} value={player.category} onChange={(e) => handleInfoChange('category', e.target.value)} className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-black dark:text-white">
                                      <option value="Primera">Primera</option>
                                      <option value="Reserva">Reserva</option>
                                      <option value="Sub-20">Sub-20</option>
                                      <option value="Escuela">Escuela</option>
                                  </select>
                              </div>
                              <div className="space-y-1.5">
                                  <label className="text-[10px] font-black text-slate-500 uppercase">División</label>
                                  <select disabled={!isEditing} value={player.division} onChange={(e) => handleInfoChange('division', e.target.value)} className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-black dark:text-white">
                                      <option value="Masculino">Masculino</option>
                                      <option value="Femenino">Femenino</option>
                                      <option value="Mixto">Mixto</option>
                                  </select>
                              </div>
                              <div className="space-y-1.5">
                                  <label className="text-[10px] font-black text-slate-500 uppercase">Estado Competencia</label>
                                  <select disabled={!isEditing} value={player.status} onChange={(e) => handleInfoChange('status', e.target.value)} className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-black dark:text-white">
                                      <option value="Active">Habilitado</option>
                                      <option value="Injured">Baja Médica</option>
                                      <option value="Suspended">Sancionado</option>
                                  </select>
                              </div>
                          </div>
                        </section>
                    </div>
                )}

                {activeTab === 'medical' && (
                    <div className="space-y-8 animate-fade-in pb-16">
                        <div className={`p-8 rounded-[2.5rem] border-2 shadow-xl ${player.medical?.isFit ? 'bg-emerald-50/50 border-emerald-500/20 dark:bg-emerald-500/5 dark:border-emerald-500/20' : 'bg-red-50/50 border-red-500/20 dark:bg-red-500/5 dark:border-red-500/20'}`}>
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className={`p-6 rounded-[2rem] ${player.medical?.isFit ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-red-500 text-white shadow-lg shadow-red-500/30'}`}>
                                    {player.medical?.isFit ? <FileHeart size={48} /> : <AlertTriangle size={48} />}
                                </div>
                                <div className="text-center sm:text-left">
                                    <h4 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{player.medical?.isFit ? 'Apto Físico Vigente' : 'Pendiente / Inhabilitado'}</h4>
                                    <p className="text-sm font-bold text-slate-500">Vencimiento certificado: <span className="text-primary-500">{player.medical?.expiryDate || 'Sin Registro'}</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Dictamen</label>
                                <select disabled={!isEditing} value={player.medical?.isFit ? 'true' : 'false'} onChange={(e) => handleMedicalChange('isFit', e.target.value === 'true')} className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-black dark:text-white outline-none">
                                    <option value="true">APTO FÍSICO</option>
                                    <option value="false">NO APTO / PENDIENTE</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Fecha Expiración</label>
                                <input type="date" disabled={!isEditing} value={player.medical?.expiryDate} onChange={(e) => handleMedicalChange('expiryDate', e.target.value)} className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-black dark:text-white outline-none" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase">Observaciones y Antecedentes</label>
                            <textarea disabled={!isEditing} rows={6} value={player.medical?.notes} onChange={(e) => handleMedicalChange('notes', e.target.value)} className="w-full p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2rem] text-sm font-medium dark:text-white outline-none focus:ring-4 focus:ring-primary-500/10 transition-all resize-none shadow-inner" placeholder="Escriba aquí alergias, lesiones previas o recomendaciones médicas..." />
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
