import { createRouter, createWebHashHistory } from 'vue-router';
import { reactive } from 'vue'
import { setupLayouts } from 'virtual:generated-layouts'
import generatedRoutes from 'virtual:generated-pages';
const routes = setupLayouts(generatedRoutes)

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export async function useRouterPush(name, params) {
  if (router.currentRoute.name === name) return
  return router.push({ name, params })
}

export function useRouter() {
  return reactive(router)
}

export function useRoute() {
  return reactive(router.currentRoute.value)
}

export function useRouteParams() {
  return reactive(router.currentRoute.value.params)
}
export function useRouteQuery() {
  return reactive(router.currentRoute.value.query)
}

export default (app) => app.use(router);
