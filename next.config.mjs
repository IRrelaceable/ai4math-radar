/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Lint is intentionally not part of the build for the MVP; `npm run typecheck` covers types.
    ignoreDuringBuilds: true,
  },
  async redirects() {
    // The research map merged into /topics; keep old links working.
    return [{ source: "/research-map", destination: "/topics", permanent: true }];
  },
};

export default nextConfig;
