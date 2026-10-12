<script setup>
import { computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import content from '../content.json'
import { setMeta } from '../seo'
import NotFound from './NotFound.vue'

const route = useRoute()
const router = useRouter()

const cat = computed(() => content.categories.find((c) => c.id === route.params.category))

watchEffect(() => {
  if (!cat.value) return
  setMeta(`${cat.value.name} · ${content.meta.siteName}`, cat.value.intro)
})
</script>

<template>
  <NotFound v-if="!cat" />
  <template v-else>
    <router-link to="/" class="back">← Go back</router-link>
    <div class="prose readme" v-html="cat.readmeHtml"></div>
    <h2 class="list-title">{{ cat.writeups.length }} cases</h2>
    <div class="writeup-list">
      <div
        v-for="w in cat.writeups"
        :key="w.slug"
        class="writeup-item"
        @click="router.push(`/c/${cat.id}/${w.slug}/`)"
      >
        <div class="wi-main">
          <img v-if="w.icon" :src="w.icon" :alt="w.name" class="wi-icon" loading="lazy" />
          <span v-else class="wi-icon wi-icon-fallback">{{ w.name.charAt(0).toUpperCase() }}</span>
          <div class="wi-text">
            <span class="wi-title">{{ w.title }}</span>
            <span v-if="w.fixedOn" class="chip chip-fixed">fixed on {{ w.fixedOn }}</span>
          </div>
          <span class="wi-name">{{ w.name }}</span>
        </div>
        <div v-if="w.links.length" class="wi-links">
          <a
            v-for="l in w.links"
            :key="l.url"
            :href="l.url"
            target="_blank"
            rel="noopener"
            @click.stop
          >{{ l.label }}</a>
        </div>
      </div>
    </div>
  </template>
</template>
