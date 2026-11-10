import type { ListEvent } from "@/types";
import { EventCard } from "./EventCard";
import { SITE_LANG } from "@/lib/site";
import { dict } from "@/lib/i18n/dict";

/** Server-rendered card grid: no client state, so the feed ships no card JS. */
export function EventGrid({ events }: { events: ListEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="card p-10 text-center text-sm text-ink-500">
        {dict[SITE_LANG].common.empty}
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {events.map((e) => (
        <EventCard key={e.id} event={e} />
      ))}
    </div>
  );
}
