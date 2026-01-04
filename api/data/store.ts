// Shared in-memory data store
// This mimics a database for the purpose of the demo

export interface HelperLocation {
    lat: number;
    lng: number;
    label?: string;
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
    requiredSkillLevel: string;
    location: HelperLocation;
    estimatedDuration: number;
}

export interface Technician {
    id: string;
    name: string;
    level: string;
    location: HelperLocation;
    inventory: string[];
    avatar: string;
    isAvailable: boolean;
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

// Initial Data
// Initial Data for HVAC Hub Simulation

export const jobs: Job[] = [
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
    {
        id: "J104",
        clientId: "C504",
        clientName: "Tech Startup HQ",
        address: "111 8th Ave, NY",
        description: "Server room AC failure",
        status: "Pending",
        timestamp: "09:00 AM",
        requiredSkillLevel: "Master",
        location: { lat: 40.7410, lng: -74.0025 },
        estimatedDuration: 3
    },
    {
        id: "J105",
        clientId: "C505",
        clientName: "Brooklyn Hospital",
        address: "121 Dekalb Ave, BK",
        description: "Negative pressure error",
        status: "Pending",
        timestamp: "08:30 AM",
        requiredSkillLevel: "Journeyman",
        location: { lat: 40.6905, lng: -73.9772 },
        estimatedDuration: 5
    }
];

export const technicians: Technician[] = [
    {
        id: "T001",
        name: "Alex Rivera",
        level: "Master",
        location: { lat: 40.7128, lng: -74.0060, label: "Lower Manhattan" },
        inventory: ["P101", "P102", "P115"],
        avatar: "https://picsum.photos/id/1005/50/50",
        isAvailable: true,
    },
    {
        id: "T002",
        name: "Sarah Chen",
        level: "Journeyman",
        location: { lat: 40.7484, lng: -73.9857, label: "Midtown" },
        inventory: ["P103", "P120"],
        avatar: "https://picsum.photos/id/1011/50/50",
        isAvailable: true,
    },
    {
        id: "T003",
        name: "Mike Kowalski",
        level: "Apprentice",
        location: { lat: 40.7831, lng: -73.9712, label: "Upper West Side" },
        inventory: ["P101", "P104", "P112"],
        avatar: "https://picsum.photos/id/1025/50/50",
        isAvailable: true,
    },
    {
        id: "T004",
        name: "David Kim",
        level: "Master",
        location: { lat: 40.6782, lng: -73.9442, label: "Brooklyn Hub" },
        inventory: ["P105", "P106", "P118"],
        avatar: "https://picsum.photos/id/1012/50/50",
        isAvailable: false,
    }
];

export const parts: Part[] = [
    // Electrical
    { id: "P101", name: "Run Capacitor 35+5", sku: "CAP-355-UNIV", category: "Electrical", price: 15.00, stock: 12, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" },
    { id: "P102", name: "Contactor 2-Pole 30A", sku: "CTR-2P30", category: "Electrical", price: 22.50, stock: 4, locationType: "Van", locationName: "T001 (Alex)", distance: "0.8 mi" },
    { id: "P104", name: "Transformer 40VA", sku: "TRF-40VA-MULTI", category: "Electrical", price: 18.00, stock: 15, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" },
    { id: "P105", name: "Thermostat C-Wire Adapter", sku: "THERM-CW-01", category: "Controls", price: 35.00, stock: 8, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" },
    { id: "P112", name: "Defrost Control Board", sku: "PCB-DEF-UNIV", category: "Electrical", price: 85.00, stock: 2, locationType: "Retailer", locationName: "SupplyCorp BX", distance: "8.5 mi" },

    // Refrigerants & Chemicals
    { id: "P103", name: "TXV Valve R410A", sku: "TXV-410-2T", category: "Refrigerant", price: 85.00, stock: 2, locationType: "Retailer", locationName: "United Ref. Brooklyn", distance: "2.1 mi" },
    { id: "P106", name: "R410A Refrigerant 25lb", sku: "REF-410-25", category: "Refrigerant", price: 350.00, stock: 3, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" }, // Price corrected
    { id: "P115", name: "Leak Stop (Injectable)", sku: "CHEM-LK-STP", category: "Chemicals", price: 45.00, stock: 20, locationType: "Van", locationName: "T001 (Alex)", distance: "0.8 mi" },
    { id: "P116", name: "Coil Cleaner (Foaming)", sku: "CHEM-CL-FOAM", category: "Chemicals", price: 12.00, stock: 4, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" },
    { id: "P117", name: "R22 Refrigerant 30lb", sku: "REF-22-LEGACY", category: "Refrigerant", price: 850.00, stock: 1, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" }, // Critical

    // Motors & Mechanical
    { id: "P108", name: "Fan Motor 1/3 HP", sku: "MTR-13-825", category: "Motors", price: 145.00, stock: 1, locationType: "Van", locationName: "T003 (Mike)", distance: "1.5 mi" },
    { id: "P109", name: "Condenser Fan Blade 22\"", sku: "FAN-BLD-22", category: "Mechanical", price: 55.00, stock: 6, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" },
    { id: "P110", name: "Blower Wheel 10x10", sku: "BLW-WHL-1010", category: "Mechanical", price: 65.00, stock: 0, locationType: "Retailer", locationName: "United Ref. Brooklyn", distance: "2.1 mi" }, // Out of stock

    // Electronics & Boards
    { id: "P111", name: "Universal Control Board", sku: "PCB-UNI-X", category: "Electronics", price: 120.00, stock: 1, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" }, // Low
    { id: "P113", name: "Ignition Control Module", sku: "IGN-MOD-77", category: "Electronics", price: 180.00, stock: 3, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" },
    { id: "P114", name: "Flame Sensor", sku: "SEN-FLM-01", category: "Electronics", price: 12.00, stock: 25, locationType: "Van", locationName: "T002 (Sarah)", distance: "1.2 mi" },

    // Tools & Misc
    { id: "P118", name: "Filter Drier 3/8", sku: "FLT-DRI-38", category: "Refrigerant", price: 18.00, stock: 8, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" },
    { id: "P119", name: "Schrader Valve Cores (10pk)", sku: "VLV-CORE-10", category: "Misc", price: 5.00, stock: 50, locationType: "Van", locationName: "T004 (David)", distance: "3.5 mi" },
    { id: "P120", name: "PVC Trap 3/4\"", sku: "PVC-TRP-34", category: "Plumbing", price: 8.00, stock: 11, locationType: "Van", locationName: "T002 (Sarah)", distance: "1.2 mi" },
];

export const assets: Asset[] = [
    {
        id: "A001",
        name: "FLIR Thermal Camera E8",
        category: "Diagnostics",
        dailyRate: 45,
        ownerId: "C902",
        ownerName: "Mike's HVAC",
        status: "Available",
        imageUrl: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=400",
        location: "Brooklyn Navy Yard"
    },
    {
        id: "A002",
        name: "Refrigerant Recovery Machine",
        category: "Heavy Equipment",
        dailyRate: 85,
        ownerId: "C501",
        ownerName: "Empire Mechanical",
        status: "Available",
        imageUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=400",
        location: "Long Island City"
    },
    {
        id: "A003",
        name: "Hydro-Jetting Rig Used",
        category: "Plumbing",
        dailyRate: 150,
        ownerId: "C888",
        ownerName: "City Services Corp",
        status: "Rented",
        imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400",
        location: "Jersey City"
    },
    {
        id: "A004",
        name: "Scissor Lift 19ft",
        category: "Access",
        dailyRate: 120,
        ownerId: "C101",
        ownerName: "Premier Heights",
        status: "Available",
        imageUrl: "https://images.unsplash.com/photo-1588636224151-f40884df00e9?auto=format&fit=crop&q=80&w=400",
        location: "Midtown West"
    },
    {
        id: "A005",
        name: "Digital Manifold Gauge",
        category: "Diagnostics",
        dailyRate: 25,
        ownerId: "C902",
        ownerName: "Mike's HVAC",
        status: "Available",
        imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400",
        location: "Brooklyn Navy Yard"
    },
    {
        id: "A006",
        name: "Vacuum Pump 8CFM",
        category: "Heavy Equipment",
        dailyRate: 40,
        ownerId: "C501",
        ownerName: "Empire Mechanical",
        status: "Available",
        imageUrl: "https://plus.unsplash.com/premium_photo-1664303847960-586318f59035?auto=format&fit=crop&q=80&w=400",
        location: "Long Island City"
    },
    {
        id: "A007",
        name: "Combustion Analyzer",
        category: "Diagnostics",
        dailyRate: 55,
        ownerId: "C888",
        ownerName: "City Services Corp",
        status: "Available",
        imageUrl: "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&q=80&w=400",
        location: "Jersey City"
    },
    {
        id: "A008",
        name: "Pipe Press Tool",
        category: "Plumbing",
        dailyRate: 65,
        ownerId: "C101",
        ownerName: "Premier Heights",
        status: "Rented",
        imageUrl: "https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&q=80&w=400",
        location: "Midtown West"
    },
    {
        id: "A009",
        name: "Portable AC 5 Ton",
        category: "Temporary Cooling",
        dailyRate: 200,
        ownerId: "C501",
        ownerName: "Empire Mechanical",
        status: "Available",
        imageUrl: "https://images.unsplash.com/photo-1632053002228-e4d0d04c3527?auto=format&fit=crop&q=80&w=400",
        location: "Queens Warehouse"
    }
];
