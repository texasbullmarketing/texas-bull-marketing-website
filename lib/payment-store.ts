import { promises as fs } from 'fs'
import path from 'path'

/**
 * Lightweight local store for completed Checkout Sessions.
 * Replace with a real DB when you need multi-instance or production analytics.
 */
export type CompletedPayment = {
  sessionId: string
  customerId: string | null
  customerEmail: string | null
  paymentStatus: string | null
  amountTotal: number | null
  currency: string | null
  createdAt: string
}

const DATA_DIR = path.join(process.cwd(), 'data')
const PAYMENTS_FILE = path.join(DATA_DIR, 'completed-payments.json')

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true })
  try {
    await fs.access(PAYMENTS_FILE)
  } catch {
    await fs.writeFile(PAYMENTS_FILE, '[]\n', 'utf8')
  }
}

export async function saveCompletedPayment(payment: CompletedPayment) {
  await ensureStore()
  const raw = await fs.readFile(PAYMENTS_FILE, 'utf8')
  const list: CompletedPayment[] = JSON.parse(raw || '[]')

  if (list.some((p) => p.sessionId === payment.sessionId)) {
    return { saved: false, reason: 'duplicate' as const }
  }

  list.push(payment)
  await fs.writeFile(PAYMENTS_FILE, JSON.stringify(list, null, 2) + '\n', 'utf8')
  return { saved: true as const }
}
