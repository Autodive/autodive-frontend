import router from '@/router'
import store from '@/store'
import VabProgress from 'nprogress'
import 'nprogress/nprogress.css'
import getPageTitle from '@/utils/pageTitle'
import i18next from 'i18next';
import {
  authentication,
  loginInterception,
  progressBar,
  recordRoute,
  routesWhiteList,
} from '@/config'

VabProgress.configure({
  easing: 'ease',
  speed: 500,
  trickleSpeed: 200,
  showSpinner: false,
})
router.beforeResolve(async (to, from, next) => {
  if (progressBar) VabProgress.start()
  let hasToken = store.getters['user/accessToken']

  if (!loginInterception) hasToken = true

  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/' })
      if (progressBar) VabProgress.done()
    } else {
      const hasPermissions =
        store.getters['user/permissions'] &&
        store.getters['user/permissions'].length > 0
      if (hasPermissions) {
        if(from.query.userId){
                    if (!to.query.userId) {
                        let query = to.query
            query.userId = from.query.userId || ''
            if (query.userId) {
              next({
                path: to.path,
                query: query
              })
            } else {
              next()
            }
          } else {
              next()
          }
        }else{
            next()
        }
      } else {
        try {
          let permissions
          if (!loginInterception) {
                        await store.dispatch('user/setPermissions', ['admin'])
            permissions = ['admin']
          } else {
            permissions = await store.dispatch('user/getUserInfo')
          }

          let accessRoutes = []
          if (authentication === 'intelligence') {
            accessRoutes = await store.dispatch('routes/setRoutes', permissions)
          } else if (authentication === 'all') {
            accessRoutes = await store.dispatch('routes/setAllRoutes')
          }
          router.addRoutes(accessRoutes)
          next({ ...to, replace: true })
        } catch {
          await store.dispatch('user/resetAccessToken')
          if (progressBar) VabProgress.done()
        }
      }
    }
  } else {
    if (routesWhiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      if (recordRoute) {
        next(`/login?redirect=${to.path}`)
      } else {
        next('/login')
      }

      if (progressBar) VabProgress.done()
    }
  }
  document.title = getPageTitle(i18next.t(to.meta.title))
})
router.afterEach(() => {
  if (progressBar) VabProgress.done()
})
