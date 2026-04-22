import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    /** Browsers request /favicon.ico by default; serve the same transparent PNG. */
    return [{ source: "/favicon.ico", destination: "/favicon-32.png" }];
  },
  turbopack: {
    root: rootDir,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
