"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { TypingEffect } from "@/components/typing-effect";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  tokens?: number;
  cost?: number;
  responseTime?: number;
}

export default function ConsolePage() {
  const [selectedModel, setSelectedModel] = useState("nexariq-pro");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [temperature, setTemperature] = useState("0.7");
  const [maxTokens, setMaxTokens] = useState("1000");
  const [totalTokens, setTotalTokens] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentTypingId, setCurrentTypingId] = useState<string | null>(null);

  const models = [
    { id: "nexariq-pro", name: "Nexariq Pro", description: "Most capable, highest cost" },
    { id: "nexariq-fast", name: "Nexariq Fast", description: "Fast and efficient" },
    { id: "nexariq-vision", name: "Nexariq Vision", description: "For image analysis" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setStreamingContent("");

    try {
      const assistantId = (Date.now() + 1).toString();
      setCurrentTypingId(assistantId);

      // Real API call with streaming
      const response = await fetch("/api/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: input,
          model: selectedModel,
          temperature: parseFloat(temperature),
          max_tokens: parseInt(maxTokens),
          stream: true,
        }),
      });

      if (!response.ok) throw new Error("API request failed");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                setStreamingContent((prev) => prev + data.content);
              }
            } catch (e) {
              // Skip parse errors
            }
          }
        }
      }

      // Add complete message
      const assistantMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: streamingContent,
        tokens: Math.ceil(streamingContent.length / 4),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setTotalTokens((prev) => prev + assistantMessage.tokens || 0);
      setCurrentTypingId(null);
    } catch (error) {
      console.error("[v0] Error:", error);
      // Fallback to mock response
      const mockResponse = `Unable to connect to Nexariq API. Please check your API key and try again.`;
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: mockResponse,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          Advanced Testing Console
        </h1>
        <p className="text-gray-400">
          Real-time LLM testing with streaming, token counting, and cost estimation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="bg-black border-white/10 flex flex-col h-[600px]">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-white">Chat</CardTitle>
              <CardDescription>
                Testing {models.find((m) => m.id === selectedModel)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-4 pr-4">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <p>Start a conversation with the AI</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === "user"
                            ? "bg-cyan-500/20 border border-cyan-500/50 text-white"
                            : "bg-white/5 border border-white/10 text-gray-200"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                        {message.tokens && (
                          <p className="text-xs mt-2 text-gray-400">
                            Tokens: {message.tokens} • Cost: ${message.cost?.toFixed(6)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {currentTypingId && streamingContent && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-3 bg-white/5 border border-white/10">
                      <p className="text-sm text-gray-200">
                        <TypingEffect text={streamingContent} speed={5} />
                      </p>
                    </div>
                  </div>
                )}
                {isLoading && !streamingContent && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse delay-100"></div>
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your prompt..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  {isLoading ? "Streaming..." : "Send"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-black border-white/10">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-lg text-white">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-2">
                <Label htmlFor="model" className="text-gray-300">
                  Model
                </Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger id="model" className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/10">
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="temperature" className="text-gray-300">
                  Temperature: {temperature}
                </Label>
                <input
                  id="temperature"
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="maxTokens" className="text-gray-300">
                  Max Tokens
                </Label>
                <Input
                  id="maxTokens"
                  type="number"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(e.target.value)}
                  min="1"
                  max="4000"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-white/10">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-lg text-white">Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              <div>
                <p className="text-xs text-gray-400 mb-1">Total Tokens</p>
                <p className="text-2xl font-bold text-cyan-400">{totalTokens}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Est. Cost</p>
                <p className="text-lg font-semibold text-green-400">
                  ${totalCost.toFixed(6)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-white/10 text-gray-300 hover:bg-white/5"
                onClick={() => {
                  setMessages([]);
                  setTotalTokens(0);
                  setTotalCost(0);
                }}
              >
                Clear History
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
