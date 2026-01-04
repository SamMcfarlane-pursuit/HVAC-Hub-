// In-memory data store for HVAC Hub
// Persists during serverless warm starts

import { TechLevel, JobStatus } from '../../types';

export interface Technician {
    id: string;
    name: string;
    level: string;
    location: { lat: number; lng: number; label: string };
    inventory: string[];
    avatar: string;
    isAvailable: boolean;
}

export interface Job {
    id: string;
    clientId: string;
    clientName: string;
    address: string;
    description: string;
    status: string;
    techId?: string;
    timestamp: string;
    requiredSkillLevel?: string;
    location: { lat: number; lng: number };
    estimatedDuration?: number;
}

export interface Part {
    id: string;
    name: string;
    sku: string;
    category: string;
    price: number;
    stock: number;
    locationType: string;
    locationName: string;
    distance: string;
}

// Initial seed data
const initialTechnicians: Technician[] = [
    {
        id: "T001",
        name: "Alex Rivera",
        level: "Master",
        location: { lat: 40.7128, lng: -74.0060, label: "Lower Manhattan" },
        inventory: ["P101", "P102"],
        avatar: "https://picsum.photos/id/1005/50/50",
        isAvailable: true,
    },
    {
        id: "T002",
        name: "Sarah Chen",
        level: "Journeyman",
        location: { lat: 40.7484, lng: -73.9857, label: "Midtown" },
        inventory: ["P103"],
        avatar: "https://picsum.photos/id/1011/50/50",
        isAvailable: true,
    },
    {
        id: "T003",
        name: "Mike Kowalski",
        level: "Apprentice",
        location: { lat: 40.7831, lng: -73.9712, label: "Upper West Side" },
        inventory: ["P101", "P104"],
        avatar: "https://picsum.photos/id/1025/50/50",
        isAvailable: true,
    },
];

const initialJobs: Job[] = [
    {
        id: "J101",
        clientId: "C501",
        clientName: "Empire State Prop",
        address: "350 5th Ave, NY",
        description: "Chiller 2 vibration alert",
        status: "In Progress",
        techId: "T001",
        timestamp: "10:30 AM",
        requiredSkillLevel: "Master",
        location: { lat: 40.7484, lng: -73.9857 },
        estimatedDuration: 4
    },
    {
        id: "J102",
        clientId: "C502",
        clientName: "Joe's Pizza",
        address: "145 W 4th St, NY",
        description: "Walk-in freezer warm",
        status: "En Route",
        techId: "T002",
        timestamp: "11:15 AM",
        requiredSkillLevel: "Journeyman",
        location: { lat: 40.7305, lng: -74.0021 },
        estimatedDuration: 2
    },
    {
        id: "J103",
        clientId: "C503",
        clientName: "Res. Complex A",
        address: "220 CPS, NY",
        description: "Seasonal Maintenance",
        status: "Pending",
        timestamp: "12:00 PM",
        requiredSkillLevel: "Apprentice",
        location: { lat: 40.7663, lng: -73.9774 },
        estimatedDuration: 1.5
    },
];

const initialParts: Part[] = [
    { id: "P101", name: "Run Capacitor 35+5", sku: "CAP-355-UNIV", category: "Electrical", price: 15.00, stock: 12, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" },
    { id: "P102", name: "Contactor 2-Pole 30A", sku: "CTR-2P30", category: "Electrical", price: 22.50, stock: 4, locationType: "Van", locationName: "T001 (Alex)", distance: "0.8 mi" },
    { id: "P103", name: "TXV Valve R410A", sku: "TXV-410-2T", category: "Refrigerant", price: 85.00, stock: 2, locationType: "Retailer", locationName: "United Ref. Brooklyn", distance: "2.1 mi" },
    { id: "P104", name: "Fan Motor 1/3 HP", sku: "MTR-13-825", category: "Motors", price: 145.00, stock: 1, locationType: "Van", locationName: "T003 (Mike)", distance: "1.5 mi" },
    { id: "P105", name: "Thermostat C-Wire Adapter", sku: "THERM-CW-01", category: "Controls", price: 35.00, stock: 8, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" },
    { id: "P106", name: "R410A Refrigerant 25lb", sku: "REF-410-25", category: "Refrigerant", price: 275.00, stock: 3, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" },
];

// Global store (persists during warm serverless instance)
class DataStore {
    private technicians: Technician[];
    private jobs: Job[];
    private parts: Part[];
    private jobCounter: number;

    constructor() {
        this.technicians = [...initialTechnicians];
        this.jobs = [...initialJobs];
        this.parts = [...initialParts];
        this.jobCounter = 104; // Start after J103
    }

    // Technicians
    getTechnicians(): Technician[] {
        return this.technicians;
    }

    updateTechnician(id: string, updates: Partial<Technician>): Technician | null {
        const index = this.technicians.findIndex(t => t.id === id);
        if (index === -1) return null;
        this.technicians[index] = { ...this.technicians[index], ...updates };
        return this.technicians[index];
    }

    // Jobs
    getJobs(): Job[] {
        return this.jobs;
    }

    createJob(job: Omit<Job, 'id'>): Job {
        const newJob: Job = {
            ...job,
            id: `J${this.jobCounter++}`,
        };
        this.jobs.unshift(newJob);
        return newJob;
    }

    updateJob(id: string, updates: Partial<Job>): Job | null {
        const index = this.jobs.findIndex(j => j.id === id);
        if (index === -1) return null;
        this.jobs[index] = { ...this.jobs[index], ...updates };
        return this.jobs[index];
    }

    deleteJob(id: string): boolean {
        const index = this.jobs.findIndex(j => j.id === id);
        if (index === -1) return false;
        this.jobs.splice(index, 1);
        return true;
    }

    // Parts
    getParts(): Part[] {
        return this.parts;
    }

    updatePartStock(id: string, stockChange: number): Part | null {
        const index = this.parts.findIndex(p => p.id === id);
        if (index === -1) return null;
        this.parts[index].stock = Math.max(0, this.parts[index].stock + stockChange);
        return this.parts[index];
    }
}

// Singleton instance
export const store = new DataStore();
