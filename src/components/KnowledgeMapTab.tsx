import React, { useState } from 'react';
import { TopicNode, KnowledgeMap } from '../types';
import { Map, Upload, ArrowRight, Star, RefreshCw, Layers, Edit3, HelpCircle } from 'lucide-react';

interface KnowledgeMapTabProps {
  knowledgeMap: KnowledgeMap;
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  onUpdateTopicConfidence: (subject: string, topicId: string, confidence: number) => void;
  onRebuildMap: (subject: string, customNotes: string) => Promise<void>;
  isRebuilding: boolean;
}

export default function KnowledgeMapTab({
  knowledgeMap,
  selectedSubject,
  setSelectedSubject,
  onUpdateTopicConfidence,
  onRebuildMap,
  isRebuilding
}: KnowledgeMapTabProps) {
  const [customNotes, setCustomNotes] = useState('');
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [tempConfidence, setTempConfidence] = useState<number>(5);

  const subjectData = knowledgeMap[selectedSubject] || { name: '', topics: [] };
  const subjectsList = Object.keys(knowledgeMap);

  const handleConfidenceSave = (topicId: string) => {
    onUpdateTopicConfidence(selectedSubject, topicId, tempConfidence);
    setEditingTopicId(null);
  };

  const startEditing = (topic: TopicNode) => {
    setEditingTopicId(topic.id);
    setTempConfidence(topic.confidence || 5);
  };

  const handleAnalyzeNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    await onRebuildMap(selectedSubject, customNotes);
    setCustomNotes('');
  };

  return (
    <div className="space-y-6 font-sans" id="knowledge-map-tab">
      {/* Upper header action area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
            <Map className="text-indigo-400" size={20} />
            Knowledge Map Navigator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visualizing structural linkages of your academic brain. Weak topics need reality evaluation.
          </p>
        </div>

        {/* Subject pills switcher */}
        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start md:self-auto">
          {subjectsList.map((sub) => (
            <button
              key={sub}
              id={`switch-subject-${sub}`}
              onClick={() => setSelectedSubject(sub)}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                selectedSubject === sub
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dynamic Connected Node Canvas Illustration (using SVGs) */}
        <div className="lg:col-span-7 bg-slate-950/80 rounded-2xl border border-slate-800/80 p-6 flex flex-col justify-between relative overflow-hidden min-h-[460px]">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
            style={{ backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 0)', backgroundSize: '24px 24px' }} 
          />

          <div className="flex justify-between items-center relative z-10">
            <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest bg-cyan-950/50 px-2.5 py-1 rounded-md border border-cyan-500/20">
              Active Neural Synapses
            </span>
            <div className="flex gap-4 text-[10px] font-mono text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Strong (&gt;=7)</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Weak (&lt;=4)</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Untested</span>
            </div>
          </div>

          {/* SVG Map Linkage */}
          <div className="h-64 my-6 flex items-center justify-center relative z-10 w-full">
            {/* Center Hub */}
            <div className="absolute w-28 h-28 rounded-full border border-slate-800 bg-slate-900/90 flex flex-col items-center justify-center text-center shadow-lg shadow-amber-950/30">
              <span className="text-[10px] font-mono text-yellow-500 uppercase tracking-widest leading-3 font-semibold mb-1">Hub Root</span>
              <span className="font-display font-black text-slate-100 text-lg leading-4 tracking-tight">{selectedSubject}</span>
              <span className="text-[9px] text-slate-500 mt-1">{subjectData.topics.length} Nodes</span>
            </div>

            {/* Connecting Vector Lines strictly with CSS styling */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Radial line connections to each topic */}
              <line x1="15%" y1="18%" x2="50%" y2="50%" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="85%" y1="18%" x2="50%" y2="50%" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="15%" y1="82%" x2="50%" y2="50%" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="85%" y1="82%" x2="50%" y2="50%" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1.5" strokeDasharray="3 3" />
            </svg>

            {/* Render 4 node anchors based on array order */}
            {subjectData.topics.slice(0, 4).map((topic, i) => {
              const positions = [
                { top: '8%', left: '4%' },   // Node 0: Top Left
                { top: '8%', right: '4%' },  // Node 1: Top Right
                { bottom: '8%', left: '4%' }, // Node 2: Bottom Left
                { bottom: '8%', right: '4%' } // Node 3: Bottom Right
              ];
              const pos = positions[i] || positions[0];

              let borderClr = 'border-slate-800';
              let bgClr = 'bg-slate-900/85';
              let glowColorClass = '';

              if (topic.status === 'strong') {
                borderClr = 'border-emerald-500/40 hover:border-emerald-500';
                bgClr = 'bg-slate-950/90';
                glowColorClass = 'text-emerald-400';
              } else if (topic.status === 'weak') {
                borderClr = 'border-rose-500/60 hover:border-rose-500';
                bgClr = 'bg-slate-950/90';
                glowColorClass = 'text-rose-400';
              } else {
                borderClr = 'border-yellow-600/30 hover:border-yellow-500/50';
                bgClr = 'bg-slate-950/90';
                glowColorClass = 'text-yellow-500';
              }

              return (
                <div
                  key={topic.id}
                  id={`kb-node-${topic.id}`}
                  style={pos}
                  className={`absolute w-44 p-3 rounded-xl border ${borderClr} ${bgClr} shadow-md transition-all duration-350 cursor-pointer hover:shadow-indigo-500/5 group`}
                  onClick={() => startEditing(topic)}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold">
                      Node 0{i + 1}
                    </span>
                    <span className={`text-xs font-mono font-bold ${glowColorClass}`}>
                      {topic.actualMastery > 0 ? `${topic.actualMastery}/10` : 'Ungraded'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 mt-1.5 group-hover:text-indigo-300 font-sans tracking-tight truncate">
                    {topic.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-3 line-clamp-2 h-6">
                    {topic.details}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-slate-900 flex justify-between items-center">
                    <div className="flex gap-0.5 text-amber-500/60">
                      {Array.from({ length: 5 }).map((_, st) => (
                        <Star 
                          key={st} 
                          size={8} 
                          fill={st * 2 < topic.confidence ? 'currentColor' : 'none'} 
                          className="mr-0.5"
                        />
                      ))}
                    </div>
                    <span className="text-[9px] font-mono text-slate-500">
                      Self: {topic.confidence || '0'}/10
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-slate-500 bg-slate-900/20 p-2.5 rounded-lg border border-slate-900 font-mono text-center relative z-10 w-full mt-4">
            💡 Click any outer Node Card to quickly update your Self-Rated Confidence.
          </div>
        </div>

        {/* Left pane: Details list and Analysis Feeder Form */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Node Edit Tool popup simulation in flow */}
          {editingTopicId && (
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950/20 p-5 rounded-2xl border border-indigo-500/30 shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-250">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1">
                  <Edit3 size={12} /> Adjust Target Node confidence
                </span>
                <button 
                  onClick={() => setEditingTopicId(null)}
                  className="text-slate-500 hover:text-slate-300 text-xs font-mono"
                >
                  [Cancel]
                </button>
              </div>

              {(() => {
                const topic = subjectData.topics.find(t => t.id === editingTopicId);
                if (!topic) return null;
                return (
                  <div>
                    <h4 className="text-sm font-display font-bold text-slate-200">{topic.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">{topic.details}</p>

                    <div className="mt-4">
                      <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                        <span>Your Current Confidence: {tempConfidence}/10</span>
                        <span className="text-indigo-400 font-bold">
                          {tempConfidence >= 8 ? 'Very Confident' : tempConfidence >= 5 ? 'Moderately Confident' : 'Weak/Unsure'}
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        value={tempConfidence}
                        onChange={(e) => setTempConfidence(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#C8A15A]"
                      />
                    </div>

                    <button
                      id="save-confidence-adjust"
                      onClick={() => handleConfidenceSave(topic.id)}
                      className="mt-4 w-full bg-indigo-605 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer shadow-indigo-900/40 flex justify-center items-center gap-1.5"
                    >
                      Apply Confidence Metric
                    </button>
                  </div>
                );
              })()}
            </div>
          )}

          {/* AI Syllabus Feed / Notes Analyzer block */}
          <div className="bg-slate-900/30 rounded-2xl border border-slate-800 p-5 mt-auto">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="text-orange-400" size={16} />
              <h3 className="text-sm font-display font-semibold text-slate-200 uppercase tracking-wide">
                Feed Academic Brain Notes
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Upload textbook chapters, past sessional papers, or syllabus text. Gemini will parse them to update topics in real-time.
            </p>

            <form onSubmit={handleAnalyzeNotes} className="space-y-3.5">
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Paste engineering syllabus or DBMS notes here... (e.g., 'Normalization 1NF 2NF 3NF, locking, B+ Tree layouts sessional 2026')"
                rows={5}
                className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20 leading-relaxed font-mono placeholder:text-slate-600"
              />

              <button
                type="submit"
                id="rebuild-brain-map"
                disabled={isRebuilding || !customNotes.trim()}
                className="w-full bg-slate-100 hover:bg-white text-slate-950 py-2.5 px-4 rounded-xl text-xs font-semibold shadow-inner disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed flex justify-center items-center gap-2 cursor-pointer transition-colors"
              >
                {isRebuilding ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} /> Synchronizing Brain Nodes...
                  </>
                ) : (
                  <>
                    Synthesize Notes into Brain <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
