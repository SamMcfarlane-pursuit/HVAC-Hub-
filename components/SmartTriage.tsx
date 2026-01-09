import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, AlertTriangle, CheckCircle, Activity, FileText, SlidersHorizontal, Map, ShoppingCart, ScanLine } from 'lucide-react';
import { analyzeHVACIssue } from '../services/geminiService';
import { TriageResult, TechLevel } from '../types';

export const SmartTriage: React.FC = () => {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanningStep, setScanningStep] = useState<string>('');
  const [result, setResult] = useState<TriageResult | null>(null);
  const [focusArea, setFocusArea] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!description && !image) return;

    setLoading(true);
    setResult(null);

    // Simulation of scanning steps for UX
    const steps = ['Analyzing Visual Data...', 'Checking Manufacturer Specs...', 'Verifying Local Law 97...', 'Synthesizing Diagnosis...'];
    let stepIndex = 0;

    const scanInterval = setInterval(() => {
      setScanningStep(steps[stepIndex]);
      stepIndex = (stepIndex + 1) % steps.length;
    }, 800);

    try {
      const data = await analyzeHVACIssue(description, image || undefined, focusArea || undefined);
      clearInterval(scanInterval);
      setResult(data);
    } catch (err) {
      console.error(err);
      clearInterval(scanInterval);
    } finally {
      setLoading(false);
    }
  };

  const FOCUS_OPTIONS = [
    { id: 'Electrical', label: 'Electrical' },
    { id: 'Mechanical Wear', label: 'Component Wear' },
    { id: 'Refrigerant', label: 'Refrigerant' },
    { id: 'Airflow', label: 'Airflow/Ducts' }
  ];

  return (
    <div className="h-full flex flex-col space-y-6 p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Activity className="mr-2 text-emerald-400" /> Smart Triage AI
          </h2>
          <p className="text-slate-400 text-sm">Gemini 2.0 Flash • Operations Core</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">

        {/* INPUT SECTION */}
        <div className="flex flex-col space-y-4">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg flex-1">
            <label className="text-sm font-bold text-slate-300 mb-2 block uppercase tracking-wider">Issue Description</label>
            <textarea
              className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg p-4 h-40 focus:ring-2 focus:ring-emerald-500 outline-none placeholder-slate-500 resize-none mb-4"
              placeholder="Describe the issue (e.g., 'Compressor short cycling, error E4 on thermostat')..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <label className="text-sm font-bold text-slate-300 mb-2 block uppercase tracking-wider">Refine Focus</label>
            <div className="flex flex-wrap gap-2 mb-6">
              {FOCUS_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setFocusArea(focusArea === opt.id ? null : opt.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition flex items-center ${focusArea === opt.id
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-900/20'
                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'
                    }`}
                >
                  {opt.label}
                  {focusArea === opt.id && <CheckCircle className="w-3 h-3 ml-1" />}
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <label className="flex-1 cursor-pointer bg-slate-700 hover:bg-slate-600 transition p-4 rounded-xl flex flex-col items-center justify-center border border-slate-600 border-dashed group">
                <Camera className="w-6 h-6 text-slate-400 group-hover:text-white mb-2 transition" />
                <span className="text-xs font-bold text-slate-400 group-hover:text-white transition">ADD PHOTO</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>

              <button
                onClick={handleAnalyze}
                disabled={loading || (!description && !image)}
                className={`flex-[2] p-4 rounded-xl font-bold text-white transition flex items-center justify-center shadow-lg
                                    ${loading || (!description && !image)
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20'}`}
              >
                {loading ? 'INITIATING SCAN...' : 'RUN DIAGNOSTICS'}
              </button>
            </div>

            {image && (
              <div className="mt-4 relative group w-full h-32 bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
                <img src={image} alt="Issue context" className="w-full h-full object-cover opacity-80" />
                <button onClick={() => setImage(null)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">✕</button>
              </div>
            )}
          </div>
        </div>

        {/* VISUALIZATION / RESULTS SECTION */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center p-6 min-h-[400px]">

          {/* Empty State */}
          {!result && !loading && (
            <div className="text-center opacity-40">
              <ScanLine className="w-24 h-24 text-slate-500 mx-auto mb-4 stroke-1" />
              <h3 className="text-xl font-medium text-slate-300">Awaiting Input Stream</h3>
              <p className="text-slate-500 text-sm mt-2">Upload visual or audio data to begin analysis</p>
            </div>
          )}

          {/* Scanning Animation */}
          {loading && (
            <div className="flex flex-col items-center justify-center w-full max-w-sm relative z-10">
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mb-8">
                <div className="h-full bg-emerald-500 animate-[loading_2s_ease-in-out_infinite]"></div>
              </div>
              <Activity className="w-16 h-16 text-emerald-400 animate-pulse mb-6" />
              <p className="text-emerald-400 font-mono text-sm tracking-widest uppercase">{scanningStep}</p>

              {/* Scanning Grid Background Effect */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)] pointer-events-none -z-10"></div>
            </div>
          )}

          {/* Results Report Card */}
          {result && !loading && (
            <div className="w-full h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Header */}
              <div className="flex justify-between items-start mb-6 border-b border-slate-800 pb-4">
                <div>
                  <div className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1">Diagnosis Complete</div>
                  <h3 className="text-2xl font-bold text-white leading-tight">{result.diagnosis}</h3>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-emerald-400">{result.confidence}%</div>
                  <div className="text-xs text-slate-500 uppercase">Confidence</div>
                </div>
              </div>

              {/* Key Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <span className="text-xs text-slate-400 uppercase block mb-1">Skill Required</span>
                  <span className={`font-bold ${result.requiredSkillLevel === TechLevel.MASTER ? 'text-purple-400' : 'text-blue-400'
                    }`}>{result.requiredSkillLevel}</span>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <span className="text-xs text-slate-400 uppercase block mb-1">Est. Duration</span>
                  <span className="font-bold text-white">{result.estimatedHours} Hours</span>
                </div>
              </div>

              {/* Parts & Compliance */}
              <div className="space-y-4 flex-1">
                {/* Visual Findings - Issues detected from photo */}
                {result.visualFindings && result.visualFindings.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-slate-400 uppercase font-bold">Visual Findings</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${result.issueSeverity === 'Critical' ? 'bg-red-900/50 text-red-300 border border-red-500/30' :
                          result.issueSeverity === 'Warning' ? 'bg-amber-900/50 text-amber-300 border border-amber-500/30' :
                            result.issueSeverity === 'Advisory' ? 'bg-blue-900/50 text-blue-300 border border-blue-500/30' :
                              'bg-emerald-900/50 text-emerald-300 border border-emerald-500/30'
                        }`}>
                        {result.issueSeverity}
                      </span>
                    </div>
                    <ul className="space-y-1.5">
                      {result.visualFindings.map((finding, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                          <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${result.issueSeverity === 'Critical' ? 'bg-red-500' :
                              result.issueSeverity === 'Warning' ? 'bg-amber-500' :
                                result.issueSeverity === 'Advisory' ? 'bg-blue-500' :
                                  'bg-emerald-500'
                            }`}></span>
                          {finding}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <span className="text-xs text-slate-400 uppercase font-bold mb-2 block">Recommended Parts</span>
                  <div className="flex flex-wrap gap-2">
                    {result.recommendedParts.map((part, idx) => (
                      <span key={idx} className="bg-indigo-900/30 text-indigo-300 px-3 py-1 rounded-full text-xs font-medium border border-indigo-500/30">
                        {part}
                      </span>
                    ))}
                  </div>
                </div>

                {result.complianceNotes && (
                  <div className="bg-amber-900/10 border border-amber-500/20 p-3 rounded-lg flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <div className="text-xs text-slate-300">
                      <span className="block text-amber-500 font-bold mb-0.5">Compliance Alert</span>
                      {result.complianceNotes}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-800">
                <button
                  onClick={() => navigate('/routing')}
                  className="bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold text-sm flex items-center justify-center transition"
                >
                  <Map className="w-4 h-4 mr-2" /> Dispatch Tech
                </button>
                <button
                  onClick={() => navigate('/supply')}
                  className="bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-bold text-sm flex items-center justify-center transition"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" /> Order Parts
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};