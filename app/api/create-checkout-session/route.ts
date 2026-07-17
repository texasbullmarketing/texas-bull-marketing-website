import { NextResponse } from 'next/server'
import { getSiteUrl, getStripe } from '@/lib/stripe'

/**
 * Create a hosted Checkout Session (one-time payment).
 * Customer is redirected to Stripe Checkout, then back to success_url.
 *
 * POST /api/create-checkout-session
 * Body (optional): { "quantity": 1, "customerEmail": "you@example.com" }
 * Returns: { url, sessionId }
 */
export async function POST(request: Request) {
  try {
    const priceId = process.env.STRIPE_PRICE_ID
    if (!priceId) {
      return NextResponse.json(
        {
          error:
            'Missing STRIPE_PRICE_ID. Run: node scripts/create-stripe-product.mjs then add the price id to .env.local',
        },
        { status: 500 }
      )
    }

    let quantity = 1
    let customerEmail: string | undefined

    try {
      const body = await request.json()
      if (body?.quantity && Number.isFinite(Number(body.quantity))) {
        quantity = Math.max(1, Math.min(99, Number(body.quantity)))
      }
      if (typeof body?.customerEmail === 'string' && body.customerEmail.includes('@')) {
        customerEmail = body.customerEmail.trim()
      }
    } catch {
      // empty body is fine
    }

    const siteUrl = getSiteUrl()
    const stripe = getStripe()

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity,
        },
      ],
      mode: 'payment',
      success_url: `${siteUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/#pricing`,
      ...(customerEmail ? { customer_email: customerEmail } : {}),
    })

    if (!session.url) {
      return NextResponse.json({ error: 'Checkout Session missing url' }, { status: 500 })
    }

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create checkout session'
    console.error('[create-checkout-session]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
