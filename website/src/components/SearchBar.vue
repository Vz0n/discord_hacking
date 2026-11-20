<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import content from '../content.json'

const router = useRouter()

// Strip tags first, then decode entities — decoding first would turn escaped
// writeup payloads into fake tags and eat display text along with the markup.
// The textarea decodes every entity variant and its content is always inert.
const decoder = document.createElement('textarea')

function plainText(html) {
  const stripped = String(html).replace(/<[^>]*>/g, ' ')
  decoder.innerHTML = stripped
  return decoder.value.replace(/\s+/g, ' ').trim()
}

const index = content.categories.flatMap((c) =>
  c.writeups.map((w) => {
    const text = plainText(w.html)
    return {
      catId: c.id,
      catName: c.name,
      slug: w.slug,
      name: w.name,
      title: w.title,
      severity: w.severity,
      icon: w.icon,
      text,
      nameLc: w.name.toLowerCase(),
      titleLc: w.title.toLowerCase(),
      catLc: c.name.toLowerCase(),
      textLc: text.toLowerCase()
    }
  })
)

// Split a string into plain/highlighted segments around the first match.
// The writeup bodies contain arbitrary markup, so results are rendered from
// these segments and never via v-html.
function segments(str, lcStr, q) {
  const i = lcStr.indexOf(q)
  if (i === -1) return [{ text: str, hit: false }]
  return [
    { text: str.slice(0, i), hit: false },
    { text: str.slice(i, i + q.length), hit: true },
    { text: str.slice(i + q.length), hit: false }
  ]
}

function snippetParts(text, textLc, q) {
  const i = textLc.indexOf(q)
  if (i === -1) return null
  const start = Math.max(0, i - 34)
  const end = Math.min(text.length, i + q.length + 46)
  return [
    { text: (start > 0 ? '…' : '') + text.slice(start, i), hit: false },
    { text: text.slice(i, i + q.length), hit: true },
    { text: text.slice(i + q.length, end) + (end < text.length ? '…' : ''), hit: false }
  ]
}

const query = ref('')
const open = ref(false)
const activeIndex = ref(0)
const root = ref(null)
const input = ref(null)

const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return []
  const out = []
  for (const e of index) {
    let score = 0
    let subSegs = null
    if (e.nameLc.startsWith(q)) score = 5
    else if (e.nameLc.includes(q)) score = 4
    else if (e.titleLc.includes(q)) score = 3
    else if (e.catLc.includes(q)) score = 2
    else {
      const parts = snippetParts(e.text, e.textLc, q)
      if (parts) {
        score = 1
        subSegs = parts
      }
    }
    if (!score) continue
    out.push({
      e,
      score,
      subSegs: subSegs || segments(e.title, e.titleLc, q),
      nameSegs: segments(e.name, e.nameLc, q)
    })
  }
  out.sort((a, b) => b.score - a.score || a.e.nameLc.localeCompare(b.e.nameLc))
  return out.slice(0, 8)
})

function go(r) {
  router.push(`/c/${r.e.catId}/${r.e.slug}/`)
  query.value = ''
  open.value = false
  input.value?.blur()
}

function onInput() {
  activeIndex.value = 0
  if (query.value.trim()) open.value = true
}

function onKeydown(e) {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()
    const n = results.value.length
    if (!n) return
    const delta = e.key === 'ArrowDown' ? 1 : -1
    activeIndex.value = (activeIndex.value + delta + n) % n
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const r = results.value[activeIndex.value]
    if (r) go(r)
  } else if (e.key === 'Escape') {
    open.value = false
    input.value?.blur()
  }
}

function isTyping(el) {
  return el instanceof HTMLElement && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
}

function onWindowKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    input.value?.focus()
    input.value?.select()
  } else if (e.key === '/' && !isTyping(e.target)) {
    e.preventDefault()
    input.value?.focus()
  }
}

function onDocPointerDown(e) {
  if (!root.value?.contains(e.target)) open.value = false
}

onMounted(() => {
  window.addEventListener('keydown', onWindowKeydown)
  document.addEventListener('pointerdown', onDocPointerDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onWindowKeydown)
  document.removeEventListener('pointerdown', onDocPointerDown)
})
</script>

<template>
  <div ref="root" class="search">
    <input
      ref="input"
      v-model="query"
      class="search-input"
      type="text"
      placeholder="Search something, like 'Carl' or 'discord.js'"
      aria-label="Search cases"
      role="combobox"
      autocomplete="off"
      spellcheck="false"
      :aria-expanded="open && results.length > 0 ? 'true' : 'false'"
      @input="onInput"
      @focus="open = true"
      @keydown="onKeydown"
    />
    <div v-if="open && query.trim()" class="search-panel" role="listbox" aria-label="Search results">
      <div v-if="!results.length" class="search-empty">No writeups match “{{ query.trim() }}”.</div>
      <div
        v-for="(r, i) in results"
        :key="r.e.catId + '/' + r.e.slug"
        class="search-row"
        :class="{ active: i === activeIndex }"
        role="option"
        :aria-selected="i === activeIndex"
        @mousedown.prevent
        @click="go(r)"
        @mousemove="activeIndex = i"
      >
        <img v-if="r.e.icon" :src="r.e.icon" :alt="r.e.name" class="wi-icon" loading="lazy" />
        <span v-else class="wi-icon wi-icon-fallback">{{ r.e.name.charAt(0).toUpperCase() }}</span>
        <div class="sr-main">
          <span class="sr-name">
            <template v-for="(s, j) in r.nameSegs" :key="j">
              <span v-if="s.hit" class="hl">{{ s.text }}</span>
              <template v-else>{{ s.text }}</template>
            </template>
          </span>
          <span class="sr-sub">
            <template v-for="(s, j) in r.subSegs" :key="j">
              <span v-if="s.hit" class="hl">{{ s.text }}</span>
              <template v-else>{{ s.text }}</template>
            </template>
          </span>
        </div>
        <div class="sr-meta">
          <img
            v-if="r.e.severity"
            :src="'/severity/' + r.e.severity + '.svg'"
            :alt="r.e.severity"
            class="sev-plate search-sev"
          />
          <span class="sr-cat">{{ r.e.catName }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
