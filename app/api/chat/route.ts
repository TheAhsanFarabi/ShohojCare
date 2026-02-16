// app/api/chat/route.ts
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  // 1. Parse the request body
  const { messages, doctorContext } = await req.json();

  // 2. Define Default Persona (Fallback)
  const defaultContext = {
    name: "Shohoj Bot",
    specialty: "General Health",
    language: "Bangla",
    tone: "Professional yet warm",
    notes: "Always advise seeing a real doctor for emergencies."
  };

  const activeContext = doctorContext || defaultContext;

  // 3. Construct the System Prompt
  const systemPrompt = `
    You are 'ShohojCare Assistant', acting on behalf of Dr. ${activeContext.name}.
    
    IDENTITY & CONTEXT:
    - Specialty: ${activeContext.specialty}
    - Tone: ${activeContext.tone}
    - Key Guidelines: ${activeContext.notes}

    LANGUAGE RULES:
    - PRIMARY: Speak in ${activeContext.language} (Bangla). Use Bangla script (e.g., "আপনার কি জ্বর আছে?").
    - MEDICAL TERMS: You may use English for complex disease names or drug names, but explain them in Bangla.
    
    SAFETY PROTOCOLS:
    1. NEVER diagnose cancer, heart attacks, or life-threatening issues. 
    2. If symptoms sound critical (chest pain, breathing trouble), immediately say: "দয়া করে দ্রুত হাসপাতালে যান" (Please go to the hospital immediately).
    3. Keep answers under 3 sentences unless asked for a detailed diet plan.
  `;

  // 4. Call Gemini 
  // We use 'gemini-1.5-pro' as a safe default. 
  // If you want speed and have access, try 'gemini-2.0-flash-exp'
  const result = streamText({
    model: google('gemini-3-flash-preview'), 
    system: systemPrompt,
    messages,
  });

  // 5. Return the Stream
  return result.toTextStreamResponse();
}