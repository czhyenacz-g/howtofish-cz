import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Komunitní screenshoty úlovků servíruje Universal Content API
    // (/media/{id}) — žádný jiný externí hostname pro next/image nechceme.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "content-api.darbujan.com",
        pathname: "/media/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Default 1 MB nestačí na screenshot (limit uploadu je 8 MB) —
      // trochu navíc kvůli multipart overhead.
      bodySizeLimit: "10mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.howtofish.cz" }],
        destination: "https://howtofish.cz/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
