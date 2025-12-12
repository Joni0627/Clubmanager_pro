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
  
  // Jerarquía
  discipline: Discipline;
  division: 'Masculino' | 'Femenino' | 'Mixto' | 'Escuela Infantil'; 
  category: string; // Changed to string to support Master Data
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

// NUEVO: Gestión de Cuotas
export interface MemberFee {
  id: string;
  memberId: string; // Puede ser ID de jugador o externo
  memberName: string;
  type: 'Jugador' | 'Socio' | 'Staff';
  lastPaymentDate: string;
  status: 'UpToDate' | 'Pending' | 'Late';
  amount: number;
  dueDate: string;
}

// NUEVO: Configuración de Disciplinas
export interface DisciplineConfig {
  id: string;
  name: string;
  categories: string[];
}