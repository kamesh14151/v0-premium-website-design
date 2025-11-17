import { NextResponse } from 'next/server';
import { MODELS } from '@/config/models.config';

/**
 * Models API - Returns all available AI models
 */
export async function GET() {
  try {
    // Transform models to OpenAI-compatible format
    const modelsData = MODELS.map(model => ({
      id: model.id,
      object: 'model',
      created: 1699564800,
      owned_by: model.provider,
      name: model.name,
      description: model.description,
      context_window: model.contextWindow,
      max_tokens: model.maxTokens,
      pricing: {
        input: model.pricing.inputPer1k,
        output: model.pricing.outputPer1k,
      },
      capabilities: model.capabilities,
      supports_streaming: model.supportsStreaming,
      supports_reasoning: model.supportsReasoning,
    }));

    return NextResponse.json({
      object: 'list',
      data: modelsData,
      total: modelsData.length,
      providers: {
        groq: modelsData.filter(m => m.owned_by === 'groq').length,
        chutes: modelsData.filter(m => m.owned_by === 'chutes').length,
        cerebras: modelsData.filter(m => m.owned_by === 'cerebras').length,
        openrouter: modelsData.filter(m => m.owned_by === 'openrouter').length,
        ollama: modelsData.filter(m => m.owned_by === 'ollama').length,
      },
    });
  } catch (error) {
    console.error('Models API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}
