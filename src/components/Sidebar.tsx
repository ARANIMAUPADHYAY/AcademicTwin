import React from 'react';
import { 
  Brain, 
  Map, 
  SlidersHorizontal, 
  Flame, 
  Mic, 
  BookOpen, 
  Compass, 
  GraduationCap,
  Calendar,
  AlertTriangle,
  Sun,
  Moon
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  semesterRiskScore: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, semesterRiskScore, theme, onToggleTheme }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', name: 'Brain Overview', icon: Brain },
    { id: 'knowledge-map', name: 'Knowledge Map', icon: Map },
    { id: 'confidence-gap', name: 'Confidence vs Reality', icon: SlidersHorizontal },
    { id: 'war-room', name: 'Exam War Room', icon: Flame },
    { id: 'viva', name: 'Auto-Viva System', icon: Mic },
    { id: 'lecture-intelligence', name: 'Lecture Intelligence', icon: BookOpen },
    { id: 'semester-manager', name: 'AI Semester Manager', icon: Compass },
  ];

  return (
    <div className="w-80 h-screen bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 font-sans" id="academic-sidebar">
      {/* Upper Brand Section */}
      <div className="p-6">
        <div className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-xl border border-slate-800/80">
          <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20 shadow-inner">
            <Brain size={24} className="animate-pulse" />
          </div>
          <div>
            <h1 className="font-display font-bold text-base text-slate-100 tracking-tight leading-4">Academic Twin</h1>
            <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-wider">v1.4 • Student Brain Sync</p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="mt-8 space-y-1.5">
          <p className="text-[11px] font-mono text-slate-500 font-semibold uppercase tracking-widest pl-3 mb-3">Core Modules</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left border transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-slate-900 border-indigo-500/40 text-slate-100 font-medium shadow-md shadow-indigo-950/20' 
                    : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 hover:border-slate-800/60'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-indigo-400' : 'text-slate-500'} />
                <span className="text-sm font-sans tracking-wide">{item.name}</span>
                {item.id === 'semester-manager' && semesterRiskScore > 50 && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme Toggle Module */}
      <div className="px-5 mb-2">
        <div className="flex items-center justify-between p-3 bg-slate-900/40 rounded-xl border border-slate-900/80">
          <span className="text-[11px] font-mono text-slate-450 font-bold uppercase tracking-widest">Theme Mode</span>
          <button
            onClick={onToggleTheme}
            id="theme-toggle"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 text-xs text-slate-350 hover:text-slate-100 transition-all cursor-pointer font-sans font-medium border border-slate-850"
            title="Toggle between Deep Space (Dark) and Focus (Light) Themes"
          >
            {theme === 'dark' ? (
              <>
                <Moon size={13} className="text-cyan-400 animate-pulse" />
                <span className="font-mono text-[10px]">Deep Space</span>
              </>
            ) : (
              <>
                <Sun size={13} className="text-amber-500" />
                <span className="font-mono text-[10px]">Focus Light</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Footer Student Card Section */}
      <div className="p-5 border-t border-slate-900 bg-slate-950">
        <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
              <GraduationCap size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-300 leading-3">Aranimau Upadhyay</p>
              <p className="text-[10px] font-mono text-slate-500 mt-1 leading-3">arani@univ.edu • Sec-A</p>
            </div>
          </div>

          <div className="mt-3.5 pt-3.5 border-t border-slate-900 flex justify-between items-center text-[11px] font-mono">
            <div className="text-slate-500">
              <span className="block text-[9px] uppercase tracking-wider">Status Index</span>
              <span className={`font-semibold ${semesterRiskScore > 50 ? 'text-rose-450' : 'text-emerald-500'}`}>
                {semesterRiskScore > 50 ? 'HIGH RISK' : 'HEALTHY'}
              </span>
            </div>
            <div className="text-right text-slate-500">
              <span className="block text-[9px] uppercase tracking-wider">Risk Index</span>
              <span className={`font-semibold ${semesterRiskScore > 50 ? 'text-amber-400' : 'text-cyan-400'}`}>
                {semesterRiskScore}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
