
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Create an OpenAI provider instance that points to OpenRouter
const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openrouter('google/gemini-2.5-flash'),
    system: 'You are an experienced restaurant mentor for KesselOps. Your goal is to help trainees learn standard operating procedures (SOPs), recipes, and safety guidelines. Be encouraging, concise, and professional. Use markdown for formatting.',
    // Sanitize messages to ensure only role and content are passed
    messages: messages.map((m: any) => ({
      role: m.role,
      content: m.content,
    })),
    headers: {
      'HTTP-Referer': 'https://kesselops.com', // Optional: for OpenRouter rankings
      'X-Title': 'KesselOps Trainee Mentor',
    },
  });

  return result.toTextStreamResponse();
}
