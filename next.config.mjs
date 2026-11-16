/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  async rewrites() {
    return [
      { source: '/proposal', destination: '/proposal.html' },
    ];
  },
};

export default nextConfig;
