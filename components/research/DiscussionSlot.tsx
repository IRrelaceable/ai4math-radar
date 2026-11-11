export interface DiscussionLabels {
  title: string;
  pending: string;
  hint: string;
  placeholder: string;
  button: string;
}

/**
 * Discussion placeholder shared by event detail pages and the lab archive.
 * The thread needs a backend the static build does not have, so the position,
 * heading and input shape are reserved and the controls stay disabled.
 */
export function DiscussionSlot({
  labels,
  fieldId,
  sectionId,
  headingId,
  headingLevel = 2,
  className = "",
}: {
  labels: DiscussionLabels;
  fieldId: string;
  sectionId: string;
  headingId: string;
  headingLevel?: 2 | 3;
  className?: string;
}) {
  const Heading = headingLevel === 3 ? "h3" : "h2";

  return (
    <section
      id={sectionId}
      aria-labelledby={headingId}
      className={`border-t border-ink-200 pt-7 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Heading id={headingId} className="section-head h-section">
          {labels.title}
        </Heading>
        <span className="chip border-dashed border-ink-300 text-ink-500">
          {labels.pending}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink-600">{labels.hint}</p>
      <div className="mt-4">
        <label htmlFor={fieldId} className="sr-only">
          {labels.placeholder}
        </label>
        <textarea
          id={fieldId}
          rows={3}
          disabled
          placeholder={labels.placeholder}
          className="w-full resize-none rounded-md border border-ink-200 bg-ink-50 px-3 py-2 text-sm leading-relaxed text-ink-700 placeholder:text-ink-400 disabled:cursor-not-allowed"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            disabled
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {labels.button}
          </button>
        </div>
      </div>
    </section>
  );
}
