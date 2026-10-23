import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LangProvider } from "@/components/layout/LangProvider";
import { getLang } from "@/lib/i18n/server";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AI4Math Ecosystem Radar · AI4Math 生态雷达",
    template: "%s · AI4Math Ecosystem Radar",
  },
  description:
    "追踪 AI for Mathematics 的六类生态事件：研究、人物、机构、资助、教育与政策共同体。" +
    " Track six ecosystem classes across AI for Mathematics: research, people, institutions, funding, education and policy.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = getLang();
  return (
    <html lang={lang}>
      <body className="flex min-h-screen flex-col">
        <LangProvider initialLang={lang}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </LangProvider>
      </body>
    </html>
  );
}

