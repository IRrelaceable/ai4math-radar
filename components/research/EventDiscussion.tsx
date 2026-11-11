import { getLang, t } from "@/lib/i18n/server";
import { DiscussionSlot } from "./DiscussionSlot";

/** Discussion slot pinned to the bottom of every event detail page. */
export function EventDiscussion() {
  const d = t(getLang()).detail;

  return (
    <DiscussionSlot
      labels={{
        title: d.discussion,
        pending: d.discussionPending,
        hint: d.discussionHint,
        placeholder: d.discussionPlaceholder,
        button: d.discussionButton,
      }}
      sectionId="discussion"
      headingId="event-discussion-title"
      fieldId="event-discussion-input"
      className="mt-9 scroll-mt-24"
    />
  );
}
