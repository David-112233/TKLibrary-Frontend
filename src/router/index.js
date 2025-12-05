import {createRouter, createWebHistory} from 'vue-router';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/Home.vue')
    },
    {   
        path:'/question/:id',
        name: 'QuestionDetail',
        component: () => import('@/views/QuestionDetail.vue')
    }
]