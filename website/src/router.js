import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import Category from './views/Category.vue'
import Writeup from './views/Writeup.vue'
import NotFound from './views/NotFound.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/c/:category', component: Category },
    { path: '/c/:category/:slug', component: Writeup },
    { path: '/:pathMatch(.*)*', component: NotFound }
  ],
  scrollBehavior: () => ({ top: 0 })
})
