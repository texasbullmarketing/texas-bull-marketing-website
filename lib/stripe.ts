import Stripe from 'stripe'

/**
 * Server-only Stripe client.
 * Leave apiVersion unset unless Stripe docs specify a pin for this project.
 */
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('Missing STRIPE_SECRET_KEY. Add it to .env.local from the Stripe Dashboard.')
  }
  return new Stripe(key)
}

export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    process.env.SITE_URL?.replace(/\/$/, '') ||
    'http://localhost:3000'
  )
}
