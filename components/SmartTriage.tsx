import React, { useState } from 'react';
import { Camera, Upload, AlertTriangle, CheckCircle, Activity, FileText, SlidersHorizontal } from 'lucide-react';
import { analyzeHVACIssue } from '../services/geminiService';
import { TriageResult, TechLevel } from '../types';

export const SmartTriage: React.FC = () => {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
    try {
      // Pass image string directly (service handles base64 stripping)
      const data = await analyzeHVACIssue(description, image || undefined, focusArea || undefined);
      setResult(data);
    } catch (err) {
      console.error(err);
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
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
          <Activity className="mr-2 text-emerald-400" /> Smart Triage AI
        </h2>
        <p className="text-slate-400 mb-6">Upload unit plate, error codes, or describe the noise for instant diagnostics.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <textarea
              className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg p-3 h-32 focus:ring-2 focus:ring-emerald-500 outline-none placeholder-slate-500"
              placeholder="Describe the issue (e.g., 'Compressor short cycling, error E4 on thermostat')..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            
            {/* Refinement Options */}
            <div className="space-y-2">
                <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <SlidersHorizontal className="w-3 h-3 mr-1" /> Refine Analysis Focus
                </div>
                <div className="flex flex-wrap gap-2">
                    {FOCUS_OPTIONS.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => setFocusArea(focusArea === opt.id ? null : opt.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition flex items-center ${
                                focusArea === opt.id
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-900/20'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'
                            }`}
                        >
                            {opt.label}
                            {focusArea === opt.id && <CheckCircle className="w-3 h-3 ml-1" />}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center space-x-4 pt-2">
              <label className="flex-1 cursor-pointer bg-slate-700 hover:bg-slate-600 transition p-3 rounded-lg flex items-center justify-center border border-slate-600 border-dashed">
                <Camera className="w-5 h-5 text-slate-300 mr-2" />
                <span className="text-sm text-slate-300">Upload Photo</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
              <button
                onClick={handleAnalyze}
                disabled={loading || (!description && !image)}
                className={`flex-1 p-3 rounded-lg font-bold text-white transition flex items-center justify-center
                  ${loading || (!description && !image) ? 'bg-slate-600 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500'}`}
              >
                {loading ? 'Analyzing...' : 'Run Diagnostics'}
              </button>
            </div>
            {image && (
              <div className="mt-2 relative group w-fit">
                <img src={image} alt="Issue context" className="h-32 w-auto rounded-lg border border-slate-600" />
                <button onClick={() => setImage(null)} className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition">✕</button>
              </div>
            )}
          </div>

          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 min-h-[300px] flex flex-col justify-center">
            {!result && !loading && (
              <div className="text-center text-slate-500">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Waiting for input data...</p>
              </div>
            )}
            
            {loading && (
              <div className="text-center text-emerald-400 animate-pulse">
                <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p>Processing visual & text data...</p>
                <p className="text-xs text-slate-500 mt-2">Checking Knowledge Base...</p>
                {focusArea && <p className="text-xs text-indigo-400 mt-1">Focusing on {focusArea}...</p>}
              </div>
            )}

            {result && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-white">{result.diagnosis}</h3>
                        {focusArea && <span className="text-xs text-indigo-400 italic">Focused on {focusArea}</span>}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold 
                        ${result.confidence > 80 ? 'bg-emerald-900 text-emerald-300' : 'bg-amber-900 text-amber-300'}`}>
                        {result.confidence}% Confidence
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-slate-800 p-2 rounded">
                        <span className="text-slate-400 block">Required Tech</span>
                        <span className={`font-semibold ${
                            result.requiredSkillLevel === TechLevel.MASTER ? 'text-purple-400' : 'text-blue-400'
                        }`}>{result.requiredSkillLevel}</span>
                    </div>
                    <div className="bg-slate-800 p-2 rounded">
                        <span className="text-slate-400 block">Est. Time</span>
                        <span className="text-white font-semibold">{result.estimatedHours} Hours</span>
                    </div>
                </div>

                <div>
                    <span className="text-slate-400 text-sm block mb-1">Recommended Parts</span>
                    <div className="flex flex-wrap gap-2">
                        {result.recommendedParts.map((part, idx) => (
                            <span key={idx} className="bg-slate-700 text-slate-200 px-2 py-1 rounded text-xs border border-slate-600">
                                {part}
                            </span>
                        ))}
                    </div>
                </div>

                {result.complianceNotes && (
                    <div className="mt-4 bg-blue-900/30 border border-blue-800 p-3 rounded text-sm">
                        <div className="flex items-center text-blue-400 mb-1">
                            <FileText className="w-4 h-4 mr-1" />
                            <span className="font-bold">Compliance Alert (Local Law 97)</span>
                        </div>
                        <p className="text-slate-300 text-xs">{result.complianceNotes}</p>
                    </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};