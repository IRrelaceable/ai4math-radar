import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ResearchArea } from "@/types";
import { getStore } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { toListEvent } from "@/lib/staticData";
import { TopicView } from "@/components/topics/TopicView";
import { PageHeader } from "@/components/ui/PageHeader";
import { BackToTop } from "@/components/ui/BackToTop";
import { getLang, t } from "@/lib/i18n/server";
import { displayArea, localizeEvents } from "@/lib/i18n/localize";
import { countText, fill, pagesDict } from "@/lib/i18n/dict.pages";

/** Topic slugs that existed before the taxonomy was merged into six areas. */
const LEGACY_TOPIC_SLUGS: Record<string, string> = {
  "theorem-proving": "theorem-proving-and-formal-mathematics",
  "formal-mathematics": "theorem-proving-and-formal-mathematics",
  "mathematical-reasoning": "mathematical-reasoning-and-llms",
  "llm-for-mathematics": "mathematical-reasoning-and-llms",
  "mathematical-discovery": "mathematical-discovery-and-symbolic-computation",
  "symbolic-mathematics": "mathematical-discovery-and-symbolic-computation",
  "ai-assisted-research": "mathematical-agents",
};

const canonicalSlug = (slug: string) => LEGACY_TOPIC_SLUGS[slug] ?? slug;

/** One page per research direction, plus the pre-merge aliases. */
export async function generateStaticParams() {
  const topics = await getStore().listTopics();
  return [
    ...topics.map((topic) => ({ topic: topic.slug })),
    ...Object.keys(LEGACY_TOPIC_SLUGS).map((topic) => ({ topic })),
  ];
}

export async function generateMetadata({ params }: { params: { topic: string } }) {
  const detail = await getStore().getTopic(canonicalSlug(params.topic));
  const lang = getLang();
  return {
    title: detail ? displayArea(detail.stat.topic as ResearchArea, lang) : "Topic",
  };
}

export default async function TopicDetailPage({ params }: { params: { topic: string } }) {
  const slug = canonicalSlug(params.topic);
  const detail = await getStore().getTopic(slug);
  if (!detail) notFound();

  const lang = getLang();
  const d = t(lang);
  const p = pagesDict[lang];
  const { stat } = detail;
  const events = localizeEvents(detail.events, lang);
  const codeCount = events.filter((event) => event.githubUrl).length;

  return (
    <div className="container-page py-10">
      <div className="mb-6 text-sm text-ink-500">
        <Link href="/topics" className="link-quiet">
          {d.nav.topics}
        </Link>
        <span className="mx-2 text-ink-300">/</span>
        <span className="text-ink-700">{displayArea(stat.topic as ResearchArea, lang)}</span>
      </div>

      <PageHeader
        label={d.detail.researchArea}
        title={displayArea(stat.topic as ResearchArea, lang)}
        description={fill(p.topic.statSub, {
          count: countText(p, stat.count, "researchEvent"),
          date: formatDate(stat.latestDate, lang),
          code: codeCount,
        })}
        action={
          <Link href={`/latest?area=${encodeURIComponent(stat.topic)}`} className="btn-primary">
            {p.topic.openFeed} →
          </Link>
        }
      />

      <Suspense fallback={<div className="h-64" />}>
        <TopicView
          slug={slug}
          stat={stat}
          events={events.map(toListEvent)}
        />
      </Suspense>
      <BackToTop label={d.common.backToTop} />
    </div>
  );
}
