import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const siteDir = path.resolve(here, '..')
const iconsDir = path.join(siteDir, 'public', 'icons')
fs.mkdirSync(iconsDir, { recursive: true })

const contentPath = path.join(siteDir, 'src', 'content.json')
if (!fs.existsSync(contentPath)) {
  console.error('run `npm run build` first (content.json with links is required)')
  process.exit(1)
}
const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'))

const existing = new Set(fs.readdirSync(iconsDir).map((f) => f.replace(/\.[^.]+$/, '')))

let iconOverrides = {}
try {
  iconOverrides =
    JSON.parse(fs.readFileSync(path.join(siteDir, 'config.json'), 'utf8')).iconOverrides || {}
} catch (e) {
  console.warn(`could not load config.json icon overrides: ${String(e).slice(0, 100)}`)
}

const apps = new Map()
for (const c of content.categories) {
  for (const w of c.writeups) {
    if (apps.has(w.slug)) continue
    const isInvite = (u) => /discord\.gg\/|discord\.com\/invite\//.test(u)
    const invite = w.links.map((l) => l.url).find(isInvite)
    const siteDiscord = w.links
      .filter((l) => !isInvite(l.url) && (/discord/i.test(l.url) || /discord/i.test(l.label)))
      .map((l) => l.url)
    const website = w.links.map((l) => l.url).find((u) => !isInvite(u) && !siteDiscord.includes(u))
    apps.set(w.slug, {
      website: website ? new URL(website).hostname : null,
      invite: invite ? invite.replace(/^https:\/\/(?:discord\.gg\/|discord\.com\/invite\/)/, '').split('/')[0] : null,
      siteDiscord
    })
  }
}

const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

async function fetchBin(url, timeout = 8000, accept = 'image/*,*/*;q=0.5') {
  const ctl = new AbortController()
  const t = setTimeout(() => ctl.abort(), timeout)
  try {
    const r = await fetch(url, { signal: ctl.signal, headers: { 'user-agent': UA, accept }, redirect: 'follow' })
    if (!r.ok) return { ok: false, status: r.status, url: r.url }
    const buf = Buffer.from(await r.arrayBuffer())
    return { ok: true, buf, type: r.headers.get('content-type') || '', url: r.url }
  } catch (e) {
    return { ok: false, error: String(e).slice(0, 60) }
  } finally {
    clearTimeout(t)
  }
}

function sniffExt(buf, type) {
  if (buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50) return 'png'
  if (buf.length > 3 && buf[0] === 0x47 && buf[1] === 0x49) return 'gif'
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8) return 'jpg'
  if (buf.length > 4 && buf[0] === 0x00 && buf[1] === 0x00 && buf[2] === 0x01 && buf[3] === 0x00) return 'ico'
  if (buf.length > 12 && buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') return 'webp'
  const t = (type || '').toLowerCase()
  if (t.includes('svg')) return 'svg'
  if (t.includes('png')) return 'png'
  if (t.includes('jpeg')) return 'jpg'
  if (t.includes('gif')) return 'gif'
  if (t.includes('webp')) return 'webp'
  if (t.includes('icon')) return 'ico'
  return null
}

function saveIcon(slug, buf, ext) {
  fs.writeFileSync(path.join(iconsDir, `${slug}.${ext}`), buf)
}

function pixelSize(p) {
  try {
    const out = execFileSync('identify', ['-format', '%w %h\n', p], { encoding: 'utf8' })
    const nums = out.trim().split(/\s+/).map(Number).filter((n) => !Number.isNaN(n))
    return Math.max(...nums)
  } catch {
    return 999
  }
}

function rmIcon(slug) {
  for (const f of fs.readdirSync(iconsDir)) {
    if (f.replace(/\.[^.]+$/, '') === slug) fs.rmSync(path.join(iconsDir, f))
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function resolveInvite(slug, app) {
  if (app.invite) return app.invite
  for (const url of app.siteDiscord) {
    const r = await fetchBin(url, 8000, 'text/html,*/*;q=0.3')
    if (!r.ok) continue
    const finalUrl = r.url || url
    const m = finalUrl.match(/discord\.gg\/([A-Za-z0-9_-]+)/) || finalUrl.match(/discord\.com\/invite\/([A-Za-z0-9_-]+)/)
    if (m) return m[1]
    const bodyM = r.buf
      .toString('utf8')
      .match(/discord\.gg\/([A-Za-z0-9_-]+)|discord\.com\/invite\/([A-Za-z0-9_-]+)/)
    if (bodyM) return bodyM[1] || bodyM[2]
    await sleep(150)
  }
  return null
}

async function fetchGuildIcon(slug, code) {
  const ctl = new AbortController()
  const t = setTimeout(() => ctl.abort(), 8000)
  try {
    const r = await fetch(`https://discord.com/api/v10/invites/${encodeURIComponent(code)}`, {
      signal: ctl.signal,
      headers: { 'user-agent': UA }
    })
    if (!r.ok) return null
    const j = await r.json()
    if (j.guild && j.guild.icon) {
      const ext = j.guild.icon.startsWith('a_') ? 'gif' : 'png'
      const url = `https://cdn.discordapp.com/icons/${j.guild.id}/${j.guild.icon}.${ext}?size=128`
      const ir = await fetchBin(url)
      if (ir.ok) {
        saveIcon(slug, ir.buf, ext)
        return { source: `guild-icon (${j.guild.name})`, guild: j.guild.name, ext }
      }
    }
    if (j.guild && j.guild.name) guildNames[slug] = j.guild.name
  } catch {} finally {
    clearTimeout(t)
  }
  return null
}

async function faviconCandidates(domain) {
  const candidates = []

  const page = await fetchBin(`https://${domain}/`, 8000, 'text/html,*/*;q=0.3')
  if (page.ok) {
    const html = page.buf.toString('utf8')
    const tags = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]).filter((t) => /rel="[^"]*icon[^"]*"/i.test(t))
    const scored = tags
      .map((t) => {
        const href = (t.match(/\bhref="([^"]+)"/i) || t.match(/\bhref='([^']+)'/i) || [])[1]
        if (!href) return null
        let url
        try {
          url = new URL(href, `https://${domain}/`).href
        } catch {
          return null
        }
        const sizesM = t.match(/\bsizes="(\d+)x\d+"/i)
        const size = sizesM ? parseInt(sizesM[1]) : /apple-touch-icon/i.test(t) ? 180 : 16
        return { url, size }
      })
      .filter(Boolean)
      .sort((a, b) => b.size - a.size)
      .slice(0, 3)
    candidates.push(...scored.map((c) => ({ kind: 'html-icon', url: c.url })))
  }
  await sleep(150)

  candidates.push({ kind: 'favicon.ico', url: `https://${domain}/favicon.ico` })
  candidates.push({ kind: 'duckduckgo', url: `https://icons.duckduckgo.com/ip3/${domain}.ico` })
  candidates.push({ kind: 'google', url: `https://www.google.com/s2/favicons?domain=${domain}&sz=128` })
  return candidates
}

const results = []
const guildNames = {}

function extOf(slug) {
  for (const f of fs.readdirSync(iconsDir)) {
    if (f.replace(/\.[^.]+$/, '') === slug) return f.split('.').pop()
  }
  return null
}

function rmOtherIcons(slug, keepExt) {
  for (const f of fs.readdirSync(iconsDir)) {
    const s = f.replace(/\.[^.]+$/, '')
    const e = f.split('.').pop()
    if (s === slug && e !== keepExt) fs.rmSync(path.join(iconsDir, f))
  }
}

for (const [slug, app] of apps) {
  if (existing.has(slug)) {
    results.push(`${slug}: cached`)
    continue
  }

  let saved = null
  let inviteCode = null

  if (iconOverrides[slug]) {
    const r = await fetchBin(iconOverrides[slug])
    const ext = r.ok && sniffExt(r.buf, r.type)
    if (r.ok && ext) {
      saveIcon(slug, r.buf, ext)
      saved = 'override'
    }
    await sleep(150)
  }

  if (!saved && app.website) {
    let best = null
    for (const c of await faviconCandidates(app.website)) {
      const r = await fetchBin(c.url)
      const ext = r.ok && sniffExt(r.buf, r.type)
      if (r.ok && ext && r.buf.length > 32) {
        saveIcon(slug, r.buf, ext)
        const px = pixelSize(path.join(iconsDir, `${slug}.${ext}`))
        if (!best || px > best.px) best = { buf: r.buf, ext, px, kind: c.kind }
        if (px >= 96) break
      }
      await sleep(150)
    }
    if (best) {
      saveIcon(slug, best.buf, best.ext)
      rmOtherIcons(slug, best.ext)
      saved = `${best.kind} (${app.website}) @${best.px}px`
    }
  }

  // quality guard: low-res favicon or no icon at all -> official guild icon
  const curExt = extOf(slug)
  const px = curExt ? pixelSize(path.join(iconsDir, `${slug}.${curExt}`)) : 0
  if ((!saved || px < 48) && !iconOverrides[slug]) {
    inviteCode = inviteCode || (await resolveInvite(slug, app))
    if (inviteCode) {
      const g = await fetchGuildIcon(slug, inviteCode)
      if (g) {
        rmOtherIcons(slug, g.ext)
        saved = g.source
      }
    }
  }

  results.push(`${slug}: ${saved || 'FAILED'}`)
}

console.log(results.join('\n'))
console.log(`\nguild names (for naming cross-check):`)
for (const [s, n] of Object.entries(guildNames)) console.log(`  ${s}: ${n}`)
