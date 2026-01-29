
import React, { useState, useEffect, useMemo } from 'react';
import { Tournament, Match, Player, Category, Discipline, ClubConfig, TournamentParticipant, Member } from '../types';
import { 
  Trophy, Plus, Calendar, Trash2, X, ChevronRight, Edit3, 
  Activity, Users, Loader2, Info, CheckCircle2,
  ListOrdered, LayoutGrid, UserPlus, Search, Layout, UserCircle, 
  GitBranch, ArrowRight, Table as TableIcon, Award
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
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [viewMode, setViewMode] = useState<'fixture' | 'groups' | 'bracket' | 'participants'>('fixture');

  const [tournamentForm, setTournamentForm] = useState<Partial<Tournament>>({
    name: '', type: 'Professional', settings: { hasGroups: false, groupsCount: 1, advancingPerGroup: 2, hasPlayoffs: false, playoffStart: 'F' }
  });

  const [participantForm, setParticipantForm] = useState<{name: string, members: string[]}>({ name: '', members: [] });
  const [memberSearch, setMemberSearch] = useState('');

  const [matchForm, setMatchForm] = useState<any>({
    rivalName: '', condition: 'Local', date: new Date().toISOString().split('T')[0],
    status: 'Scheduled', myScore: 0, rivalScore: 0, group: 'A', stage: 'Fase Regular',
    homeParticipantId: '', awayParticipantId: ''
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
        const filtered = tourRes.data.filter(t => t.categoryId === category.id && t.gender === gender);
        setTournaments(filtered);
        if (filtered.length > 0 && !activeTournament) setActiveTournament(filtered[0]);
      }
      if (memRes.data) setAllMembers(memRes.data);
    } catch (e) { console.error(e); }
    setIsLoading(false);
  };

  useEffect(() => { loadBaseData(); }, [category, gender]);

  useEffect(() => {
    if (activeTournament) {
      setIsRefreshing(true);
      Promise.all([
        db.matches.getAll(activeTournament.id),
        db.participants.getAll(activeTournament.id)
      ]).then(([matchesRes, partsRes]) => {
        if (matchesRes.data) setMatches(matchesRes.data);
        if (partsRes.data) setParticipants(partsRes.data);
        setIsRefreshing(false);
      });
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
        createdAt: new Date().toISOString()
      };
      await db.tournaments.upsert(newT);
      loadBaseData();
      setShowTournamentModal(false);
    } catch (e) { console.error(e); }
  };

  const handleSaveParticipant = async () => {
    if (!activeTournament || !participantForm.name) return;
    try {
      const p: TournamentParticipant = {
        id: crypto.randomUUID(),
        tournamentId: activeTournament.id,
        name: participantForm.name,
        memberIds: participantForm.members
      };
      await db.participants.upsert(p);
      const partsRes = await db.participants.getAll(activeTournament.id);
      if (partsRes.data) setParticipants(partsRes.data);
      setShowParticipantModal(false);
      setParticipantForm({ name: '', members: [] });
    } catch (e) { console.error(e); }
  };

  const handleSaveMatch = async () => {
    if (!activeTournament) return;
    let homeTeam = matchForm.condition === 'Local' ? clubConfig.name : matchForm.rivalName;
    let awayTeam = matchForm.condition === 'Local' ? matchForm.rivalName : clubConfig.name;
    
    if (activeTournament.type === 'Internal') {
      homeTeam = participants.find(p => p.id === matchForm.homeParticipantId)?.name || 'Local';
      awayTeam = participants.find(p => p.id === matchForm.awayParticipantId)?.name || 'Visitante';
    }

    try {
      await db.matches.upsert({
        id: crypto.randomUUID(),
        tournamentId: activeTournament.id,
        homeTeam,
        awayTeam,
        homeParticipantId: matchForm.homeParticipantId,
        awayParticipantId: matchForm.awayParticipantId,
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
    } catch (e) { console.error(e); }
  };

  // --- COMPONENTES DE VISTA ---

  const GroupView = () => {
    const groups = Array.from(new Set(matches.map(m => m.group).filter(Boolean)));
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
        {groups.map(g => (
          <div key={g} className="bg-white dark:bg-[#0f1219]/60 p-8 rounded-[3rem] border border-slate-200 dark:border-white/5">
            <h4 className="text-xl font-black uppercase text-primary-600 mb-6 flex items-center gap-3">
              <TableIcon size={20} /> Grupo {g}
            </h4>
            <table className="w-full text-left text-[11px] font-bold uppercase tracking-widest text-slate-500">
               <thead>
                 <tr className="border-b border-slate-100 dark:border-white/5">
                   <th className="py-4">Equipo</th>
                   <th className="py-4 text-center">PJ</th>
                   <th className="py-4 text-center">PTS</th>
                 </tr>
               </thead>
               <tbody>
                 {participants.map(p => (
                    <tr key={p.id} className="border-b border-slate-50 dark:border-white/5">
                      <td className="py-4 text-slate-800 dark:text-white">{p.name}</td>
                      <td className="py-4 text-center">0</td>
                      <td className="py-4 text-center text-primary-600">0</td>
                    </tr>
                 ))}
               </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  };

  const BracketView = () => {
    return (
      <div className="flex flex-col md:flex-row items-center justify-center gap-12 p-10 bg-slate-50 dark:bg-white/5 rounded-[4rem] animate-fade-in overflow-x-auto min-h-[500px]">
         {/* Semi 1 */}
         <div className="flex flex-col gap-10 w-full max-w-[200px]">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border-l-4 border-primary-600 shadow-xl">
               <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Semifinal 1</p>
               <div className="flex justify-between font-bold text-xs mb-1"><span>Eq. A</span> <span className="text-primary-600">--</span></div>
               <div className="flex justify-between font-bold text-xs"><span>Eq. B</span> <span className="text-primary-600">--</span></div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border-l-4 border-primary-600 shadow-xl">
               <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Semifinal 2</p>
               <div className="flex justify-between font-bold text-xs mb-1"><span>Eq. C</span> <span className="text-primary-600">--</span></div>
               <div className="flex justify-between font-bold text-xs"><span>Eq. D</span> <span className="text-primary-600">--</span></div>
            </div>
         </div>
         {/* Connector */}
         <div className="hidden md:block w-20 h-px bg-primary-600 opacity-30"></div>
         {/* Final */}
         <div className="w-full max-w-[250px]">
            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] border-t-4 border-primary-600 shadow-2xl relative">
               <Trophy className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-500" size={40} />
               <p className="text-[10px] font-black uppercase text-center mb-6 mt-4">Gran Final</p>
               <div className="space-y-4">
                  <div className="flex justify-between text-lg font-black italic"><span>GANADOR SF1</span> <span>--</span></div>
                  <div className="flex justify-between text-lg font-black italic"><span>GANADOR SF2</span> <span>--</span></div>
               </div>
            </div>
         </div>
      </div>
    );
  };

  const inputClasses = "w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-sm outline-none border border-transparent dark:border-white/5 focus:border-primary-600 shadow-inner dark:text-white";
  const labelClasses = "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3 mb-2 block";

  if (!category) return null;

  return (
    <div className="space-y-12 animate-fade-in pb-32">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-5xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic flex items-center gap-5">
             <Trophy size={40} className="text-primary-600" />
             Competiciones
          </h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px] mt-2 ml-1">Ecosistema de Competencia Plegma</p>
        </div>
        <button 
          onClick={() => { setTournamentForm({ name: '', type: 'Professional', settings: { hasGroups: false, groupsCount: 1, advancingPerGroup: 2, hasPlayoffs: false, playoffStart: 'F' } }); setShowTournamentModal(true); }}
          className="bg-primary-600 text-white px-10 py-5 rounded-[2rem] font-black uppercase text-[11px] tracking-widest shadow-2xl shadow-primary-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          <Plus size={18} strokeWidth={4} /> Nuevo Torneo
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="w-full lg:w-80 shrink-0 space-y-8">
          <div className="bg-white dark:bg-[#0f1219]/60 backdrop-blur-md p-8 rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-sm">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-3">
               <Layout size={14} className="text-primary-600" />
               Torneos Activos
             </h4>
             <div className="space-y-4">
                {tournaments.map(t => (
                  <button 
                    key={t.id}
                    onClick={() => { setActiveTournament(t); setViewMode('fixture'); }}
                    className={`w-full p-6 rounded-[2rem] flex flex-col items-start transition-all relative overflow-hidden group border-2 ${activeTournament?.id === t.id ? 'bg-primary-600/10 border-primary-600 text-slate-800 dark:text-white shadow-lg' : 'bg-transparent border-slate-100 dark:border-white/5 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                  >
                    <div className="flex justify-between w-full items-center">
                       <span className="text-[12px] font-black uppercase tracking-tight italic">{t.name}</span>
                       <Trash2 size={12} className={`opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all text-slate-400`} onClick={(e) => { e.stopPropagation(); if(confirm('¿Eliminar?')) db.tournaments.delete(t.id).then(loadBaseData); }} />
                    </div>
                    <span className="text-[8px] font-bold uppercase tracking-widest mt-2 text-primary-600/60">
                      {t.type === 'Professional' ? 'Liga Nacional' : 'Torneo Interno'}
                    </span>
                  </button>
                ))}
             </div>
          </div>
          
          {activeTournament && (
            <div className="bg-white dark:bg-[#0f1219]/60 backdrop-blur-md p-8 rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-sm">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-3">
                  <Activity size={14} className="text-primary-600" />
                  Navegación
                </h4>
                <div className="space-y-3">
                    <button onClick={() => setViewMode('fixture')} className={`w-full p-5 rounded-[1.5rem] flex items-center gap-4 text-[11px] font-black uppercase transition-all ${viewMode === 'fixture' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                      <Calendar size={18} /> Fixture
                    </button>
                    {activeTournament.settings.hasGroups && (
                      <button onClick={() => setViewMode('groups')} className={`w-full p-5 rounded-[1.5rem] flex items-center gap-4 text-[11px] font-black uppercase transition-all ${viewMode === 'groups' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                        <ListOrdered size={18} /> Grupos
                      </button>
                    )}
                    {activeTournament.settings.hasPlayoffs && (
                      <button onClick={() => setViewMode('bracket')} className={`w-full p-5 rounded-[1.5rem] flex items-center gap-4 text-[11px] font-black uppercase transition-all ${viewMode === 'bracket' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                        <GitBranch size={18} /> Organigrama
                      </button>
                    )}
                    {activeTournament.type === 'Internal' && (
                      <button onClick={() => setViewMode('participants')} className={`w-full p-5 rounded-[1.5rem] flex items-center gap-4 text-[11px] font-black uppercase transition-all ${viewMode === 'participants' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                        <Users size={18} /> Inscriptos
                      </button>
                    )}
                </div>
            </div>
          )}
        </aside>

        <div className="flex-1 min-w-0">
           {activeTournament ? (
             <div className="space-y-10 animate-fade-in">
                {viewMode === 'fixture' && (
                   <>
                     <div className="bg-white dark:bg-[#0f1219]/40 p-12 rounded-[4.5rem] border border-slate-200 dark:border-white/5 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <span className="px-4 py-1.5 bg-primary-600 text-white text-[9px] font-black rounded-full uppercase tracking-[0.2em] shadow-lg shadow-primary-600/20">{activeTournament.name}</span>
                          </div>
                          <h3 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Fixture de Encuentros</h3>
                        </div>
                        <button 
                          onClick={() => { setMatchForm({ rivalName: '', condition: 'Local', date: new Date().toISOString().split('T')[0], status: 'Scheduled', myScore: 0, rivalScore: 0, group: 'A', stage: 'Fase Regular' }); setShowMatchModal(true); }}
                          className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-12 py-6 rounded-[2rem] font-black uppercase text-[12px] tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                        >
                          <Plus size={20} /> Cargar Partido
                        </button>
                     </div>
                     <div className="grid grid-cols-1 gap-6">
                        {matches.map(m => (
                          <div key={m.id} className="bg-white dark:bg-[#0f1219]/60 p-8 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-sm hover:border-primary-600/20 transition-all flex items-center justify-between gap-10">
                              <div className="flex-1 text-right text-lg font-black uppercase tracking-tight italic text-slate-800 dark:text-white">{m.homeTeam}</div>
                              <div className="flex flex-col items-center gap-2">
                                 <div className="bg-slate-100 dark:bg-white/5 px-6 py-3 rounded-2xl flex items-center gap-4 text-3xl font-black italic">
                                    <span>{m.status === 'Finished' ? m.homeScore : '-'}</span>
                                    <span className="text-xs text-slate-400 not-italic">vs</span>
                                    <span>{m.status === 'Finished' ? m.awayScore : '-'}</span>
                                 </div>
                                 <span className="text-[9px] font-bold text-primary-600 uppercase tracking-widest">{m.date}</span>
                              </div>
                              <div className="flex-1 text-left text-lg font-black uppercase tracking-tight italic text-slate-800 dark:text-white">{m.awayTeam}</div>
                          </div>
                        ))}
                     </div>
                   </>
                )}

                {viewMode === 'groups' && <GroupView />}
                {viewMode === 'bracket' && <BracketView />}
                
                {viewMode === 'participants' && (
                  <div className="space-y-10 animate-fade-in">
                    <div className="bg-white dark:bg-[#0f1219]/40 p-12 rounded-[4.5rem] border border-slate-200 dark:border-white/5 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
                        <div>
                          <h3 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Participantes del Torneo</h3>
                          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Equipos y parejas de socios</p>
                        </div>
                        <button 
                          onClick={() => { setParticipantForm({name: '', members: []}); setShowParticipantModal(true); }}
                          className="bg-primary-600 text-white px-12 py-6 rounded-[2rem] font-black uppercase text-[12px] tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                        >
                          <Plus size={20} /> Registrar Equipo
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {participants.map(p => (
                         <div key={p.id} className="bg-white dark:bg-[#0f1219] p-8 rounded-[3rem] border border-slate-200 dark:border-white/5 relative group shadow-sm">
                            <h4 className="text-xl font-black uppercase italic tracking-tighter text-primary-600 mb-6">{p.name}</h4>
                            <div className="space-y-2">
                               {p.memberIds.map(mid => {
                                 const m = allMembers.find(mem => mem.id === mid);
                                 return <div key={mid} className="text-[10px] font-bold uppercase text-slate-500 bg-slate-50 dark:bg-white/5 p-3 rounded-xl flex items-center gap-3"><UserCircle size={14} className="text-slate-400" /> {m?.name}</div>
                               })}
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                )}
             </div>
           ) : (
             <div className="py-40 text-center bg-white dark:bg-[#0f1219]/30 rounded-[5rem] border-4 border-dashed border-slate-200 dark:border-white/5 flex flex-col items-center">
                <Trophy size={100} className="text-slate-100 dark:text-white/5 mb-10" />
                <h3 className="text-4xl font-black uppercase text-slate-300 italic tracking-tighter">Selecciona una Competición</h3>
             </div>
           )}
        </div>
      </div>

      {/* MODAL: NUEVO TORNEO (OPTIMIZADO UI) */}
      {showTournamentModal && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[600] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white dark:bg-[#0f121a] w-full max-w-2xl max-h-[90vh] rounded-[4rem] shadow-2xl border border-white/5 overflow-hidden flex flex-col">
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Configurar Torneo</h3>
              <button onClick={() => setShowTournamentModal(false)} className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm"><X size={20} /></button>
            </div>
            <div className="p-12 space-y-10 overflow-y-auto flex-1 custom-scrollbar">
               <div className="space-y-4">
                  <label className={labelClasses}>Nombre del Torneo</label>
                  <input value={tournamentForm.name} onChange={e => setTournamentForm({...tournamentForm, name: e.target.value.toUpperCase()})} placeholder="EJ: COPA CLUB 2024" className={inputClasses} />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <button onClick={() => setTournamentForm({...tournamentForm, type: 'Professional'})} className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${tournamentForm.type === 'Professional' ? 'bg-primary-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>Liga Nacional</button>
                    <button onClick={() => setTournamentForm({...tournamentForm, type: 'Internal'})} className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${tournamentForm.type === 'Internal' ? 'bg-primary-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>Torneo Local</button>
                  </div>
               </div>

               {tournamentForm.type === 'Internal' && (
                 <div className="space-y-8 pt-8 border-t border-slate-100 dark:border-white/5 animate-fade-in">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary-600">Estructura de la Competencia</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <label className="flex items-center gap-4 cursor-pointer group">
                          <input type="checkbox" checked={tournamentForm.settings?.hasGroups} onChange={e => setTournamentForm({...tournamentForm, settings: {...tournamentForm.settings!, hasGroups: e.target.checked}})} className="w-6 h-6 rounded accent-primary-600" />
                          <div>
                            <span className="text-xs font-black uppercase tracking-widest dark:text-white block">Fase de Grupos</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase">Tablas clasificatorias</span>
                          </div>
                       </label>
                       <label className="flex items-center gap-4 cursor-pointer group">
                          <input type="checkbox" checked={tournamentForm.settings?.hasPlayoffs} onChange={e => setTournamentForm({...tournamentForm, settings: {...tournamentForm.settings!, hasPlayoffs: e.target.checked}})} className="w-6 h-6 rounded accent-primary-600" />
                          <div>
                            <span className="text-xs font-black uppercase tracking-widest dark:text-white block">Playoffs</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase">Eliminación directa (Llaves)</span>
                          </div>
                       </label>
                    </div>
                 </div>
               )}
            </div>
            <div className="p-10 border-t border-white/5 bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
               <button onClick={handleSaveTournament} className="w-full py-6 bg-primary-600 text-white rounded-3xl font-black uppercase text-[12px] tracking-[0.2em] shadow-2xl shadow-primary-500/40 hover:scale-105 active:scale-95 transition-all">Generar Estructura</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR PARTICIPANTE (OPTIMIZADO UI) */}
      {showParticipantModal && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[600] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white dark:bg-[#0f121a] w-full max-w-4xl max-h-[90vh] rounded-[4rem] shadow-2xl border border-white/5 overflow-hidden flex flex-col">
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Inscribir Equipo/Socio</h3>
              <button onClick={() => setShowParticipantModal(false)} className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
               <div className="space-y-3">
                  <label className={labelClasses}>Nombre de Competencia</label>
                  <input value={participantForm.name} onChange={e => setParticipantForm({...participantForm, name: e.target.value.toUpperCase()})} placeholder="EJ: PAREJA GONZALEZ/GARCIA" className={inputClasses} />
               </div>
               <div className="space-y-6">
                  <label className={labelClasses}>Vincular Socios ({participantForm.members.length})</label>
                  <div className="relative mb-4">
                     <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                     <input value={memberSearch} onChange={e => setMemberSearch(e.target.value)} placeholder="BUSCAR SOCIO POR NOMBRE..." className={inputClasses + " pl-14"} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {allMembers.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase())).slice(0, 10).map(m => {
                        const isSelected = participantForm.members.includes(m.id);
                        return (
                          <button 
                            key={m.id}
                            onClick={() => {
                              const newMems = isSelected ? participantForm.members.filter(id => id !== m.id) : [...participantForm.members, m.id];
                              setParticipantForm({...participantForm, members: newMems});
                            }}
                            className={`p-4 rounded-2xl border transition-all flex items-center gap-4 ${isSelected ? 'bg-primary-600 border-primary-600 text-white' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-400'}`}
                          >
                            <UserCircle size={20} />
                            <span className="text-[11px] font-black uppercase tracking-tight truncate flex-1 text-left">{m.name}</span>
                            {isSelected && <CheckCircle2 size={16} />}
                          </button>
                        );
                     })}
                  </div>
               </div>
            </div>
            <div className="p-10 border-t border-white/5 bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
               <button onClick={handleSaveParticipant} className="w-full py-6 bg-primary-600 text-white rounded-3xl font-black uppercase text-[12px] tracking-widest shadow-2xl hover:scale-[1.02] transition-all">Confirmar Registro</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CARGAR ENCUENTRO (OPTIMIZADO UI) */}
      {showMatchModal && activeTournament && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[600] flex items-center justify-center p-6 animate-fade-in">
           <div className="bg-white dark:bg-[#0f121a] w-full max-w-4xl max-h-[90vh] rounded-[4rem] shadow-2xl border border-white/5 overflow-hidden flex flex-col">
              <div className="p-10 border-b border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Carga de Resultados</h3>
                <button onClick={() => setShowMatchModal(false)} className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm"><X size={20} /></button>
              </div>
              <div className="p-12 space-y-10 overflow-y-auto flex-1 custom-scrollbar">
                 {activeTournament.type === 'Internal' ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                         <label className={labelClasses}>Local</label>
                         <select value={matchForm.homeParticipantId} onChange={e => setMatchForm({...matchForm, homeParticipantId: e.target.value})} className={inputClasses}>
                            <option value="">Seleccionar...</option>
                            {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                         </select>
                      </div>
                      <div className="space-y-4">
                         <label className={labelClasses}>Visitante</label>
                         <select value={matchForm.awayParticipantId} onChange={e => setMatchForm({...matchForm, awayParticipantId: e.target.value})} className={inputClasses}>
                            <option value="">Seleccionar...</option>
                            {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                         </select>
                      </div>
                   </div>
                 ) : (
                    <div className="space-y-4">
                       <label className={labelClasses}>Rival</label>
                       <input value={matchForm.rivalName} onChange={e => setMatchForm({...matchForm, rivalName: e.target.value.toUpperCase()})} placeholder="CLUB RIVAL" className={inputClasses} />
                    </div>
                 )}
                 <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-3">
                       <label className={labelClasses}>Goles Local</label>
                       <input type="number" value={matchForm.myScore} onChange={e => setMatchForm({...matchForm, myScore: parseInt(e.target.value)})} className={inputClasses + " text-3xl italic text-center"} />
                    </div>
                    <div className="space-y-3">
                       <label className={labelClasses}>Goles Visitante</label>
                       <input type="number" value={matchForm.rivalScore} onChange={e => setMatchForm({...matchForm, rivalScore: parseInt(e.target.value)})} className={inputClasses + " text-3xl italic text-center"} />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-3">
                       <label className={labelClasses}>Fecha</label>
                       <input type="date" value={matchForm.date} onChange={e => setMatchForm({...matchForm, date: e.target.value})} className={inputClasses} />
                    </div>
                    <div className="space-y-3">
                       <label className={labelClasses}>Fase / Grupo</label>
                       <input value={matchForm.stage} onChange={e => setMatchForm({...matchForm, stage: e.target.value.toUpperCase()})} placeholder="EJ: GRUPO A" className={inputClasses} />
                    </div>
                 </div>
              </div>
              <div className="p-10 border-t border-white/5 bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
                 <button onClick={handleSaveMatch} className="w-full py-6 bg-primary-600 text-white rounded-[2rem] font-black uppercase text-[12px] tracking-widest shadow-2xl hover:scale-[1.02] transition-all">Guardar Resultado</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TournamentManagement;
