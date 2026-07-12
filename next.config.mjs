/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Required so /demo/efs/ keeps a trailing slash and relative assets
  // (images/, partials/) resolve under the demo folder — not /demo/.
  trailingSlash: true,
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/',
          destination: '/index.html',
        },
        {
          source: '/demo/',
          destination: '/demo/index.html',
        },
        {
          source: '/demo/:slug/',
          destination: '/demo/:slug/index.html',
        },
      ],
    }
  },
}

export default nextConfig
