/** @type {import('next').NextConfig} */

/**
 * The site is exported statically and published in two builds that share one
 * codebase:
 *
 *   SITE_LANG=zh SITE_BASE=/repo  ->  deployed at /repo/
 *   SITE_LANG=en SITE_BASE=/repo  ->  deployed at /repo/en/  (build output is
 *                                     copied into the zh build's out/en)
 *
 * basePath only rewrites URLs and asset references; the export directory stays
 * flat, so the English build can be dropped into the Chinese one as-is.
 */
const lang = process.env.SITE_LANG === "en" ? "en" : "zh";
const siteBase = process.env.SITE_BASE ?? "";
const basePath = `${siteBase}${lang === "en" ? "/en" : ""}`;

const nextConfig = {
  output: "export",
  trailingSlash: true,
  // Keeping build and dev output apart stops a production build from wiping the
  // running dev server's chunks (which served an unstyled page until restart).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  basePath: basePath || undefined,
  images: { unoptimized: true },
  reactStrictMode: true,
  eslint: {
    // Lint is intentionally not part of the build for the MVP; `npm run typecheck` covers types.
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_SITE_LANG: lang,
    NEXT_PUBLIC_SITE_BASE: siteBase,
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
