
import { Technician, TechLevel, Part, Asset, Job, JobStatus } from "./types";

export const MOCK_TECHS: Technician[] = [
  {
    id: "T001",
    name: "Alex Rivera",
    level: TechLevel.MASTER,
    location: { lat: 40.7128, lng: -74.0060, label: "Lower Manhattan" },
    inventory: ["P101", "P102"],
    avatar: "https://picsum.photos/id/1005/50/50",
    isAvailable: true,
  },
  {
    id: "T002",
    name: "Sarah Chen",
    level: TechLevel.JOURNEYMAN,
    location: { lat: 40.7484, lng: -73.9857, label: "Midtown" },
    inventory: ["P103"],
    avatar: "https://picsum.photos/id/1011/50/50",
    isAvailable: true,
  },
  {
    id: "T003",
    name: "Mike Kowalski",
    level: TechLevel.APPRENTICE,
    location: { lat: 40.7831, lng: -73.9712, label: "Upper West Side" },
    inventory: ["P101", "P104"],
    avatar: "https://picsum.photos/id/1025/50/50",
    isAvailable: true,
  },
];

export const MOCK_PARTS: Part[] = [
  { id: "P101", name: "Run Capacitor 35+5", sku: "CAP-355-UNIV", category: "Electrical", price: 15.00, stock: 12, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" },
  { id: "P102", name: "Contactor 2-Pole 30A", sku: "CTR-2P30", category: "Electrical", price: 22.50, stock: 4, locationType: "Van", locationName: "T001 (Alex)", distance: "0.8 mi" },
  { id: "P103", name: "TXV Valve R410A", sku: "TXV-410-2T", category: "Refrigerant", price: 85.00, stock: 2, locationType: "Retailer", locationName: "United Ref. Brooklyn", distance: "2.1 mi" },
  { id: "P104", name: "Fan Motor 1/3 HP", sku: "MTR-13-825", category: "Motors", price: 145.00, stock: 1, locationType: "Van", locationName: "T003 (Mike)", distance: "1.5 mi" },
];

export const MOCK_ASSETS: Asset[] = [
  { id: "A001", name: "Vacuum Pump 8 CFM", category: "Tools", dailyRate: 45, ownerId: "C001", ownerName: "Metro HVAC", status: "Available", imageUrl: "https://picsum.photos/id/1/200/200", location: "Jersey City" },
  { id: "A002", name: "Refrigerant Recovery Unit", category: "Compliance", dailyRate: 65, ownerId: "C002", ownerName: "Green Air LLC", status: "Available", imageUrl: "https://picsum.photos/id/2/200/200", location: "Brooklyn Navy Yard" },
  { id: "A003", name: "Portable Crane Lift", category: "Heavy", dailyRate: 250, ownerId: "C003", ownerName: "Heavy Lift Co", status: "Rented", imageUrl: "https://picsum.photos/id/3/200/200", location: "Bronx" },
];

export const MOCK_JOBS: Job[] = [
  { 
    id: "J101", 
    clientId: "C501", 
    clientName: "Empire State Prop", 
    address: "350 5th Ave, NY", 
    description: "Chiller 2 vibration alert", 
    status: JobStatus.IN_PROGRESS, 
    techId: "T001", 
    timestamp: "10:30 AM", 
    requiredSkillLevel: TechLevel.MASTER,
    location: { lat: 40.7484, lng: -73.9857 },
    estimatedDuration: 4
  },
  { 
    id: "J102", 
    clientId: "C502", 
    clientName: "Joe's Pizza", 
    address: "145 W 4th St, NY", 
    description: "Walk-in freezer warm", 
    status: JobStatus.EN_ROUTE, 
    techId: "T002", 
    timestamp: "11:15 AM", 
    requiredSkillLevel: TechLevel.JOURNEYMAN,
    location: { lat: 40.7305, lng: -74.0021 },
    estimatedDuration: 2
  },
  { 
    id: "J103", 
    clientId: "C503", 
    clientName: "Res. Complex A", 
    address: "220 CPS, NY", 
    description: "Seasonal Maintenance", 
    status: JobStatus.PENDING, 
    timestamp: "12:00 PM", 
    requiredSkillLevel: TechLevel.APPRENTICE,
    location: { lat: 40.7663, lng: -73.9774 },
    estimatedDuration: 1.5
  },
];
