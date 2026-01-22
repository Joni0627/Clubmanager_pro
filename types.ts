
export enum Position {
  GK = 'Portero',
  DEF = 'Defensa',
  MID = 'Mediocampista',
  FWD = 'Delantero',
  PLAYER = 'Jugador',
  BASE = 'Base',
  ALERO = 'Alero',
  PIVOT = 'Pivot'
}

export type Discipline = 'Fútbol' | 'Básquet' | 'Vóley' | 'Handball' | 'Hockey';

export interface MetricDefinition {
  id: string;
  name: string;
  weight: number; // Ponderación (1-10)
}

export interface CategoryConfig {
  id: string;
  name: string;
  metrics: MetricDefinition[];
}

export interface DisciplineConfig {
  id: string;
  name: string;
  categories: CategoryConfig[];
}

export interface MedicalRecord {
  id?: string;
  isFit: boolean;
  lastCheckup: string;
  expiryDate: string;
  notes: string;
}

export interface TutorInfo {
  name: string;
  email: string;
  phone: string;
}

// Fix: Added PlayerStats interface to resolve missing exported member error in PlayerCard.tsx
export interface PlayerStats {
  [key: string]: number;
}

export interface Player {
  id: string;
  name: string;
  number: number;
  position: Position | string;
  age: number;
  nationality: string;
  photoUrl: string;
  stats: Record<string, number>; // Ahora es dinámico: nombre_metrica -> valor
  overallRating: number; // Promedio ponderado calculado
  status: 'Active' | 'Injured' | 'Suspended' | 'Reserve';
  
  dni: string;
  email: string;
  phone: string;
  address: string;
  
  tutor: TutorInfo;

  discipline: string;
  division: 'Masculino' | 'Femenino' | 'Mixto' | 'Escuela Infantil'; 
  category: string; 
  squad?: string;
  
  marketValue: string;
  medical?: MedicalRecord;
  attendanceRate?: number;
}

// Fix: Added Fixture interface to resolve missing exported member error in AdminPanel.tsx
export interface Fixture {
  id: string;
  discipline: string;
  category: string;
  opponent: string;
  date: string;
  venue: 'Home' | 'Away' | string;
  competition: string;
  result: string;
}

// Fix: Added TrainingGroup interface to resolve missing exported member error in AttendanceTracker.tsx
export interface TrainingGroup {
  id: string;
  name: string;
  coachId: string;
  discipline: string;
  playerIds: string[];
  schedule: string;
}

// Fix: Added MemberFee interface to resolve missing exported member error in FeesManagement.tsx
export interface MemberFee {
  id: string;
  memberId: string;
  memberName: string;
  type: string;
  lastPaymentDate?: string;
  status: 'UpToDate' | 'Pending' | 'Late';
  amount: number;
  dueDate: string;
  paymentMethod?: string;
  reference?: string;
}

// ... (resto de interfaces se mantienen igual)
export interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  photoUrl?: string;
}

export interface TeamStructure {
    id: string;
    discipline: string;
    category: string;
    coach: string;
    physicalTrainer: string;
    medicalStaff: string;
    playersCount: number;
}

export interface ClubConfig {
    name: string;
    logoUrl: string;
    disciplines: DisciplineConfig[]; // Jerarquía centralizada
}
