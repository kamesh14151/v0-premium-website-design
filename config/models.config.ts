/**
 * AJStudioz AI Models Configuration
 * Multi-cloud AI platform with 13 models from 4 providers
 */

export interface ModelConfig {
  id: string;
  name: string;
  provider: 'groq' | 'chutes' | 'cerebras' | 'openrouter' | 'ollama';
  endpoint: string;
  contextWindow: number;
  maxTokens: number;
  supportsStreaming: boolean;
  supportsReasoning: boolean;
  pricing: {
    inputPer1k: number;  // $0 for free models
    outputPer1k: number;
  };
  capabilities: string[];
  description: string;
}

export const MODELS: ModelConfig[] = [
  // ===== GROQ CLOUD MODELS (5 models with 5-key rotation) =====
  {
    id: 'kimi',
    name: 'Kimi K2 Instruct',
    provider: 'groq',
    endpoint: 'moonshotai/kimi-k2-instruct-0905',
    contextWindow: 262144,
    maxTokens: 16384,
    supportsStreaming: false,
    supportsReasoning: false,
    pricing: { inputPer1k: 0, outputPer1k: 0 },
    capabilities: ['Large context', 'Multi-turn chat', 'Multilingual', 'Conversational AI'],
    description: 'Advanced conversational AI from Moonshot AI with 262K context window',
  },
  {
    id: 'qwen3',
    name: 'Qwen 3 32B',
    provider: 'groq',
    endpoint: 'qwen/qwen3-32b',
    contextWindow: 131072,
    maxTokens: 40960,
    supportsStreaming: false,
    supportsReasoning: true,
    pricing: { inputPer1k: 0, outputPer1k: 0 },
    capabilities: ['Advanced reasoning', 'Long context', 'Multilingual', 'Math & Logic'],
    description: 'Powerful 32B parameter reasoning model from Alibaba Cloud',
  },
  {
    id: 'llama-4',
    name: 'Llama 4 Maverick',
    provider: 'groq',
    endpoint: 'meta-llama/llama-4-maverick-17b-128e-instruct',
    contextWindow: 131072,
    maxTokens: 8192,
    supportsStreaming: false,
    supportsReasoning: false,
    pricing: { inputPer1k: 0, outputPer1k: 0 },
    capabilities: ['Code generation', 'Reasoning', 'Instruction following', 'Efficiency'],
    description: "Meta's latest Llama 4 model with enhanced capabilities",
  },
  {
    id: 'gpt-oss',
    name: 'GPT OSS 20B',
    provider: 'groq',
    endpoint: 'openai/gpt-oss-20b',
    contextWindow: 131072,
    maxTokens: 65536,
    supportsStreaming: false,
    supportsReasoning: false,
    pricing: { inputPer1k: 0, outputPer1k: 0 },
    capabilities: ['Long output', 'General purpose', 'Chat', 'Text generation'],
    description: 'Open-source GPT-style model with high token output capacity',
  },
  {
    id: 'gpt-oss-120b',
    name: 'GPT OSS 120B',
    provider: 'groq',
    endpoint: 'openai/gpt-oss-120b',
    contextWindow: 131072,
    maxTokens: 65536,
    supportsStreaming: false,
    supportsReasoning: false,
    pricing: { inputPer1k: 0, outputPer1k: 0 },
    capabilities: ['Advanced reasoning', 'Long output', 'Complex tasks', 'High quality'],
    description: 'Large-scale 120B parameter open-source GPT model for advanced tasks',
  },

  // ===== CHUTES AI MODELS (1 model) =====
  {
    id: 'glm-4.5-air',
    name: 'GLM-4.5 Air',
    provider: 'chutes',
    endpoint: 'zai-org/GLM-4.5-Air',
    contextWindow: 131072,
    maxTokens: 8192,
    supportsStreaming: false,
    supportsReasoning: false,
    pricing: { inputPer1k: 0, outputPer1k: 0 },
    capabilities: ['Fast inference', 'Chat', 'Multilingual', 'Efficient'],
    description: 'Lightweight GLM model from Zhipu AI for efficient inference',
  },

  // ===== CEREBRAS AI MODELS (1 model) =====
  {
    id: 'zai-glm-4.6',
    name: 'ZAI GLM-4.6',
    provider: 'cerebras',
    endpoint: 'zai-glm-4.6',
    contextWindow: 131072,
    maxTokens: 40960,
    supportsStreaming: true,
    supportsReasoning: true,
    pricing: { inputPer1k: 0, outputPer1k: 0 },
    capabilities: ['Chain-of-thought', 'Advanced reasoning', 'Long output', 'Streaming'],
    description: 'Advanced reasoning model with chain-of-thought capabilities from Zhipu AI',
  },

  // ===== OPENROUTER MODELS (4 models with 5-key rotation) =====
  {
    id: 'deepseek-r1-qwen3-8b',
    name: 'DeepSeek R1 Qwen3 8B',
    provider: 'openrouter',
    endpoint: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
    contextWindow: 131072,
    maxTokens: 8192,
    supportsStreaming: false,
    supportsReasoning: true,
    pricing: { inputPer1k: 0, outputPer1k: 0 },
    capabilities: ['Chain-of-thought', 'Reasoning', 'Problem solving', 'Explainability'],
    description: 'Reasoning-focused model with thinking process extraction from DeepSeek',
  },
  {
    id: 'qwen3-coder',
    name: 'Qwen3 Coder',
    provider: 'openrouter',
    endpoint: 'qwen/qwen3-coder:free',
    contextWindow: 131072,
    maxTokens: 8192,
    supportsStreaming: false,
    supportsReasoning: false,
    pricing: { inputPer1k: 0, outputPer1k: 0 },
    capabilities: ['Code generation', 'Code completion', 'Debugging', 'Multi-language'],
    description: 'Specialized coding model for software development from Alibaba',
  },
  {
    id: 'mistral-small-24b',
    name: 'Mistral Small 24B',
    provider: 'openrouter',
    endpoint: 'mistralai/mistral-small-24b-instruct-2501:free',
    contextWindow: 131072,
    maxTokens: 8192,
    supportsStreaming: false,
    supportsReasoning: false,
    pricing: { inputPer1k: 0, outputPer1k: 0 },
    capabilities: ['Chat', 'Reasoning', 'Instruction following', 'Efficient'],
    description: 'Efficient Mistral model for general tasks',
  },
  {
    id: 'mistral-small-3.1-24b',
    name: 'Mistral Small 3.1 24B',
    provider: 'openrouter',
    endpoint: 'mistralai/mistral-small-3.1-24b-instruct:free',
    contextWindow: 131072,
    maxTokens: 8192,
    supportsStreaming: false,
    supportsReasoning: false,
    pricing: { inputPer1k: 0, outputPer1k: 0 },
    capabilities: ['Enhanced reasoning', 'Chat', 'General purpose', 'Fast'],
    description: 'Latest Mistral model with improved performance',
  },

  // ===== LOCAL OLLAMA MODELS (2 models - Privacy Mode) =====
  {
    id: 'qwen3-local',
    name: 'Qwen 3:1.7B (Local)',
    provider: 'ollama',
    endpoint: 'qwen3:1.7b',
    contextWindow: 8192,
    maxTokens: 8192,
    supportsStreaming: true,
    supportsReasoning: false,
    pricing: { inputPer1k: 0, outputPer1k: 0 },
    capabilities: ['Privacy', 'Local inference', 'Fast', 'No internet required'],
    description: 'Local privacy-focused model from Alibaba (requires Ollama)',
  },
  {
    id: 'glm-4.6',
    name: 'GLM-4.6:Cloud (Local)',
    provider: 'ollama',
    endpoint: 'glm-4.6:cloud',
    contextWindow: 8192,
    maxTokens: 8192,
    supportsStreaming: true,
    supportsReasoning: true,
    pricing: { inputPer1k: 0, outputPer1k: 0 },
    capabilities: ['Privacy', 'Chain-of-thought', 'Reasoning', 'Streaming'],
    description: 'Local reasoning model with chain-of-thought from Zhipu AI (requires Ollama)',
  },
];

// Provider configurations
export const PROVIDER_CONFIG = {
  groq: {
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    keyCount: 5, // Support for 5 API keys
    rateLimit: { rpm: 30, tpm: 100000 },
  },
  chutes: {
    name: 'Chutes AI',
    baseUrl: 'https://llm.chutes.ai/v1',
    keyCount: 1,
    rateLimit: { rpm: 60, tpm: 200000 },
  },
  cerebras: {
    name: 'Cerebras',
    baseUrl: 'https://api.cerebras.ai/v1',
    keyCount: 1,
    rateLimit: { rpm: 60, tpm: 500000 },
  },
  openrouter: {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    keyCount: 5, // Support for 5 API keys
    rateLimit: { rpm: 200, tpm: 1000000 },
  },
  ollama: {
    name: 'Ollama (Local)',
    baseUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
    keyCount: 0, // No API key needed
    rateLimit: { rpm: 999999, tpm: 999999 },
  },
};

// Helper functions
export const getModelById = (id: string) => MODELS.find(m => m.id === id);
export const getModelsByProvider = (provider: string) => MODELS.filter(m => m.provider === provider);
export const getCloudModels = () => MODELS.filter(m => m.provider !== 'ollama');
export const getLocalModels = () => MODELS.filter(m => m.provider === 'ollama');
export const getReasoningModels = () => MODELS.filter(m => m.supportsReasoning);
