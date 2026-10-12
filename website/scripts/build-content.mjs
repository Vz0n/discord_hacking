import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js/lib/common'
import http from 'highlight.js/lib/languages/http'

const here = path.dirname(fileURLToPath(import.meta.url))
const siteDir = path.resolve(here, '..')
const repoRoot = path.resolve(siteDir, '..')
const outJson = path.join(siteDir, 'src', 'content.json')
const publicContent = path.join(siteDir, 'public', 'content')

const warnings = []
const warn = (msg) => warnings.push(msg)

hljs.registerLanguage('http', http)

const md = new MarkdownIt({
  html: false,
  linkify: false,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre><code class="hljs language-${md.utils.escapeHtml(lang)}">${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`
      } catch {}
    }
    return `<pre><code class="hljs">${md.utils.escapeHtml(str)}</code></pre>`
  }
})

const defaultLinkOpen =
  md.renderer.rules.link_open || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const href = tokens[idx].attrGet('href') || ''
  if (/^https?:\/\//.test(href)) {
    tokens[idx].attrSet('target', '_blank')
    tokens[idx].attrSet('rel', 'noopener noreferrer')
  }
  return defaultLinkOpen(tokens, idx, options, env, self)
}

const categories = fs
  .readdirSync(repoRoot, { withFileTypes: true })
  .filter(
    (e) =>
      e.isDirectory() &&
      !e.name.startsWith('.') &&
      !['drafts', 'website', 'node_modules'].includes(e.name)
  )
  .map((e) => e.name)
  .sort()
const catSet = new Set(categories)

let summaries = {}
let names = {}
let titles = {}
let videoOverrides = {}
try {
  const cfg = JSON.parse(fs.readFileSync(path.join(siteDir, 'config.json'), 'utf8'))
  summaries = cfg.summaries || {}
  names = cfg.names || {}
  titles = cfg.titles || {}
  videoOverrides = cfg.videoOverrides || {}
} catch (e) {
  warn(`could not load config.json: ${String(e).slice(0, 100)}`)
}

const copied = new Set()
function copyAsset(cat, rel) {
  const src = path.join(repoRoot, cat, rel)
  if (!fs.existsSync(src)) {
    warn(`[${cat}] missing asset: ${rel}`)
    return null
  }
  const destDir = path.join(publicContent, cat)
  fs.mkdirSync(destDir, { recursive: true })
  const name = path.basename(rel)
  if (!copied.has(`${cat}/${name}`)) {
    fs.copyFileSync(src, path.join(destDir, name))
    copied.add(`${cat}/${name}`)
  }
  return name
}

function preprocess(cat, text) {
  // protect fenced code blocks from rewrites
  const parts = text.split(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g)
  const out = parts.map((chunk) => {
    if (chunk.startsWith('```') || chunk.startsWith('~~~')) return chunk

    // raw HTML <img> referencing a local asset -> markdown image
    chunk = chunk.replace(
      /<img\b((?:[^>"']|"[^"]*"|'[^']*')*)>/g,
      (m, attrs) => {
        const srcM = attrs.match(/\bsrc="(?:\.\/)?assets\/([^"\s]+)"/)
        if (!srcM) return m
        if (!copyAsset(cat, `assets/${srcM[1]}`)) return m
        const altM = attrs.match(/\balt="([^"]*)"/)
        const alt = altM ? altM[1].replace(/[[\]"<>]/g, ' ').trim() : ''
        return `![${alt}](/content/${cat}/${srcM[1]})`
      }
    )

    // markdown images with relative asset paths -> site-absolute /content/ URLs
    chunk = chunk.replace(
      /(!\[[^\]]*\]\()(?:\.\/)?assets\/([^)\s]+)(\))/g,
      (m, pre, file, post) => {
        if (!copyAsset(cat, `assets/${file}`)) return m
        return `${pre}/content/${cat}/${file}${post}`
      }
    )

    // cross-writeup links like [Tickety](/path_cancel/tickety.md) -> router links
    chunk = chunk.replace(
      /\]\((\/[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+\.md)\)/g,
      (m, p) => {
        const [c, file] = p.replace(/^\//, '').split('/')
        if (catSet.has(c)) return `](/c/${c}/${file.replace(/\.md$/, '')})`
        warn(`[${cat}] unresolved cross-link: ${p}`)
        return m
      }
    )

    return chunk
  })
  return out.join('')
}

function renderMarkdown(cat, text) {
  let html = md.render(preprocess(cat, text))
  // bare GitHub user-attachment URLs on their own line -> video embeds
  html = html.replace(
    /<p>(https:\/\/github\.com\/user-attachments\/assets\/[A-Za-z0-9-]+)<\/p>/g,
    '<video controls preload="metadata" src="$1"></video>'
  )
  return html
}

function parseLinks(line) {
  return [...line.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)]
    .filter((m) => /^https?:\/\//.test(m[2]))
    .map((m) => ({ label: m[1], url: m[2] }))
}

function applyVideoOverride(cat, slug, html) {
  const file = videoOverrides[`${cat}/${slug}`]
  if (!file) return html
  if (!copyAsset(cat, `assets/${file}`)) return html
  return html.replace(
    /(<video\b[^>]*\bsrc=")https:\/\/github\.com\/user-attachments\/[^"]+(")/g,
    `$1/content/${cat}/${file}$2`
  )
}

let iconFiles = {}
try {
  for (const f of fs.readdirSync(path.join(siteDir, 'public', 'icons'))) {
    iconFiles[f.replace(/\.[^.]+$/, '')] = `/icons/${f}`
  }
} catch {}

function parseWriteup(cat, file) {
  const raw = fs.readFileSync(path.join(repoRoot, cat, file), 'utf8')
  const lines = raw.split(/\r?\n/)

  let title = null
  let fixedOn = null
  let links = []
  const skip = new Set()

  for (let i = 0; i < Math.min(lines.length, 8); i++) {
    const l = lines[i].trim()
    if (title === null && /^##\s+/.test(l)) {
      title = l.replace(/^##\s+/, '').trim()
      skip.add(i)
    } else if (fixedOn === null && /^\*Fixed on:\s*(.+?)\*\s*$/.test(l)) {
      fixedOn = l.match(/^\*Fixed on:\s*(.+?)\*\s*$/)[1].trim()
      skip.add(i)
    } else if (links.length === 0 && l.startsWith('[') && l.includes('](http')) {
      links = parseLinks(l)
      skip.add(i)
    }
  }

  if (title === null) {
    const fallback = titles[`${cat}/${file.replace(/\.md$/, '')}`]
    if (fallback) title = fallback
    else warn(`[${cat}/${file}] no "## " title found`)
  }

  const body = lines
    .filter((_, i) => !skip.has(i))
    .join('\n')
    .replace(/^\s*\n+/, '')
    .trimEnd()

  return {
    slug: file.replace(/\.md$/, ''),
    title: title || file.replace(/\.md$/, ''),
    fixedOn,
    links,
    html: renderMarkdown(cat, body)
  }
}

function parseReadme(cat) {
  const file = path.join(repoRoot, cat, 'README.md')
  if (!fs.existsSync(file)) {
    warn(`[${cat}] no README.md`)
    return { intro: '', html: '' }
  }
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/)

  // find first prose paragraph (skip blanks, images, link-only lines)
  let intro = ''
  for (let i = 0; i < lines.length && !intro; i++) {
    const l = lines[i].trim()
    if (!l || l.startsWith('![') || l.startsWith('```')) continue
    let block = []
    for (let j = i; j < lines.length && lines[j].trim(); j++) block.push(lines[j])
    const text = block
      .join(' ')
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/[*`_]/g, '')
      .trim()
    if (text) intro = text
  }

  const body = lines
    .filter((l) => !/^#\s+/.test(l.trim()))
    .join('\n')
    .trim()

  return { intro, html: renderMarkdown(cat, body) }
}

let totalWriteups = 0
const catData = categories.map((cat) => {
  const { intro: readmeIntro, html: readmeHtml } = parseReadme(cat)
  const files = fs
    .readdirSync(path.join(repoRoot, cat))
    .filter((f) => f.endsWith('.md') && f !== 'README.md')
    .sort()
  const writeups = files.map((f) => {
    const w = parseWriteup(cat, f)
    return {
      ...w,
      html: applyVideoOverride(cat, w.slug, w.html),
      name: names[w.slug] || w.slug,
      icon: iconFiles[w.slug] || null
    }
  })
  totalWriteups += writeups.length
  return {
    id: cat,
    name: cat.replace(/_/g, ' '),
    intro: summaries[cat] || readmeIntro,
    readmeHtml,
    writeups
  }
})

const data = {
  generatedAt: new Date().toISOString(),
  stats: { categories: categories.length, writeups: totalWriteups },
  categories: catData
}

fs.mkdirSync(path.dirname(outJson), { recursive: true })
fs.writeFileSync(outJson, JSON.stringify(data))

const pock = path.join(repoRoot, 'pock.gif')
if (fs.existsSync(pock)) fs.copyFileSync(pock, path.join(siteDir, 'public', 'pock.gif'))

if (warnings.length) {
  console.warn(`build-content warnings (${warnings.length}):`)
  for (const w of warnings) console.warn(`  - ${w}`)
}
console.log(
  `content: ${data.stats.writeups} writeups across ${data.stats.categories} categories -> ${path.relative(repoRoot, outJson)}`
)
