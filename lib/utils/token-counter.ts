// Advanced token counting utility
export function estimateTokens(text: string, model: string = 'nexariq-pro'): number {
  // Different models have different tokenization rates
  const tokenRates: Record<string, number> = {
    'nexariq-pro': 0.25, // ~4 chars per token
    'nexariq-fast': 0.25,
    'nexariq-vision': 0.20, // Vision model tokens differently
  };

  const rate = tokenRates[model] || 0.25;
  return Math.ceil(text.length * rate);
}

export function calculateTokenCost(
  inputTokens: number,
  outputTokens: number,
  model: string
): number {
  const rates: Record<string, { input: number; output: number }> = {
    'nexariq-pro': { input: 0.000010, output: 0.000030 },
    'nexariq-fast': { input: 0.000005, output: 0.000015 },
    'nexariq-vision': { input: 0.000015, output: 0.000045 },
  };

  const modelRate = rates[model] || rates['nexariq-pro'];
  const inputCost = (inputTokens / 1000) * modelRate.input;
  const outputCost = (outputTokens / 1000) * modelRate.output;

  return inputCost + outputCost;
}

export function formatCost(cost: number): string {
  return `$${cost.toFixed(6)}`;
}

export function formatTokens(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(2)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(2)}K`;
  }
  return tokens.toString();
}
