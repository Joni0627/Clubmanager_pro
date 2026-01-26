
import React, { useState, useMemo, useRef } from 'react';
import { Member, AppRole, ClubConfig, Tutor, Assignment } from '../types';
import { 
  UserPlus, Search, Mail, Phone, Calendar, Trash2, Edit3, Shield, User, X, Save, 
  Camera, Loader2, PlusCircle, Heart, UserCheck, MapPin, Fingerprint, Lock, ShieldCheck,
  ChevronRight, ArrowRight, Briefcase, Ruler, Weight, Activity, BadgeCheck, Info,
  Contact2, ShieldAlert
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

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.dni.includes(searchTerm)
  );

  const tabs = [
    { id: 'identity', label: 'Identidad', icon: Fingerprint, color: 'text-primary-600' },
    { id: 'health', label: 'Salud', icon: Heart, color: 'text-red-500' },
    { id: 'contacts', label: 'Contactos', icon: Contact2, color: 'text-emerald-500' },
    { id: 'sports', label: 'Perfil Deportivo', icon: Briefcase, color: 'text-blue-500' },
    { id: 'system', label: 'Perfil Sistema', icon: ShieldCheck, color: 'text-purple-500' },
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
                    <span key={as.id} className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-slate-100 dark:bg-white/5 text-slate-500">
                      {as.role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={() => handleEdit(member)} className="w-full bg-slate-100 dark:bg-white/5 p-4 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-primary-600 hover:text-white transition-all">
              Abrir Legajo Maestro
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[200] flex items-center justify-center p-0 md:p-10 animate-fade-in overflow-hidden">
          <div className="bg-white dark:bg-[#080a0f] w-full max-w-[90rem] h-full lg:h-[90vh] lg:rounded-[5rem] shadow-2xl flex flex-col border border-white/5 overflow-hidden">
            
            {/* Cabecera */}
            <div className="px-12 py-10 flex justify-between items-center bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-white/5 shrink-0">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-primary-600/10 flex items-center justify-center text-primary-600 shadow-inner">
                  <Fingerprint size={32} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Gestión Integral de Miembro</h3>
                  <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mt-1">LEGAJO DIGITAL • PLEGMA SPORT V3.0</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-5 bg-white dark:bg-white/10 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-xl">
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              
              {/* Lateral Izquierdo Persistente (Identidad + Solapas) */}
              <div className="w-96 bg-slate-50 dark:bg-slate-950/60 border-r border-slate-100 dark:border-white/5 flex flex-col p-12 shrink-0 overflow-y-auto no-scrollbar">
                
                {/* Foto y Nombre Permanente */}
                <div className="flex flex-col items-center mb-16 text-center">
                  <div onClick={() => fileInputRef.current?.click()} className="w-56 h-56 rounded-[4rem] bg-slate-100 dark:bg-slate-900 border-4 border-primary-600/20 overflow-hidden shadow-2xl relative group cursor-pointer mb-8 hover:scale-105 transition-all">
                    <img src={formData.photoUrl || 'https://via.placeholder.com/400'} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-primary-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <Camera className="text-white" size={40} />
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
                  </div>
                  <h4 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none mb-3 break-words w-full px-4">
                    {formData.name || 'NUEVO REGISTRO'}
                  </h4>
                  <div className="px-6 py-2 bg-primary-600/10 rounded-full inline-block">
                    <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest leading-none">DNI: {formData.dni || 'PENDIENTE'}</p>
                  </div>
                </div>

                {/* Navegación por Solapas con Alta Visibilidad */}
                <div className="space-y-4">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 px-4">Secciones del Legajo</p>
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as ModalTab)}
                      className={`w-full flex items-center gap-6 px-8 py-6 rounded-[2rem] transition-all relative overflow-hidden group border ${activeTab === tab.id ? 'bg-white dark:bg-slate-900 border-primary-600 shadow-xl shadow-primary-600/10' : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5'}`}
                    >
                      <tab.icon size={22} className={activeTab === tab.id ? tab.color : 'opacity-40'} />
                      <span className={`text-xs font-black uppercase tracking-widest ${activeTab === tab.id ? 'text-slate-800 dark:text-white' : ''}`}>
                        {tab.label}
                      </span>
                      {activeTab === tab.id && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-10 bg-primary-600 rounded-l-full shadow-[0_0_15px_rgba(236,72,153,0.5)]"></div>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contenido de Solapas */}
              <div className="flex-1 bg-white dark:bg-[#080a0f] overflow-y-auto p-16 custom-scrollbar">
                <div className="max-w-4xl">
                  
                  {activeTab === 'identity' && (
                    <div className="space-y-12 animate-fade-in">
                      <div className="flex items-center gap-5">
                         <div className="w-1.5 h-10 bg-primary-600 rounded-full"></div>
                         <h4 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Información Identitaria</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3 col-span-1 md:col-span-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nombre Completo del Miembro</label>
                          <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})} className="w-full p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] font-bold outline-none border-2 border-transparent focus:border-primary-600/30 shadow-inner text-lg" placeholder="EJ: LIONEL MESSI" />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Número de Documento (DNI/Pasaporte)</label>
                          <input value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} className="w-full p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] font-bold outline-none border-2 border-transparent focus:border-primary-600/30 shadow-inner" placeholder="EJ: 33221144" />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Género</label>
                          <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})} className="w-full p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] font-bold outline-none shadow-inner cursor-pointer appearance-none">
                            <option>Masculino</option>
                            <option>Femenino</option>
                            <option>Otro</option>
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Fecha de Nacimiento</label>
                          <input type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] font-bold outline-none shadow-inner" />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'health' && (
                    <div className="space-y-12 animate-fade-in">
                      <div className="flex items-center gap-5">
                         <div className="w-1.5 h-10 bg-red-500 rounded-full"></div>
                         <h4 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Biometría y Salud</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Obra Social / Prepaga</label>
                          <input value={formData.medicalInsurance} onChange={e => setFormData({...formData, medicalInsurance: e.target.value.toUpperCase()})} className="w-full p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] font-bold outline-none shadow-inner" placeholder="EJ: OSDE 210" />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Grupo Sanguíneo</label>
                          <input value={formData.bloodType} onChange={e => setFormData({...formData, bloodType: e.target.value.toUpperCase()})} className="w-full p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] font-bold outline-none shadow-inner" placeholder="EJ: 0+" />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Peso (kg)</label>
                          <input value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] font-bold outline-none shadow-inner" placeholder="0.00" />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Altura (cm)</label>
                          <input value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} className="w-full p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] font-bold outline-none shadow-inner" placeholder="0" />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'contacts' && (
                    <div className="space-y-12 animate-fade-in">
                      <div className="flex items-center gap-5">
                         <div className="w-1.5 h-10 bg-emerald-500 rounded-full"></div>
                         <h4 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Contactos Adicionales</h4>
                      </div>
                      
                      <section className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Teléfono Personal</label>
                            <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] font-bold outline-none shadow-inner" placeholder="+54 9..." />
                          </div>
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Personal</label>
                            <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] font-bold outline-none shadow-inner" placeholder="usuario@email.com" />
                          </div>
                          <div className="space-y-3 col-span-1 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Dirección Particular</label>
                            <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value.toUpperCase()})} className="w-full p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] font-bold outline-none shadow-inner" placeholder="CALLE, NÚMERO, CIUDAD" />
                          </div>
                        </div>
                      </section>

                      {/* TUTOR SIEMPRE VISIBLE */}
                      <section className="bg-emerald-500/5 p-12 rounded-[4rem] border border-emerald-500/10 space-y-10 shadow-inner">
                        <div className="flex justify-between items-center">
                          <h5 className="text-sm font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-4">
                            <UserCheck size={20} /> Tutor / Responsable de Emergencia
                          </h5>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <label className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest ml-4">Nombre Completo Responsable</label>
                            <input value={formData.tutor?.name || ''} onChange={e => setFormData({...formData, tutor: { ...(formData.tutor || { relationship: 'Padre', phone: '', dni: '' }), name: e.target.value.toUpperCase() }})} className="w-full p-6 bg-white dark:bg-slate-950 rounded-3xl font-bold outline-none border border-emerald-500/10" placeholder="NOMBRE COMPLETO" />
                          </div>
                          <div className="space-y-3">
                            <label className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest ml-4">Documento (DNI/Pasaporte)</label>
                            <input value={formData.tutor?.dni || ''} onChange={e => setFormData({...formData, tutor: { ...(formData.tutor || { relationship: 'Padre', phone: '', name: '' }), dni: e.target.value }})} className="w-full p-6 bg-white dark:bg-slate-950 rounded-3xl font-bold outline-none border border-emerald-500/10" placeholder="DOCUMENTO" />
                          </div>
                          <div className="space-y-3">
                            <label className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest ml-4">Vínculo</label>
                            <select value={formData.tutor?.relationship || 'Padre'} onChange={e => setFormData({...formData, tutor: { ...(formData.tutor || { name: '', phone: '', dni: '' }), relationship: e.target.value as any }})} className="w-full p-6 bg-white dark:bg-slate-950 rounded-3xl font-bold outline-none border border-emerald-500/10">
                              <option>Padre</option>
                              <option>Madre</option>
                              <option>Tutor Legal</option>
                              <option>Cónyuge</option>
                              <option>Otro Familiar</option>
                            </select>
                          </div>
                          <div className="space-y-3">
                            <label className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest ml-4">Teléfono Emergencia</label>
                            <input value={formData.tutor?.phone || ''} onChange={e => setFormData({...formData, tutor: { ...(formData.tutor || { name: '', relationship: 'Padre', dni: '' }), phone: e.target.value }})} className="w-full p-6 bg-white dark:bg-slate-950 rounded-3xl font-bold outline-none border border-emerald-500/10" placeholder="TELÉFONO" />
                          </div>
                        </div>
                      </section>
                    </div>
                  )}

                  {activeTab === 'sports' && (
                    <div className="space-y-12 animate-fade-in">
                      <div className="flex items-center gap-5">
                         <div className="w-1.5 h-10 bg-blue-500 rounded-full"></div>
                         <h4 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Perfil Deportivo</h4>
                      </div>
                      <div className="flex justify-end">
                        <button onClick={addAssignment} className="flex items-center gap-3 bg-primary-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
                          <PlusCircle size={18} /> Asignar Nuevo Rol
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {formData.assignments?.map((as, idx) => {
                          const disc = config.disciplines.find(d => d.id === as.disciplineId);
                          const availableCategories = disc?.branches?.flatMap(b => b.enabled ? b.categories : []) || [];
                          return (
                            <div key={as.id} className="bg-slate-50 dark:bg-white/5 p-10 rounded-[3rem] border border-slate-100 dark:border-white/5 space-y-6 relative group shadow-sm">
                              <div className="flex justify-between items-center">
                                <select 
                                  value={as.role} 
                                  onChange={e => updateAssignment(idx, 'role', e.target.value)}
                                  className="bg-transparent font-black text-sm uppercase tracking-widest outline-none text-primary-600 cursor-pointer"
                                >
                                  <option value="PLAYER">JUGADOR</option>
                                  <option value="COACH">ENTRENADOR</option>
                                  <option value="PHYSICAL_TRAINER">PREP. FÍSICO</option>
                                  <option value="MEDICAL">C. MÉDICO</option>
                                  <option value="ADMIN">ADMIN</option>
                                  <option value="COORDINATOR">COORDINADOR</option>
                                </select>
                                <button onClick={() => setFormData({...formData, assignments: formData.assignments?.filter((_, i) => i !== idx)})} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                  <Trash2 size={18} />
                                </button>
                              </div>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Disciplina</span>
                                  <select 
                                    value={as.disciplineId}
                                    onChange={e => updateAssignment(idx, 'disciplineId', e.target.value)}
                                    className="w-full bg-white dark:bg-slate-950 p-5 rounded-2xl text-[11px] font-bold outline-none border border-slate-100 dark:border-white/10"
                                  >
                                    {config.disciplines.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Categoría</span>
                                  <select 
                                    value={as.categoryId}
                                    onChange={e => updateAssignment(idx, 'categoryId', e.target.value)}
                                    className="w-full bg-white dark:bg-slate-950 p-5 rounded-2xl text-[11px] font-bold outline-none border border-slate-100 dark:border-white/10"
                                  >
                                    <option value="">(Sin Categoría)</option>
                                    {availableCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                  </select>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {activeTab === 'system' && (
                    <div className="space-y-12 animate-fade-in">
                      <div className="flex items-center gap-5">
                         <div className="w-1.5 h-10 bg-purple-500 rounded-full"></div>
                         <h4 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Perfil de Sistema</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Tipo de Perfil Maestro</label>
                          <select 
                            value={formData.systemRole} 
                            onChange={e => setFormData({...formData, systemRole: e.target.value as any})}
                            className="w-full p-8 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] font-black text-xs uppercase tracking-widest outline-none shadow-inner"
                          >
                            <option value="Socio">Socio / Miembro</option>
                            <option value="STAFF">Staff Club (Gestión)</option>
                            <option value="Externo">Externo</option>
                          </select>
                        </div>

                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">¿Habilitar Credenciales?</label>
                          <div className="flex gap-4 p-2 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
                             <button onClick={() => setFormData({...formData, canLogin: true})} className={`flex-1 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${formData.canLogin ? 'bg-primary-600 text-white shadow-xl' : 'text-slate-400'}`}>Habilitar</button>
                             <button onClick={() => setFormData({...formData, canLogin: false})} className={`flex-1 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${!formData.canLogin ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400'}`}>Bloquear</button>
                          </div>
                        </div>

                        {formData.canLogin && (
                          <div className="space-y-4 col-span-1 md:col-span-2 animate-fade-in">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nombre de Usuario para Login</label>
                            <div className="relative">
                              <User size={20} className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input value={formData.username || ''} onChange={e => setFormData({...formData, username: e.target.value.toLowerCase().replace(/\s/g, '')})} className="w-full p-8 pl-16 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] font-bold outline-none border-2 border-transparent focus:border-primary-600/30 shadow-inner" placeholder="usuario.club" />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-12 bg-emerald-500/5 rounded-[4rem] border border-emerald-500/10 flex items-start gap-8 shadow-inner">
                         <BadgeCheck className="text-emerald-500 shrink-0" size={40} />
                         <div>
                            <h5 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-2">Estado Activo</h5>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Este miembro se encuentra habilitado para todas las actividades institucionales.</p>
                         </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-12 py-10 border-t border-slate-100 dark:border-white/5 flex justify-end bg-slate-50 dark:bg-slate-950/40 shrink-0">
              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="flex items-center gap-6 bg-primary-600 text-white px-24 py-8 rounded-[3rem] font-black uppercase text-sm tracking-[0.2em] shadow-[0_20px_50px_rgba(219,39,119,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                Confirmar Alta de Legajo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberManagement;
