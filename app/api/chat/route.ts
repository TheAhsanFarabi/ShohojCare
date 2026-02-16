// app/api/chat/route.ts
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

// 1. Initialize the Google provider with the API key explicitly
const googleProvider = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, doctorContext } = await req.json();

    const defaultContext = {
      name: "Shohoj Bot",
      specialty: "General Health",
      language: "Bangla",
      tone: "Professional yet warm",
      notes: "Always advise seeing a real doctor for emergencies."
    };

    const activeContext = doctorContext || defaultContext;

    const systemPrompt = `
      You are 'ShohojCare Assistant', acting on behalf of Dr. ${activeContext.name}.
      
      IDENTITY & CONTEXT:
      - Specialty: ${activeContext.specialty}
      - Tone: ${activeContext.tone}
      - Key Guidelines: ${activeContext.notes}

      LANGUAGE RULES:
      - PRIMARY: Speak in ${activeContext.language} (Bangla). Use Bangla script (e.g., "আপনার কি জ্বর আছে?").
      - MEDICAL TERMS: Use English for complex disease names or drug names, but explain them in Bangla.
      
      SAFETY PROTOCOLS:
      1. NEVER diagnose life-threatening issues. 
      2. If symptoms sound critical, say: "দয়া করে দ্রুত হাসপাতালে যান".
      3. Keep answers under 3 sentences.
    `;

    // 2. Call Gemini using the explicit provider instance
    const result = streamText({
      model: googleProvider('gemini-3-flash-preview'), // Using a valid model ID
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse();
    
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}