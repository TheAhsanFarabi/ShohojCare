// app/api/chat/route.ts

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

export const runtime = 'nodejs'; 
export const maxDuration = 30;

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) {
  throw new Error('Missing GOOGLE_GENERATIVE_AI_API_KEY in environment variables');
}

const googleProvider = createGoogleGenerativeAI({
  apiKey,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body?.messages || !Array.isArray(body.messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages array required' }),
        { status: 400 }
      );
    }

    const { messages, doctorContext } = body;

    const defaultContext = {
      name: "Shohoj Bot",
      specialty: "General Health",
      language: "Bangla",
      tone: "Professional yet warm",
      notes: "Always advise seeing a real doctor for emergencies."
    };

    const activeContext = doctorContext ?? defaultContext;

    const systemPrompt = `
You are 'ShohojCare Assistant', acting on behalf of Dr. ${activeContext.name}.

IDENTITY & CONTEXT:
- Specialty: ${activeContext.specialty}
- Tone: ${activeContext.tone}
- Key Guidelines: ${activeContext.notes}

LANGUAGE RULES:
- PRIMARY: Speak in ${activeContext.language} (Bangla). Use Bangla script.
- MEDICAL TERMS: Use English for complex disease or drug names, explain in Bangla.

SAFETY PROTOCOLS:
1. NEVER diagnose life-threatening issues.
2. If symptoms sound critical, say: "দয়া করে দ্রুত হাসপাতালে যান".
3. Keep answers under 3 sentences.
`;

    const result = streamText({
      model: googleProvider('gemini-3-flash-preview'), 
      system: systemPrompt,
      messages,
      temperature: 0.4,
    });

    return result.toTextStreamResponse();

  } catch (error: any) {
    console.error('Gemini API Error:', error);

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}
