import { createRouter, createWebHistory } from "vue-router";

import Home from "@/components/Home.vue";

import rainbox from "@/components/rainbox.vue";


const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Home,
    },
    {
      path: '/room',
      component: rainbox,
    },
  ],
})

export default router