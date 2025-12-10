/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Désactiver ESLint pendant le build de production
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Désactiver les erreurs TypeScript pendant le build
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
