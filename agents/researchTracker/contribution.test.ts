import { describe, expect, it } from "vitest";
import { parseContributionResponse } from "./contribution";

describe("parseContributionResponse", () => {
  it("parses a full English + Chinese attribution", () => {
    const parsed = parseContributionResponse(
      JSON.stringify({
        level: "assisted",
        description: "The model proposed proof steps while researchers steered the search.",
        humanContribution: "Researchers formalized the statement and checked the result.",
        zh: {
          description: "模型提出证明步骤，研究者引导搜索。",
          humanContribution: "研究者形式化陈述并检查结果。",
        },
      })
    );
    expect(parsed?.en.level).toBe("assisted");
    expect(parsed?.en.description).toContain("proof steps");
    expect(parsed?.zh?.description).toBe("模型提出证明步骤，研究者引导搜索。");
  });

  it("tolerates code fences and stray prose", () => {
    const parsed = parseContributionResponse(
      'Here:\n```json\n{"level":"unclear","description":"AI involvement is mentioned."}\n```'
    );
    expect(parsed?.en.level).toBe("unclear");
    expect(parsed?.en.humanContribution).toBeUndefined();
  });

  it("rejects an unknown level instead of guessing", () => {
    expect(parseContributionResponse('{"level":"mostly-ai"}')).toBeUndefined();
    expect(parseContributionResponse("no json here")).toBeUndefined();
  });

  it("keeps not_applicable without inventing prose", () => {
    const parsed = parseContributionResponse('{"level":"not_applicable"}');
    expect(parsed?.en.level).toBe("not_applicable");
    expect(parsed?.en.description).toBeUndefined();
  });
});
