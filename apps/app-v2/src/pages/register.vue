<template>
  <div class="register-container">

    <el-row>
      <el-col :xs="24" :sm="24" :md="12" :lg="16" :xl="16">
        <div style="color: transparent">占位符</div>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
        <el-form ref="registerForm" :model="form" class="register-form" :rules="registerRules" size="mini">
          <el-form-item prop="username">
            <el-input v-model.trim="form.username" v-focus type="text" :placeholder="$t('请输入用户名')" auto-complete="off" :prefix-icon="UserFilled">
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input v-model.trim="form.password" type="password" :placeholder="$t('设置密码')" autocomplete="new-password" :prefix-icon="Lock"></el-input>
          </el-form-item>
          <el-form-item prop="email">
            <el-input v-model="form.email" :disabled="emaildis" type="text" :placeholder="$t('请填写注册时的邮箱')" auto-complete="off" :prefix-icon="Lock"></el-input>
          </el-form-item>
          <el-form-item class="register-btn-view">
            <el-button class="register-btn" type="primary" @click="handleReister">
              {{ $t('注册') }}
            </el-button>
            <router-link to="/login">
              <div style="margin-top: 20px;font-size:20px;">{{ $t('登录') }}</div>
            </router-link>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { isPassword, isPhone } from '@/utils/validate'
import { register } from '@/api/user'
import { UserFilled, Lock } from '@element-plus/icons-vue'

export default {
  username: 'Register',
  components: {
    UserFilled,
    Lock
  },
  directives: {
    focus: {
      inserted(el) {
        el.querySelector('input').focus()
      }
    }
  },
  data() {
    const validateusername = (rule, value, callback) => {
      if ('' == value) {
        callback(new Error(this.$t('用户名不能为空')))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (!isPassword(value)) {
        callback(new Error(this.$t('密码不能少于6位')))
      } else {
        callback()
      }
    }
    return {
      emaildis: false,
      isGetphone: false,
      getPhoneIntval: null,
      phoneCode: this.$t('获取验证码'),
      showRegister: false,
      nodeEnv: process.env.NODE_ENV,
      form: {
        email: ''
      },
      registerRules: {
        username: [
          { required: true, trigger: 'blur', message: this.$t('请输入用户名') },
          { max: 20, trigger: 'blur', message: this.$t('最多不能超过20个字') },
          { validator: validateusername, trigger: 'blur' }
        ],
        password: [
          { required: true, trigger: 'blur', message: this.$t('请输入密码') },
          { validator: validatePassword, trigger: 'blur' }
        ]
      },
      loading: false,
      passwordType: 'password'
    }
  },
  created() {
    document.body.style.overflow = 'hidden'
  },
  mounted() {
    if (this.$route.query.email) {
      this.form.email = decodeURIComponent(this.$route.query.email)
      this.emaildis = true
    }
  },
  beforeDestroy() {
    document.body.style.overflow = 'auto'
    this.getPhoneIntval = null
    clearInterval(this.getPhoneIntval)
  },
  methods: {
    getPhoneCode() {
      this.isGetphone = true
      let n = 60
      this.getPhoneIntval = setInterval(() => {
        if (n > 0) {
          n--
          this.phoneCode = this.$t('重新获取') + '(' + n + 's)'
        } else {
          this.getPhoneIntval = null
          clearInterval(this.getPhoneIntval)
          this.phoneCode = this.$t('获取验证码')
          this.isGetphone = false
        }
      }, 1000)
    },
    handleReister() {
      this.$refs['registerForm'].validate(async (valid) => {
        if (valid) {
          const param = {
            userName: this.form.username,
            email: this.form.email,
            password: this.form.password
          }
          try {
            await register(param)
            this.$baseMessage(this.$t('成功创建用户'), 'success')
            this.$router.replace({
              path: '/login',
              query: { username: this.form.username }
            })
          } catch (e) {
            console.error(e)
            this.$baseMessage(this.$t('注册异常，请联系管理员'), 'error')
          }
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.register-container {
  height: 100vh;
  background: url('@/assets/login_images/background.jpg') center center fixed
    no-repeat;
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

  .register-btn {
    width: 220px;
    height: 60px;
    margin-top: 5px;
    border: 0;
    font-size: 20px;

    &:hover {
      opacity: 0.9;
    }
  }

  .register-form {
    position: relative;
    max-width: 100%;
    margin: calc((100vh - 499px) / 2) 10% 10%;
    overflow: hidden;

    .forget-password {
      width: 100%;
      margin-top: 40px;
      text-align: left;

      .forget-password {
        width: 129px;
        height: 19px;
        font-size: 20px;
        font-weight: 400;
        color: rgba(92, 102, 240, 1);
      }
    }

    .per-code {
      width: 100px;
      height: 36px;
      font-size: 20px;
      line-height: 36px;
      color: #fff;
      text-align: center;
      cursor: pointer;
      background: #bbc1ce;
    }

    .phone-code {
      width: 120px;
      height: 36px;
      font-size: 14px;
      color: #fff;
      border-radius: 3px;
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

  .show-pwd {
    position: absolute;
    top: 14px;
    right: 25px;
    font-size: 16px;
    color: $base-font-color;
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
        font-size: 16px;
        line-height: 58px;
        color: $base-font-color;
        background: #f6f4fc;
        border: 0;
        caret-color: $base-font-color;
      }
      .el-input__wrapper {
        background: #f6f4fc;
        border: none;
        box-shadow: none;
      }
    }
  }
}
::v-deep .register-btn-view .el-form-item__content {
  display: initial;
}
</style>
<route lang="yaml">
meta:
  layout: false
</route>