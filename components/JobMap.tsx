
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Truck, Plus, X, Briefcase, Clock, User, AlertTriangle, Wrench, Wand2, ChevronRight, Radio, ShieldAlert, Users, Power, Map as MapIcon, MousePointer2, Check } from 'lucide-react';
import { MOCK_TECHS, MOCK_JOBS } from '../constants';
import { JobStatus, TechLevel, Job, Technician } from '../types';

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
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

// Routing Constants
const AVG_SPEED_MPH = 15; // NYC Traffic assumption
const BREAK_THRESHOLD_HOURS = 4; // Max work before break
const BREAK_DURATION_HOURS = 1; // 1 hour break

export const JobMap: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [technicians, setTechnicians] = useState<Technician[]>(MOCK_TECHS);
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

  // Manual Location Picking State
  const [isLocationMode, setIsLocationMode] = useState(false);
  const [newJobLocation, setNewJobLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isDraggingPin, setIsDraggingPin] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Simulate Live GPS Updates
  useEffect(() => {
    const interval = setInterval(() => {
        setTechnicians(prevTechs => prevTechs.map(tech => {
            // Apply small random movement to simulate driving/GPS jitter
            // 0.0002 degrees is approx 20 meters, realistic for 1s interval
            if (!tech.isAvailable) return tech; // Don't move if off duty
            
            const latDelta = (Math.random() - 0.5) * 0.0002;
            const lngDelta = (Math.random() - 0.5) * 0.0002;
            
            return {
                ...tech,
                location: {
                    ...tech.location,
                    lat: tech.location.lat + latDelta,
                    lng: tech.location.lng + lngDelta
                }
            };
        }));
    }, 1000); // Update every 1 second for smooth continuous movement

    return () => clearInterval(interval);
  }, []);

  const handleOpenBookJob = () => {
      setNewJobLocation(null);
      setFormData({ clientName: '', address: '', description: '', requiredSkillLevel: TechLevel.JOURNEYMAN, estimatedDuration: 2 });
      setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate a pseudo-random ID
    const newId = `J${Math.floor(Math.random() * 9000) + 1000}`;
    
    // Use manually picked location or random fallback
    const randLat = MAP_BOUNDS.minLat + (Math.random() * (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat));
    const randLng = MAP_BOUNDS.minLng + (Math.random() * (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng));
    
    const finalLocation = newJobLocation || { lat: randLat, lng: randLng };

    const newJob: Job = {
        id: newId,
        clientId: `C${Math.floor(Math.random() * 1000)}`,
        clientName: formData.clientName,
        address: formData.address,
        description: formData.description,
        status: JobStatus.PENDING,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        techId: undefined,
        requiredSkillLevel: formData.requiredSkillLevel,
        location: finalLocation,
        estimatedDuration: formData.estimatedDuration
    };

    setJobs([newJob, ...jobs]);
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
                let simPos = tech.location;
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Navigation className="mr-2 text-blue-400" /> Dispatch & Routing (NYC)
        </h2>
        <div className="flex space-x-2 items-center">
            <span className="hidden md:flex px-3 py-1 bg-red-900/30 text-red-400 border border-red-900/50 rounded text-xs items-center font-mono animate-pulse">
                <Radio className="w-3 h-3 mr-1" /> LIVE GPS
            </span>
            <span className="hidden md:flex px-3 py-1 bg-emerald-900/50 text-emerald-400 border border-emerald-800 rounded text-sm items-center">
                <Truck className="w-3 h-3 mr-1" /> {technicians.filter(t => t.isAvailable).length} Active Vans
            </span>
            
            <button 
                onClick={() => setIsTechStatusModalOpen(true)}
                className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center transition border border-slate-600"
            >
                <Users className="w-4 h-4 mr-1" /> Tech Status
            </button>

            <button 
                onClick={handleOptimizeRoutes}
                disabled={optimizing}
                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center transition shadow-lg 
                    ${optimizing ? 'bg-indigo-800 text-indigo-300 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20'}`}
            >
                <Wand2 className={`w-4 h-4 mr-1 ${optimizing ? 'animate-spin' : ''}`} /> 
                {optimizing ? 'Routing...' : 'Optimize Routes'}
            </button>
            <button 
                onClick={handleOpenBookJob}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center transition shadow-lg shadow-blue-900/20"
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

                while(remainingJobs.length > 0 && safety < 20) {
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
                 // Re-sort locally to match the visual line logic (Distance)
                 // This ensures the badge number matches the visual path.
                 // NOTE: This re-sorting logic must match the SVG path logic exactly.
                 let currentPos = getProjectedPosition(assignedTech.location.lat, assignedTech.location.lng);
                 let remaining = [...techJobs];
                 let safety = 0;
                 const sortedIds: string[] = [];

                 while(remaining.length > 0 && safety < 20) {
                     remaining.sort((a,b) => {
                         const pA = getProjectedPosition(a.location.lat, a.location.lng);
                         const pB = getProjectedPosition(b.location.lat, b.location.lng);
                         const dA = Math.hypot(pA.left - currentPos.left, pA.top - currentPos.top);
                         const dB = Math.hypot(pB.left - currentPos.left, pB.top - currentPos.top);
                         return dA - dB;
                     });
                     const next = remaining.shift();
                     if (next) {
                         sortedIds.push(next.id);
                         currentPos = getProjectedPosition(next.location.lat, next.location.lng);
                     }
                     safety++;
                 }
                 sequenceNo = sortedIds.indexOf(job.id) + 1;
             }

             return (
               <div 
               key={job.id}
               className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-20 group/pin cursor-pointer hover:z-50 transition-all duration-300 ${isDimmed ? 'opacity-20 blur-[1px]' : 'opacity-100'}`}
               style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
               onClick={() => setSelectedJob(job)}
               onMouseEnter={() => job.techId && setHoveredTechId(job.techId)}
               onMouseLeave={() => setHoveredTechId(null)}
            >
               <div className={`relative flex items-center justify-center w-7 h-7 rounded-full shadow-lg transition-transform hover:scale-110
                   ${isUnassigned 
                       ? 'bg-red-600 ring-2 ring-red-500/50 animate-pulse' 
                       : 'bg-slate-900 ring-2'
                   }
               `} style={{ borderColor: techColor || 'transparent', ringColor: techColor || 'transparent' }}>
                   {isUnassigned && <AlertTriangle className="w-4 h-4 text-white" />}
                   {!isUnassigned && isInProgress && <Wrench className="w-3 h-3 text-white animate-spin-slow" />}
                   {!isUnassigned && !isInProgress && <Briefcase className="w-3 h-3 text-white" />}

                   {/* Sequence Badge */}
                   {!isUnassigned && sequenceNo && (
                       <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-white text-[9px] font-bold flex items-center justify-center shadow border border-slate-300" style={{ color: techColor || '#000' }}>
                           {sequenceNo}
                       </div>
                   )}
               </div>
               
               {/* Enhanced Tooltip */}
               <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 bg-slate-900/95 backdrop-blur-xl text-white text-xs p-0 rounded-lg border border-slate-600 whitespace-nowrap opacity-0 group-hover/pin:opacity-100 pointer-events-none z-50 shadow-2xl transition-all duration-200 min-w-[180px] flex flex-col items-center overflow-hidden">
                   <div className="w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                   <div className="p-3 w-full">
                        <div className="font-bold text-sm mb-1">{job.clientName}</div>
                        <div className="text-slate-300 flex items-center mb-2"><MapPin className="w-3 h-3 mr-1 text-slate-500" /> {job.address}</div>
                        
                        {isUnassigned ? (
                            <div className="flex items-center text-red-400 font-bold uppercase text-[10px] tracking-wide bg-red-900/20 py-1 px-2 rounded border border-red-900/50 w-full justify-center">
                                <AlertTriangle className="w-3 h-3 mr-1" /> Unassigned
                            </div>
                        ) : (
                            <div className="flex items-center justify-between gap-2 mt-2">
                                <div className="flex items-center text-[10px] bg-slate-800 px-2 py-1 rounded border border-slate-700">
                                    <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: techColor || '#fff' }}></div>
                                    <span className="font-medium text-slate-300">{assignedTech?.name}</span>
                                </div>
                                <div className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                                    Stop #{sequenceNo}
                                </div>
                            </div>
                        )}
                        <div className="text-[10px] text-slate-500 mt-2 text-center border-t border-slate-800 pt-1">
                             Est. Duration: <span className="text-slate-300">{job.estimatedDuration || 2} hrs</span>
                        </div>
                   </div>
                   <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-8 border-transparent border-t-slate-600"></div>
                   <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[2px] border-8 border-transparent border-t-slate-900"></div>
               </div>
            </div>
             );
          })}

          {/* Map Legend */}
          {!isLocationMode && (
              <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur p-3 rounded-lg border border-slate-700 text-xs text-slate-300 pointer-events-none z-20 shadow-xl">
                 <div className="font-bold text-white mb-2 uppercase tracking-wider text-[10px] border-b border-slate-700 pb-1">Routing Key</div>
                 <div className="space-y-1.5">
                    <div className="flex items-center"><div className="w-2 h-2 bg-red-600 rounded-full animate-pulse mr-2"></div> Unassigned Job</div>
                    <div className="flex items-center"><div className="w-2 h-2 bg-slate-500 rounded-full mr-2"></div> Off-Duty Tech</div>
                    <div className="flex items-center"><Wrench className="w-3 h-3 text-emerald-400 mr-2" /> Active Job</div>
                    <div className="border-t border-slate-700 my-1 pt-1 opacity-50"></div>
                    {technicians.filter(t => t.isAvailable).slice(0, 3).map((tech, idx) => (
                        <div key={tech.id} className="flex items-center text-[10px]">
                            <div className="w-3 h-0.5 mr-2" style={{ backgroundColor: TECH_COLORS[idx % TECH_COLORS.length] }}></div>
                            {tech.name}
                        </div>
                    ))}
                 </div>
              </div>
          )}
        </div>

        {/* Live List */}
        <div className="space-y-4 overflow-y-auto h-[500px] lg:h-full pr-2">
            <h3 className="text-slate-400 font-semibold uppercase text-xs tracking-wider sticky top-0 bg-slate-950 py-2 z-10 flex justify-between items-center">
                <span>Active Assignments</span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                    {jobs.filter(j => j.status !== JobStatus.COMPLETED).length} Open
                </span>
            </h3>
            {jobs.map(job => {
                const assignedTech = technicians.find(t => t.id === job.techId);
                const assignedTechIdx = technicians.findIndex(t => t.id === job.techId);
                const techColor = assignedTech ? TECH_COLORS[assignedTechIdx % TECH_COLORS.length] : null;

                return (
                <div 
                    key={job.id} 
                    onClick={() => setSelectedJob(job)}
                    onMouseEnter={() => job.techId && setHoveredTechId(job.techId)}
                    onMouseLeave={() => setHoveredTechId(null)}
                    className={`bg-slate-800 p-4 rounded-lg border transition group cursor-pointer relative overflow-hidden
                        ${!job.techId ? 'border-l-4 border-l-red-500 border-y-slate-700 border-r-slate-700' : 'border-slate-700 hover:border-slate-500'}
                    `}
                    style={{ borderLeftColor: job.techId ? techColor : undefined, borderLeftWidth: job.techId ? '4px' : undefined }}
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-white text-sm">{job.clientName}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide border
                            ${getStatusColor(job.status)}`}>
                            {job.status}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2 truncate group-hover:whitespace-normal">{job.description}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700">
                        <div className="flex items-center text-xs text-slate-500">
                            <MapPin className="w-3 h-3 mr-1" />
                            {job.address}
                        </div>
                        {job.techId ? (
                            <div className="text-xs font-medium flex items-center" style={{ color: techColor || '#94a3b8' }}>
                                <Truck className="w-3 h-3 mr-1" />
                                {technicians.find(t => t.id === job.techId)?.name.split(' ')[0]}
                            </div>
                        ) : (
                            <div className="text-xs text-red-400 font-bold flex items-center">
                                <AlertTriangle className="w-3 h-3 mr-1" /> Unassigned
                            </div>
                        )}
                    </div>
                </div>
            )})}
        </div>
      </div>

      {/* Tech Status Modal */}
      {isTechStatusModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800">
                    <h3 className="font-bold text-white flex items-center">
                        <Users className="w-4 h-4 mr-2 text-blue-400" /> Technician Status Management
                    </h3>
                    <button onClick={() => setIsTechStatusModalOpen(false)} className="text-slate-400 hover:text-white transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-2 overflow-y-auto max-h-[60vh]">
                    {technicians.map((tech, idx) => (
                        <div key={tech.id} className="p-3 border-b border-slate-800 last:border-0 flex justify-between items-center hover:bg-slate-800/50 transition">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold text-xs text-white shadow-sm"
                                     style={{ backgroundColor: tech.isAvailable ? TECH_COLORS[idx % TECH_COLORS.length] : '#334155' }}>
                                    {tech.name.charAt(0)}
                                </div>
                                <div>
                                    <div className={`text-sm font-bold ${!tech.isAvailable ? 'text-slate-500' : 'text-white'}`}>{tech.name}</div>
                                    <div className="text-xs text-slate-500">{tech.level}</div>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <span className={`text-[10px] uppercase font-bold mr-3 ${tech.isAvailable ? 'text-emerald-400' : 'text-slate-500'}`}>
                                    {tech.isAvailable ? 'Available' : 'Unavailable'}
                                </span>
                                <button 
                                    onClick={() => toggleTechAvailability(tech.id)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                                        tech.isAvailable ? 'bg-emerald-600' : 'bg-slate-700'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                                            tech.isAvailable ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 bg-slate-800 border-t border-slate-700">
                     <button 
                         onClick={() => setIsTechStatusModalOpen(false)}
                         className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm font-bold transition"
                     >
                         Close
                     </button>
                </div>
            </div>
        </div>
      )}

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800">
                    <h3 className="font-bold text-white flex items-center">
                        <Briefcase className="w-4 h-4 mr-2 text-blue-400" /> Book New Job
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Client Name</label>
                        <input 
                            required
                            type="text" 
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm focus:border-blue-500 outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="e.g. Gotham Tower Management"
                            value={formData.clientName}
                            onChange={e => setFormData({...formData, clientName: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Address / Location</label>
                        <div className="flex space-x-2">
                             <input 
                                required
                                type="text" 
                                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm focus:border-blue-500 outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="e.g. 123 Broadway, New York, NY"
                                value={formData.address}
                                onChange={e => setFormData({...formData, address: e.target.value})}
                            />
                            <button 
                                type="button" 
                                onClick={() => { setIsModalOpen(false); setIsLocationMode(true); }}
                                className="bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 px-3 rounded flex items-center justify-center transition"
                                title="Pick location on map"
                            >
                                <MapIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Issue Description</label>
                        <textarea 
                            required
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm focus:border-blue-500 outline-none focus:ring-1 focus:ring-blue-500 h-24 resize-none"
                            placeholder="Describe the issue..."
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">Required Skill</label>
                            <select 
                                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm focus:border-blue-500 outline-none focus:ring-1 focus:ring-blue-500"
                                value={formData.requiredSkillLevel}
                                onChange={e => setFormData({...formData, requiredSkillLevel: e.target.value as TechLevel})}
                            >
                                <option value={TechLevel.APPRENTICE}>Apprentice</option>
                                <option value={TechLevel.JOURNEYMAN}>Journeyman</option>
                                <option value={TechLevel.MASTER}>Master</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">Est. Duration (Hrs)</label>
                            <input 
                                required
                                type="number" 
                                min="0.5"
                                step="0.5"
                                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm focus:border-blue-500 outline-none focus:ring-1 focus:ring-blue-500"
                                value={formData.estimatedDuration}
                                onChange={e => setFormData({...formData, estimatedDuration: parseFloat(e.target.value)})}
                            />
                        </div>
                    </div>
                    <div className="pt-2 flex space-x-3">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-sm font-semibold transition"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-bold transition flex justify-center items-center shadow-lg shadow-blue-900/20"
                        >
                            Dispatch Job
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
                <div className="p-4 border-b border-slate-800 flex justify-between items-start bg-slate-800">
                    <div>
                        <h3 className="font-bold text-white text-lg flex items-center">
                            {selectedJob.clientName}
                        </h3>
                        <span className="text-xs text-slate-500">ID: {selectedJob.id}</span>
                    </div>
                    <button onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-white transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                         <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(selectedJob.status)}`}>
                            {selectedJob.status}
                         </div>
                         <div className="flex items-center text-slate-400 text-sm">
                             <Clock className="w-4 h-4 mr-1.5" />
                             {selectedJob.timestamp}
                         </div>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Issue Description</h4>
                        <p className="text-slate-200 text-sm leading-relaxed">{selectedJob.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                         {selectedJob.requiredSkillLevel && (
                            <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/30 flex justify-between items-center">
                                <span className="text-xs text-slate-500 font-semibold uppercase">Skill</span>
                                <span className={`text-sm font-bold ${
                                    selectedJob.requiredSkillLevel === TechLevel.MASTER ? 'text-purple-400' : 
                                    selectedJob.requiredSkillLevel === TechLevel.JOURNEYMAN ? 'text-blue-400' : 'text-slate-300'
                                }`}>
                                    {selectedJob.requiredSkillLevel}
                                </span>
                            </div>
                        )}
                        <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/30 flex justify-between items-center">
                            <span className="text-xs text-slate-500 font-semibold uppercase">Est. Time</span>
                            <span className="text-sm font-bold text-slate-300">{selectedJob.estimatedDuration || 2}h</span>
                        </div>
                    </div>


                    <div className="space-y-4">
                        <div className="flex items-start">
                            <div className="bg-slate-800 p-2 rounded-lg mr-3">
                                <MapPin className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500">Location</label>
                                <div className="text-slate-200 text-sm">{selectedJob.address}</div>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="bg-slate-800 p-2 rounded-lg mr-3">
                                <User className="w-5 h-5 text-purple-400" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-semibold text-slate-500">Assigned Technician</label>
                                {selectedJob.techId ? (
                                    <div className="text-slate-200 text-sm font-medium">
                                        {technicians.find(t => t.id === selectedJob.techId)?.name || 'Unknown Tech'}
                                        <span className="block text-xs text-slate-500 font-normal">{technicians.find(t => t.id === selectedJob.techId)?.level}</span>
                                    </div>
                                ) : (
                                    <div className="mt-1">
                                         <div className="text-red-400 text-sm italic font-bold flex items-center mb-2">
                                            <AlertTriangle className="w-4 h-4 mr-1" />
                                            Unassigned - Waiting for Dispatch
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Dispatch Interface for Unassigned Jobs */}
                        {!selectedJob.techId && (
                            <div className="border-t border-slate-800 pt-4">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Available Technicians (Sorted by Proximity)</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {technicians
                                        .map(tech => {
                                            // Calculate Real World Distance (Miles)
                                            const dist = calculateDistance(
                                                tech.location.lat, tech.location.lng,
                                                selectedJob.location.lat, selectedJob.location.lng
                                            );
                                            return { ...tech, dist };
                                        })
                                        .sort((a, b) => {
                                            // Sort unavailable to bottom, then by distance
                                            if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;
                                            return a.dist - b.dist;
                                        })
                                        .map((item, index) => {
                                            const { dist, ...tech } = item;
                                            const distMiles = dist.toFixed(1);
                                            const isQualified = !selectedJob.requiredSkillLevel || getLevelValue(tech.level) >= getLevelValue(selectedJob.requiredSkillLevel);
                                            const isAvailable = tech.isAvailable;
                                            const isBestMatch = index === 0 && isQualified && isAvailable;

                                            return (
                                                <div key={tech.id} className={`flex justify-between items-center p-2 rounded border transition 
                                                    ${!isAvailable 
                                                        ? 'bg-slate-900/50 border-slate-800 opacity-60' 
                                                        : isBestMatch
                                                            ? 'border-emerald-500/50 bg-emerald-900/10'
                                                            : 'bg-slate-950 border-slate-800 hover:border-slate-600'
                                                    }`}>
                                                    <div className="flex items-center">
                                                        <div className={`w-2 h-2 rounded-full mr-2 
                                                            ${!isAvailable 
                                                                ? 'bg-slate-600'
                                                                : tech.level === TechLevel.MASTER ? 'bg-purple-500' : 'bg-blue-500'
                                                            }`}></div>
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-200 flex items-center">
                                                                {tech.name}
                                                                {isBestMatch && <span className="ml-2 text-[10px] text-emerald-400 bg-emerald-900/30 px-1.5 py-0.5 rounded border border-emerald-800">BEST MATCH</span>}
                                                                {isAvailable && !isQualified && <span className="ml-2 text-[10px] text-red-400 bg-red-900/30 px-1.5 py-0.5 rounded border border-red-800 flex items-center"><ShieldAlert className="w-3 h-3 mr-1" /> UNDERQUALIFIED</span>}
                                                                {!isAvailable && <span className="ml-2 text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 flex items-center"><Power className="w-3 h-3 mr-1" /> OFF-DUTY</span>}
                                                            </div>
                                                            <div className="text-[10px] text-slate-500">{tech.level} • {distMiles} mi away</div>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleAssign(tech.id)}
                                                        disabled={!isAvailable}
                                                        className={`text-xs px-2 py-1.5 rounded font-bold flex items-center transition
                                                            ${!isAvailable
                                                                ? 'bg-transparent text-slate-600 cursor-not-allowed'
                                                                : isQualified 
                                                                    ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                                                                    : 'bg-slate-700 hover:bg-slate-600 text-slate-400 border border-slate-600'
                                                            }`}
                                                    >
                                                        {isAvailable ? (isQualified ? 'Assign' : 'Force Assign') : 'Unavailable'} {isAvailable && <ChevronRight className="w-3 h-3 ml-1" />}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-2">
                        <button 
                            onClick={() => setSelectedJob(null)}
                            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition border border-slate-700 hover:border-slate-600"
                        >
                            Close Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
