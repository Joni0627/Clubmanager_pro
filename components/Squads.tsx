
import React, { useState, useMemo, useEffect } from 'react';
import { Player, ClubConfig, Discipline } from '../types';
import { 
  Users, Shield, Sparkles, Loader2, Star, Zap, Image as ImageIcon
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
      <header className="mb-16">
        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-slate-900 dark:text-white mb-4">Estructura</h2>
        <div className="w-24 h-2 bg-primary-600 rounded-full"></div>
      </header>

      {/* CUSTOM AVATAR WHEEL */}
      <div className="relative mb-24 overflow-hidden">
        <div className="flex gap-10 md:gap-14 overflow-x-auto pb-10 px-4 no-scrollbar items-center">
            {clubConfig.disciplines.map((disc) => {
                const isActive = disc.id === selectedDiscId;
                const isCustomImage = disc.icon && (disc.icon.startsWith('data:') || disc.icon.startsWith('http'));

                return (
                    <button 
                        key={disc.id}
                        onClick={() => { setSelectedDiscId(disc.id); setSelectedCatId(''); }}
                        className={`shrink-0 flex flex-col items-center gap-6 transition-all duration-700 ${isActive ? 'scale-110' : 'opacity-30 grayscale hover:opacity-70 scale-90'}`}
                    >
                        <div 
                            className={`w-32 h-32 md:w-44 md:h-44 rounded-full flex items-center justify-center transition-all duration-700 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative border-4 ${isActive ? 'bg-slate-950 text-white' : 'bg-slate-800 text-slate-500 border-transparent'}`}
                            style={isActive ? { borderColor: clubConfig.primaryColor } : {}}
                        >
                            {isCustomImage ? (
                                <img src={disc.icon} className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <SportIcon id={disc.icon || 'soccer'} size={isActive ? 64 : 40} />
                            )}
                            
                            {isActive && (
                                <>
                                    <div className="absolute -inset-4 rounded-full border border-white/10 animate-ping"></div>
                                    <div className="absolute inset-0 rounded-full ring-8 ring-white/5"></div>
                                </>
                            )}
                        </div>
                        <div className="text-center">
                            <span className={`text-[11px] md:text-xs font-black uppercase tracking-[0.3em] block transition-all ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                {disc.name}
                            </span>
                            {isActive && <div className="w-8 h-1 bg-primary-600 mx-auto mt-2 rounded-full"></div>}
                        </div>
                    </button>
                );
            })}
        </div>
      </div>

      {/* CATEGORY SELECTOR PILLS */}
      {activeDisc && (
          <div className="flex flex-wrap gap-4 mb-20 bg-white/50 dark:bg-white/5 p-3 rounded-[2.5rem] backdrop-blur-xl w-fit border border-slate-100 dark:border-white/5 shadow-inner">
              {activeDisc.categories.map((cat) => (
                  <button 
                      key={cat.id}
                      onClick={() => setSelectedCatId(cat.id)}
                      className={`px-12 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${selectedCatId === cat.id ? 'bg-slate-950 dark:bg-primary-600 text-white shadow-2xl scale-105' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'}`}
                  >
                      {cat.name}
                  </button>
              ))}
          </div>
      )}

      {/* SQUAD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {isLoading ? (
              [...Array(4)].map((_, i) => <div key={i} className="h-[450px] bg-slate-200 dark:bg-white/5 rounded-[4rem] animate-pulse"></div>)
          ) : filteredPlayers.length > 0 ? (
              filteredPlayers.map((player) => (
                  <div key={player.id} className="bg-white dark:bg-[#0f1219] rounded-[4rem] border border-slate-200 dark:border-white/5 p-10 shadow-xl hover:shadow-3xl transition-all group overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                         <Shield size={120} />
                      </div>
                      
                      <div className="flex flex-col items-center relative z-10">
                          <div className="w-36 h-36 rounded-full border-4 border-slate-50 dark:border-slate-800 p-1.5 mb-8 group-hover:scale-110 transition-transform duration-700 shadow-2xl">
                              <img src={player.photoUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-cover rounded-full" />
                          </div>
                          <h3 className="font-black uppercase tracking-tighter text-3xl text-slate-800 dark:text-white text-center leading-none mb-3">{player.name}</h3>
                          <div className="flex items-center gap-4">
                             <span className="text-primary-600 font-black text-xs uppercase tracking-widest bg-primary-500/10 px-4 py-1.5 rounded-full">{player.position}</span>
                             <span className="text-slate-400 font-black text-lg italic">#{player.number}</span>
                          </div>
                          <div className="mt-12 text-7xl font-black italic text-slate-100 dark:text-slate-800/40 group-hover:text-primary-600/10 transition-colors">
                              {player.overallRating}
                          </div>
                      </div>
                  </div>
              ))
          ) : (
              <div className="col-span-full py-40 text-center opacity-30 border-4 border-dashed border-slate-100 dark:border-white/5 rounded-[5rem]">
                  <Users size={64} className="mx-auto mb-6 text-slate-200" />
                  <h3 className="font-black uppercase tracking-[0.5em] text-[10px]">Sin atletas en este plantel</h3>
              </div>
          )}
      </div>
    </div>
  );
};

export default Squads;
