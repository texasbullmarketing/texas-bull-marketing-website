/**
 * One-time setup: create a Stripe Product + default Price (blueprint: /v1/products).
 *
 * Usage:
 *   1. Copy .env.example → .env.local and set STRIPE_SECRET_KEY
 *   2. node scripts/create-stripe-product.mjs
 *   3. Paste the printed STRIPE_PRICE_ID into .env.local
 *
 * Requires: STRIPE_SECRET_KEY in env or .env.local
 */

import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import Stripe from 'stripe'

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), '.env.local')
  if (!existsSync(envPath)) return
  const text = readFileSync(envPath, 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnvLocal()

const secret = process.env.STRIPE_SECRET_KEY
if (!secret) {
  console.error('Missing STRIPE_SECRET_KEY. Set it in .env.local (from Stripe Dashboard → Developers → API keys).')
  process.exit(1)
}

const stripe = new Stripe(secret)

const productName = process.env.STRIPE_PRODUCT_NAME || 'Example Product'
// Blueprint default: $20.00 USD one-time
const unitAmount = Number(process.env.STRIPE_UNIT_AMOUNT || 2000)
const currency = process.env.STRIPE_CURRENCY || 'usd'

const product = await stripe.products.create({
  name: productName,
  default_price_data: {
    currency,
    unit_amount: unitAmount,
  },
})

const priceId =
  typeof product.default_price === 'string'
    ? product.default_price
    : product.default_price?.id

console.log('\nProduct created successfully.\n')
console.log(`  Product ID : ${product.id}`)
console.log(`  Price ID   : ${priceId}`)
console.log(`  Name       : ${product.name}`)
console.log(`  Amount     : ${unitAmount} ${currency} (cents)\n`)
console.log('Add this to .env.local:\n')
console.log(`STRIPE_PRICE_ID=${priceId}\n`)
