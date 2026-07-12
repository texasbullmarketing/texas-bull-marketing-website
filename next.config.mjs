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
  // Block search engines for the whole demo tree (hub + every slug + assets).
  // New folders under public/demo/ inherit this automatically — no per-demo setup.
  async headers() {
    return [
      {
        source: '/demo',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/demo/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
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
