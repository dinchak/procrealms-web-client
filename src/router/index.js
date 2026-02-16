import { createRouter, createWebHistory } from 'vue-router'

const GameView = () => import('../views/GameView.vue')

const routes = [
  {
    path: '/',
    name: 'game',
    component: GameView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
