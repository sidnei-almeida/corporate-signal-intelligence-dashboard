import type { NextConfig } from "next";

const remoteApiUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://corporate-signal-intelligence.onrender.com";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /** Avoids intermittent webpack chunk errors with ESM chart/markdown packages in dev */
  transpilePackages: [
    "recharts",
    "react-markdown",
    "remark-gfm",
    "remark-parse",
    "remark-rehype",
    "rehype-react",
    "unified",
    "unist-util-visit",
    "mdast-util-gfm",
    "micromark-extension-gfm",
  ],
  async rewrites() {
    return [
      {
        source: "/api-backend/:path*",
        destination: `${remoteApiUrl.replace(/\/$/, "")}/:path*`,
      },
    ];
  },
};

export default nextConfig;
