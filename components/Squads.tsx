
import React, { useState, useMemo, useEffect } from 'react';
import { Player, ClubConfig, Discipline, Branch, Category } from '../types';
import { 
  Users, Shield, Star, Zap, Image as ImageIcon, ChevronRight, Filter, Search
} from 'lucide-react';
import { db } from '../lib/supabase';
import { SportIcon } from './MasterData.tsx';

interface SquadsProps {
  clubConfig: ClubConfig;
}

const Squads: React.FC<SquadsProps> = ({ clubConfig }) => {
  const [selectedSportId, setSelectedSportId] = useState<string>(clubConfig.disciplines[0]?.id || '');
  const [selectedGender, setSelectedGender] = useState<'Masculino' | 'Femenino'>('Masculino');
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const activeSport = useMemo(() => 
    clubConfig.disciplines.find(s => s.id === selectedSportId), 
  [selectedSportId, clubConfig]);

  const activeBranch = useMemo(() => 
    activeSport?.branches.find(b => b.gender === selectedGender),
  [activeSport, selectedGender]);

  useEffect(() => {
    if (activeBranch && activeBranch.categories.length > 0 && !selectedCatId) {
        setSelectedCatId(activeBranch.categories[0].id);
    }
  }, [activeBranch]);

  useEffect(() => {
    const fetchPlayers = async () => {
      setIsLoading(true);
      const { data } = await db.players.getAll();
      if (data) setPlayers(data);
      setIsLoading(false);
    };
    fetchPlayers();
  }, []);

  const filteredPlayers = useMemo(() => {
    const activeCatName = activeBranch?.categories.find(c => c.id === selectedCatId)?.name;
    return players.filter(p => 
        p.discipline === activeSport?.name && 
        p.gender === selectedGender &&
        p.category === activeCatName &&
        (searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a, b) => b.overallRating - a.overallRating);
  }, [players, activeSport, selectedGender, selectedCatId, searchTerm, activeBranch]);

  return (
    <div className="p-4 md:p-12 max-w-7xl mx-auto animate-fade-in pb-40">
      <header className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
        <div>
          <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none text-slate-900 dark:text-white">Planteles</h2>
          <div className="flex items-center gap-4 mt-6">
              <div className="w-16 h-2 bg-primary-600 rounded-full"></div>
              <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Gestión de Talentos</p>
          </div>
        </div>
        <div className="relative w-full md:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="BUSCAR ATLETA..." 
                className="w-full pl-16 pr-8 py-5 bg-white dark:bg-[#0f1219] rounded-3xl border border-slate-200 dark:border-white/5 outline-none font-black text-xs uppercase tracking-widest shadow-xl" 
            />
        </div>
      </header>

      {/* SPORT SELECTION WHEEL */}
      <div className="flex gap-12 overflow-x-auto pb-12 px-4 no-scrollbar items-center mb-16">
          {clubConfig.disciplines.map((sport) => {
              const isActive = sport.id === selectedSportId;
              return (
                  <button 
                      key={sport.id}
                      onClick={() => { setSelectedSportId(sport.id); setSelectedCatId(''); }}
                      className={`shrink-0 flex flex-col items-center gap-6 transition-all duration-700 ${isActive ? 'scale-110' : 'opacity-20 grayscale scale-90 hover:opacity-50'}`}
                  >
                      <div className={`w-32 h-32 md:w-44 md:h-44 rounded-full flex items-center justify-center transition-all duration-700 relative border-4 ${isActive ? 'bg-slate-950 text-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]' : 'bg-slate-800 text-slate-500 border-transparent'}`} style={isActive ? { borderColor: clubConfig.primaryColor } : {}}>
                          {sport.icon ? (
                              <img src={sport.icon} className="w-full h-full object-cover rounded-full" />
                          ) : (
                              <SportIcon id="soccer" size={isActive ? 80 : 50} />
                          )}
                          {isActive && <div className="absolute -inset-4 rounded-full border-2 border-primary-600/30 animate-ping"></div>}
                      </div>
                      <span className={`text-[11px] font-black uppercase tracking-[0.4em] ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{sport.name}</span>
                  </button>
              );
          })}
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
          {/* SIDEBAR FILTERS (Gender & Category) */}
          <aside className="w-full lg:w-80 shrink-0 space-y-10">
              <div className="bg-white dark:bg-[#0f1219] rounded-[3rem] p-8 shadow-2xl border border-slate-200 dark:border-white/5">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 border-b border-slate-100 dark:border-white/5 pb-4">Rama</h4>
                  <div className="flex flex-col gap-3">
                      {['Masculino', 'Femenino'].map((g) => (
                          <button 
                            key={g} 
                            onClick={() => { setSelectedGender(g as any); setSelectedCatId(''); }}
                            className={`flex items-center justify-between p-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${selectedGender === g ? 'bg-primary-600 text-white shadow-xl' : 'bg-slate-50 dark:bg-white/5 text-slate-500 hover:bg-slate-100'}`}
                          >
                              {g} <ChevronRight size={14} className={selectedGender === g ? 'translate-x-1' : 'opacity-0'} />
                          </button>
                      ))}
                  </div>

                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-12 mb-8 border-b border-slate-100 dark:border-white/5 pb-4">Categoría</h4>
                  <div className="flex flex-col gap-3">
                      {activeBranch?.categories.map((cat) => (
                          <button 
                            key={cat.id} 
                            onClick={() => setSelectedCatId(cat.id)}
                            className={`flex items-center justify-between p-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${selectedCatId === cat.id ? 'bg-slate-950 dark:bg-slate-800 text-white shadow-xl border-l-4 border-primary-600' : 'bg-slate-50 dark:bg-white/5 text-slate-500'}`}
                          >
                              {cat.name} <Star size={12} className={selectedCatId === cat.id ? 'fill-primary-500 text-primary-500' : 'opacity-0'} />
                          </button>
                      ))}
                      {activeBranch?.categories.length === 0 && (
                          <p className="text-[9px] font-bold text-slate-400 uppercase italic">No hay categorías configuradas</p>
                      )}
                  </div>
              </div>
          </aside>

          {/* PLAYER GRID */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {isLoading ? (
                  [...Array(6)].map((_, i) => <div key={i} className="h-96 bg-slate-200 dark:bg-white/5 rounded-[4rem] animate-pulse"></div>)
              ) : filteredPlayers.length > 0 ? (
                  filteredPlayers.map((player) => (
                      <div key={player.id} className="bg-white dark:bg-[#0f1219] rounded-[4rem] border border-slate-200 dark:border-white/5 p-10 shadow-xl hover:shadow-3xl transition-all group overflow-hidden relative">
                          <div className="flex flex-col items-center relative z-10">
                              <div className="w-36 h-36 rounded-full border-4 border-slate-50 dark:border-slate-800 p-1.5 mb-8 group-hover:scale-110 transition-transform duration-700 shadow-2xl relative">
                                  <img src={player.photoUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-cover rounded-full" />
                                  <div className="absolute -bottom-2 -right-2 bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-black italic text-xl shadow-lg">
                                      {player.overallRating}
                                  </div>
                              </div>
                              <h3 className="font-black uppercase tracking-tighter text-3xl text-slate-800 dark:text-white text-center leading-none mb-3">{player.name}</h3>
                              <div className="flex items-center gap-4">
                                 <span className="text-primary-600 font-black text-[9px] uppercase tracking-widest bg-primary-500/10 px-4 py-2 rounded-full">{player.position}</span>
                                 <span className="text-slate-400 font-black text-lg italic">#{player.number}</span>
                              </div>
                          </div>
                          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                             <Shield size={140} />
                          </div>
                      </div>
                  ))
              ) : (
                  <div className="col-span-full py-40 text-center opacity-30 border-4 border-dashed border-slate-100 dark:border-white/5 rounded-[5rem]">
                      <Users size={64} className="mx-auto mb-6 text-slate-300" />
                      <h3 className="font-black uppercase tracking-[0.6em] text-[10px]">Sin atletas registrados en esta categoría</h3>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default Squads;
