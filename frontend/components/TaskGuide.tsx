'use client';

import React, { useState, useEffect } from 'react';
import SameSiteDemo from './SameSiteDemo';
import TaskAnimation from './TaskAnimation';

interface Question {
  id: string;
  text: string;
  placeholder?: string;
  xp: number;
  options?: string[];
  answer?: string;
}

interface Task {
  id: string;
  number: number;
  title: string;
  category: string;
  xp: number;
  description: string;
  content: string;
  questions: Question[];
  hints: string[];
  hasFlag: boolean;
  aiQuestion?: string | null;
  aiEvaluationFeedback?: string | null;
}

interface TaskGuideProps {
  currentTask: Task | null;
  session: {
    score: number;
    tasks: Record<string, {
      completed: boolean;
      answersCorrect: string[];
      flagEarned: boolean;
    }>;
  } | null;
  onAnswer: (taskId: string, questionId: string, answer: string) => Promise<boolean>;
  onSubmitFlag: (taskId: string, flag: string) => Promise<boolean>;
  onCompleteTask: (taskId: string) => Promise<void>;
  switchToTab: (tab: 'guide' | 'staffhub' | 'workshop') => void;
  onGenerateAIQuestion: (taskId: string, regenerate?: boolean) => Promise<void>;
  onEvaluateAIAnswer: (taskId: string, answer: string) => Promise<void>;
}

export default function TaskGuide({
  currentTask,
  session,
  onAnswer,
  onSubmitFlag,
  onCompleteTask,
  switchToTab,
  onGenerateAIQuestion,
  onEvaluateAIAnswer
}: TaskGuideProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagInput, setFlagInput] = useState('');
  const [loadingQuestion, setLoadingQuestion] = useState<Record<string, boolean>>({});
  const [loadingFlag, setLoadingFlag] = useState(false);
  const [shakingQuestion, setShakingQuestion] = useState<Record<string, boolean>>({});
  const [shakingFlag, setShakingFlag] = useState(false);
  const [errorMsg, setErrorMsg] = useState<Record<string, string>>({});
  const [flagErrorMsg, setFlagErrorMsg] = useState('');
  const [failedAttempts, setFailedAttempts] = useState<Record<string, string[]>>({});
  const [showAnimation, setShowAnimation] = useState(true);

  // AI States
  const [aiAnswerInput, setAiAnswerInput] = useState('');
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [isEvaluatingAnswer, setIsEvaluatingAnswer] = useState(false);

  // Reset local state when task changes and auto-show animation popup
  useEffect(() => {
    setAnswers({});
    setFailedAttempts({});
    setErrorMsg({});
    setFlagInput('');
    setFlagErrorMsg('');
    setAiAnswerInput('');
    setShowAnimation(true);
  }, [currentTask.id]);

  // Auto-generate AI question when task9 becomes active
  useEffect(() => {
    if (!currentTask || !session) return;
    const taskState = session.tasks[currentTask.id];
    if (
      currentTask.id === 'task9' &&
      !currentTask.aiQuestion &&
      !taskState?.completed &&
      !isGeneratingQuestion
    ) {
      setIsGeneratingQuestion(true);
      onGenerateAIQuestion(currentTask.id).finally(() => setIsGeneratingQuestion(false));
    }
  }, [currentTask?.id, currentTask?.aiQuestion, session]);

  if (!currentTask || !session) {
    return (
      <div className="flex items-center justify-center h-96 text-[#8b949e] font-sans">
        Select a task to view the guide.
      </div>
    );
  }

  const taskState = session.tasks[currentTask.id];
  const isCompleted = taskState?.completed;
  const answersCorrect = taskState?.answersCorrect || [];
  const flagEarned = taskState?.flagEarned || false;

  const handleOptionClick = async (questionId: string, option: string) => {
    if (loadingQuestion[questionId] || answersCorrect.includes(questionId)) return;

    setAnswers(prev => ({ ...prev, [questionId]: option }));
    setLoadingQuestion(prev => ({ ...prev, [questionId]: true }));
    setErrorMsg(prev => ({ ...prev, [questionId]: '' }));

    try {
      const correct = await onAnswer(currentTask.id, questionId, option);
      if (!correct) {
        setShakingQuestion(prev => ({ ...prev, [questionId]: true }));
        setFailedAttempts(prev => ({
          ...prev,
          [questionId]: [...(prev[questionId] || []), option]
        }));
        setErrorMsg(prev => ({ ...prev, [questionId]: 'Incorrect choice. Try another option!' }));
        setTimeout(() => {
          setShakingQuestion(prev => ({ ...prev, [questionId]: false }));
        }, 600);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(prev => ({ ...prev, [questionId]: 'Failed to check answer.' }));
    } finally {
      setLoadingQuestion(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const handleAnswerSubmit = async (questionId: string) => {
    const inputVal = answers[questionId]?.trim() || '';
    if (!inputVal) return;

    setLoadingQuestion(prev => ({ ...prev, [questionId]: true }));
    setErrorMsg(prev => ({ ...prev, [questionId]: '' }));

    try {
      const correct = await onAnswer(currentTask.id, questionId, inputVal);
      if (!correct) {
        setShakingQuestion(prev => ({ ...prev, [questionId]: true }));
        setErrorMsg(prev => ({ ...prev, [questionId]: 'Incorrect answer. Please check carefully.' }));
        setTimeout(() => {
          setShakingQuestion(prev => ({ ...prev, [questionId]: false }));
        }, 600);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(prev => ({ ...prev, [questionId]: 'Failed to check answer.' }));
    } finally {
      setLoadingQuestion(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagInput.trim()) return;

    setLoadingFlag(true);
    setFlagErrorMsg('');

    try {
      const correct = await onSubmitFlag(currentTask.id, flagInput.trim());
      if (!correct) {
        setShakingFlag(true);
        setFlagErrorMsg('Incorrect flag structure or value.');
        setTimeout(() => {
          setShakingFlag(false);
        }, 600);
      } else {
        setFlagInput('');
      }
    } catch (err) {
      console.error(err);
      setFlagErrorMsg('Failed to submit flag.');
    } finally {
      setLoadingFlag(false);
    }
  };

  // Get color for category badges
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Setup': return 'bg-[#1f2937] text-[#58a6ff] border-[#38bdf8]/30';
      case 'Theory': return 'bg-[#1e1b4b] text-[#bc8cff] border-[#bc8cff]/30';
      case 'Recon': return 'bg-[#0f2e3a] text-[#38bdf8] border-[#38bdf8]/30';
      case 'Exploit': return 'bg-[#3b1517] text-[#f85149] border-[#f85149]/30';
      case 'Defense': return 'bg-[#064e3b] text-[#00d4aa] border-[#00d4aa]/30';
      case 'Summary': return 'bg-[#4c1d95] text-[#d29922] border-[#d29922]/30';
      default: return 'bg-[#21262d] text-[#8b949e] border-[#30363d]';
    }
  };

  const questionsCount = currentTask.questions.length;
  const questionsCompleted = currentTask.questions.filter(q => answersCorrect.includes(q.id)).length;
  const progressRatio = questionsCount > 0 ? (questionsCompleted / questionsCount) : 0;

  return (
    <div className="flex flex-col gap-6 p-6 font-sans text-[#e6edf3]">
      
      {/* Header Info */}
      <div className="border-b border-[#30363d] pb-5">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded bg-[#21262d] text-[#8b949e] border border-[#30363d]">
            Task {currentTask.number}
          </span>
          <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded border ${getCategoryBadgeClass(currentTask.category)}`}>
            {currentTask.category}
          </span>
          <span className="text-xs text-[#8b949e] ml-auto">
            🏁 Available XP: <strong className="text-[#00d4aa]">{currentTask.xp} XP</strong>
          </span>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
          {currentTask.title}
        </h2>
        <p className="text-sm text-[#8b949e] mt-1">{currentTask.description}</p>

        {/* Task Progress Bar (only if there are questions) */}
        {questionsCount > 0 && (
          <div className="mt-4 flex items-center gap-4 bg-[#161b22] border border-[#30363d] rounded-xl p-3">
            <div className="flex-1">
              <div className="flex justify-between text-xs font-semibold text-[#8b949e] mb-1">
                <span>Questions Completed</span>
                <span className="text-white">{questionsCompleted} / {questionsCount}</span>
              </div>
              <div className="w-full bg-[#21262d] rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-[#00d4aa] h-2 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${progressRatio * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Concept Walkthrough Animation — Popup Modal */}
      <TaskAnimation
        taskId={currentTask.id}
        isOpen={showAnimation}
        onClose={() => setShowAnimation(false)}
      />

      {/* HTML Description Content */}
      <div className="prose prose-invert max-w-none text-[#e6edf3] text-sm leading-relaxed space-y-4">
        {/* Compact button to reopen animation popup */}
        <button
          onClick={() => setShowAnimation(true)}
          className="inline-flex items-center gap-1.5 text-[11px] text-[#58a6ff] hover:text-white bg-transparent border-none cursor-pointer transition duration-150 font-medium p-0 mb-1 opacity-80 hover:opacity-100"
        >
          🎬 <span className="underline underline-offset-2">View Explanation</span>
        </button>
        <div dangerouslySetInnerHTML={{ __html: currentTask.content }} />
      </div>

      {/* Task 8 Custom SameSite Demo */}
      {currentTask.id === 'task8' && (
        <SameSiteDemo 
          completed={isCompleted} 
          onComplete={() => onCompleteTask('task8')} 
        />
      )}

      {/* Quick Actions for Practical Tasks */}
      {['task4', 'task5', 'task6', 'task7'].includes(currentTask.id) && (
        <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8b949e]">Lab Tools Available</h4>
            <p className="text-[11px] text-[#6e7681]">Use these environments to complete the task activities.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => switchToTab('staffhub')}
              className="bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] text-white font-semibold text-xs px-3.5 py-2 rounded-lg cursor-pointer transition flex items-center gap-1.5"
            >
              🌐 Open StaffHub
            </button>
            {['task5', 'task6', 'task7'].includes(currentTask.id) && (
              <button
                onClick={() => switchToTab('workshop')}
                className="bg-[#3b1517] hover:bg-[#5c1c1f] text-[#f85149] border border-[#f85149]/40 font-semibold text-xs px-3.5 py-2 rounded-lg cursor-pointer transition flex items-center gap-1.5"
              >
                ⚔️ Open Attack Workshop
              </button>
            )}
          </div>
        </div>
      )}

      {/* Questions Section */}
      {currentTask.questions.length > 0 && (
        <div className="mt-4 border-t border-[#30363d] pt-6">
          <h3 className="text-base font-black text-white mb-4">Task Q&A</h3>
          
          <div className="flex flex-col gap-4">
            {currentTask.questions.map(q => {
              const answered = answersCorrect.includes(q.id);
              const isShaking = shakingQuestion[q.id];

              return (
                <div 
                  key={q.id}
                  className={`bg-[#161b22] border rounded-xl p-4 transition-all duration-300 ${
                    answered 
                      ? 'border-[#00d4aa]/50 bg-[#1e3a2b]/10' 
                      : isShaking 
                        ? 'border-[#f85149] animate-shake' 
                        : 'border-[#30363d]'
                  }`}
                >
                  <label className="block text-xs font-bold text-white mb-2 leading-relaxed">
                    {q.text}
                  </label>
                  
                  {q.options && q.options.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                      {q.options.map(option => {
                        const isCorrect = answered && (q.answer === option || (answers[q.id] === option && answersCorrect.includes(q.id)));
                        const isFailed = failedAttempts[q.id]?.includes(option) && !answered;
                        const isPending = loadingQuestion[q.id] && answers[q.id] === option;

                        let btnClass = "w-full text-xs font-semibold p-3.5 rounded-xl border text-left transition duration-200 flex items-center justify-between ";

                        if (isCorrect) {
                          btnClass += "bg-[#1e3a2b]/30 border-[#00d4aa] text-[#00d4aa] shadow-[0_0_10px_rgba(0,212,170,0.1)] cursor-not-allowed";
                        } else if (isFailed) {
                          btnClass += "bg-red-950/20 border-[#f85149]/40 text-[#f85149]/80 cursor-not-allowed";
                        } else if (isPending) {
                          btnClass += "bg-[#161b22] border-[#8b949e] text-white animate-pulse cursor-wait";
                        } else if (answered) {
                          // Other options when already answered
                          btnClass += "bg-[#0d1117]/30 border-[#21262d]/50 text-[#8b949e]/50 cursor-not-allowed";
                        } else {
                          // Normal state
                          btnClass += "bg-[#0d1117] border-[#30363d] text-[#e6edf3] hover:border-[#8b949e] hover:bg-[#161b22]/80 cursor-pointer";
                        }

                        return (
                          <button
                            key={option}
                            type="button"
                            disabled={answered || isFailed || isPending}
                            onClick={() => handleOptionClick(q.id, option)}
                            className={btnClass}
                          >
                            <span className="truncate pr-2">{option}</span>
                            {isCorrect && <span className="text-[#00d4aa] text-sm font-bold shrink-0">✓</span>}
                            {isFailed && <span className="text-[#f85149] text-xs font-bold shrink-0">✕</span>}
                            {isPending && (
                              <svg className="animate-spin h-3.5 w-3.5 text-[#8b949e] shrink-0" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        disabled={answered}
                        placeholder={q.placeholder || 'Answer...'}
                        value={answered ? 'Correct Answered' : (answers[q.id] || '')}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleAnswerSubmit(q.id)}
                        className={`flex-1 bg-[#0d1117] border-[#30363d] rounded-lg px-3 py-2 text-xs outline-none transition ${
                          answered 
                            ? 'text-[#00d4aa] border-[#00d4aa]/30 font-semibold bg-[#0d1117]/50 cursor-not-allowed' 
                            : 'text-white focus:border-[#00d4aa]'
                        }`}
                      />
                      
                      {!answered && (
                        <button
                          onClick={() => handleAnswerSubmit(q.id)}
                          disabled={loadingQuestion[q.id]}
                          className="bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] hover:border-[#8b949e] disabled:bg-[#0d1117] text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer transition transition-all duration-150 flex items-center gap-1.5 shrink-0"
                        >
                          {loadingQuestion[q.id] ? 'Checking...' : 'Check Answer'}
                        </button>
                      )}
                    </div>
                  )}

                  {errorMsg[q.id] && (
                    <span className="text-xs text-[#f85149] mt-2 block font-medium">
                      ⚠️ {errorMsg[q.id]}
                    </span>
                  )}
                  {answered && (
                    <span className="text-xs text-[#00d4aa] mt-2 block font-semibold flex items-center gap-1">
                      ✓ Answer verified. (+{q.xp} XP)
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Flag Capture Section */}
      {currentTask.hasFlag && (
        <div className="mt-4 border-t border-[#30363d] pt-6">
          <div className={`bg-[#161b22] border rounded-xl p-5 ${
            flagEarned 
              ? 'border-[#00d4aa]/50 bg-[#1e3a2b]/10' 
              : shakingFlag 
                ? 'border-[#f85149] animate-shake' 
                : 'border-[#30363d]'
          }`}>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="text-xl">🏴</span>
              <div>
                <h3 className="text-sm font-bold text-white">Capture the Flag</h3>
                <p className="text-[11px] text-[#8b949e] mt-0.5">
                  Complete the hands-on exploit in the <strong>Workshop</strong> to obtain the flag value.
                </p>
              </div>
            </div>

            {flagEarned ? (
              <div className="bg-[#0d1117] border border-[#00d4aa]/30 rounded-lg p-3 text-xs font-semibold text-[#00d4aa] flex items-center justify-between">
                <span>✓ Flag Captured Successfully!</span>
                <span className="bg-[#1e3a2b] px-2.5 py-1 rounded text-[10px] border border-[#00d4aa]/40">
                  +{currentTask.flagXp || 100} XP
                </span>
              </div>
            ) : (
              <form onSubmit={handleFlagSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Format: THM{...}"
                  value={flagInput}
                  onChange={(e) => setFlagInput(e.target.value)}
                  className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-white focus:border-[#f85149] outline-none transition"
                />
                <button
                  type="submit"
                  disabled={loadingFlag}
                  className="bg-[#3b1517] hover:bg-[#5c1c1f] text-[#f85149] border border-[#f85149]/40 font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition flex items-center shrink-0"
                >
                  {loadingFlag ? 'Submitting...' : 'Submit Flag'}
                </button>
              </form>
            )}

            {flagErrorMsg && (
              <span className="text-xs text-[#f85149] mt-2 block font-medium">
                ❌ {flagErrorMsg}
              </span>
            )}
          </div>
        </div>
      )}

      {/* AI Explanation / Evaluation Form (specifically for Task 9) */}
      {currentTask.id === 'task9' && (
        <div className="mt-4 border-t border-[#30363d] pt-6 space-y-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="text-xl">🤖</span>
              <div>
                <h3 className="text-sm font-bold text-white">AI Conceptual Verification</h3>
                <p className="text-[11px] text-[#8b949e] mt-0.5">
                  Answer the descriptive question below to complete this room.
                </p>
              </div>
            </div>

            {isGeneratingQuestion ? (
              <div className="flex items-center justify-center py-6 gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#00d4aa] border-t-transparent" />
                <span className="text-xs text-[#8b949e] font-mono animate-pulse">// INITIALIZING AI TARGET CHALLENGE...</span>
              </div>
            ) : currentTask.aiQuestion ? (
              <div className="space-y-3">
                <div className="p-3 bg-[#0d1117] border border-[#00d4aa]/25 rounded text-left relative overflow-hidden">
                  <div className="text-[8.5px] font-mono text-[#00d4aa] font-bold tracking-wider uppercase flex items-center gap-1.5 mb-1.5">
                    <span className="h-1.5 w-1.5 bg-[#00d4aa] rounded-full animate-ping" />
                    <span>// SECURE TRAINING TASK DETECTED</span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#e6edf3] font-mono whitespace-pre-wrap">{currentTask.aiQuestion}</p>
                </div>

                {isCompleted ? (
                  <div className="p-3 border border-[#00d4aa]/30 bg-[#1e3a2b]/10 rounded space-y-2.5">
                    <div className="text-[10px] font-mono text-[#00d4aa] font-bold tracking-widest flex items-center gap-1.5">
                      <span>✓ CHALLENGE COMPLETE</span>
                    </div>
                    {currentTask.aiEvaluationFeedback && (
                      <div className="p-2.5 rounded bg-[#0d1117] border border-[#00d4aa]/20 text-left text-[10px] font-mono leading-relaxed text-[#8b949e] space-y-1">
                        <span className="text-[#00d4aa] font-bold">// AI GRADE REPORT:</span>
                        <p className="whitespace-pre-wrap">{currentTask.aiEvaluationFeedback}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const answer = aiAnswerInput.trim();
                      if (!answer || isEvaluatingAnswer) return;
                      setIsEvaluatingAnswer(true);
                      try {
                        await onEvaluateAIAnswer(currentTask.id, answer);
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setIsEvaluatingAnswer(false);
                      }
                    }}
                    className="space-y-2"
                  >
                    <textarea
                      value={aiAnswerInput}
                      onChange={(e) => setAiAnswerInput(e.target.value)}
                      placeholder="Type your explanation here (explain browser automatic cookie transmission, Lax vs Strict SameSite policies, and why anti-CSRF tokens protect state-changing requests)..."
                      className="w-full h-24 p-2.5 rounded bg-[#0d1117] border border-[#30363d] focus:outline-none focus:border-[#00d4aa] text-xs text-white placeholder-[#8b949e]/40 leading-relaxed resize-none transition"
                      disabled={isEvaluatingAnswer}
                    />
                    <div className="flex justify-between items-center text-[9px] font-mono tracking-wider px-0.5 text-[#8b949e]">
                      {aiAnswerInput.trim().length < 25 ? (
                        <span className="text-[#d29922]">// MINIMUM 25 CHARACTERS REQUIRED TO SUBMIT</span>
                      ) : (
                        <span className="text-[#00d4aa]">// VALID LENGTH DETECTED - READY TO TRANSMIT</span>
                      )}
                      <span>{aiAnswerInput.trim().length} / 25 chars</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-grow bg-[#00d4aa] hover:bg-[#00bda0] text-[#0d1117] font-black text-xs px-4 py-2 rounded-lg cursor-pointer transition disabled:opacity-40"
                        disabled={isEvaluatingAnswer || aiAnswerInput.trim().length < 25}
                      >
                        {isEvaluatingAnswer ? 'Evaluating...' : 'Submit Explanation'}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          setIsGeneratingQuestion(true);
                          try {
                            await onGenerateAIQuestion(currentTask.id, true);
                          } catch (err) {
                            console.error(err);
                          } finally {
                            setIsGeneratingQuestion(false);
                          }
                        }}
                        className="border border-[#30363d] hover:border-[#8b949e] text-[#8b949e] hover:text-white px-3 py-2 rounded-lg text-xs cursor-pointer transition font-bold"
                        disabled={isEvaluatingAnswer}
                      >
                        Regen
                      </button>
                    </div>
                  </form>
                )}

                {!isCompleted && currentTask.aiEvaluationFeedback && (
                  <div className="p-3 border border-[#f85149]/30 bg-red-950/10 rounded space-y-2">
                    <span className="text-[10px] font-mono text-[#f85149] font-bold tracking-widest block">// EVALUATION RESPONSE (FAILED)</span>
                    <p className="text-[10px] font-mono leading-relaxed text-[#8b949e] whitespace-pre-wrap">{currentTask.aiEvaluationFeedback}</p>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  setIsGeneratingQuestion(true);
                  try {
                    await onGenerateAIQuestion(currentTask.id);
                  } catch (err) {
                    console.error(err);
                  } finally {
                    setIsGeneratingQuestion(false);
                  }
                }}
                className="w-full bg-[#00d4aa] hover:bg-[#00bda0] text-[#0d1117] font-black text-xs px-4 py-2 rounded-lg cursor-pointer transition"
              >
                INITIALIZE AI CHALLENGE
              </button>
            )}
          </div>
        </div>
      )}

      {/* Manual Task Completion Action (Tasks with no Q&A/Flag like Intro/Conclusion) */}
      {currentTask.id !== 'task9' && !currentTask.hasFlag && currentTask.questions.length === 0 && (
        <div className="mt-4 border-t border-[#30363d] pt-6 flex justify-end">
          {isCompleted ? (
            <div className="bg-[#1e3a2b] border border-[#00d4aa] text-[#00d4aa] text-xs font-bold px-5 py-2.5 rounded-xl">
              ✓ Task Completed
            </div>
          ) : (
            <button
              onClick={() => onCompleteTask(currentTask.id)}
              className="bg-[#00d4aa] hover:bg-[#00bda0] text-[#0d1117] text-xs font-black px-5 py-2.5 rounded-xl cursor-pointer shadow-[0_0_10px_rgba(0,212,170,0.2)] transition duration-150"
            >
              🚀 Complete Task & Continue
            </button>
          )}
        </div>
      )}

      {/* Completed Banner */}
      {isCompleted && (
        <div className="bg-[#1e3a2b]/20 border border-[#00d4aa]/40 rounded-xl p-4 text-center mt-6 flex items-center justify-center gap-2">
          <span className="text-xl">🏆</span>
          <span className="text-xs font-bold text-[#00d4aa]">
            Congratulations! You have completed all requirements for Task {currentTask.number}.
          </span>
        </div>
      )}

    </div>
  );
}
