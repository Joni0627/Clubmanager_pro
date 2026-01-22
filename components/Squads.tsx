
import React, { useState, useMemo, useEffect } from 'react';
import { Player, ClubConfig, Discipline } from '../types';
import { 
  Users, Shield, Sparkles, Loader2, Star, Zap
} from 'lucide-react';
import { db } from '../lib/supabase';
import { GoogleGenAI } from '@google/genai';
import { SportIcon } from './MasterData.tsx';

interface SquadsProps {
  clubConfig: ClubConfig;
}

const Squads: React.FC<SquadsProps> = ({ clubConfig }) => {
  const [selectedDiscId, setSelectedDiscId] = useState<string>(clubConfig.disciplines[0]?.id || '');
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activeDisc = useMemo(() => 
    clubConfig.disciplines.find(d => d.id === selectedDiscId), 
  [selectedDiscId, clubConfig]);

  useEffect(() => {
    if (activeDisc && activeDisc.categories.length > 0 && !selectedCatId) {
        setSelectedCatId(activeDisc.categories[0].id);
    }
  }, [activeDisc]);

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
    return players.filter(p => 
        p.discipline === activeDisc?.name && 
        p.category === activeDisc?.categories.find(c => c.id === selectedCatId)?.name
    ).sort((a, b) => b.overallRating - a.overallRating);
  }, [players, activeDisc, selectedCatId]);

  return (
    <div className="p-4 md:p-12 max-w-7xl mx-auto animate-fade-in pb-40">
      <header className="mb-12">
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-slate-900 dark:text-white mb-4">Deportes</h2>
      </header>

      {/* ESPN PREMIUM WHEEL */}
      <div className="relative mb-20 overflow-hidden">
        <div className="flex gap-8 md:gap-12 overflow-x-auto pb-8 px-4 no-scrollbar items-center">
            {clubConfig.disciplines.map((disc) => {
                const isActive = disc.id === selectedDiscId;
                return (
                    <button 
                        key={disc.id}
                        onClick={() => { setSelectedDiscId(disc.id); setSelectedCatId(''); }}
                        className={`shrink-0 flex flex-col items-center gap-5 transition-all duration-500 ${isActive ? 'scale-110' : 'opacity-30 grayscale hover:opacity-60'}`}
                    >
                        <div 
                            className={`w-28 h-28 md:w-40 md:h-40 rounded-full flex items-center justify-center transition-all duration-500 shadow-3xl relative border-4 ${isActive ? 'bg-[#1a1d23] text-white' : 'bg-[#1a1d23]/40 text-slate-500 border-transparent'}`}
                            style={isActive ? { borderColor: clubConfig.primaryColor } : {}}
                        >
                            <SportIcon id={disc.icon || 'soccer'} size={isActive ? 64 : 40} />
                            {isActive && (
                                <div className="absolute inset-0 rounded-full animate-pulse ring-8 ring-white/10"></div>
                            )}
                        </div>
                        <span className={`text-[10px] md:text-xs font-black uppercase tracking-[0.25em] ${isActive ? 'text-slate-900 dark:text-white underline decoration-4 underline-offset-8' : 'text-slate-500'}`} style={isActive ? { textDecorationColor: clubConfig.primaryColor } : {}}>
                            {disc.name}
                        </span>
                    </button>
                );
            })}
        </div>
      </div>

      {/* CATEGORY SELECTOR PILLS */}
      {activeDisc && (
          <div className="flex flex-wrap gap-3 mb-16">
              {activeDisc.categories.map((cat) => (
                  <button 
                      key={cat.id}
                      onClick={() => setSelectedCatId(cat.id)}
                      className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCatId === cat.id ? 'bg-slate-900 dark:bg-primary-600 text-white shadow-2xl scale-105' : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-white/5'}`}
                  >
                      {cat.name}
                  </button>
              ))}
          </div>
      )}

      {/* SQUAD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {isLoading ? (
              [...Array(4)].map((_, i) => <div key={i} className="h-96 bg-slate-200 dark:bg-white/5 rounded-[4rem] animate-pulse"></div>)
          ) : filteredPlayers.length > 0 ? (
              filteredPlayers.map((player) => (
                  <div key={player.id} className="bg-white dark:bg-[#0f1219] rounded-[4rem] border border-slate-200 dark:border-white/5 p-8 shadow-xl hover:shadow-2xl transition-all group overflow-hidden">
                      <div className="flex flex-col items-center">
                          <div className="w-32 h-32 rounded-full border-4 border-slate-50 dark:border-slate-800 p-1 mb-6 group-hover:scale-110 transition-transform duration-500">
                              <img src={player.photoUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-cover rounded-full" />
                          </div>
                          <h3 className="font-black uppercase tracking-tighter text-2xl text-slate-800 dark:text-white text-center">{player.name}</h3>
                          <div className="flex items-center gap-3 mt-2">
                             <span className="text-primary-600 font-black text-xs uppercase tracking-widest">{player.position}</span>
                             <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                             <span className="text-slate-400 font-black text-xs">#{player.number}</span>
                          </div>
                          <div className="mt-8 text-5xl font-black italic text-slate-100 dark:text-slate-800/50 group-hover:text-primary-600/20 transition-colors">
                              {player.overallRating}
                          </div>
                      </div>
                  </div>
              ))
          ) : (
              <div className="col-span-full py-32 text-center opacity-40">
                  <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users size={40} />
                  </div>
                  <h3 className="font-black uppercase tracking-widest text-[10px]">No hay atletas registrados</h3>
              </div>
          )}
      </div>
    </div>
  );
};

export default Squads;
