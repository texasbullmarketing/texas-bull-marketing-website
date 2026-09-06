import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const PLANS = new Set([
  'demo',
  'standard-site',
  'premium-site',
  'standard-gbp',
  'premium-gbp',
])

type LeadBody = {
  name?: string
  business?: string
  email?: string
  phone?: string
  city?: string
  plan?: string
  notes?: string
  website?: string
  lang?: string
  source?: string
}

function clean(value: unknown, max = 200) {
  return String(value ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max)
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function leadText(lead: Record<string, string>) {
  return [
    'New Texas Bull Marketing lead',
    `Name: ${lead.name}`,
    `Business: ${lead.business}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone}`,
    `City: ${lead.city || '—'}`,
    `Plan: ${lead.plan}`,
    `Lang: ${lead.lang}`,
    `Source: ${lead.source}`,
    `Notes: ${lead.notes || '—'}`,
  ].join('\n')
}

async function postWebhook(url: string, payload: Record<string, string>) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`webhook ${res.status}`)
}

async function sendResend(to: string, apiKey: string, payload: Record<string, string>) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.LEAD_FROM_EMAIL || 'Texas Bull Marketing <leads@texasbullmarketing.com>',
      to: [to],
      reply_to: payload.email,
      subject: `TBM lead: ${payload.business} (${payload.plan})`,
      text: leadText(payload),
    }),
  })
  if (!res.ok) throw new Error(`resend ${res.status}`)
}

async function sendFormSubmit(to: string, payload: Record<string, string>) {
  const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      _subject: `TBM lead: ${payload.business} (${payload.plan})`,
      _template: 'table',
      ...payload,
    }),
  })
  if (!res.ok) throw new Error(`formsubmit ${res.status}`)
}

export async function POST(request: Request) {
  let body: LeadBody
  try {
    body = (await request.json()) as LeadBody
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  // Honeypot — bots fill hidden "website"
  if (clean(body.website, 80)) {
    return NextResponse.json({ ok: true })
  }

  const lead = {
    name: clean(body.name, 80),
    business: clean(body.business, 120),
    email: clean(body.email, 120).toLowerCase(),
    phone: clean(body.phone, 40),
    city: clean(body.city, 80),
    plan: clean(body.plan, 40) || 'demo',
    notes: clean(body.notes, 1000),
    lang: clean(body.lang, 8) === 'es' ? 'es' : 'en',
    source: clean(body.source, 200) || '/',
    submittedAt: new Date().toISOString(),
  }

  if (!lead.name || !lead.business || !isEmail(lead.email) || lead.phone.length < 7) {
    return NextResponse.json({ ok: false, error: 'invalid_fields' }, { status: 400 })
  }
  if (!PLANS.has(lead.plan)) lead.plan = 'demo'

  const webhook = process.env.LEAD_WEBHOOK_URL
  const toEmail = process.env.LEAD_TO_EMAIL
  const resendKey = process.env.RESEND_API_KEY
  const deliveries: string[] = []
  const errors: string[] = []

  if (webhook) {
    try {
      await postWebhook(webhook, lead)
      deliveries.push('webhook')
    } catch (err) {
      errors.push(String(err))
    }
  }

  if (resendKey && toEmail) {
    try {
      await sendResend(toEmail, resendKey, lead)
      deliveries.push('resend')
    } catch (err) {
      errors.push(String(err))
    }
  } else if (toEmail) {
    try {
      await sendFormSubmit(toEmail, lead)
      deliveries.push('formsubmit')
    } catch (err) {
      errors.push(String(err))
    }
  }

  if (!deliveries.length) {
    console.warn('[lead] captured but no delivery configured', {
      business: lead.business,
      email: lead.email,
      errors,
    })
  } else if (errors.length) {
    console.warn('[lead] partial delivery', { deliveries, errors })
  }

  return NextResponse.json({ ok: true, delivered: deliveries.length > 0 })
}
