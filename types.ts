
export enum TechLevel {
  APPRENTICE = "Apprentice",
  JOURNEYMAN = "Journeyman",
  MASTER = "Master",
}

export enum JobStatus {
  PENDING = "Pending",
  EN_ROUTE = "En Route",
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed",
}

export interface Technician {
  id: string;
  name: string;
  level: TechLevel;
  location: { lat: number; lng: number; label: string };
  currentJobId?: string;
  inventory: string[]; // List of Part IDs
  avatar: string;
  isAvailable: boolean; // Availability status for dispatch
}

export interface Part {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  locationType: "Warehouse" | "Van" | "Retailer";
  locationName: string;
  distance: string; // Simulated distance
}

export interface Asset {
  id: string;
  name: string;
  category: string;
  dailyRate: number;
  ownerId: string;
  ownerName: string;
  status: "Available" | "Rented";
  imageUrl: string;
  location: string;
}

export interface Job {
  id: string;
  clientId: string;
  clientName: string;
  address: string;
  description: string;
  status: JobStatus;
  techId?: string;
  predictedParts?: string[];
  compliance?: boolean; // Local Law 97
  timestamp: string;
  requiredSkillLevel?: TechLevel;
  location: { lat: number; lng: number }; // Added for map positioning
  estimatedDuration?: number; // Hours
}

export interface TriageResult {
  diagnosis: string;
  confidence: number;
  requiredSkillLevel: TechLevel;
  recommendedParts: string[];
  estimatedHours: number;
  complianceNotes: string;
}
