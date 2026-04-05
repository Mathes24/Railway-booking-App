import { createRouter, createWebHistory } from 'vue-router'
import Search from './pages/Search.vue'
import Login from './pages/Login.vue'
import Register from './pages/Register.vue'
import Booking from './pages/Booking.vue'
import MyTickets from './pages/MyTickets.vue'
import Admin from './pages/Admin.vue'

const routes = [
  { path: '/', component: Search },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/booking/:id', component: Booking },
  { path: '/my-tickets', component: MyTickets },
  { path: '/admin', component: Admin }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
