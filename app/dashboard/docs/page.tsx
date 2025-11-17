"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import Link from "next/link";

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-muted rounded-lg p-4 overflow-x-auto group">
      <Button
        size="sm"
        variant="ghost"
        onClick={handleCopy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
      <pre className="text-xs font-mono text-foreground overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function ModelCard({ name, provider, context }: { name: string; provider: string; context: string }) {
  return (
    <div className="border border-border rounded-lg p-3 flex items-center justify-between">
      <div className="flex-1">
        <code className="text-sm font-mono text-accent">{name}</code>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>{provider}</span>
        <span className="font-mono">{context}</span>
      </div>
    </div>
  );
}

const docSections = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Set up your API key and make your first API call",
    content: (
      <>
        <h3 className="text-lg font-semibold mb-4">Getting Started</h3>
        <p className="text-muted-foreground mb-4">
          Access 13 AI models (11 cloud + 2 local) from Groq, Chutes AI, Cerebras, OpenRouter, and Ollama through a single unified API.
        </p>
        
        <h4 className="font-semibold mt-6 mb-2">Base URL</h4>
        <CodeBlock code={`https://aj-fresh.vercel.app/api/chat`} />

        <h4 className="font-semibold mt-6 mb-2">Authentication</h4>
        <p className="text-sm text-muted-foreground mb-4">
          All API requests require an API key with the <code className="bg-muted px-1 py-0.5 rounded text-xs">nxq_</code> prefix. Generate one in your <Link href="/dashboard/api-keys" className="text-accent hover:underline">API Keys</Link> dashboard.
        </p>
        <CodeBlock code={`X-API-Key: nxq_your_api_key_here`} />

        <h4 className="font-semibold mt-6 mb-2">Quick Example</h4>
        <CodeBlock
          code={`curl -X POST "https://aj-fresh.vercel.app/api/chat" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: nxq_demo123456789abcdef" \\
  -d '{
    "model": "kimi",
    "messages": [{"role": "user", "content": "What is 2+2?"}]
  }'`}
        />

        <h4 className="font-semibold mt-6 mb-2">Response Format</h4>
        <CodeBlock
          code={`{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "kimi",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "2+2 equals 4."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 8,
    "total_tokens": 18
  }
}`}
        />
      </>
    ),
  },
  {
    id: "models",
    title: "Available Models",
    description: "13 AI models across 5 providers",
    content: (
      <>
        <h3 className="text-lg font-semibold mb-4">Available Models</h3>
        <p className="text-muted-foreground mb-4">
          Access 11 cloud models and 2 local models. All models are free to use.
        </p>

        <h4 className="font-semibold mt-6 mb-3">Check Available Models</h4>
        <CodeBlock
          code={`curl -X GET "https://aj-fresh.vercel.app/api/models" \\
  -H "X-API-Key: nxq_your_api_key_here"`}
        />

        <h4 className="font-semibold mt-8 mb-3">Groq Cloud (5 models)</h4>
        <div className="space-y-2">
          <ModelCard name="kimi" provider="Groq Cloud" context="262K" />
          <ModelCard name="qwen3" provider="Groq Cloud" context="131K" />
          <ModelCard name="llama-4" provider="Groq Cloud" context="131K" />
          <ModelCard name="gpt-oss" provider="Groq Cloud" context="131K" />
          <ModelCard name="gpt-oss-120b" provider="Groq Cloud" context="131K" />
        </div>

        <h4 className="font-semibold mt-8 mb-3">Chutes AI (1 model)</h4>
        <div className="space-y-2">
          <ModelCard name="glm-4.5-air" provider="Chutes AI" context="131K" />
        </div>

        <h4 className="font-semibold mt-8 mb-3">Cerebras AI (1 model)</h4>
        <div className="space-y-2">
          <ModelCard name="zai-glm-4.6" provider="Cerebras AI" context="131K" />
        </div>

        <h4 className="font-semibold mt-8 mb-3">OpenRouter (4 models)</h4>
        <div className="space-y-2">
          <ModelCard name="deepseek-r1-qwen3-8b" provider="OpenRouter" context="131K" />
          <ModelCard name="qwen3-coder" provider="OpenRouter" context="131K" />
          <ModelCard name="mistral-small-24b" provider="OpenRouter" context="131K" />
          <ModelCard name="mistral-small-3.1-24b" provider="OpenRouter" context="131K" />
        </div>

        <h4 className="font-semibold mt-8 mb-3">Ollama Local (2 models)</h4>
        <div className="space-y-2">
          <ModelCard name="qwen3-local" provider="Ollama Local" context="8K" />
          <ModelCard name="glm-4.6" provider="Ollama Local" context="8K" />
        </div>
      </>
    ),
  },
  {
    id: "api-reference",
    title: "API Reference",
    description: "Complete API endpoint documentation",
    content: (
      <>
        <h3 className="text-lg font-semibold mb-4">API Reference</h3>
        
        <div className="space-y-8 mt-6">
          <div>
            <h4 className="font-semibold text-green-600 dark:text-green-400 mb-1">POST /api/chat</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Send a chat completion request to any of the 13 available models.
            </p>

            <h5 className="text-sm font-semibold mt-4 mb-2">Headers</h5>
            <CodeBlock code={`Content-Type: application/json
X-API-Key: nxq_your_api_key_here`} />

            <h5 className="text-sm font-semibold mt-4 mb-2">Request Body</h5>
            <CodeBlock
              code={`{
  "model": "kimi",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "What is 2+2?"}
  ],
  "temperature": 0.7,
  "max_tokens": 1000,
  "stream": false
}`}
            />

            <h5 className="text-sm font-semibold mt-4 mb-2">cURL Example</h5>
            <CodeBlock
              code={`curl -X POST "https://aj-fresh.vercel.app/api/chat" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: nxq_demo123456789abcdef" \\
  -d '{
    "model": "deepseek-r1-qwen3-8b",
    "messages": [
      {"role": "user", "content": "Explain quantum computing"}
    ]
  }'`}
            />

            <h5 className="text-sm font-semibold mt-4 mb-2">JavaScript Example</h5>
            <CodeBlock
              code={`const response = await fetch('https://aj-fresh.vercel.app/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'nxq_your_api_key_here'
  },
  body: JSON.stringify({
    model: 'kimi',
    messages: [
      { role: 'user', content: 'What is 2+2?' }
    ]
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);`}
            />

            <h5 className="text-sm font-semibold mt-4 mb-2">Python Example</h5>
            <CodeBlock
              code={`import requests

response = requests.post(
    'https://aj-fresh.vercel.app/api/chat',
    headers={
        'Content-Type': 'application/json',
        'X-API-Key': 'nxq_your_api_key_here'
    },
    json={
        'model': 'qwen3-coder',
        'messages': [
            {'role': 'user', 'content': 'Write a Python function to calculate fibonacci'}
        ]
    }
)

data = response.json()
print(data['choices'][0]['message']['content'])`}
            />
          </div>

          <div>
            <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-1">GET /api/models</h4>
            <p className="text-sm text-muted-foreground mb-4">
              List all available models and their capabilities.
            </p>

            <h5 className="text-sm font-semibold mt-4 mb-2">cURL Example</h5>
            <CodeBlock
              code={`curl -X GET "https://aj-fresh.vercel.app/api/models" \\
  -H "X-API-Key: nxq_your_api_key_here"`}
            />

            <h5 className="text-sm font-semibold mt-4 mb-2">Response</h5>
            <CodeBlock
              code={`{
  "object": "list",
  "data": [
    {
      "id": "kimi",
      "object": "model",
      "created": 1677652288,
      "owned_by": "groq",
      "context_window": 262144
    },
    {
      "id": "deepseek-r1-qwen3-8b",
      "object": "model",
      "created": 1677652288,
      "owned_by": "openrouter",
      "context_window": 131072
    }
  ]
}`}
            />
          </div>

          <div>
            <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-1">Streaming Responses</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Enable streaming for real-time token generation.
            </p>

            <h5 className="text-sm font-semibold mt-4 mb-2">Example</h5>
            <CodeBlock
              code={`curl -X POST "https://aj-fresh.vercel.app/api/chat" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: nxq_your_api_key_here" \\
  -d '{
    "model": "kimi",
    "messages": [{"role": "user", "content": "Write a story"}],
    "stream": true
  }'`}
            />
          </div>
        </div>
      </>
    ),
  },
  {
    id: "examples",
    title: "Code Examples",
    description: "Ready-to-use code snippets",
    content: (
      <>
        <h3 className="text-lg font-semibold mb-4">Code Examples</h3>

        <h4 className="font-semibold mt-6 mb-3">Node.js with OpenAI SDK</h4>
        <CodeBlock
          code={`import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXARIQ_API_KEY,
  baseURL: 'https://aj-fresh.vercel.app/api'
});

async function chat() {
  const completion = await openai.chat.completions.create({
    model: 'kimi',
    messages: [
      { role: 'user', content: 'Hello!' }
    ]
  });
  
  console.log(completion.choices[0].message.content);
}

chat();`}
        />

        <h4 className="font-semibold mt-8 mb-3">Python with OpenAI SDK</h4>
        <CodeBlock
          code={`from openai import OpenAI

client = OpenAI(
    api_key="nxq_your_api_key_here",
    base_url="https://aj-fresh.vercel.app/api"
)

response = client.chat.completions.create(
    model="qwen3",
    messages=[
        {"role": "user", "content": "What is AI?"}
    ]
)

print(response.choices[0].message.content)`}
        />

        <h4 className="font-semibold mt-8 mb-3">React Hook Example</h4>
        <CodeBlock
          code={`import { useState } from 'react';

export function useChat() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');

  const chat = async (message: string, model: string = 'kimi') => {
    setLoading(true);
    try {
      const res = await fetch('https://aj-fresh.vercel.app/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY!
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: message }]
        })
      });
      
      const data = await res.json();
      setResponse(data.choices[0].message.content);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return { chat, loading, response };
}`}
        />
      </>
    ),
  },
  {
    id: "rate-limits",
    title: "Rate Limits & Best Practices",
    description: "Usage limits and optimization tips",
    content: (
      <>
        <h3 className="text-lg font-semibold mb-4">Rate Limits & Best Practices</h3>

        <h4 className="font-semibold mt-6 mb-3">Rate Limits</h4>
        <div className="border border-border rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Requests per minute:</span>
            <span className="font-mono">60</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Requests per day:</span>
            <span className="font-mono">10,000</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Concurrent requests:</span>
            <span className="font-mono">5</span>
          </div>
        </div>

        <h4 className="font-semibold mt-8 mb-3">Best Practices</h4>
        <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
          <li>Implement exponential backoff for retry logic</li>
          <li>Cache responses when possible to reduce API calls</li>
          <li>Use streaming for long-form content generation</li>
          <li>Choose the right model for your task (see Models page)</li>
          <li>Set appropriate <code className="bg-muted px-1 py-0.5 rounded text-xs">max_tokens</code> limits</li>
          <li>Monitor your usage in the <Link href="/dashboard/analytics" className="text-accent hover:underline">Analytics</Link> dashboard</li>
        </ul>

        <h4 className="font-semibold mt-8 mb-3">Error Handling</h4>
        <CodeBlock
          code={`async function chatWithRetry(message, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch('https://aj-fresh.vercel.app/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'nxq_your_api_key_here'
        },
        body: JSON.stringify({
          model: 'kimi',
          messages: [{ role: 'user', content: message }]
        })
      });

      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}\`);
      }

      return await response.json();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Exponential backoff
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}`}
        />
      </>
    ),
  },
];

export default function DocsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSection, setSelectedSection] = useState("getting-started");

  const filteredSections = docSections.filter(
    (section) =>
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedDoc = docSections.find((s) => s.id === selectedSection);

  return (
    <div className="min-h-svh flex flex-col">
      <header className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">API Documentation</h1>
          </div>
          <nav className="flex gap-4">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/dashboard/api-keys" className="text-sm text-muted-foreground hover:text-foreground">
              API Keys
            </Link>
            <Link href="/dashboard/console" className="text-sm text-muted-foreground hover:text-foreground">
              Console
            </Link>
          </nav>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        <aside className="w-64 border-r border-border p-6 hidden md:block">
          <div className="mb-6">
            <Input
              placeholder="Search docs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-sm"
            />
          </div>
          <nav className="space-y-2">
            {filteredSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setSelectedSection(section.id)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition ${
                  selectedSection === section.id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6 md:p-12 overflow-auto">
          {selectedDoc ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {selectedDoc.content}
            </div>
          ) : (
            <div className="text-muted-foreground">No documentation found</div>
          )}
        </main>
      </div>
    </div>
  );
}
