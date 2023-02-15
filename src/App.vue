<template>
  <div id="vue-admin-beautiful">
    <router-view />
  </div>
</template>

<script>
import { setHtmlFontSize } from "@/utils/rem";
export default {
  name: 'App',
  created() {
     setHtmlFontSize();
  },
}
</script>

<style lang="scss">
body {padding:0;margin:0;}
#app {
  font-family:"Microsoft Yahei", "PingFang SC", Avenir, "Segoe UI", "Hiragino Sans GB", STHeiti, "Microsoft Sans Serif", "WenQuanYi Micro Hei", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
ul,li {list-style: none;margin:0;padding:0;}
.outdivstyle {
  border-radius: 14rem!important;overflow: hidden!important;
  .el-dialog__header {
    background: linear-gradient(138deg, #403DE7 0%, #575BCA 100%);border-radius: 14rem 14rem 0 0;height:52rem;line-height:52rem;padding-top:0;padding-bottom:0;
    .el-dialog__title {font-size:20rem;color:#fff;}
    .el-dialog__headerbtn {font-size:24rem;top:12px;}
    .el-dialog__headerbtn .el-dialog__close {color:#fff;}
  }
  // .el-input__inner {background:#F4F4F4;border-radius: 5rem;border:0px;}
}
.outdivstyle2 {
  margin-top: 5vh!important;
  .el-dialog__body {padding:0px!important;border:0px!important;
    iframe {border:0px;display: block;width:100%;height:800rem}
  }
}
::-webkit-scrollbar {
  width: 2px;
  height: 1px;
}
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  box-shadow: inset 0 0 5px rgba(97, 184, 179, 0.1);
  background: #ccc;
}
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px rgba(87, 175, 187, 0.1);
  border-radius: 10px;
  background: #f5f5f5;
}

.side-bar-container {
  box-shadow:none!important;
}

</style>
