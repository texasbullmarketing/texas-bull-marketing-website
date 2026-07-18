/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Trailing slash so /demo/CompanyName/ keeps relative assets
  // (images/, partials/) under the demo folder — not /demo/.
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
      {
        source: '/card',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/card/',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/card.html',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
  // Old short slugs → full company-name URLs (shared links still work).
  async redirects() {
    return [
      {
        source: '/demo/efs',
        destination: '/demo/EnterpriseFlooringSolutions/',
        permanent: true,
      },
      {
        source: '/demo/efs/',
        destination: '/demo/EnterpriseFlooringSolutions/',
        permanent: true,
      },
      {
        source: '/demo/ench',
        destination: '/demo/LaEnchiladita/',
        permanent: true,
      },
      {
        source: '/demo/ench/',
        destination: '/demo/LaEnchiladita/',
        permanent: true,
      },
      {
        source: '/demo/wave',
        destination: '/demo/WaveFindersElectronics/',
        permanent: true,
      },
      {
        source: '/demo/wave/',
        destination: '/demo/WaveFindersElectronics/',
        permanent: true,
      },
      {
        source: '/demo/irs',
        destination: '/demo/IronRootsServices/',
        permanent: true,
      },
      {
        source: '/demo/irs/',
        destination: '/demo/IronRootsServices/',
        permanent: true,
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
          source: '/billing',
          destination: '/billing.html',
        },
        {
          source: '/billing/',
          destination: '/billing.html',
        },
        {
          source: '/card',
          destination: '/card.html',
        },
        {
          source: '/card/',
          destination: '/card.html',
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
