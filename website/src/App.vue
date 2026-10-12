<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function onClick(e) {
  const a = e.target.closest('a')
  if (!a || e.defaultPrevented || a.target === '_blank') return
  const href = a.getAttribute('href')
  if (href && href.startsWith('/c/')) {
    e.preventDefault()
    router.push(href)
  }
}
</script>

<template>
  <div class="site" @click="onClick">
    <header class="site-header">
      <div class="container header-inner">
        <router-link to="/" class="brand">discord_hacking</router-link>
        <nav>
          <a href="https://github.com/Vz0n/discord_hacking" target="_blank" rel="noopener">GitHub</a>
        </nav>
      </div>
    </header>
    <main class="container">
      <router-view />
    </main>
    <footer class="site-footer">
      <img src="/pock.gif" alt="pock" class="pock" />
      <p>writeups by Vz0n · all bugs disclosed responsibly</p>
    </footer>
  </div>
</template>
