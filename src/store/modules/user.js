import Vue from 'vue'
import { getUserInfo, login, logout } from '@/api/user'
import {
  getAccessToken,
  removeAccessToken,
  setAccessToken,
} from '@/utils/accessToken'
import { resetRouter } from '@/router'
import { tokenName } from '@/config'
import i18next from 'i18next'

const state = {
  accessToken: getAccessToken(),
  username: '',
  avatar: '',
  permissions: [],
}
const getters = {
  accessToken: (state) => state.accessToken,
  username: (state) => state.username,
  avatar: (state) => state.avatar,
  permissions: (state) => state.permissions,
}
const mutations = {
  setAccessToken(state, accessToken) {
    state.accessToken = accessToken
    setAccessToken(accessToken)
  },
  setUsername(state, username) {
    state.username = username
  },
  setAvatar(state, avatar) {
    state.avatar = avatar
  },
  setPermissions(state, permissions) {
    state.permissions = permissions
  },
}
const actions = {
  setPermissions({ commit }, permissions) {
    commit('setPermissions', permissions)
  },
  async login({ commit }, userInfo) {
    const { data } = await login(userInfo)
    //const accessToken = data[tokenName]
    const accessToken=data.token
    localStorage.setItem('user',JSON.stringify(data.user))
    if (accessToken) {
      commit('setAccessToken', accessToken)
      const hour = new Date().getHours()
      const thisTime =
        hour < 8
          ? i18next.t('早上好')
          : hour <= 11
          ? i18next.t('上午好')
          : hour <= 13
          ? i18next.t('中午好')
          : hour < 18
          ? i18next.t('下午好')
          : i18next.t('晚上好')
      Vue.prototype.$baseNotify(`${i18next.t('欢迎登录')} ${i18next.t('title')}`, `${thisTime}！`)
    } else {
      Vue.prototype.$baseMessage(
        `登录接口异常，未正确返回${tokenName}...`,
        'error'
      )
    }
  },
  async getUserInfo({ commit, state }) {

    let permissions

      commit('setPermissions',  ['admin'])
      commit('setUsername', 'admin')
      commit('setAvatar', 'https://i.gtimg.cn/club/item/face/img/2/15922_100.gif')

      return permissions

  },
  async logout({ dispatch }) {
    await logout(state.accessToken)
    await dispatch('resetAccessToken')
    await resetRouter()
  },
  resetAccessToken({ commit }) {
    commit('setPermissions', [])
    commit('setAccessToken', '')
    removeAccessToken()
  },
}
export default { state, getters, mutations, actions }
