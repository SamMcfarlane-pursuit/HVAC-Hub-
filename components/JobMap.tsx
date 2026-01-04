
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Truck, Plus, X, Briefcase, Clock, User, AlertTriangle, Wrench, Wand2, ChevronRight, Radio, ShieldAlert, Users, Power, Map as MapIcon, MousePointer2, Check, Layers } from 'lucide-react';
import { JobStatus, TechLevel, Job, Technician } from '../types';

// API Configuration
const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? ''
    : '';

// Helper to map string status to enum
const mapStatus = (status: string): JobStatus => {
    switch (status) {
        case 'In Progress': return JobStatus.IN_PROGRESS;
        case 'En Route': return JobStatus.EN_ROUTE;
        case 'Completed': return JobStatus.COMPLETED;
        default: return JobStatus.PENDING;
    }
};

// Helper to map string level to enum
const mapLevel = (level: string): TechLevel => {
    switch (level) {
        case 'Master': return TechLevel.MASTER;
        case 'Apprentice': return TechLevel.APPRENTICE;
        default: return TechLevel.JOURNEYMAN;
    }
};

// Map Bounds for NYC Metro Area
// Used to normalize Lat/Lng to % x/y for the SVG map
const MAP_BOUNDS = {
    minLat: 40.68, // South
    maxLat: 40.82, // North
    minLng: -74.05, // West
    maxLng: -73.93  // East
};

// Landmarks for context
const LANDMARKS = [
    { label: "Central Park", lat: 40.7829, lng: -73.9654 },
    { label: "Midtown", lat: 40.7549, lng: -73.9840 },
    { label: "Lower Manhattan", lat: 40.7128, lng: -74.0060 },
    { label: "Williamsburg", lat: 40.7178, lng: -73.9574 },
    { label: "Jersey City", lat: 40.7178, lng: -74.0431 }
];

const TECH_COLORS = [
    '#3b82f6', // Blue (Tech 1)
    '#e11d48', // Rose (Tech 2)
    '#10b981', // Emerald (Tech 3)
    '#f59e0b', // Amber (Tech 4)
    '#8b5cf6', // Violet (Tech 5)
];

const getProjectedPosition = (lat: number, lng: number) => {
    const latPercent = (lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat);
    const lngPercent = (lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng);

    // Invert Lat because screen Y coordinates go down, but Latitude goes up
    return {
        top: (1 - latPercent) * 100,
        left: lngPercent * 100
    };
};

const getLevelValue = (level: TechLevel) => {
    switch (level) {
        case TechLevel.MASTER: return 3;
        case TechLevel.JOURNEYMAN: return 2;
        case TechLevel.APPRENTICE: return 1;
        default: return 0;
    }
};

// Haversine formula to calculate distance in miles
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3958.8; // Radius of Earth in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Routing Constants
const AVG_SPEED_MPH = 15; // NYC Traffic assumption
const BREAK_THRESHOLD_HOURS = 4; // Max work before break
const BREAK_DURATION_HOURS = 1; // 1 hour break

export const JobMap: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTechStatusModalOpen, setIsTechStatusModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [formData, setFormData] = useState({
        clientName: '',
        address: '',
        description: '',
        requiredSkillLevel: TechLevel.JOURNEYMAN,
        estimatedDuration: 2
    });
    const [optimizing, setOptimizing] = useState(false);
    const [hoveredTechId, setHoveredTechId] = useState<string | null>(null);
    const [showStrategicZones, setShowStrategicZones] = useState(false);

    // Manual Location Picking State
    const [isLocationMode, setIsLocationMode] = useState(false);
    const [newJobLocation, setNewJobLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [isDraggingPin, setIsDraggingPin] = useState(false);
    const mapRef = useRef<HTMLDivElement>(null);

    // Fetch initial data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [jobsRes, techsRes] = await Promise.all([
                    fetch(`${API_BASE}/api/jobs`),
                    fetch(`${API_BASE}/api/technicians`)
                ]);

                if (!jobsRes.ok || !techsRes.ok) {
                    throw new Error('Failed to fetch data');
                }

                const jobsData = await jobsRes.json();
                const techsData = await techsRes.json();

                // Map API data to typed objects
                setJobs(jobsData.map((j: any) => ({
                    ...j,
                    status: mapStatus(j.status),
                    requiredSkillLevel: j.requiredSkillLevel ? mapLevel(j.requiredSkillLevel) : undefined
                })));
                setTechnicians(techsData.map((t: any) => ({
                    ...t,
                    level: mapLevel(t.level)
                })));
                setApiError(null);
            } catch (err) {
                console.error('API Error:', err);
                setApiError('Failed to connect to backend');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Simulate Live GPS Updates
    useEffect(() => {
        const interval = setInterval(() => {
            setTechnicians(prevTechs => prevTechs.map(tech => {
                if (!tech.isAvailable) return tech;

                const latDelta = (Math.random() - 0.5) * 0.0002;
                const lngDelta = (Math.random() - 0.5) * 0.0002;

                return {
                    ...tech,
                    location: {
                        ...tech.location,
                        lat: tech.location.lat + latDelta,
                        lng: tech.location.lng + lngDelta,
                        label: tech.location.label
                    }
                };
            }));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleOpenBookJob = () => {
        setNewJobLocation(null);
        setFormData({ clientName: '', address: '', description: '', requiredSkillLevel: TechLevel.JOURNEYMAN, estimatedDuration: 2 });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Use manually picked location or random fallback
        const randLat = MAP_BOUNDS.minLat + (Math.random() * (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat));
        const randLng = MAP_BOUNDS.minLng + (Math.random() * (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng));
        const finalLocation = newJobLocation || { lat: randLat, lng: randLng };

        try {
            const response = await fetch(`${API_BASE}/api/jobs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientName: formData.clientName,
                    address: formData.address,
                    description: formData.description,
                    requiredSkillLevel: formData.requiredSkillLevel,
                    location: finalLocation,
                    estimatedDuration: formData.estimatedDuration
                })
            });

            if (!response.ok) throw new Error('Failed to create job');

            const newJob = await response.json();
            setJobs([{ ...newJob, status: mapStatus(newJob.status), requiredSkillLevel: mapLevel(newJob.requiredSkillLevel) }, ...jobs]);
        } catch (err) {
            console.error('Create job error:', err);
            // Fallback to local creation
            const newJob: Job = {
                id: `J${Math.floor(Math.random() * 9000) + 1000}`,
                clientId: `C${Math.floor(Math.random() * 1000)}`,
                clientName: formData.clientName,
                address: formData.address,
                description: formData.description,
                status: JobStatus.PENDING,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                requiredSkillLevel: formData.requiredSkillLevel,
                location: finalLocation,
                estimatedDuration: formData.estimatedDuration
            };
            setJobs([newJob, ...jobs]);
        }

        setIsModalOpen(false);
        setNewJobLocation(null);
        setFormData({ clientName: '', address: '', description: '', requiredSkillLevel: TechLevel.JOURNEYMAN, estimatedDuration: 2 });
    };

    // Map Interaction Handlers
    const handleMapClick = (e: React.MouseEvent) => {
        if (!isLocationMode || isDraggingPin) return;
        if (!mapRef.current) return;

        const rect = mapRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const leftPercent = (x / rect.width) * 100;
        const topPercent = (y / rect.height) * 100;

        const latPercent = 1 - (topPercent / 100);
        const lat = MAP_BOUNDS.minLat + (latPercent * (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat));

        const lngPercent = leftPercent / 100;
        const lng = MAP_BOUNDS.minLng + (lngPercent * (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng));

        setNewJobLocation({ lat, lng });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDraggingPin || !isLocationMode || !mapRef.current) return;

        const rect = mapRef.current.getBoundingClientRect();
        // Clamp to bounds
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

        const leftPercent = (x / rect.width) * 100;
        const topPercent = (y / rect.height) * 100;

        const latPercent = 1 - (topPercent / 100);
        const lat = MAP_BOUNDS.minLat + (latPercent * (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat));

        const lngPercent = leftPercent / 100;
        const lng = MAP_BOUNDS.minLng + (lngPercent * (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng));

        setNewJobLocation({ lat, lng });
    };

    const handlePinMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent map click
        setIsDraggingPin(true);
    };

    const handleMouseUp = () => {
        setIsDraggingPin(false);
    };

    const confirmLocation = () => {
        if (newJobLocation) {
            setFormData(prev => ({
                ...prev,
                address: `${newJobLocation.lat.toFixed(4)}, ${newJobLocation.lng.toFixed(4)}`
            }));
        }
        setIsLocationMode(false);
        setIsModalOpen(true);
    };

    const handleOptimizeRoutes = () => {
        setOptimizing(true);

        setTimeout(() => {
            // 1. Identify Unassigned Jobs
            const unassignedJobs = jobs.filter(j => !j.techId && j.status !== JobStatus.COMPLETED);

            // 2. Prepare Tech State (Assignments Map)
            const techAssignments: Record<string, Job[]> = {};
            technicians.forEach(t => {
                if (!t.isAvailable) return;
                techAssignments[t.id] = jobs.filter(j => j.techId === t.id && j.status !== JobStatus.COMPLETED);
            });

            const newAssignments: Job[] = [];

            // 3. Smart Bundle Assignment
            // For each unassigned job, test it against every tech's existing route.
            // We calculate the Total Time of the route IF we added this job and re-optimized the path.
            unassignedJobs.forEach(job => {
                let bestTechId: string | null = null;
                let minTotalScheduleTime = Infinity;

                technicians.filter(t => t.isAvailable).forEach(tech => {
                    // Skill Verification
                    const isQualified = !job.requiredSkillLevel || getLevelValue(tech.level) >= getLevelValue(job.requiredSkillLevel);
                    if (!isQualified) return;

                    // Proposed Jobs: Current Active Jobs + New Job
                    const proposedJobs = [...(techAssignments[tech.id] || []), job];

                    // --- Route Simulation (Nearest Neighbor) ---
                    // We re-order the proposed jobs to find the most efficient path starting from Tech Location
                    // Explicitly define simPos type to avoid assignment error when updating with job location
                    let simPos: { lat: number; lng: number } = tech.location;
                    const optimizedPath: Job[] = [];
                    let jobsToVisit = [...proposedJobs];

                    while (jobsToVisit.length > 0) {
                        // Find closest next job
                        jobsToVisit.sort((a, b) => {
                            const distA = calculateDistance(simPos.lat, simPos.lng, a.location.lat, a.location.lng);
                            const distB = calculateDistance(simPos.lat, simPos.lng, b.location.lat, b.location.lng);
                            return distA - distB;
                        });

                        const nextJob = jobsToVisit.shift();
                        if (nextJob) {
                            optimizedPath.push(nextJob);
                            simPos = nextJob.location;
                        }
                    }

                    // --- Cost Calculation ---
                    let timeElapsedHours = 0;
                    let workTimeSinceBreak = 0;
                    let currentSimLoc = tech.location;

                    for (const pathJob of optimizedPath) {
                        const dist = calculateDistance(currentSimLoc.lat, currentSimLoc.lng, pathJob.location.lat, pathJob.location.lng);
                        const travelTime = dist / AVG_SPEED_MPH;
                        const jobDuration = pathJob.estimatedDuration || 2;

                        // Travel
                        timeElapsedHours += travelTime;

                        // Break Logic
                        if (workTimeSinceBreak + jobDuration > BREAK_THRESHOLD_HOURS) {
                            timeElapsedHours += BREAK_DURATION_HOURS;
                            workTimeSinceBreak = 0;
                        }

                        // Work
                        timeElapsedHours += jobDuration;
                        workTimeSinceBreak += jobDuration;

                        currentSimLoc = pathJob.location;
                    }

                    // Apply a small penalty for total distance to prefer tighter clusters even if time is similar
                    // But primarily we minimize Total Schedule Time.
                    // If this tech takes this job, their day ends at `timeElapsedHours` from now.
                    const totalScore = timeElapsedHours;

                    if (totalScore < minTotalScheduleTime) {
                        minTotalScheduleTime = totalScore;
                        bestTechId = tech.id;
                    }
                });

                if (bestTechId) {
                    const updatedJob = { ...job, techId: bestTechId, status: JobStatus.EN_ROUTE };
                    newAssignments.push(updatedJob);
                    if (!techAssignments[bestTechId]) techAssignments[bestTechId] = [];
                    techAssignments[bestTechId].push(updatedJob);
                }
            });

            // 4. Merge assignments
            setJobs(prevJobs => prevJobs.map(j => {
                const assignment = newAssignments.find(n => n.id === j.id);
                return assignment || j;
            }));

            setOptimizing(false);
        }, 1200);
    };

    const handleAssign = (techId: string) => {
        if (!selectedJob) return;

        const updatedJobs = jobs.map(j =>
            j.id === selectedJob.id
                ? { ...j, techId, status: JobStatus.EN_ROUTE }
                : j
        );

        setJobs(updatedJobs);

        // Update local selectedJob state
        const updatedSelectedJob = updatedJobs.find(j => j.id === selectedJob.id) || null;
        setSelectedJob(updatedSelectedJob);
    };

    const toggleTechAvailability = (techId: string) => {
        setTechnicians(prev => prev.map(t =>
            t.id === techId ? { ...t, isAvailable: !t.isAvailable } : t
        ));
    };

    const getStatusColor = (status: JobStatus) => {
        switch (status) {
            case JobStatus.IN_PROGRESS: return 'bg-emerald-900 text-emerald-400 border-emerald-800';
            case JobStatus.EN_ROUTE: return 'bg-blue-900 text-blue-400 border-blue-800';
            case JobStatus.PENDING: return 'bg-red-900 text-red-400 border-red-800';
            default: return 'bg-slate-700 text-slate-400 border-slate-600';
        }
    };

    return (
        <div className="h-full flex flex-col p-6 space-y-4 relative">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
                <h2 className="text-2xl font-bold text-white flex items-center">
                    <Navigation className="mr-2 text-blue-400" /> Dispatch & Routing (NYC)
                </h2>
                <div className="flex flex-wrap gap-2 items-center justify-end">
                    <span className="hidden md:flex px-3 py-1 bg-red-900/30 text-red-400 border border-red-900/50 rounded text-xs items-center font-mono animate-pulse">
                        <Radio className="w-3 h-3 mr-1" /> LIVE GPS
                    </span>

                    {/* Strategic Zones Toggle */}
                    <button
                        onClick={() => setShowStrategicZones(!showStrategicZones)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center transition border ${showStrategicZones ? 'bg-purple-900 text-purple-300 border-purple-700' : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'}`}
                    >
                        <Layers className="w-4 h-4 mr-1" /> Zones
                    </button>

                    <button
                        onClick={() => setIsTechStatusModalOpen(true)}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center transition border border-slate-600"
                    >
                        <Users className="w-4 h-4 mr-1" /> Techs
                    </button>

                    <button
                        onClick={handleOptimizeRoutes}
                        disabled={optimizing}
                        className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center transition shadow-lg 
                    ${optimizing ? 'bg-indigo-800 text-indigo-300 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20'}`}
                    >
                        <Wand2 className={`w-4 h-4 mr-1 ${optimizing ? 'animate-spin' : ''}`} />
                        {optimizing ? 'Routing...' : 'Optimize'}
                    </button>
                    <button
                        onClick={handleOpenBookJob}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center transition shadow-lg shadow-blue-900/20"
                    >
                        <Plus className="w-4 h-4 mr-1" /> Book Job
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 relative min-h-0">
                {/* Map View */}
                <div
                    ref={mapRef}
                    className={`lg:col-span-2 bg-slate-800 rounded-lg border border-slate-700 relative overflow-hidden flex items-center justify-center group h-[500px] lg:h-full select-none
                ${isLocationMode ? 'cursor-crosshair ring-2 ring-orange-500 ring-offset-2 ring-offset-slate-900' : ''}`}
                    onClick={handleMapClick}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    {/* NYC Map Background - Abstract */}
                    <div className="absolute inset-0 bg-slate-900 pointer-events-none">
                        {/* Grid Lines */}
                        <div className="w-full h-full opacity-20" style={{ backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                        {/* Abstract Water Bodies */}
                        <div className="absolute top-0 bottom-0 left-[18%] w-[12%] bg-blue-950/50 skew-x-12 transform -translate-x-10 border-x border-blue-900/30"></div>
                        <div className="absolute top-0 bottom-0 right-[28%] w-[10%] bg-blue-950/50 skew-x-6 border-x border-blue-900/30"></div>

                        {/* STRATEGIC ZONES OVERLAY */}
                        {showStrategicZones && (
                            <>
                                {/* Zone 1: NYC Commercial (Midtown/Downtown) */}
                                <div className="absolute top-[35%] left-[55%] w-[25%] h-[35%] border-2 border-emerald-500/50 bg-emerald-500/10 rounded-lg flex items-center justify-center animate-fadeIn">
                                    <span className="text-emerald-400 font-bold text-xs uppercase bg-slate-900/80 px-2 py-1 rounded backdrop-blur">Zone 1: NYC Commercial</span>
                                </div>
                                {/* Zone 2: NJ Residential (Jersey City/Hoboken) */}
                                <div className="absolute top-[40%] left-[5%] w-[20%] h-[40%] border-2 border-purple-500/50 bg-purple-500/10 rounded-lg flex items-center justify-center animate-fadeIn">
                                    <span className="text-purple-400 font-bold text-xs uppercase bg-slate-900/80 px-2 py-1 rounded backdrop-blur">Zone 2: NJ Residential</span>
                                </div>
                            </>
                        )}

                        {/* Landmarks Labels */}
                        {LANDMARKS.map((mark, i) => {
                            const pos = getProjectedPosition(mark.lat, mark.lng);
                            return (
                                <div key={i} className="absolute text-slate-700 text-[10px] font-bold uppercase tracking-widest transform -translate-x-1/2 -translate-y-1/2 opacity-60" style={{ top: `${pos.top}%`, left: `${pos.left}%` }}>
                                    {mark.label}
                                </div>
                            )
                        })}
                    </div>

                    {/* Route Lines Layer (SVG) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                        {technicians.filter(t => t.isAvailable).map((tech, idx) => {
                            const techPos = getProjectedPosition(tech.location.lat, tech.location.lng);
                            const techJobs = jobs.filter(j => j.techId === tech.id && j.status !== JobStatus.COMPLETED);
                            const techColor = TECH_COLORS[idx % TECH_COLORS.length];

                            // Interaction State
                            const isHovered = hoveredTechId === tech.id;
                            const isDimmed = (hoveredTechId && hoveredTechId !== tech.id) || isLocationMode;

                            if (techJobs.length === 0) return null;

                            // Sort jobs by distance to create a logical path: Tech -> Job 1 -> Job 2
                            let currentPos = techPos;
                            let pathData = `M ${currentPos.left} ${currentPos.top}`;

                            let remainingJobs = [...techJobs];
                            let safety = 0;

                            const orderedJobs: Job[] = []; // Store order for determining "Stop #" later

                            while (remainingJobs.length > 0 && safety < 20) {
                                remainingJobs.sort((a, b) => {
                                    const posA = getProjectedPosition(a.location.lat, a.location.lng);
                                    const posB = getProjectedPosition(b.location.lat, b.location.lng);
                                    const distA = Math.hypot(posA.left - currentPos.left, posA.top - currentPos.top);
                                    const distB = Math.hypot(posB.left - currentPos.left, posB.top - currentPos.top);
                                    return distA - distB;
                                });

                                const nextJob = remainingJobs.shift();
                                if (nextJob) {
                                    const nextPos = getProjectedPosition(nextJob.location.lat, nextJob.location.lng);
                                    pathData += ` L ${nextPos.left} ${nextPos.top}`;
                                    currentPos = nextPos;
                                    orderedJobs.push(nextJob);
                                }
                                safety++;
                            }

                            return (
                                <g key={`route-${tech.id}`} className="transition-opacity duration-300" style={{ opacity: isDimmed ? 0.1 : 1 }}>
                                    <defs>
                                        <linearGradient id={`grad-${tech.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor={techColor} stopOpacity="0.8" />
                                            <stop offset="100%" stopColor={techColor} stopOpacity="0.2" />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d={pathData}
                                        stroke={techColor}
                                        strokeWidth={isHovered ? "0.8" : "0.4"}
                                        strokeDasharray={isHovered ? "4,2" : "2,2"}
                                        fill="none"
                                        className="animate-[dash_20s_linear_infinite]"
                                        style={{ strokeLinecap: 'round', strokeLinejoin: 'round' }}
                                        vectorEffect="non-scaling-stroke"
                                    />
                                    {/* Start Circle */}
                                    <circle cx={techPos.left} cy={techPos.top} r="0.6" fill={techColor} opacity="0.5" />
                                </g>
                            );
                        })}
                    </svg>

                    {/* New Job Pin (Draggable) */}
                    {isLocationMode && newJobLocation && (
                        <div
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-50 cursor-move"
                            style={{
                                top: `${getProjectedPosition(newJobLocation.lat, newJobLocation.lng).top}%`,
                                left: `${getProjectedPosition(newJobLocation.lat, newJobLocation.lng).left}%`
                            }}
                            onMouseDown={handlePinMouseDown}
                        >
                            <div className="relative group">
                                <div className="absolute inset-0 rounded-full bg-orange-500 blur-sm animate-pulse"></div>
                                <MapPin className="w-8 h-8 text-orange-500 fill-orange-950 drop-shadow-xl" />
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap shadow-lg">
                                    New Job
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Location Mode Banner */}
                    {isLocationMode && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-600 rounded-full px-6 py-3 shadow-2xl z-50 flex items-center space-x-4 backdrop-blur-md animate-in slide-in-from-top-4">
                            <div className="flex flex-col">
                                <span className="text-white font-bold text-sm flex items-center">
                                    <MousePointer2 className="w-4 h-4 mr-2 text-orange-400" />
                                    {newJobLocation ? "Drag pin to adjust" : "Click map to set location"}
                                </span>
                                {newJobLocation && <span className="text-[10px] text-slate-400 font-mono mt-0.5">{newJobLocation.lat.toFixed(4)}, {newJobLocation.lng.toFixed(4)}</span>}
                            </div>
                            <div className="h-8 w-px bg-slate-700"></div>
                            <div className="flex space-x-2">
                                <button onClick={() => { setIsLocationMode(false); setIsModalOpen(true); }} className="text-xs text-slate-300 hover:text-white font-bold px-2 py-1 transition">Cancel</button>
                                <button
                                    onClick={confirmLocation}
                                    disabled={!newJobLocation}
                                    className={`text-xs px-3 py-1.5 rounded-full font-bold transition flex items-center ${newJobLocation ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-900/20' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                                >
                                    <Check className="w-3 h-3 mr-1" /> Confirm
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Technicians */}
                    {technicians.map((tech, idx) => {
                        const pos = getProjectedPosition(tech.location.lat, tech.location.lng);
                        const isAvailable = tech.isAvailable;
                        const techColor = TECH_COLORS[idx % TECH_COLORS.length];
                        const isDimmed = (hoveredTechId && hoveredTechId !== tech.id) || isLocationMode;

                        return (
                            <div
                                key={tech.id}
                                onMouseEnter={() => setHoveredTechId(tech.id)}
                                onMouseLeave={() => setHoveredTechId(null)}
                                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-1000 ease-linear z-30 ${isDimmed ? 'opacity-20 blur-[1px]' : 'opacity-100'}`}
                                style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
                            >
                                <div className="relative group">
                                    <div className="absolute inset-0 rounded-full blur-sm opacity-50" style={{ backgroundColor: isAvailable ? techColor : '#475569' }}></div>
                                    <div className="relative flex items-center justify-center w-9 h-9 rounded-full border-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-transform hover:scale-110" style={{
                                        backgroundColor: isAvailable ? techColor : '#475569',
                                        borderColor: isAvailable ? '#fff' : '#94a3b8'
                                    }}>
                                        <Truck className="w-5 h-5 text-white" />
                                        {isAvailable && <div className="absolute -inset-1 rounded-full animate-ping opacity-20" style={{ backgroundColor: techColor }}></div>}
                                    </div>
                                    {/* Label */}
                                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[10px] px-2 py-1 rounded border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition shadow-lg font-bold flex flex-col items-center">
                                        <span>{tech.name}</span>
                                        {!isAvailable && <span className="text-slate-400 font-normal">Off-Duty</span>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Jobs */}
                    {jobs.filter(j => j.status !== JobStatus.COMPLETED).map((job) => {
                        const pos = getProjectedPosition(job.location.lat, job.location.lng);
                        const isUnassigned = !job.techId;
                        const isInProgress = job.status === JobStatus.IN_PROGRESS;
                        const assignedTech = technicians.find(t => t.id === job.techId);
                        const assignedTechIdx = technicians.findIndex(t => t.id === job.techId);
                        const techColor = assignedTech ? TECH_COLORS[assignedTechIdx % TECH_COLORS.length] : null;

                        const isDimmed = (hoveredTechId && hoveredTechId !== job.techId && job.techId) || isLocationMode;

                        // Determine Job Sequence for Badge
                        let sequenceNo = null;
                        if (assignedTech) {
                            const techJobs = jobs.filter(j => j.techId === assignedTech.id && j.status !== JobStatus.COMPLETED);

                            let currentPos = getProjectedPosition(assignedTech.location.lat, assignedTech.location.lng);
                            let remaining = [...techJobs];
                            let safety = 0;
                            const sortedIds: string[] = [];

                            while (remaining.length > 0 && safety < 20) {
                                remaining.sort((a, b) => {
                                    const posA = getProjectedPosition(a.location.lat, a.location.lng);
                                    const posB = getProjectedPosition(b.location.lat, b.location.lng);
                                    const distA = Math.hypot(posA.left - currentPos.left, posA.top - currentPos.top);
                                    const distB = Math.hypot(posB.left - currentPos.left, posB.top - currentPos.top);
                                    return distA - distB;
                                });

                                const next = remaining.shift();
                                if (next) {
                                    sortedIds.push(next.id);
                                    currentPos = getProjectedPosition(next.location.lat, next.location.lng);
                                }
                                safety++;
                            }
                            const idx = sortedIds.indexOf(job.id);
                            if (idx >= 0) sequenceNo = idx + 1;
                        }

                        return (
                            <div
                                key={job.id}
                                onClick={(e) => { e.stopPropagation(); setSelectedJob(job); }}
                                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all z-20 ${isDimmed ? 'opacity-20' : 'opacity-100'} hover:z-40`}
                                style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
                            >
                                <div className="relative group">
                                    {isInProgress && (
                                        <div className="absolute inset-0 rounded-full animate-ping bg-emerald-500 opacity-40"></div>
                                    )}
                                    <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 shadow-lg transition-transform hover:scale-110 
                            ${isUnassigned ? 'bg-slate-700 border-white text-white' : ''}`}
                                        style={{
                                            backgroundColor: isUnassigned ? '#334155' : '#1e293b',
                                            borderColor: techColor || '#fff'
                                        }}
                                    >
                                        {isInProgress ? <Wrench className="w-4 h-4 text-emerald-400" /> : <Briefcase className={`w-4 h-4 ${isUnassigned ? 'text-white' : 'text-slate-300'}`} />}

                                        {/* Sequence Badge */}
                                        {sequenceNo && (
                                            <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm border border-slate-900" style={{ backgroundColor: techColor || '#64748b' }}>
                                                {sequenceNo}
                                            </div>
                                        )}
                                    </div>

                                    {/* Hover Tooltip */}
                                    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-32 bg-slate-900/95 text-white p-2 rounded border border-slate-700 shadow-xl opacity-0 group-hover:opacity-100 transition pointer-events-none z-50">
                                        <div className="text-xs font-bold truncate">{job.clientName}</div>
                                        <div className="text-[10px] text-slate-400 truncate">{job.description}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Dispatch Panel */}
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 flex flex-col h-[500px] lg:h-full overflow-hidden">
                    <h3 className="text-white font-bold mb-4 flex items-center">
                        <Briefcase className="w-4 h-4 mr-2 text-slate-400" />
                        Job Queue
                        <span className="ml-2 bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">
                            {jobs.filter(j => j.status !== JobStatus.COMPLETED).length}
                        </span>
                    </h3>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        {jobs.sort((a, b) => (a.status === JobStatus.PENDING ? -1 : 1)).map(job => (
                            <div
                                key={job.id}
                                onClick={() => setSelectedJob(job)}
                                className={`p-3 rounded-lg border cursor-pointer transition relative overflow-hidden group
                            ${selectedJob?.id === job.id ? 'border-indigo-500 bg-indigo-900/10 ring-1 ring-indigo-500/50' : 'border-slate-700 bg-slate-900 hover:border-slate-600'}`}
                            >
                                {/* Status Bar */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${job.status === JobStatus.IN_PROGRESS ? 'bg-emerald-500' :
                                        job.status === JobStatus.EN_ROUTE ? 'bg-blue-500' :
                                            'bg-red-500'
                                    }`}></div>

                                <div className="pl-3">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-sm text-white truncate">{job.clientName}</span>
                                        <span className="text-[10px] text-slate-400 font-mono">{job.timestamp}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-2 truncate">{job.description}</p>

                                    <div className="flex justify-between items-center">
                                        {job.techId ? (
                                            <div className="flex items-center">
                                                <div className="w-5 h-5 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center overflow-hidden mr-1.5">
                                                    <img src={technicians.find(t => t.id === job.techId)?.avatar} className="w-full h-full object-cover" alt="Tech" />
                                                </div>
                                                <span className="text-xs text-slate-300">{technicians.find(t => t.id === job.techId)?.name.split(' ')[0]}</span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] bg-red-900/30 text-red-400 px-1.5 py-0.5 rounded border border-red-900/50">Unassigned</span>
                                        )}

                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${job.status === JobStatus.IN_PROGRESS ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/50' :
                                                job.status === JobStatus.EN_ROUTE ? 'bg-blue-900/20 text-blue-400 border-blue-900/50' :
                                                    'bg-slate-700 text-slate-400 border-slate-600'
                                            }`}>
                                            {job.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Book Job Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center">
                            <h3 className="text-white font-bold flex items-center">
                                <Plus className="w-4 h-4 mr-2 text-indigo-400" /> Book New Job
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            {/* Location Preview */}
                            <div className="bg-slate-900 rounded p-3 border border-slate-700 flex justify-between items-center">
                                <div className="flex items-center text-slate-300 text-sm">
                                    <MapPin className="w-4 h-4 mr-2 text-orange-400" />
                                    {newJobLocation ? (
                                        <span className="text-white">{newJobLocation.lat.toFixed(4)}, {newJobLocation.lng.toFixed(4)}</span>
                                    ) : (
                                        <span className="italic text-slate-500">Auto-assigned (Random)</span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setIsModalOpen(false); setIsLocationMode(true); }}
                                    className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded transition"
                                >
                                    {newJobLocation ? "Change" : "Pick on Map"}
                                </button>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1">Client Name</label>
                                <input required className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.clientName} onChange={e => setFormData({ ...formData, clientName: e.target.value })} placeholder="e.g. Starbucks #2401" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1">Issue Description</label>
                                <textarea required className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-20"
                                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="e.g. Walk-in cooler temp alarm" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">Skill Required</label>
                                    <select className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white text-sm outline-none"
                                        value={formData.requiredSkillLevel} onChange={e => setFormData({ ...formData, requiredSkillLevel: e.target.value as TechLevel })}>
                                        <option value={TechLevel.APPRENTICE}>Apprentice</option>
                                        <option value={TechLevel.JOURNEYMAN}>Journeyman</option>
                                        <option value={TechLevel.MASTER}>Master</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">Est. Duration (Hrs)</label>
                                    <input type="number" min="1" max="8" className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white text-sm outline-none"
                                        value={formData.estimatedDuration} onChange={e => setFormData({ ...formData, estimatedDuration: Number(e.target.value) })} />
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded transition shadow-lg shadow-indigo-900/20">
                                Dispatch Ticket
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Tech Status Modal */}
            {isTechStatusModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <div className="bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center">
                            <h3 className="text-white font-bold flex items-center">
                                <Users className="w-4 h-4 mr-2 text-emerald-400" /> Technician Roster
                            </h3>
                            <button onClick={() => setIsTechStatusModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-2">
                            {technicians.map(tech => (
                                <div key={tech.id} className="flex items-center justify-between p-3 hover:bg-slate-700/50 rounded transition">
                                    <div className="flex items-center">
                                        <img src={tech.avatar} className={`w-10 h-10 rounded-full border-2 mr-3 ${tech.isAvailable ? 'border-emerald-500' : 'border-slate-600 grayscale'}`} alt={tech.name} />
                                        <div>
                                            <div className="text-white font-bold text-sm">{tech.name}</div>
                                            <div className={`text-xs ${tech.level === TechLevel.MASTER ? 'text-purple-400' : 'text-blue-400'}`}>{tech.level}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleTechAvailability(tech.id)}
                                        className={`px-3 py-1 rounded text-xs font-bold transition flex items-center ${tech.isAvailable ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-900' : 'bg-slate-700 text-slate-400 border border-slate-600'
                                            }`}
                                    >
                                        <Power className="w-3 h-3 mr-1" />
                                        {tech.isAvailable ? 'Active' : 'Off-Duty'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Selected Job Detail Modal (Quick View) */}
            {selectedJob && (
                <div className="fixed bottom-6 right-6 z-40 w-80 bg-slate-800/95 backdrop-blur border border-slate-600 rounded-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
                    <div className="bg-indigo-600 p-3 flex justify-between items-start">
                        <div>
                            <h4 className="text-white font-bold text-sm">{selectedJob.clientName}</h4>
                            <div className="text-indigo-200 text-xs font-mono">{selectedJob.id}</div>
                        </div>
                        <button onClick={() => setSelectedJob(null)} className="text-indigo-200 hover:text-white"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="text-sm text-slate-300">{selectedJob.description}</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-slate-900 p-2 rounded border border-slate-700">
                                <span className="block text-slate-500 mb-0.5">Status</span>
                                <span className={`font-bold ${selectedJob.status === JobStatus.IN_PROGRESS ? 'text-emerald-400' :
                                        selectedJob.status === JobStatus.EN_ROUTE ? 'text-blue-400' : 'text-slate-200'
                                    }`}>{selectedJob.status}</span>
                            </div>
                            <div className="bg-slate-900 p-2 rounded border border-slate-700">
                                <span className="block text-slate-500 mb-0.5">Skill Level</span>
                                <span className="text-white">{selectedJob.requiredSkillLevel}</span>
                            </div>
                        </div>

                        {/* Assignment Actions */}
                        {selectedJob.status !== JobStatus.COMPLETED && (
                            <div className="pt-2 border-t border-slate-700">
                                <label className="block text-xs font-bold text-slate-400 mb-2">Re-Assign Technician</label>
                                <div className="grid grid-cols-3 gap-1">
                                    {technicians.filter(t => t.isAvailable).map(t => (
                                        <button
                                            key={t.id}
                                            disabled={t.id === selectedJob.techId}
                                            onClick={() => handleAssign(t.id)}
                                            className={`text-[10px] p-1 rounded border transition truncate ${t.id === selectedJob.techId
                                                    ? 'bg-indigo-900 text-indigo-300 border-indigo-700'
                                                    : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                                                }`}
                                        >
                                            {t.name.split(' ')[0]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
