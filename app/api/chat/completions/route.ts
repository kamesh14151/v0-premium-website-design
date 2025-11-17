import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { nexariqClient } from '@/lib/llm/nexariq-client';
import { neon } from '@neondatabase/serverless';

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

    // Parse request body
    const { prompt, model, temperature, max_tokens, stream } = await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const startTime = Date.now();

    // For streaming responses
    if (stream) {
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            let fullResponse = '';
            await nexariqClient.stream(
              { prompt, model, temperature, max_tokens },
              (chunk) => {
                fullResponse += chunk;
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
                );
              }
            );

            const responseTime = Date.now() - startTime;
            const tokens = await nexariqClient.countTokens(prompt + fullResponse, model);

            // Log request
            const sql = neon(process.env.DATABASE_URL!);
            await sql`
              INSERT INTO request_history (user_id, model, prompt, response, tokens_input, tokens_total, response_time_ms, is_streaming)
              VALUES (${user.id}, ${model}, ${prompt}, ${fullResponse}, ${await nexariqClient.countTokens(prompt, model)}, ${tokens}, ${responseTime}, true)
            `;

            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            console.error('[v0] Stream error:', error);
            controller.error(error);
          }
        },
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Non-streaming response
    const response = await nexariqClient.complete({
      prompt,
      model,
      temperature: temperature || 0.7,
      max_tokens: max_tokens || 1000,
    });

    const responseTime = Date.now() - startTime;

    // Log request to database
    const sql = neon(process.env.DATABASE_URL!);
    await sql`
      INSERT INTO request_history (user_id, model, prompt, response, tokens_input, tokens_output, tokens_total, response_time_ms)
      VALUES (
        ${user.id},
        ${model},
        ${prompt},
        ${response.choices[0].text},
        ${response.usage.prompt_tokens},
        ${response.usage.completion_tokens},
        ${response.usage.total_tokens},
        ${responseTime}
      )
    `;

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[v0] API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
