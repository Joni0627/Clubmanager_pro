
export type AppRole = 'ADMIN' | 'COORDINATOR' | 'COACH' | 'PHYSICAL_TRAINER' | 'MEDICAL' | 'PLAYER' | 'DELEGATE';

export interface Metric {
  id: string;
  name: string;
  weight: number;
}

export interface Category {
  id: string;
  name: string;
  metrics: Metric[];
}

export interface Branch {
  gender: 'Masculino' | 'Femenino';
  enabled: boolean;
  categories: Category[];
}

export interface Discipline {
  id: string;
  name: string;
  sportType: 'Fútbol' | 'Básquet' | 'Rugby' | 'Vóley' | 'Hockey' | 'Tenis' | 'Otro';
  iconUrl: string;
  branches: Branch[];
}

export interface ClubConfig {
  name: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  disciplines: Discipline[];
}

export interface Tutor {
  name: string;
  dni: string;
  relationship: 'Padre' | 'Madre' | 'Tutor Legal' | 'Otro';
  phone: string;
  email?: string;
}

export interface Assignment {
  id: string;
  disciplineId: string;
  categoryId: string;
  role: AppRole;
}

export interface Member {
  id: string;
  name: string;
  dni: string;
  gender: 'Masculino' | 'Femenino' | 'Otro';
  birthDate: string;
  email: string;
  phone: string;
  photoUrl: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  bloodType?: string;
  medicalInsurance?: string;
  weight?: string;
  height?: string;
  tutor?: Tutor;
  assignments: Assignment[];
  status: 'Active' | 'Inactive' | 'Pending';
  createdAt: string;
  systemRole: 'STAFF' | 'Socio' | 'Externo';
  canLogin: boolean;
  username?: string;
  stats: Record<string, number>;
  overallRating?: number;
}

// --- MEDICAL TYPES ---

// Added missing MedicalHistoryItem interface
export interface MedicalHistoryItem {
  id: string;
  date: string;
  isFit: boolean;
  expiryDate: string;
  notes: string;
  professionalName: string;
}

// Added missing MedicalRecord interface
export interface MedicalRecord {
  isFit: boolean;
  lastCheckup?: string;
  expiryDate: string;
  notes?: string;
  history?: MedicalHistoryItem[];
}

// --- PLAYER TYPE ---

// Added missing Player interface used in multiple components
export interface Player {
  id: string;
  name: string;
  dni: string;
  number: string;
  position: string;
  discipline: string;
  gender: string;
  category: string;
  photoUrl: string;
  email: string;
  overallRating: number;
  stats: Record<string, number>;
  medical?: MedicalRecord;
  status: string;
}

// --- ADMIN & FIXTURE TYPES ---

// Added missing Fixture interface for AdminPanel
export interface Fixture {
  id: string;
  discipline: string;
  category: string;
  opponent: string;
  date: string;
  venue: string;
  competition: string;
  result: string;
}

// Added missing TeamStructure interface for AdminPanel
export interface TeamStructure {
  id: string;
  discipline: string;
  gender: string;
  category: string;
  coach: string;
  physicalTrainer: string;
  medicalStaff: string;
  playersCount: number;
}

// --- FEES TYPES ---

// Added missing MemberFee interface for FeesManagement
export interface MemberFee {
  id: string;
  member_id: string;
  amount: number;
  due_date: string;
  period: string;
  status: 'Pending' | 'Paid' | 'Late';
  payment_method?: string;
  payment_date?: string | null;
  receipt_url?: string;
  reference?: string;
  member?: Member;
}

// --- NUEVOS TIPOS PARA TORNEOS ---

export type TournamentType = 'Professional' | 'Internal';
export type MatchStatus = 'Scheduled' | 'Finished' | 'Canceled';
export type MatchEventType = 'Goal' | 'YellowCard' | 'RedCard' | 'Foul' | 'Substitution';

export interface TournamentParticipant {
  id: string;
  tournamentId: string;
  name: string;
  memberIds: string[]; // IDs de la tabla Members
}

export interface TournamentSettings {
  hasGroups: boolean;
  groupsCount: number;
  advancingPerGroup: number;
  hasPlayoffs: boolean;
  playoffStart: 'F' | 'SF' | 'QF' | 'R16'; // Final, Semi, Cuartos, Octavos
}

export interface Tournament {
  id: string;
  name: string;
  type: TournamentType;
  disciplineId: string;
  categoryId: string;
  gender: 'Masculino' | 'Femenino';
  status: 'Open' | 'Finished';
  settings?: TournamentSettings;
  createdAt: string;
}

export interface Match {
  id: string;
  tournamentId: string;
  homeTeam: string; // Para modo pro (texto)
  awayTeam: string; // Para modo pro (texto)
  homeParticipantId?: string; // Para modo interno
  awayParticipantId?: string; // Para modo interno
  homeScore?: number;
  awayScore?: number;
  date: string;
  time?: string;
  venue?: string;
  status: MatchStatus;
  group?: string; // Ej: 'A'
  stage?: string; // Ej: 'Fase de Grupos' o 'Semifinal'
  events?: MatchEvent[];
}

export interface MatchEvent {
  id: string;
  matchId: string;
  playerId: string; // Miembro ID
  type: MatchEventType;
  minute?: number;
  notes?: string;
}

export interface UserSession {
  user: any;
  session: any;
}
