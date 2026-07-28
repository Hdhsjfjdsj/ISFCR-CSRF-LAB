'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface TaskAnimationProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskAnimation({ taskId, isOpen, onClose }: TaskAnimationProps) {
  const [animationKey, setAnimationKey] = useState(0);
  const [closing, setClosing] = useState(false);

  // Reset animation whenever modal opens or taskId changes
  useEffect(() => {
    if (isOpen) {
      setAnimationKey(prev => prev + 1);
      setClosing(false);
    }
  }, [isOpen, taskId]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 280);
  }, [onClose]);

  const triggerReplay = () => {
    setAnimationKey(prev => prev + 1);
  };

  if (!isOpen && !closing) return null;

  const getAnimationTitle = () => {
    switch (taskId) {
      case 'task1': return 'Lab Sandbox Architecture';
      case 'task2': return 'How CSRF Works — The Trust Abuse';
      case 'task3': return 'The CSRF Triad — Conditions for Attack';
      case 'task4': return 'Reconnaissance — Finding Vulnerable Forms';
      case 'task5': return 'GET Exploit — Silent Image Tag Attack';
      case 'task6': return 'POST Exploit — Auto-submitting Form Attack';
      case 'task7': return 'Weak Token Bypass — Base64 Forgery Chain';
      case 'task8': return 'SameSite Cookie Defence Comparison';
      case 'task9': return 'Defence-in-Depth — Security Recap';
      default: return 'Concept Visualization';
    }
  };

  const getAnimationSubtitle = () => {
    switch (taskId) {
      case 'task1': return 'Understand the three workspaces you will use throughout this lab.';
      case 'task2': return 'See how browsers automatically attach session cookies to cross-site requests.';
      case 'task3': return 'Three conditions must exist simultaneously for a CSRF vulnerability to be exploitable.';
      case 'task4': return 'Inspect HTTP requests and identify forms that lack anti-CSRF protections.';
      case 'task5': return 'Exploit a GET endpoint by embedding a malicious URL inside an invisible image tag.';
      case 'task6': return 'Craft a hidden HTML form that auto-submits via JavaScript to change the victim\'s email.';
      case 'task7': return 'Decode a predictable CSRF token, alter it for the target user, and forge the bypass.';
      case 'task8': return 'Compare how SameSite cookie attributes control cross-origin cookie transmission.';
      case 'task9': return 'Review the layered mitigation strategies that neutralise CSRF attack vectors.';
      default: return '';
    }
  };

  const renderAnimationContent = () => {
    switch (taskId) {
      case 'task1':
        return (
          <div className="flex flex-col items-center gap-8 py-8 px-6">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              {/* Task Guide */}
              <div className="ta-step-1 flex flex-col items-center p-5 bg-[#0d1117] border border-[#58a6ff]/30 rounded-2xl w-44 shadow-[0_0_20px_rgba(88,166,255,0.06)]">
                <div className="w-12 h-12 rounded-xl bg-blue-950/40 flex items-center justify-center mb-3 text-2xl">📖</div>
                <span className="text-sm font-bold text-white">Task Guide</span>
                <span className="text-[10px] text-[#8b949e] mt-1 text-center leading-relaxed">Read theory, answer questions, submit flags</span>
              </div>

              <div className="ta-connector-1 text-2xl text-[#30363d]">
                <svg width="40" height="24" viewBox="0 0 40 24" fill="none"><path d="M0 12h30m0 0l-8-6m8 6l-8 6" stroke="#30363d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ta-draw-line"/></svg>
              </div>

              {/* StaffHub */}
              <div className="ta-step-2 flex flex-col items-center p-5 bg-[#0d1117] border border-[#00d4aa]/30 rounded-2xl w-44 shadow-[0_0_20px_rgba(0,212,170,0.06)]">
                <div className="w-12 h-12 rounded-xl bg-emerald-950/40 flex items-center justify-center mb-3 text-2xl">🌐</div>
                <span className="text-sm font-bold text-[#00d4aa]">StaffHub Portal</span>
                <span className="text-[10px] text-[#8b949e] mt-1 text-center leading-relaxed">Vulnerable employee app with real endpoints</span>
              </div>

              <div className="ta-connector-2 text-2xl text-[#30363d]">
                <svg width="40" height="24" viewBox="0 0 40 24" fill="none"><path d="M0 12h30m0 0l-8-6m8 6l-8 6" stroke="#30363d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ta-draw-line"/></svg>
              </div>

              {/* Workshop */}
              <div className="ta-step-3 flex flex-col items-center p-5 bg-[#0d1117] border border-[#f85149]/30 rounded-2xl w-44 shadow-[0_0_20px_rgba(248,81,73,0.06)]">
                <div className="w-12 h-12 rounded-xl bg-red-950/40 flex items-center justify-center mb-3 text-2xl">⚔️</div>
                <span className="text-sm font-bold text-[#f85149]">Attack Workshop</span>
                <span className="text-[10px] text-[#8b949e] mt-1 text-center leading-relaxed">Write exploits, simulate victim visits</span>
              </div>
            </div>

            <div className="ta-step-4 bg-[#161b22] border border-[#30363d] rounded-xl px-5 py-3 text-center max-w-md">
              <p className="text-[11px] text-[#8b949e] leading-relaxed">
                Use the <strong className="text-white">tab bar</strong> at the top to switch between these three workspaces at any time during the lab.
              </p>
            </div>
          </div>
        );

      case 'task2':
        return (
          <div className="flex flex-col items-center gap-6 py-8 px-6">
            {/* Step-by-step flow */}
            <div className="flex flex-col gap-4 w-full max-w-lg">
              {/* Step 1 */}
              <div className="ta-flow-1 flex items-center gap-4 bg-[#0d1117] border border-[#30363d] rounded-xl p-4">
                <div className="w-10 h-10 rounded-full bg-blue-950/50 border border-blue-500/30 flex items-center justify-center shrink-0 text-lg">1️⃣</div>
                <div>
                  <p className="text-xs font-bold text-white">Victim logs into StaffHub</p>
                  <p className="text-[10px] text-[#8b949e] mt-0.5">Server issues a session cookie → browser stores it</p>
                </div>
                <div className="ml-auto ta-cookie-appear">
                  <span className="bg-amber-950/40 border border-amber-500/30 text-amber-400 text-[9px] font-mono px-2 py-1 rounded-full whitespace-nowrap">🍪 SID=abc123</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="ta-flow-2 flex items-center gap-4 bg-[#0d1117] border border-[#f85149]/20 rounded-xl p-4">
                <div className="w-10 h-10 rounded-full bg-red-950/50 border border-red-500/30 flex items-center justify-center shrink-0 text-lg">2️⃣</div>
                <div>
                  <p className="text-xs font-bold text-[#f85149]">Victim visits attacker's page</p>
                  <p className="text-[10px] text-[#8b949e] mt-0.5">The page contains a hidden form/image targeting StaffHub</p>
                </div>
                <div className="ml-auto text-xl ta-shake">😈</div>
              </div>

              {/* Step 3 */}
              <div className="ta-flow-3 flex items-center gap-4 bg-[#0d1117] border border-amber-500/20 rounded-xl p-4">
                <div className="w-10 h-10 rounded-full bg-amber-950/50 border border-amber-500/30 flex items-center justify-center shrink-0 text-lg">3️⃣</div>
                <div>
                  <p className="text-xs font-bold text-amber-400">Browser auto-attaches the cookie</p>
                  <p className="text-[10px] text-[#8b949e] mt-0.5">The forged request carries the victim's valid session — the server cannot tell it apart</p>
                </div>
                <div className="ml-auto ta-cookie-fly">
                  <span className="text-lg">🍪</span><span className="text-xs text-[#30363d]">→</span><span className="text-lg">🏦</span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="ta-flow-4 flex items-center gap-4 bg-[#0d1117] border border-[#00d4aa]/20 rounded-xl p-4">
                <div className="w-10 h-10 rounded-full bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center shrink-0 text-lg">4️⃣</div>
                <div>
                  <p className="text-xs font-bold text-[#00d4aa]">Server executes the forged action</p>
                  <p className="text-[10px] text-[#8b949e] mt-0.5">Email changed, role updated, or profile modified — without the victim's knowledge</p>
                </div>
                <div className="ml-auto text-xl ta-check-pop">✅</div>
              </div>
            </div>
          </div>
        );

      case 'task3':
        return (
          <div className="flex flex-col items-center gap-8 py-8 px-6">
            <div className="relative flex flex-col md:flex-row items-stretch justify-center gap-5 w-full max-w-2xl">
              {/* Condition 1 */}
              <div className="ta-triad-1 flex-1 bg-[#0d1117] border border-[#f85149]/30 rounded-2xl p-5 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-red-950/30 border-2 border-[#f85149]/40 flex items-center justify-center mb-3 text-2xl ta-icon-spin">🔄</div>
                <span className="text-xs font-bold text-[#f85149] mb-1">State-Changing Action</span>
                <span className="text-[10px] text-[#8b949e] leading-relaxed">The target endpoint must modify data on the server (e.g., update email, transfer funds).</span>
              </div>

              {/* Condition 2 */}
              <div className="ta-triad-2 flex-1 bg-[#0d1117] border border-amber-500/30 rounded-2xl p-5 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-amber-950/30 border-2 border-amber-500/40 flex items-center justify-center mb-3 text-2xl ta-icon-spin">🍪</div>
                <span className="text-xs font-bold text-amber-400 mb-1">Cookie-Based Session</span>
                <span className="text-[10px] text-[#8b949e] leading-relaxed">Authentication relies solely on cookies that the browser attaches automatically.</span>
              </div>

              {/* Condition 3 */}
              <div className="ta-triad-3 flex-1 bg-[#0d1117] border border-[#58a6ff]/30 rounded-2xl p-5 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-blue-950/30 border-2 border-[#58a6ff]/40 flex items-center justify-center mb-3 text-2xl ta-icon-spin">🔓</div>
                <span className="text-xs font-bold text-[#58a6ff] mb-1">Predictable Parameters</span>
                <span className="text-[10px] text-[#8b949e] leading-relaxed">No secret tokens, nonces, or unpredictable values in the request payload.</span>
              </div>
            </div>

            <div className="ta-triad-result bg-[#161b22] border border-[#f85149]/30 rounded-xl px-6 py-3 flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <span className="text-[11px] text-[#8b949e]">If <strong className="text-white">all three</strong> conditions are met, the endpoint is exploitable via CSRF.</span>
            </div>
          </div>
        );

      case 'task4':
        return (
          <div className="flex flex-col gap-5 py-6 px-6 max-w-xl mx-auto">
            {/* Simulated DevTools */}
            <div className="ta-devtools bg-[#0d1117] border border-[#30363d] rounded-xl overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 bg-[#161b22] px-4 py-2 border-b border-[#21262d]">
                <div className="flex gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f85149]"></span><span className="w-2.5 h-2.5 rounded-full bg-[#d29922]"></span><span className="w-2.5 h-2.5 rounded-full bg-[#00d4aa]"></span></div>
                <span className="text-[10px] text-[#8b949e] font-mono ml-2">Elements — Settings Page</span>
              </div>
              <div className="p-4 font-mono text-[11px] space-y-2">
                <div className="ta-line-1 text-[#8b949e]"><span className="text-gray-600">&lt;</span><span className="text-[#ff7b72]">form</span> <span className="text-[#79c0ff]">action</span>=<span className="text-[#a5d6ff]">"/api/app/settings/email"</span> <span className="text-[#79c0ff]">method</span>=<span className="text-[#a5d6ff]">"POST"</span><span className="text-gray-600">&gt;</span></div>
                <div className="ta-line-2 pl-5 text-[#8b949e]"><span className="text-gray-600">&lt;</span><span className="text-[#ff7b72]">input</span> <span className="text-[#79c0ff]">type</span>=<span className="text-[#a5d6ff]">"email"</span> <span className="text-[#79c0ff]">name</span>=<span className="text-[#a5d6ff]">"email"</span> <span className="text-gray-600">/&gt;</span></div>
                <div className="ta-line-3 pl-5 text-[#8b949e]"><span className="text-gray-600">&lt;</span><span className="text-[#ff7b72]">button</span> <span className="text-[#79c0ff]">type</span>=<span className="text-[#a5d6ff]">"submit"</span><span className="text-gray-600">&gt;</span><span className="text-white">Update</span><span className="text-gray-600">&lt;/</span><span className="text-[#ff7b72]">button</span><span className="text-gray-600">&gt;</span></div>
                <div className="ta-alert-line flex items-center gap-2 mt-1 pl-5 py-1.5 bg-red-950/20 border border-[#f85149]/30 rounded-lg px-3">
                  <span className="text-sm">🚨</span>
                  <span className="text-[10px] text-[#f85149] font-sans font-bold">NO CSRF TOKEN INPUT DETECTED</span>
                </div>
                <div className="ta-line-4 text-[#8b949e]"><span className="text-gray-600">&lt;/</span><span className="text-[#ff7b72]">form</span><span className="text-gray-600">&gt;</span></div>
              </div>
            </div>

            <div className="ta-recon-tip text-center text-[11px] text-[#8b949e] leading-relaxed bg-[#161b22] border border-[#30363d] rounded-xl px-5 py-3">
              ✨ <strong className="text-white">Recon tip:</strong> Check for hidden <code className="text-[#79c0ff]">&lt;input name="csrf_token"&gt;</code> fields. If missing, the form may be vulnerable.
            </div>
          </div>
        );

      case 'task5':
        return (
          <div className="flex flex-col gap-5 py-6 px-6 max-w-xl mx-auto">
            {/* Payload */}
            <div className="ta-code-reveal bg-[#0d1117] border border-[#30363d] rounded-xl p-4 font-mono text-[11px]">
              <div className="text-[9px] text-[#6e7681] uppercase tracking-wider mb-2 font-sans font-bold">Attacker's Payload</div>
              <div className="text-[#8b949e]">
                <span className="text-gray-600">&lt;</span><span className="text-[#ff7b72]">img</span> <span className="text-[#79c0ff]">src</span>=<span className="text-[#a5d6ff]">"/api/app/settings/status?status=Hacked!"</span>
              </div>
              <div className="text-[#8b949e] pl-5">
                <span className="text-[#79c0ff]">width</span>=<span className="text-[#a5d6ff]">"0"</span> <span className="text-[#79c0ff]">height</span>=<span className="text-[#a5d6ff]">"0"</span> <span className="text-gray-600">/&gt;</span>
              </div>
            </div>

            {/* Flow */}
            <div className="flex items-center justify-between gap-3">
              <div className="ta-get-1 flex flex-col items-center bg-[#0d1117] border border-[#f85149]/20 rounded-xl p-3 w-28 text-center">
                <span className="text-xl mb-1">😈</span>
                <span className="text-[9px] text-[#8b949e] font-semibold">Attacker Page</span>
              </div>

              <div className="flex-1 relative h-10 flex items-center">
                <div className="w-full border-t-2 border-dashed border-[#30363d]"></div>
                <div className="absolute ta-packet-fly bg-amber-950/60 border border-amber-500/40 text-amber-400 text-[8px] font-mono px-2 py-0.5 rounded-full whitespace-nowrap">GET + 🍪</div>
              </div>

              <div className="ta-get-2 flex flex-col items-center bg-[#0d1117] border border-blue-500/20 rounded-xl p-3 w-28 text-center">
                <span className="text-xl mb-1">🏦</span>
                <span className="text-[9px] text-[#8b949e] font-semibold">StaffHub Server</span>
              </div>
            </div>

            {/* Result */}
            <div className="ta-get-result bg-[#0d1117] border border-[#00d4aa]/30 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">✅</span>
                <span className="text-[11px] text-[#00d4aa] font-semibold">Alice's status → "Hacked!"</span>
              </div>
              <span className="text-[9px] bg-emerald-950/40 border border-[#00d4aa]/30 text-[#00d4aa] px-2 py-0.5 rounded-full font-mono">FLAG UNLOCKED</span>
            </div>
          </div>
        );

      case 'task6':
        return (
          <div className="flex flex-col gap-5 py-6 px-6 max-w-xl mx-auto">
            {/* Payload */}
            <div className="ta-code-reveal bg-[#0d1117] border border-[#30363d] rounded-xl p-4 font-mono text-[11px]">
              <div className="text-[9px] text-[#6e7681] uppercase tracking-wider mb-2 font-sans font-bold">Auto-submit Payload</div>
              <div className="text-[#8b949e]"><span className="text-gray-600">&lt;</span><span className="text-[#ff7b72]">form</span> <span className="text-[#79c0ff]">id</span>=<span className="text-[#a5d6ff]">"x"</span> <span className="text-[#79c0ff]">action</span>=<span className="text-[#a5d6ff]">"/api/app/settings/email"</span> <span className="text-[#79c0ff]">method</span>=<span className="text-[#a5d6ff]">"POST"</span><span className="text-gray-600">&gt;</span></div>
              <div className="text-[#8b949e] pl-5"><span className="text-gray-600">&lt;</span><span className="text-[#ff7b72]">input</span> <span className="text-[#79c0ff]">name</span>=<span className="text-[#a5d6ff]">"email"</span> <span className="text-[#79c0ff]">value</span>=<span className="text-[#a5d6ff]">"attacker@evilmail.thm"</span> <span className="text-gray-600">/&gt;</span></div>
              <div className="text-[#8b949e]"><span className="text-gray-600">&lt;/</span><span className="text-[#ff7b72]">form</span><span className="text-gray-600">&gt;</span></div>
              <div className="text-[#d2a8ff]"><span className="text-gray-600">&lt;</span><span className="text-[#ff7b72]">script</span><span className="text-gray-600">&gt;</span>document.getElementById(<span className="text-[#a5d6ff]">'x'</span>).submit()<span className="text-gray-600">&lt;/</span><span className="text-[#ff7b72]">script</span><span className="text-gray-600">&gt;</span></div>
            </div>

            {/* Timeline */}
            <div className="flex items-center gap-0 w-full">
              <div className="ta-post-1 flex flex-col items-center flex-1 py-2"><span className="text-xl">👤</span><span className="text-[9px] text-[#8b949e] mt-1 font-semibold text-center">Alice visits attacker URL</span></div>
              <div className="ta-post-arrow text-[#30363d]">→</div>
              <div className="ta-post-2 flex flex-col items-center flex-1 py-2"><span className="text-xl ta-pulse-red">📝</span><span className="text-[9px] text-[#f85149] mt-1 font-bold text-center">Form auto-submits</span></div>
              <div className="ta-post-arrow text-[#30363d]">→</div>
              <div className="ta-post-3 flex flex-col items-center flex-1 py-2"><span className="text-xl">🍪</span><span className="text-[9px] text-amber-400 mt-1 font-semibold text-center">Cookie attached by browser</span></div>
              <div className="ta-post-arrow text-[#30363d]">→</div>
              <div className="ta-post-4 flex flex-col items-center flex-1 py-2"><span className="text-xl ta-check-pop">📧</span><span className="text-[9px] text-[#00d4aa] mt-1 font-bold text-center">Email hijacked!</span></div>
            </div>
          </div>
        );

      case 'task7':
        return (
          <div className="flex flex-col gap-5 py-6 px-6 max-w-xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Step 1 - Observe */}
              <div className="ta-token-1 flex-1 bg-[#0d1117] border border-[#30363d] rounded-xl p-4 flex flex-col items-center gap-2">
                <span className="text-[9px] uppercase font-bold tracking-widest text-[#6e7681]">Step 1 — Observe</span>
                <div className="bg-[#161b22] rounded-lg px-3 py-2 text-center w-full">
                  <span className="text-[10px] font-mono text-[#8b949e] break-all select-all">Ym9ieToxNzE3NTI=</span>
                </div>
                <svg width="20" height="20" viewBox="0 0 20 20"><path d="M10 4v12m0 0l-4-4m4 4l4-4" stroke="#58a6ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className="text-[10px] font-mono text-amber-400 font-bold">boby:171752</span>
                <span className="text-[9px] text-[#6e7681]">Pattern: username:timestamp</span>
              </div>

              {/* Step 2 - Forge */}
              <div className="ta-token-2 flex-1 bg-[#0d1117] border border-[#f85149]/30 rounded-xl p-4 flex flex-col items-center gap-2">
                <span className="text-[9px] uppercase font-bold tracking-widest text-[#6e7681]">Step 2 — Forge</span>
                <div className="bg-[#161b22] rounded-lg px-3 py-2 text-center w-full">
                  <span className="text-[10px] font-mono line-through text-gray-600">boby</span>
                  <span className="text-[10px] font-mono text-[#f85149] font-bold ml-2">→ alice</span>
                </div>
                <svg width="20" height="20" viewBox="0 0 20 20"><path d="M10 4v12m0 0l-4-4m4 4l4-4" stroke="#f85149" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className="text-[10px] font-mono text-[#58a6ff] font-bold">alice:171752</span>
                <span className="text-[9px] text-[#6e7681]">Replace username</span>
              </div>

              {/* Step 3 - Encode */}
              <div className="ta-token-3 flex-1 bg-[#0d1117] border border-[#00d4aa]/30 rounded-xl p-4 flex flex-col items-center gap-2">
                <span className="text-[9px] uppercase font-bold tracking-widest text-[#6e7681]">Step 3 — Encode</span>
                <div className="bg-[#161b22] rounded-lg px-3 py-2 text-center w-full">
                  <span className="text-[10px] font-mono text-[#58a6ff]">btoa("alice:171752")</span>
                </div>
                <svg width="20" height="20" viewBox="0 0 20 20"><path d="M10 4v12m0 0l-4-4m4 4l4-4" stroke="#00d4aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className="text-[10px] font-mono text-[#00d4aa] font-bold break-all">YWxpY2U6MTcxNzUy</span>
                <span className="text-[9px] text-[#6e7681]">Forged token ✓</span>
              </div>
            </div>

            <div className="ta-token-result bg-[#161b22] border border-amber-500/20 rounded-xl px-5 py-3 text-center">
              <span className="text-[11px] text-[#8b949e]">Weak tokens built from <strong className="text-amber-400">predictable patterns</strong> can be forged for <em>any</em> user.</span>
            </div>
          </div>
        );

      case 'task8':
        return (
          <div className="flex flex-col gap-5 py-6 px-6 max-w-lg mx-auto">
            <div className="grid grid-cols-3 gap-3">
              {/* Headers */}
              <div></div>
              <div className="ta-ss-1 text-center"><span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-blue-950/40 text-blue-400 border border-blue-500/20">Lax</span></div>
              <div className="ta-ss-2 text-center"><span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-green-950/40 text-green-400 border border-green-500/20">Strict</span></div>

              {/* Row 1 */}
              <div className="ta-ss-row1 text-[10px] text-[#8b949e] flex items-center">🔗 Top-level GET</div>
              <div className="ta-ss-row1 text-center text-xs font-bold text-[#00d4aa]">✅ Sent</div>
              <div className="ta-ss-row1 text-center text-xs font-bold text-[#f85149]">❌ Blocked</div>

              {/* Row 2 */}
              <div className="ta-ss-row2 text-[10px] text-[#8b949e] flex items-center">📨 Cross-site POST</div>
              <div className="ta-ss-row2 text-center text-xs font-bold text-[#f85149]">❌ Blocked</div>
              <div className="ta-ss-row2 text-center text-xs font-bold text-[#f85149]">❌ Blocked</div>

              {/* Row 3 */}
              <div className="ta-ss-row3 text-[10px] text-[#8b949e] flex items-center">🖼️ Cross-site IMG</div>
              <div className="ta-ss-row3 text-center text-xs font-bold text-[#f85149]">❌ Blocked</div>
              <div className="ta-ss-row3 text-center text-xs font-bold text-[#f85149]">❌ Blocked</div>
            </div>

            <div className="ta-ss-tip bg-[#161b22] border border-[#30363d] rounded-xl px-5 py-3 text-center">
              <span className="text-[11px] text-[#8b949e]"><strong className="text-green-400">Strict</strong> blocks cookies on ALL cross-site requests. <strong className="text-blue-400">Lax</strong> still allows top-level navigation GET requests.</span>
            </div>
          </div>
        );

      case 'task9':
        return (
          <div className="flex flex-col items-center gap-6 py-8 px-6">
            <div className="ta-shield w-16 h-16 rounded-full bg-emerald-950/30 border-2 border-[#00d4aa] flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(0,212,170,0.12)]">🛡️</div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-lg">
              <div className="ta-def-1 bg-[#0d1117] border border-[#00d4aa]/20 rounded-xl p-4 flex flex-col items-center text-center">
                <span className="text-xl mb-2">🔑</span>
                <span className="text-[11px] font-bold text-white mb-1">Anti-CSRF Tokens</span>
                <span className="text-[9px] text-[#8b949e] leading-relaxed">Cryptographically random, validated server-side</span>
              </div>
              <div className="ta-def-2 bg-[#0d1117] border border-[#00d4aa]/20 rounded-xl p-4 flex flex-col items-center text-center">
                <span className="text-xl mb-2">🍪</span>
                <span className="text-[11px] font-bold text-white mb-1">SameSite Cookies</span>
                <span className="text-[9px] text-[#8b949e] leading-relaxed">Restrict cookie transmission on cross-site requests</span>
              </div>
              <div className="ta-def-3 bg-[#0d1117] border border-[#00d4aa]/20 rounded-xl p-4 flex flex-col items-center text-center">
                <span className="text-xl mb-2">🌐</span>
                <span className="text-[11px] font-bold text-white mb-1">Origin Validation</span>
                <span className="text-[9px] text-[#8b949e] leading-relaxed">Verify Origin & Referer headers server-side</span>
              </div>
            </div>

            <div className="ta-def-result bg-[#161b22] border border-[#00d4aa]/30 rounded-xl px-6 py-3 text-center max-w-md">
              <span className="text-[11px] text-[#8b949e]">Combine <strong className="text-[#00d4aa]">all three layers</strong> for robust defence-in-depth against CSRF.</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 ${closing ? 'ta-overlay-exit' : 'ta-overlay-enter'}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      {/* Scoped animations */}
      <style>{`
        /* Overlay */
        .ta-overlay-enter { animation: taOverlayIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .ta-overlay-exit { animation: taOverlayOut 0.28s ease-in forwards; }
        @keyframes taOverlayIn {
          from { background: rgba(1,4,9,0); }
          to { background: rgba(1,4,9,0.85); backdrop-filter: blur(12px); }
        }
        @keyframes taOverlayOut {
          from { background: rgba(1,4,9,0.85); backdrop-filter: blur(12px); opacity:1; }
          to { background: rgba(1,4,9,0); backdrop-filter: blur(0); opacity:0; }
        }

        /* Card */
        .ta-card-enter { animation: taCardIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .ta-card-exit { animation: taCardOut 0.25s ease-in forwards; }
        @keyframes taCardIn {
          from { opacity: 0; transform: scale(0.92) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes taCardOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.95) translateY(10px); }
        }

        /* Step reveals */
        .ta-step-1 { opacity:0; animation: taSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.3s forwards; }
        .ta-step-2 { opacity:0; animation: taSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.6s forwards; }
        .ta-step-3 { opacity:0; animation: taSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.9s forwards; }
        .ta-step-4 { opacity:0; animation: taSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) 1.3s forwards; }
        .ta-connector-1 { opacity:0; animation: taFadeIn 0.4s ease 0.5s forwards; }
        .ta-connector-2 { opacity:0; animation: taFadeIn 0.4s ease 0.8s forwards; }

        /* Flow steps (task2) */
        .ta-flow-1 { opacity:0; transform: translateX(-20px); animation: taSlideRight 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s forwards; }
        .ta-flow-2 { opacity:0; transform: translateX(-20px); animation: taSlideRight 0.6s cubic-bezier(0.16,1,0.3,1) 0.6s forwards; }
        .ta-flow-3 { opacity:0; transform: translateX(-20px); animation: taSlideRight 0.6s cubic-bezier(0.16,1,0.3,1) 1.0s forwards; }
        .ta-flow-4 { opacity:0; transform: translateX(-20px); animation: taSlideRight 0.6s cubic-bezier(0.16,1,0.3,1) 1.4s forwards; }
        .ta-cookie-appear { opacity:0; animation: taPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.5s forwards; }
        .ta-shake { animation: taShakeEmoji 0.6s ease 1.0s 2; }
        .ta-cookie-fly { opacity:0; animation: taPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 1.3s forwards; }
        .ta-check-pop { opacity:0; animation: taPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 1.7s forwards; }

        /* Triad (task3) */
        .ta-triad-1 { opacity:0; transform: scale(0.85) translateY(20px); animation: taScalePop 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s forwards; }
        .ta-triad-2 { opacity:0; transform: scale(0.85) translateY(20px); animation: taScalePop 0.7s cubic-bezier(0.16,1,0.3,1) 0.5s forwards; }
        .ta-triad-3 { opacity:0; transform: scale(0.85) translateY(20px); animation: taScalePop 0.7s cubic-bezier(0.16,1,0.3,1) 0.8s forwards; }
        .ta-triad-result { opacity:0; animation: taSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) 1.3s forwards; }
        .ta-icon-spin { animation: taIconSpin 3s ease-in-out infinite; }

        /* DevTools (task4) */
        .ta-devtools { opacity:0; animation: taSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s forwards; }
        .ta-line-1 { opacity:0; animation: taTypeIn 0.4s ease 0.6s forwards; }
        .ta-line-2 { opacity:0; animation: taTypeIn 0.4s ease 0.9s forwards; }
        .ta-line-3 { opacity:0; animation: taTypeIn 0.4s ease 1.2s forwards; }
        .ta-alert-line { opacity:0; transform: translateY(5px) scaleX(0.95); animation: taAlertPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 1.6s forwards; }
        .ta-line-4 { opacity:0; animation: taTypeIn 0.4s ease 2.0s forwards; }
        .ta-recon-tip { opacity:0; animation: taSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) 2.3s forwards; }

        /* GET exploit (task5) */
        .ta-code-reveal { opacity:0; animation: taSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s forwards; }
        .ta-get-1 { opacity:0; animation: taScalePop 0.5s cubic-bezier(0.16,1,0.3,1) 0.7s forwards; }
        .ta-get-2 { opacity:0; animation: taScalePop 0.5s cubic-bezier(0.16,1,0.3,1) 1.0s forwards; }
        .ta-packet-fly { animation: taPacketFly 2.5s cubic-bezier(0.4,0,0.2,1) 1.2s infinite; }
        .ta-get-result { opacity:0; animation: taSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) 1.8s forwards; }

        /* POST exploit (task6) */
        .ta-post-1 { opacity:0; animation: taSlideUp 0.5s ease 0.6s forwards; }
        .ta-post-2 { opacity:0; animation: taSlideUp 0.5s ease 0.9s forwards; }
        .ta-post-3 { opacity:0; animation: taSlideUp 0.5s ease 1.2s forwards; }
        .ta-post-4 { opacity:0; animation: taSlideUp 0.5s ease 1.5s forwards; }
        .ta-post-arrow { opacity:0; animation: taFadeIn 0.3s ease 0.8s forwards; }
        .ta-pulse-red { animation: taPulseRed 1.5s ease-in-out 1.2s infinite; }

        /* Token bypass (task7) */
        .ta-token-1 { opacity:0; transform: translateY(20px); animation: taSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s forwards; }
        .ta-token-2 { opacity:0; transform: translateY(20px); animation: taSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.6s forwards; }
        .ta-token-3 { opacity:0; transform: translateY(20px); animation: taSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 1.0s forwards; }
        .ta-token-result { opacity:0; animation: taSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) 1.5s forwards; }

        /* SameSite (task8) */
        .ta-ss-1 { opacity:0; animation: taPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.2s forwards; }
        .ta-ss-2 { opacity:0; animation: taPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.4s forwards; }
        .ta-ss-row1 { opacity:0; animation: taSlideRight 0.5s ease 0.6s forwards; }
        .ta-ss-row2 { opacity:0; animation: taSlideRight 0.5s ease 0.9s forwards; }
        .ta-ss-row3 { opacity:0; animation: taSlideRight 0.5s ease 1.2s forwards; }
        .ta-ss-tip { opacity:0; animation: taSlideUp 0.6s ease 1.6s forwards; }

        /* Defences (task9) */
        .ta-shield { opacity:0; animation: taShieldPop 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.2s forwards; }
        .ta-def-1 { opacity:0; transform: translateY(20px); animation: taSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.6s forwards; }
        .ta-def-2 { opacity:0; transform: translateY(20px); animation: taSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.9s forwards; }
        .ta-def-3 { opacity:0; transform: translateY(20px); animation: taSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) 1.2s forwards; }
        .ta-def-result { opacity:0; animation: taSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) 1.6s forwards; }

        /* Draw line for connectors */
        .ta-draw-line { stroke-dasharray: 50; stroke-dashoffset: 50; animation: taDrawLine 0.6s ease forwards; }

        /* Keyframes */
        @keyframes taSlideUp { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }
        @keyframes taSlideRight { from { opacity:0; transform: translateX(-20px); } to { opacity:1; transform: translateX(0); } }
        @keyframes taFadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes taScalePop { from { opacity:0; transform: scale(0.85) translateY(20px); } to { opacity:1; transform: scale(1) translateY(0); } }
        @keyframes taPop { from { opacity:0; transform: scale(0.6); } to { opacity:1; transform: scale(1); } }
        @keyframes taTypeIn { from { opacity:0; transform: translateX(-8px); } to { opacity:1; transform: translateX(0); } }
        @keyframes taAlertPop { to { opacity:1; transform: translateY(0) scaleX(1); } }
        @keyframes taShakeEmoji { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-12deg)} 75%{transform:rotate(12deg)} }
        @keyframes taIconSpin { 0%,100%{transform:rotate(0)} 50%{transform:rotate(360deg)} }
        @keyframes taDrawLine { to { stroke-dashoffset: 0; } }
        @keyframes taShieldPop { from { opacity:0; transform: scale(0.5); } 70% { transform: scale(1.15); } to { opacity:1; transform: scale(1); } }
        @keyframes taPulseRed { 0%,100%{ filter: drop-shadow(0 0 0 transparent); } 50%{ filter: drop-shadow(0 0 8px rgba(248,81,73,0.5)); } }
        @keyframes taPacketFly { 0%{ left: 0; opacity:0; } 10%{ opacity:1; } 90%{ opacity:1; } 100%{ left: calc(100% - 60px); opacity:0; } }
      `}</style>

      {/* Modal Card */}
      <div
        className={`relative bg-[#0d1117] border border-[#30363d] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto ${closing ? 'ta-card-exit' : 'ta-card-enter'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0d1117]/95 backdrop-blur-md border-b border-[#21262d] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex flex-col gap-0.5 min-w-0 pr-4">
            <div className="flex items-center gap-2">
              <span className="text-base">🎬</span>
              <span className="text-sm font-black text-white truncate">{getAnimationTitle()}</span>
            </div>
            <span className="text-[10px] text-[#6e7681] leading-snug truncate">{getAnimationSubtitle()}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={triggerReplay}
              className="bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] hover:border-[#8b949e] text-[#8b949e] hover:text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition duration-150 flex items-center gap-1.5 cursor-pointer"
            >
              🔄 Replay
            </button>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg bg-[#21262d] border border-[#30363d] hover:bg-[#f85149]/20 hover:border-[#f85149]/40 hover:text-[#f85149] text-[#8b949e] flex items-center justify-center cursor-pointer transition duration-150 text-sm font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div key={animationKey}>
          {renderAnimationContent()}
        </div>
      </div>
    </div>
  );
}
