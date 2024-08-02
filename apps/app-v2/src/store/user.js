import { defineStore, acceptHMRUpdate } from 'pinia'
import {
  getAccessToken,
  removeAccessToken,
  setAccessToken,
} from '@/utils/accessToken'
import { tokenName } from '@/config'

export default defineStore('demo', () => {
  const count = ref(0);

  return {
    count, increase,
  }

  function increase() {
    count.value++;
  }
});

const useUserStore = defineStore('user', {
  state() {
    return {
      accessToken: getAccessToken(),
      username: '',
      avatar: '',
      permissions: [],
    }
  },
 
  actions: {
    setAccessToken(payload) {
      this.accessToken = payload
      setAccessToken(payload)
    },
    setUsername(payload) {
      this.username = payload
    },
    setAvatar(payload) {
      this.avatar = payload
    },
    setPermissions(payload) {
      this.permissions = payload
    },
    resetAccessToken() {
      this.setPermissions([])
      this.setAccessToken('')
      removeAccessToken()
    },
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}

export { useUserStore }
