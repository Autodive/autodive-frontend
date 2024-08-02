<template>
  <div class="autodive-container">
    <header class="navbar" :style="props.navStyle">
      <slot name="navbar"></slot>
    </header>
    <div class="sidebar" :style="props.sidebarStyle">
      <slot name="sidebar"></slot>
      <SideBar />
    </div>
    <main class="page" :style="props.pageStyle">
      <div class="page-content">
        <router-view />
       <slot name="content"  v-if="!props.showCusCont"></slot>
      </div>
    </main>
  </div>
</template>
<script setup>
import { computed, ref, reactive } from 'vue'
const props = defineProps(['sidebarStyle', 'pageStyle', 'navStyle'], {showCusCont:{type: Boolean,default:false}})
import { useRoute } from 'vue-router'
const route = useRoute()
</script>
<style lang="scss" scoped>
.autodive-container {
  position: relative;
  width: 100%;
  height: 100%;
  .navbar {
    height: 80px;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.02), 0 1px 3px 0 rgba(0, 0, 0, 0.02);
    position: fixed;
    top: 0;
    left: 0;
    z-index: 20;
    right: 0;
    background-color: #000000;
    box-sizing: border-box;
    display: flex;
    .title {
      font-size: 16px;
      flex: 1;
      line-height: 80px;
      padding-left: 20px;
      color: #FFFFFF;
    }
  }

  .sidebar {
    width: 112px;
    font-size: 16px;
    background-color: #fff;
    position: fixed;
    z-index: 10;
    margin: 0;
    top: 80px;
    left: 0;
    bottom: 0;
    box-sizing: border-box;
    overflow-y: auto;
  }
  .page {
    display: block;
    padding-left: 112px;
    height: 100vh;
    overflow-x: hidden;
    .page-content {
      width: calc(100vw - 112px);
      padding-top: 85px;
      height: calc(100% - 85px);
    }
  }
}
</style>