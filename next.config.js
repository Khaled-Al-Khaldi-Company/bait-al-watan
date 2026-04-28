/** @type {import('next').NextConfig} */
// Force rebuild trigger: 2026-04-28-2319
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcrypt'],
  },
};

module.exports = nextConfig;
