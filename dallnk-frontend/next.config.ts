import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)", // apply CSP to all routes
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              script-src 'self' 'unsafe-inline' https://auth.privy.io https://www.googletagmanager.com;
              connect-src 'self' https://auth.privy.io https://api.node.glif.io https://api.calibration.node.glif.io;
              img-src 'self' data:;
              style-src 'self' 'unsafe-inline';
            `.replace(/\s{2,}/g, " "), // minify spacing
          },
        ],
      },
    ];
  },
};

export default nextConfig;
