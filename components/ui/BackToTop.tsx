/** Inline end-of-list link; `#top` is set on `<main>` in the root layout. */
export function BackToTop({ label }: { label: string }) {
  return (
    <div className="mt-8 flex justify-end">
      <a href="#top" className="link-quiet font-mono text-xs">
        {label} ↑
      </a>
    </div>
  );
}
