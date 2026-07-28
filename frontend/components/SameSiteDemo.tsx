'use client';

import React, { useState } from 'react';

interface SameSiteDemoProps {
  onComplete: () => void;
  completed: boolean;
}

interface CellState {
  revealed: boolean;
  userGuessed?: boolean;
}

export default function SameSiteDemo({ onComplete, completed }: SameSiteDemoProps) {
  // Scenarios mapping
  const scenarios = [
    {
      id: 'same_site',
      title: 'Same-site request',
      description: 'Clicking a link/button within the SAME domain (e.g., staffhub.thm to staffhub.thm)',
      answers: { strict: true, lax: true, none: true }
    },
    {
      id: 'top_level_nav',
      title: 'Top-level navigation',
      description: 'Clicking a standard link from an external site pointing to staffhub.thm',
      answers: { strict: false, lax: true, none: true }
    },
    {
      id: 'cross_site_post',
      title: 'Cross-site form POST',
      description: 'An external site submitting an HTML form to staffhub.thm settings page via POST',
      answers: { strict: false, lax: false, none: true }
    },
    {
      id: 'cross_site_media',
      title: 'Cross-site image/iframe',
      description: 'An external site loading an image or iframe from staffhub.thm via GET',
      answers: { strict: false, lax: false, none: true }
    }
  ];

  // Grid state
  const [grid, setGrid] = useState<Record<string, Record<string, CellState>>>(() => {
    const initialGrid: Record<string, Record<string, CellState>> = {};
    scenarios.forEach(s => {
      initialGrid[s.id] = {
        strict: { revealed: false },
        lax: { revealed: false },
        none: { revealed: false }
      };
    });
    return initialGrid;
  });

  const handleCellClick = (scenarioId: string, attr: 'strict' | 'lax' | 'none') => {
    if (grid[scenarioId]?.[attr]?.revealed) return;
    
    setGrid(prev => ({
      ...prev,
      [scenarioId]: {
        ...prev[scenarioId],
        [attr]: { revealed: true }
      }
    }));
  };

  const revealAll = () => {
    const newGrid: Record<string, Record<string, CellState>> = {};
    scenarios.forEach(s => {
      newGrid[s.id] = {
        strict: { revealed: true },
        lax: { revealed: true },
        none: { revealed: true }
      };
    });
    setGrid(newGrid);
  };

  // Check if all cells revealed
  const allRevealed = scenarios.every(s => 
    grid[s.id]?.strict?.revealed && 
    grid[s.id]?.lax?.revealed && 
    grid[s.id]?.none?.revealed
  );

  return (
    <div className="mt-6 bg-[#161b22] border border-[#30363d] rounded-xl p-5 font-sans">
      <div className="flex items-center justify-between border-b border-[#30363d] pb-3 mb-4">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            🍪 Interactive SameSite Matrix
          </h4>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Click cells to explore cookie transfer behavior in cross-site requests.
          </p>
        </div>
        {!allRevealed && !completed && (
          <button 
            onClick={revealAll}
            className="text-xs px-2.5 py-1 rounded bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] transition text-[#8b949e] hover:text-white cursor-pointer"
          >
            Reveal All
          </button>
        )}
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#30363d]">
              <th className="py-2.5 text-[#8b949e] font-semibold w-1/2">Scenario</th>
              <th className="py-2.5 text-center text-[#58a6ff] font-semibold w-1/6">SameSite=Strict</th>
              <th className="py-2.5 text-center text-[#00d4aa] font-semibold w-1/6">SameSite=Lax</th>
              <th className="py-2.5 text-center text-[#bc8cff] font-semibold w-1/6">SameSite=None</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map(s => (
              <tr key={s.id} className="border-b border-[#21262d] hover:bg-[#1c2333]/30 transition">
                <td className="py-3 pr-4">
                  <div className="font-bold text-white">{s.title}</div>
                  <div className="text-[11px] text-[#8b949e] mt-0.5 leading-normal">{s.description}</div>
                </td>
                
                {/* STRICT */}
                <td className="py-3 text-center">
                  <button
                    onClick={() => handleCellClick(s.id, 'strict')}
                    className={`w-10 h-10 rounded-lg border text-base flex items-center justify-center mx-auto transition-all duration-300 font-semibold cursor-pointer ${
                      grid[s.id]?.strict?.revealed
                        ? s.answers.strict 
                          ? 'bg-[#1e3a2b] border-[#00d4aa] text-[#00d4aa]' 
                          : 'bg-[#3b1d1f] border-[#f85149] text-[#f85149]'
                        : 'bg-[#21262d] border-[#30363d] hover:border-[#8b949e] text-[#8b949e]'
                    }`}
                  >
                    {grid[s.id]?.strict?.revealed ? (s.answers.strict ? '✅' : '❌') : '?'}
                  </button>
                </td>

                {/* LAX */}
                <td className="py-3 text-center">
                  <button
                    onClick={() => handleCellClick(s.id, 'lax')}
                    className={`w-10 h-10 rounded-lg border text-base flex items-center justify-center mx-auto transition-all duration-300 font-semibold cursor-pointer ${
                      grid[s.id]?.lax?.revealed
                        ? s.answers.lax 
                          ? 'bg-[#1e3a2b] border-[#00d4aa] text-[#00d4aa]' 
                          : 'bg-[#3b1d1f] border-[#f85149] text-[#f85149]'
                        : 'bg-[#21262d] border-[#30363d] hover:border-[#8b949e] text-[#8b949e]'
                    }`}
                  >
                    {grid[s.id]?.lax?.revealed ? (s.answers.lax ? '✅' : '❌') : '?'}
                  </button>
                </td>

                {/* NONE */}
                <td className="py-3 text-center">
                  <button
                    onClick={() => handleCellClick(s.id, 'none')}
                    className={`w-10 h-10 rounded-lg border text-base flex items-center justify-center mx-auto transition-all duration-300 font-semibold cursor-pointer ${
                      grid[s.id]?.none?.revealed
                        ? s.answers.none 
                          ? 'bg-[#1e3a2b] border-[#00d4aa] text-[#00d4aa]' 
                          : 'bg-[#3b1d1f] border-[#f85149] text-[#f85149]'
                        : 'bg-[#21262d] border-[#30363d] hover:border-[#8b949e] text-[#8b949e]'
                    }`}
                  >
                    {grid[s.id]?.none?.revealed ? (s.answers.none ? '✅' : '❌') : '?'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Completion Banner */}
      <div className="mt-5 border-t border-[#30363d] pt-4 flex items-center justify-between">
        <div className="text-[11px] text-[#8b949e] max-w-[70%]">
          💡 <span className="font-semibold text-[#e6edf3]">Strict:</span> Cookie never sent cross-site. <br />
          💡 <span className="font-semibold text-[#e6edf3]">Lax:</span> Sent only on top-level GET links. <br />
          💡 <span className="font-semibold text-[#e6edf3]">None:</span> Always sent (requires Secure flag).
        </div>

        {completed ? (
          <div className="bg-[#1e3a2b] border border-[#00d4aa] text-[#00d4aa] text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5">
            🎉 Demo Completed (+25 XP)
          </div>
        ) : allRevealed ? (
          <button
            onClick={onComplete}
            className="bg-[#00d4aa] hover:bg-[#00bda0] text-[#0d1117] text-xs font-black px-4 py-2.5 rounded-xl cursor-pointer shadow-[0_0_10px_rgba(0,212,170,0.2)] hover:shadow-[0_0_15px_rgba(0,212,170,0.4)] transition"
          >
            🔓 Complete Demo
          </button>
        ) : (
          <div className="text-xs text-[#6e7681]">
            Reveal all 12 cells to complete...
          </div>
        )}
      </div>
    </div>
  );
}
