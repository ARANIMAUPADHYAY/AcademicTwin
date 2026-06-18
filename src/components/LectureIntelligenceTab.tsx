import React, { useState } from 'react';
import { LectureData, QuizQuestion, Flashcard } from '../types';
import { BookOpen, Mic, Upload, Clipboard, Check, RotateCcw, AlertCircle, HelpCircle, ArrowRight, Layers, RefreshCw } from 'lucide-react';

interface LectureIntelligenceTabProps {
  onAddLecture: (lecture: LectureData) => void;
  savedLectures: LectureData[];
}

export default function LectureIntelligenceTab({
  onAddLecture,
  savedLectures
}: LectureIntelligenceTabProps) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('DBMS');
  const [lectureContent, setLectureContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);

  const [activeSubTab, setActiveSubTab] = useState<'notes' | 'flashcards' | 'quiz'>('notes');
  const [currentLecture, setCurrentLecture] = useState<LectureData | null>(null);

  // Quiz evaluation state
  const [quizAnswers, setQuizAnswers] = useState<{ [qId: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Flashcards state (tracks which card is flipped)
  const [flippedCards, setFlippedCards] = useState<{ [fcId: string]: boolean }>({});

  const toggleFlashcard = (id: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    const interval = setInterval(() => {
      setRecordingSeconds(s => s + 1);
    }, 1000);
    setRecordingInterval(interval);
  };

  const handleEndRecording = async () => {
    if (recordingInterval) clearInterval(recordingInterval);
    setIsRecording(false);
    setRecordingInterval(null);

    // Auto-populate detailed simulated lecture transcription based on Subject!
    const subjectSimulations: { [key: string]: string } = {
      DBMS: "Database transactions must satisfy ACID properties. Consistency ensures we move from one valid state to another. Isolation means concurrently executed transactions do not interfere, which we construct using strict Two-Phase locking protocols, solving dirty reads, unrepeatable reads, and phantom read anomalies.",
      OS: "Deadlocks occur when threads hold resources while waiting for other locked blocks in a circular dependency list. To prevent deadlocks, Banker's avoidance algorithm checks future sessional allocations. Page Replacement algorithms like LRU swap least-recently-accessed pages out of memory frames during page-fault cycles.",
      CN: "Computer Networks operate on segmented packet paths. TCP offers reliable byte-stream transport using 3-Way handshakes, selective acknowledgement, and congestion window adjustments (AIMD), preventing router buffer overflows while Routing protocols determine topological paths."
    };
    
    setLectureContent(subjectSimulations[subject] || subjectSimulations["DBMS"]);
  };

  const handleProcessLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lectureContent.trim()) return;

    setLoading(true);
    setQuizAnswers({});
    setQuizSubmitted(false);

    try {
      const res = await fetch('/api/lecture-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Recorded Lecture Session',
          subject: subject,
          lectureContent: lectureContent
        })
      });
      const data = await res.json();
      
      const parsedLecture: LectureData = {
        id: `lec-${Date.now()}`,
        title: title || 'Recorded Lecture Session',
        date: new Date().toLocaleDateString(),
        subject: subject,
        summary: data.summary || 'Compiled study notes',
        notesMarkdown: data.notesMarkdown || 'Study notes formatted.',
        flashcards: data.flashcards || [],
        quiz: data.quiz || [],
        importantTopics: data.importantTopics || []
      };

      setCurrentLecture(parsedLecture);
      onAddLecture(parsedLecture);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSelect = (qId: number, index: number) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({
      ...prev,
      [qId]: index
    }));
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remain = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remain.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 font-sans" id="lecture-intelligence-tab">
      
      {/* Upper header */}
      <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
        <h2 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
          <BookOpen className="text-indigo-400" size={20} />
          Lecture Intelligence Core
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Record or paste your live technical lectures. Gemini auto-synthesizes indexed study guides, flashcards, and testing sandboxes without manual formatting.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: input source form (dictation or textbox) */}
        <div className="lg:col-span-5 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-5">
          <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-semibold block border-b border-slate-900 pb-2">
            Lecture capture console
          </span>

          <form onSubmit={handleProcessLecture} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-semibold">Lecture Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., ACID rules and Concurrency locks"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-semibold">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-805 border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="DBMS">DBMS</option>
                  <option value="OS">Operating Systems</option>
                  <option value="CN">Computer Networks</option>
                </select>
              </div>

              {/* simulated mic recorder */}
              <div className="flex flex-col justify-end">
                {isRecording ? (
                  <button
                    type="button"
                    onClick={handleEndRecording}
                    className="bg-red-950 border border-red-500/40 text-red-400 font-semibold h-10.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ring-1 ring-red-500/35"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping mr-0.5" />
                    Stop ({formatTime(recordingSeconds)})
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="bg-slate-900 border border-slate-800 text-slate-400 font-medium h-10.5 rounded-xl text-xs flex items-center justify-center gap-2 hover:text-indigo-400 hover:border-indigo-500/40 cursor-pointer transition-all"
                  >
                    <Mic size={14} /> Record Audio
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-semibold">Lecture transcripts or content text:</label>
              <textarea
                value={lectureContent}
                onChange={(e) => setLectureContent(e.target.value)}
                placeholder="Pasted transcription or click 'Record Audio' above to simulate live classroom lecture capture bounds..."
                rows={7}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-350 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
              />
            </div>

            <button
              type="submit"
              id="synthesize-lecture"
              disabled={loading || !lectureContent.trim()}
              className="w-full bg-slate-100 hover:bg-white text-slate-950 font-semibold py-3 px-4 rounded-xl text-xs flex justify-center items-center gap-2 cursor-pointer shadow-inner disabled:bg-slate-900 disabled:text-slate-650 disabled:text-slate-600 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={14} /> Brain running parsing filters...
                </>
              ) : (
                <>
                  Process Lecture Study Guide <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: output tabs for study guide contents */}
        <div className="lg:col-span-7 bg-slate-900/10 border border-slate-800 rounded-2xl min-h-[500px]">
          
          {currentLecture ? (
            <div className="flex flex-col h-full">
              
              {/* Tabs list switch controls */}
              <div className="flex border-b border-slate-800 px-6 py-3 justify-between items-center bg-slate-950 rounded-t-2xl">
                <div className="flex gap-4">
                  {(['notes', 'flashcards', 'quiz'] as const).map((subTab) => (
                    <button
                      key={subTab}
                      id={`tab-lecture-${subTab}`}
                      onClick={() => setActiveSubTab(subTab)}
                      className={`text-xs font-mono font-semibold uppercase tracking-wider py-1 cursor-pointer border-b-2 transition-all ${
                        activeSubTab === subTab
                          ? 'border-indigo-500 text-slate-150'
                          : 'border-transparent text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {subTab === 'notes' ? 'Formatted Notes' : subTab === 'flashcards' ? 'Flashcards Pack' : 'Review Quiz'}
                    </button>
                  ))}
                </div>
                
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/40 border border-indigo-500/20 px-2 py-0.5 rounded">
                  {currentLecture.subject}
                </span>
              </div>

              {/* Dynamic tab contents rendering */}
              <div className="p-6 flex-1 overflow-y-auto max-h-[460px]">
                
                {/* 1. markdown notes summary display */}
                {activeSubTab === 'notes' && (
                  <div className="space-y-4">
                    <div className="border-l-2 border-indigo-500/40 pl-4 py-1">
                      <h3 className="font-display font-bold text-slate-200 text-sm">{currentLecture.title}</h3>
                      <p className="text-[10px] text-slate-500 font-mono mt-1">Digitized: {currentLecture.date}</p>
                    </div>

                    <div className="text-xs text-slate-300 font-mono bg-slate-950 border border-slate-850 p-4.5 rounded-xl leading-relaxed whitespace-pre-wrap">
                      {currentLecture.notesMarkdown}
                    </div>

                    {/* Important Exam topics checklist */}
                    <div className="mt-6 bg-amber-950/15 border border-amber-500/10 p-4.5 rounded-xl space-y-3.5">
                      <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5 leading-3">
                        <AlertCircle size={13} /> High-Probability exam topics identified
                      </h4>
                      <ol className="list-decimal pl-5 text-xs text-slate-400 space-y-2">
                        {currentLecture.importantTopics.map((top, tIdx) => (
                          <li key={tIdx} className="leading-relaxed font-sans">{top}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}

                {/* 2. Interactive flippable flashcards */}
                {activeSubTab === 'flashcards' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentLecture.flashcards.map((card) => {
                      const isFlipped = flippedCards[card.id];
                      return (
                        <div
                          key={card.id}
                          id={`flashcard-item-${card.id}`}
                          onClick={() => toggleFlashcard(card.id)}
                          className="h-36 relative cursor-pointer group"
                          style={{ perspective: '1000px' }}
                        >
                          {/* Inner container with 3D transform flippers */}
                          <div
                            className={`w-full h-full rounded-xl transition-all duration-350 relative shadow-md border ${
                              isFlipped 
                                ? 'bg-indigo-950/30 border-indigo-500/30 text-indigo-300' 
                                : 'bg-slate-950 border-slate-850 text-slate-200 hover:border-slate-700'
                            }`}
                            style={{ 
                              transformStyle: 'preserve-3d',
                              transform: isFlipped ? 'rotateY(180deg)' : 'none'
                            }}
                          >
                            {/* Front face (Question) */}
                            <div 
                              className="absolute inset-0 p-4 flex flex-col justify-between"
                              style={{ backfaceVisibility: 'hidden' }}
                            >
                              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">Flashcard Question</span>
                              <p className="text-xs font-semibold leading-relaxed font-sans">{card.question}</p>
                              <span className="text-[9px] text-indigo-400/80 font-mono text-right mt-1">Click to reveal answer</span>
                            </div>

                            {/* Back face (Answer) */}
                            <div 
                              className="absolute inset-0 p-4 flex flex-col justify-between transform rotate-y-180"
                              style={{ 
                                backfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)'
                              }}
                            >
                              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-bold">Examiner Keypoint Answer</span>
                              <p className="text-xs text-slate-300 leading-relaxed font-mono">{card.answer}</p>
                              <span className="text-[9px] text-slate-500 text-right">Click to flip back</span>
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 3. Interactive Quiz console with written solutions */}
                {activeSubTab === 'quiz' && (
                  <div className="space-y-6">
                    {currentLecture.quiz.map((q, qIdx) => {
                      const selectedOpt = quizAnswers[q.id];
                      return (
                        <div key={q.id} className="bg-slate-950 border border-slate-900 p-5 rounded-xl space-y-4">
                          <h4 className="text-xs font-semibold text-slate-200 flex gap-2 font-mono">
                            <span className="text-indigo-400">Q0{qIdx + 1}.</span>
                            {q.question}
                          </h4>

                          <div className="space-y-2 pl-4">
                            {q.options.map((opt, oIdx) => {
                              const isSelected = selectedOpt === oIdx;
                              let labelClass = 'bg-slate-900 text-slate-300 border-slate-850 hover:bg-slate-850';
                              
                              if (quizSubmitted) {
                                if (oIdx === q.correctAnswerIndex) {
                                  labelClass = 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40';
                                } else if (isSelected) {
                                  labelClass = 'bg-rose-950/60 text-rose-400 border-rose-500/40';
                                } else {
                                  labelClass = 'bg-slate-950 text-slate-500 border-slate-900 opacity-60';
                                }
                              } else if (isSelected) {
                                labelClass = 'bg-indigo-950/80 text-indigo-300 border-indigo-500/50';
                              }

                              return (
                                <button
                                  key={oIdx}
                                  type="button"
                                  onClick={() => handleQuizSelect(q.id, oIdx)}
                                  className={`w-full text-left px-4 py-2.5 rounded-lg border text-xs transition-all cursor-pointer ${labelClass}`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>

                          {/* Render justification once submitted */}
                          {quizSubmitted && (
                            <div className="mt-3.5 pt-3.5 border-t border-slate-900 text-[11px] leading-relaxed font-mono text-slate-450 space-y-1.5">
                              <span className="font-bold text-slate-350 block">Grader Justification:</span>
                              <p className="text-slate-400 font-sans leading-relaxed">{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Quiz submit controls */}
                    {!quizSubmitted ? (
                      <button
                        onClick={() => setQuizSubmitted(true)}
                        disabled={Object.keys(quizAnswers).length < currentLecture.quiz.length}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-semibold cursor-pointer disabled:bg-slate-900 disabled:text-slate-600 disabled:cursor-not-allowed"
                      >
                        Submit Answers For Grading
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setQuizAnswers({});
                          setQuizSubmitted(false);
                        }}
                        className="w-full bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Reset quiz and retry
                      </button>
                    )}

                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-[500px] space-y-4">
              <Layers size={32} className="text-slate-700 animate-pulse" />
              <div>
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest leading-3">Awaiting Lecture Capture</h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mt-2">
                  Record sessional lecture audio or feed chapter materials on the left panel. Gemini will digitize study tools in this viewport.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
