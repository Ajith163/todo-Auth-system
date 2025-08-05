/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Remove experimental.appDir as it's now default in Next.js 13+
  // Remove env.CUSTOM_KEY as it's not needed
}

module.exports = nextConfig 