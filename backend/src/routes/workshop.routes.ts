import { Router } from 'express';
import * as cheerio from 'cheerio';
import { labSessions } from './lab.routes';

const router = Router();

// POST /attack
router.post('/attack', (req, res) => {
  try {
    const { labToken, html, targetTask } = req.body;

    if (!labToken || !html) {
      return res.status(400).json({ error: 'Missing labToken or html payload' });
    }

    if (!/^[a-fA-F0-9-]{36}$/.test(String(labToken))) {
      console.warn(`[Security Alert] Invalid token format in workshop attack: "${labToken}"`);
      return res.status(400).json({ error: 'Invalid session token format' });
    }

    if (targetTask && !/^task[1-9]$/.test(String(targetTask))) {
      console.warn(`[Security Alert] Invalid targetTask format in workshop attack: "${targetTask}"`);
      return res.status(400).json({ error: 'Invalid target task format' });
    }

    if (typeof html !== 'string' || html.length > 50000) {
      console.warn(`[Security Alert] Workshop attack payload rejected: size exceeds limit from IP ${req.ip}`);
      return res.status(400).json({ error: 'HTML payload size limit exceeded (max 50KB)' });
    }

    const labSession = labSessions.get(labToken);
    if (!labSession) {
      return res.status(404).json({ error: 'Lab session not found' });
    }

    const $ = cheerio.load(html);
    const requests: any[] = [];
    const stateChanges: string[] = [];
    const flagsEarned: string[] = [];
    let success = false;
    let attackType = 'HTML Form Submission';

    // 1. Process all forms
    $('form').each((_, element) => {
      const form = $(element);
      const action = form.attr('action') || '';
      const method = (form.attr('method') || 'GET').toUpperCase();
      
      const body: Record<string, string> = {};
      form.find('input, select, textarea').each((_, inputElem) => {
        const input = $(inputElem);
        const name = input.attr('name');
        const value = input.attr('value') || input.val() || '';
        if (name) {
          body[name] = String(value);
        }
      });

      // Simulate sending the form request
      const actionLower = action.toLowerCase();
      
      if (actionLower.includes('/settings/email') || actionLower.includes('/api/app/settings/email')) {
        if (method === 'POST') {
          const newEmail = body.email || '';
          if (newEmail) {
            let responseMsg = 'Email updated successfully';
            let flag: string | undefined;
            
            // Perform action on behalf of Alice (the victim)
            const oldEmail = labSession.staffhubState.aliceEmail;
            labSession.staffhubState.aliceEmail = newEmail;
            labSession.staffhubState.activityLog.unshift({
              time: Date.now(),
              action: `Alice (Victim simulation) changed email from ${oldEmail} to ${newEmail} via CSRF`,
            });

            stateChanges.push(`Alice's email changed from "${oldEmail}" to "${newEmail}"`);

            if (newEmail.trim() === 'attacker@evilmail.thm') {
              success = true;
              flag = 'THM{CSRF_Email_Hijacked_001}';
              if (!labSession.staffhubState.flags.includes(flag)) {
                labSession.staffhubState.flags.push(flag);
                flagsEarned.push(flag);

                // Update task6 progress in session
                const tState = labSession.tasks['task6'];
                if (tState && !tState.completed) {
                  tState.flagEarned = true;
                  tState.completed = true;
                  labSession.score += 100;
                  
                  if (labSession.tasks['task7']) {
                    labSession.tasks['task7'].started = true;
                  }
                }
              }
            }

            requests.push({
              method: 'POST',
              url: action,
              body,
              response: {
                status: 200,
                message: responseMsg,
                ...(flag ? { flag } : {})
              }
            });
          } else {
            requests.push({
              method: 'POST',
              url: action,
              body,
              response: { status: 400, message: 'Bad Request: Email input missing' }
            });
          }
        } else {
          // If GET is used on email settings
          requests.push({
            method: method,
            url: action,
            body,
            response: { status: 405, message: 'Method Not Allowed: Email update requires POST' }
          });
        }
      } 
      else if (actionLower.includes('/settings/role') || actionLower.includes('/api/app/settings/role')) {
        if (method === 'POST') {
          const targetUser = (body.username || '').toLowerCase();
          const targetRole = body.role || '';
          let token = body.csrf_token || '';

          // Auto-solve/inject token if script-based generation is detected or template placeholder is used
          if (!token && (html.includes('btoa') || html.includes('csrf_token') || html.includes('alice') || html.includes('{{ALICE_TOKEN}}'))) {
            const currentTimestamp = Math.floor(Date.now() / 60000);
            token = Buffer.from(`alice:${currentTimestamp}`).toString('base64');
          }

          if (!token) {
            requests.push({
              method: 'POST',
              url: action,
              body,
              response: { status: 403, message: 'Forbidden: CSRF token is missing' }
            });
          } else {
            try {
              const decoded = Buffer.from(token, 'base64').toString('ascii');
              const parts = decoded.split(':');
              const tokenUser = parts[0];
              const tokenTimestamp = parseInt(parts[1], 10);
              const currentTimestamp = Math.floor(Date.now() / 60000);

              if (parts.length !== 2 || tokenUser !== 'alice' || Math.abs(currentTimestamp - tokenTimestamp) > 2) {
                requests.push({
                  method: 'POST',
                  url: action,
                  body,
                  response: { status: 403, message: 'Forbidden: Invalid or expired CSRF token' }
                });
              } else {
                // Success! Token valid for alice
                let flag: string | undefined;
                const oldRole = labSession.staffhubState.aliceRole;
                
                if (targetUser === 'alice') {
                  labSession.staffhubState.aliceRole = targetRole;
                  labSession.staffhubState.activityLog.unshift({
                    time: Date.now(),
                    action: `Alice (Victim simulation) changed role from ${oldRole} to ${targetRole} via CSRF`,
                  });
                  stateChanges.push(`Alice's role changed from "${oldRole}" to "${targetRole}"`);

                  if (targetRole === 'staff') {
                    success = true;
                    flag = 'THM{Weak_Token_Bypassed_007}';
                    if (!labSession.staffhubState.flags.includes(flag)) {
                      labSession.staffhubState.flags.push(flag);
                      flagsEarned.push(flag);

                      // Update task7 progress in session
                      const tState = labSession.tasks['task7'];
                      if (tState && !tState.completed) {
                        tState.flagEarned = true;
                        tState.completed = true;
                        labSession.score += 80;
                        
                        if (labSession.tasks['task8']) {
                          labSession.tasks['task8'].started = true;
                        }
                      }
                    }
                  }
                }

                requests.push({
                  method: 'POST',
                  url: action,
                  body,
                  response: {
                    status: 200,
                    message: `Role for ${targetUser} updated to ${targetRole} successfully`,
                    ...(flag ? { flag } : {})
                  }
                });
              }
            } catch (err) {
              requests.push({
                method: 'POST',
                url: action,
                body,
                response: { status: 403, message: 'Forbidden: Malformed CSRF token' }
              });
            }
          }
        } else {
          requests.push({
            method: method,
            url: action,
            body,
            response: { status: 405, message: 'Method Not Allowed: Role update requires POST' }
          });
        }
      } else {
        // Form submitted to some other endpoint
        requests.push({
          method,
          url: action,
          body,
          response: { status: 404, message: 'Not Found: Unknown endpoint' }
        });
      }
    });

    // 2. Process all image tags (GET CSRF)
    $('img').each((_, element) => {
      const img = $(element);
      const src = img.attr('src') || '';
      const srcLower = src.toLowerCase();

      if (srcLower) {
        attackType = 'Image Source Injection';
        // Check if image triggers a GET update
        if (srcLower.includes('/settings/status') || srcLower.includes('/api/app/settings/status')) {
          let statusVal = '';
          try {
            const urlObj = new URL(src, 'http://localhost');
            statusVal = urlObj.searchParams.get('status') || '';
          } catch (e) {
            const match = src.match(/[?&]status=([^&]+)/);
            if (match) {
              statusVal = decodeURIComponent(match[1]);
            }
          }

          if (statusVal) {
            let responseMsg = 'Status updated successfully';
            let flag: string | undefined;

            const oldStatus = (labSession.staffhubState as any).aliceStatus || 'Feeling secure';
            (labSession.staffhubState as any).aliceStatus = statusVal;
            labSession.staffhubState.activityLog.unshift({
              time: Date.now(),
              action: `Alice (Victim simulation) changed status to "${statusVal}" via CSRF GET (img)`,
            });

            stateChanges.push(`Alice's status changed from "${oldStatus}" to "${statusVal}"`);

            if (statusVal.trim() === 'Hacked!') {
              success = true;
              flag = 'THM{CSRF_GET_Request_Exploit_99}';
              if (!labSession.staffhubState.flags.includes(flag)) {
                labSession.staffhubState.flags.push(flag);
                flagsEarned.push(flag);

                // Update task5 progress in session
                const tState = labSession.tasks['task5'];
                if (tState && !tState.completed) {
                  tState.flagEarned = true;
                  tState.completed = true;
                  labSession.score += 80;

                  if (labSession.tasks['task6']) {
                    labSession.tasks['task6'].started = true;
                  }
                }
              }
            }

            requests.push({
              method: 'GET',
              url: src,
              response: {
                status: 200,
                message: responseMsg,
                ...(flag ? { flag } : {})
              }
            });
          } else {
            requests.push({
              method: 'GET',
              url: src,
              response: { status: 400, message: 'Bad Request: status parameter is missing' }
            });
          }
        } else if (srcLower.includes('/settings/email') || srcLower.includes('/api/app/settings/email')) {
          requests.push({
            method: 'GET',
            url: src,
            response: { status: 405, message: 'Method Not Allowed: GET is not supported for email updates' }
          });
        } else if (srcLower.includes('/settings/role') || srcLower.includes('/api/app/settings/role')) {
          requests.push({
            method: 'GET',
            url: src,
            response: { status: 405, message: 'Method Not Allowed: GET is not supported for role updates' }
          });
        } else {
          requests.push({
            method: 'GET',
            url: src,
            response: { status: 200, message: 'Image loaded successfully (No state changes)' }
          });
        }
      }
    });

    // If no forms or images found
    if (requests.length === 0) {
      return res.json({
        success: false,
        attackType: 'None',
        requests: [],
        stateChanges: [],
        flagsEarned: [],
        error: 'No active HTML attack elements (forms, scripts, or image tags) detected.'
      });
    }

    res.json({
      success,
      attackType,
      requests,
      stateChanges,
      flagsEarned
    });

  } catch (error) {
    console.error('Error during victim simulation:', error);
    res.status(500).json({ error: 'Internal server error during simulation' });
  }
});

export default router;
