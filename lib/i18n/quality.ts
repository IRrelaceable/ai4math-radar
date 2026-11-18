import type { ResearchEvent } from "@/types";

/** Fields that would make a Chinese event card fall back to English prose. */
export function missingChineseCardFields(event: ResearchEvent): string[] {
  const zh = event.translations?.zh;
  const missing: string[] = [];
  if (!zh?.title?.trim()) missing.push("title");
  if (!zh?.summary?.trim() || !/[\u3400-\u9fff]/.test(zh.summary)) missing.push("summary");
  if (event.significance?.trim() && (!zh?.significance?.trim() || !/[\u3400-\u9fff]/.test(zh.significance))) {
    missing.push("significance");
  }
  return missing;
}
