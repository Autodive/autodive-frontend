import { loadingText, messageDuration } from '@/config'
import * as lodash from 'lodash'
import { Loading, Message, MessageBox, Notification } from 'element-ui'
import store from '@/store'
import { getAccessToken } from '@/utils/accessToken'

const accessToken = store.getters['user/accessToken']
const layout = store.getters['settings/layout']
import i18next from 'i18next';
const install = (Vue, opts = {}) => {

  Vue.prototype.$baseAccessToken = () => {
    return accessToken || getAccessToken()
  }

  Object.defineProperty(Vue, '$baseTitle', {
    get() {
      return i18next.t('title');
    }
  });

  Vue.prototype.$baseLoading = (index, text) => {
    let loading
    if (!index) {
      loading = Loading.service({
        lock: true,
        text: text || loadingText,
        background: 'hsla(0,0%,100%,.8)',
      })
    } else {
      loading = Loading.service({
        lock: true,
        text: text || loadingText,
        spinner: 'vab-loading-type' + index,
        background: 'hsla(0,0%,100%,.8)',
      })
    }
    return loading
  }

  Vue.prototype.$baseColorfullLoading = (index, text) => {
    let loading
    if (!index) {
      loading = Loading.service({
        lock: true,
        text: text || loadingText,
        spinner: 'dots-loader',
        background: 'hsla(0,0%,100%,.8)',
      })
    } else {
      switch (index) {
        case 1:
          index = 'dots'
          break
        case 2:
          index = 'gauge'
          break
        case 3:
          index = 'inner-circles'
          break
        case 4:
          index = 'plus'
          break
      }
      loading = Loading.service({
        lock: true,
        text: text || loadingText,
        spinner: index + '-loader',
        background: 'hsla(0,0%,100%,.8)',
      })
    }
    return loading
  }

  Vue.prototype.$baseMessage = (message, type) => {
    Message({
      offset: 60,
      showClose: true,
      message: i18next.t(message),
      type: type,
      dangerouslyUseHTMLString: true,
      duration: messageDuration,
    })
  }


  Vue.prototype.$baseAlert = (content, title, callback) => {
    MessageBox.alert(content, title || i18next.t('????????????'), {
      confirmButtonText: i18next.t('??????'),
      dangerouslyUseHTMLString: true,
      callback: (action) => {
        if (callback) {
          callback()
        }
      },
    })
  }


  Vue.prototype.$baseConfirm = (content, title, callback1, callback2) => {
    MessageBox.confirm(content, title || i18next.t('????????????'), {
      confirmButtonText: i18next.t('??????'),
      cancelButtonText: i18next.t('??????'),
      closeOnClickModal: false,
      type: 'warning',
    })
      .then(() => {
        if (callback1) {
          callback1()
        }
      })
      .catch(() => {
        if (callback2) {
          callback2()
        }
      })
  }


  Vue.prototype.$baseNotify = (message, title, type, position) => {
    Notification({
      title: title,
      message: message,
      position: position || 'top-right',
      type: type || 'success',
      duration: messageDuration,
    })
  }


  Vue.prototype.$baseTableHeight = (formType) => {
    let height = window.innerHeight
    let paddingHeight = 400
    const formHeight = 50

    if (layout === 'vertical') {
      paddingHeight = 340
    }

    if ('number' == typeof formType) {
      height = height - paddingHeight - formHeight * formType
    } else {
      height = height - paddingHeight
    }
    return height
  }


  Vue.prototype.$baseLodash = lodash

  Vue.prototype.$baseEventBus = new Vue()
}

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default install
