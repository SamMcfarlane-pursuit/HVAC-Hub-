import React, { useState } from 'react';
import {
    Building2, Target, Cpu, MapPin, Zap, Shield,
    Wrench, Truck, Package, Users, CheckCircle,
    Sparkles, Activity, Clock, Award
} from 'lucide-react';
import { ContactModal } from './ContactModal';

export const AboutUs: React.FC = () => {
    const [isContactOpen, setIsContactOpen] = useState(false);

    const services = [
        {
            icon: Cpu,
            title: 'AI-Powered Diagnostics',
            description: 'Smart Triage system with photo recognition for instant issue detection and repair recommendations.',
            color: 'emerald'
        },
        {
            icon: MapPin,
            title: 'Intelligent Dispatch',
            description: 'Real-time routing and technician assignment optimized by traffic, skills, and inventory.',
            color: 'blue'
        },
        {
            icon: Package,
            title: 'Supply Chain Management',
            description: 'Integrated parts sourcing with live inventory across warehouses, vans, and retailers.',
            color: 'amber'
        },
        {
            icon: Wrench,
            title: 'Asset Network',
            description: 'Equipment sharing marketplace connecting contractors with specialty tools and heavy equipment.',
            color: 'purple'
        }
    ];

    const techStack = [
        { name: 'Gemini AI', desc: 'Visual diagnostics & triage', icon: Sparkles },
        { name: 'Google Maps', desc: 'Live routing & ETAs', icon: MapPin },
        { name: 'Real-Time Sync', desc: 'Instant updates', icon: Activity },
        { name: 'Secure Payments', desc: 'End-to-end encrypted', icon: Shield }
    ];

    const values = [
        { title: 'Speed', desc: 'Same-day service, every time', icon: Clock },
        { title: 'Quality', desc: 'Certified master technicians', icon: Award },
        { title: 'Transparency', desc: 'Upfront pricing, no surprises', icon: CheckCircle },
        { title: 'Innovation', desc: 'AI-first approach to HVAC', icon: Zap }
    ];

    return (
        <>
            <div className="h-full flex flex-col p-6 space-y-8 overflow-y-auto">

                {/* HERO SECTION */}
                <div className="relative bg-gradient-to-br from-indigo-900/40 via-slate-800 to-purple-900/40 p-8 rounded-2xl border border-indigo-500/30 shadow-2xl shadow-indigo-500/10 overflow-hidden animate-fadeInUp">
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: 'url(/images/hero-bg.png)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    ></div>

                    {/* Floating decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-float"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-float" style={{ animationDelay: '1.5s' }}></div>
                    <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl animate-pulseGlow text-emerald-500"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30 hover:scale-105 transition-transform">
                                <Building2 className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-white tracking-tight">HVAC Hub</h1>
                                <p className="text-indigo-300 text-sm font-medium">Operations Platform</p>
                            </div>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                            The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400 animate-shimmer">HVAC Service Delivery</span>
                        </h2>

                        <p className="text-slate-300 text-lg max-w-2xl leading-relaxed">
                            We're building the operating system for modern HVAC contractors. AI-powered diagnostics,
                            intelligent dispatch, and seamless supply chain integration — all in one platform.
                        </p>
                    </div>
                </div>

                {/* WHO WE ARE */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700 hover:border-indigo-500/50 transition-all duration-300 hover-lift animate-fadeInUp stagger-1">
                        <div className="flex items-center gap-3 mb-4">
                            <Target className="w-6 h-6 text-red-400" />
                            <h3 className="text-lg font-bold text-white">Our Mission</h3>
                        </div>
                        <p className="text-slate-400 leading-relaxed">
                            To revolutionize HVAC service delivery by eliminating inefficiencies, reducing response times,
                            and empowering technicians with cutting-edge AI tools.
                        </p>
                    </div>

                    <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700 hover:border-emerald-500/50 transition-all duration-300 hover-lift animate-fadeInUp stagger-2">
                        <div className="flex items-center gap-3 mb-4">
                            <Zap className="w-6 h-6 text-emerald-400" />
                            <h3 className="text-lg font-bold text-white">Our Vision</h3>
                        </div>
                        <p className="text-slate-400 leading-relaxed">
                            A world where every HVAC service call is handled with precision, speed, and transparency —
                            from diagnosis to completion in record time.
                        </p>
                    </div>

                    <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover-lift animate-fadeInUp stagger-3">
                        <div className="flex items-center gap-3 mb-4">
                            <Users className="w-6 h-6 text-blue-400" />
                            <h3 className="text-lg font-bold text-white">Who We Serve</h3>
                        </div>
                        <p className="text-slate-400 leading-relaxed">
                            HVAC contractors, property managers, and building operators across the NYC Metro
                            and New Jersey markets seeking operational excellence.
                        </p>
                    </div>
                </div>

                {/* WHAT WE DO - SERVICES */}
                <div className="animate-fadeInUp stagger-4">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Wrench className="w-5 h-5 text-indigo-400" />
                        What We Do
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {services.map((service, idx) => (
                            <div
                                key={idx}
                                className={`group bg-slate-800/60 p-5 rounded-xl border border-slate-700 hover:border-slate-500 transition-all duration-300 hover-lift hover-glow animate-fadeInUp stagger-${idx + 5}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-lg bg-${service.color}-500/20 group-hover:bg-${service.color}-500/30 transition group-hover:scale-110 duration-300`}>
                                        <service.icon className={`w-6 h-6 text-${service.color}-400`} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">{service.title}</h4>
                                        <p className="text-sm text-slate-400">{service.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* OUR TECHNOLOGY */}
                <div className="relative bg-gradient-to-r from-slate-800 via-slate-800/80 to-slate-800 p-6 rounded-xl border border-slate-700 overflow-hidden animate-fadeInUp stagger-6">
                    {/* Tech background image */}
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: 'url(/images/tech-ai.png)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    ></div>

                    <div className="relative z-10">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Cpu className="w-5 h-5 text-purple-400" />
                            Powered By
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {techStack.map((tech, idx) => (
                                <div key={idx} className="text-center p-4 bg-slate-900/70 rounded-lg border border-slate-800 hover:border-purple-500/30 transition hover-lift group">
                                    <tech.icon className="w-8 h-8 mx-auto mb-2 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                                    <div className="font-bold text-white text-sm">{tech.name}</div>
                                    <div className="text-xs text-slate-500">{tech.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* OUR VALUES */}
                <div className="animate-fadeInUp stagger-7">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-400" />
                        Why Choose Us
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {values.map((value, idx) => (
                            <div key={idx} className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 text-center group hover:bg-slate-800/80 transition hover-lift">
                                <value.icon className="w-8 h-8 mx-auto mb-3 text-amber-400 group-hover:scale-110 transition-transform duration-300" />
                                <div className="font-bold text-white mb-1">{value.title}</div>
                                <div className="text-xs text-slate-400">{value.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SERVICE COVERAGE */}
                <div className="bg-gradient-to-r from-blue-900/20 via-slate-800 to-emerald-900/20 p-6 rounded-xl border border-slate-700 animate-fadeInUp stagger-8">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-400" />
                        Service Coverage
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulseGlow text-blue-400"></div>
                                New York City Metro
                            </h4>
                            <ul className="text-sm text-slate-400 space-y-1 ml-4">
                                <li>Manhattan • Brooklyn • Queens</li>
                                <li>Bronx • Staten Island</li>
                                <li>Long Island City • Jersey City</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-emerald-400 mb-2 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulseGlow text-emerald-400"></div>
                                New Jersey
                            </h4>
                            <ul className="text-sm text-slate-400 space-y-1 ml-4">
                                <li>Newark • Hoboken • Weehawken</li>
                                <li>Bergen County • Essex County</li>
                                <li>Hudson County • Union County</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* FOOTER CTA */}
                <div className="text-center py-6 animate-fadeInUp stagger-8">
                    <p className="text-slate-400 mb-4">Ready to transform your HVAC operations?</p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => setIsContactOpen(true)}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition shadow-lg shadow-indigo-500/20 hover:scale-105 hover:shadow-indigo-500/40 duration-300"
                        >
                            Get In Touch
                        </button>
                        <a
                            href="/triage"
                            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition hover:scale-105 duration-300"
                        >
                            Try Smart Triage
                        </a>
                    </div>
                </div>
            </div>

            {/* Contact Modal */}
            <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
        </>
    );
};
