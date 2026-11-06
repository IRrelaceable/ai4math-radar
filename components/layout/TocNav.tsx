"use client";

import { useEffect, useState } from "react";

/**
 * Sticky in-page table of contents with scroll-spy.
 *
 * Used by the long-form pages (about, event detail). Hidden below `lg`; the
 * `className` prop carries the placement so the two callers can keep their own
 * sticky offsets.
 */
export function TocNav({
  items,
  label,
  className = "hidden lg:block",
}: {
  items: { id: string; label: string }[];
  label: string;
  className?: string;
}) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const threshold = 160;
    const update = () => {
      let current = items[0]?.id ?? "";
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= threshold) current = item.id;
      }
      setActive(current);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav className={className} aria-label={label}>
      <ul className="border-l border-ink-200">
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isActive ? "location" : undefined}
                className={`-ml-px block border-l-2 py-1.5 pl-4 text-sm transition-colors ${
                  isActive
                    ? "border-accent-500 font-medium text-ink-900"
                    : "border-transparent text-ink-500 hover:text-ink-800"
                }`}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
