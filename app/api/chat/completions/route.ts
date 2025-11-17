import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * AJStudioz AI Chat Completions API
 * Connects to multi-cloud AI platform with 13 models from 4 providers
 */

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(request: Request) {
  try {
    // Get authenticated user
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Parse request body - support both prompt and messages format
    const body = await request.json();
    const { 
      prompt, 
      messages, 
      model = 'kimi', 
      temperature = 0.7, 
      max_tokens = 2000, 
      stream = false 
    } = body;

    // Convert prompt to messages format if needed
    let chatMessages: ChatMessage[] = messages;
    if (prompt && !messages) {
      chatMessages = [{ role: 'user' as const, content: prompt }];
    }

    if (!chatMessages || chatMessages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages or prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const startTime = Date.now();

    // Get API credentials
    const apiKey = process.env.AJSTUDIOZ_API_KEY || 'aj-demo123456789abcdef';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.ajstudioz.dev';

    // Call AJStudioz AI API
    const response = await fetch(`${apiUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        model,
        messages: chatMessages,
        temperature,
        max_tokens,
        stream,
        user_id: user.id,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return new Response(JSON.stringify({ error: `API Error: ${error}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Handle streaming response
    if (stream) {
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Handle regular response
    const data = await response.json();
    const responseTime = Date.now() - startTime;

    // Extract content from structured response
    const messageContent = data.output?.[data.output.length - 1]?.content?.[0]?.text || '';
    const reasoningContent = data.output?.find((o: any) => o.type === 'reasoning')?.content?.[0]?.text || '';

    // Log request to database
    try {
      await supabase.from('request_history').insert({
        user_id: user.id,
        model: model,
        provider: data.metadata?.model_provider || 'unknown',
        prompt_tokens: data.usage?.input_tokens || 0,
        completion_tokens: data.usage?.output_tokens || 0,
        total_tokens: data.usage?.total_tokens || 0,
        cost: 0, // Free models
        response_time: responseTime,
        status: 'success',
        has_reasoning: !!reasoningContent,
      });
    } catch (logError) {
      console.error('Failed to log request:', logError);
      // Don't fail the request if logging fails
    }

    // Return OpenAI-compatible format
    return new Response(JSON.stringify({
      id: data.id,
      object: 'chat.completion',
      created: data.created_at,
      model: model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: messageContent,
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: data.usage?.input_tokens || 0,
        completion_tokens: data.usage?.output_tokens || 0,
        total_tokens: data.usage?.total_tokens || 0,
      },
      metadata: {
        provider: data.metadata?.model_provider,
        response_time_ms: responseTime,
        has_reasoning: !!reasoningContent,
        reasoning_content: reasoningContent,
      },
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[AJStudioz] API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// GET endpoint for API info
export async function GET() {
  return new Response(JSON.stringify({
    service: 'AJStudioz AI Chat API',
    models: 13,
    providers: {
      groq: 5,
      chutes: 1,
      cerebras: 1,
      openrouter: 4,
      ollama: 2,
    },
    features: ['chat', 'streaming', 'reasoning', 'multi-provider', 'rate-limit-protection'],
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
