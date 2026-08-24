import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
