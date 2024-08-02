<template>
  <div class="home">
    <div v-if="act == 1" class="page" :style="`background-image:url(${page1});`">
      <div @click="actclick(2)" style="position: absolute;left: 0;top: 274px;cursor: pointer;width: 517px;height: 120px;"></div>
      <div @click="actclick(3)" style="position: absolute;left: 0;top: 394px;cursor: pointer;width: 517px;height: 120px;"></div>
    </div>
    <div v-if="act == 2" class="page" :style="`background-image:url(${page2});`">
      <div @click="actclick(1)" style=" position: absolute; left: 0; top: 166px; cursor: pointer; width: 517px; height: 120px;"></div>
      <div @click="actclick(3)" style="position: absolute;left: 0;top: 394px;cursor: pointer;width: 517px;height: 120px;"></div>
    </div>
    <div v-if="act == 3" class="page" :style="`background-image:url(${page3});`">
      <div @click="actclick(1)" style="position: absolute;left: 0;top: 166px;cursor: pointer;width: 517px;height: 120px;"></div>
      <div @click="actclick(2)" style="position: absolute;left: 0;top: 274px;cursor: pointer;width: 517px;height: 120px;"></div>
      <div @click="actclick(4)" style="position: absolute;left: 1000px;top: 56px;cursor: pointer;width: 190px;height: 53px;"></div>
    </div>
    <div v-if="act == 4" class="page" :style="`background-image:url(${page4});`">
      <div @click="actclick(1)" style="position: absolute;left: 0;top: 166px;cursor: pointer;width: 517px;height: 120px;"></div>
      <div @click="actclick(2)" style="position: absolute;left: 0;top: 274px;cursor: pointer;width: 517px;height: 120px;"></div>
      <div @click="actclick(3)" style="position: absolute;left: 800px;top: 56px;cursor: pointer;width: 190px;height: 53px;"></div>
    </div>
  </div>
</template>

<script>
import useCommonStore from '@/store/common'
const store = useCommonStore()
export const requireImg = (url) => {
  const modules = import.meta.glob('@/assets/img/**/*.{png,svg,jpg,jpeg}', {
    eager: true
  })
  if (modules[url]) return modules[url].default
}

export default {
  data() {
    return {
      act: 1
    }
  },
  computed: {
    page1() {
      if (store.language == 'en') {
        return requireImg('/src/assets/img/en/yd1.png')
      } else {
        return requireImg('/src/assets/img/zh/yd1.jpg')
      }
    },
    page2() {
      if (store.language == 'en') {
        return requireImg('/src/assets/img/en/yd2.png')
      } else {
        return requireImg('/src/assets/img/zh/yd2.jpg')
      }
    },
    page3() {
      if (store.language == 'en') {
        return requireImg('/src/assets/img/en/yd3.png')
      } else {
        return requireImg('/src/assets/img/zh/yd3.jpg')
      }
    },
    page4() {
      if (store.language == 'en') {
        return requireImg('/src/assets/img/en/yd4.png')
      } else {
        return requireImg('/src/assets/img/zh/yd4.jpg')
      }
    }
  },
  methods: {
    actclick(e) {
      this.act = e
    }
  }
}
</script>

<style scoped lang="scss">
.page {
  background-repeat: no-repeat;
  background-size: 100% 100%;
  width: 90%;
  height: 752px;
  margin: 5% auto;
  position: relative;
}
</style>



<route lang="yaml">
meta:
  layout: vertical
</route>