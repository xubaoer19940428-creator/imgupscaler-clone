import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')
const nextConfig = {
  reactStrictMode: true,
  images: { qualities: [75, 85] },
}

export default withNextIntl(nextConfig)
