import { readFileSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import postcss from 'postcss'
import tailwind from '@tailwindcss/postcss'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const from = resolve(root, 'styles/marketing.css')
const result = await postcss([tailwind({ optimize: { minify: true } })]).process(readFileSync(from, 'utf8'), { from })
const out = resolve(root, 'public/tbm.css')
writeFileSync(out, result.css)
console.log('wrote', out, result.css.length)
