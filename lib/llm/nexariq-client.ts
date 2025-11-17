// Real LLM API integration with Nexariq
const NEXARIQ_API_KEY = process.env.NEXARIQ_API_KEY;
const NEXARIQ_BASE_URL = process.env.NEXARIQ_API_URL || 'https://api.nexariq.com/v1';

interface CompletionRequest {
  model: string;
  prompt: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  top_p?: number;
}

interface CompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    text: string;
    index: number;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class NexariqClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    if (!NEXARIQ_API_KEY) {
      throw new Error('NEXARIQ_API_KEY environment variable is required');
    }
    this.apiKey = NEXARIQ_API_KEY;
    this.baseUrl = NEXARIQ_BASE_URL;
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model || 'nexariq-pro',
          prompt: request.prompt,
          temperature: request.temperature || 0.7,
          max_tokens: request.max_tokens || 1000,
          stream: request.stream || false,
          top_p: request.top_p || 1,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[v0] LLM API Error:', error);
      throw error;
    }
  }

  async stream(
    request: CompletionRequest,
    onChunk: (chunk: string) => void
  ): Promise<{ totalTokens: number; cost: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      let totalTokens = 0;
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.choices?.[0]?.text) {
                onChunk(data.choices[0].text);
              }
              if (data.usage?.total_tokens) {
                totalTokens = data.usage.total_tokens;
              }
            } catch (e) {
              // Skip parse errors
            }
          }
        }
      }

      const cost = this.calculateCost(request.model, totalTokens);
      return { totalTokens, cost };
    } catch (error) {
      console.error('[v0] Streaming error:', error);
      throw error;
    }
  }

  private calculateCost(model: string, tokens: number): number {
    const rates: Record<string, number> = {
      'nexariq-pro': 0.00003,
      'nexariq-fast': 0.000015,
      'nexariq-vision': 0.000045,
    };
    return (tokens / 1000) * (rates[model] || 0.00003);
  }

  async countTokens(text: string, model: string): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/tokenize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, model }),
      });

      if (!response.ok) {
        // Fallback estimation: ~4 chars per token
        return Math.ceil(text.length / 4);
      }

      const data = await response.json();
      return data.token_count;
    } catch {
      return Math.ceil(text.length / 4);
    }
  }
}

export const nexariqClient = new NexariqClient();
