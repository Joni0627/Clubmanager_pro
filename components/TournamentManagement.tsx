
import React, { useState, useEffect, useMemo } from 'react';
import { Tournament, Match, MatchEvent, Player, Category, Discipline, MatchEventType, ClubConfig } from '../types';
import { 
  Trophy, Plus, Calendar, Save, Trash2, X, ChevronRight, Edit3, 
  Settings2, Activity, Shield, Users, Loader2, Info, CheckCircle2,
  ListOrdered, LayoutGrid, Swords, AlertTriangle, Goal, UserPlus, 
  ChevronDown, BarChart2, Hash, MapPin, Clock
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
    <div className="space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic flex items-center gap-4">
             <div className="p-3 bg-primary-600/10 text-primary-600 rounded-2xl shadow-inner"><Trophy size={32} /></div>
             Centro de Competición
          </h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-3 ml-1">Análisis de Resultados y Fixture Plegma</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => { setTournamentForm({ name: '', type: 'Professional' }); setShowTournamentModal(true); }}
            className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-primary-600 text-white px-8 py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary-600/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={18} strokeWidth={3} /> Nuevo Torneo
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="w-full lg:w-80 shrink-0 space-y-6">
          <div className="bg-white dark:bg-[#0f1219] p-8 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-sm">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-100 dark:border-white/5 pb-4">Torneos en Curso</h4>
             <div className="space-y-3">
                {tournaments.map(t => (
                  <button 
                    key={t.id}
                    onClick={() => { setActiveTournament(t); setViewMode('fixture'); }}
                    className={`w-full p-5 rounded-2xl flex flex-col items-start transition-all relative overflow-hidden group border-2 ${activeTournament?.id === t.id ? 'bg-slate-950 border-primary-600 text-white shadow-xl' : 'bg-slate-50 dark:bg-white/5 text-slate-500 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    <div className="flex justify-between w-full items-start relative z-10">
                       <span className="text-[11px] font-black uppercase tracking-tight italic text-left">{t.name}</span>
                       <Trash2 size={12} className={`opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all ${activeTournament?.id === t.id ? 'text-white/60' : 'text-slate-300'}`} onClick={(e) => { e.stopPropagation(); if(confirm('¿Eliminar?')) db.tournaments.delete(t.id).then(loadData); }} />
                    </div>
                    <span className={`text-[8px] font-bold uppercase tracking-widest mt-2 relative z-10 ${activeTournament?.id === t.id ? 'text-primary-400' : 'text-slate-400'}`}>
                      {t.type === 'Professional' ? 'Liga Nacional' : 'Torneo del Club'}
                    </span>
                  </button>
                ))}
             </div>
          </div>
          
          {activeTournament && (
            <div className="bg-slate-950 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary-500 mb-6">Navegación</h4>
                  <div className="space-y-2">
                     <button onClick={() => setViewMode('fixture')} className={`w-full p-4 rounded-xl flex items-center gap-4 text-[10px] font-black uppercase transition-all ${viewMode === 'fixture' ? 'bg-primary-600' : 'hover:bg-white/5 text-slate-400'}`}>
                        <Calendar size={16} /> Calendario / Fixture
                     </button>
                     <button onClick={() => setViewMode('table')} className={`w-full p-4 rounded-xl flex items-center gap-4 text-[10px] font-black uppercase transition-all ${viewMode === 'table' ? 'bg-primary-600' : 'hover:bg-white/5 text-slate-400'}`}>
                        <ListOrdered size={16} /> Tabla de Posiciones
                     </button>
                  </div>
               </div>
            </div>
          )}
        </aside>

        <div className="flex-1 min-w-0">
           {activeTournament ? (
             <div className="space-y-8 animate-fade-in">
                {isRefreshing && (
                  <div className="flex items-center gap-3 p-4 bg-primary-600/10 text-primary-600 rounded-2xl animate-pulse">
                    <Loader2 className="animate-spin" size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Sincronizando Datos...</span>
                  </div>
                )}
                {viewMode === 'fixture' ? (
                  <>
                    <div className="bg-white dark:bg-[#0f1219] p-10 rounded-[4rem] border border-slate-200 dark:border-white/5 shadow-xl relative overflow-hidden">
                      <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-primary-600 text-white text-[8px] font-black rounded-full uppercase tracking-widest">{activeTournament.type === 'Professional' ? 'Modo Profesional' : 'Modo Interno'}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Competición: {activeTournament.name}</span>
                          </div>
                          <h3 className="text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Fixture de Temporada</h3>
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
                          className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-5 rounded-[2rem] font-black uppercase text-[11px] tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all"
                        >
                          Cargar Encuentro
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {matches.length > 0 ? matches.map(m => {
                        const isClubHome = m.homeTeam === clubConfig.name;
                        const clubEvents = m.events || [];

                        return (
                          <div key={m.id} className="bg-white dark:bg-[#0f1219] p-8 rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-sm group hover:border-primary-600/30 transition-all flex flex-col animate-fade-in-up overflow-hidden">
                              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="flex-1 text-center md:text-right px-4">
                                  <h4 className={`text-2xl font-black uppercase tracking-tighter italic leading-none ${m.homeTeam === clubConfig.name ? 'text-primary-600 underline decoration-2 underline-offset-8' : 'text-slate-800 dark:text-white'}`}>{m.homeTeam}</h4>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 block">Local</span>
                                </div>
                                
                                <div className="flex flex-col items-center shrink-0 bg-slate-50 dark:bg-white/5 p-8 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-inner min-w-[200px]">
                                  <div className="flex items-center gap-8 mb-4">
                                      <span className={`text-5xl font-black italic ${m.status === 'Finished' && m.homeScore! > m.awayScore! ? 'text-primary-600' : 'dark:text-white'}`}>{m.status === 'Finished' ? m.homeScore : '-'}</span>
                                      <div className="w-12 h-12 bg-slate-950 text-white rounded-full flex items-center justify-center text-[10px] font-black italic shadow-lg shrink-0">VS</div>
                                      <span className={`text-5xl font-black italic ${m.status === 'Finished' && m.awayScore! > m.homeScore! ? 'text-primary-600' : 'dark:text-white'}`}>{m.status === 'Finished' ? m.awayScore : '-'}</span>
                                  </div>
                                  <div className="flex flex-col items-center gap-1">
                                      <span className="text-[10px] font-black uppercase text-primary-600 tracking-widest">{m.date}</span>
                                      <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${m.status === 'Finished' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>{m.status === 'Finished' ? 'Finalizado' : 'Programado'}</span>
                                  </div>
                                </div>

                                <div className="flex-1 text-center md:text-left px-4">
                                  <h4 className={`text-2xl font-black uppercase tracking-tighter italic leading-none ${m.awayTeam === clubConfig.name ? 'text-primary-600 underline decoration-2 underline-offset-8' : 'text-slate-800 dark:text-white'}`}>{m.awayTeam}</h4>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 block">Visitante</span>
                                </div>

                                <div className="flex md:flex-col gap-2 shrink-0">
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
                                    className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-primary-600 transition-all"
                                  >
                                    <Edit3 size={18} />
                                  </button>
                                  <button onClick={() => deleteMatch(m.id)} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-300 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                                </div>
                              </div>

                              {clubEvents.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-slate-50 dark:border-white/5 flex flex-wrap justify-center gap-4">
                                  {clubEvents.map((ev: any) => {
                                    const player = players.find(p => p.id === ev.playerId);
                                    return (
                                      <div key={ev.id} className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-full border border-slate-100 dark:border-white/5">
                                        {ev.type === 'Goal' ? <Goal size={10} className="text-emerald-500" /> : <AlertTriangle size={10} className="text-amber-500" />}
                                        <span className="text-[9px] font-black uppercase text-slate-600 dark:text-slate-300 tracking-widest">
                                          {player ? player.name : 'Desconocido'} 
                                          {ev.minute && <span className="text-primary-600 ml-1">'{ev.minute}</span>}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                          </div>
                        );
                      }) : (
                        <div className="py-20 text-center opacity-30 border-4 border-dashed border-slate-100 dark:border-white/5 rounded-[4rem]">
                           <Calendar size={48} className="mx-auto mb-4 text-slate-300" />
                           <p className="text-[10px] font-black uppercase tracking-widest">No hay encuentros cargados aún</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="bg-white dark:bg-[#0f1219] rounded-[4rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
                    <div className="p-10 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/40">
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter">Tabla de Posiciones</h3>
                        <p className="text-[9px] font-black text-primary-600 uppercase tracking-widest mt-1">Clasificación General - {activeTournament.name}</p>
                     </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead>
                              <tr className="bg-slate-100/50 dark:bg-slate-900/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">
                                 <th className="px-8 py-5">#</th>
                                 <th className="px-8 py-5">Equipo</th>
                                 <th className="px-6 py-5 text-center">PJ</th>
                                 <th className="px-6 py-5 text-center">PG</th>
                                 <th className="px-6 py-5 text-center">PE</th>
                                 <th className="px-6 py-5 text-center">PP</th>
                                 <th className="px-6 py-5 text-center">DIF</th>
                                 <th className="px-8 py-5 text-right text-primary-600">PTS</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                              {standings.map((team, idx) => (
                                <tr key={team.name} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                   <td className="px-8 py-6 font-black italic text-slate-400">{idx + 1}</td>
                                   <td className={`px-8 py-6 font-black uppercase text-sm ${team.name === clubConfig.name ? 'text-primary-600' : 'text-slate-800 dark:text-white'}`}>{team.name}</td>
                                   <td className="px-6 py-6 text-center font-bold">{team.pj}</td>
                                   <td className="px-6 py-6 text-center text-emerald-500 font-bold">{team.pg}</td>
                                   <td className="px-6 py-6 text-center font-bold">{team.pe}</td>
                                   <td className="px-6 py-6 text-center text-red-500 font-bold">{team.pp}</td>
                                   <td className="px-6 py-6 text-center font-black italic">{team.gf - team.gc}</td>
                                   <td className="px-8 py-6 text-right font-black text-lg italic text-primary-600">{team.pts}</td>
                                </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
                )}
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center py-40 bg-white dark:bg-[#0f1219]/50 rounded-[4rem] border-4 border-dashed border-slate-200 dark:border-white/5">
                <Trophy size={80} className="text-slate-200 mb-8" />
                <h3 className="text-3xl font-black uppercase text-slate-400 italic">Selecciona un Torneo</h3>
             </div>
           )}
        </div>
      </div>

      {/* MODAL: NUEVO TORNEO */}
      {showTournamentModal && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[600] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white dark:bg-[#0f121a] w-full max-w-xl rounded-[3rem] shadow-2xl border border-white/5 overflow-hidden">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-4">
                 <Trophy size={20} className="text-primary-600" />
                 <h3 className="text-xl font-black uppercase italic tracking-tighter">Crear Competición</h3>
              </div>
              <button onClick={() => setShowTournamentModal(false)} className="p-2 hover:bg-red-500 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-10 space-y-8">
               <div className="space-y-2">
                  <label className={labelClasses}>Nombre del Torneo</label>
                  <input value={tournamentForm.name} onChange={e => setTournamentForm({...tournamentForm, name: e.target.value.toUpperCase()})} placeholder="EJ: LIGA DE HONOR" className={inputClasses} />
               </div>
               <div className="space-y-2">
                  <label className={labelClasses}>Tipo de Formato</label>
                  <select value={tournamentForm.type} onChange={e => setTournamentForm({...tournamentForm, type: e.target.value as any})} className={inputClasses}>
                    <option value="Professional">Liga Nacional / Profesional</option>
                    <option value="Internal">Torneo Interno / Amistosos</option>
                  </select>
               </div>
               <button onClick={handleSaveTournament} className="w-full py-5 bg-primary-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary-500/30 hover:scale-105 active:scale-95 transition-all">Registrar Torneo</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CARGAR ENCUENTRO / RESULTADO */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[600] flex items-center justify-center p-4 md:p-10 animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-[#0f121a] w-full max-w-5xl md:rounded-[3.5rem] shadow-2xl border border-white/5 flex flex-col h-full md:h-auto md:max-h-[90vh]">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
               <div className="flex items-center gap-4">
                  <Swords size={20} className="text-primary-600" />
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">{editingMatch ? 'Editar Resultado' : 'Programar Encuentro'}</h3>
               </div>
               <button onClick={() => setShowMatchModal(false)} className="p-2 hover:bg-red-500 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12">
               {/* Condición Local/Visitante */}
               <div className="flex flex-col items-center">
                  <label className={labelClasses}>Condición de {clubConfig.name}</label>
                  <div className="grid grid-cols-2 gap-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-3xl w-full max-w-md">
                      <button onClick={() => setMatchForm({...matchForm, condition: 'Local'})} className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${matchForm.condition === 'Local' ? 'bg-primary-600 text-white shadow-lg scale-105' : 'text-slate-400'}`}>Como Local</button>
                      <button onClick={() => setMatchForm({...matchForm, condition: 'Visitante'})} className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${matchForm.condition === 'Visitante' ? 'bg-primary-600 text-white shadow-lg scale-105' : 'text-slate-400'}`}>Como Visitante</button>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className={labelClasses}>Nombre del Rival</label>
                        <input value={matchForm.rivalName} onChange={e => setMatchForm({...matchForm, rivalName: e.target.value.toUpperCase()})} placeholder="ESCRIBE EL RIVAL..." className={inputClasses} />
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className={labelClasses}>Mi Score</label>
                           <input type="number" value={matchForm.myScore} onChange={e => setMatchForm({...matchForm, myScore: parseInt(e.target.value) || 0})} className={inputClasses + " text-3xl italic text-primary-600"} />
                        </div>
                        <div className="space-y-2">
                           <label className={labelClasses}>Score Rival</label>
                           <input type="number" value={matchForm.rivalScore} onChange={e => setMatchForm({...matchForm, rivalScore: parseInt(e.target.value) || 0})} className={inputClasses + " text-3xl italic"} />
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className={labelClasses}>Fecha</label>
                           <input type="date" value={matchForm.date} onChange={e => setMatchForm({...matchForm, date: e.target.value})} className={inputClasses} />
                        </div>
                        <div className="space-y-2">
                           <label className={labelClasses}>Estatus</label>
                           <select value={matchForm.status} onChange={e => setMatchForm({...matchForm, status: e.target.value as any})} className={inputClasses}>
                             <option value="Scheduled">Programado</option>
                             <option value="Finished">Finalizado</option>
                           </select>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className={labelClasses}>Instancia / Etapa</label>
                           <input value={matchForm.stage} onChange={e => setMatchForm({...matchForm, stage: e.target.value})} className={inputClasses} placeholder="EJ: FASE REGULAR" />
                        </div>
                        <div className="space-y-2">
                           <label className={labelClasses}>Grupo / Zona</label>
                           <input value={matchForm.group} onChange={e => setMatchForm({...matchForm, group: e.target.value})} className={inputClasses} placeholder="EJ: A" />
                        </div>
                     </div>
                  </div>
               </div>

               {/* INCIDENCIAS */}
               <div className="space-y-8 pt-10 border-t border-white/5">
                  <div className="flex justify-between items-center">
                     <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 italic">Reporte de Incidencias (Atletas Club)</h4>
                     <div className="flex gap-2">
                        <button onClick={() => addIncident('Goal')} className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest"><Goal size={12}/> Gol</button>
                        <button onClick={() => addIncident('YellowCard')} className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest"><AlertTriangle size={12}/> Tarjeta</button>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {matchForm.incidents.map((inc: any, idx: number) => (
                       <div key={inc.id} className="bg-slate-50 dark:bg-white/5 p-6 rounded-3xl border border-white/5 flex items-center gap-4 group">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${inc.type === 'Goal' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                             {inc.type === 'Goal' ? <Goal size={20} /> : <AlertTriangle size={20} />}
                          </div>
                          <div className="flex-1 space-y-3">
                             <select 
                                value={inc.playerId} 
                                onChange={e => {
                                  const newInc = [...matchForm.incidents];
                                  newInc[idx].playerId = e.target.value;
                                  setMatchForm({...matchForm, incidents: newInc});
                                }}
                                className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl text-[10px] font-bold dark:text-white outline-none"
                             >
                                <option value="">Seleccionar Jugador...</option>
                                {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                             </select>
                             <input 
                                type="number" 
                                value={inc.minute} 
                                onChange={e => {
                                  const newInc = [...matchForm.incidents];
                                  newInc[idx].minute = e.target.value;
                                  setMatchForm({...matchForm, incidents: newInc});
                                }}
                                placeholder="Minuto" 
                                className="w-20 bg-white dark:bg-slate-900 p-3 rounded-xl text-[10px] font-bold dark:text-white outline-none" 
                             />
                          </div>
                          <button onClick={() => setMatchForm({...matchForm, incidents: matchForm.incidents.filter((_:any, i:number) => i !== idx)})} className="p-2 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><X size={16} /></button>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="p-10 border-t border-white/5 bg-slate-50/50 dark:bg-slate-800/40 shrink-0 flex justify-end gap-4">
               <button onClick={() => setShowMatchModal(false)} className="px-10 py-5 rounded-2xl text-[10px] font-black uppercase text-slate-400 tracking-widest">Cancelar</button>
               <button onClick={handleSaveMatch} className="px-14 py-5 bg-primary-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-primary-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                  <Save size={18} /> Guardar Informe
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentManagement;
