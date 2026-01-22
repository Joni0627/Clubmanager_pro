
import React, { useState } from 'react';
import { Fixture, Discipline, TeamStructure } from '../types.ts';
import { Plus, Trash2, Edit2, Users, Activity, ChevronRight, X, Save, Trophy, AlertTriangle, Stethoscope } from 'lucide-react';

interface AdminPanelProps {
  activeTab: 'fixtures' | 'staff';
}

const AdminPanel: React.FC<AdminPanelProps> = ({ activeTab }) => {
  // --- STATES FOR FIXTURES ---
  // Fix: selectedDiscipline should be a string to match select input value
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('Todas');
  const [showFixtureModal, setShowFixtureModal] = useState(false);
  const [editingFixture, setEditingFixture] = useState<Fixture | null>(null);

  const [fixtures] = useState<Fixture[]>([
    { id: '1', discipline: 'Fútbol', category: 'Primera', opponent: 'Real Madrid CF', date: '2023-11-15', venue: 'Home', competition: 'La Liga', result: 'Pending' },
    { id: '2', discipline: 'Básquet', category: 'Sub-20', opponent: 'Barcelona Basket', date: '2023-11-22', venue: 'Away', competition: 'Liga Endesa', result: 'Pending' },
    { id: '3', discipline: 'Vóley', category: 'Femenino', opponent: 'Club Vóley', date: '2023-11-08', venue: 'Home', competition: 'Torneo Local', result: '3-1' },
  ]);

  // --- STATES FOR STAFF/TEAMS ---
  const [selectedTeam, setSelectedTeam] = useState<TeamStructure | null>(null); // Viewing specific team details
  const [showTeamModal, setShowTeamModal] = useState(false); // Creating/Editing
  const [editingTeam, setEditingTeam] = useState<TeamStructure | null>(null); // Creating/Editing

  // Mock Structure Data
  const [teams, setTeams] = useState<TeamStructure[]>([
      { id: 't1', discipline: 'Fútbol', category: 'Primera', coach: 'Carlo Ancelotti', physicalTrainer: 'Antonio Pintus', medicalStaff: 'Dr. House', playersCount: 24 },
      { id: 't2', discipline: 'Fútbol', category: 'Reserva', coach: 'Marcelo Gallardo', physicalTrainer: 'Pablo Dolce', medicalStaff: 'Dr. Rossi', playersCount: 18 },
      { id: 't3', discipline: 'Básquet', category: 'Primera', coach: 'Steve Kerr', physicalTrainer: 'Ron Adams', medicalStaff: 'Dr. Smith', playersCount: 12 },
  ]);

  const handleFixtureEdit = (fixture: Fixture) => {
    setEditingFixture(fixture);
    setShowFixtureModal(true);
  };

  const handleNewFixture = () => {
    setEditingFixture(null);
    setShowFixtureModal(true);
  };

  // Team Logic
  const handleCreateTeam = () => {
      setEditingTeam(null);
      setShowTeamModal(true);
  }

  const handleEditTeam = (team: TeamStructure, e: React.MouseEvent) => {
      e.stopPropagation();
      setEditingTeam(team);
      setShowTeamModal(true);
  }

  const handleDeleteTeam = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if(confirm('¿Eliminar cuerpo técnico?')) {
          setTeams(prev => prev.filter(t => t.id !== id));
      }
  }

  // --- COMPONENT: TEAM HIERARCHY (Flowchart View) ---
  const TeamHierarchy = ({ team, onBack }: { team: TeamStructure, onBack: () => void }) => (
    <div className="animate-fade-in">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-primary-600 mb-6 font-medium transition-colors">
            <ChevronRight className="rotate-180" size={18} /> Volver a Equipos
        </button>
        
        <div className="flex flex-col items-center space-y-8 relative">
            {/* Connecting Lines Layer */}
            <div className="absolute inset-0 z-0 flex justify-center pointer-events-none">
                 <div className="w-px h-full bg-slate-300 dark:bg-slate-700"></div>
            </div>

            {/* Level 1: Head Coach */}
            <div className="z-10 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border-t-4 border-primary-500 w-72 text-center relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">Director Técnico</div>
                <div className="w-20 h-20 rounded-full bg-slate-200 mx-auto mb-3 border-4 border-white dark:border-slate-700 shadow-md">
                     <span className="flex items-center justify-center h-full text-2xl">👨‍🏫</span>
                </div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">{team.coach}</h3>
                <p className="text-slate-500 text-sm">{team.discipline} - {team.category}</p>
                <button 
                    onClick={(e) => { e.stopPropagation(); setEditingTeam(team); setShowTeamModal(true); }}
                    className="mt-3 text-xs text-primary-600 font-bold hover:underline"
                >
                    <Edit2 size={12} className="inline mr-1"/>Editar
                </button>
            </div>

            {/* Level 2: Staff */}
            <div className="z-10 w-full flex justify-center gap-8 flex-wrap">
                 <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md border-l-4 border-blue-500 w-56 text-center">
                    <div className="flex justify-center mb-2 text-blue-500"><Activity /></div>
                    <h4 className="font-bold text-slate-700 dark:text-slate-200">Prep. Físico</h4>
                    <p className="text-sm text-slate-500">{team.physicalTrainer || 'No asignado'}</p>
                 </div>
                 <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md border-l-4 border-emerald-500 w-56 text-center">
                    <div className="flex justify-center mb-2 text-emerald-500"><Stethoscope /></div>
                    <h4 className="font-bold text-slate-700 dark:text-slate-200">Cuerpo Médico</h4>
                    <p className="text-sm text-slate-500">{team.medicalStaff || 'No asignado'}</p>
                 </div>
            </div>

             {/* Level 3: Squad */}
             <div className="z-10 w-full pt-4">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"><Users size={18}/> Plantel de Jugadores</h4>
                        <button className="text-sm text-primary-600 font-bold">Gestionar</button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                         {[...Array(11)].map((_, i) => (
                             <div key={i} className="bg-white dark:bg-slate-800 p-2 rounded-lg text-center shadow-sm border border-slate-100 dark:border-slate-700">
                                 <div className="w-10 h-10 rounded-full bg-slate-200 mx-auto mb-2"></div>
                                 <p className="text-xs font-bold text-slate-800 dark:text-white">Jugador {i+1}</p>
                                 <p className="text-[10px] text-slate-500">Titular</p>
                             </div>
                         ))}
                    </div>
                </div>
             </div>
        </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white capitalize">
                {activeTab === 'fixtures' ? 'Calendario de Temporada' : 'Cuerpo Técnico y Estructura'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
                {activeTab === 'fixtures' ? 'Gestión de partidos y competencias' : 'Organigrama deportivo por disciplina'}
            </p>
        </div>
        
        {activeTab === 'fixtures' && (
            <div className="flex gap-3">
                 <select 
                    value={selectedDiscipline}
                    onChange={(e) => setSelectedDiscipline(e.target.value)}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none dark:text-white"
                 >
                    <option value="Todas">Todas Disciplinas</option>
                    <option value="Fútbol">Fútbol</option>
                    <option value="Básquet">Básquet</option>
                    <option value="Vóley">Vóley</option>
                 </select>
                <button 
                    onClick={handleNewFixture}
                    className="flex items-center gap-2 bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
                >
                    <Plus size={18} />
                    <span>Nuevo Partido</span>
                </button>
            </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[60vh]">
        {/* --- TAB: FIXTURES --- */}
        {activeTab === 'fixtures' && (
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark