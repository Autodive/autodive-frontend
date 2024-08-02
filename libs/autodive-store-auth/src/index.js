import { reactive, ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification } from 'element-plus'

import { defineStore } from 'pinia';
import { getUserInfo, login, logout, forgotPwApply, resendVerification } from '@/api/user'

export default defineStore('autodive-store-auth', () => {
    const { t } = useI18n()
    const form = reactive({
        userName: '',
        password: ''
    })

    const loading = ref(false)
    const rules = reactive({
        userName: [{ required: true, message: t('请输入用户名'), trigger: 'blur' }],
        password: [{ required: true, message: t('请输入密码'), trigger: 'blur' }]
    })


    const handleLogin = async (ruleFormRef) => {
        return new Promise((resolve, reject) => {
            ruleFormRef.validate(async (valid, fields) => {
                if (valid) {
                    _login().then(res => {
                        console.log('login .res, hten', res)
                        resolve({
                            msg: 'success',
                            data: res
                        })
                    }).catch(res => {
                        loading.value = false
                        reject({
                            msg: 'error',
                            data: res
                        })
                    })
                } else {
                    reject({
                        msg: 'error',
                        data: fields
                    })
                    console.log('error submit!', fields)
                }
            })
        })
    }

    const accessToken = ref('')




    function setAccessToken(token) {
        accessToken.value = token
        localStorage.setItem('accessToken', token)
    }

    function get() {
        return accessToken.value
    }
    function resetAccessToken() {
        accessToken.value = ''
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
    }
    async function _login() {
        loading.value = true
        return new Promise((resolve, reject) => {
            login(form).then(res => {
                console.log(res, '----')
                console.log('登录成功!')

                const hour = new Date().getHours()
                const thisTime =
                    hour < 8
                        ? t('早上好')
                        : hour <= 11
                            ? t('上午好')
                            : hour <= 13
                                ? t('中午好')
                                : hour < 18
                                    ? t('下午好')
                                    : t('晚上好')
                ElNotification({
                    showClose: true,
                    title: thisTime,
                    message: `${t('欢迎登录')} ${t('title')}`,
                    type: 'success',
                })
                loading.value = false

                const data = res.data
                localStorage.setItem('user', JSON.stringify(data.user))

                setAccessToken(data.token)
                console.log(res, '---res---')
                resolve(res)
            }).catch(res => {
                loading.value = false
                reject(res)
            })
        })
    }

    function reLogin(configJson) {
        form.userName = configJson.userName
        form.password = configJson.password

        if (form.userName?.length > 0 && form.password?.length > 0) {
            setTimeout(() => {
                _login()
            }, 500)
        } else {
            form.password = ''
        }
    }

    const passwordType = ref("password")

    function handlePassword() {
        if (passwordType.value === "password") {
            passwordType.value = ""
        } else {
            passwordType.value = "password"
        }
    }

    function verification(content) {
        var reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return reg.test(content)
    }

    return {
        get, accessToken, form, loading, rules, handleLogin, reLogin, resetAccessToken, passwordType, handlePassword, verification
    }
}, {
    persist: true,
});
