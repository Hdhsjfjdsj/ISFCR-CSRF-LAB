'use client';

import React, { useEffect, useState } from 'react';

interface ProgressTrackerProps {
  session: {
    score: number;
    startedAt: number;
    tasks: Record<string, {
      completed: boolean;
      started: boolean;
    }>;
    staffhubState: {
      flags: string[];
    };
  } | null;
  tasks: Array<{
    id: string;
    number: number;
    title: string;
    xp: number;
    category: string;
  }>;
}

export default function ProgressTracker({ session, tasks }: ProgressTrackerProps) {
  const [timeString, setTimeString] = useState('00:00');

  useEffect(() => {
    if (!session?.startedAt) return;
    
    const updateTimer = () => {
      const diff = Date.now() - session.startedAt;
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      const pad = (num: number) => String(num).padStart(2, '0');
      
      if (hours > 0) {
        setTimeString(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
      } else {
        setTimeString(`${pad(minutes)}:${pad(seconds)}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [session?.startedAt]);

  if (!session) return null;

  // Calculate stats
  const totalTasks = tasks.length || 8;
  const completedTasksCount = Object.values(session.tasks).filter(t => t.completed).length;
  const progressPercentage = totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0;
  
  const flagsCount = session.staffhubState?.flags?.length || 0;

  // Circular progress dimensions
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="flex flex-col gap-5 p-4 bg-[#161b22] border border-[#30363d] rounded-xl text-sm font-sans shadow-lg">
      
      {/* Progress Circular Dashboard */}
      <div className="flex items-center gap-4 border-b border-[#30363d] pb-4">
        <div className="relative flex items-center justify-center">
          <svg className="w-20 h-20 transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              className="stroke-[#21262d]"
              strokeWidth="6"
              fill="transparent"
            />
            {/* Foreground circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              className="stroke-[#00d4aa] transition-all duration-500 ease-out"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-xl font-black text-white">{completedTasksCount}</span>
            <span className="text-[10px] text-[#8b949e] block -mt-1">/ {totalTasks}</span>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#8b949e]">Lab Progress</span>
          <span className="text-lg font-black text-white mt-0.5">{progressPercentage.toFixed(0)}% Complete</span>
          <span className="text-xs text-[#6e7681]">Time: {timeString}</span>
        </div>
      </div>

      {/* Score Grid */}
      <div className="grid grid-cols-2 gap-3 border-b border-[#30363d] pb-4 text-center">
        <div className="bg-[#1c2333] border border-[#30363d] rounded-lg p-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e]">Score</span>
          <div className="text-[#00d4aa] text-lg font-black mt-1">
            {session.score} <span className="text-xs text-[#8b949e] font-normal">XP</span>
          </div>
        </div>
        <div className="bg-[#1c2333] border border-[#30363d] rounded-lg p-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e]">Flags</span>
          <div className="text-[#bc8cff] text-lg font-black mt-1 flex items-center justify-center gap-1">
            {flagsCount} / 3 🏴
          </div>
        </div>
      </div>

      {/* Task Checklist */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#8b949e] mb-3">Tasks Checklist</h4>
        <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
          {tasks.map(t => {
            const state = session.tasks[t.id];
            const isCompleted = state?.completed;
            const isStarted = state?.started;

            let dotColor = 'bg-[#30363d]'; // locked/not started
            let textColor = 'text-[#6e7681]';
            if (isCompleted) {
              dotColor = 'bg-[#00d4aa] shadow-[0_0_8px_rgba(0,212,170,0.5)]';
              textColor = 'text-[#e6edf3]';
            } else if (isStarted) {
              dotColor = 'bg-[#58a6ff] animate-pulse shadow-[0_0_8px_rgba(88,166,255,0.5)]';
              textColor = 'text-white font-semibold';
            }

            return (
              <div key={t.id} className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor}`} />
                <span className={`text-xs truncate ${textColor}`}>
                  Task {t.number}: {t.title}
                </span>
                {isCompleted && (
                  <span className="text-[#00d4aa] text-[10px] ml-auto">✓</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
