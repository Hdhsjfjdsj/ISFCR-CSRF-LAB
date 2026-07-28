import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { tasks, questionPools, TaskQuestion } from '../data/tasks';
import { generateGeminiContent } from '../lib/gemini';

export interface LabSessionTaskState {
  completed: boolean;
  started: boolean;
  answersCorrect: string[];
  flagEarned: boolean;
  questions: TaskQuestion[];
  aiQuestion?: string | null;
  aiGradingCriteria?: string | null;
  aiEvaluationFeedback?: string | null;
}

export interface LabSession {
  token: string;
  studentName: string;
  score: number;
  hintsUsed: number;
  startedAt: number;
  expiresAt: number;
  currentTask: string;
  tasks: Record<string, LabSessionTaskState>;
  staffhubState: {
    aliceEmail: string;
    aliceRole: string;
    aliceStatus: string;
    bobyEmail: string;
    bobyRole: string;
    bobyStatus: string;
    flags: string[];
    activityLog: { time: number; action: string }[];
  };
  victimSessionId: string;
}

export const labSessions = new Map<string, LabSession>();

// Import staffhub sessions to register the victim session
import { staffhubSessions } from './staffhub.routes';

const router = Router();

function isValidToken(token: any): boolean {
  return typeof token === 'string' && /^[a-fA-F0-9-]{36}$/.test(token);
}

function isValidTaskId(taskId: any): boolean {
  return typeof taskId === 'string' && /^task[1-9]$/.test(taskId);
}

// Cleanup expired sessions every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of labSessions.entries()) {
    if (session.expiresAt < now) {
      labSessions.delete(token);
      if (session.victimSessionId) {
        staffhubSessions.delete(session.victimSessionId);
      }
    }
  }
}, 10 * 60 * 1000);

// Helper to check task completion
function checkTaskCompletion(session: LabSession, taskId: string): boolean {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return false;

  const tState = session.tasks[taskId];
  if (!tState) return false;

  // Check session specific questions
  const sessionQuestions = tState.questions || [];
  const allQuestionsAnswered = sessionQuestions.every(q => 
    tState.answersCorrect.includes(q.id)
  );

  // Check flag
  const flagRequirementMet = !task.hasFlag || tState.flagEarned;

  return allQuestionsAnswered && flagRequirementMet;
}

// Strip answers from questions
function getSessionTasks(session: LabSession) {
  return tasks.map(task => {
    const sessionQuestions = session.tasks[task.id]?.questions || [];
    return {
      ...task,
      questions: sessionQuestions.map(q => {
        const isCorrect = session.tasks[task.id]?.answersCorrect.includes(q.id);
        if (isCorrect) {
          return q; // Keep the answer field if already correct so UI can highlight it
        }
        const { answer, ...rest } = q;
        return rest; // Strip correct answers before sending to client!
      }),
      aiQuestion: session.tasks[task.id]?.aiQuestion || null,
      aiEvaluationFeedback: session.tasks[task.id]?.aiEvaluationFeedback || null,
    };
  });
}

// POST /start
router.post('/start', (req, res) => {
  try {
    const { studentName } = req.body;
    const cleanName = String(studentName || '').trim();
    if (cleanName && !/^[a-zA-Z0-9\s.\-_]{1,50}$/.test(cleanName)) {
      return res.status(400).json({ error: 'Invalid name format. Only letters, numbers, spaces, hyphens, and underscores are allowed.' });
    }

    const token = uuid();
    const victimSessionId = uuid();
    
    const initialTasksState: Record<string, LabSessionTaskState> = {};
    for (const t of tasks) {
      // Fisher-Yates shuffle for unbiased randomization
      let selectedQuestions: TaskQuestion[] = [];
      const pool = questionPools[t.id];
      if (pool) {
        const shuffled = [...pool];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        const count = t.id === 'task8' ? 3 : t.id === 'task7' ? 2 : 3;
        selectedQuestions = shuffled.slice(0, count).map(q => {
          // Also shuffle the options order per question
          if (q.options) {
            const opts = [...q.options];
            for (let i = opts.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [opts[i], opts[j]] = [opts[j], opts[i]];
            }
            return { ...q, options: opts };
          }
          return { ...q };
        });
      }

      initialTasksState[t.id] = {
        completed: false,
        started: t.id === 'task1',
        answersCorrect: [],
        flagEarned: false,
        questions: selectedQuestions,
      };
    }

    const session: LabSession = {
      token,
      studentName: cleanName || 'Student',
      score: 0,
      hintsUsed: 0,
      startedAt: Date.now(),
      expiresAt: Date.now() + 2 * 60 * 60 * 1000, // 2 hours TTL
      currentTask: 'task1',
      tasks: initialTasksState,
      staffhubState: {
        aliceEmail: 'alice@staffhub.thm',
        aliceRole: 'admin',
        aliceStatus: 'Feeling secure',
        bobyEmail: 'boby@staffhub.thm',
        bobyRole: 'staff',
        bobyStatus: 'Learning CSRF',
        flags: [],
        activityLog: [
          { time: Date.now(), action: 'Lab environment initialized.' },
          { time: Date.now(), action: 'Alice Johnson logged in as Admin.' }
        ]
      },
      victimSessionId,
    };

    labSessions.set(token, session);

    // Register Alice's session mapping
    staffhubSessions.set(victimSessionId, {
      username: 'alice',
      labToken: token,
    });

    res.json({
      token,
      session,
      tasks: getSessionTasks(session),
    });
  } catch (error) {
    console.error('Error starting lab session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /session/:token
router.get('/session/:token', (req, res) => {
  const { token } = req.params;
  if (!isValidToken(token)) {
    console.warn(`[Security Alert] Invalid token format received on /session: "${token}"`);
    return res.status(400).json({ error: 'Invalid session token format' });
  }

  const session = labSessions.get(token);
  if (!session) {
    return res.status(404).json({ error: 'Session not found or expired' });
  }
  
  session.expiresAt = Date.now() + 2 * 60 * 60 * 1000;
  
  res.json({
    session,
    tasks: getSessionTasks(session),
  });
});

// POST /answer
router.post('/answer', (req, res) => {
  const { token, taskId, questionId, answer } = req.body;
  if (!isValidToken(token)) {
    console.warn(`[Security Alert] Invalid token format received on /answer: "${token}"`);
    return res.status(400).json({ error: 'Invalid session token format' });
  }
  if (!isValidTaskId(taskId)) {
    console.warn(`[Security Alert] Invalid taskId format received on /answer: "${taskId}"`);
    return res.status(400).json({ error: 'Invalid task identifier' });
  }
  if (typeof questionId !== 'string' || questionId.length > 50) {
    return res.status(400).json({ error: 'Invalid question identifier' });
  }
  if (typeof answer !== 'string' || answer.length > 100) {
    return res.status(400).json({ error: 'Answer must be under 100 characters' });
  }

  const session = labSessions.get(token);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const tState = session.tasks[taskId];
  if (!tState) {
    return res.status(500).json({ error: 'Task state missing' });
  }

  // Find question details inside the dynamic session array
  const question = tState.questions?.find(q => q.id === questionId);
  if (!question) {
    return res.status(404).json({ error: 'Question not found in this session' });
  }

  if (tState.answersCorrect.includes(questionId)) {
    return res.json({ correct: true, message: 'Already answered correctly', xpAwarded: 0 });
  }

  const cleanInput = String(answer).trim().toLowerCase();
  const cleanAnswer = question.answer.trim().toLowerCase();

  if (cleanInput === cleanAnswer) {
    tState.answersCorrect.push(questionId);
    session.score += question.xp;

    const wasCompleted = tState.completed;
    tState.completed = checkTaskCompletion(session, taskId);
    
    let message = 'Correct!';
    let finalXp = question.xp;

    if (tState.completed && !wasCompleted) {
      message = 'Correct! Task completed!';
      const nextTask = tasks.find(t => t.number === tasks.find(curr => curr.id === taskId)!.number + 1);
      if (nextTask && session.tasks[nextTask.id]) {
        session.tasks[nextTask.id].started = true;
      }
    }

    res.json({
      correct: true,
      message,
      xpAwarded: finalXp,
      session
    });
  } else {
    res.json({
      correct: false,
      message: 'Incorrect answer. Try again.',
      xpAwarded: 0
    });
  }
});

// POST /submit-flag
router.post('/submit-flag', (req, res) => {
  const { token, taskId, flag } = req.body;
  if (!isValidToken(token)) {
    console.warn(`[Security Alert] Invalid token format received on /submit-flag: "${token}"`);
    return res.status(400).json({ error: 'Invalid session token format' });
  }
  if (!isValidTaskId(taskId)) {
    console.warn(`[Security Alert] Invalid taskId format received on /submit-flag: "${taskId}"`);
    return res.status(400).json({ error: 'Invalid task identifier' });
  }
  if (typeof flag !== 'string' || flag.length > 100) {
    console.warn(`[Security Alert] Flag submission rejected: length limit exceeded or invalid format from IP ${req.ip}`);
    return res.status(400).json({ error: 'Flag must be under 100 characters' });
  }

  const session = labSessions.get(token);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (!task.hasFlag || !task.flagValue) {
    return res.status(400).json({ error: 'Task does not require a flag' });
  }

  const tState = session.tasks[taskId];
  if (tState.flagEarned) {
    return res.json({ correct: true, message: 'Flag already submitted', xpAwarded: 0 });
  }

  const cleanInput = String(flag).trim();
  if (cleanInput === task.flagValue) {
    tState.flagEarned = true;
    const xp = task.flagXp || 0;
    session.score += xp;

    const wasCompleted = tState.completed;
    tState.completed = checkTaskCompletion(session, taskId);

    if (tState.completed && !wasCompleted) {
      const nextTask = tasks.find(t => t.number === task.number + 1);
      if (nextTask && session.tasks[nextTask.id]) {
        session.tasks[nextTask.id].started = true;
      }
    }

    res.json({
      correct: true,
      message: tState.completed && !wasCompleted ? 'Correct! Task completed!' : 'Correct flag!',
      xpAwarded: xp,
      session
    });
  } else {
    console.warn(`[Security Alert] Failed flag submission for task "${taskId}" (Submitted: "${cleanInput}") from IP ${req.ip}`);
    res.json({
      correct: false,
      message: 'Invalid flag value.',
      xpAwarded: 0
    });
  }
});

// POST /complete-task
router.post('/complete-task', (req, res) => {
  const { token, taskId } = req.body;
  if (!isValidToken(token)) {
    return res.status(400).json({ error: 'Invalid session token format' });
  }
  if (!isValidTaskId(taskId)) {
    return res.status(400).json({ error: 'Invalid task identifier' });
  }

  const session = labSessions.get(token);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const tState = session.tasks[taskId];
  if (tState.completed) {
    return res.json({ completed: true, message: 'Task already completed', xpAwarded: 0 });
  }

  const isSetupOrSummary = (task.category === 'Setup' || task.category === 'Summary') && taskId !== 'task9';
  const isDefenseWithDemo = taskId === 'task7';

  if (isSetupOrSummary || isDefenseWithDemo) {
    tState.completed = true;
    const xp = task.xp;
    session.score += xp;
    
    const nextTask = tasks.find(t => t.number === task.number + 1);
    if (nextTask) {
      if (session.tasks[nextTask.id]) {
        session.tasks[nextTask.id].started = true;
      }
    }

    res.json({
      completed: true,
      message: 'Task completed successfully!',
      xpAwarded: xp,
      session
    });
  } else {
    res.status(400).json({ error: 'This task cannot be manually completed.' });
  }
});

// POST /hint
router.post('/hint', (req, res) => {
  const { token, taskId } = req.body;
  if (!isValidToken(token)) {
    return res.status(400).json({ error: 'Invalid session token format' });
  }
  if (!isValidTaskId(taskId)) {
    return res.status(400).json({ error: 'Invalid task identifier' });
  }

  const session = labSessions.get(token);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const tState = session.tasks[taskId];
  if (!tState) {
    return res.status(500).json({ error: 'Task state missing' });
  }

  const hintIndex = session.hintsUsed;
  if (hintIndex >= task.hints.length) {
    return res.status(400).json({ error: 'No more hints available for this task' });
  }

  const hint = task.hints[hintIndex];
  session.hintsUsed += 1;
  session.score = Math.max(0, session.score - 10); // Deduct 10 XP

  res.json({
    hint,
    hintIndex,
    xpDeducted: 10,
    session
  });
});

// POST /set-task
router.post('/set-task', (req, res) => {
  const { token, taskId } = req.body;
  if (!isValidToken(token)) {
    return res.status(400).json({ error: 'Invalid session token format' });
  }
  if (!isValidTaskId(taskId)) {
    return res.status(400).json({ error: 'Invalid task identifier' });
  }

  const session = labSessions.get(token);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  if (session.tasks[taskId]) {
    session.tasks[taskId].started = true;
  }
  session.currentTask = taskId;
  res.json({ currentTask: taskId, session });
});

// DELETE /session/:token
router.delete('/session/:token', (req, res) => {
  const { token } = req.params;
  if (!isValidToken(token)) {
    return res.status(400).json({ error: 'Invalid session token format' });
  }

  const session = labSessions.get(token);
  if (session) {
    if (session.victimSessionId) {
      staffhubSessions.delete(session.victimSessionId);
    }
    labSessions.delete(token);
  }
  res.json({ success: true });
});

// POST /chat
router.post('/chat', async (req, res) => {
  try {
    const { token, message, taskId, history } = req.body;
    if (!isValidToken(token)) {
      return res.status(400).json({ error: 'Invalid session token format' });
    }
    if (!message?.trim()) {
      return res.status(400).json({ error: 'Missing message' });
    }

    const session = labSessions.get(token);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const task = tasks.find(t => t.id === (taskId || session.currentTask));
    const taskContext = task ? `The student is currently working on Task ${task.number}: "${task.title}".\nTask Description: "${task.description}"` : '';

    // Format chat history
    const historyArray = history || [];
    const historyText = historyArray
      .map((m: any) => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`)
      .join('\n');

    const prompt = `You are the CSRF Attack Lab AI Tutor, a helpful security expert mentoring a student in a hands-on cybersecurity sandbox.
${taskContext}

Your goal is to explain Cross-Site Request Forgery (CSRF) concepts, browser cookie policies (SameSite Strict, Lax, None), anti-CSRF token defense mechanisms, and request headers (Origin, Referer) to help the student learn.

CRITICAL SECURITY GUARDRAILS:
- You must NEVER reveal any flags (starts with THM{) or direct attack payloads (like HTML form code that submits to /api/app/settings/email or settings/role) that solve the challenges in this lab.
- Do NOT write or provide complete exploit templates or forged tokens.
- If the user asks for the answer, flag, or payload, decline politely and guide them through the concepts instead.
- If they show you an error or a form that is not working, explain how browser cookies work and how they can debug their HTML/JS code conceptually.
- Keep explanations clear, descriptive, and educational. Use a slightly hacker-themed tone.

Conversation history:
${historyText}
Student: ${message}
Tutor:`;

    const responseText = await generateGeminiContent(prompt, false);

    res.json({
      message: responseText.trim(),
    });
  } catch (error: any) {
    console.error('Chatbot API error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// POST /generate-question
router.post('/generate-question', async (req, res) => {
  try {
    const { token, taskId, regenerate } = req.body;
    if (!isValidToken(token)) {
      return res.status(400).json({ error: 'Invalid session token format' });
    }
    if (!isValidTaskId(taskId)) {
      return res.status(400).json({ error: 'Invalid task identifier' });
    }

    const session = labSessions.get(token);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const tState = session.tasks[taskId];
    if (!tState) {
      return res.status(500).json({ error: 'Task state missing' });
    }

    if (tState.aiQuestion && !regenerate) {
      return res.json({
        question: tState.aiQuestion,
        feedback: tState.aiEvaluationFeedback,
        completed: tState.completed,
      });
    }

    const prompt = `You are a cybersecurity lab author. Generate a randomized, specific task question for a student in a CSRF (Cross-Site Request Forgery) training lab.
Task Topic: "Conclusion & Review of CSRF Mechanics"
Task Description: "${task.description}"

Instruction:
Generate a randomized question that requires the student to write a descriptive explanation (in their own words) of the core concepts of CSRF.
For example, ask them to:
- Explain why browsers automatically send session cookies and how attackers abuse this.
- Describe how SameSite cookie policies (Lax/Strict) protect endpoints and what their limitations are.
- Explain why anti-CSRF tokens are necessary even if cookie policies are active.

You MUST respond with a JSON object in this exact structure:
{
  "question": "The randomized text question to ask the student.",
  "grading_criteria": [
    "Grading criterion 1 (e.g. must explain how browser automatic cookie submission works)",
    "Grading criterion 2 (e.g. must explain Lax vs Strict behavior)",
    "Grading criterion 3 (e.g. must explain why cryptographically random tokens are needed)"
  ]
}
Return ONLY valid JSON. No conversational text.`;

    const responseText = await generateGeminiContent(prompt, true);
    const parsed = JSON.parse(responseText.trim());

    if (!parsed.question || !parsed.grading_criteria) {
      throw new Error('Invalid JSON structure returned from Gemini');
    }

    tState.aiQuestion = parsed.question;
    tState.aiGradingCriteria = JSON.stringify(parsed.grading_criteria);
    tState.aiEvaluationFeedback = null; // Reset previous feedback

    res.json({
      question: parsed.question,
      feedback: null,
      completed: tState.completed,
    });
  } catch (error: any) {
    console.error('Generate question API error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// POST /evaluate-answer
router.post('/evaluate-answer', async (req, res) => {
  try {
    const { token, taskId, answer } = req.body;
    if (!isValidToken(token)) {
      return res.status(400).json({ error: 'Invalid session token format' });
    }
    if (!isValidTaskId(taskId)) {
      return res.status(400).json({ error: 'Invalid task identifier' });
    }
    if (!answer?.trim()) {
      return res.status(400).json({ error: 'Missing required answer' });
    }

    const session = labSessions.get(token);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const tState = session.tasks[taskId];
    if (!tState || !tState.aiQuestion || !tState.aiGradingCriteria) {
      return res.status(400).json({ error: 'AI task session not initialized' });
    }

    const criteriaList = JSON.parse(tState.aiGradingCriteria);
    const criteriaString = criteriaList.map((c: string, idx: number) => `${idx + 1}. ${c}`).join('\n');

    const prompt = `You are a cybersecurity grading assistant. Evaluate the student's descriptive text answer for a CSRF challenge.
Question Asked: "${tState.aiQuestion}"
Expected Criteria:
${criteriaString}

Student's Answer:
"${answer}"

Instructions:
Evaluate if the student has demonstrated an understanding of the concepts in their answer.
Be lenient with grammar and formatting, but strict on logical correctness.
They must satisfy at least 2 of the 3 grading criteria to pass (get success: true).
Do NOT reveal any flags or direct payload codes in your feedback.

You MUST respond with a JSON object in this exact format:
{
  "success": true, // or false if they did not satisfy the criteria
  "score": 85, // integer score from 0 to 100
  "feedback": "A brief constructive paragraph explaining what they did well and what they missed, without giving away the final flag/payload."
}
Return ONLY valid JSON. No conversational text.`;

    const responseText = await generateGeminiContent(prompt, true);
    const parsed = JSON.parse(responseText.trim());

    if (parsed.success === undefined || parsed.score === undefined || !parsed.feedback) {
      throw new Error('Invalid JSON structure returned from Gemini evaluator');
    }

    const alreadyCompleted = tState.completed;
    tState.aiEvaluationFeedback = `[Score: ${parsed.score}/100] ${parsed.feedback}`;

    if (parsed.success && !alreadyCompleted) {
      tState.completed = true;
      session.score += task.xp;
      
      const nextTask = tasks.find(t => t.number === task.number + 1);
      if (nextTask && session.tasks[nextTask.id]) {
        session.tasks[nextTask.id].started = true;
      }
    }

    res.json({
      success: parsed.success,
      score: parsed.score,
      feedback: parsed.feedback,
      xpGained: parsed.success && !alreadyCompleted ? task.xp : 0,
      session
    });
  } catch (error: any) {
    console.error('Evaluate answer API error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

export default router;
