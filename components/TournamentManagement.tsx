
import React, { useState, useEffect, useMemo } from 'react';
import { Tournament, Match, Player, Category, Discipline, ClubConfig, TournamentParticipant, Member } from '../types';
import { 
  Trophy, Plus, Calendar, Trash2, X, ChevronRight, Edit3, 
  Activity, Users, Loader2, Info, CheckCircle2,
  ListOrdered, LayoutGrid, UserPlus, Search, Layout, UserCircle, 
  GitBranch, ArrowRight, Table as TableIcon, Award, ChevronLeft, 
  Settings2, Flag, Shield
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
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  
  const [memberSearch, setMemberSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showTournamentWizard, setShowTournamentWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [viewMode, setViewMode] = useState<'fixture' | 'groups' | 'bracket' | 'participants'>('fixture');

  // Form states
  const [tournamentForm, setTournamentForm] = useState<Partial<Tournament>>({
    name: '', type: 'Professional', settings: { hasGroups: false, groupsCount: 1, advancingPerGroup: 2, hasPlayoffs: false, playoffStart: 'F' }
  });
  const [participantForm, setParticipantForm] = useState<{name: string, members: string[]}>({ name: '', members: [] });
  const [matchForm, setMatchForm] = useState<any>({
    rivalName: '', condition: 'Local', date: new Date().toISOString().split('T')[0],
    status: 'Scheduled', myScore: 0, rivalScore: 0, group: 'A', stage: 'Fase Regular',
    home_participant_id: '', away_participant_id: ''
  });

  const loadBaseData = async () => {
    if (!category) return;
    setIsLoading(true);
    try {
      const [tourRes, memRes] = await Promise.all([
        db.tournaments.getAll(discipline.id),
        db.members.getAll()
      ]);
      if (tourRes.data) {
        // Usamos categoryId (CamelCase) para el filtrado, que es como están guardados en DB
        const filtered = tourRes.data.filter((t: any) => 
          (t.categoryId === category.id || t.category_id === category.id) && 
          t.gender === gender
        );
        setTournaments(filtered);
        if (filtered.length > 0 && !activeTournament) setActiveTournament(filtered[0]);
      }
      if (memRes.data) setAllMembers(memRes.data);
    } catch (e) { console.error("Error cargando base:", e); }
    setIsLoading(false);
  };

  useEffect(() => { loadBaseData(); }, [category, gender]);

  useEffect(() => {
    if (activeTournament) {
      db.matches.getAll(activeTournament.id).then(res => res.data && setMatches(res.data));
      db.participants.getAll(activeTournament.id).then(res => res.data && setParticipants(res.data));
    }
  }, [activeTournament]);

  const handleSaveTournament = async () => {
    if (!tournamentForm.name || !category) return;
    try {
      const newT: Tournament = {
        id: crypto.randomUUID(),
        name: tournamentForm.name,
        type: tournamentForm.type || 'Professional',
        disciplineId: discipline.id,
        categoryId: category.id,
        gender: gender,
        status: 'Open',
        settings: tournamentForm.settings as any,
        created_at: new Date().toISOString()
      };
      await db.tournaments.upsert(newT);
      loadBaseData();
      setShowTournamentWizard(false);
      setWizardStep(1);
    } catch (e) { console.error("Error torneo:", e); }
  };

  const handleSaveParticipant = async () => {
    if (!activeTournament) return;

    if (!participantForm.name || participantForm.name.trim() === '') {
      alert("⚠️ El nombre del Equipo / Pareja es obligatorio.");
      return;
    }
    if (participantForm.members.length === 0) {
      alert("⚠️ Debes seleccionar al menos un socio para inscribir.");
      return;
    }

    try {
      // Inscribir en la tabla de participantes (aquí sí usamos snake_case por ser tabla relacional limpia)
      const { error } = await db.participants.upsert({
        id: crypto.randomUUID(),
        tournament_id: activeTournament.id,
        name: participantForm.name.toUpperCase().trim(),
        member_ids: participantForm.members
      });

      if (error) {
        console.error("Error en Supabase:", error);
        alert("Error técnico: Asegúrese de que la tabla 'tournament_participants' tenga las columnas 'tournament_id' (uuid) y 'member_ids' (text[] o jsonb).");
        return;
      }

      const { data } = await db.participants.getAll(activeTournament.id);
      if (data) setParticipants(data);
      
      setShowParticipantModal(false);
      setParticipantForm({ name: '', members: [] });
      setMemberSearch('');
    } catch (e) { 
      console.error("Error fatal guardando participante:", e); 
    }
  };

  const handleSaveMatch = async () => {
    if (!activeTournament) return;
    let homeTeam = matchForm.condition === 'Local' ? clubConfig.name : matchForm.rivalName;
    let awayTeam = matchForm.condition === 'Local' ? matchForm.rivalName : clubConfig.name;
    
    if (activeTournament.type === 'Internal') {
      homeTeam = participants.find(p => p.id === matchForm.home_participant_id)?.name || 'Local';
      awayTeam = participants.find(p => p.id === matchForm.away_participant_id)?.name || 'Visitante';
    }

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
        status: matchForm.status,
        group: matchForm.group,
        stage: matchForm.stage
      });
      const matchesRes = await db.matches.getAll(activeTournament.id);
      if (matchesRes.data) setMatches(matchesRes.data);
      setShowMatchModal(false);
    } catch (e) { console.error("Error partido:", e); }
  };

  const inputClasses = "w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-sm outline-none border border-transparent dark:border-white/5 focus:border-primary-600 shadow-inner dark:text-white transition-all";
  const labelClasses = "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block";
  const bubbleClasses = "bg-white dark:bg-[#0f1219]/60 p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm";

  if (!category) return null;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic flex items-center gap-4">
             <Trophy size={32} className="text-primary-600" />
             Competiciones
          </h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[9px] mt-1 ml-1">Ecosistema Plegma Sport</p>
        </div>
        <button 
          onClick={() => { setTournamentForm({ name: '', type: 'Professional', settings: { hasGroups: false, groupsCount: 1, advancingPerGroup: 2, hasPlayoffs: false, playoffStart: 'F' } }); setWizardStep(1); setShowTournamentWizard(true); }}
          className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus size={16} strokeWidth={3} /> Nuevo Torneo
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-72 shrink-0 space-y-6">
          <div className={bubbleClasses}>
             <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
               <Layout size={12} className="text-primary-600" /> Torneos
             </h4>
             <div className="space-y-3">
                {tournaments.map(t => (
                  <button 
                    key={t.id}
                    onClick={() => { setActiveTournament(t); setViewMode('fixture'); }}
                    className={`w-full p-4 rounded-2xl flex flex-col items-start transition-all relative border-2 ${activeTournament?.id === t.id ? 'bg-primary-600/5 border-primary-600 text-slate-800 dark:text-white' : 'bg-transparent border-slate-100 dark:border-white/5 text-slate-500 hover:bg-slate-50'}`}
                  >
                    <span className="text-[11px] font-black uppercase tracking-tight italic truncate w-full text-left">{t.name}</span>
                    <span className="text-[7px] font-bold uppercase tracking-widest mt-1 text-primary-600/60">{t.type === 'Professional' ? 'Liga' : 'Local'}</span>
                  </button>
                ))}
                {tournaments.length === 0 && !isLoading && (
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center py-4 italic">Sin torneos cargados</p>
                )}
             </div>
          </div>
          
          {activeTournament && (
            <div className={bubbleClasses}>
                <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                  <Activity size={12} className="text-primary-600" /> Menú
                </h4>
                <div className="space-y-2">
                    {[
                      { id: 'fixture', label: 'Fixture', icon: Calendar },
                      { id: 'groups', label: 'Grupos', icon: ListOrdered, show: activeTournament.settings.hasGroups },
                      { id: 'bracket', label: 'Llaves', icon: GitBranch, show: activeTournament.settings.hasPlayoffs },
                      { id: 'participants', label: 'Socios', icon: Users, show: activeTournament.type === 'Internal' }
                    ].map(item => (item.show !== false) && (
                      <button key={item.id} onClick={() => setViewMode(item.id as any)} className={`w-full p-3.5 rounded-xl flex items-center gap-3 text-[10px] font-black uppercase transition-all ${viewMode === item.id ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
                        <item.icon size={16} /> {item.label}
                      </button>
                    ))}
                </div>
            </div>
          )}
        </aside>

        <div className="flex-1 min-w-0">
           {activeTournament ? (
             <div className="space-y-8 animate-fade-in">
                {viewMode === 'fixture' && (
                   <>
                     <div className="bg-white dark:bg-[#0f1219]/40 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                          <span className="px-3 py-1 bg-primary-600 text-white text-[8px] font-black rounded-full uppercase tracking-widest">{activeTournament.name}</span>
                          <h3 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic mt-2">Fixture de Temporada</h3>
                        </div>
                        <button 
                          onClick={() => setShowMatchModal(true)}
                          className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2"
                        >
                          <Plus size={16} /> Cargar Partido
                        </button>
                     </div>
                     <div className="grid grid-cols-1 gap-4">
                        {matches.map(m => (
                          <div key={m.id} className="bg-white dark:bg-[#0f1219]/60 p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 flex items-center justify-between gap-6 hover:border-primary-600/30 transition-all">
                              <div className="flex-1 text-right text-sm font-black uppercase italic text-slate-800 dark:text-white truncate">{m.homeTeam}</div>
                              <div className="flex flex-col items-center gap-1">
                                 <div className="bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-xl flex items-center gap-3 text-xl font-black italic">
                                    <span>{m.status === 'Finished' ? m.homeScore : '-'}</span>
                                    <span className="text-[10px] text-slate-400 not-italic">vs</span>
                                    <span>{m.status === 'Finished' ? m.awayScore : '-'}</span>
                                 </div>
                                 <span className="text-[8px] font-bold text-primary-600 uppercase tracking-widest">{m.date}</span>
                              </div>
                              <div className="flex-1 text-left text-sm font-black uppercase italic text-slate-800 dark:text-white truncate">{m.awayTeam}</div>
                          </div>
                        ))}
                     </div>
                   </>
                )}
                {viewMode === 'participants' && (
                  <div className="space-y-8">
                    <div className="bg-white dark:bg-[#0f1219]/40 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                        <h3 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Socios Inscriptos</h3>
                        <button onClick={() => setShowParticipantModal(true)} className="bg-primary-600 text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2">
                          <Plus size={16} /> Inscribir Socio/Equipo
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {participants.map(p => (
                         <div key={p.id} className="bg-white dark:bg-[#0f1219] p-5 rounded-[1.5rem] border border-slate-200 dark:border-white/5 shadow-sm">
                            <h4 className="text-sm font-black uppercase italic tracking-tighter text-primary-600 mb-4">{p.name}</h4>
                            <div className="space-y-1.5">
                               {(p.member_ids || []).map(mid => <div key={mid} className="text-[9px] font-bold uppercase text-slate-500 bg-slate-50 dark:bg-white/5 p-2 rounded-lg flex items-center gap-2"><UserCircle size={12} /> {allMembers.find(mem => mem.id === mid)?.name || 'Cargando...'}</div>)}
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                )}
             </div>
           ) : (
             <div className="py-20 text-center bg-white dark:bg-[#0f1219]/30 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/5 flex flex-col items-center">
                <Trophy size={60} className="text-slate-100 dark:text-white/5 mb-6" />
                <h3 className="text-xl font-black uppercase text-slate-300 italic">Selecciona un Torneo</h3>
             </div>
           )}
        </div>
      </div>

      {/* WIZARD: NUEVO TORNEO (GUÍA INTERNA) */}
      {showTournamentWizard && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[600] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0f121a] w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white text-xs font-black italic">{wizardStep}</div>
                  <h3 className="text-lg font-black uppercase italic tracking-tighter">Creador de Torneos Plegma</h3>
               </div>
               <button onClick={() => setShowTournamentWizard(false)} className="p-2 bg-slate-100 dark:bg-slate-700/50 rounded-full hover:bg-red-500 hover:text-white transition-all"><X size={16} /></button>
            </div>
            
            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
               <div className="flex justify-between mb-10 px-4 relative">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 dark:bg-white/5 -translate-y-1/2 -z-10"></div>
                  {[1, 2, 3, 4].map(s => (
                    <div key={s} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${wizardStep >= s ? 'bg-primary-600 text-white scale-110 shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>{s}</div>
                  ))}
               </div>

               {wizardStep === 1 && (
                 <div className="space-y-6 animate-fade-in">
                    <div className="bg-primary-600/10 p-4 rounded-xl border-l-4 border-primary-600">
                       <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest leading-relaxed">
                         Paso 1: Identifica tu torneo. Los torneos locales permiten inscribir a tus propios socios, mientras que los profesionales son contra otros clubes.
                       </p>
                    </div>
                    <div className="space-y-4">
                       <label className={labelClasses}>Nombre de la Competición</label>
                       <input value={tournamentForm.name} onChange={e => setTournamentForm({...tournamentForm, name: e.target.value.toUpperCase()})} placeholder="EJ: CLAUSURA INTERCLUB 2026" className={inputClasses} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <button onClick={() => setTournamentForm({...tournamentForm, type: 'Internal'})} className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${tournamentForm.type === 'Internal' ? 'border-primary-600 bg-primary-600/5' : 'border-transparent bg-slate-50 dark:bg-white/5 opacity-50'}`}>
                          <Users size={24} className="text-primary-600" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Torneo Local / Socios</span>
                       </button>
                       <button onClick={() => setTournamentForm({...tournamentForm, type: 'Professional'})} className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${tournamentForm.type === 'Professional' ? 'border-primary-600 bg-primary-600/5' : 'border-transparent bg-slate-50 dark:bg-white/5 opacity-50'}`}>
                          <Shield size={24} className="text-primary-600" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Liga Profesional / Clubes</span>
                       </button>
                    </div>
                 </div>
               )}

               {wizardStep === 2 && (
                 <div className="space-y-6 animate-fade-in">
                    <div className="bg-primary-600/10 p-4 rounded-xl border-l-4 border-primary-600">
                       <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest leading-relaxed">
                         Paso 2: Define el formato. ¿Habrá grupos clasificatorios o eliminación directa desde el inicio?
                       </p>
                    </div>
                    <div className="space-y-6">
                       <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 rounded-2xl">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white"><TableIcon size={18}/></div>
                             <div>
                                <p className="text-xs font-black uppercase italic dark:text-white">Fase de Grupos</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Todos contra todos por puntos</p>
                             </div>
                          </div>
                          <input type="checkbox" checked={tournamentForm.settings?.hasGroups} onChange={e => setTournamentForm({...tournamentForm, settings: {...tournamentForm.settings!, hasGroups: e.target.checked}})} className="w-6 h-6 rounded accent-primary-600" />
                       </div>
                       <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 rounded-2xl">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white"><GitBranch size={18}/></div>
                             <div>
                                <p className="text-xs font-black uppercase italic dark:text-white">Playoffs / Eliminatorias</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Cruces directos para definir campeón</p>
                             </div>
                          </div>
                          <input type="checkbox" checked={tournamentForm.settings?.hasPlayoffs} onChange={e => setTournamentForm({...tournamentForm, settings: {...tournamentForm.settings!, hasPlayoffs: e.target.checked}})} className="w-6 h-6 rounded accent-primary-600" />
                       </div>
                    </div>
                 </div>
               )}

               {wizardStep === 3 && (
                 <div className="space-y-6 animate-fade-in">
                    <div className="bg-primary-600/10 p-4 rounded-xl border-l-4 border-primary-600">
                       <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest leading-relaxed">
                         Paso 3: Si es un torneo local, podrás inscribir a tus socios después de crear el torneo. En el modo Liga, cargarás los rivales en cada partido.
                       </p>
                    </div>
                    <div className="py-10 text-center flex flex-col items-center">
                       <Award size={40} className="text-primary-600 mb-4 animate-bounce" />
                       <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Estructura Lista para Sincronizar</p>
                    </div>
                 </div>
               )}

               {wizardStep === 4 && (
                 <div className="space-y-6 animate-fade-in">
                    <h4 className="text-xs font-black uppercase italic text-primary-600 mb-6">Resumen de Configuración</h4>
                    <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-6 space-y-4">
                       <div className="flex justify-between items-center"><span className="text-[9px] font-bold text-slate-400 uppercase">Torneo:</span> <span className="text-[11px] font-black uppercase dark:text-white">{tournamentForm.name}</span></div>
                       <div className="flex justify-between items-center"><span className="text-[9px] font-bold text-slate-400 uppercase">Modalidad:</span> <span className="text-[11px] font-black uppercase dark:text-white">{tournamentForm.type === 'Internal' ? 'Local' : 'Profesional'}</span></div>
                       <div className="flex justify-between items-center"><span className="text-[9px] font-bold text-slate-400 uppercase">Formato:</span> <span className="text-[11px] font-black uppercase dark:text-white">{tournamentForm.settings?.hasGroups ? 'GRUPOS' : ''} {tournamentForm.settings?.hasPlayoffs ? '+ LLAVES' : ''}</span></div>
                    </div>
                    <div className="bg-amber-500/10 p-4 rounded-xl border-l-4 border-amber-500 flex gap-3">
                       <Info size={16} className="text-amber-600 shrink-0" />
                       <p className="text-[8px] font-bold text-amber-700 dark:text-amber-500 uppercase leading-relaxed">Nota: Una vez creado, podrás ir a la pestaña "Inscriptos" para dar de alta a los socios participantes.</p>
                    </div>
                 </div>
               )}
            </div>

            <div className="p-6 border-t border-white/5 bg-slate-50/50 dark:bg-slate-800/40 flex justify-between shrink-0">
               <button 
                 onClick={() => setWizardStep(prev => Math.max(1, prev - 1))}
                 disabled={wizardStep === 1}
                 className="px-6 py-4 rounded-xl font-black uppercase text-[10px] text-slate-400 disabled:opacity-0 transition-all flex items-center gap-2"
               >
                 <ChevronLeft size={16} /> Atrás
               </button>
               {wizardStep < 4 ? (
                 <button 
                   onClick={() => setWizardStep(prev => prev + 1)}
                   className="bg-primary-600 text-white px-10 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center gap-2"
                 >
                   Siguiente <ChevronRight size={16} />
                 </button>
               ) : (
                 <button 
                   onClick={handleSaveTournament}
                   className="bg-emerald-600 text-white px-10 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center gap-2"
                 >
                   <CheckCircle2 size={16} /> Finalizar Configuración
                 </button>
               )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INSCRIBIR SOCIO/EQUIPO */}
      {showParticipantModal && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[600] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0f121a] w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
              <h3 className="text-lg font-black uppercase italic tracking-tighter">Inscribir Participante</h3>
              <button onClick={() => setShowParticipantModal(false)} className="p-2 bg-slate-100 dark:bg-slate-700/50 rounded-full hover:bg-red-500 hover:text-white transition-all"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
               <div className="space-y-2">
                  <label className={labelClasses}>Nombre del Equipo / Pareja <span className="text-red-500">*</span></label>
                  <input 
                    value={participantForm.name} 
                    onChange={e => setParticipantForm({...participantForm, name: e.target.value.toUpperCase()})} 
                    placeholder="EJ: LOS GALÁCTICOS" 
                    className={inputClasses} 
                  />
                  {!participantForm.name && <p className="text-[7px] text-red-400 font-bold uppercase tracking-widest ml-2 italic">Campo obligatorio</p>}
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between items-end mb-2">
                    <label className={labelClasses}>Seleccionar Socios ({participantForm.members.length}) <span className="text-red-500">*</span></label>
                    {participantForm.members.length === 0 && <p className="text-[7px] text-red-400 font-bold uppercase tracking-widest italic mb-1">Seleccione al menos uno</p>}
                  </div>
                  <div className="relative mb-4">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                     <input value={memberSearch} onChange={e => setMemberSearch(e.target.value)} placeholder="BUSCAR POR NOMBRE..." className={inputClasses + " pl-10 py-2.5"} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                     {allMembers.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase())).slice(0, 20).map(m => {
                        const isSelected = participantForm.members.includes(m.id);
                        return (
                          <button key={m.id} onClick={() => { const newMems = isSelected ? participantForm.members.filter(id => id !== m.id) : [...participantForm.members, m.id]; setParticipantForm({...participantForm, members: newMems}); }} className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${isSelected ? 'bg-primary-600 border-primary-600 text-white' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-400'}`}>
                            <UserCircle size={16} />
                            <span className="text-[10px] font-black uppercase tracking-tight truncate flex-1 text-left">{m.name}</span>
                            {isSelected && <CheckCircle2 size={12} />}
                          </button>
                        );
                     })}
                  </div>
               </div>
            </div>
            <div className="p-6 border-t border-white/5 bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
               <button 
                onClick={handleSaveParticipant} 
                className="w-full py-4 bg-primary-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:scale-[1.02] transition-all disabled:grayscale disabled:opacity-50"
               >
                 Confirmar Registro
               </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CARGAR RESULTADO */}
      {showMatchModal && activeTournament && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[600] flex items-center justify-center p-4 animate-fade-in">
           <div className="bg-white dark:bg-[#0f121a] w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
                <h3 className="text-lg font-black uppercase italic tracking-tighter">Resultado del Match</h3>
                <button onClick={() => setShowMatchModal(false)} className="p-2 bg-slate-100 dark:bg-slate-700/50 rounded-full hover:bg-red-500 hover:text-white transition-all"><X size={16} /></button>
              </div>
              <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                 {activeTournament.type === 'Internal' ? (
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className={labelClasses}>Local</label>
                         <select value={matchForm.home_participant_id} onChange={e => setMatchForm({...matchForm, home_participant_id: e.target.value})} className={inputClasses}>
                            <option value="">Seleccionar...</option>
                            {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className={labelClasses}>Visitante</label>
                         <select value={matchForm.away_participant_id} onChange={e => setMatchForm({...matchForm, away_participant_id: e.target.value})} className={inputClasses}>
                            <option value="">Seleccionar...</option>
                            {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                         </select>
                      </div>
                   </div>
                 ) : (
                    <div className="space-y-2">
                       <label className={labelClasses}>Nombre del Rival</label>
                       <input value={matchForm.rivalName} onChange={e => setMatchForm({...matchForm, rivalName: e.target.value.toUpperCase()})} placeholder="CLUB RIVAL" className={inputClasses} />
                    </div>
                 )}
                 <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-1.5 text-center">
                       <label className={labelClasses}>Goles A</label>
                       <input type="number" value={matchForm.myScore} onChange={e => setMatchForm({...matchForm, myScore: parseInt(e.target.value)})} className={inputClasses + " text-2xl italic text-center py-4"} />
                    </div>
                    <div className="space-y-1.5 text-center">
                       <label className={labelClasses}>Goles B</label>
                       <input type="number" value={matchForm.rivalScore} onChange={e => setMatchForm({...matchForm, rivalScore: parseInt(e.target.value)})} className={inputClasses + " text-2xl italic text-center py-4"} />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className={labelClasses}>Fecha Partido</label>
                       <input type="date" value={matchForm.date} onChange={e => setMatchForm({...matchForm, date: e.target.value})} className={inputClasses} />
                    </div>
                    <div className="space-y-1.5">
                       <label className={labelClasses}>Fase / Grupo</label>
                       <input value={matchForm.stage} onChange={e => setMatchForm({...matchForm, stage: e.target.value.toUpperCase()})} placeholder="EJ: GRUPO A" className={inputClasses} />
                    </div>
                 </div>
              </div>
              <div className="p-6 border-t border-white/5 bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
                 <button onClick={handleSaveMatch} className="w-full py-4 bg-primary-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:scale-[1.02] transition-all">Guardar Informe</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TournamentManagement;
