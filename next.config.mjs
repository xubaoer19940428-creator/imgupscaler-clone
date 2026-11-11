import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')
const nextConfig = {
  reactStrictMode: true,
  // Keep the sanitizer's PostCSS dependency tree resolved by Node/pnpm at runtime.
  serverExternalPackages: ['sanitize-html'],
  images: { qualities: [75, 85] },
}

export default withNextIntl(nextConfig)
