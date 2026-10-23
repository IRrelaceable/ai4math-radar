/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Lint is intentionally not part of the build for the MVP; `npm run typecheck` covers types.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
