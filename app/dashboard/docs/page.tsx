"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

const docSections = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Set up Nexariq and make your first API call",
    content: (
      <>
        <h3 className="text-lg font-semibold mb-4">Getting Started with Nexariq</h3>
        <p className="text-muted-foreground mb-4">
          Nexariq provides a simple and powerful API for interacting with state-of-the-art AI models.
        </p>
        
        <h4 className="font-semibold mt-6 mb-2">Installation</h4>
        <CodeBlock
          language="bash"
          code={`npm install nexariq
# or
pip install nexariq`}
        />

        <h4 className="font-semibold mt-6 mb-2">Authentication</h4>
        <p className="text-sm text-muted-foreground mb-4">
          All API requests require an API key. You can generate one in your dashboard.
        </p>
        <CodeBlock
          language="javascript"
          code={`import Nexariq from 'nexariq';

const client = new Nexariq({
  apiKey: process.env.NEXARIQ_API_KEY
});`}
        />
      </>
    ),
  },
  {
    id: "models",
    title: "Available Models",
    description: "Complete list of available models and their capabilities",
    content: (
      <>
        <h3 className="text-lg font-semibold mb-4">Available Models</h3>
        
        <div className="space-y-6 mt-6">
          <ModelCard
            name="Nexariq Pro"
            version="1.0"
            description="Our most capable model for complex reasoning tasks"
            contextWindow="128K"
            costPer1K="$0.003 / $0.015"
          />
          <ModelCard
            name="Nexariq Fast"
            version="1.0"
            description="Optimized for speed with excellent quality trade-offs"
            contextWindow="64K"
            costPer1K="$0.001 / $0.005"
          />
          <ModelCard
            name="Nexariq Vision"
            version="1.0"
            description="Multimodal model for image and text understanding"
            contextWindow="128K"
            costPer1K="$0.005 / $0.020"
          />
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
            <h4 className="font-semibold text-green-600 dark:text-green-400">POST</h4>
            <h5 className="font-mono text-sm mb-2">/v1/chat/completions</h5>
            <p className="text-sm text-muted-foreground mb-4">
              Send a message and get a completion from the model.
            </p>
            <CodeBlock
              language="javascript"
              code={`const response = await client.chat.create({
  model: "nexariq-pro",
  messages: [
    { role: "user", content: "Hello!" }
  ],
  temperature: 0.7,
  max_tokens: 1000
});`}
            />
          </div>

          <div>
            <h4 className="font-semibold text-blue-600 dark:text-blue-400">GET</h4>
            <h5 className="font-mono text-sm mb-2">/v1/models</h5>
            <p className="text-sm text-muted-foreground mb-4">
              List all available models.
            </p>
            <CodeBlock
              language="javascript"
              code={`const models = await client.models.list();`}
            />
          </div>
        </div>
      </>
    ),
  },
];

function CodeBlock({ language, code }: { language: string; code: string }) {
  return (
    <div className="bg-muted rounded-lg p-4 overflow-x-auto">
      <code className="text-xs font-mono text-muted-foreground">
        {code}
      </code>
    </div>
  );
}

function ModelCard({
  name,
  version,
  description,
  contextWindow,
  costPer1K,
}: {
  name: string;
  version: string;
  description: string;
  contextWindow: string;
  costPer1K: string;
}) {
  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h5 className="font-semibold">{name}</h5>
          <p className="text-xs text-muted-foreground">v{version}</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Context:</span>
          <p className="font-mono text-xs">{contextWindow}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Cost/1K:</span>
          <p className="font-mono text-xs">{costPer1K}</p>
        </div>
      </div>
    </div>
  );
}

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
            <h1 className="text-2xl font-bold">Nexariq Portal</h1>
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
