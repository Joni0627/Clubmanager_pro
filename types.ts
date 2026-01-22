
export enum Position {
  GK = 'Portero',
  DEF = 'Defensa',
  MID = 'Mediocampista',
  FWD = 'Delantero',
  // Generic positions for other sports
  PLAYER = 'Jugador',
  BASE = 'Base',
  ALERO = 'Alero',
  PIVOT = 'Pivot'
}

export type Discipline = 'Fútbol' | 'Básquet' | 'Vóley' | 'Handball' | 'Hockey';

export interface PlayerStats {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

export interface MedicalRecord {
  id?: string;
  isFit: boolean; // Apto médico
  lastCheckup: string;
  expiryDate: string;
  notes: string;
}

export interface TutorInfo {
  name: string;
  email: string;
  phone: string;
}

export interface Player {
  id: string;
  name: string;
  number: number;
  position: Position | string;
  age: number;
  nationality: string;
  photoUrl: string;
  stats: PlayerStats;
  status: 'Active' | 'Injured' | 'Suspended' | 'Reserve';
  
  // Datos Personales extendidos
  dni: string;
  email: string;
  phone: string;
  address: string;
  
  // Datos del Tutor
  tutor: TutorInfo;

  // Jerarquía
  discipline: Discipline;
  division: 'Masculino' | 'Femenino' | 'Mixto' | 'Escuela Infantil'; 
  category: string; 
  squad?: string;
  
  marketValue: string;
  medical?: MedicalRecord;
  attendanceRate?: number;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  photoUrl?: string;
}

export interface TrainingGroup {
  id: string;
  name: string;
  coachId: string;
  discipline: Discipline;
  playerIds: string[];
  schedule: string;
}

export interface TeamStructure {
    id: string;
    discipline: Discipline;
    category: string;
    coach: string;
    physicalTrainer: string; // Nuevo
    medicalStaff: string; // Nuevo
    playersCount: number;
}

export interface Fixture {
  id: string;
  discipline: Discipline;
  category: string;
  opponent: string;
  date: string;
  venue: 'Home' | 'Away';
  competition: string;
  result?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  status: 'Good' | 'Low' | 'Critical';
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Coach' | 'Assistant';
  avatar: string;
}

export interface AttendanceRecord {
  playerId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
}

// Gestión de Cuotas Actualizada
export interface MemberFee {
  id: string;
  memberId: string; 
  memberName: string;
  type: 'Jugador' | 'Socio' | 'Staff';
  lastPaymentDate: string;
  status: 'UpToDate' | 'Pending' | 'Late';
  amount: number;
  dueDate: string;
  paymentMethod?: 'Efectivo' | 'Transferencia' | 'Tarjeta'; // Nuevo
  reference?: string; // Nuevo (Comprobante)
}

export interface DisciplineConfig {
  id: string;
  name: string;
  categories: string[];
}

export interface ClubConfig {
    name: string;
    logoUrl: string;
}
