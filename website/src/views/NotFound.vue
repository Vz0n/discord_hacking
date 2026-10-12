<script setup>
import { watchEffect } from 'vue'
import { setMeta } from '../seo'

watchEffect(() => {
  setMeta(`404 · ${content.meta.siteName}`, "This page doesn't exist.")
})
</script>

<template>
  <div class="nf">
    <h1 class="nf-code">404</h1>
    <p class="nf-text">What are you doing here?</p>
    <router-link to="/" class="nf-link">← Go back home</router-link>
  </div>
</template>
