
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
        // FLEXIBILIZACIÓN DE FILTRO: Buscamos coincidencia de disciplina y categoría
        // Si en la DB no hay género o categoría, el filtro podría estar matando los resultados.
        const filtered = tourRes.data.filter((t: any) => {
          const discMatch = (t.disciplineId === discipline.id || t.discipline_id === discipline.id);
          const catMatch = !category || (t.categoryId === category.id || t.category_id === category.id);
          const genderMatch = !gender || (t.gender === gender);
          
          return discMatch && catMatch && genderMatch;
        });
        
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
      // CORRECCIÓN CLAVE: Usamos tournamentid y memberids como se ve en tu captura de Supabase
      const { error } = await db.participants.upsert({
        id: crypto.randomUUID(),
        tournamentid: activeTournament.id,
        name: participantForm.name.toUpperCase().trim(),
        memberids: participantForm.members
      });

      if (error) {
        console.error("Error en Supabase:", error);
        alert(`Error al guardar: ${error.message}`);
        return;
      }

      // Refresco de lista
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
                               {(p.memberids || []).map(mid => <div key={mid} className="text-[9px] font-bold uppercase text-slate-500 bg-slate-50 dark:bg-white/5 p-2 rounded-lg flex items-center gap-2"><UserCircle size={12} /> {allMembers.find(mem => mem.id === mid)?.name || 'Cargando...'}</div>)}
                            </div>
                         </div>
                       ))}
                       {participants.length === 0 && (
                          <div className="col-span-full py-10 text-center text-slate-400 italic font-bold text-sm uppercase">Sin socios inscriptos aún</div>
                       )}
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
    </div>
  );
};

export default TournamentManagement;
