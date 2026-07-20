/**
 * Optional: set non-secret public env on Vercel production.
 * Payments: use Stripe Payment Links (Dashboard) — not site env keys.
 */
import { readFileSync, existsSync } from 'fs'
import { spawnSync } from 'child_process'

const env = {}
if (existsSync('.env.local')) {
  for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (!m) continue
    let v = m[2].trim()
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1)
    }
    env[m[1].trim()] = v
  }
}

const pairs = [
  [
    'NEXT_PUBLIC_SITE_URL',
    env.NEXT_PUBLIC_SITE_URL || 'https://texasbullmarketing.com',
  ],
]

for (const [key, value] of pairs) {
  if (!value) {
    console.error('Missing', key)
    process.exit(1)
  }
  const r = spawnSync(
    'vercel.cmd',
    ['env', 'add', key, 'production', '--force'],
    { input: value + '\n', encoding: 'utf8', shell: true }
  )
  console.log(key, 'status', r.status)
  if (r.stdout) process.stdout.write(r.stdout)
  if (r.stderr) process.stderr.write(r.stderr)
  if (r.status !== 0) process.exit(r.status || 1)
}

console.log('Done. Stripe keys are not used on this site — use Payment Links in Stripe Dashboard.')
