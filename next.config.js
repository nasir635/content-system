/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.cdninstagram.com' },
      { protocol: 'https', hostname: '**.instagram.com' },
      { protocol: 'https', hostname: 'scontent**.cdninstagram.com' },
      { protocol: 'https', hostname: '**.notion.so' },
      { protocol: 'https', hostname: 'public.blob.vercel-storage.com' },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@notionhq/client'],
  },
}

module.exports = nextConfig
