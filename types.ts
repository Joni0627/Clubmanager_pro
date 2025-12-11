export enum Position {
  GK = 'Portero',
  DEF = 'Defensa',
  MID = 'Mediocampista',
  FWD = 'Delantero'
}

export interface PlayerStats {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

export interface Player {
  id: string;
  name: string;
  number: number;
  position: Position;
  age: number;
  nationality: string;
  photoUrl: string;
  stats: PlayerStats;
  status: 'Active' | 'Injured' | 'Suspended';
  marketValue: string;
  attendanceRate?: number; // Nueva propiedad
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
}

export interface Fixture {
  id: string;
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