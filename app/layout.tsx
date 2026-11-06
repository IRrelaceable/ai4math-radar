import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LangProvider } from "@/components/layout/LangProvider";
import { getLang } from "@/lib/i18n/server";
import { SITE_LANG } from "@/lib/site";
import "./globals.css";

const SITE_TITLE = "AI4Math Ecosystem Radar";

// The site is exported twice (zh at the root, en under /en), so document
// metadata is fixed per build instead of being negotiated per request.
export const metadata: Metadata = {
  title: {
    default: SITE_LANG === "zh" ? `${SITE_TITLE} · AI4Math 生态雷达` : SITE_TITLE,
    template: `%s · ${SITE_TITLE}`,
  },
  description:
    SITE_LANG === "zh"
      ? "追踪 AI for Mathematics 的五类生态事件：研究、人物、机构与教育、资助与政策共同体。"
      : "Tracking five ecosystem classes across AI for Mathematics: research, people, institutions & education, funding and policy.",
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

