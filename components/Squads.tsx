
import React, { useState, useMemo, useEffect } from 'react';
import { Player, ClubConfig, Discipline } from '../types';
import { Trophy, Users, Shield, Sparkles, ChevronRight, User, Hash, Info, Loader2, Star, Zap } from 'lucide-react';
import { db } from '../lib/supabase';
import { GoogleGenAI } from '@google/genai';

interface SquadsProps {
  clubConfig: ClubConfig;
}

const Squads: React.FC<SquadsProps> = ({ clubConfig }) => {
  const [selectedDiscId, setSelectedDiscId] = useState<string>(clubConfig.disciplines[0]?.id || '');
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiOptimizing, setIsAiOptimizing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

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

  const activeCat = useMemo(() => 
    activeDisc?.categories.find(c => c.id === selectedCatId),
  [selectedCatId, activeDisc]);

  const filteredPlayers = useMemo(() => {
    return players.filter(p => 
        p.discipline === activeDisc?.name && 
        p.category === activeCat?.name
    ).sort((a, b) => b.overallRating - a.overallRating);
  }, [players, activeDisc, activeCat]);

  const handleAiOptimization = async () => {
    if (filteredPlayers.length === 0) return;
    setIsAiOptimizing(true);
    setAiSuggestion(null);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const playersList = filteredPlayers.map(p => `- ${p.name} (${p.position}, Rating: ${p.overallRating})`).join('\n');
    
    const prompt = `Como analista táctico senior de ${activeDisc?.name}, analiza este plantel de la categoría ${activeCat?.name} y sugiere el 11 Ideal (o formación titular recomendada):
    
    Lista de jugadores:
    ${playersList}
    
    Por favor, responde con:
    1. Formación táctica recomendada (ej: 4-3-3).
    2. Los nombres de los titulares con una breve justificación basada en su rating.
    3. Una frase de motivación para el equipo.
    Mantenlo conciso y profesional.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      setAiSuggestion(response.text);
    } catch (error) {
      setAiSuggestion("No se pudo conectar con el motor táctico de IA en este momento.");
    } finally {
      setIsAiOptimizing(false);
    }
  };

  return (
    <div className="p-4 md:p-12 max-w-7xl mx-auto animate-fade-in pb-40">
      <header className="mb-12">
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none text-slate-900 dark:text-white mb-4">Planteles</h2>
        <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] flex items-center gap-2">
            <span className="w-8 h-px bg-primary-500"></span> Gestión de Talentos & Táctica
        </p>
      </header>

      {/* DISCIPLINE WHEEL (The Wheel) */}
      <div className="relative mb-12 overflow-hidden">
        <div className="flex gap-4 md:gap-8 overflow-x-auto pb-6 px-4 no-scrollbar items-center">
            {clubConfig.disciplines.map((disc) => {
                const isActive = disc.id === selectedDiscId;
                return (
                    <button 
                        key={disc.id}
                        onClick={() => { setSelectedDiscId(disc.id); setSelectedCatId(''); }}
                        className={`shrink-0 flex flex-col items-center gap-4 transition-all duration-500 group ${isActive ? 'scale-110' : 'opacity-40 hover:opacity-70 scale-90'}`}
                    >
                        <div 
                            className={`w-20 h-20 md:w-32 md:h-32 rounded-[2.5rem] md:rounded-[3.5rem] flex items-center justify-center transition-all duration-500 shadow-2xl ${isActive ? 'bg-primary-600 text-white shadow-primary-500/30 rotate-12' : 'bg-white dark:bg-slate-900 text-slate-400'}`}
                            style={isActive ? { backgroundColor: clubConfig.primaryColor } : {}}
                        >
                            <Trophy size={isActive ? 48 : 32} />
                        </div>
                        <span className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500'}`}>{disc.name}</span>
                    </button>
                );
            })}
        </div>
      </div>

      {/* CATEGORY PILLS */}
      {activeDisc && (
          <div className="flex flex-wrap gap-2 md:gap-4 mb-12 bg-white/50 dark:bg-white/5 p-2 rounded-[2rem] backdrop-blur-sm w-fit">
              {activeDisc.categories.map((cat) => (
                  <button 
                      key={cat.id}
                      onClick={() => setSelectedCatId(cat.id)}
                      className={`px-6 md:px-10 py-3 md:py-4 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${selectedCatId === cat.id ? 'bg-slate-900 dark:bg-primary-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'}`}
                  >
                      {cat.name}
                  </button>
              ))}
          </div>
      )}

      {/* AI OPTIMIZER BUTTON */}
      {filteredPlayers.length > 0 && (
          <div className="mb-12">
            <button 
                onClick={handleAiOptimization}
                disabled={isAiOptimizing}
                className="group relative overflow-hidden bg-slate-900 dark:bg-white text-slate-100 dark:text-slate-900 px-8 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-2xl"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                {isAiOptimizing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} className="text-primary-500" />}
                <span>{isAiOptimizing ? 'Analizando Rendimiento...' : 'IA: Generar Equipo Ideal'}</span>
            </button>

            {aiSuggestion && (
                <div className="mt-6 bg-primary-600 text-white p-8 md:p-12 rounded-[3.5rem] border border-white/10 shadow-3xl animate-slide-up relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 opacity-10">
                        <Sparkles size={200} />
                    </div>
                    <div className="relative z-10">
                        <h4 className="flex items-center gap-2 font-black uppercase text-xs tracking-widest mb-4 opacity-80">
                            <Zap size={14} /> Recomendación del Asistente Plegma IA
                        </h4>
                        <div className="whitespace-pre-line font-medium text-sm md:text-lg leading-relaxed">{aiSuggestion}</div>
                        <button onClick={() => setAiSuggestion(null)} className="mt-8 text-[9px] font-black uppercase tracking-widest opacity-60 hover:opacity-100">Cerrar Análisis</button>
                    </div>
                </div>
            )}
          </div>
      )}

      {/* SQUAD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
              [...Array(8)].map((_, i) => (
                  <div key={i} className="h-80 bg-slate-200 dark:bg-white/5 rounded-[3rem] animate-pulse"></div>
              ))
          ) : filteredPlayers.length > 0 ? (
              filteredPlayers.map((player) => (
                  <div key={player.id} className="group relative bg-white dark:bg-[#0f1219] rounded-[3rem] border border-slate-200 dark:border-white/5 p-6 transition-all hover:shadow-2xl hover:border-primary-500/30 overflow-hidden">
                      {/* Rating Badge */}
                      <div className="absolute top-6 right-6 w-14 h-14 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center font-black text-2xl text-primary-600 italic border border-slate-100 dark:border-white/5 group-hover:scale-110 transition-transform">
                          {player.overallRating}
                      </div>

                      <div className="flex flex-col items-center mt-4">
                          <div className="w-28 h-28 rounded-full border-4 border-slate-50 dark:border-slate-800 p-1 mb-6 relative">
                              <img src={player.photoUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-cover rounded-full grayscale group-hover:grayscale-0 transition-all duration-500" />
                              <div className="absolute -bottom-2 right-0 bg-primary-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-lg">
                                  #{player.number}
                              </div>
                          </div>
                          
                          <div className="text-center">
                              <h3 className="font-black uppercase tracking-tighter text-xl text-slate-800 dark:text-white truncate max-w-[180px]">{player.name}</h3>
                              <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mt-1">{player.position}</p>
                          </div>
                      </div>

                      <div className="mt-8 pt-6 border-t border-slate-50 dark:border-white/5 flex justify-between items-center">
                          <div className="flex items-center gap-1">
                              <Star size={12} className="text-yellow-500 fill-yellow-500" />
                              <span className="text-[10px] font-black text-slate-400 uppercase">Elite Talent</span>
                          </div>
                          <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${player.medical.isFit ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'}`}>
                              {player.medical.isFit ? 'Apto' : 'Baja'}
                          </span>
                      </div>
                  </div>
              ))
          ) : (
              <div className="col-span-full py-24 text-center">
                  <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                      <Users size={40} />
                  </div>
                  <h3 className="font-black uppercase tracking-widest text-xs text-slate-400">No hay jugadores registrados en esta categoría</h3>
                  <p className="text-[9px] text-slate-500 mt-2 uppercase tracking-tighter">Ve a Gestión de Jugadores para dar el alta</p>
              </div>
          )}
      </div>
    </div>
  );
};

export default Squads;
