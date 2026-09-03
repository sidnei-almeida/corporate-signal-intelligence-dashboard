import type { NextConfig } from "next";

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
};

export default nextConfig;
