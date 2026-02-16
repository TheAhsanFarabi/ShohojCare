// app/api/chat/route.ts
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

// Forces the route to use Edge Runtime, which allows for longer streaming
// and avoids the 10-second timeout on Vercel Hobby plans.
export const runtime = 'edge';

// Explicitly initialize the Google provider using your specific key name
const googleProvider = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // 1. Validate the API Key exists in the environment
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("GOOGLE_GENERATIVE_AI_API_KEY is missing from environment variables.");
      return new Response(
        JSON.stringify({ error: "API Key is not configured on the server." }), 
        { status: 500 }
      );
    }

    // 2. Parse the request body
    const { messages, doctorContext } = await req.json();

    // 3. Define Default Persona if no doctorContext is provided
    const defaultContext = {
      name: "Shohoj Bot",
      specialty: "General Health",
      language: "Bangla",
      tone: "Professional yet warm",
      notes: "Always advise seeing a real doctor for emergencies."
    };

    const activeContext = doctorContext || defaultContext;

    // 4. Construct the System Prompt
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
      1. NEVER diagnose life-threatening issues or cancer. 
      2. If symptoms sound critical (chest pain, breathing trouble), immediately say: "দয়া করে দ্রুত হাসপাতালে যান" (Please go to the hospital immediately).
      3. Keep answers concise and under 3-4 sentences unless a detailed plan is requested.
    `;

    // 5. Call Gemini 1.5 Flash
    // We use gemini-1.5-flash because it is the fastest and most reliable for chat.
    const result = streamText({
      model: googleProvider('gemini-2.5-flash-lite-preview-09-2025'), 
      system: systemPrompt,
      messages,
    });

    // 6. Return the Stream
    return result.toTextStreamResponse();

  } catch (error: any) {
    console.error("Detailed Gemini API Error:", error.message);
    return new Response(
      JSON.stringify({ 
        error: "Failed to connect to the AI service.", 
        details: error.message 
      }), 
      { status: 500 }
    );
  }
}