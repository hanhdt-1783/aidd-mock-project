import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Google OAuth profile photos (avatar_url copied into profiles on first login)
    // are served from *.googleusercontent.com. next/image rejects un-allowlisted
    // hosts in Next 16, which crashed /kudos once a real user's avatar appeared.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
