import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../Home.vue')
    },
    {
      path: '/question/:id',
      name: 'QuestionDetail',
      component: () => import('../QuestionDetail.vue')
    },
    {
      path: '/question/:id/edit',
      name: 'EditQuestion',
      component: () => import('../editQuestion.vue')
    },
    {
      path: '/add',
      name: 'AddQuestion',
      component: () => import('../addQuestion.vue')
    }
  ]
})

export default router