import Link from "next/link";
import { getLang, t } from "@/lib/i18n/server";
import { pagesDict } from "@/lib/i18n/dict.pages";

export default function NotFound() {
  const lang = getLang();
  const d = t(lang);
  const p = pagesDict[lang];

  return (
    <div className="container-page py-24 text-center">
      <div className="mono-label mb-3">404</div>
      <h1 className="text-2xl font-semibold tracking-tight">{d.notFound.title}</h1>
      <p className="mt-2 text-sm text-ink-600">{d.notFound.body}</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/" className="btn-primary">
          {d.notFound.backHome}
        </Link>
        <Link href="/latest" className="btn-ghost">
          {p.notFound.latestProgress}
        </Link>
      </div>
    </div>
  );
}
