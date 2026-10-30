import { mkdirSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, 'public/media')
mkdirSync(resolve(outDir, 'proof'), { recursive: true })
mkdirSync(resolve(outDir, 'brand'), { recursive: true })

async function variants(src, name, widths) {
  const input = sharp(resolve(root, src))
  const meta = await input.metadata()
  for (const width of widths) {
    if (width > meta.width) continue
    const base = sharp(resolve(root, src)).resize({ width, withoutEnlargement: true })
    await base.clone().webp({ quality: 72 }).toFile(resolve(outDir, name + '-' + width + '.webp'))
    await base.clone().avif({ quality: 50 }).toFile(resolve(outDir, name + '-' + width + '.avif'))
    const info = await sharp(resolve(outDir, name + '-' + width + '.webp')).metadata()
    console.log(name, width, info.width + 'x' + info.height)
  }
}

await variants('public/demo/AutoWorx/assets/images/work/shop-exterior.jpg', 'proof/shop-exterior', [640, 960, 1280])
await variants('public/demo/AutoWorx/assets/images/work/ba-ram.jpg', 'proof/ba-ram', [640, 960, 1280])
await variants('public/bull-mascot.webp', 'brand/bull-mascot', [192, 480, 640])
await variants('public/bull-logo.webp', 'brand/bull-logo', [88, 176])
