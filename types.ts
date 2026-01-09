
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
  issueDetected: boolean;
  issueSeverity: 'Critical' | 'Warning' | 'Advisory' | 'None';
  visualFindings: string[];
}

// Purchasing System Types
export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Customer {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  billingAddress?: BillingAddress;
  saveForFuture: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  userId: string;
  assetId: string;
  assetName: string;
  rentalDays: number;
  dailyRate: number;
  subtotal: number;
  tax: number;
  total: number;
  status: 'Pending' | 'Completed' | 'Cancelled' | 'Refunded';
  paymentMethod: string;
  paymentIntentId?: string;
  startDate: string;
  endDate: string;
  receiptNumber: string;
  notes?: string;
  createdAt: string;
}

export interface Receipt {
  order: Order;
  customer: Customer;
  assetDetails: {
    name: string;
    category: string;
    ownerName: string;
    location: string;
  };
}
