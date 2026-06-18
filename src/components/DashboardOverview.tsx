import React from 'react';
import { KnowledgeMap, SemesterManagerStats } from '../types';
import { Brain, Star, Clock, Milestone, Calendar, TrendingUp, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';

interface DashboardOverviewProps {
  knowledgeMap: KnowledgeMap;
  stats: SemesterManagerStats;
  setActiveTab: (tab: string) => void;
}

export default function DashboardOverview({
  knowledgeMap,
  stats,
  setActiveTab
}: DashboardOverviewProps) {
  
  // Aggregate weak and strong nodes from sessional database
  const allTopics = Object.values(knowledgeMap).flatMap(sub => sub.topics);
  const weakTopicsCount = allTopics.filter(t => t.status === 'weak').length;
  const untestedTopicsCount = allTopics.filter(t => t.status === 'untested').length;
  const strongTopicsCount = allTopics.filter(t => t.status === 'strong').length;

  const upcomingMajorEvent = stats.exams[0] || { title: 'DBMS Semester Exam', date: '2026-07-10' };

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-300" id="dashboard-overview">
      
      {/* Visual greeting banner */}
      <div className="p-6 bg-slate-900/40 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        {/* Abstract glowing circular pattern */}
        <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
        
        <div className="space-y-1.5 relative z-10">
          <h2 className="text-xl font-display font-medium text-slate-100">
            Welcome Back, <span className="font-bold text-white">Aranimau</span>
          </h2>
          <p className="text-xs text-slate-400">
            Your Academic Twin is synchronized with your university curriculum. Sessional tracking model holds <span className="text-indigo-400 font-semibold">{allTopics.length} core knowledge nodes</span>.
          </p>
        </div>

        <div className="text-[11px] font-mono text-slate-500 bg-slate-950 p-2 border border-slate-900 rounded-lg shrink-0 select-none">
          Last brain snapshot: <span className="text-indigo-400 font-semibold">Today • 11:30 AM</span>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Bento Cell 1: Twin Synaptic matrix visualization */}
        <div className="md:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between min-h-[340px] relative overflow-hidden">
          
          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center gap-2">
              <Brain size={18} className="text-indigo-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-slate-350 uppercase tracking-widest">Digital Twin Mapping</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Live Active Synapses</span>
          </div>

          {/* Interactive animated SVG cluster representing neural node health */}
          <div className="h-44 my-4 flex items-center justify-center relative z-10">
            <svg className="w-80 h-full">
              {/* Radial connecting grid lines */}
              <line x1="160" y1="88" x2="60" y2="40" stroke="rgba(99,102,241,0.15)" strokeWidth="1.5" />
              <line x1="160" y1="88" x2="260" y2="40" stroke="rgba(99,102,241,0.15)" strokeWidth="1.5" />
              <line x1="160" y1="88" x2="60" y2="136" stroke="rgba(99,102,241,0.15)" strokeWidth="1.5" />
              <line x1="160" y1="88" x2="260" y2="136" stroke="rgba(99,102,241,0.15)" strokeWidth="1.5" />
              <line x1="60" y1="40" x2="60" y2="136" stroke="rgba(99,102,241,0.1)" strokeWidth="1.5" />
              <line x1="260" y1="40" x2="260" y2="136" stroke="rgba(99,102,241,0.1)" strokeWidth="1.5" />

              {/* Glowing animated visual center point representing the Core Student Brain */}
              <circle cx="160" cy="88" r="16" fill="rgba(99,102,241,0.1)" stroke="rgb(99,102,241)" strokeWidth="2" className="animate-pulse" />
              <circle cx="160" cy="88" r="6" fill="rgb(99,102,241)" />

              {/* Node Outer indicators */}
              {/* Top Left Node: DBMS */}
              <circle cx="60" cy="40" r="10" fill="rgba(16,185,129,0.08)" stroke="#10b981" strokeWidth="2" />
              {/* Top Right Node: OS */}
              <circle cx="260" cy="40" r="10" fill="rgba(244,63,94,0.1)" stroke="#f43f5e" strokeWidth="2" className="animate-pulse" />
              {/* Bottom Left Node: CN */}
              <circle cx="60" cy="136" r="10" fill="rgba(99,102,241,0.08)" stroke="#6366f1" strokeWidth="2" />
              {/* Bottom Right Node: General Sessional */}
              <circle cx="260" cy="136" r="10" fill="rgba(99,102,241,0.08)" stroke="#6366f1" strokeWidth="2" />
            </svg>
            
            {/* Overlay indicators descriptive labels */}
            <span className="absolute top-0 left-4 text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-500/20">DBMS: STABLE</span>
            <span className="absolute top-0 right-4 text-[9px] font-mono text-rose-450 font-bold bg-rose-950/20 px-1.5 py-0.5 rounded border border-rose-500/20 animate-pulse">OS: MODERATE RISK</span>
            <span className="absolute bottom-0 left-4 text-[9px] font-mono text-indigo-400 font-bold bg-indigo-950/20 px-1.5 py-0.5 rounded border border-indigo-500/20">CN: UNGRADED</span>
            <span className="absolute bottom-0 right-4 text-[9px] font-mono text-indigo-400 font-bold bg-indigo-950/20 px-1.5 py-0.5 rounded border border-indigo-500/20">SESSIONAL TRACK</span>
          </div>

          <div className="flex justify-between items-center bg-slate-900/25 p-3 rounded-xl border border-slate-900 leading-none">
            <span className="text-[10px] font-mono text-slate-500">Summary assessment:</span>
            <div className="flex gap-4 text-[10px] font-mono">
              <span className="text-emerald-400 font-bold">{strongTopicsCount} Strong Nodes</span>
              <span className="text-rose-400 font-bold">{weakTopicsCount} Weak Nodes</span>
              <span className="text-indigo-400 font-bold">{untestedTopicsCount} Untested</span>
            </div>
          </div>

        </div>

        {/* Bento Cell 2: Quick actions / alarm modules */}
        <div className="md:col-span-4 space-y-6 flex flex-col justify-between">
          
          {/* Calendar alarms */}
          <div className="bg-slate-900/30 rounded-2xl border border-slate-800 p-5 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="text-indigo-400" size={16} />
                <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest leading-3 select-none">University Milestone</span>
              </div>

              <div className="p-4.5 bg-slate-950/80 rounded-xl border border-slate-900 space-y-1.5">
                <h4 className="text-xs font-bold text-slate-200">{upcomingMajorEvent.title}</h4>
                <p className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5 leading-3">
                  <Clock size={11} /> Date Scheduled: {upcomingMajorEvent.date}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('war-room')}
              className="mt-6 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex justify-center items-center gap-1 cursor-pointer transition-colors border border-indigo-500/20"
            >
              Enter Exam War Room <ArrowRight size={13} />
            </button>
          </div>

          {/* Sessional risk alert highlight */}
          {stats.overallRiskScore > 50 && (
            <div className="bg-rose-950/20 border border-rose-500/20 p-4.5 rounded-2xl flex gap-3">
              <ShieldAlert className="text-rose-400 shrink-0" size={18} />
              <div>
                <h4 className="text-xs font-bold text-rose-350 leading-3">Curriculum Alarm active</h4>
                <p className="text-[10px] text-slate-450 leading-relaxed font-mono mt-1.5">
                  Academic model evaluates low OS attendance (67%) as chief failure threat. Visit AI Semester Manager and compile waiver simulator.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Sessional Shortcuts Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Shortcut 1 */}
        <div 
          onClick={() => setActiveTab('confidence-gap')}
          className="bg-slate-900/20 p-4.5 rounded-xl border border-slate-850/60 hover:border-violet-500/30 transition-all cursor-pointer flex flex-col justify-between h-28 group"
        >
          <span className="text-[10px] font-mono text-violet-400 uppercase tracking-wider font-semibold">Reality checks</span>
          <h4 className="text-xs font-bold text-slate-250 mt-1.5 group-hover:text-violet-300">Run Confidence Diagnostics &gt;</h4>
          <p className="text-[10px] text-slate-500 leading-relaxed font-sans mt-1">Audit theoretical blindspots using examiner algorithms.</p>
        </div>

        {/* Shortcut 2 */}
        <div 
          onClick={() => setActiveTab('viva')}
          className="bg-slate-900/20 p-4.5 rounded-xl border border-slate-850/60 hover:border-rose-500/30 transition-all cursor-pointer flex flex-col justify-between h-28 group"
        >
          <span className="text-[10px] font-mono text-rose-450 uppercase tracking-wider font-semibold">Technical grading</span>
          <h4 className="text-xs font-bold text-slate-250 mt-1.5 group-hover:text-rose-300">Start External Auto-Viva &gt;</h4>
          <p className="text-[10px] text-slate-500 leading-relaxed font-sans mt-1">Submit vocal proofs directly to interactive professor agent.</p>
        </div>

        {/* Shortcut 3 */}
        <div 
          onClick={() => setActiveTab('lecture-intelligence')}
          className="bg-slate-900/20 p-4.5 rounded-xl border border-slate-850/60 hover:border-indigo-500/30 transition-all cursor-pointer flex flex-col justify-between h-28 group"
        >
          <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">Auto study-guides</span>
          <h4 className="text-xs font-bold text-slate-250 mt-1.5 group-hover:text-indigo-300">Digitize Live Lectures &gt;</h4>
          <p className="text-[10px] text-slate-500 leading-relaxed font-sans mt-1">Synthesize audio transcripts into quizzes, checklists, notes.</p>
        </div>

      </div>

    </div>
  );
}
