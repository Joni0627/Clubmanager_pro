
import React, { useState, useMemo, useRef } from 'react';
import { Member, AppRole, ClubConfig, Tutor, Assignment, Player } from '../types';
import { 
  UserPlus, Search, Trash2, User, X, Save, Camera, Loader2, PlusCircle, Heart, 
  UserCheck, Fingerprint, ShieldCheck, Briefcase, Ruler, Weight, Activity, 
  BadgeCheck, Contact2, ShieldAlert, ChevronRight, MapPin
} from 'lucide-react';
import { db, supabase } from '../lib/supabase';

interface MemberManagementProps {
  members: Member[];
  config: ClubConfig;
  onSaveMember: (member: Member) => Promise<void>;
  onDeleteMember: (id: string) => Promise<void>;
}

type ModalTab = 'identity' | 'health' | 'contacts' | 'sports' | 'system';

const MemberManagement: React.FC<MemberManagementProps> = ({ members, config, onSaveMember, onDeleteMember }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<ModalTab>('identity');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Member>>({
    name: '', dni: '', gender: 'Masculino', birthDate: '', email: '', phone: '',
    photoUrl: '', address: '', city: '', province: '', postalCode: '',
    bloodType: '', medicalInsurance: '', weight: '', height: '',
    status: 'Active', assignments: [], systemRole: 'Socio', canLogin: false,
    tutor: { name: '', dni: '', relationship: 'Padre', phone: '', email: '' }
  });

  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setFormData(member);
    setActiveTab('identity');
    setShowModal(true);
  };

  const handleNew = () => {
    setSelectedMember(null);
    setFormData({
      name: '', dni: '', gender: 'Masculino', birthDate: '', email: '', phone: '',
      photoUrl: '', address: '', city: '', province: '', postalCode: '',
      bloodType: '', medicalInsurance: '', weight: '', height: '',
      status: 'Active', assignments: [], systemRole: 'Socio', canLogin: false,
      tutor: { name: '', dni: '', relationship: 'Padre', phone: '', email: '' }
    });
    setActiveTab('identity');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.dni) return alert("Nombre y DNI son obligatorios");
    setIsSaving(true);
    try {
      const memberId = selectedMember?.id || crypto.randomUUID();
      const memberToSave = {
        ...formData,
        id: memberId,
        createdAt: selectedMember?.createdAt || new Date().toISOString(),
      } as Member;

      // 1. Guardar en la tabla Members
      await onSaveMember(memberToSave);

      // 2. Sincronización Inteligente con Tabla Players
      const playerAssignments = memberToSave.assignments.filter(a => a.role === 'PLAYER');
      
      for (const ass of playerAssignments) {
        const disc = config.disciplines.find(d => d.id === ass.disciplineId);
        // Buscamos la categoría en todas las ramas para ser robustos
        const cat = disc?.branches
          .flatMap(b => b.categories)
          .find(c => c.id === ass.categoryId || c.name.toLowerCase() === ass.categoryId.toLowerCase());

        if (disc && cat) {
          // Buscamos si ya existe este jugador para este miembro en esta categoría específica
          const { data: existingPlayer } = await supabase
            .from('players')
            .select('id')
            .eq('member_id', memberId)
            .eq('discipline', disc.name)
            .eq('category', cat.name)
            .maybeSingle();

          const playerData: any = {
            member_id: memberId,
            name: memberToSave.name,
            dni: memberToSave.dni,
            email: memberToSave.email,
            photoUrl: memberToSave.photoUrl,
            discipline: disc.name,
            category: cat.name,
            gender: memberToSave.gender,
            status: 'Active'
          };

          // Si ya existía, conservamos su ID de jugador para no duplicar
          if (existingPlayer) {
            playerData.id = existingPlayer.id;
          }

          await db.players.upsert(playerData);
        }
      }

      setShowModal(false);
    } catch (e) { 
      console.error("Error al guardar:", e);
      alert("Error en la sincronización de datos.");
    } finally { 
      setIsSaving(false); 
    }
  };

  const addAssignment = () => {
    if (config.disciplines.length === 0) return alert("Configura disciplinas primero");
    const newAssignment: Assignment = {
      id: crypto.randomUUID(),
      disciplineId: config.disciplines[0].id,
      categoryId: '',
      role: 'PLAYER'
    };
    setFormData(prev => ({ ...prev, assignments: [...(prev.assignments || []), newAssignment] }));
  };

  const updateAssignment = (idx: number, field: keyof Assignment, value: string) => {
    const newAss = [...(formData.assignments || [])];
    newAss[idx] = { ...newAss[idx], [field]: value };
    if (field === 'disciplineId') newAss[idx].categoryId = '';
    setFormData({ ...formData, assignments: newAss });
  };

  // Fix: Added filteredMembers memo to support searching functionality and fix the compilation error
  const filteredMembers = useMemo(() => {
    return members.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      m.dni.includes(searchTerm)
    );
  }, [members, searchTerm]);

  const tabs = [
    { id: 'identity', label: 'Identidad', icon: Fingerprint },
    { id: 'health', label: 'Salud', icon: Heart },
    { id: 'contacts', label: 'Contactos', icon: Contact2 },
    { id: 'sports', label: 'Deportes', icon: Briefcase },
    { id: 'system', label: 'Sistema', icon: ShieldCheck },
  ];

  const inputClasses = "w-full p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-bold text-sm outline-none border border-transparent dark:border-slate-700/50 focus:border-primary-600/50 dark:focus:border-primary-500/50 shadow-inner transition-all dark:text-slate-200";
  const selectClasses = "w-full p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-bold text-sm outline-none border border-transparent dark:border-slate-700/50 shadow-inner dark:text-slate-200 cursor-pointer";

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in pb-40">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none italic">
            Miembros <span className="text-primary-600">Plegma</span>
          </h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[9px] mt-4 ml-1">Directorio Institucional</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="BUSCAR..." 
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none font-bold text-[11px] uppercase tracking-widest shadow-lg"
            />
          </div>
          <button onClick={handleNew} className="bg-primary-600 text-white px-6 py-4 rounded-2xl shadow-xl shadow-primary-600/20 hover:scale-105 transition-all shrink-0">
            <UserPlus size={20} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map(member => (
          <div key={member.id} className="bg-white dark:bg-slate-800/40 rounded-[2.5rem] p-6 md:p-8 border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 overflow-hidden shadow-inner shrink-0">
                <img src={member.photoUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-black text-lg uppercase tracking-tight text-slate-800 dark:text-white leading-none mb-1 truncate">{member.name}</h3>
                  <button 
                    onClick={() => onDeleteMember(member.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DNI: {member.dni}</p>
              </div>
            </div>
            <button onClick={() => handleEdit(member)} className="w-full mt-6 bg-slate-50 dark:bg-slate-700/50 p-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-primary-600 hover:text-white transition-all">
              Gestionar Legajo
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-3xl z-[500] flex items-center justify-center p-0 md:p-10 animate-fade-in">
          <div className="bg-white dark:bg-[#0f121a] w-full max-w-6xl h-full md:h-[90vh] md:rounded-[3rem] shadow-2xl flex flex-col border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 md:px-10 py-5 flex justify-between items-center border-b border-slate-100 dark:border-slate-700/50 shrink-0 bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center gap-4">
                <div className="hidden md:flex w-10 h-10 rounded-xl bg-primary-600/10 items-center justify-center text-primary-600">
                  <Fingerprint size={24} />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight italic">Legajo Maestro</h3>
                  <p className="text-[8px] md:text-[9px] font-black text-primary-600 uppercase tracking-[0.3em]">Gestión de Identidad</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-full hover:bg-red-500 hover:text-white transition-all"><X size={20} /></button>
            </div>

            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              <div className="w-full md:w-64 bg-slate-50/50 dark:bg-slate-900/40 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700/50 flex flex-col shrink-0 md:overflow-y-auto no-scrollbar">
                <nav className="flex md:flex-col overflow-x-auto no-scrollbar md:overflow-y-visible p-3 md:p-4 gap-2 md:gap-3 shrink-0">
                  {tabs.map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as ModalTab)}
                        className={`flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3 md:py-5 rounded-xl md:rounded-2xl transition-all relative shrink-0 border-2 ${
                          isActive ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/30 border-primary-400' : 'text-slate-400 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700/30'
                        }`}
                      >
                        <tab.icon size={18} />
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="flex-1 bg-white dark:bg-[#0f121a] overflow-y-auto p-6 md:p-10 custom-scrollbar">
                <div className="max-w-3xl mx-auto">
                  {activeTab === 'identity' && (
                    <div className="space-y-6 md:space-y-8 animate-fade-in">
                       <h4 className="text-[10px] md:text-xs font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] flex items-center gap-3">
                         <div className="w-1 h-4 bg-primary-600 rounded-full"></div> Información Personal
                       </h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-2 col-span-1 md:col-span-2">
                          <label className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Nombre Completo</label>
                          <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})} className={inputClasses} placeholder="EJ: LIONEL MESSI" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Documento (DNI)</label>
                          <input value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} className={inputClasses} placeholder="NÚMERO" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Género</label>
                          <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})} className={selectClasses}>
                            <option>Masculino</option>
                            <option>Femenino</option>
                            <option>Otro</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'sports' && (
                    <div className="space-y-6 md:space-y-8 animate-fade-in">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[10px] md:text-xs font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] flex items-center gap-3">
                          <div className="w-1 h-4 bg-blue-500 rounded-full"></div> Perfil Deportivo
                        </h4>
                        <button onClick={addAssignment} className="flex items-center gap-2 text-primary-600 text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                          <PlusCircle size={16} /> Nuevo Rol
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                        {formData.assignments?.map((as, idx) => {
                          const disc = config.disciplines.find(d => d.id === as.disciplineId);
                          // Combinamos todas las categorías de todas las ramas para que sea más fácil elegir
                          const availableCategories = disc?.branches?.flatMap(b => b.categories) || [];
                          
                          return (
                            <div key={as.id} className="bg-slate-50 dark:bg-slate-800/60 p-5 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-4 shadow-sm transition-all">
                              <div className="flex justify-between items-center">
                                <select 
                                  value={as.role} 
                                  onChange={e => updateAssignment(idx, 'role', e.target.value as AppRole)}
                                  className="bg-transparent font-black text-[10px] uppercase tracking-widest outline-none text-primary-600 cursor-pointer"
                                >
                                  <option value="PLAYER">JUGADOR (Atleta)</option>
                                  <option value="COACH">ENTRENADOR</option>
                                  <option value="PHYSICAL_TRAINER">PREP. FÍSICO</option>
                                  <option value="ADMIN">ADMIN</option>
                                </select>
                                <button onClick={() => setFormData({...formData, assignments: formData.assignments?.filter((_, i) => i !== idx)})} className="text-slate-300 hover:text-red-500 transition-colors">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                              <div className="space-y-3">
                                <select value={as.disciplineId} onChange={e => updateAssignment(idx, 'disciplineId', e.target.value)} className={selectClasses + " p-3 rounded-xl text-[10px]"}>
                                  {config.disciplines.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                                <select value={as.categoryId} onChange={e => updateAssignment(idx, 'categoryId', e.target.value)} className={selectClasses + " p-3 rounded-xl text-[10px]"}>
                                  <option value="">-- Seleccionar Categoría --</option>
                                  {availableCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 md:px-10 py-5 border-t border-slate-100 dark:border-slate-700/50 flex justify-end bg-slate-50 dark:bg-slate-800/40 shrink-0">
              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="w-full md:w-auto flex items-center justify-center gap-4 bg-primary-600 text-white px-10 py-4 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-[11px] tracking-widest shadow-xl shadow-primary-600/20 hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Guardar y Sincronizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberManagement;
