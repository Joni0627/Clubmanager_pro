
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Member, ClubConfig, Discipline, Category } from '../types';
import { 
  Users, Shield, Star, Search, ChevronRight, ChevronLeft, Settings
} from 'lucide-react';
import { db } from '../lib/supabase';

interface SquadsProps {
  clubConfig: ClubConfig;
  onGoToSettings?: () => void;
}

const Squads: React.FC<SquadsProps> = ({ clubConfig, onGoToSettings }) => {
  const [selectedSportId, setSelectedSportId] = useState<string>(clubConfig.disciplines[0]?.id || '');
  const [selectedGender, setSelectedGender] = useState<'Masculino' | 'Femenino'>('Masculino');
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const activeSport = useMemo(() => 
    clubConfig.disciplines.find(s => s.id === selectedSportId), 
  [selectedSportId, clubConfig]);

  const activeBranch = useMemo(() => 
    activeSport?.branches?.find(b => b.gender === selectedGender),
  [activeSport, selectedGender]);

  useEffect(() => {
    if (activeBranch && activeBranch.categories?.length > 0 && !selectedCatId) {
        setSelectedCatId(activeBranch.categories[0].id);
    }
  }, [activeBranch]);

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      const { data } = await db.members.getAll();
      if (data) setMembers(data);
      setIsLoading(false);
    };
    fetchMembers();
  }, []);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const filteredAthletes = useMemo(() => {
    if (!activeSport || !activeBranch) return [];
    
    return members.filter(m => {
        const matchesSearch = searchTerm === '' || m.name.toLowerCase().includes(searchTerm.toLowerCase());
        const hasAssignment = m.assignments.some(a => 
            a.disciplineId === activeSport.id && 
            a.categoryId === selectedCatId &&
            a.role === 'PLAYER'
        );
        return matchesSearch && hasAssignment;
    }).sort((a, b) => (b.overallRating || 0) - (a.overallRating || 0));
  }, [members, activeSport, selectedGender, selectedCatId, searchTerm, activeBranch]);

  if (clubConfig.disciplines.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-10 animate-fade-in">
          <Shield size={64} className="text-slate-200 mb-8" />
          <h2 className="text-3xl font-black uppercase text-center mb-4">No hay disciplinas</h2>
          <button onClick={onGoToSettings} className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs">Configurar Ahora</button>
        </div>
      );
  }

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

      <div className="relative mb-16 group/carousel">
        {showLeftArrow && (
          <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-slate-900 p-4 rounded-full shadow-xl border border-slate-200 text-primary-600 hidden md:flex items-center justify-center">
            <ChevronLeft size={24} strokeWidth={3} />
          </button>
        )}
        {showRightArrow && (
          <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-slate-900 p-4 rounded-full shadow-xl border border-slate-200 text-primary-600 hidden md:flex items-center justify-center">
            <ChevronRight size={24} strokeWidth={3} />
          </button>
        )}

        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-12 overflow-x-auto overflow-y-hidden py-12 px-12 no-scrollbar items-center snap-x snap-mandatory"
        >
            {clubConfig.disciplines.map((sport) => {
                const isActive = sport.id === selectedSportId;
                return (
                    <button 
                        key={sport.id}
                        onClick={() => { setSelectedSportId(sport.id); setSelectedCatId(''); }}
                        className={`shrink-0 flex flex-col items-center gap-6 transition-all duration-500 snap-center ${isActive ? 'scale-105' : 'opacity-30 grayscale scale-90 hover:opacity-60'}`}
                    >
                        <div className={`w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] flex items-center justify-center transition-all duration-500 relative border-4 ${isActive ? 'bg-slate-950 shadow-2xl' : 'bg-slate-100 dark:bg-slate-800 border-transparent'}`} style={isActive ? { borderColor: clubConfig.primaryColor } : {}}>
                            <div className="w-full h-full rounded-[2.1rem] overflow-hidden flex items-center justify-center bg-white dark:bg-slate-900">
                              {sport.iconUrl ? <img src={sport.iconUrl} className="w-full h-full object-cover p-1" /> : <Shield size={isActive ? 60 : 40} className="text-slate-300" />}
                            </div>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-[0.4em] transition-colors ${isActive ? 'text-primary-600' : 'text-slate-400'}`}>
                          {sport.name}
                        </span>
                    </button>
                );
            })}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
          <aside className="w-full lg:w-80 shrink-0 space-y-10">
              <div className="bg-white dark:bg-[#0f1219] rounded-[3rem] p-8 shadow-2xl border border-slate-200">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 border-b pb-4">Rama</h4>
                  <div className="flex flex-col gap-3">
                      {['Masculino', 'Femenino'].map((g) => (
                          <button key={g} onClick={() => { setSelectedGender(g as any); setSelectedCatId(''); }} className={`flex items-center justify-between p-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${selectedGender === g ? 'bg-primary-600 text-white shadow-xl' : 'bg-slate-50 dark:bg-white/5 text-slate-500 hover:bg-slate-100'}`}>
                              {g} <ChevronRight size={14} className={selectedGender === g ? 'translate-x-1' : 'opacity-0'} />
                          </button>
                      ))}
                  </div>

                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-12 mb-8 border-b pb-4">Categoría</h4>
                  <div className="flex flex-col gap-3">
                      {activeBranch?.categories?.map((cat) => (
                          <button key={cat.id} onClick={() => setSelectedCatId(cat.id)} className={`flex items-center justify-between p-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${selectedCatId === cat.id ? 'bg-slate-950 dark:bg-slate-800 text-white shadow-xl border-l-4 border-primary-600' : 'bg-slate-50 dark:bg-white/5 text-slate-500'}`}>
                              {cat.name} <Star size={12} className={selectedCatId === cat.id ? 'fill-primary-500 text-primary-500' : 'opacity-0'} />
                          </button>
                      ))}
                      {(!activeBranch || !activeBranch.categories || activeBranch.categories.length === 0) && (
                          <div className="p-10 text-center border-2 border-dashed border-slate-100 rounded-3xl mt-4">
                             <Settings size={24} className="mx-auto text-slate-300 mb-2" />
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Sin categorías configuradas</p>
                          </div>
                      )}
                  </div>
              </div>
          </aside>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {isLoading ? (
                  [...Array(6)].map((_, i) => <div key={i} className="h-96 bg-slate-200 dark:bg-white/5 rounded-[4rem] animate-pulse"></div>)
              ) : filteredAthletes.length > 0 ? (
                  filteredAthletes.map((athlete) => (
                      <div key={athlete.id} className="bg-white dark:bg-[#0f1219] rounded-[4rem] border border-slate-200 p-10 shadow-xl hover:shadow-3xl transition-all group overflow-hidden relative">
                          <div className="flex flex-col items-center relative z-10">
                              <div className="w-36 h-36 rounded-full border-4 border-slate-50 dark:border-slate-800 p-1.5 mb-8 group-hover:scale-110 transition-transform duration-700 shadow-2xl relative">
                                  <img src={athlete.photoUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-cover rounded-full" />
                                  <div className="absolute -bottom-2 -right-2 bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-black italic text-xl shadow-lg">
                                      {athlete.overallRating || 0}
                                  </div>
                              </div>
                              <h3 className="font-black uppercase tracking-tighter text-3xl text-slate-800 dark:text-white text-center leading-none mb-3">{athlete.name}</h3>
                              <div className="flex items-center gap-4">
                                 <span className="text-primary-600 font-black text-[9px] uppercase tracking-widest bg-primary-500/10 px-4 py-2 rounded-full">ATLETA</span>
                                 <span className="text-slate-400 font-black text-lg italic">DNI: {athlete.dni.slice(-4)}</span>
                              </div>
                          </div>
                      </div>
                  ))
              ) : (
                  <div className="col-span-full py-40 text-center opacity-30 border-4 border-dashed border-slate-100 rounded-[5rem]">
                      <Users size={64} className="mx-auto mb-6 text-slate-300" />
                      <h3 className="font-black uppercase tracking-[0.6em] text-[10px]">Sin atletas en esta división</h3>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default Squads;
