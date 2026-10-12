import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(here, '..', 'dist')

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f)
    if (fs.statSync(p).isDirectory()) walk(p, out)
    else if (f.endsWith('.html')) out.push(p)
  }
  return out
}

const pages = walk(distDir)
let withEmbed = 0
const invalid = []
const overBudget = []

for (const p of pages) {
  const html = fs.readFileSync(p, 'utf8')
  const m = html.match(
    /<script id="discord:component-embed" type="application\/json">([\s\S]*?)<\/script>/
  )
  if (!m) continue
  withEmbed++
  const bytes = Buffer.byteLength(m[1], 'utf8')
  if (bytes > 3000) overBudget.push(`${p} ${bytes}b`)

  try {
    const j = JSON.parse(m[1])
    const c = j.component
    if (c?.type !== 17) invalid.push(`${p}: top-level not container(17)`)
    let count = 0
    const check = (x) => {
      count++
      if (x.type === 9 && !x.accessory) invalid.push(`${p}: section(9) without accessory`)
      if (x.type === 10 && !x.content) invalid.push(`${p}: empty text display(10)`)
      if (x.type === 2) {
        if (x.style !== 5) invalid.push(`${p}: button not style 5`)
        if (!x.label) invalid.push(`${p}: button without label`)
        if (!/^https:\/\//.test(x.url || '')) invalid.push(`${p}: button url not https`)
      }
      if (
        x.accessory?.type === 11 &&
        !/^https:\/\//.test(x.accessory.media?.url || '')
      )
        invalid.push(`${p}: thumbnail url not https`)
      ;(x.components || []).forEach(check)
    }
    c.components.forEach(check)
    if (count > 40) invalid.push(`${p}: >40 components`)
  } catch (e) {
    invalid.push(`${p}: parse error ${e.message}`)
  }
}

const rel = (p) => path.relative(distDir, p)
console.log(
  JSON.stringify({ pages: pages.length, withEmbed, invalid: invalid.length, overBudget: overBudget.length })
)
if (overBudget.length) console.log('OVER BUDGET:\n' + overBudget.slice(0, 10).join('\n'))
if (invalid.length) {
  console.log('INVALID:\n' + invalid.slice(0, 20).join('\n'))
  process.exit(1)
}
console.log('all discord component-embed payloads valid')
