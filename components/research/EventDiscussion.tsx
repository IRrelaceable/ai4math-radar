import { getLang, t } from "@/lib/i18n/server";

/**
 * Discussion slot pinned to the bottom of every event. The thread itself needs
 * a backend the static build does not have, so the position, heading and input
 * shape are reserved here and the controls stay disabled until it ships.
 */
export function EventDiscussion() {
  const d = t(getLang()).detail;

  return (
    <section id="discussion" className="mt-9 scroll-mt-24 border-t border-ink-200 pt-7">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="section-head h-section">{d.discussion}</h2>
        <span className="chip border-dashed border-ink-300 text-ink-500">
          {d.discussionPending}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink-600">
        {d.discussionHint}
      </p>
      <div className="mt-4">
        <label htmlFor="event-discussion-input" className="sr-only">
          {d.discussionPlaceholder}
        </label>
        <textarea
          id="event-discussion-input"
          rows={3}
          disabled
          placeholder={d.discussionPlaceholder}
          className="w-full resize-none rounded-md border border-ink-200 bg-ink-50 px-3 py-2 text-sm leading-relaxed text-ink-700 placeholder:text-ink-400 disabled:cursor-not-allowed"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            disabled
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {d.discussionButton}
          </button>
        </div>
      </div>
    </section>
  );
}
