import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const dir = path.join(path.resolve(here, '..'), 'public', 'icons')

function bestFrame(p) {
  try {
    const out = execFileSync('identify', ['-format', '%w %s\n', p], { encoding: 'utf8' })
    const best = out
      .trim()
      .split('\n')
      .map((l) => l.split(' ').map(Number))
      .sort((a, b) => b[0] - a[0])[0]
    if (best) return `${p}[${best[1]}]`
  } catch {}
  return p
}

for (const f of fs.readdirSync(dir)) {
  const ext = f.split('.').pop().toLowerCase()
  const p = path.join(dir, f)

  if (ext === 'svg' || ext === 'gif') {
    console.log(`skip     ${f}`)
    continue
  }

  try {
    if (ext === 'ico') {
      const out = p.replace(/\.ico$/, '.png')
      execFileSync('magick', [bestFrame(p), '-resize', '96x96>', out])
      fs.rmSync(p)
      console.log(`ico->png ${f}`)
    } else {
      execFileSync('magick', [p, '-resize', '96x96>', p])
      console.log(`resized  ${f}`)
    }
  } catch (e) {
    console.warn(`FAILED   ${f}: ${String(e).slice(0, 80)}`)
  }
}
