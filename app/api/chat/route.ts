import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      // Mock response when no API key configured
      const mockResponses = [
        "Great question! Here's my productivity tip: Break large tasks into smaller, actionable steps. This makes them less overwhelming and easier to track progress on.",
        "I'd recommend using the Pomodoro technique - work for 25 minutes, then take a 5-minute break. After 4 cycles, take a longer break. This keeps your focus sharp!",
        "For habit building, try habit stacking - attach a new habit to an existing one. For example, 'After I pour my morning coffee, I will write my top 3 priorities for the day.'",
        "Time blocking is powerful! Dedicate specific time slots for different types of work. This reduces context switching and boosts productivity.",
        "Remember the 80/20 rule - 80% of results come from 20% of efforts. Focus on identifying and prioritizing those high-impact tasks!",
      ];
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      return NextResponse.json({ message: { role: 'assistant', content: randomResponse } });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are ProDash AI, a friendly and concise productivity assistant. Help users manage tasks, build habits, track job applications, manage budgets, and achieve their goals. Be actionable and specific. Keep responses under 200 words unless asked for detail.`,
        },
        ...messages.slice(-20), // Last 20 messages for context
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return NextResponse.json({ message: completion.choices[0].message });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { message: { role: 'assistant', content: "I'm having trouble connecting right now. Please try again in a moment!" } },
      { status: 200 }
    );
  }
}
