
import React, { useState, useMemo, useRef } from 'react';
import { Member, AppRole, ClubConfig, Tutor, Assignment } from '../types';
import { 
  UserPlus, Search, Mail, Phone, Calendar, Trash2, Edit3, Shield, User, X, Save, 
  Camera, Loader2, PlusCircle, Heart, UserCheck, MapPin, Fingerprint, Lock, ShieldCheck,
  ChevronRight, ArrowRight, Briefcase, Ruler, Weight, Activity, BadgeCheck, Info
} from 'lucide-react';

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
    name: '',
    dni: '',
    gender: 'Masculino',
    birthDate: '',
    email: '',
    phone: '',
    photoUrl: '',
    address: '',
    bloodType: '',
    medicalInsurance: '',
    weight: '',
    height: '',
    status: 'Active',
    assignments: [],
    systemRole: 'Socio',
    canLogin: false,
    tutor: { name: '', dni: '', relationship: 'Padre', phone: '', email: '' }
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
    setActiveTab('identity');
    setShowModal(true);
  };

  const handleNew = () => {
    setSelectedMember(null);
    setFormData({
      name: '',
      dni: '',
      gender: 'Masculino',
      birthDate: '',
      email: '',
      phone: '',
      photoUrl: '',
      address: '',
      bloodType: '',
      medicalInsurance: '',
      weight: '',
      height: '',
      status: 'Active',
      assignments: [],
      systemRole: 'Socio',
      canLogin: false,
      tutor: { name: '', dni: '', relationship: 'Padre', phone: '', email: '' }
    });
    setActiveTab('identity');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.dni) return alert("Nombre y DNI son obligatorios");
    if (isMinor && (!formData.tutor?.name || !formData.tutor?.dni)) {
      return alert("El nombre y DNI del tutor son obligatorios para menores de edad");
    }
    
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
    if (config.disciplines.length === 0) return alert("Primero debes configurar disciplinas en Estructura");
    const newAssignment: Assignment = {
      id: crypto.randomUUID(),
      disciplineId: config.disciplines[0].id,
      categoryId: '',
      role: 'PLAYER'
    };
    setFormData(prev => ({
      ...prev,
      assignments: [...(prev.assignments || []), newAssignment]
    }));
  };

  const updateAssignment = (idx: number, field: keyof Assignment, value: string) => {
    const newAss = [...(formData.assignments || [])];
    newAss[idx] = { ...newAss[idx], [field]: value };
    if (field === 'disciplineId') newAss[idx].categoryId = '';
    setFormData({ ...formData, assignments: newAss });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, photoUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
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

  const tabs = [
    { id: 'identity', label: 'Identidad', icon: Fingerprint },
    { id: 'health', label: 'Salud', icon: Heart },
    { id: 'contacts', label: 'Contactos', icon: Phone },
    { id: 'sports', label: 'Perfil Deportivo', icon: Briefcase },
    { id: 'system', label: 'Perfil Sistema', icon: ShieldCheck },
  ];

  return (
    <div className="p-12 max-w-7xl mx-auto animate-fade-in pb-40">
      <header className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
        <div>
          <h2 className="text-6xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none italic">
            Miembros <span className="text-primary-600">Plegma</span>
          </h2>
          <div className="flex items-center gap-4 mt-6">
            <div className="w-16 h-2 bg-primary-600 rounded-full"></div>
            <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Directorio de Identidades</p>
          </div>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="BUSCAR NOMBRE O DNI..." 
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
          <div key={member.id} className="bg-white dark:bg-[#0f1219] rounded-[3.5rem] p-10 border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
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
                </div>
              </div>
            </div>

            <div className="flex gap-3 relative z-10">
              <button onClick={() => handleEdit(member)} className="flex-1 bg-slate-100 dark:bg-white/5 p-4 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-primary-600 hover:text-white transition-all">
                Abrir Legajo
              </button>
              <button onClick={() => confirm('¿Eliminar miembro?') && onDeleteMember(member.id)} className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[200] flex items-center justify-center p-0 md:p-6 animate-fade-in">
          <div className="bg-white dark:bg-[#080a0f] w-full max-w-7xl h-full md:h-[90vh] md:rounded-[4.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/5">
            
            {/* Cabecera Superior */}
            <div className="px-10 py-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-slate-950/30 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-600/10 flex items-center justify-center text-primary-600 shadow-inner">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Gestión Integral de Miembro</h3>
                  <p className="text-[9px] font-black text-primary-600 uppercase tracking-[0.3em]">Legajo Digital • Plegma Sport v3</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-4 bg-white dark:bg-white/5 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-xl">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              
              {/* Sidebar Lateral Persistente (Foto + Navegación) */}
              <div className="w-80 bg-slate-50 dark:bg-slate-950/50 border-r border-slate-100 dark:border-white/5 flex flex-col items-center py-12 shrink-0 overflow-y-auto no-scrollbar">
                
                {/* Foto Persistente */}
                <div className="flex flex-col items-center mb-12">
                  <div onClick={() => fileInputRef.current?.click()} className="w-48 h-48 rounded-[3.5rem] bg-slate-100 dark:bg-slate-900 border-4 border-primary-600/20 overflow-hidden shadow-2xl relative group cursor-pointer mb-6 transition-transform hover:scale-105">
                    <img src={formData.photoUrl || 'https://via.placeholder.com/400'} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-primary-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <Camera className="text-white" size={32} />
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
                  </div>
                  <h4 className="font-black text-lg text-slate-800 dark:text-white uppercase tracking-tighter text-center px-6 leading-tight truncate w-full">
                    {formData.name || 'NUEVO MIEMBRO'}
                  </h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">DNI: {formData.dni || '---'}</p>
                </div>

                {/* Navegación por Solapas */}
                <nav className="w-full px-6 space-y-3">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as ModalTab)}
                      className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] transition-all relative overflow-hidden group ${activeTab === tab.id ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/20' : 'text-slate-400 hover:bg-white dark:hover:bg-white/5'}`}
                    >
                      <tab.icon size={18} className={activeTab === tab.id ? 'animate-bounce' : 'group-hover:scale-110 transition-transform'} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                      {activeTab === tab.id && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-l-full"></div>}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Área de Contenido Dinámico (Solapas) */}
              <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-white dark:bg-[#080a0f]">
                
                {activeTab === 'identity' && (
                  <div className="space-y-10 animate-fade-in max-w-4xl">
                    <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-3">
                      <Fingerprint size={18} className="text-primary-600" /> Información Identitaria
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2 col-span-1 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nombre Completo</label>
                        <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})} className="w-full p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] font-bold outline-none border border-transparent focus:border-primary-600/30 shadow-inner" placeholder="EJ: LIONEL MESSI" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">DNI / Pasaporte</label>
                        <input value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} className="w-full p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] font-bold outline-none border border-transparent focus:border-primary-600/30 shadow-inner" placeholder="NÚMERO" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Género</label>
                        <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})} className="w-full p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] font-bold outline-none shadow-inner">
                          <option>Masculino</option>
                          <option>Femenino</option>
                          <option>Otro</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Fecha de Nacimiento</label>
                        <input type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] font-bold outline-none shadow-inner" />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'health' && (
                  <div className="space-y-10 animate-fade-in max-w-4xl">
                    <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-3">
                      <Heart size={18} className="text-red-500" /> Biometría y Salud
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                           <Activity size={10} /> Obra Social / Prepaga
                        </label>
                        <input value={formData.medicalInsurance} onChange={e => setFormData({...formData, medicalInsurance: e.target.value.toUpperCase()})} className="w-full p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] font-bold outline-none shadow-inner" placeholder="EJ: OSDE 210" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                           <Info size={10} /> Grupo Sanguíneo
                        </label>
                        <input value={formData.bloodType} onChange={e => setFormData({...formData, bloodType: e.target.value.toUpperCase()})} className="w-full p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] font-bold outline-none shadow-inner" placeholder="0+" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                           <Weight size={10} /> Peso Actual (kg)
                        </label>
                        <input value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] font-bold outline-none shadow-inner" placeholder="75.0" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                           <Ruler size={10} /> Altura (cm)
                        </label>
                        <input value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} className="w-full p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] font-bold outline-none shadow-inner" placeholder="182" />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'contacts' && (
                  <div className="space-y-12 animate-fade-in max-w-4xl">
                    <section className="space-y-8">
                      <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-3">
                        <Phone size={18} className="text-emerald-500" /> Medios de Contacto
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Teléfono Móvil</label>
                          <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] font-bold outline-none shadow-inner" placeholder="+54 9..." />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Principal</label>
                          <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] font-bold outline-none shadow-inner" placeholder="usuario@email.com" />
                        </div>
                        <div className="space-y-2 col-span-1 md:col-span-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Dirección Particular</label>
                          <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value.toUpperCase()})} className="w-full p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] font-bold outline-none shadow-inner" placeholder="CALLE, NÚMERO, CIUDAD" />
                        </div>
                      </div>
                    </section>

                    {isMinor && (
                      <section className="bg-orange-500/5 p-10 rounded-[3rem] border border-orange-500/10 space-y-8 animate-fade-in shadow-inner">
                        <div className="flex justify-between items-center">
                          <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em] flex items-center gap-3">
                            <UserCheck size={18} /> Tutor / Responsable Legal (Obligatorio)
                          </h4>
                          <span className="bg-orange-600 text-white text-[7px] font-black uppercase px-4 py-1.5 rounded-full tracking-widest">Requerido por Menor</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-orange-600/60 uppercase tracking-widest ml-4">Nombre Completo</label>
                            <input value={formData.tutor?.name || ''} onChange={e => setFormData({...formData, tutor: { ...(formData.tutor || { relationship: 'Padre', phone: '', dni: '' }), name: e.target.value.toUpperCase() }})} className="w-full p-5 bg-white dark:bg-slate-950 rounded-2xl font-bold outline-none border border-orange-500/10" placeholder="NOMBRE COMPLETO" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-orange-600/60 uppercase tracking-widest ml-4">DNI Tutor</label>
                            <input value={formData.tutor?.dni || ''} onChange={e => setFormData({...formData, tutor: { ...(formData.tutor || { relationship: 'Padre', phone: '', name: '' }), dni: e.target.value }})} className="w-full p-5 bg-white dark:bg-slate-950 rounded-2xl font-bold outline-none border border-orange-500/10" placeholder="DOCUMENTO" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-orange-600/60 uppercase tracking-widest ml-4">Vínculo</label>
                            <select value={formData.tutor?.relationship || 'Padre'} onChange={e => setFormData({...formData, tutor: { ...(formData.tutor || { name: '', phone: '', dni: '' }), relationship: e.target.value as any }})} className="w-full p-5 bg-white dark:bg-slate-950 rounded-2xl font-bold outline-none border border-orange-500/10">
                              <option>Padre</option>
                              <option>Madre</option>
                              <option>Tutor Legal</option>
                              <option>Otro</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-orange-600/60 uppercase tracking-widest ml-4">Teléfono del Tutor</label>
                            <input value={formData.tutor?.phone || ''} onChange={e => setFormData({...formData, tutor: { ...(formData.tutor || { name: '', relationship: 'Padre', dni: '' }), phone: e.target.value }})} className="w-full p-5 bg-white dark:bg-slate-950 rounded-2xl font-bold outline-none border border-orange-500/10" placeholder="TELÉFONO" />
                          </div>
                        </div>
                      </section>
                    )}
                  </div>
                )}

                {activeTab === 'sports' && (
                  <div className="space-y-10 animate-fade-in max-w-4xl">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-3">
                        <Briefcase size={18} className="text-primary-600" /> Roles y Disciplinas Deportivas
                      </h4>
                      <button onClick={addAssignment} className="flex items-center gap-3 bg-primary-600 text-white px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
                        <PlusCircle size={16} /> Asignar Nuevo Rol
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {formData.assignments?.map((as, idx) => {
                        const disc = config.disciplines.find(d => d.id === as.disciplineId);
                        const availableCategories = disc?.branches?.flatMap(b => b.enabled ? b.categories : []) || [];
                        return (
                          <div key={as.id} className="bg-slate-50 dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-5 relative group">
                            <div className="flex justify-between items-center">
                              <select 
                                value={as.role} 
                                onChange={e => updateAssignment(idx, 'role', e.target.value)}
                                className="bg-transparent font-black text-xs uppercase tracking-widest outline-none text-primary-600 cursor-pointer"
                              >
                                <option value="PLAYER">JUGADOR</option>
                                <option value="COACH">ENTRENADOR</option>
                                <option value="PHYSICAL_TRAINER">PREP. FÍSICO</option>
                                <option value="MEDICAL">C. MÉDICO</option>
                                <option value="ADMIN">ADMINISTRATIVO</option>
                                <option value="COORDINATOR">COORDINADOR</option>
                              </select>
                              <button onClick={() => setFormData({...formData, assignments: formData.assignments?.filter((_, i) => i !== idx)})} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-3">Disciplina</span>
                                <select 
                                  value={as.disciplineId}
                                  onChange={e => updateAssignment(idx, 'disciplineId', e.target.value)}
                                  className="w-full bg-white dark:bg-slate-950 p-4 rounded-xl text-[10px] font-bold outline-none border border-slate-100 dark:border-white/10"
                                >
                                  {config.disciplines.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-3">Categoría</span>
                                <select 
                                  value={as.categoryId}
                                  onChange={e => updateAssignment(idx, 'categoryId', e.target.value)}
                                  className="w-full bg-white dark:bg-slate-950 p-4 rounded-xl text-[10px] font-bold outline-none border border-slate-100 dark:border-white/10"
                                >
                                  <option value="">(Sin Categoría)</option>
                                  {availableCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {formData.assignments?.length === 0 && (
                        <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[3rem] opacity-30">
                           <Briefcase size={40} className="mx-auto mb-4 text-slate-300" />
                           <p className="text-[10px] font-black uppercase tracking-[0.3em]">No hay roles deportivos asignados</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'system' && (
                  <div className="space-y-10 animate-fade-in max-w-4xl">
                    <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-3">
                      <ShieldCheck size={18} className="text-primary-600" /> Perfil y Permisos de Sistema
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Tipo de Perfil de Aplicación</label>
                        <select 
                          value={formData.systemRole} 
                          onChange={e => setFormData({...formData, systemRole: e.target.value as any})}
                          className="w-full p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-widest outline-none border border-transparent focus:border-primary-600/30 shadow-inner"
                        >
                          <option value="Socio">Socio / Miembro Base</option>
                          <option value="STAFF">Staff Institucional (Gestión)</option>
                          <option value="Externo">Contacto Externo / Proveedor</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">¿Habilitar Credenciales de Login?</label>
                        <div className="flex gap-4 p-2 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-white/5">
                           <button 
                             onClick={() => setFormData({...formData, canLogin: true})}
                             className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.canLogin ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400'}`}
                           >
                             Si, Permitir
                           </button>
                           <button 
                             onClick={() => setFormData({...formData, canLogin: false})}
                             className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${!formData.canLogin ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
                           >
                             No, Bloquear
                           </button>
                        </div>
                      </div>

                      {formData.canLogin && (
                        <div className="space-y-3 col-span-1 md:col-span-2 animate-fade-in">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nombre de Usuario Único</label>
                          <div className="relative">
                            <User size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                              value={formData.username || ''} 
                              onChange={e => setFormData({...formData, username: e.target.value.toLowerCase().replace(/\s/g, '')})} 
                              className="w-full p-6 pl-14 bg-slate-50 dark:bg-slate-900 rounded-[2rem] font-bold outline-none border border-transparent focus:border-primary-600/30 shadow-inner" 
                              placeholder="usuario.club" 
                            />
                          </div>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-4 italic">* El usuario se utilizará para el acceso móvil a Plegma Sport.</p>
                        </div>
                      )}
                    </div>

                    <div className="p-10 bg-emerald-500/5 rounded-[3rem] border border-emerald-500/10 flex items-start gap-6">
                       <BadgeCheck className="text-emerald-500 shrink-0" size={32} />
                       <div>
                          <h5 className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mb-1">Estado de la Cuenta</h5>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                            {formData.status === 'Active' ? 'ESTE MIEMBRO SE ENCUENTRA ACTIVO Y CON LOS PAGOS AL DÍA SEGÚN EL ÚLTIMO REPORTE DE TESORERÍA.' : 'CUENTA EN REVISIÓN O CON RESTRICCIONES VIGENTES.'}
                          </p>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer de Modal con botón de Guardado */}
            <div className="px-10 py-8 border-t border-slate-100 dark:border-white/5 flex justify-end bg-slate-50 dark:bg-slate-950/30 shrink-0">
              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="flex items-center gap-4 bg-primary-600 text-white px-20 py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {selectedMember ? 'Guardar Cambios en Legajo' : 'Confirmar Alta de Miembro'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberManagement;
