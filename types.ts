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
  id?: string; // Added ID for management
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
  discipline: Discipline; // Nueva
  division: 'Masculino' | 'Femenino' | 'Mixto' | 'Escuela Infantil'; 
  category: 'Primera' | 'Reserva' | 'Sub-20' | 'Sub-17' | 'Cat. 2012' | 'Cat. 2013' | 'Senior'; 
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
  name: string; // ej: "Defensores Primera" o "Grupo A - Martes/Jueves"
  coachId: string;
  discipline: Discipline;
  playerIds: string[];
  schedule: string;
}

export interface Fixture {
  id: string;
  discipline: Discipline; // Nueva
  category: string; // Nueva
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