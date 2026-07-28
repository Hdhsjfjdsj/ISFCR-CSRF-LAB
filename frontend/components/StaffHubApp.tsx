'use client';

import React, { useState, useEffect } from 'react';

interface StaffHubAppProps {
  session: {
    token: string;
    staffhubState: {
      aliceEmail: string;
      aliceRole: string;
      aliceStatus: string;
      bobyEmail: string;
      bobyRole: string;
      bobyStatus: string;
      flags: string[];
      activityLog: Array<{ time: number; action: string }>;
    };
  } | null;
  onStateChange: () => void;
}

interface User {
  username: string;
  displayName: string;
  email: string;
  role: string;
  status?: string;
}

export default function StaffHubApp({ session, onStateChange }: StaffHubAppProps) {
  const [view, setView] = useState<'login' | 'dashboard' | 'settings'>('login');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Login form states
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  // Settings states
  const [emailInput, setEmailInput] = useState('');
  const [statusInput, setStatusInput] = useState('');
  const [roleUser, setRoleUser] = useState('boby');
  const [roleVal, setRoleVal] = useState('admin');
  const [csrfToken, setCsrfToken] = useState('');
  const [tokenLoading, setTokenLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Get backend host context
  const getBackendUrl = () => {
    // Determine backend host
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  };

  // Sync profile if user is logged in
  const fetchProfile = async () => {
    try {
      const res = await fetch(`${getBackendUrl()}/api/app/profile`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setView('dashboard');
      } else {
        setUser(null);
        setView('login');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput || !passwordInput) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${getBackendUrl()}/api/app/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput,
          labToken: session?.token
        }),
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setView('dashboard');
        onStateChange();
      } else {
        const errData = await res.json();
        setError(errData.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${getBackendUrl()}/api/app/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) {
      // ignore
    }
    setUser(null);
    setView('login');
    setUsernameInput('');
    setPasswordInput('');
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setLoading(true);
    setActionSuccess('');
    setError('');

    try {
      const res = await fetch(`${getBackendUrl()}/api/app/settings/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim() }),
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        setActionSuccess('Email updated successfully!');
        setEmailInput('');
        fetchProfile();
        onStateChange();
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to update email');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusInput.trim()) return;

    setLoading(true);
    setActionSuccess('');
    setError('');

    try {
      const res = await fetch(`${getBackendUrl()}/api/app/settings/status?status=${encodeURIComponent(statusInput.trim())}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (res.ok) {
        setActionSuccess('Profile status message updated successfully!');
        setStatusInput('');
        fetchProfile();
        onStateChange();
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to update profile status');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCsrfToken = async () => {
    setTokenLoading(true);
    try {
      const res = await fetch(`${getBackendUrl()}/api/app/csrf-token`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setCsrfToken(data.token);
      }
    } catch (e) {
      // ignore
    } finally {
      setTokenLoading(false);
    }
  };

  const handleRoleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setActionSuccess('');
    setError('');

    try {
      const res = await fetch(`${getBackendUrl()}/api/app/settings/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: roleUser,
          role: roleVal,
          csrf_token: csrfToken
        }),
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        setActionSuccess(`Role for ${roleUser} updated to ${roleVal}!`);
        onStateChange();
      } else {
        const errData = await res.json();
        setError(errData.error || 'Validation failed');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const getUrlPath = () => {
    if (view === 'login') return '/login';
    if (view === 'dashboard') return '/dashboard';
    if (view === 'settings') return '/settings';
    return '/';
  };

  return (
    <div className="w-full bg-[#f8fafc] text-slate-800 rounded-xl border border-slate-300 overflow-hidden shadow-2xl font-sans min-h-[600px] flex flex-col">
      {/* Browser Chrome Frame */}
      <div className="bg-slate-200 border-b border-slate-300 px-4 py-2.5 flex items-center gap-3 shrink-0">
        <div className="flex gap-1.5 shrink-0">
          <span className="w-3 h-3 rounded-full bg-[#f85149]" />
          <span className="w-3 h-3 rounded-full bg-[#d29922]" />
          <span className="w-3 h-3 rounded-full bg-[#00d4aa]" />
        </div>
        
        {/* URL Bar */}
        <div className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1 text-xs text-slate-500 font-mono flex items-center select-none truncate">
          <span className="text-slate-300 select-none mr-1">http://</span>
          staffhub.thm:8080{getUrlPath()}
        </div>
      </div>

      {/* Embedded App Viewport */}
      <div className="flex-grow flex flex-col bg-[#f1f5f9] min-h-[500px]">
        {/* LOGIN VIEW */}
        {view === 'login' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl shadow-md p-8">
              <div className="text-center mb-6">
                <span className="text-3xl">🏢</span>
                <h1 className="text-xl font-black text-slate-900 tracking-tight mt-2">
                  StaffHub Portal
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">Enterprise Employee Sign In</p>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-3.5 py-2.5 rounded-lg">
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="e.g. boby"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none rounded-lg px-3 py-2 text-sm text-slate-950 transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none rounded-lg px-3 py-2 text-sm text-slate-950 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-lg py-2 text-sm transition mt-2 cursor-pointer shadow-md"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* LOGGED IN VIEWS */}
        {view !== 'login' && user && (
          <div className="flex-1 flex flex-col">
            {/* Nav Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏢</span>
                <span className="font-extrabold text-slate-900 text-sm tracking-tight">StaffHub</span>
              </div>
              
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="text-slate-500">
                  Welcome, <strong className="text-slate-900">{user.displayName}</strong> 
                  <span className="bg-slate-100 border border-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full ml-1.5 capitalize">{user.role}</span>
                </span>
                
                <button
                  onClick={handleLogout}
                  className="text-slate-500 hover:text-red-600 transition text-[11px]"
                >
                  Sign Out
                </button>
              </div>
            </header>

            {/* Layout Wrapper */}
            <div className="flex-grow flex">
              {/* Sidebar */}
              <aside className="w-48 bg-white border-r border-slate-200 p-4 flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => setView('dashboard')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                    view === 'dashboard'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  📊 Dashboard
                </button>
                <button
                  onClick={() => setView('settings')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                    view === 'settings'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  ⚙️ Settings
                </button>
              </aside>

              {/* Main Content Area */}
              <main className="flex-grow p-6 overflow-y-auto max-h-[500px]">
                {/* DASHBOARD VIEW */}
                {view === 'dashboard' && (
                  <div className="flex flex-col gap-5">
                    {/* Welcome banner */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl p-5 shadow-sm">
                      <h2 className="text-lg font-black">Welcome back to the Employee Hub!</h2>
                      <p className="text-xs text-blue-100 mt-1">Manage configurations, update credentials, and review user updates.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Profile details */}
                      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Profile Information</h3>
                        <div className="flex flex-col gap-3 text-xs">
                          <div>
                            <span className="text-slate-500 block">Full Name</span>
                            <span className="font-semibold text-slate-800 text-sm">{user.displayName}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Email Address</span>
                            <span className="font-semibold text-slate-800 text-sm">{user.email}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Authorized Role</span>
                            <span className="font-semibold text-slate-800 text-sm capitalize">{user.role}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Profile Status</span>
                            <span className="font-semibold text-slate-850 text-sm">{user.status || 'Feeling secure'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Flags widget if student is Admin (alice) */}
                      {user.username === 'alice' && (
                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                            🏴 Secure Flag Vault (Root)
                          </h3>
                          {session?.staffhubState?.flags && session.staffhubState.flags.length > 0 ? (
                            <div className="flex flex-col gap-2">
                              {session.staffhubState.flags.map((flag, idx) => (
                                <div key={idx} className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-2.5 text-xs font-mono select-all flex justify-between items-center">
                                  <span>{flag}</span>
                                  <span className="bg-green-100 text-[10px] px-2 py-0.5 rounded border border-green-300">Active</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-xs text-slate-400 font-semibold border-2 border-dashed border-slate-200 rounded-lg">
                              No logs flagged. Perform authorized state updates to trigger flags.
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Activity Log */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Enterprise Audit Logs</h3>
                      <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto font-mono text-[11px] leading-relaxed">
                        {session?.staffhubState?.activityLog && session.staffhubState.activityLog.length > 0 ? (
                          session.staffhubState.activityLog.map((log, idx) => (
                            <div key={idx} className="border-b border-slate-100 pb-2 last:border-0 flex items-start gap-2">
                              <span className="text-slate-400 shrink-0">
                                [{new Date(log.time).toLocaleTimeString()}]
                              </span>
                              <span className="text-slate-700">{log.action}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-400">No activity recorded.</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* SETTINGS VIEW */}
                {view === 'settings' && (
                  <div className="flex flex-col gap-6">
                    {actionSuccess && (
                      <div className="bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-4 py-3 rounded-lg shadow-sm">
                        🎉 {actionSuccess}
                      </div>
                    )}
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-4 py-3 rounded-lg shadow-sm">
                        ⚠️ {error}
                      </div>
                    )}

                    <div className="grid grid-cols-1 xl:grid-cols-3 md:grid-cols-2 gap-6">
                      {/* Status Settings */}
                      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
                        <div className="mb-4">
                          <h3 className="text-sm font-black text-slate-800">Update Profile Status</h3>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">// Shortcut action: uses GET request parameters</span>
                        </div>

                        <form onSubmit={handleStatusUpdate} className="flex flex-col gap-4 flex-grow justify-between">
                          <div className="flex flex-col gap-3">
                            <div>
                              <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-wider">Current Status</span>
                              <span className="text-slate-800 text-xs font-semibold">{user.status || 'Feeling secure'}</span>
                            </div>
                            <div>
                              <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                                New Status Message
                              </label>
                              <input
                                type="text"
                                required
                                value={statusInput}
                                onChange={(e) => setStatusInput(e.target.value)}
                                placeholder="e.g. Hacked!"
                                className="w-full bg-slate-50 border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none rounded-lg px-3 py-2 text-xs text-slate-900 transition"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-lg py-2 text-xs transition cursor-pointer mt-4"
                          >
                            {loading ? 'Saving...' : 'Update Status'}
                          </button>
                        </form>
                      </div>

                      {/* Email Settings */}
                      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
                        <div className="mb-4">
                          <h3 className="text-sm font-black text-slate-800">Update Account Email</h3>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">// TODO: Implement security token validation</span>
                        </div>

                        <form onSubmit={handleEmailUpdate} className="flex flex-col gap-4 flex-grow justify-between">
                          <div className="flex flex-col gap-3">
                            <div>
                              <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-wider">Current Email</span>
                              <span className="text-slate-800 text-xs font-semibold">{user.email}</span>
                            </div>
                            <div>
                              <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                                New Email Address
                              </label>
                              <input
                                type="email"
                                required
                                value={emailInput}
                                onChange={(e) => setEmailInput(e.target.value)}
                                placeholder="e.g. new@staffhub.thm"
                                className="w-full bg-slate-50 border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none rounded-lg px-3 py-2 text-xs text-slate-900 transition"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-lg py-2 text-xs transition cursor-pointer mt-4"
                          >
                            {loading ? 'Saving...' : 'Update Email'}
                          </button>
                        </form>
                      </div>

                      {/* Role Settings */}
                      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
                        <div className="mb-4">
                          <h3 className="text-sm font-black text-slate-800">Administrative Role Control</h3>
                          <span className="text-[10px] text-red-500 font-mono block mt-0.5">// Warning: Access restriction active (Strict Token Check)</span>
                        </div>

                        <form onSubmit={handleRoleUpdate} className="flex flex-col gap-4 flex-grow justify-between">
                          <div className="flex flex-col gap-3">
                            <div>
                              <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">
                                Target Employee
                              </label>
                              <select
                                value={roleUser}
                                onChange={(e) => setRoleUser(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:border-blue-500 outline-none cursor-pointer"
                              >
                                <option value="boby">Boby Smith (Staff)</option>
                                <option value="alice">Alice Johnson (Admin)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">
                                Designated Role
                              </label>
                              <select
                                value={roleVal}
                                onChange={(e) => setRoleVal(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:border-blue-500 outline-none cursor-pointer"
                              >
                                <option value="admin">Administrator</option>
                                <option value="staff">Staff</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center justify-between">
                                <span>Session Security Token</span>
                                <button
                                  type="button"
                                  onClick={fetchCsrfToken}
                                  disabled={tokenLoading}
                                  className="text-blue-600 hover:text-blue-800 text-[9px] font-semibold border-b border-blue-600 cursor-pointer"
                                >
                                  {tokenLoading ? 'Requesting...' : 'Get Session Token'}
                                </button>
                              </label>
                              <input
                                type="text"
                                readOnly
                                value={csrfToken}
                                onChange={(e) => setCsrfToken(e.target.value)}
                                placeholder="Request token or supply forgery..."
                                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-[10px] text-slate-800 outline-none font-mono placeholder-slate-400"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={loading || user.role !== 'admin'}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-lg py-2 text-xs transition cursor-pointer mt-4"
                          >
                            {user.role !== 'admin' ? 'Requires Admin Privileges' : loading ? 'Validating...' : 'Update Privilege'}
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </main>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
