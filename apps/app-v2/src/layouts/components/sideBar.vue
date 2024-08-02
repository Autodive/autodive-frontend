<template>
  <el-scrollbar class="side-bar-container" :class="{ 'is-collapse': collapse }">
    <ul>
      <template v-for="(item, index) in menus" :key="index">
        <template v-if="item.children && item.children.length">
          <li :class="{ hov: isActiveClass(item) }" :style="itemStyle">
            <div v-if="role == 3 && item.path === '/main/project/home'">
              <div class="menuicon menuicon1"></div>
              <div>{{ $t('项目主页') }}</div>
            </div>

            <el-popover placement="right" width="175" trigger="hover" v-else>
              <ul class="menusub">
                <li @click="tabclick(child.path)" v-for="(child, childIdx) in item.children" :key="childIdx">
                  <el-icon v-if="child.path === '/main/project/home'">
                    <Histogram />
                  </el-icon>
                  <el-icon v-else-if="child.path === '/main/project/home/overall'">
                    <List />
                  </el-icon>
                  {{ $t(child.title) }}
                </li>
              </ul>
              <template v-slot:reference>
                <div>
                  <div :class="'menuicon menuicon' + (index + 1)"></div>
                  <div>{{ $t(item.title) }}</div>
                </div>
              </template>
            </el-popover>
          </li>
        </template>

        <li :class="{ hov: isActiveClass(item) }" @click="tabclick(item.path)" v-else>
          <div :class="'menuicon menuicon' + (index + 1)"></div>
          <div class="menu-title">{{ $t(item.title) }}</div>
        </li>
      </template>
    </ul>
  </el-scrollbar>
</template>
<script setup>
import { ref, reactive } from 'vue'
const activeMenu = ref('')
const defaultOpens = ref(false)
const currentPath = ref('/')
import { useRouter } from 'vue-router'
const router = useRouter()

const props = defineProps({
  menus: Array,
  itemStyle: {
    type: Object,
    default() {
      return {}
    }
  }
})

const role = ref(1)

function tabclick(path) {
  const query = router.currentRoute.value.query
  router.push({
    path,
    query: {
      name: query.name,
      id: query.id
    }
  })
}

function isActiveClass(item) {
  const currentPath = router.currentRoute.value.path
  const meta = item?.meta
  if (meta) {
    let activePath = meta.activePath

    if (Array.isArray(activePath)) {
      for (let i = 0; i < activePath.length; i++) {
        let aPath = activePath[i]

        if (aPath === currentPath) {
          return true
        }
      }
    } else if (activePath === currentPath) {
      return true
    }
  }
  return item.path === currentPath
}
</script>

<style lang="scss" scoped>
.side-bar-container {
  height: calc(100vh - 80px);
  background: linear-gradient(142deg,#3f3ce8,#555bcc 34%,#575bca 51%);
  li {
    height: 118px;
    color: #fff;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    cursor: pointer;
    flex-direction: column;
    cursor: pointer;
    .menuicon {
      width: 100%;
      height: 30px;
      background-size: 30px 30px;
      margin-bottom: 5px;
    }
    .menu-title {
      width: 80px;
    }
    .menuicon1 {
      background: url(@/assets/m1.png) no-repeat center top;
    }
    .menuicon2 {
      background: url(@/assets/m2.png) no-repeat center top;
    }
    .menuicon3 {
      background: url(@/assets/m3.png) no-repeat center top;
    }
    .menuicon4 {
      background: url(@/assets/m4.png) no-repeat center top;
    }
    .menuicon5 {
      background: url(@/assets/m5.png) no-repeat center top;
    }
    .menuicon6 {
      background: url(@/assets/m6.png) no-repeat center top;
    }
    .menuicon7 {
      background: url(@/assets/m7.png) no-repeat center top;
    }
    .menuicon8 {
      background: url(@/assets/m7.png) no-repeat center top;
    }
    .menuicon9 {
      background: url(@/assets/m7.png) no-repeat center top;
    }
  }
  li.hov,
  li:hover {
    background: url(@/assets/hovbg.png) no-repeat top right;
    background-size: 100% 100%;
    color: rgb(80, 72, 153);
    .menuicon1 {
      background: url(@/assets/m1hov.png) no-repeat center top;
    }
    .menuicon2 {
      background: url(@/assets/m2hov.png) no-repeat center top;
    }
    .menuicon3 {
      background: url(@/assets/m3hov.png) no-repeat center top;
    }
    .menuicon4 {
      background: url(@/assets/m4hov.png) no-repeat center top;
    }
    .menuicon5 {
      background: url(@/assets/m5hov.png) no-repeat center top;
    }
    .menuicon6 {
      background: url(@/assets/m6hov.png) no-repeat center top;
    }
    .menuicon7 {
      background: url(@/assets/m7hov.png) no-repeat center top;
    }
    .menuicon8 {
      background: url(@/assets/m7hov.png) no-repeat center top;
    }
    .menuicon9 {
      background: url(@/assets/m7hov.png) no-repeat center top;
    }
  }
}
.menusub {
  li {
    color: rgb(80, 72, 153);
    font-size: 16px;
    height: 45px;
    line-height: 45px;
    text-align: center;
    cursor: pointer;
    i {
      margin-right: 5px;
    }
  }
  li:hover {
    background: rgb(80, 72, 153);
    color: #fff;
    border-radius: 9px;
  }
}
</style>
