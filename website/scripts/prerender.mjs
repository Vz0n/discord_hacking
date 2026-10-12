import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const siteDir = path.resolve(here, '..')
const distDir = path.join(siteDir, 'dist')

const template = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8')
const content = JSON.parse(fs.readFileSync(path.join(siteDir, 'src', 'content.json'), 'utf8'))

let siteUrl = process.env.SITE_URL
if (siteUrl === undefined) {
  try {
    siteUrl = JSON.parse(fs.readFileSync(path.join(siteDir, 'config.json'), 'utf8')).siteUrl || ''
  } catch {
    siteUrl = ''
  }
}
siteUrl = (siteUrl || '').replace(/\/+$/, '')

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const escAttr = (s) => esc(s).replace(/"/g, '&quot;')

function fixCrossLinks(html) {
  // add trailing slash to internal cross-writeup links so GitHub Pages serves the prerendered files
  return html.replace(/href="(\/c\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)"/g, '$1/" href="$2/"')
}

function metaBlock({ title, description, path, type, jsonLd }) {
  const tags = [
    `<meta name="description" content="${escAttr(description)}">`,
    siteUrl ? `<link rel="canonical" href="${siteUrl}${path}">` : '',
    `<meta property="og:type" content="${type}">`,
    `<meta property="og:title" content="${escAttr(title)}">`,
    `<meta property="og:description" content="${escAttr(description)}">`,
    siteUrl ? `<meta property="og:url" content="${siteUrl}${path}">` : '',
    siteUrl ? `<meta property="og:image" content="${siteUrl}/pock.gif">` : '',
    `<meta name="twitter:card" content="summary">`,
    `<meta name="twitter:title" content="${escAttr(title)}">`,
    `<meta name="twitter:description" content="${escAttr(description)}">`,
    jsonLd
      ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`
      : ''
  ].filter(Boolean)

  let html = template.replace(/<title>.*?<\/title>/, `<title>${esc(title)}</title>`)
  html = html.replace(/<meta name="description"[^>]*>/, tags.join('\n    '))
  return html
}

function renderPage({ title, description, path, type, bodyHtml, jsonLd }) {
  let html = metaBlock({ title, description, path, type, jsonLd })
  if (bodyHtml) html = html.replace('<div id="app"></div>', `<div id="app">${bodyHtml}</div>`)
  return html
}

function writeFile(rel, html) {
  const p = path.join(distDir, rel)
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, html)
}

const homeDesc = `Security writeups from across the Discord ecosystem — ${content.stats.writeups} writeups across ${content.stats.categories} bug classes.`
const homeBody = `
    <section class="hero">
      <h1>Discord ecosystem hacking</h1>
      <p class="tagline">${esc(homeDesc)}</p>
    </section>
    <section class="grid">
      ${content.categories
        .map(
          (c) => `<a class="card" href="/c/${c.id}/">
        <div class="card-head"><h2>${esc(c.name)}</h2><span class="chip">${c.writeups.length}</span></div>
        <p class="intro">${esc(c.intro)}</p>
      </a>`
        )
        .join('\n      ')}
    </section>`

writeFile(
  'index.html',
  renderPage({
    title: 'Discord Ecosystem Hacking',
    description: homeDesc,
    path: '/',
    type: 'website',
    bodyHtml: homeBody
  })
)

const isoDate = (s) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s || '')
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null
}

const urls = ['/']
for (const cat of content.categories) {
  const catPath = `/c/${cat.id}/`
  urls.push(catPath)

  const items = cat.writeups
    .map(
      (w) => `<div class="writeup-item">
        <div class="wi-main">
          ${w.icon ? `<img src="${w.icon}" alt="${escAttr(w.name)}" class="wi-icon" loading="lazy" />` : `<span class="wi-icon wi-icon-fallback">${esc(w.name.charAt(0).toUpperCase())}</span>`}
          <span class="wi-title">${esc(w.title)}</span>
          ${w.fixedOn ? `<span class="chip chip-fixed">fixed on ${esc(w.fixedOn)}</span>` : ''}
          <span class="wi-name">${esc(w.name)}</span>
        </div>
      </div>`
    )
    .join('\n        ')

  writeFile(
    path.join('c', cat.id, 'index.html'),
    renderPage({
      title: `${cat.name} · Discord Ecosystem Hacking`,
      description: cat.intro,
      path: catPath,
      type: 'website',
      bodyHtml: `<a class="back" href="/">← Go back</a>
    <div class="prose readme">${cat.readmeHtml}</div>
    <h2 class="list-title">${cat.writeups.length} writeups</h2>
    <div class="writeup-list">
        ${items}
    </div>`
    })
  )

  for (const w of cat.writeups) {
    const wPath = `${catPath}${w.slug}/`
    urls.push(wPath)
    const desc = `${w.title} — ${w.name}` + (w.fixedOn ? ` (fixed on ${w.fixedOn})` : '')
    const date = isoDate(w.fixedOn)
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: w.title,
      description: desc,
      author: { '@type': 'Person', name: 'Vz0n' },
      ...(date ? { datePublished: date } : {}),
      ...(siteUrl ? { mainEntityOfPage: `${siteUrl}${wPath}` } : {})
    }
    const body = `<a class="back" href="/c/${cat.id}/">← ${esc(cat.name)}</a>
    <div class="w-head">
      ${w.icon ? `<img src="${w.icon}" alt="${escAttr(w.name)}" class="w-icon" />` : `<span class="w-icon w-icon-fallback">${esc(w.name.charAt(0).toUpperCase())}</span>`}
      <div class="w-head-text">
        <h1 class="w-title">${esc(w.title)}</h1>
        <span class="w-app">${esc(w.name)}</span>
      </div>
    </div>
    <div class="w-meta">
      ${w.fixedOn ? `<span class="chip chip-fixed">fixed on ${esc(w.fixedOn)}</span>` : ''}
      ${w.links.map((l) => `<a href="${escAttr(l.url)}" target="_blank" rel="noopener noreferrer" class="chip chip-link">${esc(l.label)}</a>`).join('\n      ')}
    </div>
    <div class="prose">${fixCrossLinks(w.html)}</div>`

    writeFile(
      path.join('c', cat.id, w.slug, 'index.html'),
      renderPage({
        title: `${w.title} · ${w.name}`,
        description: desc,
        path: wPath,
        type: 'article',
        bodyHtml: body,
        jsonLd
      })
    )
  }
}

const notFoundBody = `
    <div class="nf">
      <img src="/pock.gif" alt="pock" class="nf-pock" />
      <h1 class="nf-code">404</h1>
      <p class="nf-text">This page doesn't exist — it may have been moved, or never existed at all.</p>
      <a class="nf-link" href="/">← Go back home</a>
    </div>`

writeFile(
  '404.html',
  renderPage({
    title: "404 · Discord Ecosystem Hacking",
    description: "This page doesn't exist.",
    path: '/404',
    type: 'website',
    bodyHtml: notFoundBody
  })
)

fs.writeFileSync(
  path.join(distDir, 'robots.txt'),
  ['User-agent: *', 'Allow: /', siteUrl ? `\nSitemap: ${siteUrl}/sitemap.xml` : ''].join('\n')
)

if (siteUrl) {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${siteUrl}${u}</loc></url>`).join('\n')}
</urlset>
`
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap)
}

console.log(
  `prerender: ${content.categories.length} categories + ${content.stats.writeups} writeups + home -> dist (${urls.length} URLs${siteUrl ? ', sitemap+canonical on' : ', no siteUrl: canonical/sitemap skipped'})`
)
