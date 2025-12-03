/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Remove the eslint configuration from here
  images: {
    // Replace domains with remotePatterns
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Replace with your specific domains
      },
    ],
  },
  // Remove or fix experimental.serverActions
  // If you need Server Actions (Next.js 13.4+), use:
  experimental: {
    // Only if you're on an older version that requires this
    // serverActions: true, // Remove if using Next.js 14+
  }
}

module.exports = nextConfig