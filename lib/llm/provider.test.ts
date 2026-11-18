import { afterEach, describe, expect, it, vi } from "vitest";
import { OpenAICompatibleProvider } from "./provider";

function stubFetch(body: unknown, ok = true) {
  const fn = vi.fn(async () => ({
    ok,
    status: ok ? 200 : 500,
    text: async () => JSON.stringify(body),
    json: async () => body,
  }));
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => vi.unstubAllGlobals());

describe("OpenAICompatibleProvider usage", () => {
  const config = { apiUrl: "https://example.test/v1/chat", apiKey: "k", model: "m" };

  it("reports real input/output tokens when the endpoint returns usage", async () => {
    stubFetch({
      choices: [{ message: { content: "ok" } }],
      usage: { prompt_tokens: 1234, completion_tokens: 56 },
    });
    const seen: { inputTokens: number; outputTokens: number }[] = [];
    const out = await new OpenAICompatibleProvider(config).complete("hi", {
      onUsage: (u) => seen.push(u),
    });
    expect(out).toBe("ok");
    expect(seen).toEqual([{ inputTokens: 1234, outputTokens: 56 }]);
  });

  it("reports zeros rather than invented counts when usage is absent", async () => {
    stubFetch({ choices: [{ message: { content: "ok" } }] });
    const seen: unknown[] = [];
    await new OpenAICompatibleProvider(config).complete("hi", {
      onUsage: (u) => seen.push(u),
    });
    expect(seen).toEqual([{ inputTokens: 0, outputTokens: 0 }]);
  });

  it("does not break callers that pass no callback", async () => {
    stubFetch({
      choices: [{ message: { content: "ok" } }],
      usage: { prompt_tokens: 10, completion_tokens: 2 },
    });
    const out = await new OpenAICompatibleProvider(config).complete("hi");
    expect(out).toBe("ok");
  });
});
