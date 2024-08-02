<template>
  <el-config-provider :locale="language">
    <Layout :sidebarStyle="sidebarStyle" :pageStyle="pageStyle" :navStyle="{'background-color':'#fff'}">
      <template v-slot:navbar>
        <NavBar>
          <logo />
          <div class="navbar-left">
            <el-select class="routefont" :remote-method="remoteMethod" @change="selectOnChange" v-model="value" filterable remote :placeholder="$t('请选择')" remote-show-suffix>
              <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </div>
          <div style="flex:1"></div>
          <div class="nav-bar" v-if="isShowNavBar">
            <img v-if="navData.isFirst" @click="clickBottomBarAction('first')" class="bar is-active" src="@/assets/task/first.png" />
            <img v-if="!navData.isFirst" class="bar" src="@/assets/task/first-no.png" />
            <img v-if="navData.isPrevious" @click="clickBottomBarAction('previous')" class="bar is-active" src="@/assets/task/front.png" />
            <img v-if="!navData.isPrevious" class="bar" src="@/assets/task/front-no.png" />
            <img v-if="navData.isNext" @click="clickBottomBarAction('next')" class="bar is-active" src="@/assets/task/next.png" />
            <img v-if="!navData.isNext" class="bar" src="@/assets/task/next-no.png" />
            <img v-if="navData.isLast" @click="clickBottomBarAction('last')" class="bar is-active" src="@/assets/task/last.png" />
            <img v-if="!navData.isLast" class="bar" src="@/assets/task/last-no.png" />
            
            <el-dropdown @command="setIsCommon">
              <span class="el-dropdown-link">
                {{ $t(bottomSelectBarType.title) }}
                {{ bottomSelectBarType.type.length > 0 ? '(' : '' }}
                {{ $t(bottomSelectBarType.type) }}
                {{ bottomSelectBarType.type.length > 0 ? ')' : ''
                }}<i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <template v-slot:dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="both">{{
                    $t('全部')
                  }}</el-dropdown-item>
                  <el-dropdown-item command="same">{{
                    $t('同类型')
                  }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <img class="bar is-active" @click="clickBackAction" src="@/assets/task/back.png" />
            <span @click="clickBackAction" class="is-active" style="line-height:45px">{{ $t("返回任务列表") }}</span>
          </div>
        </NavBar>
      </template>
      <template v-slot:sidebar>
        <SideBar :menus="menus" :item-style="itemStyle" />
      </template>
    </Layout>
  </el-config-provider>
</template>
<script setup>
import NavBar from './components/navBar'
import SideBar from './components/sideBar'
import { Layout } from 'autodive-commons'
import { computed, ref, reactive, onMounted, watch } from 'vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'
import useCommonStore from '@/store/common'
import { getproject } from '@/api/project'
import logo from './components/logo.vue'
import { useI18n } from 'vue-i18n'
import { getTaskNav } from '@/api/task'
import { getResourceDetail } from '@/api/zhiyuan'
const { t } = useI18n()
import { ElMessage } from 'element-plus'

const store = useCommonStore()

const language = computed(() => {
  if (store.language === 'en') {
    return en
  } else {
    return zhCn
  }
})

const bottomSelectBarType = ref({
  id: 'same',
  title: '同类型',
  type: '文献',
})

const menus = reactive([
  {
    path: '/main/project/home',
    title: '项目主页',
    children: [
      {
        path: '/main/project/home',
        title: '个人统计'
      },
      {
        path: '/main/project/home/overall',
        title: '总体统计'
      }
    ],
    meta: {
      activePath: ['/main/project/home/overall']
    }
  },
  {
    path: '/main/project/home/resource',
    title: '资源管理'
  },
  {
    path: '/main/project/home/benti',
    title: '本体管理'
  },
  {
    path: '/main/project/task/list',
    title: '我的任务',
    meta: {
      activePath: ['/main/project/task/resourceAnnotation']
    }
  },
  {
    path: '/main/project/authority',
    title: '权限管理'
  },
  {
    path: '/main/project/publishData',
    title: '数据发布'
  }
])

import { useRouter } from 'vue-router'
const router = useRouter()
const currentRoute = router.currentRoute.value

const value = ref(currentRoute.query.name)
const list = ref([])
const options = ref([
  {
    value: '0',
    label: t('更多')
  }
])

const keyword = ref('')

onMounted(() => {
  getProjectList()
})

function remoteMethod(query) {
  keyword.value = query

  options.value = list.value.filter((item) => {
    return item.label.toLowerCase().includes(query.toLowerCase())
  })
}

function getProjectList() {
  getproject({ page: 0, size: 5, keyword: keyword.value }).then((res) => {
    let arr = []
    for (let i = 0; i < res.data.content.length; i++) {
      let item = res.data.content[i]
      let item2 = {
        value: item.id,
        label: item.name
      }
      arr.push(item2)
    }
    options.value = arr.concat({
      value: '0',
      label: t('更多')
    })

    list.value = arr.concat({
      value: '0',
      label: t('更多')
    })
  })
}

function selectOnChange(value) {
  console.log('selectOnChange')
  console.log(value)
  if (value == '0') {
    router.push({ path: '/main/project/list' })
  } else {
    let name = ''
    for (let i = 0; i < options.value.length; i++) {
      let item = options.value[i]
      if (item.value == value) {
        name = item.label
      }
    }
    router.replace({
      path: '/main/project/home',
      query: {
        name,
        id: value
      }
    })
  }
}

const sidebarStyle = reactive({
  width: '80px'
})

const pageStyle = reactive({
  paddingLeft: '80px'
})

const itemStyle = reactive({
  height: '95px'
})

const isShowNavBar = ref(false)

const navData = ref({
  first: '',
  last: '',
  next: '',
  previous: ''
})

const resource = ref({})

async function requestTaskNav() {
  const resourceId = router.currentRoute.value.query.resourceId
  console.log(resourceId, 'resourceId')
  const params = {
    istype: true
  }

  if (bottomSelectBarType.value.id == 'same') {
    params.istype = true
  }
  const re = await getTaskNav(resourceId, params)
  const { first, last, next, previous } = re.data

  re.data.isFirst = first.length > 0 && first != resourceId ? true : false
  re.data.isLast = last.length > 0 && last != resourceId ? true : false
  re.data.isNext = next.length > 0 && next != resourceId ? true : false
  re.data.isPrevious =
    previous.length > 0 && previous != resourceId ? true : false
  navData.value = re.data
}

async function requestResourceDetail() {
  const resourceId = router.currentRoute.value.query.resourceId
  var re = await getResourceDetail(resourceId)
  resource.value = re.data

  var title = '全部'
  var type = ''
  if (bottomSelectBarType.value.id == 'same') {
    title = '同类型'
    var map = {
      paper: '文献',
      image: '图片',
      txt: '文本',
    }
    type = map[resource.value.type]
  }
  bottomSelectBarType.value.title = title
  bottomSelectBarType.value.type = type
}

watch(
  () => router.currentRoute.value.path,
  (toPath) => {
    console.log(toPath, 'toPath ')
    isShowNavBar.value = false
    let pathList = [
      '/main/project/synergies/detail',
      '/main/project/behavioralIntent/detail',
      '/resourceAnnotation'
    ]
    pathList.forEach((item) => {
      if (toPath.indexOf(item) > -1) {
        isShowNavBar.value = true
      }
    })

    if (isShowNavBar.value) {
      requestTaskNav()
      requestResourceDetail()
    }
  },
  { immediate: true, deep: true }
)

function clickBottomBarAction(e) {
  var resourceId = navData.value[e]
  if (!resourceId || resource.value.id == resourceId) {
    var messageMap = {
      first: '当前查看资源已经是第一页',
      previous: '当前查看资源已经是第一页',
      next: '当前查看资源已经是最后一页',
      last: '当前查看资源已经是最后一页'
    }

    ElMessage.error({
      showClose: true,
      message: messageMap[e]
    })
    return
  }
  resource.value.type = ''

  router.push({
    path: "/main/project/task/resourceAnnotation",
    query: {
      name: currentRoute.query.name,
      id: currentRoute.query.id,
      resourceId: resourceId
    }
  })
}

function clickBackAction() {
  router.push({
    path: '/main/project/task/list',
    query: {
      name: currentRoute.query.name,
      id: currentRoute.query.id
    }
  })
}

function setIsCommon(e) {
  if (bottomSelectBarType.value.id == e) {
    return
  }
  var title = '全部'
  var type = ''
  if (e == 'same') {
    title = '同类型'
    var map = {
      paper: '文献',
      image: '图片',
      txt: '文本',
    }
    type = map[resource.value.type]
  }
  bottomSelectBarType.value = {
    id: e,
    title: title,
    type: type,
  }
  requestTaskNav()
}

</script>

<style lang="scss" scoped>
.navbar-left {
  height: 80px;
  display: flex;
  align-items: center;
  padding-left: 20px;
}
.routefont {
  font-size: 15px;
  cursor: pointer;
  width: 200px;
  height: 30px;
  line-height: 30px;
}

.nav-bar {
  display: flex;
  align-items: center;
  margin-right: 127px;
  img {
    width: 44px;
    height: 44px;
  }
  .bar {
    cursor: not-allowed;
    &.is-active {
      cursor: pointer;
    }
  }
  .el-dropdown {
    margin-left: 60px;
    margin-right: 60px;
    color: #3a3a3a;
    width: 180px;
    line-height: 50px;
    text-align: right;
    span {
      text-align: right;
      line-height: 50px;
      i {
        line-height: 50px;
        float: right;
      }
    }
  }
  .bar + .bar {
    margin-left: 40px;
  }
  span {
    color: #3a3a3a;
    font-size: 18px;
  }
}
</style>