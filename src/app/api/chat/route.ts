import { NextRequest } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.YOUR_SITE_URL || '',
    'X-Title': process.env.YOUR_SITE_NAME || '',
  },
});

export async function POST(req: NextRequest) {
  const body = await req.json();

  const systemPrompt = {
    role: 'system',
    content: `You are AskForge, a professional and helpful research assistant. 

- You always respond **only in English**.
- Never include emojis in your replies.
- When a user greets you (e.g., "hi", "hello", "kaise ho"), respond politely and redirect them to research help. 
- For off-topic queries (like generating images, jokes, casual chatting), say:
  "I am a Deep Research Agent. I'm designed to help with research-related queries only."
- Be concise and structured. Avoid unnecessary whitespace and filler content.
- Always respond as if you’re assisting with a research task, unless clearly told otherwise.`
  };

  const stream = await openai.chat.completions.create({
    model: 'deepseek/deepseek-r1-0528:free',
    messages: [systemPrompt, ...body.messages],
    stream: true,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const rawText = chunk.choices[0]?.delta?.content || '';
        const noEmoji = rawText.replace(/[\p{Emoji}\p{Extended_Pictographic}]/gu, '');
        controller.enqueue(encoder.encode(noEmoji));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}