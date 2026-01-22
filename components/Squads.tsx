
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
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none text-slate-900 dark:text-white mb-4">Deportes</h2>
      </header>

      {/* ESPN STYLE DISCIPLINE WHEEL */}
      <div className="relative mb-16 overflow-hidden">
        <div className="flex gap-6 md:gap-10 overflow-x-auto pb-8 px-4 no-scrollbar items-center">
            {clubConfig.disciplines.map((disc) => {
                const isActive = disc.id === selectedDiscId;
                return (
                    <button 
                        key={disc.id}
                        onClick={() => { setSelectedDiscId(disc.id); setSelectedCatId(''); }}
                        className={`shrink-0 flex flex-col items-center gap-4 transition-all duration-500 ${isActive ? 'scale-110' : 'opacity-40 grayscale'}`}
                    >
                        <div 
                            className={`w-24 h-24 md:w-36 md:h-36 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl relative border-2 ${isActive ? 'bg-slate-900 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 border-transparent'}`}
                            style={isActive ? { borderColor: clubConfig.primaryColor } : {}}
                        >
                            <SportIcon id={disc.icon || 'soccer'} size={isActive ? 56 : 32} />
                            {isActive && <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-pulse"></div>}
                        </div>
                        <span className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{disc.name}</span>
                    </button>
                );
            })}
        </div>
      </div>

      {/* CATEGORY SELECTOR */}
      {activeDisc && (
          <div className="flex flex-wrap gap-3 mb-12">
              {activeDisc.categories.map((cat) => (
                  <button 
                      key={cat.id}
                      onClick={() => setSelectedCatId(cat.id)}
                      className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCatId === cat.id ? 'bg-primary-600 text-white shadow-xl' : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-white/5'}`}
                  >
                      {cat.name}
                  </button>
              ))}
          </div>
      )}

      {/* SQUAD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
              [...Array(4)].map((_, i) => <div key={i} className="h-80 bg-slate-200 dark:bg-white/5 rounded-[3rem] animate-pulse"></div>)
          ) : filteredPlayers.map((player) => (
              <div key={player.id} className="bg-white dark:bg-[#0f1219] rounded-[3rem] border border-slate-200 dark:border-white/5 p-6 shadow-sm hover:shadow-2xl transition-all">
                  <div className="flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full border-4 border-slate-50 dark:border-slate-800 p-1 mb-6">
                          <img src={player.photoUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-cover rounded-full" />
                      </div>
                      <h3 className="font-black uppercase tracking-tighter text-xl text-slate-800 dark:text-white">{player.name}</h3>
                      <p className="text-[10px] font-black text-primary-500 uppercase mt-1">{player.position} | #{player.number}</p>
                      <div className="mt-4 text-3xl font-black italic text-slate-200 dark:text-slate-800">{player.overallRating}</div>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};

export default Squads;
