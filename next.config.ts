import type { NextConfig } from "next";

const backendOrigin = process.env.API_PROXY_TARGET || "http://127.0.0.1:8080";

const nextConfig: NextConfig = {
  transpilePackages: ["recharts"],
  output: "standalone",
  allowedDevOrigins: [
    "192.168.100.252",
    "192.168.100.*",
    "192.168.*.*",
    "10.*.*.*",
    "172.16.*.*",
    "*.local",
    "localhost",
  ],
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendOrigin}/api/v1/:path*`,
      },
      {
        source: "/api/notifications/:path*",
        destination: `${backendOrigin}/api/notifications/:path*`,
      },
      {
        source: "/officer/taxOfficer/:path*",
        destination: "/officer/taxOffice/:path*",
      },
    ];
  },
};

export default nextConfig;
