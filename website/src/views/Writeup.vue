<script setup>
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import content from '../content.json'
import { setMeta } from '../seo'
import NotFound from './NotFound.vue'

const route = useRoute()

const cat = computed(() => content.categories.find((c) => c.id === route.params.category))
const w = computed(() => cat.value?.writeups.find((x) => x.slug === route.params.slug))

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
    </div>
    <div class="w-meta">
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
