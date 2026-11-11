import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LangProvider } from "@/components/layout/LangProvider";
import { getLang } from "@/lib/i18n/server";
import { SITE_LANG, SITE_BASE } from "@/lib/site";
import "./globals.css";

const SITE_TITLE = "AI4Math Ecosystem Radar";

// Absolute origin used to resolve generated OpenGraph / metadata URLs. The
// publish workflow derives it from the Pages deployment (or vars.SITE_URL for
// custom domains); a local build falls back to the dev origin rather than a
// made-up production domain that would leak into shared links.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  new URL(SITE_BASE || "/", "http://localhost:3000").toString();

// The favicon sits at the deployment root. Both language exports can share it
// because the English build is copied under <root>/en, while BASE_PATH would
// point at /<repo>/en/icon.svg on the English site.
const ICON_URL = `${SITE_BASE}/icon.svg`;

const SITE_DESC =
  SITE_LANG === "zh"
    ? "追踪 AI for Mathematics 的五类生态事件：研究、人物、机构与教育、资助与政策共同体。"
    : "Tracking five ecosystem classes across AI for Mathematics: research, people, institutions & education, funding and policy.";

// The site is exported twice (zh at the root, en under /en), so document
// metadata is fixed per build instead of being negotiated per request.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_TITLE,
  title: {
    default: SITE_LANG === "zh" ? `${SITE_TITLE} · AI4Math 生态雷达` : SITE_TITLE,
    template: `%s · ${SITE_TITLE}`,
  },
  description: SITE_DESC,
  icons: {
    icon: [{ url: ICON_URL, type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    siteName: SITE_TITLE,
    title: SITE_LANG === "zh" ? `${SITE_TITLE} · AI4Math 生态雷达` : SITE_TITLE,
    description: SITE_DESC,
    locale: SITE_LANG === "zh" ? "zh_CN" : "en_US",
  },
  twitter: {
    card: "summary",
    title: SITE_LANG === "zh" ? `${SITE_TITLE} · AI4Math 生态雷达` : SITE_TITLE,
    description: SITE_DESC,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = getLang();
  return (
    <html lang={lang}>
      <body className="flex min-h-screen flex-col">
        <LangProvider>
          <Header />
          <main id="top" className="flex-1">{children}</main>
          <Footer />
        </LangProvider>
      </body>
    </html>
  );
}

