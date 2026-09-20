import type { Metadata } from 'next'
import App from '../../src/App'

export const metadata: Metadata = { title: 'Pricing — Img.Upscaler', description: 'Choose a plan for your image workflow.' }

export default function PricingPage() {
  return <App />
}
