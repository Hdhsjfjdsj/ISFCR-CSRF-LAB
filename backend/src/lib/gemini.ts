export async function generateGeminiContent(prompt: string, jsonMode: boolean = false): Promise<string> {
  // 1. Try Ollama (Llama 3) first
  try {
    const ollamaUrl = 'http://127.0.0.1:11434/api/generate';
    const controller = new AbortController();
    // Use a 30-second timeout to allow the local model to cold-start load into memory
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const res = await fetch(ollamaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3:latest',
        prompt: prompt,
        stream: false,
        format: jsonMode ? 'json' : undefined,
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json() as any;
      if (data.response) {
        console.log('Successfully generated content using Ollama (Llama 3)');
        return data.response;
      }
    }
  } catch (err: any) {
    console.warn('Ollama (Llama 3) is not available or failed. Falling back to Gemini/Mocks...');
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;

  if (!apiKey) {
    console.warn('GEMINI_API_KEY environment variable is not defined. Falling back to mock responses.');
    if (jsonMode) {
      // Default evaluation mock for Task 9 Conclusion
      if (prompt.includes('Grading criteria') || prompt.includes('grading_criteria') || prompt.includes('CSRF')) {
        if (prompt.includes("Student's Answer") || prompt.includes('Student:')) {
          // It's the answer evaluator
          // Let's parse out student's response if possible, or just evaluate dynamically
          const matches = prompt.match(/"Student's Answer":\s*"([\s\S]*?)"/i) || prompt.match(/Student:\s*([\s\S]*?)(?=\n|$)/i);
          const studentAnswerText = matches ? matches[1] : '';
          const cleanAnswer = studentAnswerText.toLowerCase();

          // We'll evaluate if the student wrote a reasonable explanation containing some keywords:
          // csrf, cookie, samesite, token, lax, strict, browser
          const containsCsrf = cleanAnswer.includes('csrf') || cleanAnswer.includes('request forgery') || cleanAnswer.includes('forged');
          const containsCookie = cleanAnswer.includes('cookie') || cleanAnswer.includes('session');
          const containsSameSite = cleanAnswer.includes('samesite') || cleanAnswer.includes('lax') || cleanAnswer.includes('strict');
          const containsToken = cleanAnswer.includes('token') || cleanAnswer.includes('anti-csrf') || cleanAnswer.includes('csrf-token') || cleanAnswer.includes('predictable');
          
          // Count matched concepts (require at least 2)
          let matchesCount = 0;
          if (containsCsrf || containsCookie) matchesCount++;
          if (containsSameSite) matchesCount++;
          if (containsToken) matchesCount++;

          if (cleanAnswer.length > 25 && matchesCount >= 2) {
            return JSON.stringify({
              success: true,
              score: 90,
              feedback: "DEMO MODE (No API Key): Excellent summary of CSRF mechanisms! You correctly identified how cookies are automatically sent, how SameSite settings restrict them, and why anti-CSRF tokens act as a secondary defense layer."
            });
          } else {
            return JSON.stringify({
              success: false,
              score: 45,
              feedback: "DEMO MODE (No API Key): Your answer is a bit brief or missing key terms. Please ensure you explain how CSRF exploits automatic cookie delivery, contrast SameSite Lax/Strict policies, and describe why secure tokens protect state-changing requests."
            });
          }
        }

        // It's the question generator
        return JSON.stringify({
          question: "Explain the mechanics of a Cross-Site Request Forgery (CSRF) attack. How do SameSite cookies (Lax vs Strict) protect against it, and why are anti-CSRF tokens still necessary for secure web applications?",
          grading_criteria: [
            "explain how CSRF exploits automatic cookie attachment in browser requests",
            "describe the difference in cookie transmission between SameSite Lax and Strict policies",
            "explain why cryptographically secure anti-CSRF tokens are necessary for state-changing requests"
          ]
        });
      }
      
      // Default evaluation mock generic
      return JSON.stringify({
        success: true,
        score: 85,
        feedback: "DEMO MODE (No API Key): Your answer satisfies the general criteria. Configure GEMINI_API_KEY in your env file to enable live AI evaluation."
      });
    }

    if (prompt.includes('help') || prompt.includes('doubt') || prompt.includes('explain')) {
      return "Hello! I am your CSRF Attack Lab AI Tutor. Currently, I am running in **Demo Mode** because no `GEMINI_API_KEY` was found in the environment variables. \n\nHere is a quick summary of CSRF: \n* **CSRF** stands for Cross-Site Request Forgery. It exploits the trust relationship between the user's browser and the web application.\n* **Browsers automatically send cookies** associated with a domain on requests, even if initiated from third-party sites.\n* **Defenses** include setting `SameSite=Strict/Lax` on session cookies and validating dynamic `anti-csrf-tokens` on the server.\n\n*Configure the GEMINI_API_KEY environment variable in your docker-compose config to unlock my live conversational tutor intelligence!*";
    }

    return "API KEY WARNING: Configure GEMINI_API_KEY in your env file to enable live AI chatbot tutors.";
  }

  const preferredModels = process.env.GEMINI_MODEL 
    ? [process.env.GEMINI_MODEL] 
    : ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-flash-latest'];

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: jsonMode
      ? {
          responseMimeType: 'application/json',
        }
      : undefined,
  };

  let lastError: any = null;

  for (const currentModel of preferredModels) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.warn(`Gemini model ${currentModel} failed with status ${res.status}:`, errorText);
        lastError = new Error(`Gemini API error for model ${currentModel}: ${res.statusText} (${res.status}) - ${errorText}`);
        continue;
      }

      const data = await res.json() as any;
      const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textContent) {
        console.warn(`Empty response structure from model ${currentModel}`);
        lastError = new Error(`Invalid or empty response structure from Gemini API model ${currentModel}`);
        continue;
      }

      return textContent;
    } catch (err: any) {
      console.warn(`Failed to communicate with Gemini model ${currentModel}:`, err);
      lastError = err;
    }
  }

  console.error('All Gemini API models failed. Last error:', lastError);
  throw lastError || new Error('All Gemini API models failed');
}
