
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
  gender: 'Masculino' | 'Femenino' | 'Mixto';
  categories: Category[];
}

export interface Discipline {
  id: string;
  name: string; // Ej: "Fútbol"
  icon?: string; // URL del Avatar/Escudo
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
  lastCheckup: string;
  expiryDate: string;
  notes: string;
}

export interface Player {
  id: string;
  name: string;
  number: string;
  position: string;
  category: string;
  discipline: string;
  gender: 'Masculino' | 'Femenino' | 'Mixto';
  overallRating: number;
  photoUrl: string;
  dni: string;
  email: string;
  stats: Record<string, number>;
  medical: MedicalRecord;
  status?: 'Active' | 'Injured' | 'Suspended';
}

export interface TeamStructure {
  id: string;
  discipline: string;
  gender: string;
  category: string;
  coach: string;
  // Added missing fields to TeamStructure
  physicalTrainer: string;
  medicalStaff: string;
  playersCount: number;
}

// Added missing Fixture interface
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

// Added missing MemberFee interface to match FeesManagement.tsx usage
export interface MemberFee {
  id: string;
  memberId?: string;
  player_id?: string;
  amount: number;
  status: string;
  dueDate?: string;
  due_date?: string;
  paymentMethod?: string;
  payment_method?: string;
  reference?: string;
  player?: Player;
}

export type Position = string;
export type MetricDefinition = Metric;
