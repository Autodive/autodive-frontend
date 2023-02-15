<template>
  <div class="main">
    <div class="top">
      <img class="logo" src="../../assets/logo.png" />
      <div class="routefont" v-if="$route.query.userId == undefined">
        <span @click="$router.push({ path: '/projectnav/list' })">{{$t('项目管理')}}</span> /
        {{ $route.query.name }}
      </div>
      <div class="routefont" v-if="$route.query.userId">
        <span>{{$t('项目管理')}}</span> / {{ $route.query.name }}
      </div>
      <el-dropdown @command="handleCommand" v-if="$route.query.userId == undefined">
        <img class="tx" src="../../assets/tx.png" />
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="password">{{ $t("重置密码") }}</el-dropdown-item>
          <el-dropdown-item command="logout" divided>{{
            $t("退出登录")
          }}</el-dropdown-item>
          <el-dropdown-item command="change" divided>{{
            $t("切换语言")
          }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div class="mainbox">
      <ul class="left">
        <li
          v-if="role != 3"
          @click="tabclick(path + '/home')"
          :class="{
            hov: $route.path == path + '/home' || $route.path == path + '/home2',
          }"
        >
          <el-popover placement="right" width="100" trigger="hover">
            <ul class="menusub">
              <li @click="tabclick(path + '/home')">
                <i class="el-icon-s-data"></i>{{ $t('个人统计') }}
              </li>
              <li @click="tabclick(path + '/home2')">
                <i class="el-icon-s-order"></i>{{ $t('总体统计') }}
              </li>
            </ul>
            <div slot="reference">
              <div class="menuicon1"></div>
              <div>{{ $t('项目主页') }}</div>
            </div>
          </el-popover>
        </li>
        <li
          @click="tabclick(path + '/home')"
          :class="{ hov: $route.path == path + '/home' }"
          v-if="role == 3"
        >
          <div>
            <div class="menuicon1"></div>
            <div>{{ $t('项目主页') }}</div>
          </div>
        </li>
        <li
          v-if="item.path != 'home' && item.path != 'home2'"
          v-for="(item, index) in mainroute"
          :class="{ hov: $route.path == path + '/' + item.path }"
          @click="tabclick(path + '/' + item.path)"
        >
          <div>
            <div :class="'menuicon' + (index + 1)"></div>
            <div>{{ $t(item.name) }}</div>
          </div>
        </li>
      </ul>
      <div class="right">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import { asyncRoutes } from "@/router";
import { getxmqx } from "@/api/quanxian";
// import i18next from 'i18next';
export default {
  data() {
    return {
      path: "",
      mainroute: [],
      role: 3,
    };
  },
  mounted() {
    getxmqx({ projectId: this.$route.query.id }).then((res) => {
      this.role = res.data.role;
      this.path = asyncRoutes[2].path;
      if (this.role == 1) {
        this.mainroute = asyncRoutes[2].children.filter((item) => item.isShow != false);
      } else if (this.role == 2) {
        let newarr = asyncRoutes[2].children.filter((item) => item.isShow != false);
        this.mainroute = newarr.filter((item) => item.path != "quanxian");
      } else {
        let newarr = asyncRoutes[2].children.filter((item) => item.isShow != false);
        this.mainroute = newarr.filter(
          (item) => item.path != "quanxian" && item.path != "zhiyuan"
        );
        console.log(this.mainroute);
      }
    });
  },
  methods: {
    change() {
      if (this.$i18next.language == "en") {
        this.$i18next.changeLanguage("zh");
      } else {
        this.$i18next.changeLanguage("en");
      }
      localStorage.setItem("lang", this.$i18next.language);
    },
    handleCommand(command) {
      switch (command) {
        case "logout":
          this.logout();
          break;
        case "personalCenter":
          break;
        case "password":
          // window.open('https://github.com/chuzhixin/vue-admin-beautiful')
          break;
        case "change":
          this.change();
          break;
      }
    },
    logout() {
      this.$baseConfirm(this.$t('您确定要退出') + this.$baseTitle + this.$t('吗')+"?", null, () => {
        localStorage.clear();
        location.reload();
      });
    },
    tabclick(e) {
      this.$router.push({
        path: e + "?name=" + this.$route.query.name + "&id=" + this.$route.query.id,
      });
    },
  },
};
</script>

<style lang="scss">
.main {
  .top {
    height: 100rem;
    display: flex;
    align-items: center;
    .logo {
      width: 100rem;
      margin-left: 10rem;
      margin-right: 20rem;
    }
    .routefont {
      font-size: 22rem;
      flex: 1;
      cursor: pointer;
    }
    .tx {
      width: 50rem;
      height: 50rem;
      margin-right: 40rem;
    }
  }
  .mainbox {
    display: flex;
    overflow: hidden;
  }
  .left {
    width: 112rem;
    height: calc(100vh - 100rem);
    background: linear-gradient(142deg, #3f3ce8 0%, #555bcc 34%, #575bca 51%);
    padding-top: 20rem;
    box-sizing: border-box;
    border-top-right-radius: 10rem;
    li {
      width: 113rem;
      height: 140rem;
      color: #fff;
      font-size: 18rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      .menuicon1 {
        background: url(../../assets/m1.png) no-repeat center top;
        width: 100%;
        height: 33rem;
        background-size: 33rem 33rem;
        margin-bottom: 10rem;
      }
      .menuicon2 {
        background: url(../../assets/m2.png) no-repeat center top;
        width: 100%;
        height: 33rem;
        background-size: 33rem 33rem;
        margin-bottom: 10rem;
      }
      .menuicon3 {
        background: url(../../assets/m3.png) no-repeat center top;
        width: 100%;
        height: 33rem;
        background-size: 33rem 33rem;
        margin-bottom: 10rem;
      }
      .menuicon4 {
        background: url(../../assets/m4.png) no-repeat center top;
        width: 100%;
        height: 33rem;
        background-size: 33rem 33rem;
        margin-bottom: 10rem;
      }
      .menuicon5 {
        background: url(../../assets/m5.png) no-repeat center top;
        width: 100%;
        height: 33rem;
        background-size: 33rem 33rem;
        margin-bottom: 10rem;
      }
    }
    li.hov,
    li:hover {
      width: 113rem;
      height: 140rem;
      background: url(../../assets/hovbg.png) no-repeat top right;
      background-size: 113rem 140rem;
      color: #504899;
      .menuicon1 {
        background: url(../../assets/m1hov.png) no-repeat center top;
        width: 100%;
        height: 33rem;
        background-size: 33rem 33rem;
        margin-bottom: 10rem;
      }
      .menuicon2 {
        background: url(../../assets/m2hov.png) no-repeat center top;
        width: 100%;
        height: 33rem;
        background-size: 33rem 33rem;
        margin-bottom: 10rem;
      }
      .menuicon3 {
        background: url(../../assets/m3hov.png) no-repeat center top;
        width: 100%;
        height: 33rem;
        background-size: 33rem 33rem;
        margin-bottom: 10rem;
      }
      .menuicon4 {
        background: url(../../assets/m4hov.png) no-repeat center top;
        width: 100%;
        height: 33rem;
        background-size: 33rem 33rem;
        margin-bottom: 10rem;
      }
      .menuicon5 {
        background: url(../../assets/m5hov.png) no-repeat center top;
        width: 100%;
        height: 33rem;
        background-size: 33rem 33rem;
        margin-bottom: 10rem;
      }
    }
  }
  .right {
    flex: 1;
    padding: 0rem 20rem 20rem 20rem;
    height: calc(100vh - 100rem);
    box-sizing: border-box;
    overflow: auto;
  }
}
.menusub {
  li {
    color: #504899;
    font-size: 16rem;
    height: 45rem;
    line-height: 45rem;
    text-align: center;
    cursor: pointer;
    i {
      margin-right: 5rem;
    }
  }
  li:hover {
    background: #504899;
    color: #fff;
    border-radius: 9rem;
  }
}
</style>
