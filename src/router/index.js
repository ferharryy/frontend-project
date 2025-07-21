// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import LoginForm from '../components/LoginForm.vue'
import HomeView from '../views/HomeView.vue'
import CompanyView from '../views/CompanyView.vue'
import UserView from '../views/UserView.vue'
import ChatView from '../views/ChatView.vue' 
import ProjectView from '../views/ProjectView.vue'
import MessageProcessingView from '../views/MessageProcessingView.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginForm
  },
  {
    path: '/',
    redirect: '/home',
    meta: { requiresAuth: true }
  },
  {
    path: '/home',
    name: 'Home',
    component: HomeView,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'empresa',
        name: 'Empresa',
        component: CompanyView,
      },
      {
        path: 'usuario',
        name: 'Usuario',
        component: UserView,
      },
      {
        path: 'projeto',
        name: 'Projeto',
        component: ProjectView,
      },
      {
        path: 'fluxo',
        name: 'Fluxo',
        component: MessageProcessingView,
      },
      {
        path: 'chat', 
        name: 'Chat',
        component: ChatView,
      },
      {
        path: '',
        name: 'HomeDefault',
        component: { template: '<p class="text-gray-600">Selecione uma opção no menu.</p>' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guardião de Navegação Global (Navigation Guard)
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('jwt_token');

  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next('/login');
  }
  else if ((to.path === '/login' || to.path === '/') && isAuthenticated) {
    next('/home');
  }
  else {
    next();
  }
});

export default router;