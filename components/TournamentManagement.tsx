
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Tournament, Match, MatchEvent, Player, Category, Discipline, MatchEventType, ClubConfig, TournamentParticipant, Member } from '../types';
import { 
  Trophy, Plus, Calendar, Save, Trash2, X, ChevronRight, Edit3, 
  Settings2, Activity, Shield, Users, Loader2, Info, CheckCircle2,
  ListOrdered, LayoutGrid, Swords, AlertTriangle, Goal, UserPlus, 
  ChevronDown, BarChart2, Hash, MapPin, Clock, Layout, UserCircle, Search
} from 'lucide-react';
import { db } from '../lib/supabase';

interface TournamentManagementProps {
  discipline: Discipline;
  category: Category | null;
  gender: 'Masculino' | 'Femenino';
  players: Player[];
  clubConfig: ClubConfig;
  allMembers?: Member[]; // Necesitamos todos los socios para el modo interno
}

const TournamentManagement: React.FC<TournamentManagementProps> = ({ discipline, category, gender, players, clubConfig }) => {
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
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [viewMode, setViewMode] = useState<'fixture' | 'table' | 'participants' | 'settings'>('fixture');

  const [tournamentForm, setTournamentForm] = useState<Partial<Tournament>>({
    name: '', type: 'Professional', status: 'Open', settings: { hasGroups: false, groupsCount: 1, advancingPerGroup: 2, hasPlayoffs: false, playoffStart: 'F' }
  });

  const [participantForm, setParticipantForm] = useState<{name: string, members: string[]}>({ name: '', members: [] });
  const [memberSearch, setMemberSearch] = useState('');

  const [matchForm, setMatchForm] = useState<any>({
    rivalName: '', condition: 'Local', date: new Date().toISOString().split('T')[0],
    status: 'Scheduled', myScore: 0, rivalScore: 0, group: 'A', stage: 'Fase Regular', incidents: [],
    homeParticipantId: '', awayParticipantId: ''
  });

  const loadData = async () => {
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

  useEffect(() => { loadData(); }, [category, gender]);

  const loadMatchesAndParticipants = async (tournamentId: string) => {
    setIsRefreshing(true);
    try {
      const [matchesRes, partsRes] = await Promise.all([
        db.matches.getAll(tournamentId),
        db.participants.getAll(tournamentId)
      ]);
      if (matchesRes.data) setMatches(matchesRes.data);
      if (partsRes.data) setParticipants(partsRes.data);
    } catch (e) { console.error(e); }
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (activeTournament) loadMatchesAndParticipants(activeTournament.id);
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
        settings: tournamentForm.settings,
        createdAt: new Date().toISOString()
      };
      await db.tournaments.upsert(newT);
      loadData();
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
      loadMatchesAndParticipants(activeTournament.id);
      setShowParticipantModal(false);
      setParticipantForm({ name: '', members: [] });
    } catch (e) { console.error(e); }
  };

  const handleSaveMatch = async () => {
    if (!activeTournament) return;
    
    let homeTeam = matchForm.condition === 'Local' ? clubConfig.name : matchForm.rivalName;
    let awayTeam = matchForm.condition === 'Local' ? matchForm.rivalName : clubConfig.name;
    
    if (activeTournament.type === 'Internal') {
      const hp = participants.find(p => p.id === matchForm.homeParticipantId);
      const ap = participants.find(p => p.id === matchForm.awayParticipantId);
      homeTeam = hp?.name || 'Inscripto A';
      awayTeam = ap?.name || 'Inscripto B';
    }

    try {
      const m = {
        id: editingMatch?.id || crypto.randomUUID(),
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
        stage: matchForm.stage,
        incidents: matchForm.incidents 
      };
      
      await db.matches.upsert(m);
      await loadMatchesAndParticipants(activeTournament.id);
      setShowMatchModal(false);
    } catch (e) { console.error(e); }
  };

  const deleteParticipant = async (id: string) => {
    if (!confirm('¿Eliminar participante? Se perderán sus vínculos.')) return;
    await db.participants.delete(id);
    if (activeTournament) loadMatchesAndParticipants(activeTournament.id);
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
             Centro de Competición
          </h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px] mt-2 ml-1">Análisis de Resultados y Fixture Plegma</p>
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
               Competiciones
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
                       <Trash2 size={12} className={`opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all text-slate-400`} onClick={(e) => { e.stopPropagation(); if(confirm('¿Eliminar?')) db.tournaments.delete(t.id).then(loadData); }} />
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
                      <Calendar size={18} strokeWidth={2.5} /> Fixture
                    </button>
                    <button onClick={() => setViewMode('table')} className={`w-full p-5 rounded-[1.5rem] flex items-center gap-4 text-[11px] font-black uppercase transition-all ${viewMode === 'table' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                      <ListOrdered size={18} strokeWidth={2.5} /> Tabla
                    </button>
                    {activeTournament.type === 'Internal' && (
                      <button onClick={() => setViewMode('participants')} className={`w-full p-5 rounded-[1.5rem] flex items-center gap-4 text-[11px] font-black uppercase transition-all ${viewMode === 'participants' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                        <UserPlus size={18} strokeWidth={2.5} /> Inscriptos
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
                          <h3 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Fixture de Temporada</h3>
                        </div>
                        <button 
                          onClick={() => { setMatchForm({ rivalName: '', condition: 'Local', date: new Date().toISOString().split('T')[0], status: 'Scheduled', myScore: 0, rivalScore: 0, group: 'A', stage: 'Fase Regular', incidents: [] }); setShowMatchModal(true); }}
                          className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-12 py-6 rounded-[2rem] font-black uppercase text-[12px] tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                        >
                          <Plus size={20} /> Cargar Encuentro
                        </button>
                     </div>
                     <div className="grid grid-cols-1 gap-10">
                        {matches.map(m => (
                          <div key={m.id} className="bg-white dark:bg-[#0f1219]/60 p-10 rounded-[4rem] border border-slate-200 dark:border-white/5 shadow-sm group hover:border-primary-600/20 transition-all">
                              <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                                <div className="flex-1 text-center md:text-right px-4">
                                  <h4 className={`text-3xl font-black uppercase tracking-tighter italic leading-none transition-all ${m.homeTeam === clubConfig.name ? 'text-primary-600' : 'text-slate-800 dark:text-white'}`}>{m.homeTeam}</h4>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 block">LOCAL</span>
                                </div>
                                <div className="flex flex-col items-center shrink-0">
                                   <div className="flex items-center gap-8 mb-4 bg-slate-100 dark:bg-white/5 p-6 rounded-[2.5rem]">
                                      <span className="text-5xl font-black italic">{m.status === 'Finished' ? m.homeScore : '-'}</span>
                                      <div className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px] font-black italic shadow-xl">VS</div>
                                      <span className="text-5xl font-black italic">{m.status === 'Finished' ? m.awayScore : '-'}</span>
                                   </div>
                                   <span className="text-[11px] font-black uppercase text-primary-600 tracking-[0.2em]">{m.date}</span>
                                </div>
                                <div className="flex-1 text-center md:text-left px-4">
                                  <h4 className={`text-3xl font-black uppercase tracking-tighter italic leading-none transition-all ${m.awayTeam === clubConfig.name ? 'text-primary-600' : 'text-slate-800 dark:text-white'}`}>{m.awayTeam}</h4>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 block">VISITANTE</span>
                                </div>
                              </div>
                          </div>
                        ))}
                     </div>
                   </>
                )}

                {viewMode === 'participants' && (
                  <div className="space-y-10 animate-fade-in">
                    <div className="bg-white dark:bg-[#0f1219]/40 p-12 rounded-[4.5rem] border border-slate-200 dark:border-white/5 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
                        <div>
                          <h3 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Inscriptos del Torneo</h3>
                          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Gestiona las parejas o equipos internos</p>
                        </div>
                        <button 
                          onClick={() => { setParticipantForm({name: '', members: []}); setShowParticipantModal(true); }}
                          className="bg-primary-600 text-white px-12 py-6 rounded-[2rem] font-black uppercase text-[12px] tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                        >
                          <Plus size={20} /> Registrar Participante
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                       {participants.map(p => (
                         <div key={p.id} className="bg-white dark:bg-[#0f1219] p-8 rounded-[3rem] border border-slate-200 dark:border-white/5 relative group shadow-sm">
                            <button onClick={() => deleteParticipant(p.id)} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                            <h4 className="text-xl font-black uppercase italic tracking-tighter text-primary-600 mb-6">{p.name}</h4>
                            <div className="space-y-3">
                               {p.memberIds.map(mid => {
                                 const m = allMembers.find(mem => mem.id === mid);
                                 return (
                                   <div key={mid} className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 p-3 rounded-2xl">
                                      <UserCircle size={14} className="text-slate-400" />
                                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 truncate">{m?.name || 'Desconocido'}</span>
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
             <div className="py-40 text-center bg-white dark:bg-[#0f1219]/30 rounded-[5rem] border-4 border-dashed border-slate-200 dark:border-white/5 flex flex-col items-center">
                <Trophy size={100} className="text-slate-100 dark:text-white/5 mb-10" />
                <h3 className="text-4xl font-black uppercase text-slate-300 italic tracking-tighter">Selecciona una Competición</h3>
             </div>
           )}
        </div>
      </div>

      {/* MODAL: NUEVO TORNEO (ACTUALIZADO CON SETTINGS) */}
      {showTournamentModal && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[600] flex items-center justify-center p-6 animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-[#0f121a] w-full max-w-2xl rounded-[4rem] shadow-2xl border border-white/5 overflow-hidden">
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Configurar Torneo</h3>
              <button onClick={() => setShowTournamentModal(false)} className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm"><X size={20} /></button>
            </div>
            <div className="p-12 space-y-10">
               <div className="space-y-4">
                  <label className={labelClasses}>Nombre y Tipo</label>
                  <input value={tournamentForm.name} onChange={e => setTournamentForm({...tournamentForm, name: e.target.value.toUpperCase()})} placeholder="EJ: TORNEO DE VERANO" className={inputClasses} />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <button onClick={() => setTournamentForm({...tournamentForm, type: 'Professional'})} className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${tournamentForm.type === 'Professional' ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>Liga Nacional</button>
                    <button onClick={() => setTournamentForm({...tournamentForm, type: 'Internal'})} className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${tournamentForm.type === 'Internal' ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>Torneo Interno</button>
                  </div>
               </div>

               {tournamentForm.type === 'Internal' && (
                 <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-white/5 animate-fade-in">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary-600">Estructura de Competencia</h4>
                    <div className="grid grid-cols-2 gap-8">
                       <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={tournamentForm.settings?.hasGroups} onChange={e => setTournamentForm({...tournamentForm, settings: {...tournamentForm.settings!, hasGroups: e.target.checked}})} className="w-5 h-5 rounded accent-primary-600" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fase de Grupos</span>
                       </label>
                       <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={tournamentForm.settings?.hasPlayoffs} onChange={e => setTournamentForm({...tournamentForm, settings: {...tournamentForm.settings!, hasPlayoffs: e.target.checked}})} className="w-5 h-5 rounded accent-primary-600" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Eliminatoria (Llaves)</span>
                       </label>
                    </div>
                 </div>
               )}
               <button onClick={handleSaveTournament} className="w-full py-6 bg-primary-600 text-white rounded-3xl font-black uppercase text-[12px] tracking-[0.2em] shadow-2xl shadow-primary-500/40 hover:scale-105 active:scale-95 transition-all">Crear Ecosistema</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR PARTICIPANTE INTERNO */}
      {showParticipantModal && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[600] flex items-center justify-center p-6 animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-[#0f121a] w-full max-w-4xl rounded-[4rem] shadow-2xl border border-white/5 overflow-hidden flex flex-col h-[85vh]">
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Inscribir Participante</h3>
              <button onClick={() => setShowParticipantModal(false)} className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-12 space-y-12">
               <div className="space-y-3">
                  <label className={labelClasses}>Nombre del Equipo / Pareja</label>
                  <input value={participantForm.name} onChange={e => setParticipantForm({...participantForm, name: e.target.value.toUpperCase()})} placeholder="EJ: LOS GALACTICOS" className={inputClasses} />
               </div>
               <div className="space-y-6">
                  <label className={labelClasses}>Vincular Socios ({participantForm.members.length})</label>
                  <div className="relative mb-6">
                     <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                     <input value={memberSearch} onChange={e => setMemberSearch(e.target.value)} placeholder="BUSCAR SOCIO POR NOMBRE O DNI..." className={inputClasses + " pl-14"} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto no-scrollbar">
                     {allMembers.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()) || m.dni.includes(memberSearch)).slice(0, 10).map(m => {
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
                            <div className="text-left min-w-0">
                               <p className="text-[11px] font-black uppercase tracking-tight truncate">{m.name}</p>
                               <p className={`text-[8px] font-bold uppercase ${isSelected ? 'text-white/60' : 'text-slate-400'}`}>DNI: {m.dni}</p>
                            </div>
                            {isSelected && <CheckCircle2 size={16} className="ml-auto" />}
                          </button>
                        );
                     })}
                  </div>
               </div>
            </div>
            <div className="p-10 border-t border-white/5 bg-slate-50/50 dark:bg-slate-800/40">
               <button onClick={handleSaveParticipant} className="w-full py-6 bg-primary-600 text-white rounded-3xl font-black uppercase text-[12px] tracking-widest shadow-2xl hover:scale-[1.02] transition-all">Confirmar Inscripción</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CARGAR ENCUENTRO (ADAPTADO A MODO INTERNO) */}
      {showMatchModal && activeTournament && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[600] flex items-center justify-center p-6 animate-fade-in overflow-y-auto">
           <div className="bg-white dark:bg-[#0f121a] w-full max-w-5xl rounded-[4rem] shadow-2xl border border-white/5 overflow-hidden flex flex-col">
              <div className="p-10 border-b border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Programar Match</h3>
                <button onClick={() => setShowMatchModal(false)} className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm"><X size={20} /></button>
              </div>
              <div className="p-14 space-y-12 overflow-y-auto flex-1">
                 {activeTournament.type === 'Internal' ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-4">
                         <label className={labelClasses}>Participante A</label>
                         <select value={matchForm.homeParticipantId} onChange={e => setMatchForm({...matchForm, homeParticipantId: e.target.value})} className={inputClasses}>
                            <option value="">Seleccionar...</option>
                            {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                         </select>
                      </div>
                      <div className="space-y-4">
                         <label className={labelClasses}>Participante B</label>
                         <select value={matchForm.awayParticipantId} onChange={e => setMatchForm({...matchForm, awayParticipantId: e.target.value})} className={inputClasses}>
                            <option value="">Seleccionar...</option>
                            {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                         </select>
                      </div>
                   </div>
                 ) : (
                    <div className="space-y-6">
                       <label className={labelClasses}>Rival Externo</label>
                       <input value={matchForm.rivalName} onChange={e => setMatchForm({...matchForm, rivalName: e.target.value.toUpperCase()})} placeholder="NOMBRE DEL CLUB RIVAL" className={inputClasses} />
                    </div>
                 )}
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className={labelClasses}>Goles A</label>
                       <input type="number" value={matchForm.myScore} onChange={e => setMatchForm({...matchForm, myScore: parseInt(e.target.value)})} className={inputClasses + " text-3xl italic"} />
                    </div>
                    <div className="space-y-3">
                       <label className={labelClasses}>Goles B</label>
                       <input type="number" value={matchForm.rivalScore} onChange={e => setMatchForm({...matchForm, rivalScore: parseInt(e.target.value)})} className={inputClasses + " text-3xl italic"} />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className={labelClasses}>Fecha</label>
                       <input type="date" value={matchForm.date} onChange={e => setMatchForm({...matchForm, date: e.target.value})} className={inputClasses} />
                    </div>
                    <div className="space-y-3">
                       <label className={labelClasses}>Fase / Grupo</label>
                       <input value={matchForm.stage} onChange={e => setMatchForm({...matchForm, stage: e.target.value.toUpperCase()})} className={inputClasses} />
                    </div>
                 </div>
              </div>
              <div className="p-10 border-t border-white/5 bg-slate-50/50 dark:bg-slate-800/40">
                 <button onClick={handleSaveMatch} className="w-full py-6 bg-primary-600 text-white rounded-[2rem] font-black uppercase text-[12px] tracking-widest shadow-2xl hover:scale-[1.02] transition-all">Guardar Informe Match</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TournamentManagement;
