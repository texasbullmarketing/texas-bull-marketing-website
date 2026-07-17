import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { saveCompletedPayment } from '@/lib/payment-store'
import type Stripe from 'stripe'

/**
 * Stripe webhook endpoint.
 * Listens for checkout.session.completed to confirm one-time payment success.
 *
 * POST /api/webhooks/stripe
 *
 * Local test:
 *   stripe listen --forward-to localhost:3000/api/webhooks/stripe
 * Then set STRIPE_WEBHOOK_SECRET from the CLI output.
 */
export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[webhooks/stripe] Missing STRIPE_WEBHOOK_SECRET')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const rawBody = await request.text()
  const stripe = getStripe()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    console.error('[webhooks/stripe] Signature verification failed:', message)
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const result = await saveCompletedPayment({
      sessionId: session.id,
      customerId: typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null,
      customerEmail:
        session.customer_details?.email ??
        session.customer_email ??
        null,
      paymentStatus: session.payment_status ?? null,
      amountTotal: session.amount_total ?? null,
      currency: session.currency ?? null,
      createdAt: new Date().toISOString(),
    })

    console.log('[webhooks/stripe] checkout.session.completed', {
      sessionId: session.id,
      paymentStatus: session.payment_status,
      email: session.customer_details?.email ?? session.customer_email,
      saved: result.saved,
    })
  }

  return NextResponse.json({ received: true })
}
