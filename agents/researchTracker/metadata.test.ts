import { describe, expect, it } from "vitest";
import { parseMetadataResponse, sanitizeMetadata } from "./metadata";

describe("ecosystem metadata", () => {
  it("parses a JSON reply wrapped in a markdown fence", () => {
    const parsed = parseMetadataResponse(
      '```json\n{"funding":{"organization":"Simons Foundation","recipient":"Mathematics programs","amount":"15000000","currency":"USD"},"zh":{"funding":{"organization":"西蒙斯基金会","recipient":"数学项目"}}}\n```',
      "Funding"
    );
    expect(parsed?.en.funding).toEqual({
      organization: "Simons Foundation",
      recipient: "Mathematics programs",
      amount: "15000000",
      currency: "USD",
    });
    expect(parsed?.zh?.funding?.organization).toBe("西蒙斯基金会");
  });

  it("keeps only the groups that belong to the event class", () => {
    const parsed = parseMetadataResponse(
      JSON.stringify({
        people: [{ name: "Terence Tao", role: "Mathematician" }],
        funding: { organization: "Some Foundation", amount: "100" },
      }),
      "People"
    );
    expect(parsed?.en.people?.[0].name).toBe("Terence Tao");
    expect(parsed?.en.funding).toBeUndefined();
  });

  it("drops empty fields and empty groups", () => {
    expect(sanitizeMetadata({ policy: {} }, "PolicyCommunity")).toBeUndefined();
    expect(
      sanitizeMetadata(
        { policy: { kind: "Open declaration", participants: ["A", "A", "B"] } },
        "PolicyCommunity"
      )?.policy
    ).toEqual({ kind: "Open declaration", participants: ["A", "B"] });
  });

  it("returns nothing for malformed output", () => {
    expect(parseMetadataResponse("no json here", "People")).toBeUndefined();
    expect(parseMetadataResponse("{ not json }", "People")).toBeUndefined();
    expect(parseMetadataResponse("{}", "People")).toBeUndefined();
  });

  it("does not extract anything for Research events", () => {
    expect(
      sanitizeMetadata({ people: [{ name: "A" }] }, "Research")
    ).toBeUndefined();
  });
});
