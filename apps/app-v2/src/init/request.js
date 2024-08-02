import axios from 'axios'
import {
  contentType,
  debounce,
  invalidCode,
  noPermissionCode,
  requestTimeout,
  successCode,
  tokenName,
  loginInterception,
  config
} from '@/config'
import useAuthStore from 'autodive-store-auth'
import qs from 'qs'
import { useRouteQuery } from '@/init/routes'
import { isArray } from '@/utils/validate'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'

let loadingInstance

function install(app, requestMapping) {
  axios.defaults.timeout = requestTimeout
  axios.defaults.headers.post['Content-Type'] = contentType
  const handleCode = (code, msg, store) => {
    switch (code) {
      case invalidCode:
        ElMessage.error({
          showClose: true,
          message:app.i18n.global.t(msg) || `${app.i18n.global.t('后端接口')}${code}${app.i18n.global.t('异常')}`
        })
        store.resetAccessToken()
        if (loginInterception) {
          location.reload()
        }
        break
      case noPermissionCode:
        break
      default:
        break
    }
  }

  axios.interceptors.request.use(
    (config) => {
      NProgress.start();
      const store = useAuthStore()

      const accessToken = store.accessToken
      if (accessToken) {
        config.headers[tokenName] = 'Bearer ' + accessToken
      }
      
      if (requestMapping && isArray(requestMapping)) {
        let found = requestMapping.find(element => {
          let re = new RegExp(element.match)
          if (re.test(config.url)) {
            return element
          }
        })

        if (undefined !== found) {
          let reFound = new RegExp(found.match)
          config.url = config.url.replace(reFound, found.replace)
        }
      }

      if (config.data instanceof FormData) {
        return config;
      }
      const routeQuery = useRouteQuery()
      if (routeQuery.userId) {
        if (config.method === 'post') {
          config.data = {
            userId: routeQuery.userId,
            ...config.data
          }
        }
        if (config.method === 'get') {
          config.params = {
            userId: routeQuery.userId,
            ...config.params
          }
        }
      }

      if (
        config.data &&
        config.headers['Content-Type'] ===
        'application/x-www-form-urlencoded;charset=UTF-8'
      )

        if (config.noqs) {

        } else {
          config.data = qs.stringify(config.data)
        }


      if (debounce.some((item) => config.url.includes(item))) {
        loadingInstance = app.config.globalProperties.$baseLoading()
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  axios.interceptors.response.use(
    response => {
      NProgress.done();
      return response
    },
    (error) => {
      NProgress.done();
      const store = useAuthStore()

      if (loadingInstance) loadingInstance.close()
      const { response, message } = error

      console.log(error,app.i18n, '--error')
      ElMessage.closeAll()
      ElMessage.error({
        showClose: true,
        message:response.data.message?app.i18n.global.t(response.data.message):app.i18n.global.t(response.data.error)
      })

      if (error.response && error.response.data) {
        const { status, data } = response
        handleCode(status, data.msg || message, store)
        return Promise.reject(error)
      } else {
        let { message } = error
        if (message === 'Network Error') {
          message =app.i18n.global.t('后端接口连接异常')
        }
        if (message.includes('timeout')) {
          message =app.i18n.global.t('后端接口请求超时')
        }
        if (message.includes('Request failed with status code')) {
          const code = message.substr(message.length - 3)
          message = `${app.i18n.global.t('后端接口')}${code}${app.i18n.global.t('异常')}`
        }
        ElMessage.error({
          showClose: true,
          message:app.i18n.global.t(message) || `${app.i18n.global.t('后端接口')}${code}${app.i18n.global.t('异常')}`
        })
        return Promise.reject(error)
      }
    }
  )
}

export default async (app) => {

  install(app, config.requestMapping)
};