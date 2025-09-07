import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['child_process', 'fs', 'path'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/photos/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/workspace-*/image/**',
      },
      { 
        protocol: 'https', 
        hostname: 'replicate.delivery', 
        pathname: '/**', 
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/outputs/:path*',
        destination: '/api/serve/:path*',
      },
    ]
  },
}

export default nextConfig
