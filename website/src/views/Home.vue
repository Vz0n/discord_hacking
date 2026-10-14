<script setup>
import { watchEffect } from 'vue'
import content from '../content.json'
import { setMeta } from '../seo'

watchEffect(() => {
  setMeta(content.meta.siteName, content.meta.description)
})
</script>

<template>
  <section class="hero">
    <h1>Vz0n's Discord bug hunting</h1>
    <p class="tagline">
      This is a collection of security writeups of bugs that I found across popular Discord apps —
      There are {{ content.stats.categories }} categories with a total of {{ content.stats.writeups }} cases.
      <br><br>
      Every writeup uses the <code>DD/MM/YYYY</code> format to indicate when the bug was fixed.
      Right now, there is no proof that any of these bugs were ever exploited in the wild, and I have no knowledge of any such incidents.
      <br><br>
      The severity assigned to each bug is based on real world impact + how the developers handled the issues. It uses the BugCrowd's standard rating (P1-P5)
      as the own Discord's bug bounty program is hosted on that platform.
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
