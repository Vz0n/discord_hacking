<script setup>
import { watchEffect } from 'vue'
import { setMeta } from '../seo'

watchEffect(() => {
  setMeta("404 · Discord Ecosystem Hacking", "This page doesn't exist.")
})
</script>

<template>
  <div class="nf">
    <img src="/pock.gif" alt="pock" class="nf-pock" />
    <h1 class="nf-code">404</h1>
    <p class="nf-text">This page doesn't exist — it may have been moved, or never existed at all.</p>
    <router-link to="/" class="nf-link">← Go back home</router-link>
  </div>
</template>
