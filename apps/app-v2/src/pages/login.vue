<template>
  <section class="login-container">
    <el-row>
      <el-col :xs="24" :sm="24" :md="12" :lg="16" :xl="16">
        <div style="color: transparent">占位符</div>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
        <el-form ref="ruleFormRef" :model="store.form" :rules="store.rules" class="login-form" label-position="left">
          <div class="title">{{ $t("欢迎登录") }}</div>
          <div class="title-tips">{{ $t('title') }}！</div>
          <el-form-item style="margin-top: 40px" prop="userName">
            <el-input v-model.trim="store.form.userName" clearable v-focus :placeholder="$t('请输入用户名')" tabindex="1" type="text" :prefix-icon="UserFilled" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input :key="store.passwordType" ref="password" v-model.trim="store.form.password" :type="store.passwordType" tabindex="2" :placeholder="$t('请输入密码')" @keyup.enter="login" :prefix-icon="Lock">
            </el-input>
            <span v-if="store.passwordType === 'password'" class="show-password" @click="store.handlePassword">
              <el-icon>
                <Hide />
              </el-icon>
            </span>
            <span v-else class="show-password" @click="store.handlePassword">
              <el-icon>
                <View />
              </el-icon>
            </span>
          </el-form-item>
          <el-button :loading="store.loading" class="login-btn" type="primary" @click="login">
            {{ $t("登录") }}
          </el-button>

          <div style="margin-top: 20px; font-size: 20px">
            <router-link to="/register">{{ $t("注册") }}</router-link>
            <span @click="showResetDialog" style="margin-left: 20px; cursor: pointer; color: rgb(80, 72, 153)">{{$t("找回密码")}}</span>

            <span @click="isResend = true" style="margin-left: 20px; cursor: pointer; color: rgb(80, 72, 153);">{{$t("重发验证")}}</span>
          </div>
        </el-form>
      </el-col>
    </el-row>
  </section>

  <el-dialog :title="$t('重置密码')" v-model="dialogVisible" center width="20%" class="outdivstyle">
    <el-form style="padding: 0">
      <el-form-item style="margin: 0px">
        <el-input v-model="resetForm.email" v-focus :placeholder="$t('请填写注册时的邮箱')" tabindex="1" type="text" :prefix-icon="UserFilled" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t("取消") }}</el-button>
        <el-button type="primary" @click="send">{{ $t("申请重置") }}</el-button>
      </span>
    </template>

  </el-dialog>

  <el-dialog :title="$t('重发验证')" v-model="isResend" center width="20%" class="outdivstyle">
    <el-form ref="emailForm" style="padding: 0">
      <el-form-item style="margin: 0px">
        <el-input v-model="againEmail.email" v-focus :placeholder="$('请填写注册时的邮箱')" tabindex="1" type="text" :prefix-icon="UserFilled" :rules="[ { required: true, message: '邮箱不能为空'} ]" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="isResend = false">{{ $t("取消") }}</el-button>
        <el-button type="primary" @click="resendVerificationAction">{{ $t("确定") }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import useAuthStore from 'autodive-store-auth'
const store = useAuthStore()
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { isPassword } from '@/utils/validate'
import { forgotPwApply, resendVerification } from '@/api/user'
import { ElMessage } from 'element-plus'
import { UserFilled, Lock } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { config } from '@/config'

const { t } = useI18n()
const router = useRouter()
const ruleFormRef = ref()
const login = async () => {
  let response = await store.handleLogin(ruleFormRef.value)

  if (response.msg === 'success') {
    router.push('/main/welcome')
  }
}
const dialogVisible = ref(false)
function showResetDialog() {
  dialogVisible.value = true
}

const resetForm = ref({
  email: ''
})
function send() {
  if (resetForm.value.email == '') {
    ElMessage.error(t('请填写注册时的邮箱'))
    return
  }
  forgotPwApply({ email: resetForm.value.email }).then((res) => {
    ElMessage.success(t('申请成功，请登录邮箱查看邮件'))
    dialogVisible.value = false
    resetForm.value.email = ''
  })
}

const isResend = ref(false)
const againEmail = ref({
  email: ''
})

async function resendVerificationAction() {
  if (againEmail.value.email == '') {
    ElMessage.error(t('请填写注册时的邮箱'))
    return
  }
  if (!store.verification(againEmail.value.email)) {
    ElMessage.error(t('请输入正确的邮箱'))
    return
  }
  var re = await resendVerification(againEmail.value.email)
  if (re.data) {
    ElMessage.success(t('重发验证成功'))
  } else {
    ElMessage.error(t('重发验证失败'))
  }
  againEmail.value.email = ''
  isResend.value = false
}

onMounted(async () => {
  store.reLogin(config || {})
})
</script>

<style lang="scss" scoped>
.login-container {
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
</style>

<route lang="yaml">
meta:
  layout: false
</route>