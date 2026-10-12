<script setup>
import { watchEffect } from 'vue'
import content from '../content.json'
import { setMeta } from '../seo'

watchEffect(() => {
  setMeta(
    'Discord Ecosystem Hacking',
    `Security writeups from across the Discord ecosystem — ${content.stats.writeups} writeups across ${content.stats.categories} bug classes.`
  )
})
</script>

<template>
  <section class="hero">
    <h1>Discord ecosystem hacking</h1>
    <p class="tagline">
      Security writeups from across the Discord ecosystem —
      {{ content.stats.writeups }} writeups across {{ content.stats.categories }} bug classes.
    </p>
  </section>
  <section class="grid">
    <router-link v-for="c in content.categories" :key="c.id" :to="`/c/${c.id}/`" class="card">
      <div class="card-head">
        <h2>{{ c.name }}</h2>
        <span class="chip">{{ c.writeups.length }}</span>
      </div>
      <p class="intro">{{ c.intro }}</p>
    </router-link>
  </section>
</template>
