
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

export interface MemberFee {
  id: string;
  member_id: string;
  period: string; // Ej: "2024-05"
  amount: number;
  status: 'Pending' | 'Paid' | 'Late';
  due_date: string;
  payment_date?: string;
  payment_method?: string;
  receipt_url?: string; // Nuevo campo para comprobante
  reference?: string;
  member?: Member; // Join con la tabla members
}

export interface MedicalHistoryItem {
  id: string;
  date: string;
  isFit: boolean;
  expiryDate: string;
  notes?: string;
  professionalName?: string;
}

export interface MedicalRecord {
  isFit: boolean;
  lastCheckup?: string;
  expiryDate: string;
  notes?: string;
  history?: MedicalHistoryItem[];
}

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
  medical: MedicalRecord;
  status: 'Active' | 'Injured' | 'Suspended';
}

// Added missing exports to resolve compilation errors in AdminPanel and App components

// Fix: Interface for season competition matches
export interface Fixture {
  id: string;
  discipline: string;
  category: string;
  opponent: string;
  date: string;
  venue: 'Home' | 'Away';
  competition: string;
  result: string;
}

// Fix: Interface for team staff and hierarchy structure
export interface TeamStructure {
  id: string;
  discipline: string;
  gender: string;
  category: string;
  coach: string;
  physicalTrainer?: string;
  medicalStaff?: string;
  playersCount: number;
}

// Fix: Interface for user authentication sessions
export interface UserSession {
  user: any;
  session: any;
}
