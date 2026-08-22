import { NextRequest, NextResponse } from 'next/server';

const NEMOTRON_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const NEMOTRON_API_KEY = process.env.NEMOTRON_API_KEY || process.env.NVIDIA_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    if (!NEMOTRON_API_KEY) {
      return NextResponse.json(
        { 
          content: 'AI Copilot is not configured. Please add NEMOTRON_API_KEY or NVIDIA_API_KEY to your environment variables.',
          calculations: {},
        },
        { status: 200 }
      );
    }

    const response = await fetch(NEMOTRON_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NEMOTRON_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-ultra',
        messages,
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: 1024,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Nemotron API error:', response.status, errorText);
      
      return NextResponse.json(
        { 
          content: 'I\'m experiencing technical difficulties. Please try again in a moment.',
          calculations: {},
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'No response generated.';

    return NextResponse.json({
      content,
      calculations: {},
    });
  } catch (error) {
    console.error('Copilot API error:', error);
    return NextResponse.json(
      { 
        content: 'An unexpected error occurred. Please try again.',
        calculations: {},
      },
      { status: 200 }
    );
  }
}