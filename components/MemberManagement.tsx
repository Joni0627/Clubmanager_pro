
import React, { useState, useMemo } from 'react';
import { Member, AppRole, ClubConfig, Tutor, Assignment } from '../types';
import { 
  UserPlus, Search, Filter, Mail, Phone, Calendar, MapPin, 
  Trash2, Edit3, Shield, User, ChevronRight, X, Save, 
  CheckCircle2, AlertCircle, Camera, Loader2, PlusCircle, Briefcase
} from 'lucide-react';

interface MemberManagementProps {
  members: Member[];
  config: ClubConfig;
  onSaveMember: (member: Member) => Promise<void>;
  onDeleteMember: (id: string) => Promise<void>;
}

const MemberManagement: React.FC<MemberManagementProps> = ({ members, config, onSaveMember, onDeleteMember }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState<Partial<Member>>({
    name: '',
    dni: '',
    birthDate: '',
    email: '',
    phone: '',
    photoUrl: '',
    address: '',
    status: 'Active',
    assignments: []
  });

  const isMinor = useMemo(() => {
    if (!formData.birthDate) return false;
    const birth = new Date(formData.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age < 18;
  }, [formData.birthDate]);

  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setFormData(member);
    setShowModal(true);
  };

  const handleNew = () => {
    setSelectedMember(null);
    setFormData({
      name: '',
      dni: '',
      birthDate: '',
      email: '',
      phone: '',
      photoUrl: '',
      address: '',
      status: 'Active',
      assignments: [],
      tutor: undefined
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.dni) return alert("Nombre y DNI son obligatorios");
    setIsSaving(true);
    try {
      const memberToSave = {
        ...formData,
        id: selectedMember?.id || crypto.randomUUID(),
        createdAt: selectedMember?.createdAt || new Date().toISOString(),
      } as Member;
      await onSaveMember(memberToSave);
      setShowModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const addAssignment = () => {
    const newAssignment: Assignment = {
      id: crypto.randomUUID(),
      disciplineId: config.disciplines[0]?.id || '',
      categoryId: '',
      role: 'PLAYER'
    };
    setFormData(prev => ({
      ...prev,
      assignments: [...(prev.assignments || []), newAssignment]
    }));
  };

  const roleColors: Record<AppRole, string> = {
    ADMIN: 'bg-slate-900 text-white',
    COORDINATOR: 'bg-purple-600 text-white',
    COACH: 'bg-blue-600 text-white',
    PHYSICAL_TRAINER: 'bg-orange-500 text-white',
    MEDICAL: 'bg-emerald-500 text-white',
    PLAYER: 'bg-pink-600 text-white',
    DELEGATE: 'bg-yellow-500 text-white'
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.dni.includes(searchTerm)
  );

  return (
    <div className="p-12 max-w-7xl mx-auto animate-fade-in pb-40">
      <header className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
        <div>
          <h2 className="text-6xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none italic">
            Directorio <span className="text-primary-600">Master</span>
          </h2>
          <div className="flex items-center gap-4 mt-6">
            <div className="w-16 h-2 bg-primary-600 rounded-full"></div>
            <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Gestión Integral de Personas</p>
          </div>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="BUSCAR POR NOMBRE O DNI..." 
              className="w-full pl-16 pr-6 py-5 bg-white dark:bg-[#0f1219] rounded-3xl border border-slate-200 dark:border-white/5 outline-none font-black text-[10px] uppercase tracking-widest shadow-xl"
            />
          </div>
          <button onClick={handleNew} className="bg-primary-600 text-white p-5 rounded-3xl shadow-xl shadow-primary-600/20 hover:scale-105 transition-all">
            <UserPlus size={24} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredMembers.map(member => (
          <div 
            key={member.id} 
            className="bg-white dark:bg-[#0f1219] rounded-[3.5rem] p-10 border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 rounded-bl-full group-hover:bg-primary-600/10 transition-all"></div>
            
            <div className="flex items-start gap-6 mb-8 relative z-10">
              <div className="w-24 h-24 rounded-3xl bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-xl shrink-0 border-2 border-white dark:border-slate-700">
                <img src={member.photoUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-2xl uppercase tracking-tighter text-slate-800 dark:text-white leading-none mb-2 truncate">{member.name}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DNI: {member.dni}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {member.assignments.map(as => (
                    <span key={as.id} className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${roleColors[as.role]}`}>
                      {as.role}
                    </span>
                  ))}
                  {member.assignments.length === 0 && (
                    <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-slate-100 dark:bg-white/5 text-slate-400">
                      Sin Rol
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-slate-500">
                <Mail size={14} className="text-primary-600" />
                <span className="text-[10px] font-bold truncate">{member.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                <Phone size={14} className="text-primary-600" />
                <span className="text-[10px] font-bold">{member.phone}</span>
              </div>
            </div>

            <div className="flex gap-3 relative z-10">
              <button 
                onClick={() => handleEdit(member)}
                className="flex-1 bg-slate-100 dark:bg-white/5 p-4 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-primary-600 hover:text-white transition-all"
              >
                Ver Perfil
              </button>
              <button 
                onClick={() => confirm('¿Eliminar miembro?') && onDeleteMember(member.id)}
                className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {filteredMembers.length === 0 && (
          <div className="col-span-full py-40 text-center opacity-30 border-4 border-dashed border-slate-200 dark:border-white/5 rounded-[5rem]">
            <User size={64} className="mx-auto mb-6 text-slate-300" />
            <h3 className="font-black uppercase tracking-[0.6em] text-[10px]">No se encontraron registros</h3>
          </div>
        )}
      </div>

      {/* MODAL DE EDICIÓN/CREACIÓN */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[200] flex items-center justify-center p-0 md:p-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-full md:h-[90vh] md:rounded-[4rem] shadow-2xl flex flex-col overflow-hidden border border-white/5">
            <div className="p-10 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
              <div>
                <h3 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Ficha de Identidad</h3>
                <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mt-1">Directorio Central Plegma</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-4 bg-white dark:bg-white/5 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-xl">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                {/* Columna Izquierda: Foto y Roles */}
                <div className="lg:col-span-1 space-y-10">
                  <div className="flex flex-col items-center">
                    <div className="w-56 h-56 rounded-[3rem] bg-slate-100 dark:bg-slate-800 border-4 border-primary-600/20 overflow-hidden shadow-2xl relative group mb-6">
                      <img src={formData.photoUrl || 'https://via.placeholder.com/300'} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-primary-600/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                        <Camera className="text-white" size={40} />
                      </div>
                    </div>
                    <div className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${formData.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      {formData.status === 'Active' ? 'Vínculo Activo' : 'Inactivo'}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Funciones y Roles</h4>
                      <button onClick={addAssignment} className="text-primary-600 hover:scale-110 transition-transform">
                        <PlusCircle size={20} />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {formData.assignments?.map((as, idx) => (
                        <div key={as.id} className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5 group">
                          <div className="flex justify-between mb-3">
                            <select 
                              value={as.role} 
                              onChange={e => {
                                const newAss = [...(formData.assignments || [])];
                                newAss[idx].role = e.target.value as AppRole;
                                setFormData({...formData, assignments: newAss});
                              }}
                              className="bg-transparent font-black text-[10px] uppercase tracking-widest outline-none text-primary-600"
                            >
                              <option value="PLAYER">JUGADOR</option>
                              <option value="COACH">ENTRENADOR</option>
                              <option value="PHYSICAL_TRAINER">PREP. FÍSICO</option>
                              <option value="MEDICAL">MÉDICO</option>
                              <option value="ADMIN">ADMINISTRATIVO</option>
                              <option value="COORDINATOR">COORDINADOR</option>
                            </select>
                            <button 
                              onClick={() => {
                                const newAss = formData.assignments?.filter((_, i) => i !== idx);
                                setFormData({...formData, assignments: newAss});
                              }}
                              className="text-slate-300 hover:text-red-500"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <select 
                             value={as.disciplineId}
                             onChange={e => {
                               const newAss = [...(formData.assignments || [])];
                               newAss[idx].disciplineId = e.target.value;
                               setFormData({...formData, assignments: newAss});
                             }}
                             className="w-full bg-white dark:bg-slate-800 p-2 rounded-lg text-[9px] font-bold outline-none"
                          >
                            <option value="">Seleccionar Disciplina</option>
                            {config.disciplines.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                        </div>
                      ))}
                      {(!formData.assignments || formData.assignments.length === 0) && (
                        <p className="text-center py-6 text-slate-400 text-[9px] font-bold uppercase italic">Sin asignaciones registradas</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Datos Formulario */}
                <div className="lg:col-span-2 space-y-12">
                  <section className="space-y-8">
                    <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-3">
                      <User size={18} className="text-primary-600" /> Información Personal
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nombre Completo</label>
                        <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})} className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold outline-none focus:ring-4 focus:ring-primary-600/10 transition-all" placeholder="EJ: JUAN PEREZ" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">DNI / Documento</label>
                        <input value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold outline-none focus:ring-4 focus:ring-primary-600/10 transition-all" placeholder="SOLO NÚMEROS" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Fecha de Nacimiento</label>
                        <input type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold outline-none focus:ring-4 focus:ring-primary-600/10 transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email</label>
                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold outline-none focus:ring-4 focus:ring-primary-600/10 transition-all" placeholder="EJ: INFO@EMAIL.COM" />
                      </div>
                    </div>
                  </section>

                  {/* SECCIÓN TUTOR (CONDICIONAL) */}
                  {isMinor && (
                    <section className="space-y-8 animate-fade-in">
                      <div className="bg-orange-500/5 p-10 rounded-[3rem] border border-orange-500/10">
                        <h4 className="text-sm font-black text-orange-600 uppercase tracking-widest flex items-center gap-3 mb-8">
                          <Shield size={18} /> Información del Tutor (Requerido - Menor de Edad)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-orange-600/60 uppercase tracking-widest ml-4">Nombre Tutor</label>
                            <input 
                              value={formData.tutor?.name || ''} 
                              onChange={e => setFormData({...formData, tutor: { ...(formData.tutor || { relationship: 'Padre', phone: '' }), name: e.target.value.toUpperCase() }})}
                              className="w-full p-6 bg-white dark:bg-slate-800 rounded-3xl font-bold outline-none focus:ring-4 focus:ring-orange-500/10" 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-orange-600/60 uppercase tracking-widest ml-4">Vínculo</label>
                            <select 
                              value={formData.tutor?.relationship || 'Padre'} 
                              onChange={e => setFormData({...formData, tutor: { ...(formData.tutor || { name: '', phone: '' }), relationship: e.target.value as any }})}
                              className="w-full p-6 bg-white dark:bg-slate-800 rounded-3xl font-bold outline-none"
                            >
                              <option>Padre</option>
                              <option>Madre</option>
                              <option>Tutor Legal</option>
                              <option>Otro</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </div>

            <div className="p-10 border-t border-slate-100 dark:border-white/5 flex justify-end bg-slate-50 dark:bg-slate-950/50">
              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="flex items-center gap-4 bg-primary-600 text-white px-16 py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {selectedMember ? 'Actualizar Miembro' : 'Registrar en Directorio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberManagement;
