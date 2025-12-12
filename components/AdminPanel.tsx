import React, { useState } from 'react';
import { Staff, Fixture, Discipline, Player } from '../types.ts';
import { Plus, Trash2, Edit2, AlertCircle, Users, Activity, ChevronRight, X, Save, Trophy } from 'lucide-react';

interface AdminPanelProps {
  activeTab: 'fixtures' | 'staff';
}

const AdminPanel: React.FC<AdminPanelProps> = ({ activeTab }) => {
  // --- STATES FOR FIXTURES ---
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | 'Todas'>('Todas');
  const [showFixtureModal, setShowFixtureModal] = useState(false);
  const [editingFixture, setEditingFixture] = useState<Fixture | null>(null);

  const [fixtures] = useState<Fixture[]>([
    { id: '1', discipline: 'Fútbol', category: 'Primera', opponent: 'Real Madrid CF', date: '2023-11-15', venue: 'Home', competition: 'La Liga', result: 'Pending' },
    { id: '2', discipline: 'Básquet', category: 'Sub-20', opponent: 'Barcelona Basket', date: '2023-11-22', venue: 'Away', competition: 'Liga Endesa', result: 'Pending' },
    { id: '3', discipline: 'Vóley', category: 'Femenino', opponent: 'Club Vóley', date: '2023-11-08', venue: 'Home', competition: 'Torneo Local', result: '3-1' },
  ]);

  // --- STATES FOR STAFF/STRUCTURE ---
  const [selectedTeam, setSelectedTeam] = useState<{discipline: string, category: string} | null>(null);

  // Mock Structure Data
  const teams = [
      { discipline: 'Fútbol', category: 'Primera', coach: 'Carlo Ancelotti', playersCount: 24 },
      { discipline: 'Fútbol', category: 'Reserva', coach: 'Marcelo Gallardo', playersCount: 18 },
      { discipline: 'Básquet', category: 'Primera', coach: 'Steve Kerr', playersCount: 12 },
      { discipline: 'Vóley', category: 'Femenino', coach: 'Julio Velasco', playersCount: 14 },
  ];

  const handleFixtureEdit = (fixture: Fixture) => {
    setEditingFixture(fixture);
    setShowFixtureModal(true);
  };

  const handleNewFixture = () => {
    setEditingFixture(null);
    setShowFixtureModal(true);
  };

  // --- COMPONENT: TEAM HIERARCHY (Flowchart View) ---
  const TeamHierarchy = ({ team, onBack }: { team: {discipline: string, category: string}, onBack: () => void }) => (
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
                     {/* Img placeholder */}
                     <span className="flex items-center justify-center h-full text-2xl">👨‍🏫</span>
                </div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Carlo Ancelotti</h3>
                <p className="text-slate-500 text-sm">{team.discipline} - {team.category}</p>
                <button className="mt-3 text-xs text-primary-600 font-bold hover:underline"><Edit2 size={12} className="inline mr-1"/>Editar</button>
            </div>

            {/* Level 2: Staff */}
            <div className="z-10 w-full flex justify-center gap-8 flex-wrap">
                 <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md border-l-4 border-blue-500 w-56 text-center">
                    <h4 className="font-bold text-slate-700 dark:text-slate-200">Prep. Físico</h4>
                    <p className="text-sm text-slate-500">Antonio Pintus</p>
                 </div>
                 <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md border-l-4 border-emerald-500 w-56 text-center">
                    <h4 className="font-bold text-slate-700 dark:text-slate-200">Cuerpo Médico</h4>
                    <p className="text-sm text-slate-500">Dr. House</p>
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
                                 <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Jugador {i+1}</p>
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
                    onChange={(e) => setSelectedDiscipline(e.target.value as any)}
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
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">Disciplina/Cat</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">Fecha</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">Oponente</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">Competición</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">Resultado</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-400 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {fixtures
                .filter(f => selectedDiscipline === 'Todas' || f.discipline === selectedDiscipline)
                .map((match) => (
                <tr key={match.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 group">
                  <td className="p-4">
                      <div className="font-bold text-slate-800 dark:text-white text-sm">{match.discipline}</div>
                      <div className="text-xs text-slate-500">{match.category}</div>
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-300 font-mono text-sm">{match.date}</td>
                  <td className="p-4 font-medium text-slate-900 dark:text-white">{match.opponent}</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400 text-sm">{match.competition}</td>
                  <td className="p-4 font-mono font-bold dark:text-white text-sm">{match.result}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => handleFixtureEdit(match)}
                            className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                        >
                            <Edit2 size={16}/>
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                            <Trash2 size={16}/>
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* --- TAB: STRUCTURE / STAFF --- */}
        {activeTab === 'staff' && (
            <div className="p-6">
                {!selectedTeam ? (
                    // VIEW 1: TEAMS BUBBLES
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                        {teams.map((team, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => setSelectedTeam(team)}
                                className="group cursor-pointer bg-slate-50 dark:bg-slate-700/30 rounded-2xl p-6 border-2 border-transparent hover:border-primary-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Trophy size={64} />
                                </div>
                                <div className="flex flex-col h-full relative z-10">
                                    <div className="mb-4">
                                        <span className="inline-block px-3 py-1 bg-white dark:bg-slate-800 text-primary-600 font-bold text-xs rounded-full shadow-sm mb-2">
                                            {team.discipline}
                                        </span>
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">{team.category}</h3>
                                    </div>
                                    
                                    <div className="mt-auto space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs">DT</div>
                                            <span>{team.coach}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <Users size={14} /> {team.playersCount} Jugadores asignados
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                         <button className="group border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:text-primary-600 hover:border-primary-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                             <Plus size={32} className="mb-2" />
                             <span className="font-bold">Crear Nuevo Equipo</span>
                         </button>
                    </div>
                ) : (
                    // VIEW 2: HIERARCHY
                    <TeamHierarchy team={selectedTeam} onBack={() => setSelectedTeam(null)} />
                )}
            </div>
        )}
      </div>

      {/* --- MODAL: FIXTURE ABM --- */}
      {showFixtureModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 animate-fade-in">
                  <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                          {editingFixture ? 'Editar Partido' : 'Nuevo Registro'}
                      </h3>
                      <button onClick={() => setShowFixtureModal(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={20} />
                      </button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase">Disciplina</label>
                              <select className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded dark:text-white">
                                  <option>Fútbol</option>
                                  <option>Básquet</option>
                                  <option>Vóley</option>
                              </select>
                          </div>
                          <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase">Categoría</label>
                              <select className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded dark:text-white">
                                  <option>Primera</option>
                                  <option>Reserva</option>
                                  <option>Sub-20</option>
                              </select>
                          </div>
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Rival</label>
                          <input type="text" className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded dark:text-white" defaultValue={editingFixture?.opponent} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase">Fecha</label>
                              <input type="date" className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded dark:text-white" defaultValue={editingFixture?.date} />
                          </div>
                          <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase">Condición</label>
                              <select className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded dark:text-white" defaultValue={editingFixture?.venue}>
                                  <option value="Home">Local</option>
                                  <option value="Away">Visitante</option>
                              </select>
                          </div>
                      </div>
                  </div>
                  <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                      <button onClick={() => setShowFixtureModal(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium">Cancelar</button>
                      <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-primary-500/20">
                          <Save size={18} /> Guardar
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminPanel;