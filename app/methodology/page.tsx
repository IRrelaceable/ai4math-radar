import Link from "next/link";
import { EVIDENCE_LEVELS, EVENT_TYPES, SOURCE_TIERS, VERIFICATION_STATUSES } from "@/types";
import { getLang, t } from "@/lib/i18n/server";
import { pagesDict } from "@/lib/i18n/dict.pages";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const m = pagesDict[getLang()].meta.methodology;
  return { title: m.title, description: m.desc };
}

export default function MethodologyPage() {
  const lang = getLang();
  const d = t(lang);
  const m = pagesDict[lang].methodology;

  return (
    <div className="container-page max-w-4xl py-12">
      <h1 className="text-3xl font-semibold tracking-tight">{m.title}</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
        {m.introA}
        <strong>{m.introStrong}</strong>
        {m.introB}
      </p>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        {m.dimensions.map((dim) => (
          <Dimension key={dim.n} n={dim.n} title={dim.title} body={dim.body} />
        ))}
      </section>

      <p className="mt-6 rounded-md border border-ink-200 bg-ink-50 p-4 text-sm leading-relaxed text-ink-700">
        <strong>{m.sigStrong}</strong>
        {m.sigA}
        <em>{m.sigEm}</em>
        {m.sigB}
      </p>

      <Legend
        title={m.legendStatus}
        entries={VERIFICATION_STATUSES.map((s) => [s, m.statusDesc[s]])}
      />
      <Legend title={m.legendEvidence} entries={EVIDENCE_LEVELS.map((s) => [s, m.evidenceDesc[s]])} />
      <Legend title={m.legendTier} entries={SOURCE_TIERS.map((s) => [s, m.tierDesc[s]])} />
      <Legend title={m.legendType} entries={EVENT_TYPES.map((s) => [s, m.typeDesc[s]])} />

      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">{m.dataPolicyTitle}</h2>
        <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-ink-700">
          <li>{m.policy1}</li>
          <li>{m.policy2}</li>
          <li>
            {m.policy3A}
            <span className="chip border-violet-200 bg-violet-50 text-violet-700">
              {d.common.automated}
            </span>
            {m.policy3B}
          </li>
          <li>{m.policy4}</li>
        </ul>
        <p className="mt-4 text-sm text-ink-500">
          {m.seeAlsoA}
          <Link href="/about" className="link-quiet">
            {d.nav.about}
          </Link>
          {m.seeAlsoB}
          <Link href="/timeline" className="link-quiet">
            {d.nav.timeline}
          </Link>
          {m.seeAlsoC}
        </p>
      </section>
    </div>
  );
}

function Dimension({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="card p-4">
      <div className="mono-label mb-1">{n}</div>
      <h3 className="text-[15px] font-semibold">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-ink-600">{body}</p>
    </div>
  );
}

function Legend({ title, entries }: { title: string; entries: [string, string][] }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <dl className="mt-3 divide-y divide-ink-100 rounded-md border border-ink-200">
        {entries.map(([code, label]) => (
          <div key={code} className="flex gap-4 px-4 py-2.5 text-sm">
            <dt className="w-16 shrink-0 font-mono font-medium text-ink-800">{code}</dt>
            <dd className="text-ink-600">{label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
