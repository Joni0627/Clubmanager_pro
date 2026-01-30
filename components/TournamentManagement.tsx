
import React, { useState, useEffect, useMemo } from 'react';
import { Tournament, Match, Player, Category, Discipline, ClubConfig, TournamentParticipant, Member } from '../types';
import { 
  Trophy, Plus, Calendar, Trash2, X, ChevronRight, Edit3, 
  Activity, Users, Loader2, Info, CheckCircle2,
  ListOrdered, LayoutGrid, UserPlus, Search, Layout, UserCircle, 
  GitBranch, ArrowRight, Table as TableIcon, Award, ChevronLeft, 
  Settings2, Flag, Shield, UserCheck, Timer, AlertCircle,
  // Fix: Added BadgeCheck to imports
  BadgeCheck
} from 'lucide-react';
import { db } from '../lib/supabase';

interface TournamentManagementProps {
  discipline: Discipline;
  category: Category | null;
  gender: 'Masculino' | 'Femenino';
  players: Player[];
  clubConfig: ClubConfig;
}

const TournamentManagement: React.FC<TournamentManagementProps> = ({ discipline, category, gender, clubConfig }) => {
  // --- Estados de Datos ---
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  
  // --- Estados de UI ---
  const [isLoading, setIsLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [viewMode, setViewMode] = useState<'fixture' | 'groups' | 'bracket' | 'participants'>('fixture');
  const [showMatchModal, setShowMatchModal] = useState(false);

  // --- Estados de Formulario Wizard ---
  const [tForm, setTForm] = useState<Partial<Tournament>>({
    name: '', type: 'Professional', settings: { hasGroups: false, groupsCount: 1, advancingPerGroup: 2, hasPlayoffs: false, playoffStart: 'F' }
  });
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [participantSearch, setParticipantSearch] = useState('');

  // Fix: Added missing matchForm state for results entry
  const [matchForm, setMatchForm] = useState({
    home_participant_id: '',
    away_participant_id: '',
    rivalName: '',
    myScore: 0,
    rivalScore: 0,
    date: new Date().toISOString().split('T')[0],
    stage: 'Fase Regular'
  });

  // --- Carga Inicial con Filtrado Robusto ---
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tourRes, memRes] = await Promise.all([
        db.tournaments.getAll(),
        db.members.getAll()
      ]);
      
      if (tourRes.data) {
        // FILTRADO ROBUSTO: Priorizamos ID, luego Nombre si el ID cambió por recreación de config
        const filtered = tourRes.data.filter((t: any) => {
          const tournamentDiscId = t.disciplineId || t.discipline_id;
          const tournamentCatId = t.categoryId || t.category_id;
          
          const discMatch = tournamentDiscId === discipline.id || t.discipline_name === discipline.name;
          const catMatch = !category || (tournamentCatId === category.id || t.category_name === category.name);
          const genderMatch = !gender || (t.gender === gender);
          
          return discMatch && catMatch && genderMatch;
        });
        
        setTournaments(filtered);
        if (filtered.length > 0 && !activeTournament) setActiveTournament(filtered[0]);
      }
      if (memRes.data) setAllMembers(memRes.data);
    } catch (e) { console.error("Error cargando torneos:", e); }
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, [category, gender, discipline.id]);

  useEffect(() => {
    if (activeTournament) {
      db.matches.getAll(activeTournament.id).then(res => res.data && setMatches(res.data));
      db.participants.getAll(activeTournament.id).then(res => res.data && setParticipants(res.data));
    }
  }, [activeTournament]);

  // --- Guardado Completo (Torneo + Participantes) ---
  const handleFinalizeTournament = async () => {
    if (!tForm.name || !category) return;
    setIsLoading(true);
    try {
      const tournamentId = crypto.randomUUID();
      
      // 1. Guardar Torneo
      const newTournament: any = {
        id: tournamentId,
        name: tForm.name.toUpperCase(),
        type: tForm.type,
        disciplineId: discipline.id,
        categoryId: category.id,
        gender: gender,
        status: 'Open',
        settings: tForm.settings,
        created_at: new Date().toISOString()
      };
      await db.tournaments.upsert(newTournament);

      // 2. Guardar Participantes (si es interno y hay seleccionados)
      if (tForm.type === 'Internal' && selectedMembers.length > 0) {
        // Por simplicidad, creamos un participante por cada miembro seleccionado o un grupo
        // Aquí los guardamos individualmente como participantes del torneo
        const promises = selectedMembers.map(mid => {
          const member = allMembers.find(m => m.id === mid);
          return db.participants.upsert({
            id: crypto.randomUUID(),
            tournamentid: tournamentId,
            name: member?.name.toUpperCase() || 'JUGADOR',
            memberids: [mid]
          });
        });
        await Promise.all(promises);
      }

      await loadData();
      setShowWizard(false);
      setWizardStep(1);
      setTForm({ name: '', type: 'Professional', settings: { hasGroups: false, groupsCount: 1, advancingPerGroup: 2, hasPlayoffs: false, playoffStart: 'F' } });
      setSelectedMembers([]);
    } catch (e) { console.error("Error finalizando torneo:", e); }
    setIsLoading(false);
  };

  // --- Componentes de UI Internos ---
  const StepIndicator = () => (
    <div className="flex justify-between items-center mb-12 px-10 relative">
      <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-slate-100 dark:bg-white/5 -translate-y-1/2 -z-10"></div>
      {[1, 2, 3, 4].map(step => (
        <div key={step} className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all border-4 ${wizardStep >= step ? 'bg-primary-600 border-primary-100 dark:border-slate-800 text-white scale-110 shadow-xl' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5 text-slate-400'}`}>
          {wizardStep > step ? <CheckCircle2 size={16} /> : step}
        </div>
      ))}
    </div>
  );

  const inputClasses = "w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-sm outline-none border border-transparent dark:border-white/5 focus:border-primary-600 shadow-inner dark:text-white transition-all";
  const labelClasses = "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3 mb-2 block";

  if (!category) return null;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic flex items-center gap-4">
             <Trophy size={40} className="text-primary-600" />
             Competiciones
          </h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-1 ml-1">Ecosistema Plegma Sport</p>
        </div>
        <button 
          onClick={() => { setWizardStep(1); setShowWizard(true); }}
          className="bg-primary-600 text-white px-10 py-5 rounded-3xl font-black uppercase text-[11px] tracking-widest shadow-2xl shadow-primary-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          <Plus size={18} strokeWidth={3} /> Configurar Torneo
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar de Torneos */}
        <aside className="w-full lg:w-80 shrink-0 space-y-6">
          <div className="bg-white dark:bg-[#0f1219]/60 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-3">
               <Layout size={14} className="text-primary-600" /> Torneos Activos
             </h4>
             <div className="space-y-3">
                {tournaments.map(t => (
                  <button 
                    key={t.id}
                    onClick={() => { setActiveTournament(t); setViewMode('fixture'); }}
                    className={`w-full p-5 rounded-3xl flex flex-col items-start transition-all relative border-2 ${activeTournament?.id === t.id ? 'bg-primary-600 border-primary-600 text-white shadow-xl scale-[1.02]' : 'bg-transparent border-slate-100 dark:border-white/5 text-slate-500 hover:bg-slate-50'}`}
                  >
                    <span className="text-xs font-black uppercase tracking-tight italic truncate w-full text-left">{t.name}</span>
                    <span className={`text-[8px] font-black uppercase tracking-widest mt-2 ${activeTournament?.id === t.id ? 'text-white/60' : 'text-primary-600'}`}>{t.type === 'Professional' ? 'Liga Clubes' : 'Torneo Interno'}</span>
                  </button>
                ))}
                {tournaments.length === 0 && !isLoading && (
                  <div className="text-center py-10 opacity-40">
                    <Trophy size={32} className="mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Sin torneos</p>
                  </div>
                )}
             </div>
          </div>
          
          {activeTournament && (
            <div className="bg-white dark:bg-[#0f1219]/60 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-3">
                  <Settings2 size={14} className="text-primary-600" /> Gestión
                </h4>
                <div className="space-y-2">
                    {[
                      { id: 'fixture', label: 'Fixture / Resultados', icon: Calendar },
                      { id: 'groups', label: 'Tablas de Grupos', icon: ListOrdered, show: activeTournament.settings.hasGroups },
                      { id: 'bracket', label: 'Llaves Playoff', icon: GitBranch, show: activeTournament.settings.hasPlayoffs },
                      { id: 'participants', label: 'Participantes', icon: Users, show: true }
                    ].map(item => (item.show !== false) && (
                      <button key={item.id} onClick={() => setViewMode(item.id as any)} className={`w-full p-4 rounded-2xl flex items-center gap-4 text-[11px] font-black uppercase transition-all ${viewMode === item.id ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}>
                        <item.icon size={16} /> {item.label}
                      </button>
                    ))}
                </div>
            </div>
          )}
        </aside>

        {/* Área de Contenido Principal */}
        <div className="flex-1 min-w-0">
           {activeTournament ? (
             <div className="space-y-8 animate-fade-in">
                {viewMode === 'fixture' && (
                   <>
                     <div className="bg-white dark:bg-[#0f1219]/40 p-10 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
                        <div>
                          <span className="px-4 py-1.5 bg-primary-600 text-white text-[9px] font-black rounded-full uppercase tracking-widest">{activeTournament.name}</span>
                          <h3 className="text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic mt-3">Fixture y Resultados</h3>
                        </div>
                        <button 
                          onClick={() => setShowMatchModal(true)}
                          className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-10 py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-2xl flex items-center gap-3"
                        >
                          <Plus size={18} /> Cargar Partido
                        </button>
                     </div>

                     <div className="grid grid-cols-1 gap-4">
                        {matches.map(m => (
                          <div key={m.id} className="bg-white dark:bg-[#0f1219]/60 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 flex items-center justify-between gap-10 group hover:border-primary-600/30 transition-all">
                              <div className="flex-1 text-right">
                                 <p className="text-lg font-black uppercase italic text-slate-800 dark:text-white">{m.homeTeam}</p>
                                 <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Local</p>
                              </div>
                              <div className="flex flex-col items-center gap-2">
                                 <div className="bg-slate-100 dark:bg-white/5 px-6 py-3 rounded-2xl flex items-center gap-5 text-2xl font-black italic shadow-inner">
                                    <span className={m.status === 'Finished' ? 'text-primary-600' : 'text-slate-300'}>{m.status === 'Finished' ? m.homeScore : '-'}</span>
                                    <span className="text-[10px] text-slate-400 not-italic uppercase tracking-widest">VS</span>
                                    <span className={m.status === 'Finished' ? 'text-primary-600' : 'text-slate-300'}>{m.status === 'Finished' ? m.awayScore : '-'}</span>
                                 </div>
                                 <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    <Calendar size={12} /> {m.date}
                                 </div>
                              </div>
                              <div className="flex-1 text-left">
                                 <p className="text-lg font-black uppercase italic text-slate-800 dark:text-white">{m.awayTeam}</p>
                                 <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Visitante</p>
                              </div>
                          </div>
                        ))}
                        {matches.length === 0 && (
                          <div className="py-20 text-center opacity-30 border-2 border-dashed border-slate-200 rounded-[3rem]">
                            <Timer size={48} className="mx-auto mb-4" />
                            <p className="text-xs font-black uppercase tracking-widest">Aún no hay partidos registrados</p>
                          </div>
                        )}
                     </div>
                   </>
                )}

                {viewMode === 'participants' && (
                  <div className="space-y-8">
                    <div className="bg-white dark:bg-[#0f1219]/40 p-10 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-sm">
                        <h3 className="text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Participantes Inscritos</h3>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 italic">Lista oficial de la competencia</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {participants.map(p => (
                         <div key={p.id} className="bg-white dark:bg-[#0f1219] p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm hover:border-primary-600/30 transition-all">
                            <div className="flex items-center gap-4 mb-6">
                               <div className="w-12 h-12 rounded-2xl bg-primary-600/10 flex items-center justify-center text-primary-600">
                                  <UserCheck size={24} />
                               </div>
                               <h4 className="text-lg font-black uppercase italic tracking-tighter text-slate-800 dark:text-white">{p.name}</h4>
                            </div>
                            <div className="space-y-2">
                               {(p.memberids || []).map(mid => {
                                 const m = allMembers.find(mem => mem.id === mid);
                                 return (
                                   <div key={mid} className="text-[10px] font-bold uppercase text-slate-500 bg-slate-50 dark:bg-white/5 p-3 rounded-xl flex items-center gap-3">
                                      <UserCircle size={14} className="text-primary-600" /> {m?.name || 'Cargando...'}
                                   </div>
                                 );
                               })}
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                )}
             </div>
           ) : (
             <div className="py-32 text-center bg-white dark:bg-[#0f1219]/30 rounded-[4rem] border-4 border-dashed border-slate-200 dark:border-white/5 flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-300 dark:text-white/10 mb-8">
                  <Trophy size={48} />
                </div>
                <h3 className="text-2xl font-black uppercase text-slate-300 italic tracking-widest">Selecciona un Torneo para comenzar</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Usa el panel lateral o crea uno nuevo</p>
             </div>
           )}
        </div>
      </div>

      {/* --- WIZARD: NUEVO TORNEO (PASO A PASO) --- */}
      {showWizard && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-[600] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0f121a] w-full max-w-3xl max-h-[90vh] rounded-[3.5rem] shadow-2xl border border-white/5 overflow-hidden flex flex-col">
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-xl shadow-primary-600/20"><Plus size={24} /></div>
                  <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter dark:text-white">Configuración del Torneo</h3>
                    <p className="text-[9px] font-black uppercase tracking-widest text-primary-600">Paso {wizardStep} de 4</p>
                  </div>
               </div>
               <button onClick={() => setShowWizard(false)} className="p-3 bg-white dark:bg-slate-700/50 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm"><X size={20} /></button>
            </div>
            
            <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
               <StepIndicator />

               {/* PASO 1: Identidad */}
               {wizardStep === 1 && (
                 <div className="space-y-8 animate-fade-in">
                    <div className="bg-primary-600/10 p-6 rounded-3xl border-l-4 border-primary-600 flex items-start gap-4">
                       <Info size={20} className="text-primary-600 shrink-0 mt-1" />
                       <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                         Define el nombre y el alcance. Los torneos **Internos** son ideales para competencias entre socios del club. Los torneos de **Liga** son contra rivales externos.
                       </p>
                    </div>
                    <div className="space-y-4">
                       <label className={labelClasses}>Nombre de la Competición</label>
                       <input 
                         value={tForm.name} 
                         onChange={e => setTForm({...tForm, name: e.target.value.toUpperCase()})} 
                         placeholder="EJ: TORNEO CLAUSURA 2026" 
                         className={inputClasses} 
                       />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <button 
                        onClick={() => setTForm({...tForm, type: 'Internal'})} 
                        className={`p-8 rounded-[2.5rem] border-4 flex flex-col items-center gap-4 transition-all ${tForm.type === 'Internal' ? 'border-primary-600 bg-primary-600/5' : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 opacity-50'}`}
                       >
                          <Users size={32} className="text-primary-600" />
                          <div className="text-center">
                            <span className="text-sm font-black uppercase italic block dark:text-white">Interno / Club</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Socios contra Socios</span>
                          </div>
                       </button>
                       <button 
                        onClick={() => setTForm({...tForm, type: 'Professional'})} 
                        className={`p-8 rounded-[2.5rem] border-4 flex flex-col items-center gap-4 transition-all ${tForm.type === 'Professional' ? 'border-primary-600 bg-primary-600/5' : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 opacity-50'}`}
                       >
                          <Shield size={32} className="text-primary-600" />
                          <div className="text-center">
                            <span className="text-sm font-black uppercase italic block dark:text-white">Liga Profesional</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Contra Clubes Rivales</span>
                          </div>
                       </button>
                    </div>
                 </div>
               )}

               {/* PASO 2: Formato */}
               {wizardStep === 2 && (
                 <div className="space-y-8 animate-fade-in">
                    <div className="bg-primary-600/10 p-6 rounded-3xl border-l-4 border-primary-600 flex items-start gap-4">
                       <LayoutGrid size={20} className="text-primary-600 shrink-0 mt-1" />
                       <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                         Elige cómo se jugará. Puedes habilitar una fase de grupos inicial y luego una fase eliminatoria (playoffs) para definir al campeón.
                       </p>
                    </div>
                    <div className="space-y-4">
                       <div 
                        onClick={() => setTForm({...tForm, settings: {...tForm.settings!, hasGroups: !tForm.settings?.hasGroups}})}
                        className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all cursor-pointer ${tForm.settings?.hasGroups ? 'border-primary-600 bg-primary-600/5' : 'border-slate-100 dark:border-white/5'}`}
                       >
                          <div className="flex items-center gap-6">
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tForm.settings?.hasGroups ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}><TableIcon size={20}/></div>
                             <div>
                                <p className="text-sm font-black uppercase italic dark:text-white">Fase de Grupos</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ligas todos contra todos</p>
                             </div>
                          </div>
                          <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center ${tForm.settings?.hasGroups ? 'bg-primary-600 border-primary-600 text-white' : 'border-slate-200'}`}>{tForm.settings?.hasGroups && <CheckCircle2 size={16} />}</div>
                       </div>
                       <div 
                        onClick={() => setTForm({...tForm, settings: {...tForm.settings!, hasPlayoffs: !tForm.settings?.hasPlayoffs}})}
                        className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all cursor-pointer ${tForm.settings?.hasPlayoffs ? 'border-primary-600 bg-primary-600/5' : 'border-slate-100 dark:border-white/5'}`}
                       >
                          <div className="flex items-center gap-6">
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tForm.settings?.hasPlayoffs ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}><GitBranch size={20}/></div>
                             <div>
                                <p className="text-sm font-black uppercase italic dark:text-white">Playoffs / Eliminación Directa</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Llaves de muerte súbita</p>
                             </div>
                          </div>
                          <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center ${tForm.settings?.hasPlayoffs ? 'bg-primary-600 border-primary-600 text-white' : 'border-slate-200'}`}>{tForm.settings?.hasPlayoffs && <CheckCircle2 size={16} />}</div>
                       </div>
                    </div>
                 </div>
               )}

               {/* PASO 3: Participantes */}
               {wizardStep === 3 && (
                 <div className="space-y-8 animate-fade-in">
                    {tForm.type === 'Internal' ? (
                      <>
                        <div className="bg-primary-600/10 p-6 rounded-3xl border-l-4 border-primary-600 flex items-start gap-4">
                           <UserPlus size={20} className="text-primary-600 shrink-0 mt-1" />
                           <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                             Selecciona a los socios que participarán en este torneo local. Se crearán como participantes individuales automáticamente.
                           </p>
                        </div>
                        <div className="space-y-4">
                           <div className="relative group">
                              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                              <input 
                                value={participantSearch} 
                                onChange={e => setParticipantSearch(e.target.value)} 
                                placeholder="BUSCAR SOCIO POR NOMBRE..." 
                                className={inputClasses + " pl-14"} 
                              />
                           </div>
                           <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                              {allMembers.filter(m => m.name.toLowerCase().includes(participantSearch.toLowerCase())).slice(0, 10).map(m => {
                                 const isSelected = selectedMembers.includes(m.id);
                                 return (
                                   <button 
                                     key={m.id} 
                                     onClick={() => isSelected ? setSelectedMembers(selectedMembers.filter(id => id !== m.id)) : setSelectedMembers([...selectedMembers, m.id])}
                                     className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${isSelected ? 'bg-primary-600 border-primary-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-500'}`}
                                   >
                                      <div className="w-10 h-10 rounded-xl bg-white overflow-hidden shrink-0 border border-slate-100">
                                         <img src={m.photoUrl || 'https://via.placeholder.com/64'} className="w-full h-full object-cover" />
                                      </div>
                                      <span className="text-[10px] font-black uppercase tracking-tight truncate flex-1 text-left">{m.name}</span>
                                      {isSelected && <CheckCircle2 size={12} />}
                                   </button>
                                 );
                              })}
                           </div>
                        </div>
                      </>
                    ) : (
                      <div className="py-20 text-center space-y-6 animate-fade-in">
                         <Flag size={64} className="mx-auto text-primary-600/30" />
                         <div className="max-w-xs mx-auto">
                            <h4 className="text-lg font-black uppercase italic dark:text-white">Modo Liga Clubes</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 leading-relaxed">En este modo, los rivales externos se cargan directamente al crear cada partido del fixture.</p>
                         </div>
                      </div>
                    )}
                 </div>
               )}

               {/* PASO 4: Resumen */}
               {wizardStep === 4 && (
                 <div className="space-y-8 animate-fade-in">
                    <h4 className="text-xs font-black uppercase italic text-primary-600 flex items-center gap-2">
                       <BadgeCheck size={16} /> Verificación de Parámetros
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-[2rem] border border-slate-100 dark:border-white/5">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Torneo</span>
                          <p className="text-xl font-black uppercase italic dark:text-white mt-1">{tForm.name}</p>
                       </div>
                       <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-[2rem] border border-slate-100 dark:border-white/5">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tipo</span>
                          <p className="text-xl font-black uppercase italic dark:text-white mt-1">{tForm.type === 'Internal' ? 'LOCAL' : 'PROFESIONAL'}</p>
                       </div>
                       <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-[2rem] border border-slate-100 dark:border-white/5">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Formato</span>
                          <p className="text-[10px] font-black uppercase italic dark:text-white mt-2">
                             {tForm.settings?.hasGroups && '✓ GRUPOS'} {tForm.settings?.hasPlayoffs && '✓ PLAYOFFS'}
                          </p>
                       </div>
                       <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-[2rem] border border-slate-100 dark:border-white/5">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inscritos</span>
                          <p className="text-xl font-black uppercase italic dark:text-white mt-1">{tForm.type === 'Internal' ? selectedMembers.length : 'N/A'}</p>
                       </div>
                    </div>
                    <div className="bg-amber-500/10 p-6 rounded-3xl border-l-4 border-amber-500 flex gap-4">
                       <AlertCircle size={24} className="text-amber-600 shrink-0" />
                       <p className="text-[9px] font-bold text-amber-700 dark:text-amber-500 uppercase leading-relaxed">Nota: Al confirmar, la estructura quedará sincronizada en la nube de Plegma Sport para toda la institución.</p>
                    </div>
                 </div>
               )}
            </div>

            <div className="p-10 border-t border-white/5 bg-slate-50/50 dark:bg-slate-800/40 flex justify-between shrink-0">
               <button 
                 onClick={() => setWizardStep(prev => Math.max(1, prev - 1))}
                 disabled={wizardStep === 1 || isLoading}
                 className="px-8 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5 transition-all flex items-center gap-3 disabled:opacity-0"
               >
                 <ChevronLeft size={18} /> Atrás
               </button>
               {wizardStep < 4 ? (
                 <button 
                   onClick={() => setWizardStep(prev => prev + 1)}
                   className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-12 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center gap-3"
                 >
                   Siguiente <ChevronRight size={18} />
                 </button>
               ) : (
                 <button 
                   onClick={handleFinalizeTournament}
                   disabled={isLoading}
                   className="bg-primary-600 text-white px-16 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
                 >
                   {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Award size={18} />}
                   Finalizar y Crear Torneo
                 </button>
               )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: CARGAR PARTIDO (CON RESULTADOS Y EVENTOS) --- */}
      {showMatchModal && activeTournament && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-[600] flex items-center justify-center p-4 animate-fade-in">
           <div className="bg-white dark:bg-[#0f121a] w-full max-w-2xl max-h-[90vh] rounded-[3rem] shadow-2xl border border-white/5 overflow-hidden flex flex-col">
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
                <h3 className="text-xl font-black uppercase italic tracking-tighter dark:text-white">Carga de Resultados</h3>
                <button onClick={() => setShowMatchModal(false)} className="p-3 bg-white dark:bg-slate-700/50 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm"><X size={20} /></button>
              </div>
              
              <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                 {/* Lógica de Selección de Equipos */}
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className={labelClasses}>Equipo Local</label>
                       {activeTournament.type === 'Internal' ? (
                          <select className={inputClasses} onChange={e => setMatchForm({...matchForm, home_participant_id: e.target.value})}>
                             <option value="">Seleccionar...</option>
                             {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                       ) : (
                          <input className={inputClasses} value={clubConfig.name} readOnly />
                       )}
                    </div>
                    <div className="space-y-2">
                       <label className={labelClasses}>Equipo Visitante</label>
                       {activeTournament.type === 'Internal' ? (
                          <select className={inputClasses} onChange={e => setMatchForm({...matchForm, away_participant_id: e.target.value})}>
                             <option value="">Seleccionar...</option>
                             {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                       ) : (
                          <input className={inputClasses} placeholder="Nombre del Rival" onChange={e => setMatchForm({...matchForm, rivalName: e.target.value.toUpperCase()})} />
                       )}
                    </div>
                 </div>

                 {/* Marcador Central */}
                 <div className="flex items-center justify-center gap-10 bg-slate-50 dark:bg-white/5 p-10 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-inner">
                    <div className="space-y-2 text-center">
                       <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Goles L</span>
                       <input type="number" value={matchForm.myScore} onChange={e => setMatchForm({...matchForm, myScore: parseInt(e.target.value) || 0})} className="w-20 text-center font-black text-4xl bg-white dark:bg-slate-800 rounded-2xl py-4 shadow-xl border-2 border-primary-600/30 dark:text-white" />
                    </div>
                    <div className="text-2xl font-black text-slate-300 italic">VS</div>
                    <div className="space-y-2 text-center">
                       <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Goles V</span>
                       <input type="number" value={matchForm.rivalScore} onChange={e => setMatchForm({...matchForm, rivalScore: parseInt(e.target.value) || 0})} className="w-20 text-center font-black text-4xl bg-white dark:bg-slate-800 rounded-2xl py-4 shadow-xl border-2 border-primary-600/30 dark:text-white" />
                    </div>
                 </div>

                 {/* Detalles Adicionales */}
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className={labelClasses}>Fecha del Match</label>
                       <input type="date" value={matchForm.date} onChange={e => setMatchForm({...matchForm, date: e.target.value})} className={inputClasses} />
                    </div>
                    <div className="space-y-2">
                       <label className={labelClasses}>Fase / Grupo</label>
                       <input value={matchForm.stage} onChange={e => setMatchForm({...matchForm, stage: e.target.value.toUpperCase()})} placeholder="Fase Regular" className={inputClasses} />
                    </div>
                 </div>

                 <div className="bg-primary-600/5 p-6 rounded-3xl border border-primary-600/10">
                    <p className="text-[9px] font-black uppercase text-primary-600 tracking-widest mb-2 flex items-center gap-2">
                       <Flag size={12} /> Gestión de Incidencias
                    </p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Añade expulsados, amonestados o goleadores específicos desde la pestaña de eventos del partido una vez guardado.</p>
                 </div>
              </div>

              <div className="p-8 border-t border-white/5 bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
                 <button 
                  onClick={async () => {
                    // Mismo handleSaveMatch que antes pero optimizado
                    let homeTeam = activeTournament.type === 'Internal' ? participants.find(p => p.id === matchForm.home_participant_id)?.name || 'Local' : clubConfig.name;
                    let awayTeam = activeTournament.type === 'Internal' ? participants.find(p => p.id === matchForm.away_participant_id)?.name || 'Visitante' : matchForm.rivalName;

                    try {
                      await db.matches.upsert({
                        id: crypto.randomUUID(),
                        tournamentId: activeTournament.id,
                        homeTeam,
                        awayTeam,
                        home_participant_id: matchForm.home_participant_id,
                        away_participant_id: matchForm.away_participant_id,
                        homeScore: matchForm.myScore,
                        awayScore: matchForm.rivalScore,
                        date: matchForm.date,
                        status: 'Finished',
                        stage: matchForm.stage
                      });
                      const res = await db.matches.getAll(activeTournament.id);
                      if (res.data) setMatches(res.data);
                      setShowMatchModal(false);
                    } catch (e) { console.error(e); }
                  }} 
                  className="w-full py-5 bg-primary-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
                 >
                   Guardar Resultado Final
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TournamentManagement;
