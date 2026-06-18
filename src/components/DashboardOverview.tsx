import React from 'react';
import { KnowledgeMap, SemesterManagerStats } from '../types';
import { 
  Brain, 
  Clock, 
  Calendar, 
  ArrowRight, 
  ShieldAlert, 
  SlidersHorizontal, 
  Mic, 
  BookOpen, 
  AlertOctagon, 
  Sparkles,
  TrendingDown
} from 'lucide-react';

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

  // Dynamically resolve OS attendance risk stats
  const osStats = stats.attendance.OS || { name: 'Operating Systems', percentage: 67, minRequired: 75 };
  
  // Dynamically resolve Normalization topic gap stats
  const normalizationTopic = knowledgeMap.DBMS?.topics.find(t => t.id === 'normalization') || {
    name: 'Normalization & FDs',
    confidence: 8,
    actualMastery: 3,
    status: 'weak'
  };
  const normalizationGap = (normalizationTopic.actualMastery || 0) - (normalizationTopic.confidence || 0);

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-300" id="dashboard-overview">
      
      {/* 1. HERO HEADER BANNER: Command Center Pitch */}
      <div className="p-6 bg-slate-900/40 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        {/* Glowing circular pattern backdrop */}
        <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-yellow-500/5 blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10 max-w-2xl">
          <h2 className="text-3xl font-display font-bold text-yellow-500 tracking-wider">
            Academic Twin
          </h2>
          <p className="text-sm font-semibold text-slate-200">
            Your Academic Brain, Mapped and Measured.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Academic Twin is an AI-powered Decision Intelligence System that models your conceptual learning states, computes sessional attendance risk thresholds, and warns you of miscalibrated confidence gaps before sessional exams.
          </p>
        </div>

        {/* Dynamic Metric Summaries Row */}
        <div className="flex flex-wrap gap-4 w-full md:w-auto shrink-0 select-none">
          <div className="bg-slate-950 p-3.5 border border-slate-900 rounded-xl text-center min-w-24">
            <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-3">Brain Synapses</span>
            <span className="text-lg font-bold text-slate-100">{allTopics.length}</span>
          </div>
          <div className="bg-slate-950 p-3.5 border border-slate-900 rounded-xl text-center min-w-24 border-red-500/10">
            <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-3">Weak Backlogs</span>
            <span className="text-lg font-bold text-rose-450">{weakTopicsCount}</span>
          </div>
          <div className="bg-slate-950 p-3.5 border border-slate-900 rounded-xl text-center min-w-24 border-yellow-600/10">
            <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-3">Curriculum Risk</span>
            <span className="text-lg font-bold text-yellow-500">{stats.overallRiskScore}%</span>
          </div>
        </div>
      </div>

      {/* 2. COMMAND MATRIX: Mapping & Directives */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Col 1: Neural mapping cluster (Vibrant Constellation SVG) */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between min-h-[360px] relative overflow-hidden">
          
          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center gap-2">
              <Brain size={18} className="text-yellow-500 animate-pulse" />
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">Digital Twin Mapping</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Live Cognitive Constellation</span>
          </div>

          {/* SVG cluster graph representing neural node health */}
          <div className="h-44 my-4 flex items-center justify-center relative z-10">
            <svg className="w-80 h-full">
              {/* Radial connecting grid lines */}
              <line x1="160" y1="88" x2="60" y2="40" stroke="rgba(197, 160, 89, 0.22)" strokeWidth="1.5" />
              <line x1="160" y1="88" x2="260" y2="40" stroke="rgba(197, 160, 89, 0.22)" strokeWidth="1.5" />
              <line x1="160" y1="88" x2="60" y2="136" stroke="rgba(197, 160, 89, 0.22)" strokeWidth="1.5" />
              <line x1="160" y1="88" x2="260" y2="136" stroke="rgba(197, 160, 89, 0.22)" strokeWidth="1.5" />
              <line x1="60" y1="40" x2="60" y2="136" stroke="rgba(197, 160, 89, 0.1)" strokeWidth="1.5" />
              <line x1="260" y1="40" x2="260" y2="136" stroke="rgba(197, 160, 89, 0.1)" strokeWidth="1.5" />

              {/* Central Core Brain Hub */}
              <circle cx="160" cy="88" r="16" fill="rgba(197, 160, 89, 0.1)" stroke="#c5a059" strokeWidth="2" className="animate-pulse" />
              <circle cx="160" cy="88" r="6" fill="#c5a059" />

              {/* Node Outer indicators */}
              {/* Top Left Node: DBMS */}
              <circle cx="60" cy="40" r="10" fill="rgba(16,185,129,0.08)" stroke="#10b981" strokeWidth="2" />
              {/* Top Right Node: OS */}
              <circle cx="260" cy="40" r="10" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" strokeWidth="2" className="animate-pulse" />
              {/* Bottom Left Node: CN */}
              <circle cx="60" cy="136" r="10" fill="rgba(99,102,241,0.08)" stroke="#6366f1" strokeWidth="2" />
              {/* Bottom Right Node: General Sessional */}
              <circle cx="260" cy="136" r="10" fill="rgba(99,102,241,0.08)" stroke="#6366f1" strokeWidth="2" />
            </svg>
            
            {/* Overlay indicators descriptive labels */}
            <span className="absolute top-0 left-4 text-[9px] font-mono text-emerald-450 font-bold bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-500/20">DBMS: STABLE</span>
            <span className="absolute top-0 right-4 text-[9px] font-mono text-rose-450 font-bold bg-rose-950/20 px-1.5 py-0.5 rounded border border-rose-500/20 animate-pulse">OS: DEBARMENT RISK</span>
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

        {/* Col 2: Actionable Twin Directives Panel */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs font-mono font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-900 pb-2.5">
              <Sparkles size={13} /> Academic Twin Directive
            </h3>
            <p className="text-[10px] text-slate-500 font-sans mt-2 leading-relaxed">
              Real-time diagnostic directives recommended by your curriculum sessional cognitive model.
            </p>
          </div>

          <div className="space-y-3.5 flex-1 py-1">
            {/* Directive 1: Highest Risk Subject (Operating Systems Attendance) */}
            <div className="bg-slate-900/30 p-3 rounded-xl border border-slate-900 flex items-start gap-3 justify-between">
              <div className="space-y-1.5 max-w-[65%]">
                <span className="text-[9px] font-mono text-rose-450 font-bold uppercase tracking-widest bg-rose-950/30 px-2 py-0.5 rounded border border-rose-500/20 inline-block leading-none">
                  🚨 Highest Risk Subject
                </span>
                <h4 className="text-xs font-bold text-slate-200">{osStats.name}</h4>
                <div className="flex gap-3 text-[10px] font-mono text-slate-500 leading-none pt-0.5">
                  <span>Attendance: <span className="text-rose-400 font-semibold">{osStats.percentage}%</span></span>
                  <span>Required: {osStats.minRequired}%</span>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('semester-manager')}
                className="py-1.5 px-3 bg-slate-900 hover:bg-slate-850 text-slate-350 hover:text-slate-100 font-semibold rounded-lg text-[10px] border border-slate-800 transition-colors shrink-0 cursor-pointer self-center"
              >
                Open Manager
              </button>
            </div>

            {/* Directive 2: Next Study Priority (DBMS Normalization Gap) */}
            <div className="bg-slate-900/30 p-3 rounded-xl border border-slate-900 flex items-start gap-3 justify-between">
              <div className="space-y-1.5 max-w-[65%]">
                <span className="text-[9px] font-mono text-yellow-500 font-bold uppercase tracking-widest bg-amber-950/20 px-2 py-0.5 rounded border border-yellow-500/10 inline-block leading-none">
                  📚 Next Study Priority
                </span>
                <h4 className="text-xs font-bold text-slate-200">{normalizationTopic.name}</h4>
                <div className="flex gap-2 text-[10px] font-mono text-slate-500 leading-none pt-0.5">
                  <span>Confidence: {normalizationTopic.confidence}/10</span>
                  <span>Mastery: {normalizationTopic.actualMastery}/10</span>
                  <span className="text-yellow-500 font-semibold">Gap: {normalizationGap}</span>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('viva')}
                className="py-1.5 px-3 bg-slate-900 hover:bg-slate-850 text-slate-350 hover:text-slate-100 font-semibold rounded-lg text-[10px] border border-slate-800 transition-colors shrink-0 cursor-pointer self-center"
              >
                Launch Viva
              </button>
            </div>
          </div>

          {/* Quick exam milestone overview inside drawer */}
          <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl flex justify-between items-center text-[10px] font-mono leading-none">
            <span className="text-slate-500 flex items-center gap-1"><Calendar size={11} /> Milestone: {upcomingMajorEvent.title}</span>
            <span className="text-yellow-500 font-semibold">{upcomingMajorEvent.date}</span>
          </div>

        </div>

      </div>

      {/* 3. CAPABILITIES INDEX: Feature Discovery Section */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest pl-2 select-none">
          Academic Twin Capabilities
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Confidence vs Reality */}
          <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-850/60 hover:border-yellow-600/30 transition-all flex flex-col justify-between min-h-[160px] group">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg border border-yellow-500/10 shadow-inner">
                  <SlidersHorizontal size={14} />
                </span>
                <span className="text-[8px] font-mono text-emerald-450 bg-emerald-950/20 border border-emerald-500/20 px-2 py-0.5 rounded uppercase leading-none font-bold">
                  Active
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-200 font-sans tracking-tight group-hover:text-yellow-400">
                Confidence vs Reality
              </h4>
              <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                Detects hidden knowledge gaps between claimed confidence and evaluated mastery via progressive diagnostics.
              </p>
            </div>
            <button 
              onClick={() => setActiveTab('confidence-gap')}
              className="mt-4 w-full py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-slate-100 rounded-lg text-[10px] font-semibold flex justify-center items-center gap-1 border border-slate-800 transition-all cursor-pointer"
            >
              Run Diagnostic <ArrowRight size={10} />
            </button>
          </div>

          {/* Card 2: AI Viva Examiner */}
          <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-850/60 hover:border-yellow-600/30 transition-all flex flex-col justify-between min-h-[160px] group">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg border border-yellow-500/10 shadow-inner">
                  <Mic size={14} />
                </span>
                <span className="text-[8px] font-mono text-emerald-450 bg-emerald-950/20 border border-emerald-500/20 px-2 py-0.5 rounded leading-none font-bold">
                  Ready
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-200 font-sans tracking-tight group-hover:text-yellow-400">
                AI Viva Examiner
              </h4>
              <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                Simulates oral examinations using audio-grade external examiner models to certify conceptual clarity and sessional marks.
              </p>
            </div>
            <button 
              onClick={() => setActiveTab('viva')}
              className="mt-4 w-full py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-slate-100 rounded-lg text-[10px] font-semibold flex justify-center items-center gap-1 border border-slate-800 transition-all cursor-pointer"
            >
              Start Viva <ArrowRight size={10} />
            </button>
          </div>

          {/* Card 3: Lecture Intelligence */}
          <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-850/60 hover:border-yellow-600/30 transition-all flex flex-col justify-between min-h-[160px] group">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg border border-yellow-500/10 shadow-inner">
                  <BookOpen size={14} />
                </span>
                <span className="text-[8px] font-mono text-emerald-450 bg-emerald-950/20 border border-emerald-500/20 px-2 py-0.5 rounded leading-none font-bold">
                  Active
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-200 font-sans tracking-tight group-hover:text-yellow-400">
                Lecture Intelligence
              </h4>
              <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                Converts lecture audio records and textbook notes transcripts into formatted study guides, flashcards, and graded quizzes.
              </p>
            </div>
            <button 
              onClick={() => setActiveTab('lecture-intelligence')}
              className="mt-4 w-full py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-slate-100 rounded-lg text-[10px] font-semibold flex justify-center items-center gap-1 border border-slate-800 transition-all cursor-pointer"
            >
              Process Lecture <ArrowRight size={10} />
            </button>
          </div>

          {/* Card 4: Academic Risk Engine */}
          <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-850/60 hover:border-yellow-600/30 transition-all flex flex-col justify-between min-h-[160px] group">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg border border-yellow-500/10 shadow-inner">
                  <AlertOctagon size={14} />
                </span>
                <span className="text-[8px] font-mono text-amber-500 bg-amber-950/30 border border-yellow-600/20 px-2 py-0.5 rounded leading-none font-bold">
                  Monitoring
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-200 font-sans tracking-tight group-hover:text-yellow-400">
                Academic Risk Engine
              </h4>
              <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                Predicts sessional failure risk and debarment alarms based on live attendance margins and homework checklists.
              </p>
            </div>
            <button 
              onClick={() => setActiveTab('semester-manager')}
              className="mt-4 w-full py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-slate-100 rounded-lg text-[10px] font-semibold flex justify-center items-center gap-1 border border-slate-800 transition-all cursor-pointer"
            >
              Manage Risk <ArrowRight size={10} />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
