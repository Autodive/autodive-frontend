<template>
  <el-dropdown @command="handleCommand">
    <span class="avatar-dropdown">
      <!--<el-avatar class="user-avatar" :src="avatar"></el-avatar>-->
      <img class="user-avatar" :src="avatar" alt="" />
      <div class="user-name">
        <!-- 1111 -->
        {{ username }}
        <i class="el-icon-arrow-down el-icon--right"></i>
      </div>
    </span>

    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item command="password">{{ $t("重置密码") }}</el-dropdown-item>
      <el-dropdown-item command="logout" divided>{{ $t("退出登录") }}</el-dropdown-item>
      <el-dropdown-item command="change" divided>{{ $t("切换语言") }}</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
import { mapGetters } from "vuex";
import { recordRoute } from "@/config";
import i18next from 'i18next';
export default {
  name: "VabAvatar",
  computed: {
    ...mapGetters({
      avatar: "user/avatar",
      username: "user/username",
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
    personalCenter() {
      this.$router.push("/personalCenter/personalCenter");
    },
    logout() {
      this.$baseConfirm(
        this.$t("您确定要退出") + this.$baseTitle + this.$t("吗") + "?",
        null,
        () => {
          localStorage.clear();
          this.$router.push("/login");

          // await this.$store.dispatch('user/logout')
          // if (recordRoute) {
          //   const fullPath = this.$route.fullPath
          //   this.$router.push(`/login?redirect=${fullPath}`)
          // } else {
          //   this.$router.push('/login')
          // }
        }
      );
    },
  },
};
</script>
<style lang="scss" scoped>
.avatar-dropdown {
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: center;
  justify-items: center;
  height: 50px;
  padding: 0;

  .user-avatar {
    width: 40px;
    height: 40px;
    cursor: pointer;
    border-radius: 50%;
  }

  .user-name {
    position: relative;
    margin-left: 5px;
    margin-left: 5px;
    cursor: pointer;
  }
}
</style>
