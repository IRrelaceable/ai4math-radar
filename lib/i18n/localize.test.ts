import { describe, expect, it } from "vitest";
import type { ResearchEvent } from "@/types";
import { localizeEvent } from "./localize";

const base: ResearchEvent = {
  id: "evt_test",
  title: "A funding announcement",
  slug: "localize-metadata-test-event",
  summary: "English summary.",
  significance: "English significance.",
  date: "2026-10-01",
  eventType: "Funding",
  sourceType: "news",
  sourceUrl: "https://example.org/announcement",
  authors: [],
  relatedWorks: [],
  metadata: {
    funding: {
      organization: "Example Foundation",
      recipient: "Mathematics programs",
      amount: "1000000",
      currency: "USD",
      amountDisclosure: "Amount disclosed in the announcement",
    },
  },
  provenance: "automated",
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
};

describe("localizeEvent metadata", () => {
  it("overlays the stored Chinese metadata on the English facts", () => {
    const out = localizeEvent(
      {
        ...base,
        translations: {
          zh: {
            title: "一笔资助",
            summary: "中文摘要。",
            metadata: {
              funding: {
                organization: "示例基金会",
                recipient: "数学项目",
                amountDisclosure: "公告中披露了金额",
              },
            },
          },
        },
      },
      "zh"
    );
    expect(out.metadata?.funding?.organization).toBe("示例基金会");
    expect(out.metadata?.funding?.recipient).toBe("数学项目");
    expect(out.metadata?.funding?.amountDisclosure).toBe("公告中披露了金额");
    // Untranslated facts are kept as stored, never dropped.
    expect(out.metadata?.funding?.amount).toBe("1000000");
    expect(out.metadata?.funding?.currency).toBe("USD");
  });

  it("applies metadata-only translations even when the prose overlay is absent", () => {
    const out = localizeEvent(
      {
        ...base,
        translations: {
          zh: { metadata: { funding: { organization: "示例基金会" } } },
        },
      },
      "zh"
    );
    expect(out.metadata?.funding?.organization).toBe("示例基金会");
    expect(out.title).toBe(base.title);
  });

  it("leaves English metadata untouched for the English UI", () => {
    const out = localizeEvent(base, "en");
    expect(out.metadata).toEqual(base.metadata);
  });
});
