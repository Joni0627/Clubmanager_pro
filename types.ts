

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
  iconUrl: string; // Logo específico de la disciplina
  branches: Branch[];
}

export interface ClubConfig {
  name: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  disciplines: Discipline[];
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

// Added missing interfaces for AdminPanel
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