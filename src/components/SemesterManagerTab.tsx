import React, { useState } from 'react';
import { SemesterManagerStats, KnowledgeMap } from '../types';
import { Compass, AlertOctagon, CheckCircle2, ChevronRight, Calculator, RefreshCw, Landmark, Calendar, MapPin, Map, Navigation } from 'lucide-react';

interface SemesterManagerTabProps {
  stats: SemesterManagerStats;
  knowledgeMap: KnowledgeMap;
  onUpdateStats: (newStats: SemesterManagerStats) => void;
}

export default function SemesterManagerTab({
  stats,
  knowledgeMap,
  onUpdateStats
}: SemesterManagerTabProps) {
  const [bunkSimSubject, setBunkSimSubject] = useState('OS');
  const [extraAttended, setExtraAttended] = useState(5);
  const [calculatingWaiver, setCalculatingWaiver] = useState(false);

  const riskLevel = stats.overallRiskScore;

  const handleSimulateWaiver = () => {
    setCalculatingWaiver(true);
    setTimeout(() => {
      // Create copy and update statistics for simulation visual feedback
      const cloned = { ...stats };
      if (cloned.attendance[bunkSimSubject]) {
        const sub = cloned.attendance[bunkSimSubject];
        sub.attended = Math.min(sub.total, sub.attended + extraAttended);
        sub.percentage = Math.round((sub.attended / sub.total) * 100);
        sub.bunkAllowance = Math.max(0, Math.floor((sub.attended - (sub.total * sub.minRequired / 100))));
      }

      // Re-trigger and lower risk score based on attendance fix
      cloned.overallRiskScore = Math.max(15, cloned.overallRiskScore - (extraAttended * 3));
      
      // Update sessional list
      cloned.riskReasons = cloned.riskReasons.filter(r => !r.includes(bunkSimSubject));
      cloned.riskRemedies = cloned.riskRemedies.filter(r => !r.includes(bunkSimSubject));
      
      onUpdateStats(cloned);
      setCalculatingWaiver(false);
    }, 600);
  };

  const handleToggleAssignment = (assId: string) => {
    const cloned = { ...stats };
    cloned.assignments = cloned.assignments.map(ass => {
      if (ass.id === assId) {
        const newStatus = ass.status === 'pending' ? 'submitted' : 'pending';
        return { ...ass, status: newStatus as any };
      }
      return ass;
    });

    // Solve sessional pending assignments penalties dynamically
    const pendingCount = cloned.assignments.filter(a => a.status === 'pending').length;
    cloned.overallRiskScore = Math.min(95, Math.max(10, (pendingCount * 12) + (cloned.attendance['OS'].percentage < 75 ? 40 : 10)));
    onUpdateStats(cloned);
  };

  return (
    <div className="space-y-6 font-sans" id="semester-manager-tab">
      
      {/* Top counselor diagnostic cards */}
      <div className="p-6 bg-slate-900/40 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Risk Score Dial metric */}
        <div className="md:col-span-4 bg-slate-950 p-5 rounded-xl border border-slate-900 text-center relative overflow-hidden">
          {/* Background grid */}
          <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-orange-500/5 to-transparent pointer-events-none" />
          
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Overall Failure Risk Index</span>
          <span className={`text-5xl font-display font-black block mt-2 tracking-tight ${
            riskLevel > 60 ? 'text-rose-400' : riskLevel > 35 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {riskLevel}%
          </span>
          <span className={`text-[10px] font-mono uppercase tracking-wider block mt-2.5 font-bold ${
            riskLevel > 60 ? 'text-rose-500 bg-rose-950/40' : 'text-amber-500 bg-amber-950/30'
          } py-1 px-3 border border-slate-900 rounded-full inline-block`}>
            {riskLevel > 60 ? 'CRITICAL WAR-ROOM ALIGNMENT' : 'STABLE TRACK'}
          </span>
        </div>

        {/* Reasons and alarm description columns */}
        <div className="md:col-span-8 space-y-4">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest select-none">Diagnostic checklist anomalies</h3>
          
          <div className="space-y-2">
            {stats.riskReasons.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <AlertOctagon size={13} className="text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{reason}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Literal Google Maps Semester Route map representation! */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl p-6 overflow-hidden min-h-[480px] flex flex-col justify-between relative">
          
          {/* Subtle map route layout illustration in SVG */}
          <div className="flex justify-between items-center z-10 relative">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-500/20 flex items-center gap-1.5 animate-pulse">
              <Navigation size={10} className="text-cyan-400 animate-spin" /> Live Semester GPS Navigation Active
            </span>
            <span className="text-[10px] font-mono text-slate-500">Destination: Board GPA &gt;= 8.5</span>
          </div>

          <div className="my-8 relative h-64 flex items-center justify-between px-10 z-10">
            {/* Draw connecting route path lines using SVGs */}
            <svg className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 w-full h-1 pointer-events-none">
              <line x1="10%" y1="50%" x2="40%" y2="50%" stroke="rgba(16, 185, 129, 0.6)" strokeWidth="3" />
              <line x1="40%" y1="50%" x2="70%" y2="50%" stroke={stats.attendance['OS'].percentage < 75 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.6)'} strokeWidth="3" strokeDasharray="6 4" />
              <line x1="70%" y1="50%" x2="90%" y2="50%" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="3" />
            </svg>

            {/* Render 4 sequential GPS node checks */}
            
            {/* Node 1: Completed Midterms */}
            <div className="flex flex-col items-center space-y-2 relative">
              <div className="w-10 h-10 rounded-full bg-emerald-950 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center font-bold text-xs ring-4 ring-emerald-950 shadow-md">
                <MapPin size={15} />
              </div>
              <div className="text-center w-24">
                <h4 className="text-[10px] font-mono font-bold text-slate-350 uppercase select-none">Milestone A</h4>
                <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-wide leading-3">Midterms Passed</p>
                <span className="text-[8px] bg-emerald-950/50 text-emerald-400 border border-emerald-500/20 px-1 py-0.5 rounded uppercase font-mono mt-1 font-bold">Grade: 9.2</span>
              </div>
            </div>

            {/* Node 2: Attendance sessional Alert gate */}
            <div className="flex flex-col items-center space-y-2 relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ring-4 shadow-md ${
                stats.attendance['OS'].percentage < 75 
                  ? 'bg-rose-950 border-2 border-rose-500 text-rose-400 animate-bounce' 
                  : 'bg-emerald-950 border-2 border-emerald-500 text-emerald-400'
              }`}>
                <AlertOctagon size={15} />
              </div>
              <div className="text-center w-24">
                <h4 className="text-[10px] font-mono font-bold text-slate-350 uppercase select-none">Milestone B</h4>
                <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-wide leading-3">OS Attendance</p>
                <span className={`text-[8px] border px-1 py-0.5 rounded uppercase font-mono mt-1 font-bold ${
                  stats.attendance['OS'].percentage < 75 
                    ? 'bg-rose-950/60 text-red-400 border-red-500/20' 
                    : 'bg-emerald-950/60 text-emerald-400 border-emerald-500/10'
                }`}>{stats.attendance['OS'].percentage}% • {stats.attendance['OS'].percentage < 75 ? 'Alarm limit' : 'Safe'}</span>
              </div>
            </div>

            {/* Node 3: CN due Homework check */}
            <div className="flex flex-col items-center space-y-2 relative">
              {(() => {
                const cnAss = stats.assignments.find(a => a.subject === 'CN');
                const assPending = cnAss?.status === 'pending';
                return (
                  <>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ring-4 shadow-md ${
                      assPending 
                        ? 'bg-amber-950 border-2 border-amber-500 text-amber-400' 
                        : 'bg-emerald-950 border-2 border-emerald-500 text-emerald-400'
                    }`}>
                      <Calculator size={15} />
                    </div>
                    <div className="text-center w-24">
                      <h4 className="text-[10px] font-mono font-bold text-slate-350 uppercase select-none">Milestone C</h4>
                      <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-wide leading-3">CN Assignments</p>
                      <span className={`text-[8px] border px-1 py-0.5 rounded uppercase font-mono mt-1 font-bold ${
                        assPending 
                          ? 'bg-amber-950/60 text-amber-400 border-amber-500/20' 
                          : 'bg-emerald-950/60 text-emerald-400 border-emerald-500/10'
                      }`}>{assPending ? '1 Overdue' : 'Submitted'}</span>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Node 4: final examinations countdown */}
            <div className="flex flex-col items-center space-y-2 relative">
              <div className="w-10 h-10 rounded-full bg-indigo-950 border-2 border-indigo-500 text-indigo-400 flex items-center justify-center font-bold text-xs ring-4 ring-indigo-950 shadow-md">
                <Map size={15} />
              </div>
              <div className="text-center w-24">
                <h4 className="text-[10px] font-mono font-bold text-slate-350 uppercase select-none">Milestone D</h4>
                <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-wide leading-3">Final Boards</p>
                <span className="text-[8px] bg-indigo-950/50 text-indigo-400 border border-indigo-500/20 px-1 py-0.5 rounded uppercase font-mono mt-1 font-bold">24d countdown</span>
              </div>
            </div>

          </div>

          {/* Action remedy summary footnotes */}
          <div className="bg-slate-900/20 border border-slate-900 p-4 rounded-xl space-y-2 text-xs font-mono text-slate-400 leading-relaxed z-10 relative">
            <span className="font-bold text-indigo-400 block text-[10px] uppercase tracking-widest leading-3 select-none">GPS Counselor Action advice</span>
            <div className="space-y-1.5 pl-2 border-l border-indigo-500/30">
              {stats.riskRemedies.map((rem, idx) => (
                <div key={idx} className="flex gap-1.5 items-start">
                  <span className="text-indigo-400 font-bold">&gt;</span>
                  <span>{rem}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side: attendance checklists and manual waiver-simulator calculator */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Assignment checklist block */}
          <div className="bg-slate-900/30 rounded-2xl border border-slate-800 p-5">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold mb-3.5">Assignments Checklist</span>
            
            <div className="space-y-3.5">
              {stats.assignments.map((ass) => (
                <div 
                  key={ass.id} 
                  id={`checked-ass-${ass.id}`}
                  onClick={() => handleToggleAssignment(ass.id)}
                  className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-900/80 cursor-pointer hover:border-slate-800 transition-all justify-between"
                >
                  <div className="flex items-center gap-2 max-w-[80%]">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      ass.status === 'submitted' 
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' 
                        : 'border-slate-800 bg-transparent text-transparent'
                    }`}>
                      {ass.status === 'submitted' && <CheckCircle2 size={11} />}
                    </div>
                    <span className={`text-xs truncate font-sans ${ass.status === 'submitted' ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                      {ass.title}
                    </span>
                  </div>
                  
                  <span className="text-[9px] font-mono text-indigo-400 bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-500/20">
                    {ass.subject}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bunk allowance simulation panel */}
          <div className="bg-slate-900/30 rounded-2xl border border-slate-800 p-5">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold mb-3.5 flex items-center gap-1.5">
              <Calculator size={13} className="text-indigo-400 animate-pulse" /> Sessional Waiver Simulator
            </span>

            <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
              Missing classes? Simulate attending supplementary slots or sessional backup lectures to lift your attendance above the mandatory 75% limit.
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1 select-none">Core Subject</label>
                <select
                  value={bunkSimSubject}
                  onChange={(e) => setBunkSimSubject(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 border border-slate-900 rounded-lg p-2 text-xs focus:outline-none"
                >
                  <option value="OS">Operating Systems</option>
                  <option value="DBMS">DBMS</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1 select-none">Attend extra sessions</label>
                <div className="flex items-center justify-between text-xs font-mono bg-slate-950 px-4 py-2 rounded-lg border border-slate-900">
                  <button 
                    type="button"
                    onClick={() => setExtraAttended(Math.max(1, extraAttended - 1))}
                    className="text-slate-400 hover:text-slate-200 font-bold px-1 select-none cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-slate-100 font-bold">{extraAttended} Hours</span>
                  <button 
                    type="button"
                    onClick={() => setExtraAttended(Math.min(15, extraAttended + 1))}
                    className="text-slate-400 hover:text-slate-200 font-bold px-1 select-none cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="button"
                id="apply-simulated-waiver"
                onClick={handleSimulateWaiver}
                disabled={calculatingWaiver}
                className="w-full h-10 bg-slate-100 hover:bg-white text-slate-950 font-semibold rounded-xl text-xs flex justify-center items-center gap-1.5 cursor-pointer disabled:bg-slate-900 disabled:text-slate-650"
              >
                {calculatingWaiver ? (
                  <>
                    <RefreshCw className="animate-spin" size={12} /> Running calculations...
                  </>
                ) : (
                  <>
                    Inject Attended Hours
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
