const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD
} = require('next/constants')

/** @type {(phase: string, defaultConfig: import("next").NextConfig) => Promise<import("next").NextConfig>} */
module.exports = async (phase) => {
  /** @type {import("next").NextConfig} */
  const nextConfig = {
    experimental: {
      serverComponentsExternalPackages: ['mongoose']
    },
    eslint: {
      // Warning: This allows production builds to successfully complete even if
      // your project has ESLint errors.
      ignoreDuringBuilds: true
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'img.clerk.com'
        },
        {
          protocol: 'https',
          hostname: 'images.clerk.dev'
        },
        {
          protocol: 'https',
          hostname: 'placehold.co'
        }
      ]
    }
  }

  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
    const withSerwist = (await import('@serwist/next')).default({
      // Note: This is only an example. If you use Pages Router,
      // use something else that works, such as "service-worker/index.ts".
      swSrc: 'app/sw.ts',
      swDest: 'public/sw.js'
    })
    return withSerwist(nextConfig)
  }

  return nextConfig
}
