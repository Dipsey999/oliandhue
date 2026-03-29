/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only process /admin and /api routes through Next.js
  // Static HTML files are served directly by Vercel from the public directory
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'cdn.prod.website-files.com',
      },
    ],
  },
}

export default nextConfig
