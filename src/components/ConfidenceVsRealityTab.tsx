import React, { useState } from 'react';
import { KnowledgeMap, ConfidenceTestState } from '../types';
import { SlidersHorizontal, ArrowLeft, ArrowRight, RefreshCw, AlertTriangle, CheckCircle2, TrendingDown, BookOpen } from 'lucide-react';

interface ConfidenceVsRealityTabProps {
  knowledgeMap: KnowledgeMap;
  onUpdateActualMastery: (subject: string, topicId: string, actualMastery: number, confidence: number) => void;
}

export default function ConfidenceVsRealityTab({
  knowledgeMap,
  onUpdateActualMastery
}: ConfidenceVsRealityTabProps) {
  const [selectedSubject, setSelectedSubject] = useState('DBMS');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [ratedConfidence, setRatedConfidence] = useState(8);

  const [testState, setTestState] = useState<ConfidenceTestState | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingEvaluation, setLoadingEvaluation] = useState(false);
  const [tempAnswers, setTempAnswers] = useState<string[]>(['', '', '']);

  const subjects = Object.keys(knowledgeMap);
  const currentTopics = knowledgeMap[selectedSubject]?.topics || [];

  // Initialize selected topic if needed
  React.useEffect(() => {
    if (currentTopics.length > 0 && !selectedTopicId) {
      setSelectedTopicId(currentTopics[0].id);
    }
  }, [selectedSubject, currentTopics, selectedTopicId]);

  const handleStartTest = async () => {
    const topic = currentTopics.find(t => t.id === selectedTopicId);
    if (!topic) return;

    setLoadingQuestions(true);
    setTempAnswers(['', '', '']);

    try {
      const res = await fetch('/api/verify-confidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject,
          topicId: selectedTopicId,
          topicName: topic.name,
          ratedConfidence: ratedConfidence
        })
      });
      const data = await res.json();
      
      setTestState({
        subject: selectedSubject,
        topicId: selectedTopicId,
        topicName: topic.name,
        ratedConfidence: ratedConfidence,
        questions: data.questions || [],
        currentQuestionIndex: 0,
        answers: ['', '', ''],
        isSubmittingAnswers: false
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleAnswerChange = (text: string) => {
    if (!testState) return;
    const idx = testState.currentQuestionIndex;
    const newAnswers = [...tempAnswers];
    newAnswers[idx] = text;
    setTempAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (!testState) return;
    if (testState.currentQuestionIndex < 2) {
      setTestState({
        ...testState,
        currentQuestionIndex: testState.currentQuestionIndex + 1
      });
    }
  };

  const handlePrevQuestion = () => {
    if (!testState) return;
    if (testState.currentQuestionIndex > 0) {
      setTestState({
        ...testState,
        currentQuestionIndex: testState.currentQuestionIndex - 1
      });
    }
  };

  const handleSubmitAnswers = async () => {
    if (!testState) return;
    setLoadingEvaluation(true);

    try {
      const res = await fetch('/api/evaluate-confidence-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: testState.subject,
          topicName: testState.topicName,
          ratedConfidence: testState.ratedConfidence,
          questions: testState.questions,
          answers: tempAnswers
        })
      });
      const data = await res.json();

      setTestState({
        ...testState,
        testResult: {
          actualMastery: data.actualMastery,
          gap: data.gap,
          explanation: data.explanation,
          detailedFeedback: data.detailedFeedback || []
        }
      });

      // Synchronize back to main global context!
      onUpdateActualMastery(testState.subject, testState.topicId, data.actualMastery, testState.ratedConfidence);

    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEvaluation(false);
    }
  };

  const handleReset = () => {
    setTestState(null);
    setTempAnswers(['', '', '']);
  };

  return (
    <div className="space-y-6 font-sans" id="confidence-gap-tab">
      
      {/* If no active audit test is running */}
      {!testState && (
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 space-y-6">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
              <SlidersHorizontal className="text-violet-400" size={20} />
              Confidence vs Reality Diagnostic Audit
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Engineering students often study topics they already 'think' they know, causing fail-rates in hard sessional papers. Test your actual mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Form Selection card */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-1.5 font-semibold">Select Engineering Core</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setSelectedTopicId('');
                  }}
                  className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer font-sans"
                >
                  {subjects.map(sub => (
                    <option key={sub} value={sub}>{sub} Engineering Hub</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-1.5 font-semibold">Choose Topic Node</label>
                <select
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {currentTopics.map(topic => (
                    <option key={topic.id} value={topic.id}>{topic.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-450 mb-1.5">
                  <span className="text-slate-400 font-semibold uppercase tracking-widest">Confidence claimed</span>
                  <span className="text-violet-400 font-bold">{ratedConfidence}/10</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={ratedConfidence}
                        onChange={(e) => setRatedConfidence(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-850 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#C8A15A]"
                      />
                </div>
              </div>

              <button
                id="trigger-confidence-audit"
                onClick={handleStartTest}
                disabled={loadingQuestions}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl text-xs flex justify-center items-center gap-2 cursor-pointer border border-indigo-500/30 transition-all font-sans"
              >
                {loadingQuestions ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} /> Generating progressive questions...
                  </>
                ) : (
                  <>
                    Launch Reality Audit Test
                  </>
                )}
              </button>
            </div>

            {/* Explanatory graphic warning card */}
            <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-900 flex flex-col justify-between">
              <div className="space-y-3.5">
                <span className="text-[10px] font-mono text-rose-450 uppercase tracking-widest bg-rose-950/30 px-2.5 py-1 rounded-md border border-rose-500/20 font-semibold inline-block">
                  Reality warning indicator
                </span>
                <h3 className="text-slate-200 font-display font-semibold text-sm">Eliminate the overconfidence blindspot.</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Students scoring lower on reality audits are often studying comfortable subjects repeatedly. The gap calculation allows your Academic Twin to direct sessional schedule priority to actual lagging components.
                </p>
              </div>
              
              <div className="border-t border-slate-900 pt-3.5 mt-4 flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20">
                  <AlertTriangle size={15} />
                </div>
                <p className="text-[10px] text-slate-500 leading-3.5">
                  Your academic twin updates state nodes strictly based on detailed verbal proofs, not multiple choices. Answer thoroughly!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* If audit test is actively being taken */}
      {testState && !testState.testResult && (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-6">
          <div className="flex justify-between items-start border-b border-slate-900 pb-4">
            <div>
              <span className="text-[10px] font-mono text-violet-400 uppercase tracking-widest">Topic Diagnostics</span>
              <h3 className="font-display font-medium text-slate-200 text-base mt-0.5">
                Auditing: <span className="font-bold text-slate-100">{testState.topicName}</span> ({testState.subject})
              </h3>
            </div>
            <button 
              onClick={handleReset}
              className="text-xs font-mono text-slate-500 hover:text-slate-300"
            >
              [Quit Audit]
            </button>
          </div>

          {/* Test question layout */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-indigo-400 font-semibold uppercase tracking-widest">
                Question {testState.currentQuestionIndex + 1} of 3
              </span>
              <span className="text-slate-500">
                Level: {testState.currentQuestionIndex === 0 ? 'Basic concept' : testState.currentQuestionIndex === 1 ? 'Algorithm Tracing' : 'Edge Cases'}
              </span>
            </div>

            <div className="p-5 bg-slate-900/50 rounded-xl border border-slate-850">
              <p className="text-xs text-slate-250 leading-relaxed font-semibold">
                {testState.questions[testState.currentQuestionIndex]?.question}
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Your answer statement (Be complete & detailed):</label>
              <textarea
                value={tempAnswers[testState.currentQuestionIndex]}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your explanation, formula or architectural solution here... (at least 1-2 descriptive sentences)"
                rows={6}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 leading-relaxed"
              />
            </div>
          </div>

          {/* Navigational progression keys */}
          <div className="flex justify-between items-center border-t border-slate-900 pt-4">
            <button
              onClick={handlePrevQuestion}
              disabled={testState.currentQuestionIndex === 0}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 rounded-lg text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 border border-slate-800 cursor-pointer"
            >
              <ArrowLeft size={12} /> Previous Question
            </button>

            {testState.currentQuestionIndex < 2 ? (
              <button
                onClick={handleNextQuestion}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-800 cursor-pointer"
              >
                Next Question <ArrowRight size={12} />
              </button>
            ) : (
              <button
                id="submit-audit-grade"
                onClick={handleSubmitAnswers}
                disabled={loadingEvaluation || tempAnswers.some(ans => !ans.trim())}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-violet-950/20 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer border border-violet-500/30"
              >
                {loadingEvaluation ? (
                  <>
                    <RefreshCw className="animate-spin" size={12} /> Grader evaluating proof...
                  </>
                ) : (
                  <>
                    Submit Final Proof <CheckCircle2 size={13} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* If audit test results have been graded (reality show-down!) */}
      {testState && testState.testResult && (
        <div className="space-y-6">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-900 pb-4">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-semibold bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/20">Audit completed</span>
                <h3 className="font-display font-medium text-slate-200 text-base mt-2">
                  Reality Check: <span className="font-bold text-slate-100">{testState.topicName}</span>
                </h3>
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-350 hover:text-slate-200 text-xs font-semibold rounded-lg border border-slate-800 cursor-pointer transition-colors"
              >
                Back to Diagnostics
              </button>
            </div>

            {/* Score visual gap showdown animation card */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Vertical bar display graph comparing confidence vs actual */}
              <div className="md:col-span-5 bg-slate-900/40 p-5 rounded-xl border border-slate-850/80 flex flex-col justify-around h-60">
                <div className="space-y-4">
                  {/* Confidence block */}
                  <div>
                    <div className="flex justify-between text-xs font-mono text-slate-400 mb-1 leading-3">
                      <span>Rated Confidence</span>
                      <span className="text-violet-400 font-bold">{testState.ratedConfidence}/10</span>
                    </div>
                    <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-850">
                      <div 
                        className="bg-violet-500 h-full rounded-full shadow-inner transition-all duration-1000"
                        style={{ width: `${testState.ratedConfidence * 10}%` }}
                      />
                    </div>
                  </div>

                  {/* Reality block */}
                  <div>
                    <div className="flex justify-between text-xs font-mono text-slate-400 mb-1 leading-3">
                      <span>Actual Mastery Grade</span>
                      <span className="text-emerald-400 font-bold">{testState.testResult.actualMastery}/10</span>
                    </div>
                    <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-850">
                      <div 
                        className="bg-emerald-500 h-full rounded-full shadow-inner transition-all duration-1000"
                        style={{ width: `${testState.testResult.actualMastery * 10}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Gap rating pill */}
                <div className="mt-4 pt-3.5 border-t border-slate-850 flex justify-between items-center">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold">Gap calculation</span>
                  {testState.testResult.gap > 2 ? (
                    <span className="text-xs bg-rose-950/60 text-rose-400 px-3 py-1 rounded-full border border-rose-500/30 font-semibold animate-pulse flex items-center gap-1">
                      <TrendingDown size={11} /> High Gap: Overconfident (+{testState.testResult.gap})
                    </span>
                  ) : testState.testResult.gap <= 0 ? (
                    <span className="text-xs bg-emerald-950/65 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={11} /> Calibrated Gap ({testState.testResult.gap})
                    </span>
                  ) : (
                    <span className="text-xs bg-amber-950/60 text-amber-400 px-3 py-1 rounded-full border border-amber-500/30 font-semibold flex items-center gap-1">
                      <AlertTriangle size={11} /> Moderate Gap (+{testState.testResult.gap})
                    </span>
                  )}
                </div>
              </div>

              {/* Gemini Evaluation details text */}
              <div className="md:col-span-7 space-y-3">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Academic Twin Evaluation Diagnostic</span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/30 p-4 rounded-xl border border-slate-900">
                  {testState.testResult.explanation}
                </p>
              </div>

            </div>
          </div>

          {/* Question breakdown feedback cards */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <BookOpen size={13} className="text-indigo-400" /> Line Grader Feedback
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {testState.testResult.detailedFeedback.map((fb, idx) => (
                <div key={idx} className="bg-slate-900/35 p-4.5 rounded-xl border border-slate-850/60 space-y-2">
                  <span className="text-[9px] font-mono text-indigo-400 font-semibold uppercase tracking-wider block">Question 0{idx + 1} Assessment</span>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono">
                    {fb}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
