
import React, { useState, useEffect, useMemo } from 'react';
import { Discipline, ClubConfig, Member, Player, Category } from '../types';
import { 
  BarChart3, Users, CalendarCheck2, Stethoscope, ChevronLeft, 
  Activity, Trophy, TrendingUp, Filter, Loader2, User, UserCheck
} from 'lucide-react';
import Dashboard from './Dashboard';
import AttendanceTracker from './AttendanceTracker';
import MedicalDashboard from './MedicalDashboard';
import PlayerCard from './PlayerCard';
import { db } from '../lib/supabase';

interface DisciplineConsoleProps {
  discipline: Discipline;
  clubConfig: ClubConfig;
  members: Member[];
  onBack: () => void;
  onRefresh?: () => Promise<void> | void;
}

const DisciplineConsole: React.FC<DisciplineConsoleProps> = ({ discipline, clubConfig, members, onBack, onRefresh }) => {
  const [activeSubTab, setActiveSubTab] = useState<'summary' | 'players' | 'attendance' | 'medical'>('summary');
  const [selectedGender, setSelectedGender] = useState<'Masculino' | 'Femenino'>('Masculino');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [persistedPlayers, setPersistedPlayers] = useState<Player[]>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);

  // 1. Obtener la rama actual
  const activeBranch = useMemo(() => 
    discipline.branches.find(b => b.gender === selectedGender && b.enabled),
  [discipline, selectedGender]);

  // 2. Setear categoría por defecto
  useEffect(() => {
    if (activeBranch && activeBranch.categories.length > 0) {
      setSelectedCategoryId(activeBranch.categories[0].id);
    }
  }, [activeBranch]);

  // 3. CARGA DE DATOS DESDE SUPABASE (Tabla Players)
  const fetchPlayersData = async () => {
    if (!selectedCategoryId || !activeBranch) return;
    
    setIsLoadingPlayers(true);
    try {
      const categoryName = activeBranch.categories.find(c => c.id === selectedCategoryId)?.name;
      const { data, error } = await db.players.getAll();
      
      if (data) {
        // Filtramos los datos de la tabla players que correspondan a esta consola
        const filtered = data.filter(p => 
          p.discipline === discipline.name && 
          p.category === categoryName
        );
        setPersistedPlayers(filtered);
      }
    } catch (err) {
      console.error("Error fetching players table:", err);
    } finally {
      setIsLoadingPlayers(false);
    }
  };

  useEffect(() => {
    fetchPlayersData();
  }, [selectedCategoryId, discipline.name]);

  // 4. MERGE LÓGICO: Cruzamos Miembros Asignados con Datos Persistidos
  const displayPlayers = useMemo(() => {
    if (!selectedCategoryId) return [];
    
    // Filtramos miembros que tengan la asignación
    const assignedMembers = members.filter(m => 
      m.assignments.some(a => 
        a.disciplineId === discipline.id && 
        a.categoryId === selectedCategoryId &&
        a.role === 'PLAYER'
      )
    );

    return assignedMembers.map(m => {
      // Buscamos si este miembro ya tiene datos guardados en la tabla 'players'
      const savedData = persistedPlayers.find(p => p.dni === m.dni || p.id === m.id);
      
      const categoryName = activeBranch?.categories.find(c => c.id === selectedCategoryId)?.name || '';

      // Si hay datos guardados, los usamos. Si no, usamos valores base del miembro.
      return {
        id: m.id,
        name: m.name,
        dni: m.dni,
        number: savedData?.number || '00',
        position: savedData?.position || 'N/A',
        discipline: discipline.name,
        gender: m.gender,
        category: categoryName,
        photoUrl: m.photoUrl,
        email: m.email,
        overallRating: savedData?.overallRating || 0,
        stats: savedData?.stats || {},
        medical: savedData?.medical || { isFit: true, expiryDate: '' },
        status: savedData?.status || 'Active'
      };
    });
  }, [members, discipline.id, discipline.name, selectedCategoryId, persistedPlayers, activeBranch]);

  const subTabs = [
    { id: 'summary', label: 'Resumen', icon: BarChart3 },
    { id: 'players', label: 'Plantel', icon: Users },
    { id: 'attendance', label: 'Asistencia', icon: CalendarCheck2 },
    { id: 'medical', label: 'Médico', icon: Stethoscope },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] mt-24 animate-fade-in overflow-hidden bg-slate-50 dark:bg-[#080a0f] border-t border-slate-200 dark:border-white/5">
      <header className="flex-none bg-white dark:bg-[#0f1219] border-b border-slate-200 dark:border-white/10 z-[140] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
            <div className="flex items-center gap-5 w-full md:w-auto">
              <button onClick={onBack} className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-400 hover:text-primary-600 transition-all shadow-sm border border-slate-200">
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center shadow-xl border border-primary-600/30">
                  {discipline.iconUrl ? <img src={discipline.iconUrl} className="w-full h-full object-cover p-1.5" /> : <Activity size={24} className="text-primary-600" />}
                </div>
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter dark:text-white italic">{discipline.name}</h2>
                  <p className="text-[9px] font-black text-primary-600 uppercase tracking-[0.3em]">Consola Deportiva</p>
                </div>
              </div>
            </div>

            <div className="flex gap-1.5 bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl border border-slate-200">
              {subTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeSubTab === tab.id ? 'bg-white dark:bg-slate-800 text-primary-600 shadow-md scale-105' : 'text-slate-400'}`}
                >
                  <tab.icon size={14} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 pb-6 border-t border-slate-100 dark:border-white/5 pt-6">
            <div className="flex flex-col gap-2">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Seleccionar Rama</span>
              <div className="flex gap-2">
                {['Masculino', 'Femenino'].map(g => (
                  <button
                    key={g}
                    onClick={() => setSelectedGender(g as any)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${selectedGender === g ? 'bg-slate-950 text-white border-slate-950 shadow-lg' : 'bg-transparent border-slate-100 text-slate-400 opacity-60'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">División / Categoría</span>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {activeBranch?.categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 whitespace-nowrap ${selectedCategoryId === cat.id ? 'bg-primary-600 text-white border-primary-600 shadow-lg' : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-400'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#080a0f] p-6 md:p-12">
        <div className="max-w-7xl mx-auto">
          {isLoadingPlayers ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-primary-600 mb-4" size={32} />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Sincronizando Atletas...</p>
            </div>
          ) : (
            <>
              {activeSubTab === 'summary' && (
                <Dashboard currentCategory={activeBranch?.categories.find(c => c.id === selectedCategoryId)?.name || 'General'} />
              )}

              {activeSubTab === 'players' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in">
                  {displayPlayers.length > 0 ? displayPlayers.map(athlete => (
                    <div 
                      key={athlete.id} 
                      onClick={() => setSelectedPlayer(athlete)}
                      className="bg-white dark:bg-[#0f1219] rounded-[3.5rem] p-10 border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all cursor-pointer group"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-28 h-28 rounded-full border-4 border-slate-50 dark:border-slate-800 p-1.5 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl relative">
                          <img src={athlete.photoUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-cover rounded-full" />
                          <div className="absolute -bottom-1 -right-1 bg-primary-600 text-white w-9 h-9 rounded-full flex items-center justify-center font-black italic text-xs shadow-lg">
                            {athlete.overallRating}
                          </div>
                        </div>
                        <h3 className="font-black uppercase tracking-tighter text-2xl text-slate-800 dark:text-white text-center leading-none mb-1 truncate w-full">{athlete.name}</h3>
                        <p className="text-[10px] font-black text-primary-600 mb-4">{athlete.position} #{athlete.number}</p>
                        <div className="flex items-center gap-3">
                           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">Sincronizado</span>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full py-40 text-center opacity-30 border-4 border-dashed border-slate-200 dark:border-white/5 rounded-[5rem]">
                       <Users size={64} className="mx-auto mb-6 text-slate-300" />
                       <h3 className="font-black uppercase tracking-[0.6em] text-[10px]">Sin miembros asignados</h3>
                    </div>
                  )}
                </div>
              )}

              {activeSubTab === 'attendance' && (
                <AttendanceTracker players={displayPlayers} clubConfig={clubConfig} forceSelectedDisc={discipline.name} />
              )}

              {activeSubTab === 'medical' && (
                <MedicalDashboard players={displayPlayers} onRefresh={fetchPlayersData} />
              )}
            </>
          )}
        </div>
      </div>

      {selectedPlayer && (
        <PlayerCard 
          player={selectedPlayer} 
          onClose={() => setSelectedPlayer(null)} 
          onSaveSuccess={() => {
            fetchPlayersData();
            if (onRefresh) onRefresh();
          }}
          clubConfig={clubConfig}
        />
      )}
    </div>
  );
};

export default DisciplineConsole;
