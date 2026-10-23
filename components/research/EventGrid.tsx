import type { ResearchEvent } from "@/types";
import { EventCard } from "./EventCard";

export function EventGrid({ events }: { events: ResearchEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-ink-500">
        No research events match the current filters.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {events.map((e) => (
        <EventCard key={e.id} event={e} />
      ))}
    </div>
  );
}
