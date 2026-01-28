import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  transpilePackages: ["react-beautiful-dnd"],
  async rewrites() {
    return [
      {
        source: "/n8n-proxy/:path*",
        destination: `${process.env.N8N_BASE_URL || ""}/:path*`,
      },
    ];
  },
};

export default nextConfig;
