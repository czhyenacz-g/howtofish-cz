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
      {
        // Ikony Steam achievementů (GetSchemaForGame) — Steam je servíruje
        // z několika CDN subdomén na steamstatic.com.
        protocol: "https",
        hostname: "*.steamstatic.com",
        pathname: "/steamcommunity/public/images/apps/**",
      },
      {
        // YouTube video thumbnaily pro lite-embed (viz CreatorVideoCarousel) —
        // iframe se načte až po kliknutí, do té doby jen statický náhled.
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**",
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
      // Bývalý pre-release /demo prostor byl smazán (viz CLAUDE.md) —
      // hlavní obsah je teď rovnou na /ryby.
      {
        source: "/demo",
        destination: "/ryby",
        permanent: true,
      },
      {
        source: "/demo/:path*",
        destination: "/ryby",
        permanent: true,
      },
      // Profily tvůrců se přesunuly z /stream/{slug} na /streameri/{slug}
      // (viz zadání "restrukturalizace na streamery") — /stream samotné
      // (bez dalšího segmentu, živé streamy) zůstává beze změny, tenhle
      // vzor matchuje jen "/stream/cokoliv", ne holé "/stream".
      {
        source: "/stream/:slug",
        destination: "/streameri/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
