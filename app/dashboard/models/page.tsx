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
}

const models: ModelSpec[] = [
  {
    id: "nexariq-pro",
    name: "Nexariq Pro",
    version: "1.0",
    contextWindow: "128K",
    costPer1k: "$0.003",
    costPer1kOutput: "$0.015",
    maxTokens: 4096,
    trainingData: "Up to April 2024",
    description: "Most capable model for complex reasoning",
    capabilities: [
      "Advanced reasoning",
      "Code generation",
      "Long context",
      "JSON mode",
    ],
  },
  {
    id: "nexariq-fast",
    name: "Nexariq Fast",
    version: "1.0",
    contextWindow: "64K",
    costPer1k: "$0.001",
    costPer1kOutput: "$0.005",
    maxTokens: 2048,
    trainingData: "Up to April 2024",
    description: "Fast and cost-effective",
    capabilities: ["Fast inference", "Good quality", "Cost-effective"],
  },
  {
    id: "nexariq-vision",
    name: "Nexariq Vision",
    version: "1.0",
    contextWindow: "128K",
    costPer1k: "$0.005",
    costPer1kOutput: "$0.020",
    maxTokens: 4096,
    trainingData: "Up to April 2024",
    description: "Multimodal for images and text",
    capabilities: [
      "Image understanding",
      "OCR",
      "Chart analysis",
      "Diagram interpretation",
    ],
  },
];

export default function ModelsPage() {
  const [selectedModels, setSelectedModels] = useState<string[]>([
    "nexariq-pro",
    "nexariq-fast",
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
          Compare Nexariq models side-by-side to find the right one for your use case
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
                  <h3 className="font-semibold mb-1">{model.name}</h3>
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
                      {model.name}
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
