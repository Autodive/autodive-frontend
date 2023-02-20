<template>
  <div class="nav-bar-container">
    <div class="routefont">{{ $t("AutoDive一站式知识标注平台") }}</div>
    <el-dropdown @command="handleCommand">
      <img class="tx" src="../../../assets/tx.png" />
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="password">{{ $t("重置密码") }}</el-dropdown-item>
        <el-dropdown-item command="logout" divided>{{ $t("退出登录") }}</el-dropdown-item>
        <el-dropdown-item command="change" divided>{{ $t("切换语言") }}</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>

    <!-- <el-row :gutter="15">
      <el-col :xs="4" :sm="12" :md="12" :lg="12" :xl="12">
        <div class="left-panel">
          <i
            :class="collapse ? 'el-icon-s-unfold' : 'el-icon-s-fold'"
            :title="collapse ? '展开' : '收起'"
            class="fold-unfold"
            @click="handleCollapse"
          ></i>
          <vab-breadcrumb class="hidden-xs-only" />
        </div>
      </el-col>
      <el-col :xs="20" :sm="12" :md="12" :lg="12" :xl="12">
        <div class="right-panel">
          <vab-error-log />
          <vab-full-screen-bar @refresh="refreshRoute" />
          <vab-theme-bar class="hidden-xs-only" />
          <vab-icon
            title="重载所有路由"
            :pulse="pulse"
            :icon="['fas', 'redo']"
            @click="refreshRoute"
          />
          <vab-avatar />
           <vab-icon
            title="退出系统"
            :icon="['fas', 'sign-out-alt']"
            @click="logout"
          />
        </div>
      </el-col>
    </el-row> -->
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import i18next from 'i18next';
export default {
  name: "VabNavBar",
  data() {
    return {
      pulse: false,
    };
  },
  computed: {
    ...mapGetters({
      collapse: "settings/collapse",
      visitedRoutes: "tabsBar/visitedRoutes",
      device: "settings/device",
      routes: "routes/routes",
    }),
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
    ...mapActions({
      changeCollapse: "settings/changeCollapse",
    }),
    handleCollapse() {
      this.changeCollapse();
    },
    handleCommand(command) {
      switch (command) {
        case "logout":
          this.logout();
          break;
        case "personalCenter":
          this.personalCenter();
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
      this.$baseConfirm(
        this.$t("您确定要退出") + this.$t('title') + this.$t("吗") + "?",
        null,
        () => {
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          location.reload();
        }
      );
    },
    async refreshRoute() {
      this.$baseEventBus.$emit("reload-routerview");
      this.pulse = true;
      setTimeout(() => {
        this.pulse = false;
      }, 1000);
    },
  },
};
</script>

<style lang="scss" scoped>
.nav-bar-container {
  position: relative;
  height: $base-nav-bar-height;
  padding-right: $base-padding;
  padding-left: $base-padding;
  overflow: hidden;
  user-select: none;
  background: $base-color-white;
  display: flex;
  align-items: center;
  .routefont {
    font-size: 22rem;
    flex: 1;
  }
  .tx {
    width: 50rem;
    height: 50rem;
    cursor: pointer;
  }
  .left-panel {
    display: flex;
    align-items: center;
    justify-items: center;
    height: $base-nav-bar-height;

    .fold-unfold {
      color: $base-color-gray;
      cursor: pointer;
    }

    ::v-deep {
      .breadcrumb-container {
        margin-left: 10px;
      }
    }
  }

  .right-panel {
    display: flex;
    align-content: center;
    align-items: center;
    justify-content: flex-end;
    height: $base-nav-bar-height;

    ::v-deep {
      svg {
        width: 1em;
        height: 1em;
        margin-right: 15px;
        font-size: $base-font-size-small;
        color: $base-color-gray;
        cursor: pointer;
        fill: $base-color-gray;
      }

      button {
        svg {
          margin-right: 0;
          color: $base-color-white;
          cursor: pointer;
          fill: $base-color-white;
        }
      }

      .el-badge {
        margin-right: 15px;
      }
    }
  }
}
</style>
