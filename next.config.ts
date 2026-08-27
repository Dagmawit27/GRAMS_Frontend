import type { NextConfig } from "next";

const backendOrigin = process.env.API_PROXY_TARGET || "http://127.0.0.1:8080";

const nextConfig: NextConfig = {
  transpilePackages: ["recharts"],
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendOrigin}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
