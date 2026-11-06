/**
 * LLM API interface (预留接口).
 *
 * The MVP never depends on a real API: the default provider is `mock`.
 * To wire a real model later, set:
 *
 *   LLM_PROVIDER=openai-compatible
 *   LLM_API_URL=https://api.openai.com/v1/chat/completions
 *   LLM_API_KEY=sk-...
 *   LLM_MODEL=gpt-4o-mini
 *
 * Any OpenAI-compatible chat-completions endpoint works.
 */
export interface LLMProvider {
  id: string;
  complete(prompt: string, options?: { system?: string; maxTokens?: number }): Promise<string>;
}

/** Deterministic offline provider so the site runs with no API key. */
export class MockLLMProvider implements LLMProvider {
  id = "mock";

  async complete(prompt: string): Promise<string> {
    return `[mock-llm] ${prompt.slice(0, 240)}`;
  }
}

export interface RemoteLLMConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
}

/** Minimal OpenAI-compatible chat completions client (fetch based, no SDK). */
export class OpenAICompatibleProvider implements LLMProvider {
  id = "openai-compatible";

  constructor(private readonly config: RemoteLLMConfig) {}

  async complete(prompt: string, options?: { system?: string; maxTokens?: number }): Promise<string> {
    const { apiUrl, apiKey, model } = this.config;
    if (!apiUrl || !apiKey) {
      throw new Error("LLM_API_URL and LLM_API_KEY are required for the openai-compatible provider.");
    }
    const messages = [];
    if (options?.system) messages.push({ role: "system", content: options.system });
    messages.push({ role: "user", content: prompt });

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: options?.maxTokens ?? 700,
      }),
      // A stalled provider must not freeze a sync; summarize() falls back to
      // the deterministic abstract-based text when this aborts.
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) {
      throw new Error(`LLM request failed: ${res.status} ${await res.text()}`);
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content ?? "";
  }
}

export function getLLMProvider(): LLMProvider {
  const kind = (process.env.LLM_PROVIDER ?? "mock").toLowerCase();
  if (kind === "openai-compatible") {
    return new OpenAICompatibleProvider({
      apiUrl: process.env.LLM_API_URL ?? "",
      apiKey: process.env.LLM_API_KEY ?? "",
      model: process.env.LLM_MODEL ?? "gpt-4o-mini",
    });
  }
  return new MockLLMProvider();
}
