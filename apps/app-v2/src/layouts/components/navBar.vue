<template>
  <slot></slot>
  <el-dropdown @command="handleCommand" placement="bottom-end" class="right-menu">
    <img class="tx" src="@/assets/tx.png" />
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="password">{{ $t("重置密码") }}</el-dropdown-item>
        <el-dropdown-item command="logout" divided>{{ $t("退出登录") }}</el-dropdown-item>
        <el-dropdown-item command="change" divided>{{ $t("切换语言") }}</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'

import { useI18n } from 'vue-i18n'
const { locale, t } = useI18n()
import useCommonStore from '@/store/common'
const store = useCommonStore()
import useAuthStore from 'autodive-store-auth'
const authStore = useAuthStore()

import { useRouter } from 'vue-router'
const router = useRouter()

function logout() {
  const content = `${t('您确定要退出')}${t('title')}${t('吗')}?`

  ElMessageBox.confirm(content, t('提示'), {
    confirmButtonText: t('确定'),
    cancelButtonText: t('取消'),
    type: 'warning'
  })
    .then(() => {
      authStore.resetAccessToken()
      router.push('/login')
    })
    .catch(() => {
    })
}

function change() {
  if (locale.value == 'en') {
    locale.value = 'zh'
  } else {
    locale.value = 'en'
  }

  store.switchLanguages()
}

const handleCommand = (command) => {
  switch (command) {
    case 'logout':
      logout()
      break
    case 'password':
      break
    case 'change':
      change()
      break
  }
}

onMounted(() => {
  locale.value = store.language
})
</script>
<style lang="scss" scoped>
.right-menu {
  position: absolute;
  right: 35px;
  top: 15px;

  .tx {
    width: 45px;
    height: 45px;
    cursor: pointer;
    outline: none;
  }
}
</style>