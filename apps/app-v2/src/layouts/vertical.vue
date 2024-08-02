<template>
  <el-config-provider :locale="language">
    <Layout :navStyle="{backgroundColor: '#fff'}">
      <template v-slot:navbar>
        <NavBar>
          <logo />
          <div class="title">{{ $t('title') }}</div>
        </NavBar>
      </template>
      <template v-slot:sidebar>
        <SideBar :menus="menus" />
      </template>
    </Layout>
  </el-config-provider>
</template>
<script setup>
import NavBar from './components/navBar'
import SideBar from './components/sideBar'
import { Layout } from 'autodive-commons'
import { computed, reactive } from 'vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'
import useCommonStore from '@/store/common'
const store = useCommonStore()
import logo from './components/logo.vue'

const language = computed(() => {
  if (store.language === 'en') {
    return en
  } else {
    return zhCn
  }
})

const menus = reactive([
  {
    path: '/main/welcome',
    title: '首页'
  },
  {
    path: '/main/project/list',
    title: '项目管理'
  }
])
</script>

<style lang="scss" scoped>
.title {
  font-size: 20px;
  flex: 1;
  line-height: 80px;
  padding-left: 20px;
  color: #2c3e50;
}
</style>