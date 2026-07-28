'use client';

import React, { useState } from 'react';

interface StartScreenProps {
  onStart: (name: string) => void;
  loading: boolean;
}

export default function StartScreen({ onStart, loading }: StartScreenProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart(name.trim() || 'Student');
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,212,170,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(var(--border) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="max-w-4xl w-full z-10 text-center flex flex-col items-center">
        {/* Logo Shield & Lock */}
        <div className="w-24 h-24 mb-6 rounded-full bg-[#1c2333] border border-[#30363d] flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(0,212,170,0.1)] animate-pulse-slow">
          🛡️🔒
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-3 text-white">
          CSRF <span className="text-[#00d4aa] drop-shadow-[0_0_15px_rgba(0,212,170,0.3)]">Attack Lab</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg md:text-xl text-[#8b949e] max-w-2xl mb-12">
          Master Cross-Site Request Forgery (CSRF) through hands-on exploitation, token analysis, and real-world defenses.
        </p>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full mb-12 text-left">
          <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] hover:border-[#00d4aa] transition duration-300">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-bold text-white mb-1">CSRF Theory</h3>
            <p className="text-xs text-[#8b949e]">Understand the fundamental browser trust model and how cookie authentication gets abused.</p>
          </div>
          
          <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] hover:border-[#00d4aa] transition duration-300">
            <div className="text-3xl mb-3">💻</div>
            <h3 className="font-bold text-white mb-1">Real Exploits</h3>
            <p className="text-xs text-[#8b949e]">Craft realistic HTML form and GET payload templates to target sensitive user actions.</p>
          </div>

          <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] hover:border-[#00d4aa] transition duration-300">
            <div className="text-3xl mb-3">🔓</div>
            <h3 className="font-bold text-white mb-1">Token Bypass</h3>
            <p className="text-xs text-[#8b949e]">Analyze weak token generation logic, reconstruct encoded data, and forge valid tokens.</p>
          </div>

          <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] hover:border-[#00d4aa] transition duration-300">
            <div className="text-3xl mb-3">🛡️</div>
            <h3 className="font-bold text-white mb-1">SameSite Defense</h3>
            <p className="text-xs text-[#8b949e]">Implement security controls: anti-CSRF tokens, Lax/Strict SameSite cookies, and origin checks.</p>
          </div>
        </div>

        {/* Action Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-2xl">
          <label className="block text-left text-xs font-bold uppercase tracking-wider text-[#8b949e] mb-2">
            Student Name
          </label>
          <input
            type="text"
            placeholder="Enter your name to start..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa] rounded-xl px-4 py-3 text-white placeholder-[#6e7681] outline-none transition mb-4 text-sm font-semibold"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00d4aa] hover:bg-[#00bda0] disabled:bg-[#163a32] text-[#0d1117] font-black rounded-xl py-3 px-6 transition duration-200 shadow-[0_0_20px_rgba(0,212,170,0.2)] hover:shadow-[0_0_25px_rgba(0,212,170,0.4)] flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-[#0d1117]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Deploying Lab Environment...
              </>
            ) : (
              '🚀 Launch Lab Environment'
            )}
          </button>
        </form>

        {/* Meta Stats */}
        <div className="mt-8 text-xs text-[#6e7681] flex items-center gap-4 border-t border-[#30363d] pt-6 w-full justify-center">
          <span>⏱ ~60 minutes</span>
          <span className="text-[#30363d]">•</span>
          <span>📊 580 XP Available</span>
          <span className="text-[#30363d]">•</span>
          <span>🏴 3 Flags to Capture</span>
        </div>
      </div>
    </div>
  );
}
