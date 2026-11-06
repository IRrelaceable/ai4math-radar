import { describe, expect, it } from "vitest";
import type { LLMProvider } from "@/lib/llm/provider";
import {
  extractNamedEntities,
  parseEntityResponse,
  sanitizeEntities,
} from "./entities";

function fakeProvider(reply: string): LLMProvider {
  return { id: "fake", complete: async () => reply };
}

describe("entity extraction", () => {
  it("parses a fenced JSON reply and keeps known groups", () => {
    const parsed = parseEntityResponse(
      '```json\n{"people":["Terence Tao"],"institutions":["Google DeepMind"],"systems":["Lean 4"],"projects":["AI for Math Fund"]}\n```'
    );
    expect(parsed).toEqual({
      people: ["Terence Tao"],
      institutions: ["Google DeepMind"],
      projects: ["AI for Math Fund"],
      systems: ["Lean 4"],
    });
  });

  it("drops sentence-like entries, duplicates and empty groups", () => {
    const parsed = sanitizeEntities({
      people: ["John Pardon", "john pardon", "AI", "This names a person who won a prize in 2026 and teaches at a university"],
      institutions: [],
      systems: "Lean 4",
    });
    expect(parsed).toEqual({ people: ["John Pardon"] });
  });

  it("caps each group and returns nothing when nothing usable remains", () => {
    const many = Array.from({ length: 20 }, (_, i) => `Person Number ${i}`);
    expect(sanitizeEntities({ people: many })?.people).toHaveLength(8);
    expect(sanitizeEntities({ people: ["AI", "a"] })).toBeUndefined();
    expect(parseEntityResponse("no json here")).toBeUndefined();
  });

  it("uses the provider and returns its sanitized entities", async () => {
    const entities = await extractNamedEntities(
      { title: "AlphaProof solves IMO problems", abstract: "AlphaProof, built on Lean, was evaluated on IMO." },
      fakeProvider('{"systems":["AlphaProof","Lean"],"institutions":["Google DeepMind"]}')
    );
    expect(entities).toEqual({
      institutions: ["Google DeepMind"],
      systems: ["AlphaProof", "Lean"],
    });
  });
});
