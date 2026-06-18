import React, { useState, useRef, useEffect } from 'react';
import { VivaState, VivaMessage } from '../types';
import { Mic, Send, RefreshCw, Award, MessageCircle, Volume2, UserCheck, AlertCircle, FileSpreadsheet } from 'lucide-react';

interface VivaTabProps {
  onVivaCompleted: (subject: string, clarity: number) => void;
}

export default function VivaTab({ onVivaCompleted }: VivaTabProps) {
  const [subject, setSubject] = useState('DBMS');
  const [vivaState, setVivaState] = useState<VivaState | null>(null);
  const [loading, setLoading] = useState(false);
  const [studentInput, setStudentInput] = useState('');
  const [isDictating, setIsDictating] = useState(false);
  const [dictationTicks, setDictationTicks] = useState(0);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [vivaState?.messages, loading]);

  const handleStartViva = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/viva-next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject,
          messages: [],
          currentCount: 0,
          answer: ''
        })
      });
      const data = await res.json();
      
      const firstMsg: VivaMessage = {
        sender: 'examiner',
        text: data.examinerText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setVivaState({
        subject: subject,
        status: 'questioning',
        messages: [firstMsg],
        currentQuestionCount: 1,
        maxQuestions: 4
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!vivaState || (!studentInput.trim() && !isDictating)) return;

    let textToSend = studentInput.trim();
    if (isDictating) {
      // If mic dictation simulation was active, auto-resolve simulation text
      const simulatedDictations: { [key: string]: string[] } = {
        DBMS: [
          "Normalization is used to remove transactional errors and duplicate cells. 1NF forces single atomic values, 2NF prevents partial relationships, and then BCNF solves the transitive problems.",
          "2-Phase Locking holds locks during growth and then releases during shrinking. But yes, can lead to cascading aborts if lock transactions are not strict.",
          "We use a clustered index because table sorting physically orders on the disk, making range checks extremely fast, though write is expensive."
        ],
        OS: [
          "Deadlocks happen with mutual lock holds. Banker's calculates safety zones tracking available blocks vs future claims before letting threads secure. It is effective but has memory overhead.",
          "Paging splits code into fixed frames. Translation is done via Page Tables. If code isn't in physical frame, TLB signals page fault and LRU sweeps memory."
        ]
      };
      const list = simulatedDictations[subject] || simulatedDictations["DBMS"];
      const randText = list[Math.floor(Math.random() * list.length)];
      textToSend = textToSend || randText;
      setIsDictating(false);
    }

    const studentMsg: VivaMessage = {
      sender: 'student',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...vivaState.messages, studentMsg];
    const prevCount = vivaState.currentQuestionCount;

    setVivaState({
      ...vivaState,
      messages: updatedMessages
    });
    setStudentInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/viva-next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: vivaState.subject,
          messages: updatedMessages,
          currentCount: prevCount,
          answer: textToSend
        })
      });
      const data = await res.json();

      const examinerMsg: VivaMessage = {
        sender: 'examiner',
        text: data.examinerText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        scoreFeedback: data.realtimeScoreFeedback
      };

      if (data.concluded) {
        setVivaState({
          ...vivaState,
          status: 'completed',
          messages: [...updatedMessages, examinerMsg],
          score: {
            conceptualClarity: data.score?.conceptualClarity || 7,
            communication: data.score?.communication || 8,
            confidence: data.score?.confidence || 6,
            overallRating: data.score?.overallRating || 'Proficient',
            examinerRemarks: data.score?.examinerRemarks || 'Completed sessional viva.'
          }
        });

        // Submit results to update global context!
        onVivaCompleted(vivaState.subject, data.score?.conceptualClarity || 7);
      } else {
        setVivaState({
          ...vivaState,
          messages: [...updatedMessages, examinerMsg],
          currentQuestionCount: prevCount + 1
        });
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Dictation frequency bar waves simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isDictating) {
      timer = setInterval(() => {
        setDictationTicks(t => t + 1);
        if (dictationTicks > 24) {
          handleSendMessage();
        }
      }, 150);
    }
    return () => clearInterval(timer);
  }, [isDictating, dictationTicks]);

  const handleStartDictation = () => {
    setIsDictating(true);
    setDictationTicks(0);
  };

  const handleEndVivaSession = () => {
    setVivaState(null);
  };

  return (
    <div className="space-y-6 font-sans" id="auto-viva-tab">
      
      {/* Starting Setup panel if idle */}
      {!vivaState && (
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 space-y-6 flex flex-col md:flex-row gap-6 max-w-4xl">
          
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
                <Mic className="text-indigo-400" size={20} />
                External Auto-Viva Board
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Prepare for engineering oral sessional exams! Face a virtual external professor who gauges your definitions on the fly.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5 font-semibold">Inquisition Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="DBMS">Database Management Systems (DBMS)</option>
                  <option value="OS">Operating Systems Core (OS)</option>
                  <option value="CN">Computer Networks (CN)</option>
                </select>
              </div>

              <button
                id="start-viva-board"
                onClick={handleStartViva}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl text-xs flex justify-center items-center gap-2 cursor-pointer transition-colors shadow-lg shadow-indigo-950/20 border border-indigo-500/20"
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} /> Summoning Examiner...
                  </>
                ) : (
                  <>
                    Inaugurate Oral Viva Session
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Guidelines info */}
          <div className="w-full md:w-80 bg-slate-950 p-5 rounded-xl border border-slate-900 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Inquisition Criteria</span>
              <p className="text-xs text-slate-450 leading-relaxed font-sans">
                You will be asked 4 targeted technical prompts of progressive complexity. You can answer using sessional typed proofs or simulated voice dictated inputs. At the conclusion, an authenticated score sheet is issued.
              </p>
            </div>

            <div className="border-t border-slate-900 pt-3 flex items-center gap-2 text-[10px] font-mono text-indigo-400">
              <Volume2 size={14} /> Built using Gemini Audio-Grade models.
            </div>
          </div>

        </div>
      )}

      {/* active Viva question messaging panel */}
      {vivaState && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Chat dialog viewport */}
          <div className="lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 p-5 flex flex-col min-h-[500px] h-[580px] justify-between relative overflow-hidden">
            
            {/* Header progress line */}
            <div className="flex justify-between items-center border-b border-slate-900 pb-3 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-mono text-slate-450 uppercase tracking-wider font-semibold">
                  Exam Session Active • {vivaState.subject}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 font-semibold uppercase tracking-wider">
                Question {vivaState.status === 'completed' ? 'Done' : `${vivaState.currentQuestionCount} of ${vivaState.maxQuestions}`}
              </span>
            </div>

            {/* Dialog space scrollbar */}
            <div className="flex-1 overflow-y-auto space-y-4 my-4 pr-1 scroll-smooth">
              {vivaState.messages.map((msg, idx) => {
                const isExaminer = msg.sender === 'examiner';
                return (
                  <div key={idx} className={`flex gap-3.5 ${isExaminer ? 'justify-start' : 'justify-end'}`}>
                    
                    {/* Abstract avatar column */}
                    {isExaminer && (
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-indigo-400 border border-slate-850 flex items-center justify-center font-mono text-[10px] shrink-0 font-bold">
                        EX
                      </div>
                    )}

                    <div className="space-y-1 max-w-[85%]">
                      <div className={`p-4.5 rounded-xl text-xs leading-relaxed font-sans ${
                        isExaminer 
                          ? 'bg-slate-900/60 border border-slate-900 text-slate-200' 
                          : 'bg-indigo-650 bg-indigo-600 border border-indigo-550/40 text-white font-medium'
                      }`}>
                        {msg.text}
                      </div>
                      
                      {/* Subtitle/Grade notes */}
                      <div className="flex justify-between items-center px-1 text-[9px] font-mono text-slate-500">
                        <span>{msg.timestamp}</span>
                        {msg.scoreFeedback && (
                          <span className="text-amber-500/80 font-bold flex items-center gap-1">
                            <AlertCircle size={8} /> Counselor: {msg.scoreFeedback}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex gap-2 items-center text-xs font-mono text-indigo-400 pl-11">
                  <RefreshCw className="animate-spin" size={11} /> Examiner is critically evaluating your proof...
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input keyboard/mic system */}
            {vivaState.status !== 'completed' && (
              <div className="border-t border-slate-900 pt-3 relative z-10 flex gap-3">
                <input
                  type="text"
                  value={studentInput}
                  onChange={(e) => setStudentInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                  placeholder={isDictating ? 'Simulated Microphone dictating... Listening' : 'Type your precise sessional defense here...'}
                  disabled={loading || isDictating}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-60"
                />

                {/* Simulated dictation microphone key */}
                <button
                  onClick={isDictating ? handleSendMessage : handleStartDictation}
                  disabled={loading}
                  className={`px-3 flex items-center justify-center rounded-xl border transition-all cursor-pointer ${
                    isDictating 
                      ? 'bg-red-950 border-red-500/40 text-red-400 hover:bg-red-900 shadow-inner ring-1 ring-red-500/30' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-indigo-400'
                  }`}
                >
                  <Mic size={16} className={isDictating ? 'animate-pulse' : ''} />
                </button>

                <button
                  id="viva-send-message"
                  onClick={handleSendMessage}
                  disabled={loading || (!studentInput.trim() && !isDictating)}
                  className="bg-slate-100 hover:bg-white text-slate-950 rounded-xl px-4 flex items-center justify-center cursor-pointer transition-colors disabled:bg-slate-900 disabled:text-slate-600 disabled:cursor-not-allowed"
                >
                  <Send size={14} />
                </button>
              </div>
            )}

            {/* Dictating soundwave display overlay */}
            {isDictating && (
              <div className="absolute inset-x-0 bottom-16 bg-slate-950/95 border-y border-red-950/40 py-3.5 px-6 flex items-center justify-between z-20">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-mono text-slate-300 font-bold">Simulated Dictation Recording...</span>
                </div>
                {/* Visual equalizer lines */}
                <div className="flex gap-1.5 items-end h-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="bg-red-500 w-1 rounded transition-all duration-150" 
                      style={{ 
                        height: `${Math.floor(Math.random() * 20) + 4}px`,
                        animation: 'pulse 1s infinite',
                        animationDelay: `${i * 0.1}s`
                      }} 
                    />
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* University authenticated report sheet sidebar */}
          <div className="lg:col-span-4 flex flex-col justify-between bg-slate-900/10 border border-slate-800 p-6 rounded-2xl">
            {vivaState.status === 'completed' && vivaState.score ? (
              <div className="space-y-6 flex flex-col h-full justify-between">
                
                {/* Top university header */}
                <div className="space-y-4">
                  <div className="text-center pb-4 border-b border-slate-900">
                    <Award className="text-amber-500 mx-auto" size={32} />
                    <h3 className="font-display font-bold text-slate-100 text-sm mt-2 uppercase tracking-wider">Official Sessional Report</h3>
                    <p className="text-[9px] font-mono text-slate-500">Board exam viva simulator pass cert</p>
                  </div>

                  {/* Criteria scores */}
                  <div className="space-y-3.5">
                    
                    {/* Clarity */}
                    <div>
                      <div className="flex justify-between text-xs font-mono text-slate-450 mb-1 leading-3">
                        <span>Conceptual Clarity</span>
                        <span className="text-slate-200 font-bold">{vivaState.score.conceptualClarity}/10</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${vivaState.score.conceptualClarity * 10}%` }} />
                      </div>
                    </div>

                    {/* Communication */}
                    <div>
                      <div className="flex justify-between text-xs font-mono text-slate-450 mb-1 leading-3">
                        <span>Communication Level</span>
                        <span className="text-slate-200 font-bold">{vivaState.score.communication}/10</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                        <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${vivaState.score.communication * 10}%` }} />
                      </div>
                    </div>

                    {/* Confidence */}
                    <div>
                      <div className="flex justify-between text-xs font-mono text-slate-450 mb-1 leading-3">
                        <span>Delivery Confidence</span>
                        <span className="text-slate-200 font-bold">{vivaState.score.confidence}/10</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${vivaState.score.confidence * 10}%` }} />
                      </div>
                    </div>

                  </div>

                  {/* Rating stamp */}
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 text-center">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Evaluator summary stamp</span>
                    <span className="text-xs font-semibold font-display text-indigo-400 block mt-1">
                      {vivaState.score.overallRating}
                    </span>
                  </div>

                  {/* Remarks */}
                  <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-900">
                    <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                      {vivaState.score.examinerRemarks}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleEndVivaSession}
                  className="w-full bg-slate-100 hover:bg-white text-slate-950 rounded-xl text-xs font-semibold py-2.5 flex justify-center items-center gap-1.5 cursor-pointer mt-4"
                >
                  Close Oral Examination <FileSpreadsheet size={13} />
                </button>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full space-y-4">
                <MessageCircle size={28} className="text-slate-600 animate-pulse" />
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Inquisition Panel</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans mt-1">
                    Examiner details, real-time grading, and performance evaluation metrics populate inside this cert sheet once session triggers or wraps up.
                  </p>
                </div>
                
                <div className="bg-slate-950 border border-slate-900/60 p-4.5 rounded-xl w-full text-left space-y-2 mt-4 text-[10px] font-mono text-slate-500 leading-4">
                  <div className="flex items-center gap-2"><UserCheck size={11} className="text-indigo-400" /> State: Active Session tracking</div>
                  <div className="flex items-center gap-2"><Volume2 size={11} className="text-indigo-400" /> Sound: Little-endian 16kHz rate proxy</div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
