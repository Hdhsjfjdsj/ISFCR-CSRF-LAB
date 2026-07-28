import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { labSessions } from './lab.routes';

export const staffhubSessions = new Map<string, { username: string; labToken: string }>();

const router = Router();

const defaultUsers: Record<string, { displayName: string; password: string }> = {
  alice: { displayName: 'Alice Johnson', password: 'seedalice' },
  boby: { displayName: 'Boby Smith', password: 'seedboby' }, // pragma: allowlist secret
};

// Helper middleware to get current StaffHub user session
export function getStaffHubSession(req: any) {
  const sessionId = req.cookies?.staffhub_session;
  if (!sessionId) return null;
  return staffhubSessions.get(sessionId) || null;
}

// POST /login
router.post('/login', (req, res) => {
  try {
    const { username, password, labToken } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (String(username).length > 50 || String(password).length > 50) {
      console.warn(`[Security Alert] Login attempt rejected: input length exceeds limit from IP ${req.ip}`);
      return res.status(400).json({ error: 'Username and password must be under 50 characters' });
    }

    if (labToken && !/^[a-fA-F0-9-]{36}$/.test(String(labToken))) {
      console.warn(`[Security Alert] Login attempt rejected: invalid labToken format from IP ${req.ip}`);
      return res.status(400).json({ error: 'Invalid session token format' });
    }

    const userKey = String(username).toLowerCase();
    const userDefault = defaultUsers[userKey];

    if (!userDefault || userDefault.password !== password) {
      console.warn(`[Security Alert] Failed login attempt for user "${username}" from IP ${req.ip}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Determine labToken. If not provided in body, see if we can infer from existing sessions
    // or if the student has a session.
    let associatedLabToken = labToken;
    if (!associatedLabToken) {
      // Find the most recently active lab session if any
      const sessions = Array.from(labSessions.values()).sort((a, b) => b.startedAt - a.startedAt);
      if (sessions.length > 0) {
        associatedLabToken = sessions[0].token;
      }
    }

    const sessionId = uuid();
    staffhubSessions.set(sessionId, {
      username: userKey,
      labToken: associatedLabToken || '',
    });

    res.cookie('staffhub_session', sessionId, {
      httpOnly: false, // accessible to frontend JS for inspection in DevTools
      path: '/',
      sameSite: 'lax', // basic lax cookie setting
    });

    // Load dynamic state from lab session if available
    let email = userKey === 'alice' ? 'alice@staffhub.thm' : 'boby@staffhub.thm';
    let role = userKey === 'alice' ? 'admin' : 'staff';
    let status = userKey === 'alice' ? 'Feeling secure' : 'Learning CSRF';

    if (associatedLabToken) {
      const labSession = labSessions.get(associatedLabToken);
      if (labSession) {
        if (userKey === 'alice') {
          email = labSession.staffhubState.aliceEmail;
          role = labSession.staffhubState.aliceRole;
          status = (labSession.staffhubState as any).aliceStatus || 'Feeling secure';
        } else if (userKey === 'boby') {
          email = labSession.staffhubState.bobyEmail;
          role = labSession.staffhubState.bobyRole;
          status = (labSession.staffhubState as any).bobyStatus || 'Learning CSRF';
        }
      }
    }

    res.json({
      success: true,
      user: {
        username: userKey,
        displayName: userDefault.displayName,
        email,
        role,
        status,
      }
    });
  } catch (error) {
    console.error('Error during StaffHub login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /logout
router.post('/logout', (req, res) => {
  const sessionId = req.cookies?.staffhub_session;
  if (sessionId) {
    staffhubSessions.delete(sessionId);
  }
  res.clearCookie('staffhub_session');
  res.json({ success: true });
});

// GET /profile
router.get('/profile', (req, res) => {
  const session = getStaffHubSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { username, labToken } = session;
  const userDefault = defaultUsers[username];

  let email = username === 'alice' ? 'alice@staffhub.thm' : 'boby@staffhub.thm';
  let role = username === 'alice' ? 'admin' : 'staff';
  let status = username === 'alice' ? 'Feeling secure' : 'Learning CSRF';

  if (labToken) {
    const labSession = labSessions.get(labToken);
    if (labSession) {
      if (username === 'alice') {
        email = labSession.staffhubState.aliceEmail;
        role = labSession.staffhubState.aliceRole;
        status = (labSession.staffhubState as any).aliceStatus || 'Feeling secure';
      } else if (username === 'boby') {
        email = labSession.staffhubState.bobyEmail;
        role = labSession.staffhubState.bobyRole;
        status = (labSession.staffhubState as any).bobyStatus || 'Learning CSRF';
      }
    }
  }

  res.json({
    user: {
      username,
      displayName: userDefault?.displayName || username,
      email,
      role,
      status,
    }
  });
});

// GET /dashboard
router.get('/dashboard', (req, res) => {
  const session = getStaffHubSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { username, labToken } = session;
  const userDefault = defaultUsers[username];

  let email = username === 'alice' ? 'alice@staffhub.thm' : 'boby@staffhub.thm';
  let role = username === 'alice' ? 'admin' : 'staff';
  let status = username === 'alice' ? 'Feeling secure' : 'Learning CSRF';
  let flags: string[] = [];
  let activityLog: { time: number; action: string }[] = [];

  if (labToken) {
    const labSession = labSessions.get(labToken);
    if (labSession) {
      flags = labSession.staffhubState.flags;
      activityLog = labSession.staffhubState.activityLog;
      if (username === 'alice') {
        email = labSession.staffhubState.aliceEmail;
        role = labSession.staffhubState.aliceRole;
        status = (labSession.staffhubState as any).aliceStatus || 'Feeling secure';
      } else if (username === 'boby') {
        email = labSession.staffhubState.bobyEmail;
        role = labSession.staffhubState.bobyRole;
        status = (labSession.staffhubState as any).bobyStatus || 'Learning CSRF';
      }
    }
  }

  res.json({
    user: {
      username,
      displayName: userDefault?.displayName || username,
      email,
      role,
      status,
    },
    flags,
    activityLog,
  });
});

// GET /settings/status — CSRF GET VULNERABLE
router.get('/settings/status', (req, res) => {
  const session = getStaffHubSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { status } = req.query;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const rawStatus = String(status || '');
  if (rawStatus.length > 200) {
    return res.status(400).json({ error: 'Status message must be under 200 characters' });
  }

  const cleanStatus = rawStatus.trim().replace(/[<>'"&]/g, (m) => {
    switch (m) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case "'": return '&#x27;';
      case '"': return '&quot;';
      case '&': return '&amp;';
      default: return m;
    }
  });

  const { username, labToken } = session;
  let flag: string | undefined;

  if (labToken) {
    const labSession = labSessions.get(labToken);
    if (labSession) {
      const state = labSession.staffhubState;
      if (username === 'alice') {
        const oldStatus = (state as any).aliceStatus || 'Feeling secure';
        (state as any).aliceStatus = cleanStatus;
        state.activityLog.unshift({
          time: Date.now(),
          action: `Alice changed her status from "${oldStatus}" to "${cleanStatus}"`,
        });

        // Trigger flag if status changed to 'Hacked!'
        if (cleanStatus.trim() === 'Hacked!' && !state.flags.includes('THM{CSRF_GET_Request_Exploit_99}')) {
          flag = 'THM{CSRF_GET_Request_Exploit_99}';
          state.flags.push(flag);

          // Update lab task status for task5 (the new GET task)
          const taskState = labSession.tasks['task5'];
          if (taskState && !taskState.completed) {
            taskState.flagEarned = true;
            taskState.completed = true;
            labSession.score += 80; // Flag XP

            // Unlock task6 (HTML Form Attack)
            if (labSession.tasks['task6']) {
              labSession.tasks['task6'].started = true;
            }
          }
        }
      } else if (username === 'boby') {
        const oldStatus = (state as any).bobyStatus || 'Learning CSRF';
        (state as any).bobyStatus = cleanStatus;
        state.activityLog.unshift({
          time: Date.now(),
          action: `Boby changed his status from "${oldStatus}" to "${cleanStatus}"`,
        });
      }
    }
  }

  res.json({
    success: true,
    message: 'Status updated successfully',
    status: cleanStatus,
    ...(flag ? { flag } : {})
  });
});

// POST /settings/email — CSRF VULNERABLE (no token check)
router.post('/settings/email', (req, res) => {
  const session = getStaffHubSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const cleanEmail = String(email).trim();
  if (cleanEmail.length > 100) {
    return res.status(400).json({ error: 'Email must be under 100 characters' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const { username, labToken } = session;
  let flag: string | undefined;

  if (labToken) {
    const labSession = labSessions.get(labToken);
    if (labSession) {
      const state = labSession.staffhubState;
      if (username === 'alice') {
        const oldEmail = state.aliceEmail;
        state.aliceEmail = cleanEmail;
        state.activityLog.unshift({
          time: Date.now(),
          action: `Alice changed her email from ${oldEmail} to ${cleanEmail}`,
        });

        // Trigger flag if email changed to the attacker's target
        if (cleanEmail === 'attacker@evilmail.thm' && !state.flags.includes('THM{CSRF_Email_Hijacked_001}')) {
          flag = 'THM{CSRF_Email_Hijacked_001}';
          state.flags.push(flag);
          
          // Update lab task status
          const taskState = labSession.tasks['task6'];
          if (taskState && !taskState.completed) {
            taskState.flagEarned = true;
            taskState.completed = true;
            labSession.score += 100; // Flag XP
            
            // Unlock task 7
            if (labSession.tasks['task7']) {
              labSession.tasks['task7'].started = true;
            }
          }
        }
      } else if (username === 'boby') {
        const oldEmail = state.bobyEmail;
        state.bobyEmail = cleanEmail;
        state.activityLog.unshift({
          time: Date.now(),
          action: `Boby changed his email from ${oldEmail} to ${cleanEmail}`,
        });
      }
    }
  }

  res.json({
    success: true,
    message: 'Email updated successfully',
    email,
    ...(flag ? { flag } : {})
  });
});

// POST /settings/role — WEAK CSRF TOKEN CHECK
router.post('/settings/role', (req, res) => {
  const session = getStaffHubSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { username, role, csrf_token } = req.body;
  if (!username || !role) {
    return res.status(400).json({ error: 'Username and role are required' });
  }

  if (String(username).length > 50 || String(role).length > 50) {
    return res.status(400).json({ error: 'Invalid parameter length' });
  }

  const cleanUsername = String(username).trim().toLowerCase();
  const cleanRole = String(role).trim().toLowerCase();

  if (!/^[a-zA-Z0-9_\-]+$/.test(cleanUsername)) {
    return res.status(400).json({ error: 'Invalid username format' });
  }
  if (!['admin', 'staff'].includes(cleanRole)) {
    return res.status(400).json({ error: 'Invalid role value' });
  }

  // 1. Validate Weak CSRF Token
  if (!csrf_token) {
    console.warn(`[Security Alert] Role update rejected: CSRF token missing for user "${session.username}" from IP ${req.ip}`);
    return res.status(403).json({ error: 'CSRF token is missing' });
  }

  if (String(csrf_token).length > 100) {
    console.warn(`[Security Alert] Role update rejected: CSRF token length limit exceeded from IP ${req.ip}`);
    return res.status(403).json({ error: 'CSRF token is too long' });
  }

  try {
    const decoded = Buffer.from(csrf_token, 'base64').toString('ascii');
    const parts = decoded.split(':');
    if (parts.length !== 2) {
      console.warn(`[Security Alert] Role update rejected: CSRF token invalid format from IP ${req.ip}`);
      return res.status(403).json({ error: 'Invalid CSRF token format' });
    }

    const tokenUser = parts[0];
    const tokenTimestamp = parseInt(parts[1], 10);
    const currentTimestamp = Math.floor(Date.now() / 60000);

    // Token must belong to the victim user 'alice' who is making the request in the simulation
    // and timestamp must be within 2 minutes of current server time.
    if (Math.abs(currentTimestamp - tokenTimestamp) > 2) {
      console.warn(`[Security Alert] Role update rejected: CSRF token expired for user "${tokenUser}" (timestamp: ${tokenTimestamp}, current: ${currentTimestamp}) from IP ${req.ip}`);
      return res.status(403).json({ error: 'CSRF token expired' });
    }

    // In a real CSRF attack, Alice's browser makes the request, so the session user is alice.
    // However, the token checks that Alice's token matches Alice's request.
    if (tokenUser !== session.username) {
      console.warn(`[Security Alert] Role update rejected: CSRF token user mismatch. Token user: "${tokenUser}", Session user: "${session.username}" from IP ${req.ip}`);
      return res.status(403).json({ error: 'CSRF token mismatch' });
    }

  } catch (err) {
    console.warn(`[Security Alert] Role update rejected: Failed to parse CSRF token base64 from IP ${req.ip}`);
    return res.status(403).json({ error: 'Failed to parse CSRF token' });
  }

  const { labToken } = session;
  let flag: string | undefined;

  if (labToken) {
    const labSession = labSessions.get(labToken);
    if (labSession) {
      const state = labSession.staffhubState;

      if (cleanUsername === 'alice') {
        const oldRole = state.aliceRole;
        state.aliceRole = cleanRole;
        state.activityLog.unshift({
          time: Date.now(),
          action: `Alice changed her role from ${oldRole} to ${cleanRole}`,
        });

        // Trigger flag if alice is demoted to staff
        if (cleanRole === 'staff' && !state.flags.includes('THM{Weak_Token_Bypassed_007}')) {
          flag = 'THM{Weak_Token_Bypassed_007}';
          state.flags.push(flag);

          // Update lab task status
          const taskState = labSession.tasks['task7'];
          if (taskState && !taskState.completed) {
            taskState.flagEarned = true;
            taskState.completed = true;
            labSession.score += 80; // Flag XP
            
            // Unlock task 8
            if (labSession.tasks['task8']) {
              labSession.tasks['task8'].started = true;
            }
          }
        }
      } else if (cleanUsername === 'boby') {
        const oldRole = state.bobyRole;
        state.bobyRole = cleanRole;
        state.activityLog.unshift({
          time: Date.now(),
          action: `Boby changed his role from ${oldRole} to ${cleanRole}`,
        });
      }
    }
  }

  res.json({
    success: true,
    message: `Role for ${cleanUsername} updated to ${cleanRole} successfully`,
    ...(flag ? { flag } : {})
  });
});

// GET /csrf-token — Get weak CSRF token
router.get('/csrf-token', (req, res) => {
  const session = getStaffHubSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { username } = session;
  const minuteTimestamp = Math.floor(Date.now() / 60000);
  const token = Buffer.from(`${username}:${minuteTimestamp}`).toString('base64');
  
  res.json({ token });
});

export default router;
