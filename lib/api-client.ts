// Production API client with error handling and retry logic
interface RequestOptions {
  retries?: number;
  timeout?: number;
}

export class NexariqAPIClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string = process.env.NEXT_PUBLIC_API_KEY || '') {
    this.apiKey = apiKey;
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.nexariq.com/v1';
  }

  async request(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any,
    options: RequestOptions = {}
  ) {
    const { retries = 3, timeout = 30000 } = options;

    let lastError: any;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method,
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || `API error: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error;
        console.error(`[v0] API request attempt ${attempt + 1} failed:`, error);

        if (attempt < retries - 1) {
          const backoffMs = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        }
      }
    }

    throw lastError;
  }

  async complete(prompt: string, model: string = 'nexariq-pro', options: any = {}) {
    return this.request('/completions', 'POST', {
      prompt,
      model,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1000,
      ...options,
    });
  }
}

export const apiClient = new NexariqAPIClient();
