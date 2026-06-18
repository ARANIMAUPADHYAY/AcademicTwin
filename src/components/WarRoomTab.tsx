import React, { useState } from 'react';
import { KnowledgeMap } from '../types';
import { Flame, AlertCircle, ShieldAlert, CheckCircle2, Clock, Hourglass, HelpCircle, Sparkles } from 'lucide-react';

interface WarRoomTabProps {
  knowledgeMap: KnowledgeMap;
  selectedSubject: string;
}

export default function WarRoomTab({
  knowledgeMap,
  selectedSubject
}: WarRoomTabProps) {
  const [daysRemaining, setDaysRemaining] = useState(10);
  
  const subjectTopics = knowledgeMap[selectedSubject]?.topics || [];
  
  // Dynamically calculate "Safe Topics" (mastery or confidence >=6)
  const safeTopics = subjectTopics.filter(t => (t.actualMastery >= 6 || (t.actualMastery === 0 && t.confidence >= 7)));
  
  // Dynamically calculate "High Risk Topics" (mastery < 6, or untested with low confidence)
  const highRiskTopics = subjectTopics.filter(t => (t.actualMastery > 0 && t.actualMastery < 6) || (t.actualMastery === 0 && t.confidence < 7));

  // Dynamically calculate completeness probability based on days remaining and weak nodes
  // Formula: base 90% minus 8% per weak node, then proportional multiplier based on days log compression
  const weakNodePenalty = highRiskTopics.length * 8;
  const daysFactor = Math.min(1.0, daysRemaining / 15);
  const rawProbability = Math.round((100 - weakNodePenalty) * (0.3 + 0.7 * daysFactor));
  const completionProbability = Math.max(12, Math.min(98, rawProbability));

  // Visual threat level index
  const getThreatLevel = (p: number) => {
    if (p < 40) return { label: 'CRITICAL BACKLOG', color: 'text-rose-500', bg: 'bg-rose-950/40', border: 'border-rose-500/35' };
    if (p < 75) return { label: 'HIGH PRESSURE ALERT', color: 'text-amber-500', bg: 'bg-amber-950/30', border: 'border-amber-500/30' };
    return { label: 'SECURE FLOW', color: 'text-emerald-500', bg: 'bg-emerald-950/30', border: 'border-emerald-500/30' };
  };

  const threat = getThreatLevel(completionProbability);

  // Critical war actions checklist
  const actions = [
    { text: `Complete active reality audits for ${highRiskTopics.length} remaining weak segments.`, done: false },
    { text: 'Analyze previous sessional papers regarding Boyce-Codd normal form anomalies.', done: false },
    { text: `Attend remaining OS or DBMS lectures to secure attendance credits (current overall risk model activated).`, done: false },
    { text: 'Run 1 virtual oral Viva simulation on the examiner chatbot to test sessional communication confidence.', done: false }
  ];

  return (
    <div className="space-y-6 font-sans" id="war-room-tab">
      
      {/* War Room title and dynamic timeline slider */}
      <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
            <Flame className="text-rose-500 animate-pulse" size={20} />
            The Exam War Room
          </h2>
          <p className="text-xs text-slate-400">
            Current target subject evaluated: <span className="font-bold text-slate-200">{selectedSubject} Engineering</span>
          </p>
        </div>

        {/* Dynamic sessional clock control slider */}
        <div className="flex bg-slate-950 border border-slate-850 p-4.5 rounded-xl gap-6 items-center shrink-0 w-full md:w-96 justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold block leading-3">Sessional countdown</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-200 text-sm">
              <Hourglass size={14} className="text-rose-400 animate-spin" style={{ animationDuration: '4s' }} />
              {daysRemaining} Days To Exam
            </div>
          </div>
                      
          <input
            type="range"
            min="1"
            max="30"
            value={daysRemaining}
            onChange={(e) => setDaysRemaining(parseInt(e.target.value))}
            className="w-44 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
        </div>
      </div>

      {/* Main command statistics columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Radial completion engine simulation and threat diagnostics */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between overflow-hidden min-h-[380px] relative">
          
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Completeness Probability model</span>

          <div className="flex flex-col items-center justify-center my-6 relative">
            
            {/* Custom SVG Radial completeness indicator */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle 
                  cx="88" 
                  cy="88" 
                  r="74" 
                  stroke="rgba(30, 41, 59, 0.8)" 
                  strokeWidth="11" 
                  fill="transparent" 
                />
                <circle 
                  cx="88" 
                  cy="88" 
                  r="74" 
                  stroke={completionProbability < 40 ? '#ef4444' : completionProbability < 75 ? '#f59e0b' : '#10b981'} 
                  strokeWidth="11" 
                  fill="transparent" 
                  strokeDasharray="465"
                  strokeDashoffset={465 - (465 * completionProbability) / 100}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              {/* Inner score reading */}
              <div className="absolute text-center">
                <span className="block font-display font-black text-slate-100 text-3xl tracking-tight leading-8">{completionProbability}%</span>
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Completeness</span>
              </div>
            </div>

            {/* Float warning pill */}
            <div className={`mt-5 px-3.5 py-1.5 ${threat.bg} ${threat.border} border rounded-xl flex items-center gap-1.5 text-xs font-semibold ${threat.color} tracking-tight`}>
              <AlertCircle size={13} /> {threat.label}
            </div>
          </div>

          <p className="text-[10px] text-slate-500 leading-3.5 text-center mt-2 font-mono">
            💡 Pull the days-remaining slider down to watch how timeline compression changes completeness levels and raises risk thresholds.
          </p>
        </div>

        {/* Segmented listing of High Risk vs Safe topics and action checklist */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Safe zone bucket */}
            <div className="bg-slate-900/35 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="text-emerald-500" size={15} />
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">Safe Zones ({safeTopics.length})</span>
                </div>
                
                {safeTopics.length > 0 ? (
                  <div className="space-y-2 mt-2">
                    {safeTopics.map(topic => (
                      <div key={topic.id} className="bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-lg flex justify-between items-center text-xs">
                        <span className="font-medium text-slate-200">{topic.name}</span>
                        <span className="font-mono text-emerald-400 font-semibold">{topic.actualMastery || topic.confidence}/10</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 leading-5 text-center p-4">
                    No Safe Topics. Calibrate node confidence in Knowledge Map to establish safe zones!
                  </div>
                )}
              </div>
              
              <p className="text-[10px] text-slate-500 block leading-3 bg-slate-950/50 p-2 rounded border border-slate-900 mt-4">
                Safe zones have tested conceptual clarity of &gt;=6/10. Do not expend redundant study time here.
              </p>
            </div>

            {/* High risk anomaly bucket */}
            <div className="bg-slate-900/35 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ShieldAlert className="text-rose-400" size={15} />
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">High Risk Backlogs ({highRiskTopics.length})</span>
                </div>

                {highRiskTopics.length > 0 ? (
                  <div className="space-y-2 mt-2">
                    {highRiskTopics.map(topic => (
                      <div key={topic.id} className="bg-rose-950/20 border border-rose-500/20 p-2.5 rounded-lg flex justify-between items-center text-xs">
                        <span className="font-medium text-slate-200">{topic.name}</span>
                        <span className="font-mono text-rose-450 font-semibold">{topic.actualMastery || 'Untested'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 leading-5 text-center p-4">
                    Excellent! No High Risk Backlogs flagged.
                  </div>
                )}
              </div>
              
              <p className="text-[10px] text-slate-500 block leading-3 bg-slate-950/50 p-2 rounded border border-slate-900 mt-4 text-rose-400/80">
                Emergency attention is required. Launch a Viva simulation or quick reality audit check to address these backlogs.
              </p>
            </div>
          </div>

          {/* Action Checkpoints plan card */}
          <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800">
            <h3 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Sparkles size={13} /> Sessional Battlefield Action Checklist
            </h3>
            
            <div className="space-y-2.5">
              {actions.map((act, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-900 h-13 flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-[9px] flex items-center justify-center font-bold">
                      0{idx + 1}
                    </span>
                    <span className="text-slate-350 leading-relaxed truncate">{act.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
