"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ModelSpec {
  id: string;
  name: string;
  version: string;
  contextWindow: string;
  costPer1k: string;
  costPer1kOutput: string;
  capabilities: string[];
  maxTokens: number;
  trainingData: string;
  description: string;
  provider: string;
  providerLogo: string;
}

const models: ModelSpec[] = [
  // Groq Cloud Models (5 models)
  {
    id: "kimi",
    name: "Kimi K2 Instruct",
    version: "0905",
    contextWindow: "262K",
    costPer1k: "Free",
    costPer1kOutput: "Free",
    maxTokens: 16384,
    trainingData: "Moonshot AI",
    description: "Advanced conversational AI with large context window",
    capabilities: ["Large context", "Multi-turn chat", "Reasoning", "Chinese/English"],
    provider: "Groq",
    providerLogo: "/groq-logo.png",
  },
  {
    id: "qwen3",
    name: "Qwen 3 32B",
    version: "32B",
    contextWindow: "131K",
    costPer1k: "Free",
    costPer1kOutput: "Free",
    maxTokens: 40960,
    trainingData: "Alibaba Cloud",
    description: "Powerful reasoning model from Alibaba",
    capabilities: ["Advanced reasoning", "Long context", "Multilingual", "Math & Logic"],
    provider: "Qwen / Alibaba",
    providerLogo: "/qwen-logo.png",
  },
  {
    id: "llama-4",
    name: "Llama 4 Maverick",
    version: "17B-128E",
    contextWindow: "131K",
    costPer1k: "Free",
    costPer1kOutput: "Free",
    maxTokens: 8192,
    trainingData: "Meta",
    description: "Meta's latest Llama model with enhanced capabilities",
    capabilities: ["Code generation", "Reasoning", "Instruction following", "Efficiency"],
    provider: "Meta AI",
    providerLogo: "/meta-logo.svg",
  },
  {
    id: "gpt-oss",
    name: "GPT OSS 20B",
    version: "20B",
    contextWindow: "131K",
    costPer1k: "Free",
    costPer1kOutput: "Free",
    maxTokens: 65536,
    trainingData: "OpenAI Compatible",
    description: "Open-source GPT-style model with high token output",
    capabilities: ["Long output", "General purpose", "Chat", "Text generation"],
    provider: "OpenAI",
    providerLogo: "/openai-logo.png",
  },
  {
    id: "gpt-oss-120b",
    name: "GPT OSS 120B",
    version: "120B",
    contextWindow: "131K",
    costPer1k: "Free",
    costPer1kOutput: "Free",
    maxTokens: 65536,
    trainingData: "OpenAI Compatible",
    description: "Large-scale open-source GPT model for advanced tasks",
    capabilities: ["Advanced reasoning", "Long output", "Complex tasks", "High quality"],
    provider: "OpenAI",
    providerLogo: "/openai-logo.png",
  },
  
  // Chutes AI Models (1 model)
  {
    id: "glm-4.5-air",
    name: "GLM-4.5 Air",
    version: "4.5",
    contextWindow: "131K",
    costPer1k: "Free",
    costPer1kOutput: "Free",
    maxTokens: 8192,
    trainingData: "Zhipu AI",
    description: "Lightweight GLM model for efficient inference",
    capabilities: ["Fast inference", "Chat", "Multilingual", "Efficient"],
    provider: "Zhipu AI (Z.ai)",
    providerLogo: "/zhipu-logo.svg",
  },
  
  // Cerebras AI Models (1 model)
  {
    id: "zai-glm-4.6",
    name: "ZAI GLM-4.6",
    version: "4.6",
    contextWindow: "131K",
    costPer1k: "Free",
    costPer1kOutput: "Free",
    maxTokens: 40960,
    trainingData: "Zhipu AI",
    description: "Advanced reasoning model with chain-of-thought capabilities",
    capabilities: ["Chain-of-thought", "Advanced reasoning", "Long output", "Streaming"],
    provider: "Zhipu AI (Z.ai)",
    providerLogo: "/zhipu-logo.svg",
  },
  
  // OpenRouter Models (4 models)
  {
    id: "deepseek-r1-qwen3-8b",
    name: "DeepSeek R1 Qwen3 8B",
    version: "R1-0528",
    contextWindow: "131K",
    costPer1k: "Free",
    costPer1kOutput: "Free",
    maxTokens: 8192,
    trainingData: "DeepSeek",
    description: "Reasoning-focused model with thinking process extraction",
    capabilities: ["Chain-of-thought", "Reasoning", "Problem solving", "Explainability"],
    provider: "DeepSeek",
    providerLogo: "/deepseek-logo.png",
  },
  {
    id: "qwen3-coder",
    name: "Qwen3 Coder",
    version: "Coder",
    contextWindow: "131K",
    costPer1k: "Free",
    costPer1kOutput: "Free",
    maxTokens: 8192,
    trainingData: "Alibaba Cloud",
    description: "Specialized coding model for software development",
    capabilities: ["Code generation", "Code completion", "Debugging", "Multi-language"],
    provider: "Qwen / Alibaba",
    providerLogo: "/qwen-logo.png",
  },
  {
    id: "mistral-small-24b",
    name: "Mistral Small 24B",
    version: "2501",
    contextWindow: "131K",
    costPer1k: "Free",
    costPer1kOutput: "Free",
    maxTokens: 8192,
    trainingData: "Mistral AI",
    description: "Efficient Mistral model for general tasks",
    capabilities: ["Chat", "Reasoning", "Instruction following", "Efficient"],
    provider: "Mistral AI",
    providerLogo: "/mistral-logo.png",
  },
  {
    id: "mistral-small-3.1-24b",
    name: "Mistral Small 3.1 24B",
    version: "3.1",
    contextWindow: "131K",
    costPer1k: "Free",
    costPer1kOutput: "Free",
    maxTokens: 8192,
    trainingData: "Mistral AI",
    description: "Latest Mistral model with improved performance",
    capabilities: ["Enhanced reasoning", "Chat", "General purpose", "Fast"],
    provider: "Mistral AI",
    providerLogo: "/mistral-logo.png",
  },
  
  // Local Ollama Models (2 models)
  {
    id: "qwen3-local",
    name: "Qwen 3:1.7B (Local)",
    version: "1.7B",
    contextWindow: "8K",
    costPer1k: "Free",
    costPer1kOutput: "Free",
    maxTokens: 8192,
    trainingData: "Alibaba Cloud",
    description: "Local privacy-focused model (requires Ollama)",
    capabilities: ["Privacy", "Local inference", "Fast", "No internet required"],
    provider: "Qwen / Alibaba",
    providerLogo: "/qwen-logo.png",
  },
  {
    id: "glm-4.6",
    name: "GLM-4.6:Cloud (Local)",
    version: "4.6",
    contextWindow: "8K",
    costPer1k: "Free",
    costPer1kOutput: "Free",
    maxTokens: 8192,
    trainingData: "Zhipu AI",
    description: "Local reasoning model with chain-of-thought (requires Ollama)",
    capabilities: ["Chain-of-thought", "Privacy", "Local inference", "Reasoning"],
    provider: "Zhipu AI (Z.ai) - Local",
    providerLogo: "/zhipu-logo.svg",
  },
];

export default function ModelsPage() {
  const [selectedModels, setSelectedModels] = useState<string[]>([
    "kimi",
    "qwen3",
    "deepseek-r1-qwen3-8b",
  ]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleModelSelect = (modelId: string) => {
    setSelectedModels((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId]
    );
  };

  const getSelectedModelSpecs = () => {
    return models.filter((m) => selectedModels.includes(m.id));
  };

  const filteredModels = models.filter(
    (model) =>
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedSpecs = getSelectedModelSpecs();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Model Comparison</h1>
        <p className="text-muted-foreground">
          Compare 13 AI models (11 cloud + 2 local) from multiple providers side-by-side
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Models to Compare</CardTitle>
            <CardDescription>
              Choose up to 3 models to compare their specifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                placeholder="Search models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelSelect(model.id)}
                  className={`p-4 border rounded-lg text-left transition ${
                    selectedModels.includes(model.id)
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <img 
                      src={model.providerLogo} 
                      alt={model.provider} 
                      className="w-6 h-6 rounded flex-shrink-0"
                      title={model.provider}
                    />
                    <h3 className="font-semibold">{model.name}</h3>
                  </div>
                  <p className="text-sm opacity-80">{model.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedSpecs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold">
                    Specification
                  </th>
                  {selectedSpecs.map((model) => (
                    <th
                      key={model.id}
                      className="text-left px-4 py-3 font-semibold"
                    >
                      <div className="flex items-center gap-2">
                        <img 
                          src={model.providerLogo} 
                          alt={model.provider} 
                          className="w-5 h-5 rounded"
                          title={model.provider}
                        />
                        {model.name}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">Version</td>
                  {selectedSpecs.map((model) => (
                    <td key={model.id} className="px-4 py-3">
                      {model.version}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">Context Window</td>
                  {selectedSpecs.map((model) => (
                    <td key={model.id} className="px-4 py-3">
                      {model.contextWindow}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">Input Cost (per 1K)</td>
                  {selectedSpecs.map((model) => (
                    <td key={model.id} className="px-4 py-3">
                      {model.costPer1k}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">Output Cost (per 1K)</td>
                  {selectedSpecs.map((model) => (
                    <td key={model.id} className="px-4 py-3">
                      {model.costPer1kOutput}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">Max Tokens</td>
                  {selectedSpecs.map((model) => (
                    <td key={model.id} className="px-4 py-3">
                      {model.maxTokens}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">Training Data</td>
                  {selectedSpecs.map((model) => (
                    <td key={model.id} className="px-4 py-3">
                      {model.trainingData}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium align-top">Capabilities</td>
                  {selectedSpecs.map((model) => (
                    <td key={model.id} className="px-4 py-3">
                      <ul className="space-y-1">
                        {model.capabilities.map((cap, idx) => (
                          <li key={idx} className="text-sm">
                            • {cap}
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {selectedSpecs.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Select at least one model to see the comparison
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
