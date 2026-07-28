'use client';

import React, { useState, useEffect } from 'react';
import StartScreen from './StartScreen';
import ProgressTracker from './ProgressTracker';
import TaskGuide from './TaskGuide';
import StaffHubApp from './StaffHubApp';
import AttackWorkshop from './AttackWorkshop';

interface Task {
  id: string;
  number: number;
  title: string;
  category: string;
  xp: number;
  description: string;
  content: string;
  questions: any[];
  hints: string[];
  hasFlag: boolean;
  flagValue?: string;
  flagXp?: number;
}

export default function CsrfLab() {
  const [token, setToken] = useState<string | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskId, setCurrentTaskId] = useState<string>('task1');
  const [activeView, setActiveView] = useState<'guide' | 'staffhub' | 'workshop'>('guide');
  
  // App Loading states
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  
  // Celebration States
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ taskTitle: string; xp: number; flag?: string } | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Theme support
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // AI Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    {
      role: 'assistant',
      content: "Initialize AI Tutor. I can answer your doubts about Cross-Site Request Forgery (CSRF) concepts, SameSite cookie attributes, and anti-CSRF token defenses. I am guardrailed: I cannot give you direct flags or solve the tasks for you! What can I help you understand?"
    }
  ]);
  const [isChatSending, setIsChatSending] = useState(false);
  const chatEndRef = React.useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = chatInput.trim();
    if (!message || isChatSending) return;

    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', content: message }]);
    setIsChatSending(true);

    try {
      const res = await fetch(`${getBackendUrl()}/api/lab/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          message,
          taskId: currentTaskId,
          history: chatMessages.slice(-10), // Send last 10 messages for context
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to send message');
      }

      const data = await res.json();
      setChatMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ Secure comms error. Failed to connect to AI Tutor.' }
      ]);
    } finally {
      setIsChatSending(false);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (savedTheme === 'light') {
      setTheme('light');
      document.body.classList.add('light');
    } else {
      setTheme('dark');
      document.body.classList.remove('light');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  };

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const getBackendUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  };

  // Sync state with backend
  const syncSession = async (sessionToken: string) => {
    try {
      const res = await fetch(`${getBackendUrl()}/api/lab/session/${sessionToken}`);
      if (res.ok) {
        const data = await res.json();
        setSession(data.session);
        setTasks(data.tasks);
        if (data.session.currentTask) {
          setCurrentTaskId(data.session.currentTask);
        }
      } else {
        // Clear expired session
        setToken(null);
        setSession(null);
        localStorage.removeItem('csrf_lab_token');
      }
    } catch (e) {
      console.error('Failed to sync session with backend', e);
    }
  };

  // Auto-restore session from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('csrf_lab_token');
    if (savedToken) {
      setToken(savedToken);
      syncSession(savedToken).finally(() => setInitializing(false));
    } else {
      setInitializing(false);
    }
  }, []);

  // Periodic Sync
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      syncSession(token);
    }, 20000); // sync every 20 seconds
    return () => clearInterval(interval);
  }, [token]);

  const handleStartLab = async (studentName: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${getBackendUrl()}/api/lab/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setSession(data.session);
        setTasks(data.tasks);
        setCurrentTaskId('task1');
        localStorage.setItem('csrf_lab_token', data.token);
        triggerToast(`Welcome to the CSRF Lab, ${studentName}!`, 'success');
      } else {
        triggerToast('Failed to initialize lab environment.', 'error');
      }
    } catch (err) {
      triggerToast('Connection error starting lab. Check if backend is running.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSelect = async (taskId: string) => {
    if (!token) return;
    
    // Check if task is unlocked
    const taskState = session?.tasks?.[taskId];
    if (!taskState || !taskState.started) {
      triggerToast('Complete previous tasks to unlock this one.', 'error');
      return;
    }

    setCurrentTaskId(taskId);
    setActiveView('guide');

    try {
      const res = await fetch(`${getBackendUrl()}/api/lab/set-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, taskId }),
      });
      if (res.ok) {
        const data = await res.json();
        setSession(data.session);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleAnswerSubmit = async (taskId: string, questionId: string, answer: string): Promise<boolean> => {
    if (!token) return false;

    try {
      const res = await fetch(`${getBackendUrl()}/api/lab/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, taskId, questionId, answer }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.correct) {
          setSession(data.session);
          triggerToast(`Correct! +${data.xpAwarded} XP`, 'success');
          
          // Trigger task completion celebration if task completed
          if (data.session.tasks[taskId]?.completed) {
            const task = tasks.find(t => t.id === taskId);
            setCelebrationData({
              taskTitle: task?.title || '',
              xp: data.xpAwarded,
            });
            setShowCelebration(true);
          }
          return true;
        }
      }
    } catch (e) {
      // ignore
    }
    return false;
  };

  const handleFlagSubmit = async (taskId: string, flag: string): Promise<boolean> => {
    if (!token) return false;

    try {
      const res = await fetch(`${getBackendUrl()}/api/lab/submit-flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, taskId, flag }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.correct) {
          setSession(data.session);
          triggerToast(`Flag verified! +${data.xpAwarded} XP`, 'success');
          
          setCelebrationData({
            taskTitle: tasks.find(t => t.id === taskId)?.title || '',
            xp: data.xpAwarded,
            flag
          });
          setShowCelebration(true);
          return true;
        }
      }
    } catch (e) {
      // ignore
    }
    return false;
  };

  const handleCompleteTask = async (taskId: string) => {
    if (!token) return;

    try {
      const res = await fetch(`${getBackendUrl()}/api/lab/complete-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, taskId }),
      });

      if (res.ok) {
        const data = await res.json();
        setSession(data.session);
        triggerToast(`Task completed! +${data.xpAwarded} XP`, 'success');

        setCelebrationData({
          taskTitle: tasks.find(t => t.id === taskId)?.title || '',
          xp: data.xpAwarded,
        });
        setShowCelebration(true);

        // Auto transition selection to next task if exists
        const currentTask = tasks.find(t => t.id === taskId);
        if (currentTask) {
          const nextTask = tasks.find(t => t.number === currentTask.number + 1);
          if (nextTask) {
            setTimeout(() => {
              handleTaskSelect(nextTask.id);
            }, 3000);
          }
        }
      }
    } catch (e) {
      // ignore
    }
  };

  const handleGenerateAIQuestion = async (taskId: string, regenerate: boolean = false) => {
    if (!token) return;
    try {
      const res = await fetch(`${getBackendUrl()}/api/lab/generate-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, taskId, regenerate }),
      });

      if (!res.ok) {
        const data = await res.json();
        triggerToast(data.error || 'Failed to generate question', 'error');
        return;
      }

      await syncSession(token);
    } catch (err) {
      console.error(err);
      triggerToast('Failed to connect to question generator', 'error');
    }
  };

  const handleEvaluateAIAnswer = async (taskId: string, answer: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${getBackendUrl()}/api/lab/evaluate-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, taskId, answer }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.success) {
          triggerToast('AI Evaluation Passed!', 'success');
          // Trigger celebration
          const task = tasks.find(t => t.id === taskId);
          if (task) {
            setCelebrationData({
              taskTitle: task.title,
              xp: task.xp
            });
            setShowCelebration(true);
          }
        } else {
          triggerToast('AI Evaluation Failed. Check feedback.', 'error');
        }
        await syncSession(token);
      } else {
        triggerToast(data.error || 'Evaluation failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Failed to connect to AI evaluator', 'error');
    }
  };

  const handleRequestHint = async () => {
    if (!token || !currentTaskId) return;
    
    const task = tasks.find(t => t.id === currentTaskId);
    if (!task || task.hints.length === 0) {
      triggerToast('No hints available for this task.', 'info');
      return;
    }

    const currentHintIdx = session?.hintsUsed || 0;
    if (currentHintIdx >= task.hints.length) {
      triggerToast('All hints unlocked for this task.', 'info');
      return;
    }

    const confirmed = window.confirm(`Requesting a hint will cost 10 XP points. Do you want to proceed?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`${getBackendUrl()}/api/lab/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, taskId: currentTaskId }),
      });

      if (res.ok) {
        const data = await res.json();
        setSession(data.session);
        alert(`🔑 Hint #${data.hintIndex + 1}:\n\n${data.hint}`);
      } else {
        const errData = await res.json();
        triggerToast(errData.error || 'Failed to fetch hint', 'error');
      }
    } catch (e) {
      triggerToast('Connection error requesting hint.', 'error');
    }
  };

  const handleResetLab = () => {
    const confirmReset = window.confirm('Are you sure you want to reset the entire lab? All progress, XP, and flags will be cleared.');
    if (!confirmReset) return;

    localStorage.removeItem('csrf_lab_token');
    setToken(null);
    setSession(null);
    setTasks([]);
    triggerToast('Lab session cleared successfully.', 'info');
  };

  // Helper copy function
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    triggerToast(`${label} copied to clipboard!`, 'success');
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-white font-sans">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-[#00d4aa]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-semibold tracking-wider text-[#8b949e]">Spinning up sandbox environment...</span>
        </div>
      </div>
    );
  }

  if (!token || !session) {
    return <StartScreen onStart={handleStartLab} loading={loading} />;
  }

  const currentTask = tasks.find(t => t.id === currentTaskId) || null;

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex flex-col font-sans relative">
      
      {/* HEADER BAR */}
      <header className="bg-[#161b22] border-b border-[#30363d] px-6 py-4 flex items-center justify-between shrink-0 select-none z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛡️</span>
          <h1 className="font-extrabold tracking-tight text-white text-base md:text-lg flex items-center gap-1.5">
            CSRF Attack Lab
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* User Score Tag */}
          <div className="bg-[#1c2333] border border-[#30363d] rounded-lg px-3 py-1 text-xs font-semibold hidden md:flex items-center gap-2">
            <span className="text-[#8b949e]">XP Score:</span>
            <span className="text-[#00d4aa] font-black drop-shadow-[0_0_8px_rgba(0,212,170,0.3)]">
              {session.score} XP
            </span>
          </div>

          <button
            onClick={toggleTheme}
            className="text-xs bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] text-white px-3.5 py-1.5 rounded-lg cursor-pointer transition font-semibold flex items-center gap-1.5"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>

          <button
            onClick={handleResetLab}
            className="text-xs bg-red-950/20 border border-red-900/60 hover:bg-red-900/40 text-[#f85149] px-3.5 py-1.5 rounded-lg cursor-pointer transition font-semibold"
          >
            Reset Lab
          </button>
        </div>
      </header>

      {/* THREE-PANEL CORE CONTAINER */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* LEFT SIDEBAR: Tasks Navigation (280px) */}
        <aside className="w-full lg:w-72 bg-[#161b22]/50 border-r border-[#30363d] p-4 flex flex-col gap-3 overflow-y-auto shrink-0 select-none">
          <div className="text-[10px] font-black tracking-widest text-[#8b949e] uppercase px-1 pb-1 border-b border-[#21262d]">
            Lab Objectives ({tasks.length})
          </div>

          <div className="flex flex-col gap-2">
            {tasks.map((task) => {
              const state = session.tasks[task.id];
              const isActive = task.id === currentTaskId;
              const isCompleted = state?.completed;
              const isStarted = state?.started;

              return (
                <div
                  key={task.id}
                  onClick={() => isStarted && handleTaskSelect(task.id)}
                  className={`task-card flex items-center justify-between p-3.5 rounded-xl border text-left transition duration-200 select-none ${
                    isActive
                      ? 'border-[#00d4aa] bg-[#1c2333] shadow-[0_0_15px_rgba(0,212,170,0.06)]'
                      : isCompleted
                        ? 'border-[#30363d] hover:border-[#8b949e] bg-[#161b22]/40 opacity-90'
                        : isStarted
                          ? 'border-[#30363d] hover:border-[#8b949e] bg-[#161b22]/40'
                          : 'border-[#21262d]/50 bg-[#0d1117]/20 opacity-40 cursor-not-allowed'
                  } ${isStarted ? 'cursor-pointer' : ''}`}
                >
                  <div className="flex items-center gap-3 truncate">
                    {/* Circle badge identifier */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isActive 
                        ? 'bg-[#00d4aa] text-[#0d1117]' 
                        : isCompleted 
                          ? 'bg-[#1e3a2b] text-[#00d4aa]' 
                          : 'bg-[#21262d] text-[#8b949e]'
                    }`}>
                      {task.number}
                    </div>

                    <div className="flex flex-col truncate">
                      <span className="text-xs font-black text-white truncate">{task.title}</span>
                      <span className="text-[10px] text-[#8b949e]">{task.category} • {task.xp} XP</span>
                    </div>
                  </div>

                  <div className="shrink-0 ml-2">
                    {isCompleted ? (
                      <span className="text-[#00d4aa] font-bold text-sm">✓</span>
                    ) : isActive ? (
                      <span className="text-[#58a6ff] text-xs animate-pulse">▶</span>
                    ) : isStarted ? (
                      <span className="text-[#8b949e] text-xs">○</span>
                    ) : (
                      <span className="text-[#6e7681] text-xs">🔒</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* CENTER VIEW: Main Sandbox (Tabs Router) */}
        <main className="flex-1 flex flex-col bg-[#0d1117] overflow-y-auto">
          {/* Tab bar */}
          <div className="bg-[#161b22]/30 border-b border-[#30363d] px-6 py-2 flex items-center gap-6 select-none shrink-0 z-10 sticky top-0 backdrop-blur-sm">
            <button
              onClick={() => setActiveView('guide')}
              className={`pb-2.5 pt-1.5 text-xs font-bold transition-all relative cursor-pointer ${
                activeView === 'guide' ? 'text-[#00d4aa]' : 'text-[#8b949e] hover:text-white'
              }`}
            >
              📖 Task Guide
              {activeView === 'guide' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00d4aa] rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveView('staffhub')}
              className={`pb-2.5 pt-1.5 text-xs font-bold transition-all relative cursor-pointer ${
                activeView === 'staffhub' ? 'text-[#00d4aa]' : 'text-[#8b949e] hover:text-white'
              }`}
            >
              🌐 StaffHub Portal
              {activeView === 'staffhub' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00d4aa] rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveView('workshop')}
              className={`pb-2.5 pt-1.5 text-xs font-bold transition-all relative cursor-pointer ${
                activeView === 'workshop' ? 'text-[#00d4aa]' : 'text-[#8b949e] hover:text-white'
              }`}
            >
              ⚔️ Attack Workshop
              {activeView === 'workshop' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00d4aa] rounded-full" />
              )}
            </button>
          </div>

          {/* Router Area */}
          <div className="flex-grow">
            {activeView === 'guide' && (
              <TaskGuide
                currentTask={currentTask}
                session={session}
                onAnswer={handleAnswerSubmit}
                onSubmitFlag={handleFlagSubmit}
                onCompleteTask={handleCompleteTask}
                switchToTab={setActiveView}
                onGenerateAIQuestion={handleGenerateAIQuestion}
                onEvaluateAIAnswer={handleEvaluateAIAnswer}
              />
            )}
            {activeView === 'staffhub' && (
              <div className="p-6">
                <StaffHubApp 
                  session={session} 
                  onStateChange={() => syncSession(token)} 
                />
              </div>
            )}
            {activeView === 'workshop' && (
              <AttackWorkshop
                session={session}
                currentTask={currentTask}
                onAttackComplete={() => syncSession(token)}
              />
            )}
          </div>
        </main>

        {/* RIGHT SIDEBAR: Progress & Credentials */}
        <aside className="w-full lg:w-72 bg-[#161b22]/30 border-t lg:border-t-0 lg:border-l border-[#30363d] p-4 flex flex-col gap-4 overflow-y-auto shrink-0 select-none">
          <ProgressTracker session={session} tasks={tasks} />

          {/* Credentials Card */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 text-xs shadow-md">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e] mb-3">🔑 Lab Credentials</h4>
            
            <div className="flex flex-col gap-3 font-mono">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[11px] text-[#e6edf3] font-bold">Alice Johnson (Admin / Victim)</span>
                  <span className="text-[9px] bg-red-950 text-[#f85149] px-1.5 py-0.5 rounded font-black font-sans uppercase">Victim</span>
                </div>
                <div className="bg-[#0d1117] border border-[#30363d] rounded p-2 text-[10px] text-[#8b949e] flex justify-between items-center select-none">
                  <span>alice / seedalice</span>
                  <button 
                    onClick={() => copyToClipboard('alice / seedalice', 'Alice credentials')}
                    className="text-blue-500 hover:text-blue-400 font-sans font-semibold cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[11px] text-[#e6edf3] font-bold">Boby Smith (Staff / Student)</span>
                  <span className="text-[9px] bg-[#1e3a2b] text-[#00d4aa] px-1.5 py-0.5 rounded font-black font-sans uppercase">Student</span>
                </div>
                <div className="bg-[#0d1117] border border-[#30363d] rounded p-2 text-[10px] text-[#8b949e] flex justify-between items-center select-none">
                  <span>boby / seedboby</span>
                  <button 
                    onClick={() => copyToClipboard('boby / seedboby', 'Boby credentials')}
                    className="text-blue-500 hover:text-blue-400 font-sans font-semibold cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Hint Card */}
          {currentTask && currentTask.hints.length > 0 && (
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 text-xs shadow-md">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e] mb-2">💡 Need Guidance?</h4>
              <p className="text-[11px] text-[#8b949e] mb-3 leading-normal">
                Stuck on this task? Unlock progressive hints to guide you through.
              </p>
              <button
                onClick={handleRequestHint}
                className="w-full bg-[#1c2333] hover:bg-[#21262d] border border-[#30363d] hover:border-[#8b949e] text-white py-2 rounded-lg cursor-pointer transition text-xs font-semibold"
              >
                🔑 Reveal Hint (-10 XP)
              </button>
            </div>
          )}
        </aside>

      </div>

      {/* CONFETTI CELEBRATION OVERLAY */}
      {showCelebration && celebrationData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in select-none">
          <div className="bg-[#161b22] border border-[#00d4aa] rounded-2xl p-8 max-w-sm text-center shadow-[0_0_50px_rgba(0,212,170,0.3)] animate-scale-up">
            <div className="text-5xl mb-4 animate-bounce">🏆</div>
            <h3 className="text-xl font-black text-white">Objective Complete!</h3>
            <p className="text-xs text-[#8b949e] mt-1">You completed tasks in:</p>
            <p className="text-sm text-white font-extrabold mt-0.5">{celebrationData.taskTitle}</p>
            
            <div className="my-5 bg-[#0d1117] border border-[#30363d] rounded-xl p-4 text-center">
              <span className="text-xs text-[#8b949e] uppercase block tracking-wider font-bold">XP Awarded</span>
              <span className="text-2xl font-black text-[#00d4aa]">+{celebrationData.xp} XP</span>
            </div>

            {celebrationData.flag && (
              <div className="mb-5">
                <span className="text-[10px] text-[#8b949e] uppercase block font-bold tracking-wider mb-1">Captured Flag</span>
                <div className="bg-green-950/20 border border-green-500/30 text-[#00d4aa] rounded-lg p-2 font-mono text-xs select-all">
                  {celebrationData.flag}
                </div>
              </div>
            )}

            <button
              onClick={() => { setShowCelebration(false); setCelebrationData(null); }}
              className="bg-[#00d4aa] hover:bg-[#00bda0] text-[#0d1117] font-black text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* GLOBAL TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-[#161b22] border border-[#30363d] rounded-xl p-3.5 flex items-center gap-3 shadow-2xl animate-slide-in select-none">
          <span className="text-lg">
            {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          <span className="text-xs font-semibold text-[#e6edf3]">{toast.message}</span>
        </div>
      )}

      {/* AI CHATBOT tutor FLOATING BUTTON */}
      {token && (
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-[#00d4aa] text-[#0d1117] hover:bg-[#00bda0] hover:shadow-[0_0_15px_rgba(0,212,170,0.4)] transition-all duration-300 cursor-pointer flex items-center justify-center group font-black"
        >
          <span className="text-lg">💬</span>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 text-[10px] font-black tracking-wider pl-0 group-hover:pl-2 uppercase whitespace-nowrap">
            AI Tutor
          </span>
        </button>
      )}

      {/* AI CHATBOT DRAWER PANEL */}
      {isChatOpen && token && (
        <div className="fixed bottom-20 right-6 z-40 w-[320px] sm:w-[380px] h-[450px] rounded-xl border border-[#30363d] bg-[#161b22] shadow-2xl flex flex-col overflow-hidden backdrop-blur-md animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0d1117] border-b border-[#30363d]">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <div>
                <span className="text-xs font-black text-white block tracking-wide">AI TUTOR ASSISTANT</span>
                <span className="text-[8.5px] text-[#8b949e] uppercase tracking-wider">// Safety Guardrails Active</span>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-[#8b949e] hover:text-white transition-colors cursor-pointer text-xs font-bold"
            >
              ✖️
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 font-sans text-xs scroll-smooth">
            {chatMessages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-2.5 leading-relaxed break-words border ${
                    m.role === 'user'
                      ? 'bg-[#00d4aa]/10 border-[#00d4aa]/25 text-[#e6edf3]'
                      : 'bg-[#0d1117] border-[#30363d] text-[#8b949e]'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}
            {isChatSending && (
              <div className="flex justify-start">
                <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-2.5 flex items-center gap-1.5 text-[#8b949e] font-mono text-[9px] animate-pulse">
                  <span className="h-1.5 w-1.5 bg-[#00d4aa] rounded-full animate-bounce" />
                  <span className="h-1.5 w-1.5 bg-[#00d4aa] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 bg-[#00d4aa] rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span>AI MESSAGE LOADING...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input form */}
          <form onSubmit={handleSendChatMessage} className="p-2.5 bg-[#0d1117] border-t border-[#30363d] flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a doubt..."
              className="flex-1 rounded bg-[#161b22] border border-[#30363d] pl-3 pr-8 py-1.5 text-xs focus:outline-none focus:border-[#00d4aa] text-[#e6edf3] placeholder-[#8b949e]/40"
              disabled={isChatSending}
            />
            <button
              type="submit"
              className="p-1.5 rounded bg-[#00d4aa] text-[#0d1117] hover:bg-[#00bda0] disabled:opacity-40 cursor-pointer flex items-center justify-center shrink-0"
              disabled={isChatSending || !chatInput.trim()}
            >
              ➡️
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
