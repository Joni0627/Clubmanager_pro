
import React, { useState, useEffect, useMemo } from 'react';
import { Tournament, Match, MatchEvent, Player, Category, Discipline, MatchEventType, ClubConfig } from '../types';
import { 
  Trophy, Plus, Calendar, Save, Trash2, X, ChevronRight, Edit3, 
  Settings2, Activity, Shield, Users, Loader2, Info, CheckCircle2,
  ListOrdered, LayoutGrid, Swords, AlertTriangle, Goal, UserPlus, 
  ChevronDown, BarChart2, Hash, MapPin
} from 'lucide-center';
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
        incidents: matchForm.incidents // db.matches.upsert se encarga de procesar esto
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
                    <span className="text-[10px] font-black uppercase tracking-widest">Actualizando Fixture...</span>
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
                        return (
                          <div key={m.id} className="bg-white dark:bg-[#0f1219] p-8 rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-sm group hover:border-primary-600/30 transition-all flex flex-col md:flex-row items-center justify-between gap-8 animate-fade-in-up">
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
                    {/* ... Standings logic ... */}
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
      {/* ... Modals ... */}
    </div>
  );
};

export default TournamentManagement;
