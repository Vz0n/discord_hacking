export function setMeta(title, description) {
  document.title = title
  const set = (selector, value) => {
    const el = document.querySelector(selector)
    if (el) el.setAttribute('content', value)
  }
  set('meta[name="description"]', description)
  set('meta[property="og:title"]', title)
  set('meta[property="og:description"]', description)
  set('meta[name="twitter:title"]', title)
  set('meta[name="twitter:description"]', description)
}
