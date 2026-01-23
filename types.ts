
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
  categories: Category[];
}

export interface Discipline {
  id: string;
  name: string;
  type: 'Fútbol' | 'Básquet' | 'Rugby' | 'Vóley' | 'Hockey' | 'Otro';
  icon?: string;
  branches: Branch[];
}

export interface ClubConfig {
  name: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  disciplines: Discipline[];
}

// Added missing MedicalRecord interface
export interface MedicalRecord {
  isFit: boolean;
  lastCheckup?: string;
  expiryDate: string;
  notes?: string;
}

export interface Player {
  id: string;
  name: string;
  number: string;
  position: string;
  category: string;
  discipline: string;
  gender: 'Masculino' | 'Femenino';
  overallRating: number;
  photoUrl: string;
  dni: string;
  email: string;
  stats: Record<string, number>;
  // Updated to use MedicalRecord interface
  medical: MedicalRecord;
  status?: 'Active' | 'Injured' | 'Suspended';
}

export interface MemberFee {
  id: string;
  player_id: string;
  amount: number;
  status: string;
  due_date: string;
  payment_method: string;
  reference?: string;
}

// Added missing Fixture interface
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

// Added missing TeamStructure interface
export interface TeamStructure {
  id: string;
  discipline: string;
  gender: 'Masculino' | 'Femenino';
  category: string;
  coach: string;
  physicalTrainer?: string;
  medicalStaff?: string;
  playersCount: number;
}
