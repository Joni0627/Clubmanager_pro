
import React, { useState, useEffect, useMemo } from 'react';
import { Tournament, Match, MatchEvent, Player, Category, Discipline, MatchEventType, ClubConfig } from '../types';
import { 
  Trophy, Plus, Calendar, Save, Trash2, X, ChevronRight, Edit3, 
  Settings2, Activity, Shield, Users, Loader2, Info, CheckCircle2,
  ListOrdered, LayoutGrid, Swords, AlertTriangle, Goal, UserPlus, 
  ChevronDown, BarChart2, Hash, MapPin, Clock, Layout
} from 'lucide-react';
import { db } from '../lib/supabase';

interface TournamentManagementProps {
  discipline: Discipline;
  category: Category | null;
  gender: 'Masculino' | 'Femenino';
  players: Player[];
  clubConfig: ClubConfig;
}

const TournamentManagement: React.FC<TournamentManagementProps> = ({ discipline, category, gender, players, clubConfig }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [viewMode, setViewMode] = useState<'fixture' | 'table'>('fixture');

  const [tournamentForm, setTournamentForm] = useState<Partial<Tournament>>({
    name: '', type: 'Professional', status: 'Open'
  });

  const [matchForm, setMatchForm] = useState<any>({
    rivalName: '',
    condition: 'Local',
    date: new Date().toISOString().split('T')[0],
    status: 'Scheduled',
    myScore: 0,
    rivalScore: 0,
    group: 'A',
    stage: 'Fase Regular',
    incidents: []
  });

  const loadData = async () => {
    if (!category) return;
    setIsLoading(true);
    try {
      const { data } = await db.tournaments.getAll(discipline.id);
      if (data) {
        const filtered = data.filter(t => t.categoryId === category.id && t.gender === gender);
        setTournaments(filtered);
        if (filtered.length > 0 && !activeTournament) setActiveTournament(filtered[0]);
      }
    } catch (e) { console.error(e); }
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, [category, gender]);

  const loadMatches = async (tournamentId: string) => {
    setIsRefreshing(true);
    try {
      const { data } = await db.matches.getAll(tournamentId);
      if (data) setMatches(data);
    } catch (e) { console.error("Error cargando partidos:", e); }
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (activeTournament) loadMatches(activeTournament.id);
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
        createdAt: new Date().toISOString()
      };
      await db.tournaments.upsert(newT);
      loadData();
      setShowTournamentModal(false);
    } catch (e) { console.error(e); }
  };

  const handleSaveMatch = async () => {
    if (!activeTournament || !matchForm.rivalName) return;
    
    const homeTeam = matchForm.condition === 'Local' ? clubConfig.name : matchForm.rivalName;
    const awayTeam = matchForm.condition === 'Local' ? matchForm.rivalName : clubConfig.name;
    const homeScore = matchForm.condition === 'Local' ? matchForm.myScore : matchForm.rivalScore;
    const awayScore = matchForm.condition === 'Local' ? matchForm.rivalScore : matchForm.myScore;

    try {
      const m = {
        id: editingMatch?.id || crypto.randomUUID(),
        tournamentId: activeTournament.id,
        homeTeam,
        awayTeam,
        homeScore,
        awayScore,
        date: matchForm.date,
        status: matchForm.status,
        group: matchForm.group,
        stage: matchForm.stage,
        incidents: matchForm.incidents 
      };
      
      await db.matches.upsert(m);
      await loadMatches(activeTournament.id);
      setShowMatchModal(false);
    } catch (e) { console.error("Error al guardar partido:", e); }
  };

  const deleteMatch = async (id: string) => {
    if (!confirm('¿Eliminar encuentro?')) return;
    try {
      await db.matches.delete(id);
      if (activeTournament) loadMatches(activeTournament.id);
    } catch (e) { console.error(e); }
  };

  const standings = useMemo(() => {
    const table: Record<string, any> = {};
    matches.filter(m => m.status === 'Finished').forEach(m => {
      [m.homeTeam, m.awayTeam].forEach(t => {
        if (!table[t]) table[t] = { name: t, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
      });

      const h = table[m.homeTeam];
      const a = table[m.awayTeam];
      h.pj++; a.pj++;
      h.gf += (m.homeScore || 0); h.gc += (m.awayScore || 0);
      a.gf += (m.awayScore || 0); a.gc += (m.homeScore || 0);

      if (m.homeScore! > m.awayScore!) { h.pg++; h.pts += 3; a.pp++; }
      else if (m.homeScore! < m.awayScore!) { a.pg++; a.pts += 3; h.pp++; }
      else { h.pe++; a.pe++; h.pts += 1; a.pts += 1; }
    });
    return Object.values(table).sort((a, b) => b.pts - a.pts || (b.gf - b.gc) - (a.gf - a.gc));
  }, [matches]);

  const addIncident = (type: MatchEventType) => {
    setMatchForm({
      ...matchForm,
      incidents: [...(matchForm.incidents || []), { id: crypto.randomUUID(), type, playerId: '', minute: '' }]
    });
  };

  const inputClasses = "w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-sm outline-none border border-transparent dark:border-white/5 focus:border-primary-600 shadow-inner dark:text-white";
  const labelClasses = "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3 mb-2 block";

  if (!category) return null;

  return (
    <div className="space-y-12 animate-fade-in pb-32">
      {/* HEADER PRINCIPAL LIMPIO */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-5xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic flex items-center gap-5">
             <Trophy size={40} className="text-primary-600" />
             Centro de Competición
          </h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px] mt-2 ml-1">Análisis de Resultados y Fixture Plegma</p>
        </div>
        <button 
          onClick={() => { setTournamentForm({ name: '', type: 'Professional' }); setShowTournamentModal(true); }}
          className="bg-primary-600 text-white px-10 py-5 rounded-[2rem] font-black uppercase text-[11px] tracking-widest shadow-2xl shadow-primary-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          <Plus size={18} strokeWidth={4} /> Nuevo Torneo
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* SIDEBAR REESTILIZADA (LIMPIA) */}
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
                      {t.type === 'Professional' ? 'Liga Nacional' : 'Torneo del Club'}
                    </span>
                    {activeTournament?.id === t.id && <div className="absolute right-[-10px] top-[-10px] w-20 h-20 bg-primary-600/10 rounded-full blur-2xl"></div>}
                  </button>
                ))}
                {tournaments.length === 0 && (
                  <p className="text-[9px] font-bold uppercase text-slate-300 text-center py-4 italic">Sin torneos registrados</p>
                )}
             </div>
          </div>
          
          {activeTournament && (
            <div className="bg-white dark:bg-[#0f1219]/60 backdrop-blur-md p-8 rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-sm">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-3">
                  <Activity size={14} className="text-primary-600" />
                  Navegación
                </h4>
                <div className="space-y-3">
                    <button 
                      onClick={() => setViewMode('fixture')} 
                      className={`w-full p-5 rounded-[1.5rem] flex items-center gap-4 text-[11px] font-black uppercase transition-all ${viewMode === 'fixture' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                    >
                      <Calendar size={18} strokeWidth={2.5} /> Fixture
                    </button>
                    <button 
                      onClick={() => setViewMode('table')} 
                      className={`w-full p-5 rounded-[1.5rem] flex items-center gap-4 text-[11px] font-black uppercase transition-all ${viewMode === 'table' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                    >
                      <ListOrdered size={18} strokeWidth={2.5} /> Tabla
                    </button>
                </div>
            </div>
          )}
        </aside>

        {/* MAIN CONTENT LIMPIO */}
        <div className="flex-1 min-w-0">
           {activeTournament ? (
             <div className="space-y-10 animate-fade-in">
                {isRefreshing && (
                  <div className="flex items-center gap-3 p-5 bg-primary-600/10 text-primary-600 rounded-3xl animate-pulse">
                    <Loader2 className="animate-spin" size={18} />
                    <span className="text-[11px] font-black uppercase tracking-widest">Sincronizando...</span>
                  </div>
                )}
                
                {viewMode === 'fixture' ? (
                  <>
                    <div className="bg-white dark:bg-[#0f1219]/40 p-12 rounded-[4.5rem] border border-slate-200 dark:border-white/5 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <span className="px-4 py-1.5 bg-primary-600 text-white text-[9px] font-black rounded-full uppercase tracking-[0.2em] shadow-lg shadow-primary-600/20">{activeTournament.name}</span>
                          </div>
                          <h3 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Fixture de Temporada</h3>
                        </div>
                        <button 
                          onClick={() => { 
                            setMatchForm({ 
                              rivalName: '', condition: 'Local', date: new Date().toISOString().split('T')[0], 
                              status: 'Scheduled', myScore: 0, rivalScore: 0, group: 'A', stage: 'Fase Regular', incidents: [] 
                            }); 
                            setEditingMatch(null); 
                            setShowMatchModal(true); 
                          }}
                          className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-12 py-6 rounded-[2rem] font-black uppercase text-[12px] tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                        >
                          <Plus size={20} /> Cargar Encuentro
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-10">
                      {matches.length > 0 ? matches.map(m => {
                        const isClubHome = m.homeTeam === clubConfig.name;
                        const clubEvents = m.events || [];

                        return (
                          <div key={m.id} className="bg-white dark:bg-[#0f1219]/60 p-10 rounded-[4rem] border border-slate-200 dark:border-white/5 shadow-sm group hover:border-primary-600/20 transition-all flex flex-col animate-fade-in-up">
                              <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                                
                                {/* HOME TEAM */}
                                <div className="flex-1 text-center md:text-right px-4 flex flex-col items-center md:items-end">
                                  <div className="relative inline-block pb-3">
                                    <h4 className={`text-3xl font-black uppercase tracking-tighter italic leading-none transition-all ${m.homeTeam === clubConfig.name ? 'text-primary-600' : 'text-slate-800 dark:text-white'}`}>{m.homeTeam}</h4>
                                    {m.homeTeam === clubConfig.name && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-primary-600 rounded-full shadow-[0_4px_10px_rgba(219,39,119,0.3)]"></div>}
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-4 block">Local</span>
                                </div>
                                
                                {/* SCOREBOARD MINIMALISTA */}
                                <div className="flex flex-col items-center shrink-0">
                                  <div className="flex items-center gap-10 mb-6 bg-slate-50 dark:bg-white/5 p-8 rounded-[3.5rem] border border-slate-100 dark:border-white/5 shadow-inner">
                                      <span className={`text-6xl font-black italic tracking-tighter ${m.status === 'Finished' && m.homeScore! > m.awayScore! ? 'text-primary-600' : 'text-slate-800 dark:text-white'}`}>{m.status === 'Finished' ? m.homeScore : '-'}</span>
                                      <div className="w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center text-[11px] font-black italic shadow-xl shrink-0 rotate-12">VS</div>
                                      <span className={`text-6xl font-black italic tracking-tighter ${m.status === 'Finished' && m.awayScore! > m.homeScore! ? 'text-primary-600' : 'text-slate-800 dark:text-white'}`}>{m.status === 'Finished' ? m.awayScore : '-'}</span>
                                  </div>
                                  <div className="flex flex-col items-center gap-2">
                                      <span className="text-[11px] font-black uppercase text-primary-600 tracking-[0.2em]">{m.date}</span>
                                      <span className={`text-[8px] font-black uppercase px-4 py-1.5 rounded-full shadow-sm ${m.status === 'Finished' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>{m.status === 'Finished' ? 'Finalizado' : 'En Agenda'}</span>
                                  </div>
                                </div>

                                {/* AWAY TEAM */}
                                <div className="flex-1 text-center md:text-left px-4 flex flex-col items-center md:items-start">
                                  <div className="relative inline-block pb-3">
                                    <h4 className={`text-3xl font-black uppercase tracking-tighter italic leading-none transition-all ${m.awayTeam === clubConfig.name ? 'text-primary-600' : 'text-slate-800 dark:text-white'}`}>{m.awayTeam}</h4>
                                    {m.awayTeam === clubConfig.name && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-primary-600 rounded-full shadow-[0_4px_10px_rgba(219,39,119,0.3)]"></div>}
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-4 block">Visitante</span>
                                </div>

                                {/* ACCIONES LIMPIAS */}
                                <div className="flex md:flex-col gap-3 shrink-0">
                                  <button 
                                    onClick={() => { 
                                      const isHome = m.homeTeam === clubConfig.name;
                                      setMatchForm({
                                        rivalName: isHome ? m.awayTeam : m.homeTeam,
                                        condition: isHome ? 'Local' : 'Visitante',
                                        date: m.date,
                                        status: m.status,
                                        myScore: isHome ? m.homeScore : m.awayScore,
                                        rivalScore: isHome ? m.awayScore : m.homeScore,
                                        group: m.group,
                                        stage: m.stage,
                                        incidents: m.events || []
                                      });
                                      setEditingMatch(m); 
                                      setShowMatchModal(true); 
                                    }} 
                                    className="p-5 bg-slate-100 dark:bg-slate-800 rounded-3xl text-slate-400 hover:text-primary-600 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
                                  >
                                    <Edit3 size={20} />
                                  </button>
                                  <button onClick={() => deleteMatch(m.id)} className="p-5 bg-slate-100 dark:bg-slate-800 rounded-3xl text-slate-300 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"><Trash2 size={20} /></button>
                                </div>
                              </div>

                              {/* INCIDENCIAS REESTILIZADAS */}
                              {clubEvents.length > 0 && (
                                <div className="mt-10 pt-8 border-t border-slate-50 dark:border-white/5 flex flex-wrap justify-center gap-5">
                                  {clubEvents.map((ev: any) => {
                                    const player = players.find(p => p.id === ev.playerId);
                                    return (
                                      <div key={ev.id} className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 px-5 py-2.5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                                        {ev.type === 'Goal' ? <Goal size={14} className="text-emerald-500 animate-bounce" /> : <AlertTriangle size={14} className="text-amber-500" />}
                                        <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 tracking-widest">
                                          {player ? player.name : 'Desconocido'} 
                                          {ev.minute && <span className="text-primary-600 ml-1.5 font-black">'{ev.minute}</span>}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                          </div>
                        );
                      }) : (
                        <div className="py-32 text-center opacity-40 bg-white dark:bg-[#0f1219]/30 rounded-[5rem] border-4 border-dashed border-slate-100 dark:border-white/5">
                           <Calendar size={64} className="mx-auto mb-6 text-slate-200" />
                           <p className="text-[12px] font-black uppercase tracking-[0.4em]">No hay encuentros programados</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="bg-white dark:bg-[#0f1219]/60 rounded-[4.5rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
                    <div className="p-12 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/20">
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter">Tabla de Posiciones</h3>
                        <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mt-2">Ranking de Temporada • {activeTournament.name}</p>
                     </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead>
                              <tr className="bg-slate-50 dark:bg-slate-900/40 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">
                                 <th className="px-10 py-6">Puesto</th>
                                 <th className="px-10 py-6">Equipo</th>
                                 <th className="px-8 py-6 text-center">PJ</th>
                                 <th className="px-8 py-6 text-center">PG</th>
                                 <th className="px-8 py-6 text-center">PE</th>
                                 <th className="px-8 py-6 text-center">PP</th>
                                 <th className="px-8 py-6 text-center">DIF</th>
                                 <th className="px-10 py-6 text-right text-primary-600">Puntos</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                              {standings.map((team, idx) => (
                                <tr key={team.name} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
                                   <td className="px-10 py-8 font-black italic text-slate-400 text-xl">#{idx + 1}</td>
                                   <td className={`px-10 py-8 font-black uppercase text-base italic tracking-tighter ${team.name === clubConfig.name ? 'text-primary-600' : 'text-slate-800 dark:text-white'}`}>{team.name}</td>
                                   <td className="px-8 py-8 text-center font-bold">{team.pj}</td>
                                   <td className="px-8 py-8 text-center text-emerald-500 font-black">{team.pg}</td>
                                   <td className="px-8 py-8 text-center font-bold text-slate-400">{team.pe}</td>
                                   <td className="px-8 py-8 text-center text-red-500 font-black">{team.pp}</td>
                                   <td className="px-8 py-8 text-center font-black italic text-lg">{team.gf - team.gc}</td>
                                   <td className="px-10 py-8 text-right font-black text-3xl italic text-primary-600">{team.pts}</td>
                                </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
                )}
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center py-40 bg-white dark:bg-[#0f1219]/30 rounded-[5rem] border-4 border-dashed border-slate-200 dark:border-white/5">
                <Trophy size={100} className="text-slate-100 dark:text-white/5 mb-10" />
                <h3 className="text-4xl font-black uppercase text-slate-300 italic tracking-tighter">Selecciona una Competición</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Para visualizar el fixture y tabla de posiciones</p>
             </div>
           )}
        </div>
      </div>

      {/* MODAL: NUEVO TORNEO */}
      {showTournamentModal && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[600] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white dark:bg-[#0f121a] w-full max-w-xl rounded-[4rem] shadow-2xl border border-white/5 overflow-hidden">
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-5">
                 <div className="p-3 bg-primary-600 text-white rounded-2xl shadow-lg"><Trophy size={20} /></div>
                 <h3 className="text-2xl font-black uppercase italic tracking-tighter">Crear Torneo</h3>
              </div>
              <button onClick={() => setShowTournamentModal(false)} className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm"><X size={20} /></button>
            </div>
            <div className="p-12 space-y-10">
               <div className="space-y-3">
                  <label className={labelClasses}>Nombre de la Competición</label>
                  <input value={tournamentForm.name} onChange={e => setTournamentForm({...tournamentForm, name: e.target.value.toUpperCase()})} placeholder="EJ: CLAUSURA 2026" className={inputClasses} />
               </div>
               <div className="space-y-3">
                  <label className={labelClasses}>Formato de Competición</label>
                  <select value={tournamentForm.type} onChange={e => setTournamentForm({...tournamentForm, type: e.target.value as any})} className={inputClasses + " cursor-pointer"}>
                    <option value="Professional">Liga Oficial / Nacional</option>
                    <option value="Internal">Torneo Local / Amistosos</option>
                  </select>
               </div>
               <button onClick={handleSaveTournament} className="w-full py-6 bg-primary-600 text-white rounded-3xl font-black uppercase text-[12px] tracking-[0.2em] shadow-2xl shadow-primary-500/40 hover:scale-105 active:scale-95 transition-all">Registrar Competición</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CARGAR ENCUENTRO / RESULTADO */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[600] flex items-center justify-center p-4 md:p-10 animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-[#0f121a] w-full max-w-5xl md:rounded-[4.5rem] shadow-2xl border border-white/5 flex flex-col h-full md:h-auto md:max-h-[90vh]">
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
               <div className="flex items-center gap-5">
                  <div className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-lg"><Swords size={20} /></div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter">{editingMatch ? 'Editar Informe de Partido' : 'Programar Nuevo Encuentro'}</h3>
               </div>
               <button onClick={() => setShowMatchModal(false)} className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 md:p-14 space-y-14">
               {/* Condición Local/Visitante */}
               <div className="flex flex-col items-center">
                  <label className={labelClasses}>Condición Institucional</label>
                  <div className="grid grid-cols-2 gap-5 p-3 bg-slate-100 dark:bg-slate-800/80 rounded-[2.5rem] w-full max-w-lg border border-slate-200 dark:border-white/5 shadow-inner">
                      <button onClick={() => setMatchForm({...matchForm, condition: 'Local'})} className={`py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all ${matchForm.condition === 'Local' ? 'bg-primary-600 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-slate-500'}`}>Juega de Local</button>
                      <button onClick={() => setMatchForm({...matchForm, condition: 'Visitante'})} className={`py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all ${matchForm.condition === 'Visitante' ? 'bg-primary-600 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-slate-500'}`}>Juega de Visitante</button>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                     <div className="space-y-3">
                        <label className={labelClasses}>Nombre del Club Rival</label>
                        <input value={matchForm.rivalName} onChange={e => setMatchForm({...matchForm, rivalName: e.target.value.toUpperCase()})} placeholder="ESCRIBE EL RIVAL..." className={inputClasses} />
                     </div>
                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <label className={labelClasses}>Mis Goles</label>
                           <input type="number" value={matchForm.myScore} onChange={e => setMatchForm({...matchForm, myScore: parseInt(e.target.value) || 0})} className={inputClasses + " text-4xl italic text-primary-600"} />
                        </div>
                        <div className="space-y-3">
                           <label className={labelClasses}>Goles Rival</label>
                           <input type="number" value={matchForm.rivalScore} onChange={e => setMatchForm({...matchForm, rivalScore: parseInt(e.target.value) || 0})} className={inputClasses + " text-4xl italic"} />
                        </div>
                     </div>
                  </div>

                  <div className="space-y-8">
                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <label className={labelClasses}>Fecha del Match</label>
                           <input type="date" value={matchForm.date} onChange={e => setMatchForm({...matchForm, date: e.target.value})} className={inputClasses} />
                        </div>
                        <div className="space-y-3">
                           <label className={labelClasses}>Estado Final</label>
                           <select value={matchForm.status} onChange={e => setMatchForm({...matchForm, status: e.target.value as any})} className={inputClasses + " cursor-pointer"}>
                             <option value="Scheduled">Programado</option>
                             <option value="Finished">Finalizado</option>
                           </select>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <label className={labelClasses}>Instancia del Torneo</label>
                           <input value={matchForm.stage} onChange={e => setMatchForm({...matchForm, stage: e.target.value.toUpperCase()})} className={inputClasses} placeholder="EJ: FASE DE GRUPOS" />
                        </div>
                        <div className="space-y-3">
                           <label className={labelClasses}>Zona / Grupo</label>
                           <input value={matchForm.group} onChange={e => setMatchForm({...matchForm, group: e.target.value.toUpperCase()})} className={inputClasses} placeholder="EJ: ZONA A" />
                        </div>
                     </div>
                  </div>
               </div>

               {/* INCIDENCIAS REESTILIZADAS EN EL MODAL */}
               <div className="space-y-10 pt-12 border-t border-slate-100 dark:border-white/5">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                     <div>
                        <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-800 dark:text-white italic">Eventos del Plantel</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Registra los logros individuales de tus atletas</p>
                     </div>
                     <div className="flex gap-4">
                        <button onClick={() => addIncident('Goal')} className="flex items-center gap-3 bg-emerald-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-emerald-500/20"><Goal size={14}/> Anotar Gol</button>
                        <button onClick={() => addIncident('YellowCard')} className="flex items-center gap-3 bg-amber-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-amber-500/20"><AlertTriangle size={14}/> Tarjeta</button>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     {matchForm.incidents.map((inc: any, idx: number) => (
                       <div key={inc.id} className="bg-slate-50 dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 flex items-center gap-6 group relative">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${inc.type === 'Goal' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                             {inc.type === 'Goal' ? <Goal size={24} /> : <AlertTriangle size={24} />}
                          </div>
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                               <label className="text-[7px] font-black uppercase text-slate-400 tracking-widest ml-1">Atleta</label>
                               <select 
                                  value={inc.playerId} 
                                  onChange={e => {
                                    const newInc = [...matchForm.incidents];
                                    newInc[idx].playerId = e.target.value;
                                    setMatchForm({...matchForm, incidents: newInc});
                                  }}
                                  className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl text-[11px] font-black dark:text-white outline-none border border-transparent focus:border-primary-600/30 shadow-sm"
                               >
                                  <option value="">Seleccionar Atleta...</option>
                                  {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                               </select>
                             </div>
                             <div className="space-y-2">
                               <label className="text-[7px] font-black uppercase text-slate-400 tracking-widest ml-1">Minuto</label>
                               <div className="flex items-center gap-2">
                                 <input 
                                    type="number" 
                                    value={inc.minute} 
                                    onChange={e => {
                                      const newInc = [...matchForm.incidents];
                                      newInc[idx].minute = e.target.value;
                                      setMatchForm({...matchForm, incidents: newInc});
                                    }}
                                    placeholder="0'" 
                                    className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl text-[11px] font-black text-center dark:text-white outline-none border border-transparent focus:border-primary-600/30 shadow-sm" 
                                 />
                                 <button onClick={() => setMatchForm({...matchForm, incidents: matchForm.incidents.filter((_:any, i:number) => i !== idx)})} className="p-3 text-slate-300 hover:text-red-500 transition-all"><X size={18} /></button>
                               </div>
                             </div>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="p-12 border-t border-white/5 bg-slate-50/50 dark:bg-slate-800/40 shrink-0 flex flex-col md:flex-row justify-end items-center gap-6">
               <button onClick={() => setShowMatchModal(false)} className="px-12 py-5 rounded-2xl text-[11px] font-black uppercase text-slate-400 tracking-widest hover:text-slate-600 transition-colors">Cancelar Operación</button>
               <button onClick={handleSaveMatch} className="w-full md:w-auto px-20 py-6 bg-primary-600 text-white rounded-[2rem] font-black uppercase text-[12px] tracking-[0.2em] shadow-2xl shadow-primary-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4">
                  <Save size={20} strokeWidth={3} /> Guardar Informe Oficial
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentManagement;
