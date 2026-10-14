<script setup>
import { computed, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import content from '../content.json'
import { setMeta, severityPlateUrl } from '../seo'
import NotFound from './NotFound.vue'

const route = useRoute()

const cat = computed(() => content.categories.find((c) => c.id === route.params.category))
const w = computed(() => cat.value?.writeups.find((x) => x.slug === route.params.slug))

const copied = ref(false)
let copiedTimer = null

async function copyLink() {
  const url = window.location.href
  try {
    await navigator.clipboard.writeText(url)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = url
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    ta.remove()
  }
  copied.value = true
  clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => (copied.value = false), 1500)
}

watchEffect(() => {
  if (!cat.value || !w.value) return
  const desc = `${w.value.title} — ${w.value.name}` + (w.value.fixedOn ? ` (fixed on ${w.value.fixedOn})` : '')
  setMeta(`${w.value.title} · ${w.value.name}`, desc)
})
</script>

<template>
  <NotFound v-if="!cat || !w" />
  <article v-else>
    <router-link :to="`/c/${cat.id}/`" class="back">← {{ cat.name }}</router-link>
    <div class="w-head">
      <img v-if="w.icon" :src="w.icon" :alt="w.name" class="w-icon" />
      <span v-else class="w-icon w-icon-fallback">{{ w.name.charAt(0).toUpperCase() }}</span>
      <div class="w-head-text">
        <h1 class="w-title">{{ w.title }}</h1>
        <span class="w-app">{{ w.name }}</span>
      </div>
      <button
        type="button"
        class="w-copy"
        :class="{ copied }"
        :aria-label="copied ? 'Link copied' : 'Copy link'"
        @click="copyLink"
      >
        <svg
          v-if="!copied"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        {{ copied ? 'Copied ✓' : 'Copy link' }}
      </button>
    </div>
    <div class="w-meta">
      <img
        v-if="w.severity"
        :src="severityPlateUrl(w.severity)"
        :alt="w.severity"
        class="sev-plate"
        loading="lazy"
      />
      <span v-if="w.fixedOn" class="chip chip-fixed">fixed on {{ w.fixedOn }}</span>
      <a
        v-for="l in w.links"
        :key="l.url"
        :href="l.url"
        target="_blank"
        rel="noopener"
        class="chip chip-link"
      >{{ l.label }}</a>
    </div>
    <div class="prose" v-html="w.html"></div>
  </article>
</template>
