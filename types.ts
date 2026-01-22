
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

export interface Discipline {
  id: string;
  name: string;
  categories: Category[];
}

export interface ClubConfig {
  name: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  disciplines: Discipline[];
}

// Fix: Added missing interfaces and types to resolve import errors in components
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
  overallRating: number;
  photoUrl: string;
  dni: string;
  email: string;
  stats: Record<string, number>;
  medical: MedicalRecord;
  status?: 'Active' | 'Injured' | 'Suspended';
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
  category: string;
  coach: string;
  physicalTrainer: string;
  medicalStaff: string;
  playersCount: number;
}

export interface MemberFee {
  id?: string;
  memberId: string;
  amount: number;
  dueDate: string;
  paymentMethod: string;
  status: 'UpToDate' | 'Pending' | 'Late';
  reference?: string;
}

// Fix: Added type aliases for compatibility with specific component usages
export type Position = string;
export type MetricDefinition = Metric;
export type DisciplineConfig = Discipline;
