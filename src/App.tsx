import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardOverview from './components/DashboardOverview';
import KnowledgeMapTab from './components/KnowledgeMapTab';
import ConfidenceVsRealityTab from './components/ConfidenceVsRealityTab';
import WarRoomTab from './components/WarRoomTab';
import VivaTab from './components/VivaTab';
import LectureIntelligenceTab from './components/LectureIntelligenceTab';
import SemesterManagerTab from './components/SemesterManagerTab';
import { KnowledgeMap, SemesterManagerStats, LectureData } from './types';
import { AlertCircle, AlertTriangle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSubject, setSelectedSubject] = useState('DBMS');

  // Theme state system: "Deep Space" (dark) vs "Focus" (light)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('academic-theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('academic-theme', nextTheme);
  };

  // 1. Centralized student knowledge map snaps
  const [knowledgeMap, setKnowledgeMap] = useState<KnowledgeMap>({
    DBMS: {
      name: 'Database Management Systems',
      topics: [
        { id: 'normalization', name: 'Normalization & FDs', category: 'DBMS', confidence: 8, actualMastery: 3, status: 'weak', details: 'Functional Dependencies, 1NF, 2NF, 3NF, BCNF anomalies and decompositions.' },
        { id: 'transactions', name: 'Transactions & Concurrency', category: 'DBMS', confidence: 7, actualMastery: 8, status: 'strong', details: 'ACID properties, physical locks, Cascading Aborts, schedules.' },
        { id: 'indexing', name: 'Indexing & B-Trees', category: 'DBMS', confidence: 5, actualMastery: 4, status: 'weak', details: 'Clustered indexes, dense/sparse indexing structures, B/B+ search trees.' },
        { id: 'sql', name: 'SQL Queries & Joins', category: 'DBMS', confidence: 9, actualMastery: 9, status: 'strong', details: 'Subqueries, grouping, nested aggregates, outer natural joins, sessional CTEs.' }
      ]
    },
    OS: {
      name: 'Operating Systems Core',
      topics: [
        { id: 'deadlocks', name: 'Deadlocks Avoidance', category: 'OS', confidence: 4, actualMastery: 0, status: 'untested', details: "Mutual exclusion criteria, Banker's algorithm safeties, circular waits." },
        { id: 'scheduling', name: 'CPU Scheduling Algorithms', category: 'OS', confidence: 8, actualMastery: 8, status: 'strong', details: 'Round Robin, SJF, contextual overheads, priority inversions.' },
        { id: 'paging', name: 'Paging & Virtual Memory', category: 'OS', confidence: 6, actualMastery: 3, status: 'weak', details: 'Page tables, TLB hits, least-recently-used, page thrashing risks.' },
        { id: 'concurrency', name: 'Process Concurrency', category: 'OS', confidence: 5, actualMastery: 0, status: 'untested', details: 'Semaphores, Mutex variables, producer-consumer ring buffer boundaries.' }
      ]
    },
    CN: {
      name: 'Computer Networks',
      topics: [
        { id: 'tcp', name: 'TCP Transport Flow Control', category: 'CN', confidence: 5, actualMastery: 0, status: 'untested', details: '3-Way handshake parameters, sliding windows, congestion maps.' },
        { id: 'routing', name: 'Routing & Subnetting', category: 'CN', confidence: 5, actualMastery: 0, status: 'untested', details: 'Variable Length Subnet Masks, Dijkstra algorithm linkages, RIP/OSPF.' },
        { id: 'dns', name: 'DNS & Application Layer', category: 'CN', confidence: 5, actualMastery: 0, status: 'untested', details: 'Hierarchical query trees, caching, TLS connections handshakes.' },
        { id: 'protocols', name: 'Link Layer Collisions', category: 'CN', confidence: 5, actualMastery: 0, status: 'untested', details: 'CSMA/CD packet collision detection, Ethernet frame headers, ARP mappings.' }
      ]
    }
  });

  // 2. Initial sessional statistics (Attendance records, milestones overdue logs)
  const [semesterStats, setSemesterStats] = useState<SemesterManagerStats>({
    attendance: {
      DBMS: { name: 'DBMS Engineering', percentage: 84, attended: 42, total: 50, minRequired: 75, bunkAllowance: 4 },
      OS: { name: 'Operating Systems', percentage: 67, attended: 31, total: 46, minRequired: 75, bunkAllowance: 0 },
      CN: { name: 'Computer Networks', percentage: 76, attended: 38, total: 50, minRequired: 75, bunkAllowance: 1 }
    },
    assignments: [
      { id: 'ass-dbms', title: 'Normal Form Decompositions sessional', subject: 'DBMS', dueDate: 'Past Due', status: 'pending', weight: 8 },
      { id: 'ass-cn', title: 'Subnet routing homework pack', subject: 'CN', dueDate: 'In 3 Days', status: 'pending', weight: 12 },
      { id: 'ass-os', title: 'LRU Page replacement tracing logs', subject: 'OS', dueDate: 'In 6 Days', status: 'submitted', weight: 10 }
    ],
    exams: [
      { id: 'ex-main', title: 'Final Semester Sessional Exams', subject: 'All', date: 'In 10 Days', weight: 50 }
    ],
    overallRiskScore: 65,
    riskReasons: [
      'Operating Systems attendance sits at 67%, breaching the mandatory 75% bar risking sessional debarment.',
      'Sessional assignment for Database Normalization is past due, locking potential 8% GPA marks.',
      'Core topics like Deadlocks in Operating Systems are untested despite heavy sessional exam weighting.'
    ],
    riskRemedies: [
      'Inject 6 supplementary Operating Systems lecture credits via simulation waiver checks to clear debarment.',
      'Mark the DBMS assignment submitted on the sidebar checklist to recover sessional marks.',
      'Initiate an Auto-Viva session in DBMS, and run reality audit testing on low-grade nodes on the dashboards.'
    ]
  });

  const [savedLectures, setSavedLectures] = useState<LectureData[]>([]);
  const [isRebuildingMap, setIsRebuildingMap] = useState(false);

  // Updates self-rated confidence (modifies node and reclassifies status)
  const handleUpdateTopicConfidence = (subject: string, topicId: string, confidence: number) => {
    const cloned = { ...knowledgeMap };
    const topicsList = cloned[subject]?.topics || [];
    const idx = topicsList.findIndex(t => t.id === topicId);

    if (idx !== -1) {
      const topic = topicsList[idx];
      topic.confidence = confidence;
      
      // Determine node status rating
      if (topic.actualMastery > 0) {
        topic.status = topic.actualMastery >= 6 ? 'strong' : 'weak';
      } else {
        topic.status = confidence >= 7 ? 'strong' : confidence <= 4 ? 'weak' : 'untested';
      }
      setKnowledgeMap(cloned);
    }
  };

  // Sync grading results from diagnostic tests
  const handleUpdateActualMastery = (subject: string, topicId: string, actualMastery: number, confidence: number) => {
    const cloned = { ...knowledgeMap };
    const topicsList = cloned[subject]?.topics || [];
    const idx = topicsList.findIndex(t => t.id === topicId);

    if (idx !== -1) {
      const topic = topicsList[idx];
      topic.actualMastery = actualMastery;
      topic.confidence = confidence;
      topic.status = actualMastery >= 6 ? 'strong' : 'weak';
      setKnowledgeMap(cloned);
    }
  };

  // Sync results from Auto-Viva completion
  const handleVivaCompleted = (subject: string, clarityScore: number) => {
    const cloned = { ...knowledgeMap };
    const topicsList = cloned[subject]?.topics || [];
    
    // Auto-update first untested topic matching subject
    const untested = topicsList.find(t => t.status === 'untested');
    if (untested) {
      untested.actualMastery = clarityScore;
      untested.status = clarityScore >= 6 ? 'strong' : 'weak';
      setKnowledgeMap(cloned);
    }
  };

  const handleRebuildMap = async (subject: string, customNotes: string) => {
    setIsRebuildingMap(true);
    try {
      const res = await fetch('/api/generate-knowledge-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, customNotes })
      });
      const data = await res.json();
      
      if (data.topics && data.topics.length > 0) {
        setKnowledgeMap(prev => {
          const cloned = { ...prev };
          if (cloned[subject]) {
            cloned[subject].topics = data.topics;
          }
          return cloned;
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRebuildingMap(false);
    }
  };

  const handleAddLecture = (lecture: LectureData) => {
    setSavedLectures(prev => [lecture, ...prev]);
  };

  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-colors duration-300 ${theme === 'light' ? 'light-theme bg-stone-50 text-stone-900' : 'bg-slate-900 text-slate-100'}`} id="academic-root">
      
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        semesterRiskScore={semesterStats.overallRiskScore}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col h-full bg-slate-950/20 overflow-y-auto relative">
        <div className="p-8 max-w-7xl w-full mx-auto space-y-6 flex-1 pb-16">
          
          {/* Main conditional tab routing panel */}
          {activeTab === 'dashboard' && (
            <DashboardOverview 
              knowledgeMap={knowledgeMap} 
              stats={semesterStats} 
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'knowledge-map' && (
            <KnowledgeMapTab 
              knowledgeMap={knowledgeMap}
              selectedSubject={selectedSubject}
              setSelectedSubject={setSelectedSubject}
              onUpdateTopicConfidence={handleUpdateTopicConfidence}
              onRebuildMap={handleRebuildMap}
              isRebuilding={isRebuildingMap}
            />
          )}

          {activeTab === 'confidence-gap' && (
            <ConfidenceVsRealityTab 
              knowledgeMap={knowledgeMap}
              onUpdateActualMastery={handleUpdateActualMastery}
            />
          )}

          {activeTab === 'war-room' && (
            <WarRoomTab 
              knowledgeMap={knowledgeMap}
              selectedSubject={selectedSubject}
            />
          )}

          {activeTab === 'viva' && (
            <VivaTab 
              onVivaCompleted={handleVivaCompleted}
            />
          )}

          {activeTab === 'lecture-intelligence' && (
            <LectureIntelligenceTab 
              onAddLecture={handleAddLecture}
              savedLectures={savedLectures}
            />
          )}

          {activeTab === 'semester-manager' && (
            <SemesterManagerTab 
              stats={semesterStats}
              knowledgeMap={knowledgeMap}
              onUpdateStats={setSemesterStats}
            />
          )}

        </div>
      </div>
    </div>
  );
}
