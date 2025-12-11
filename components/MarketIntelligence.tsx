
import React, { useState } from 'react';
import { Target, TrendingUp, Map, ShieldAlert, PieChart, Users, Camera, ArrowRight, CheckSquare, Zap, BarChart3, Database, Globe, Server, Cpu } from 'lucide-react';

export const MarketIntelligence: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'plan' | 'financials' | 'sops' | 'tech'>('plan');

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <PieChart className="mr-2 text-indigo-400" /> Market Intelligence & Strategy
          </h2>
          <p className="text-slate-400 text-sm">Confidential Master Plan: Vertically Integrated HVAC Model</p>
        </div>
        <div className="flex space-x-2 bg-slate-900 p-1 rounded-lg border border-slate-700 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('plan')}
            className={`px-4 py-2 rounded text-sm font-bold transition whitespace-nowrap ${activeTab === 'plan' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Strategic Plan
          </button>
          <button 
            onClick={() => setActiveTab('financials')}
            className={`px-4 py-2 rounded text-sm font-bold transition whitespace-nowrap ${activeTab === 'financials' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Financial Targets
          </button>
          <button 
            onClick={() => setActiveTab('sops')}
            className={`px-4 py-2 rounded text-sm font-bold transition whitespace-nowrap ${activeTab === 'sops' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Field SOPs
          </button>
          <button 
            onClick={() => setActiveTab('tech')}
            className={`px-4 py-2 rounded text-sm font-bold transition whitespace-nowrap ${activeTab === 'tech' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Tech Stack
          </button>
        </div>
      </div>

      {/* STRATEGIC PLAN TAB */}
      {activeTab === 'plan' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
          {/* Executive Summary */}
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 col-span-1 lg:col-span-2">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Target className="mr-2 text-red-500" /> Executive Summary
            </h3>
            <p className="text-slate-300 mb-4 leading-relaxed">
              <strong className="text-white">The Mission:</strong> To become the dominant vertically integrated HVAC provider in the NYC Metro area. 
              By controlling the supply chain (direct procurement) and service delivery (AI dispatch), we eliminate middleman delays and double industry margins.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-slate-900 p-4 rounded border border-slate-800">
                <div className="text-indigo-400 font-bold mb-1">Problem</div>
                <div className="text-sm text-slate-400">Fragmented market. Distributors don't install; contractors can't get parts.</div>
              </div>
              <div className="bg-slate-900 p-4 rounded border border-slate-800">
                <div className="text-emerald-400 font-bold mb-1">Solution</div>
                <div className="text-sm text-slate-400">"One-Stop-Shop": Warehousing high-demand units + AI-dispatched techs.</div>
              </div>
              <div className="bg-slate-900 p-4 rounded border border-slate-800">
                <div className="text-amber-400 font-bold mb-1">Exit Strategy</div>
                <div className="text-sm text-slate-400">Acquisition by PE or National Distributor at 6x-8x EBITDA.</div>
              </div>
            </div>
          </div>

          {/* The Four Quadrants */}
          <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-lg">
              <h4 className="font-bold text-white flex items-center mb-2"><Map className="w-4 h-4 mr-2 text-blue-400" /> Market A: NYC Residential</h4>
              <ul className="text-sm text-slate-400 space-y-2">
                <li className="flex items-start"><ArrowRight className="w-3 h-3 mt-1 mr-2 text-blue-500" /> <span><strong>Focus:</strong> PTACs & Fan Coils for Luxury Condos.</span></li>
                <li className="flex items-start"><ArrowRight className="w-3 h-3 mt-1 mr-2 text-blue-500" /> <span><strong>Strategy:</strong> "White Glove" replacement service (permits + COIs handled).</span></li>
              </ul>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-lg">
              <h4 className="font-bold text-white flex items-center mb-2"><Map className="w-4 h-4 mr-2 text-emerald-400" /> Market B: NYC Commercial</h4>
              <ul className="text-sm text-slate-400 space-y-2">
                <li className="flex items-start"><ArrowRight className="w-3 h-3 mt-1 mr-2 text-emerald-500" /> <span><strong>Focus:</strong> VRF Systems & Compliance Retrofits.</span></li>
                <li className="flex items-start"><ArrowRight className="w-3 h-3 mt-1 mr-2 text-emerald-500" /> <span><strong>Driver:</strong> <strong className="text-white">Local Law 97</strong> carbon fines starting 2025.</span></li>
              </ul>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-lg">
              <h4 className="font-bold text-white flex items-center mb-2"><Map className="w-4 h-4 mr-2 text-purple-400" /> Market C: NJ Residential</h4>
              <ul className="text-sm text-slate-400 space-y-2">
                <li className="flex items-start"><ArrowRight className="w-3 h-3 mt-1 mr-2 text-purple-500" /> <span><strong>Focus:</strong> Central Air & Heat Pumps (Suburban).</span></li>
                <li className="flex items-start"><ArrowRight className="w-3 h-3 mt-1 mr-2 text-purple-500" /> <span><strong>Strategy:</strong> Membership Model ($25/mo) for recurring revenue.</span></li>
              </ul>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-lg">
              <h4 className="font-bold text-white flex items-center mb-2"><Map className="w-4 h-4 mr-2 text-amber-400" /> Market D: NJ Commercial</h4>
              <ul className="text-sm text-slate-400 space-y-2">
                <li className="flex items-start"><ArrowRight className="w-3 h-3 mt-1 mr-2 text-amber-500" /> <span><strong>Focus:</strong> Heavy Commercial RTUs for Logistics Hubs.</span></li>
                <li className="flex items-start"><ArrowRight className="w-3 h-3 mt-1 mr-2 text-amber-500" /> <span><strong>Strategy:</strong> Preventative maintenance for 24/7 uptime clients.</span></li>
              </ul>
            </div>
          </div>

           {/* Competitive Landscape & Opportunities */}
           <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 col-span-1 lg:col-span-2">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <BarChart3 className="mr-2 text-cyan-400" /> Competitive Landscape & Opportunities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-white font-bold mb-2 flex items-center text-sm"><Zap className="w-3 h-3 mr-2 text-amber-400"/> NY/NJ Growth Drivers</h4>
                    <ul className="text-sm text-slate-400 space-y-2 mb-4">
                        <li>• <strong>Weather Extremes:</strong> Hot summers/cold winters drive demand.</li>
                        <li>• <strong>Demographics:</strong> Affluent $105k+ income households.</li>
                        <li>• <strong>M&A Activity:</strong> High consolidation (2025 deals in NJ/PA).</li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-2 flex items-center text-sm"><Users className="w-3 h-3 mr-2 text-blue-400"/> Competitors</h4>
                    <ul className="text-sm text-slate-400 space-y-2">
                        <li>• <strong>Direct (Apps):</strong> CompanyCam (Photos), Fieldwire (Markups).</li>
                        <li>• <strong>Indirect (Supply):</strong> Johnstone, Watsco, Ferguson.</li>
                    </ul>
                </div>
            </div>
           </div>

        </div>
      )}

      {/* FINANCIALS TAB */}
      {activeTab === 'financials' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <TrendingUp className="mr-2 text-emerald-500" /> Unit Economics (PTAC Install)
            </h3>
            <div className="space-y-6">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-emerald-600 bg-emerald-200">
                      Gross Margin
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-emerald-400">
                      47%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-emerald-200/20">
                  <div style={{ width: "47%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500"></div>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded border border-slate-700 space-y-2 text-sm">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Price to Client</span>
                  <span className="text-white font-bold">$1,600</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>- Unit Cost (Wholesale)</span>
                  <span>$600</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>- Labor & Logistics</span>
                  <span>$250</span>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-2 text-emerald-400 font-bold text-lg">
                  <span>Net Profit</span>
                  <span>$750</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Users className="mr-2 text-blue-500" /> The Valuation Multiplier
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              Investors value recurring revenue 2x higher than one-time installs. Our "Membership Model" is critical for the exit.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 p-4 rounded text-center">
                <div className="text-slate-500 text-xs uppercase mb-1">One-Time Revenue</div>
                <div className="text-2xl font-bold text-white">$1.2M</div>
                <div className="text-xs text-slate-600">Valuation: ~1x</div>
              </div>
              <div className="bg-emerald-900/20 p-4 rounded text-center border border-emerald-900/50">
                <div className="text-emerald-400 text-xs uppercase mb-1">Recurring Revenue</div>
                <div className="text-2xl font-bold text-emerald-400">$1.2M</div>
                <div className="text-xs text-emerald-600 font-bold">Valuation: ~2-3x</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SOPs TAB */}
      {activeTab === 'sops' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-amber-900/20 border border-amber-900/50 p-4 rounded-lg flex items-start">
            <ShieldAlert className="w-6 h-6 text-amber-500 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-amber-400 font-bold mb-1">Field Policy: No Photos? No Problem.</h4>
              <p className="text-sm text-slate-300">
                Physical access to client units is often restricted. Use the workflow below to generate professional case studies using 
                <span className="text-white font-bold"> CompanyCam</span> or <span className="text-white font-bold">Fieldwire</span>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Camera className="mr-2 text-blue-400" /> Client Photo Workflow
              </h3>
              <ol className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start">
                  <span className="bg-blue-900 text-blue-300 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">1</span>
                  <span>Ask client to snap 6 key shots: Outdoor Unit, Indoor Handler, Thermostat, Vents, Breaker Panel, Problem Area.</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-900 text-blue-300 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">2</span>
                  <span>Upload to CompanyCam. Use red arrows for "Poor Location" and yellow circles for "dirty coil".</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-900 text-blue-300 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">3</span>
                  <span>Export as PDF "Case Study" to attach to the quote. Improves close rate by 30%.</span>
                </li>
              </ol>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <CheckSquare className="mr-2 text-emerald-400" /> Recommended Tool Stack
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-slate-900 p-3 rounded">
                  <span className="text-white font-bold">CompanyCam</span>
                  <span className="text-xs text-slate-400">Best for: Photo Annotation</span>
                </div>
                <div className="flex items-center justify-between bg-slate-900 p-3 rounded">
                  <span className="text-white font-bold">ServiceTitan</span>
                  <span className="text-xs text-slate-400">Best for: CRM / Dispatch</span>
                </div>
                <div className="flex items-center justify-between bg-slate-900 p-3 rounded">
                  <span className="text-white font-bold">Fieldwire</span>
                  <span className="text-xs text-slate-400">Best for: Site Markups</span>
                </div>
                <div className="flex items-center justify-between bg-slate-900 p-3 rounded">
                  <span className="text-white font-bold">MeasureQuick</span>
                  <span className="text-xs text-slate-400">Best for: Diagnostics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TECH STACK TAB (NEW) */}
      {activeTab === 'tech' && (
        <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-lg relative group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l"></div>
                    <h4 className="text-blue-400 font-bold mb-1 flex items-center"><Server className="w-4 h-4 mr-2" /> FSM Core</h4>
                    <div className="text-2xl font-bold text-white mb-2">ServiceTitan</div>
                    <p className="text-xs text-slate-400">Source of Truth for Jobs, Customers, and Dispatching.</p>
                    <div className="mt-4 flex items-center text-xs text-emerald-400 bg-emerald-900/20 w-fit px-2 py-1 rounded border border-emerald-900/50">
                        <Zap className="w-3 h-3 mr-1" /> API Sync Ready
                    </div>
                </div>

                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-lg relative group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 rounded-l"></div>
                    <h4 className="text-amber-400 font-bold mb-1 flex items-center"><Package className="w-4 h-4 mr-2" /> Inventory</h4>
                    <div className="text-2xl font-bold text-white mb-2">Watsco API</div>
                    <p className="text-xs text-slate-400">Real-time stock levels for Carrier, Trane, Rheem parts.</p>
                    <div className="mt-4 flex items-center text-xs text-slate-400 bg-slate-700 w-fit px-2 py-1 rounded">
                        <Globe className="w-3 h-3 mr-1" /> Integration Needed
                    </div>
                </div>

                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-lg relative group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-l"></div>
                    <h4 className="text-emerald-400 font-bold mb-1 flex items-center"><Map className="w-4 h-4 mr-2" /> Logistics</h4>
                    <div className="text-2xl font-bold text-white mb-2">Google Maps</div>
                    <p className="text-xs text-slate-400">Route Matrix API for accurate traffic-aware ETA.</p>
                    <div className="mt-4 flex items-center text-xs text-emerald-400 bg-emerald-900/20 w-fit px-2 py-1 rounded border border-emerald-900/50">
                        <CheckSquare className="w-3 h-3 mr-1" /> Integrated
                    </div>
                </div>

                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-lg relative group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 rounded-l"></div>
                    <h4 className="text-purple-400 font-bold mb-1 flex items-center"><Database className="w-4 h-4 mr-2" /> Data Graph</h4>
                    <div className="text-2xl font-bold text-white mb-2">Neo4j</div>
                    <p className="text-xs text-slate-400">Maps Part Compatibility (Compressor A fits Unit B).</p>
                    <div className="mt-4 flex items-center text-xs text-slate-400 bg-slate-700 w-fit px-2 py-1 rounded">
                        <Cpu className="w-3 h-3 mr-1" /> Planning Phase
                    </div>
                </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4">Architecture Blueprint</h3>
                <div className="relative p-6 bg-slate-900 rounded border border-slate-800">
                    <div className="flex justify-between items-center text-sm font-mono text-slate-400">
                        <div className="border-2 border-slate-700 p-4 rounded text-center w-1/4">
                            <span className="text-blue-400 block mb-2 font-bold">Frontend</span>
                            React / Tailwind
                        </div>
                        <ArrowRight className="text-slate-600" />
                        <div className="border-2 border-indigo-500/50 p-4 rounded text-center w-1/4 bg-indigo-900/10">
                            <span className="text-indigo-400 block mb-2 font-bold">Orchestrator</span>
                            Node.js / Python
                        </div>
                        <ArrowRight className="text-slate-600" />
                        <div className="border-2 border-slate-700 p-4 rounded text-center w-1/4">
                            <span className="text-emerald-400 block mb-2 font-bold">Real Data</span>
                            External APIs
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

// Helper Icon for this component only
const Package = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22v-9"/></svg>
);
