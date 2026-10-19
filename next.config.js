/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.acko.com',
      },
      {
        protocol: 'https',
        hostname: '**.ackodev.com',
      },
    ],
  },
};

module.exports = nextConfig;
