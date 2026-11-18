import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ResearchArea } from "@/types";
import { getStore } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { toListEvent } from "@/lib/staticData";
import { capabilityOf, facetsOf } from "@/lib/dimensions";
import { publishedEventIdBySlug, trackingSummaryBySlug } from "@/lib/tracking";
import { TopicView } from "@/components/topics/TopicView";
import { PageHeader } from "@/components/ui/PageHeader";
import { BackToTop } from "@/components/ui/BackToTop";
import { getLang, t } from "@/lib/i18n/server";
import { displayArea, localizeEvents } from "@/lib/i18n/localize";
import { countText, fill, pagesDict } from "@/lib/i18n/dict.pages";

/** One page per archived research direction. */
export async function generateStaticParams() {
  const topics = await getStore().listTopics();
  return topics.map((topic) => ({ topic: topic.slug }));
}

export async function generateMetadata({ params }: { params: { topic: string } }) {
  const detail = await getStore().getTopic(params.topic);
  const lang = getLang();
  return {
    title: detail ? displayArea(detail.stat.topic as ResearchArea, lang) : "Topic",
  };
}

export default async function TopicDetailPage({ params }: { params: { topic: string } }) {
  const slug = params.topic;
  const detail = await getStore().getTopic(slug);
  if (!detail) notFound();

  const lang = getLang();
  const d = t(lang);
  const p = pagesDict[lang];
  const { stat } = detail;
  const events = localizeEvents(detail.events, lang);
  const allEvents = await getStore().listEvents();
  const eventIds = publishedEventIdBySlug(allEvents);
  const summaries = trackingSummaryBySlug(allEvents);
  const codeCount = events.filter((event) => event.githubUrl).length;

  return (
    <div className="container-page py-10">
      <div className="mb-6 text-sm text-ink-500">
        <Link href="/latest" className="link-quiet">
          {d.nav.latest}
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
          (() => {
            const cap = capabilityOf({
              title: "",
              summary: "",
              researchArea: stat.topic as ResearchArea,
            });
            return (
              <Link href={cap ? `/latest?cap=${encodeURIComponent(cap)}` : "/latest"} className="btn-primary">
                {p.topic.openFeed} →
              </Link>
            );
          })()
        }
      />

      <Suspense fallback={<div className="h-64" />}>
        <TopicView
          slug={slug}
          stat={stat}
          events={events.map((event, i) =>
            toListEvent(
              event,
              eventIds.get(event.slug),
              facetsOf(detail.events[i]),
              summaries.get(event.slug)!
            )
          )}
        />
      </Suspense>
      <BackToTop label={d.common.backToTop} />
    </div>
  );
}
