import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'highlight.js/styles/github-dark.css'
import 'katex/dist/katex.min.css'
import './style.css'

createApp(App).use(router).mount('#app')
