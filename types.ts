
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
  bloodType?: string;
  medicalInsurance?: string;
  weight?: string;
  height?: string;
  tutor?: Tutor;
  assignments: Assignment[];
  status: 'Active' | 'Inactive' | 'Pending';
  createdAt: string;
  // Perfil de Sistema
  systemRole: 'STAFF' | 'Socio' | 'Externo';
  canLogin: boolean;
  username?: string;
}

export interface UserSession {
  memberId: string;
  email: string;
  role: AppRole;
  permissions: string[];
  assignedCategories: string[];
}

export interface MedicalRecord {
  isFit: boolean;
  lastCheckup?: string;
  expiryDate: string;
  notes?: string;
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

export interface MemberFee {
  id: string;
  player_id: string;
  amount: number;
  status: 'Pending' | 'UpToDate' | 'Late';
  due_date: string;
  payment_method: string;
  reference?: string;
  player?: Player;
}

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

export interface TeamStructure {
  id: string;
  discipline: string;
  gender: 'Masculino' | 'Femenino';
  category: string;
  coach: string;
  physicalTrainer: string;
  medicalStaff: string;
  playersCount: number;
}
