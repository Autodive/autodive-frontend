<template>
  <div class="login-container">
    <el-row>
      <el-col :xs="24" :sm="24" :md="12" :lg="16" :xl="16">
        <div style="color: transparent">占位符</div>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
        <el-form
          ref="form"
          :model="form"
          :rules="rules"
          class="login-form"
          label-position="left"
        >
          <div class="title">{{ $t("欢迎登录") }}</div>
          <div class="title-tips">{{ title }}！</div>
          <el-form-item style="margin-top: 40px" prop="userName">
            <span class="svg-container svg-container-admin">
              <vab-icon :icon="['fas', 'user']" />
            </span>
            <el-input
              v-model.trim="form.userName"
              v-focus
              :placeholder="$t('请输入用户名')"
              tabindex="1"
              type="text"
            />
          </el-form-item>
          <el-form-item prop="password">
            <span class="svg-container">
              <vab-icon :icon="['fas', 'lock']" />
            </span>
            <el-input
              :key="passwordType"
              ref="password"
              v-model.trim="form.password"
              :type="passwordType"
              tabindex="2"
              :placeholder="$t('请输入密码')"
              @keyup.enter.native="handleLogin"
            />
            <span
              v-if="passwordType === 'password'"
              class="show-password"
              @click="handlePassword"
            >
              <vab-icon :icon="['fas', 'eye-slash']"></vab-icon>
            </span>
            <span v-else class="show-password" @click="handlePassword">
              <vab-icon :icon="['fas', 'eye']"></vab-icon>
            </span>
          </el-form-item>
          <el-button
            :loading="loading"
            class="login-btn"
            type="primary"
            @click="handleLogin"
          >
            {{ $t("登录") }}
          </el-button>

          <div style="margin-top: 20px; font-size: 20px">
            <router-link to="/register">{{ $t("注册") }}</router-link>
            <span
              @click="dialogVisible = true"
              style="margin-left: 20px; cursor: pointer; color: #575bca"
              >找回密码</span
            >
          </div>
        </el-form>
      </el-col>
    </el-row>

    <el-dialog
      :title="$t('重置密码')"
      custom-class="outdivstyle"
      :visible.sync="dialogVisible"
      center
      width="20%"
    >
      <el-form style="padding: 0">
        <el-form-item style="margin: 0px">
          <span class="svg-container svg-container-admin">
            <vab-icon :icon="['fas', 'user']" />
          </span>
          <el-input
            v-model="email"
            v-focus
            :placeholder="$t('请输入邮箱')"
            tabindex="1"
            type="text"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t("取消") }}</el-button>
        <el-button type="primary" @click="send">{{ $t("申请重置") }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// import i18next from 'i18next';
import { isPassword } from "@/utils/validate";
import { forgotPwApply } from "@/api/user";
export default {
  name: "Login",
  directives: {
    focus: {
      inserted(el) {
        el.querySelector("input").focus();
      },
    },
  },
  data() {
    const validateuserName = (rule, value, callback) => {
      if ("" == value) {
        callback(new Error(this.$t("用户名不能为空")));
      } else {
        callback();
      }
    };
    const validatePassword = (rule, value, callback) => {
      if (!isPassword(value)) {
        callback(new Error(this.$t("密码不能少于6位")));
      } else {
        callback();
      }
    };
    return {
      dialogVisible: false,
      email: "",
      nodeEnv: process.env.NODE_ENV,
      title: this.$baseTitle,
      form: {
        userName: "",
        password: "",
      },
      rules: {
        userName: [
          {
            required: true,
            trigger: "blur",
            validator: validateuserName,
          },
        ],
        password: [
          {
            required: true,
            trigger: "blur",
            validator: validatePassword,
          },
        ],
      },
      loading: false,
      passwordType: "password",
      redirect: undefined,
    };
  },
  watch: {
    $route: {
      handler(route) {
        this.redirect = (route.query && route.query.redirect) || "/";
      },
      immediate: true,
    },
  },
  created() {
    document.body.style.overflow = "hidden";
  },
  beforeDestroy() {
    document.body.style.overflow = "auto";
  },
  mounted() {
    this.form.userName = "";
    this.form.password = "";
  },
  methods: {
    send() {
      if (this.email == "") {
        this.$message({
          message: this.$t("请填写注册时的邮箱"),
          type: "error",
        });
        return;
      }
      forgotPwApply({ email: this.email }).then((res) => {
        this.$message({
          message: this.$t("申请成功，请登录邮箱查看邮件"),
          type: "success",
        });
        this.dialogVisible = true;
      });
    },
    handlePassword() {
      this.passwordType === "password"
        ? (this.passwordType = "")
        : (this.passwordType = "password");
      this.$nextTick(() => {
        this.$refs.password.focus();
      });
    },
    handleLogin() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.loading = true;
          this.$store
            .dispatch("user/login", this.form)
            .then((res) => {
              const routerPath =
                this.redirect === "/404" || this.redirect === "/401"
                  ? "/"
                  : this.redirect;
              this.$router.push("/").catch(() => {});
              this.loading = false;
            })
            .catch(() => {
              this.loading = false;
            });
        } else {
          return false;
        }
      });
      /* setTimeout(() => {
          window.open('https://github.com/chuzhixin/vue-admin-beautiful')
        }, 100000) */
    },
  },
};
</script>

<style lang="scss" scoped>
.login-container {
  height: 100vh;
  background: url("~@/assets/login_images/background.jpg") center center fixed no-repeat;
  background-size: cover;

  .title {
    font-size: 54px;
    font-weight: 500;
    color: rgba(14, 18, 26, 1);
  }

  .title-tips {
    margin-top: 29px;
    font-size: 26px;
    font-weight: 400;
    color: rgba(14, 18, 26, 1);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .login-btn {
    display: inherit;
    width: 220px;
    height: 60px;
    margin-top: 5px;
    border: 0;
    font-size: 20px;

    &:hover {
      opacity: 0.9;
    }
  }

  .login-form {
    position: relative;
    max-width: 100%;
    margin: calc((100vh - 425px) / 2) 10% 10%;
    overflow: hidden;

    .forget-password {
      width: 100%;
      margin-top: 40px;
      text-align: left;

      .forget-pass {
        width: 129px;
        height: 19px;
        font-size: 20px;
        font-weight: 400;
        color: rgba(92, 102, 240, 1);
      }
    }
  }

  .tips {
    margin-bottom: 10px;
    font-size: $base-font-size-default;
    color: $base-color-white;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .title-container {
    position: relative;

    .title {
      margin: 0 auto 40px auto;
      font-size: 34px;
      font-weight: bold;
      color: $base-color-blue;
      text-align: center;
    }
  }

  .svg-container {
    position: absolute;
    top: 14px;
    left: 15px;
    z-index: $base-z-index;
    font-size: 16px;
    color: #d7dee3;
    cursor: pointer;
    user-select: none;
  }

  .show-password {
    position: absolute;
    top: 14px;
    right: 25px;
    font-size: 16px;
    color: #d7dee3;
    cursor: pointer;
    user-select: none;
  }

  ::v-deep {
    .el-form-item {
      padding-right: 0;
      margin: 20px 0;
      color: #454545;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 2px;

      &__content {
        min-height: $base-input-height;
        line-height: $base-input-height;
      }

      &__error {
        position: absolute;
        top: 100%;
        left: 18px;
        font-size: $base-font-size-small;
        line-height: 18px;
        color: $base-color-red;
      }
    }

    .el-input {
      box-sizing: border-box;

      input {
        height: 58px;
        padding-left: 45px;
        font-size: 16px;
        line-height: 58px;
        color: $base-font-color;
        background: #f6f4fc;
        border: 0;
        caret-color: $base-font-color;
      }
    }
  }
}
</style>
